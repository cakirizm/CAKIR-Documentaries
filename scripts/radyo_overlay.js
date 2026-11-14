// Renders the fixed title/frame overlay to transparent PNGs: node scripts/radyo_overlay.js <ep> "<title>" <outdir>
const {chromium} = require('playwright');
const path = require('path');
(async () => {
  const [ep, title, out] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1920, height: 1080}});
  const url = 'file://' + path.resolve('episodes/radyo_yusuf/cover/overlay.html') + `?ep=${ep}&title=${encodeURIComponent(title)}`;
  await p.goto(url); await p.waitForTimeout(600);
  await p.screenshot({path: `${out}/overlay.png`, omitBackground: true});
  await p.goto(url + '&final=1'); await p.waitForTimeout(600);
  await p.screenshot({path: `${out}/overlay_end.png`, omitBackground: true});
  await b.close();
})();
