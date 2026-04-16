import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SHOPS_DIR = path.join(ROOT, 'assets', 'images', 'shops');

async function walkFiles(dir) {
  const res = [];
  const list = await fs.readdir(dir);
  for (const name of list) {
    const p = path.join(dir, name);
    const st = await fs.stat(p);
    if (st.isDirectory()) {
      res.push(...await walkFiles(p));
    } else {
      res.push(p);
    }
  }
  return res;
}

async function fix() {
  const shops = await fs.readdir(SHOPS_DIR);
  for (const shop of shops) {
    const shopPath = path.join(SHOPS_DIR, shop);
    const productsRoot = path.join(shopPath, 'products');
    const exists = await fs.stat(productsRoot).catch(()=>null);
    if (!exists || !exists.isDirectory()) continue;

    const files = await walkFiles(productsRoot);
    for (const f of files) {
      const rel = path.relative(productsRoot, f);
      const parts = rel.split(path.sep);
      if (parts.length === 2) continue; // correct depth
      const fileName = parts[parts.length -1];
      const match = fileName.match(/^(.+)-\d+-/i);
      if (!match) continue;
      let candidate = match[1];
      // try progressively stripping trailing -<number> segments until matching category folder found
      while (candidate) {
        const targetDir = path.join(productsRoot, candidate);
        const stat = await fs.stat(targetDir).catch(()=>null);
        if (stat && stat.isDirectory()) {
          const dest = path.join(targetDir, fileName);
          await fs.mkdir(path.dirname(dest), { recursive: true });
          try { await fs.rename(f, dest); console.log('Moved', f, '->', dest); } catch(e){console.warn('move failed', e.message);} 
          break;
        }
        // strip last -<token>
        const idx = candidate.lastIndexOf('-');
        if (idx === -1) break;
        candidate = candidate.slice(0, idx);
      }
    }
  }
}

fix().catch(e=>{console.error(e); process.exitCode=1});