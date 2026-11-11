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
const colorSpace = cfg.colorSpace ?? 'default';

fs.mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
const cleanup = () => fs.rmSync(serveUrl, {recursive: true, force: true}); // bundles copy public/ (~1 GB)
const chunksArg = flag('chunks')?.split('=')[1];
if (chunksArg) {
	// restart-safe: render N silent chunks into <out>/part_i.mp4, skipping finished ones
	const n = Number(chunksArg), total = composition.durationInFrames, step = Math.ceil(total / n);
	fs.mkdirSync(out, {recursive: true});
	for (let i = 0; i < n; i++) {
		const f = path.join(out, `part_${i}.mp4`);
		if (fs.existsSync(f + '.done')) { console.log(`chunk ${i} already done`); continue; }
		const range = [i * step, Math.min(total - 1, (i + 1) * step - 1)];
		console.log(`chunk ${i}: frames ${range[0]}-${range[1]}`);
		await renderMedia({...opts, codec: cfg.codec, outputLocation: f, crf: cfg.crf, pixelFormat: cfg.pixelFormat, muted: true, colorSpace,
			concurrency: cfg.concurrency, imageFormat: 'jpeg', jpegQuality: 92, frameRange: range, x264Preset: 'slow'});
		fs.writeFileSync(f + '.done', '');
		console.log(`chunk ${i} done`);
	}
	fs.writeFileSync(path.join(out, 'list.txt'), Array.from({length: n}, (_, i) => `file 'part_${i}.mp4'`).join('\n') + '\n');
	cleanup();
	console.log('chunks complete');
	process.exit(0);
}
const stillsArg = flag('stills')?.split('=')[1];
if (stillsArg) {
	fs.mkdirSync(out, {recursive: true});
	for (const f of stillsArg.split(',').map(Number)) {
		await renderStill({...opts, output: path.join(out, `f${String(f).padStart(5, '0')}.png`), imageFormat: 'png', frame: f, scale: Number(flag('scale')?.split('=')[1] ?? 0.5)});
	}
	cleanup();
	console.log('stills done');
	process.exit(0);
}
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
		muted: !!flag('muted'),
		colorSpace,
		x264Preset: draft ? 'veryfast' : 'slow',
		onProgress: ({progress}) => {
			const p = Math.floor(progress * 100);
			if (p !== last && p % 5 === 0) { last = p; console.log(`render ${p}%`); }
		},
	});
}
cleanup();
console.log('wrote', out);
