import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SHOPS_DIR = path.join(ROOT, 'assets', 'images', 'shops');

async function walk(dir) {
  const res = [];
  const list = await fs.readdir(dir);
  for (const file of list) {
    const p = path.join(dir, file);
    const st = await fs.stat(p);
    if (st.isDirectory()) res.push(...await walk(p)); else res.push(p);
  }
  return res;
}

async function fix() {
  const shops = await fs.readdir(SHOPS_DIR);
  for (const shop of shops) {
    const shopPath = path.join(SHOPS_DIR, shop);
    const stat = await fs.stat(shopPath).catch(()=>null);
    if (!stat || !stat.isDirectory()) continue;
    const productsRoot = path.join(shopPath, 'products');
    const exists = await fs.stat(productsRoot).catch(()=>null);
    if (!exists || !exists.isDirectory()) continue;
    const files = await walk(productsRoot);
    for (const f of files) {
      const rel = path.relative(productsRoot, f);
      const parts = rel.split(path.sep);
      if (parts.length === 2) continue; // OK path: <category>/<file>
      // If deeper, pull file up to category inference from filename
      const fileName = parts[parts.length -1];
      const m = fileName.match(/^([a-z0-9-]+)-\d+-.*(\.[a-z0-9]+)$/i);
      if (!m) continue;
      const category = m[1];
      const destDir = path.join(productsRoot, category);
      await fs.mkdir(destDir, { recursive: true });
      const dest = path.join(destDir, fileName);
      try {
        await fs.rename(f, dest);
        console.log('Moved', f, '->', dest);
      } catch (e) {
        console.warn('Failed move', f, e.message);
      }
    }
  }
}

fix().catch((e)=>{console.error(e); process.exitCode=1});