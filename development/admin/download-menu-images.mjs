import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const SHOPDATA_FILE = path.join(ROOT, 'assets', 'js', 'shopdata.js');
const OUTPUT_ROOT = path.join(ROOT, 'assets', 'images', 'shops');
const REPORT_FILE = path.join(ROOT, 'development', 'admin', 'download-menu-images-report.json');

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extFromUrl(url) {
  try {
    const u = new URL(url);
    const p = u.pathname.toLowerCase();
    const m = p.match(/\.(jpg|jpeg|png|webp|gif|avif|svg)$/);
    if (m) return m[0];
  } catch {}
  return '.jpg';
}

function buildLocalPath(shopId, categoryId, itemIndex, itemName, sourceUrl) {
  const ext = extFromUrl(sourceUrl);
  const fileName = `${slugify(categoryId)}-${itemIndex + 1}-${slugify(itemName)}${ext}`;
  const absoluteDir = path.join(OUTPUT_ROOT, slugify(shopId), 'products', slugify(categoryId));
  const webPath = `/assets/images/shops/${slugify(shopId)}/products/${slugify(categoryId)}/${fileName}`;
  return {
    fileName,
    absoluteDir,
    webPath
  };
}

async function loadShopData() {
  const code = await fs.readFile(SHOPDATA_FILE, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  const raw = sandbox.window?.MAVSIDE_SHOPDATA?.raw;
  if (!Array.isArray(raw)) {
    throw new Error('Unable to parse MAVSIDE_SHOPDATA.raw from shopdata.js');
  }
  return raw;
}

async function downloadImage(url, targetFile) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(targetFile, buffer);
  return buffer.length;
}

async function main() {
  const raw = await loadShopData();
  const tasks = [];

  for (const shop of raw) {
    for (const category of shop.categories || []) {
      for (let i = 0; i < (category.items || []).length; i += 1) {
        const item = category.items[i];
        const source = String(item.image || '');
        if (!/^https?:\/\//i.test(source)) continue;

        const info = buildLocalPath(shop.id, category.id || category.name, i, item.name, source);
        tasks.push({
          shopId: shop.id,
          categoryId: category.id || category.name,
          itemName: item.name,
          source,
          ...info,
          absoluteFile: path.join(info.absoluteDir, info.fileName)
        });
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totalCandidates: tasks.length,
    success: [],
    failed: []
  };

  for (const task of tasks) {
    await fs.mkdir(task.absoluteDir, { recursive: true });
    try {
      const size = await downloadImage(task.source, task.absoluteFile);
      report.success.push({
        shopId: task.shopId,
        categoryId: task.categoryId,
        itemName: task.itemName,
        source: task.source,
        webPath: task.webPath,
        bytes: size
      });
      console.log(`OK   ${task.shopId} | ${task.itemName} -> ${task.webPath}`);
    } catch (error) {
      report.failed.push({
        shopId: task.shopId,
        categoryId: task.categoryId,
        itemName: task.itemName,
        source: task.source,
        webPath: task.webPath,
        error: String(error?.message || error)
      });
      console.log(`FAIL ${task.shopId} | ${task.itemName} -> ${task.source} (${String(error?.message || error)})`);
    }
  }

  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nDownloaded: ${report.success.length}/${tasks.length}`);
  console.log(`Failed: ${report.failed.length}`);
  console.log(`Report: ${path.relative(ROOT, REPORT_FILE)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
