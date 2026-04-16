const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const SHOPDATA_FILE = path.join(ROOT, 'assets', 'js', 'shopdata.js');
const PRODUCTS_DIR = path.join(ROOT, 'assets', 'images', 'shops', 'starbucks', 'products');

function normalizeName(s) {
  return String(s || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function loadShopData() {
  const code = fs.readFileSync(SHOPDATA_FILE, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  const raw = sandbox.window && sandbox.window.MAVSIDE_SHOPDATA && sandbox.window.MAVSIDE_SHOPDATA.raw;
  if (!Array.isArray(raw)) {
    throw new Error('Unable to parse MAVSIDE_SHOPDATA.raw from shopdata.js');
  }
  return raw;
}

(function main(){
  try {
    const raw = loadShopData();
    const shop = raw.find(s => (s.id || '').toLowerCase() === 'starbucks');
    if (!shop) {
      console.error('Starbucks shop not found in shopdata.js');
      process.exit(1);
    }

    // pick only drinks and food categories (id or name)
    const desired = new Set(['drinks','drink','food']);
    const categories = (shop.categories || []).filter(c => {
      const id = String(c.id || c.name || '').toLowerCase();
      return desired.has(id);
    });

    const itemsToProcess = [];
    for (const category of categories) {
      const catId = String(category.id || category.name || 'misc').toLowerCase();
      const catSegment = slugify(catId);
      for (let i = 0; i < (category.items || []).length; i++) {
        const item = category.items[i];
        itemsToProcess.push({ categorySegment: catSegment, index: i + 1, name: item.name });
      }
    }

    const allFiles = fs.readdirSync(PRODUCTS_DIR);
    const fileRecords = allFiles.map(f => ({ name: f, full: path.join(PRODUCTS_DIR, f) })).filter(r => fs.statSync(r.full).isFile());

    const mappings = [];

    for (const it of itemsToProcess) {
      const targetSlug = slugify(it.name);
      // find candidate by strong matching
      const normItem = normalizeName(it.name);
      let candidates = fileRecords.filter(r => normalizeName(r.name).includes(normItem));
      if (candidates.length === 0) {
        // try weaker match: all tokens of item name present
        const tokens = normItem.split(/[^a-z0-9]+/).filter(Boolean);
        candidates = fileRecords.filter(r => tokens.every(t => normalizeName(r.name).includes(t)));
      }
      if (candidates.length === 0) {
        // try partial token match
        const tokens = normItem.split(/[^a-z0-9]+/).filter(Boolean);
        candidates = fileRecords.filter(r => tokens.some(t => normalizeName(r.name).includes(t)));
      }

      if (!candidates || candidates.length === 0) {
        console.warn('No file found for item:', it.name);
        continue;
      }

      const chosen = candidates[0];
      const ext = path.extname(chosen.name) || '.png';
      const newFileName = `${it.categorySegment}-${it.index}-${targetSlug}${ext}`;
      const destDir = path.join(PRODUCTS_DIR, it.categorySegment);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      const destFull = path.join(destDir, newFileName);
      fs.renameSync(chosen.full, destFull);
      mappings.push({ item: it.name, from: chosen.name, to: path.relative(ROOT, destFull) });
      console.log(`MOVE ${chosen.name} -> ${path.relative(ROOT, destFull)}`);
    }

    // Save report
    const report = { generatedAt: new Date().toISOString(), mappings };
    const reportPath = path.join(ROOT, 'development', 'admin', 'rename-starbucks-images-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log('Done. Report:', path.relative(ROOT, reportPath));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
