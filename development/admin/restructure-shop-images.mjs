import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const SHOPS_DIR = path.join(ROOT, 'assets', 'images', 'shops');
const BRANDS_DIR = path.join(ROOT, 'assets', 'images', 'brands');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyLogoToShop(shopId) {
  const brandCandidates = [
    `${shopId}-logo`,
    `${shopId}.png`,
    `${shopId}.jpg`
  ];

  const files = await fs.readdir(BRANDS_DIR);
  for (const f of files) {
    const name = f.toLowerCase();
    for (const cand of brandCandidates) {
      if (name.includes(cand)) {
        const src = path.join(BRANDS_DIR, f);
        const dest = path.join(SHOPS_DIR, shopId, 'logo' + path.extname(f));
        await ensureDir(path.join(SHOPS_DIR, shopId));
        await fs.copyFile(src, dest);
        return dest;
      }
    }
  }
  return null;
}

async function moveProductFiles(shopId) {
  const shopDir = path.join(SHOPS_DIR, shopId);
  const entries = await fs.readdir(shopDir).catch(() => []);
  for (const e of entries) {
    const full = path.join(shopDir, e);
    const stat = await fs.stat(full);
    if (stat.isDirectory()) continue;
    // Expect filename like: <category>-<index>-<name>.<ext>
    const m = e.match(/^([a-z0-9-]+)-(\d+)-(.+)(\.[a-z0-9]+)$/i);
    if (!m) continue;
    const category = m[1];
    const filename = e; // keep same filename
    const targetDir = path.join(shopDir, 'products', category);
    await ensureDir(targetDir);
    const dest = path.join(targetDir, filename);
    await fs.rename(full, dest);
  }
}

async function processShops() {
  const shops = await fs.readdir(SHOPS_DIR);
  for (const shopId of shops) {
    const shopPath = path.join(SHOPS_DIR, shopId);
    const stat = await fs.stat(shopPath);
    if (!stat.isDirectory()) continue;
    console.log('Processing', shopId);
    await copyLogoToShop(shopId).then((d) => console.log('  logo:', d));
    await moveProductFiles(shopId).then(() => console.log('  moved product files'));
  }
}

processShops().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});