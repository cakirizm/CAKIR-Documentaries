// CAKIR render driver.
//   node scripts/render.mjs <CompositionId> <out.mp4> [--draft] [--frames=0-299]
//   node scripts/render.mjs --still <StillId> <out.png> [--props='{"photo":"..."}']
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const cfg = JSON.parse(fs.readFileSync('framework/config/render.json', 'utf8'));
const args = process.argv.slice(2);
const flag = (n) => args.find((a) => a.startsWith(`--${n}`));
const pos = args.filter((a) => !a.startsWith('--'));
const isStill = !!flag('still');
const [id, out] = pos;
const draft = !!flag('draft');
const framesArg = flag('frames')?.split('=')[1];
const propsArg = flag('props')?.slice('--props='.length);
const inputProps = propsArg ? JSON.parse(propsArg) : {};

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const browserExecutable = fs.existsSync(cfg.browserExecutable) ? cfg.browserExecutable : null;
const chromiumOptions = {gl: process.env.CAKIR_GL || cfg.gl};
const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable, chromiumOptions});
const opts = {serveUrl, composition, inputProps, browserExecutable, chromiumOptions};

fs.mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
if (isStill) {
	await renderStill({...opts, output: out, imageFormat: 'png', frame: Number(flag('frame')?.split('=')[1] ?? 0), scale: Number(flag('scale')?.split('=')[1] ?? 1)});
} else {
	let last = -1;
	await renderMedia({
		...opts,
		codec: cfg.codec,
		outputLocation: out,
		crf: draft ? cfg.draft.crf : cfg.crf,
		scale: draft ? cfg.draft.scale : 1,
		pixelFormat: cfg.pixelFormat,
		audioCodec: cfg.audioCodec,
		audioBitrate: cfg.audioBitrate,
		concurrency: cfg.concurrency,
		imageFormat: 'jpeg',
		jpegQuality: 92,
		frameRange: framesArg ? framesArg.split('-').map(Number) : null,
		x264Preset: draft ? 'veryfast' : 'slow',
		onProgress: ({progress}) => {
			const p = Math.floor(progress * 100);
			if (p !== last && p % 5 === 0) { last = p; console.log(`render ${p}%`); }
		},
	});
}
console.log('wrote', out);
