const fs = require('fs');
const path = require('path');

async function takeScreenshot(page, name) {
  const dir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

module.exports = { takeScreenshot };
