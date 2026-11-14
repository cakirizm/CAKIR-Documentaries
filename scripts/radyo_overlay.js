// Renders the fixed Asr-ı Saadet style title card to transparent PNGs:
// node scripts/radyo_overlay.js <ep> "<title>" "<next title>" <outdir>
const {chromium} = require('playwright');
const path = require('path');
(async () => {
  const [ep, title, next, out] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1920, height: 1080}});
  const url = 'file://' + path.resolve('episodes/radyo_yusuf/cover/titlecard.html') + `?ep=${ep}&title=${encodeURIComponent(title)}&next=${encodeURIComponent(next)}`;
  await p.goto(url); await p.waitForTimeout(800);
  await p.screenshot({path: `${out}/overlay.png`, omitBackground: true});
  await p.goto(url + '&final=1'); await p.waitForTimeout(800);
  await p.screenshot({path: `${out}/overlay_end.png`, omitBackground: true});
  await b.close();
})();
