import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Easing, staticFile, useCurrentFrame, useVideoConfig, random} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/900.css';
import '@fontsource/alegreya/700.css';
import '@fontsource/alegreya/400-italic.css';
import {DRAWN} from './DrawnLib';

const GOLD = '#e8c26a';
const RED = '#e5484d';
const SANS = 'Inter, sans-serif';
const SERIF = 'Alegreya, Georgia, serif';
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const r = (t: number, a: number, b: number, from = 0, to = 1) => interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
const M = (f: string) => staticFile(`episodes/banknot/media/${f}`);

export type Layer = {k: string; [key: string]: any};
export type SceneSpec = {bg?: {type: string; [key: string]: any}; layers?: Layer[]};
type Line = {scene: string; role: string; start: number; end: number; sub: string};
type TL = {durationSec: number; scenes: {id: string; start: number; end: number}[]; lines: Line[]};

const GRADES: Record<string, string> = {
	night: 'saturate(0.55) brightness(0.55) contrast(1.15) hue-rotate(-8deg)',
	cold: 'saturate(0.6) brightness(0.62) contrast(1.12)',
	warm: 'saturate(0.85) brightness(0.65) contrast(1.1) sepia(0.25)',
	bw: 'grayscale(1) brightness(0.62) contrast(1.25)',
	doc: 'saturate(0.8) brightness(0.72) contrast(1.08)',
};

/* ---------- elements ---------- */

const Note: React.FC<{w?: number; rotY?: number; rotZ?: number; x?: number; y?: number; dark?: number; glow?: number}> = ({w = 760, rotY = 0, rotZ = 0, x = 0, y = 0, dark = 0, glow = 0}) => (
	<div style={{position: 'absolute', left: 540 - w / 2 + x, top: 900 - w * 0.215 + y, width: w, height: w * 0.43, perspective: 1800}}>
		<div style={{width: '100%', height: '100%', transform: `rotateY(${rotY}deg) rotateZ(${rotZ}deg)`, borderRadius: 10, overflow: 'hidden', boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 ${glow * 120}px rgba(232,194,106,${glow * 0.6})`, border: '6px solid #d9dccb', background: '#cfd3c0'}}>
			<Img src={M('bill.jpg')} style={{width: '100%', height: '230%', objectFit: 'cover', objectPosition: '50% 18%', filter: `sepia(0.25) contrast(1.05) brightness(${1 - dark * 0.75})`}} />
			<div style={{position: 'absolute', right: 18, top: 10, fontFamily: SERIF, fontWeight: 700, fontSize: w * 0.09, color: '#2f3d2d', opacity: 0.85}}>100</div>
			<div style={{position: 'absolute', left: 18, bottom: 6, fontFamily: SERIF, fontWeight: 700, fontSize: w * 0.09, color: '#2f3d2d', opacity: 0.85}}>100</div>
		</div>
	</div>
);

const Bg: React.FC<{spec: any; t: number; d: number}> = ({spec, t, d}) => {
	if (!spec || spec.type === 'black') return <AbsoluteFill style={{background: spec?.color ?? '#000'}} />;
	if (spec.type === 'drawn') {
		const D = DRAWN[spec.name];
		const p = r(t, 0, d);
		const z = spec.zoom ?? [1.0, 1.08];
		return (
			<AbsoluteFill style={{overflow: 'hidden'}}>
				<AbsoluteFill style={{transform: `scale(${z[0] + (z[1] - z[0]) * p}) translateY(${(spec.pan ?? 0) * p}px)`}}>{D ? <D t={t} /> : null}</AbsoluteFill>
			</AbsoluteFill>
		);
	}
	// photo
	const p = r(t, 0, d);
	const z = spec.zoom ?? [1.06, 1.2];
	const x = spec.x ?? [0, 0];
	const y = spec.y ?? [0, 0];
	return (
		<AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
			{spec.blurFill ? <Img src={M(spec.src)} style={{position: 'absolute', inset: -60, width: 'calc(100% + 120px)', height: 'calc(100% + 120px)', objectFit: 'cover', filter: 'blur(40px) brightness(0.35)'}} /> : null}
			<Img src={M(spec.src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: spec.fit ?? 'cover', objectPosition: spec.pos ?? '50% 50%', transform: `scale(${z[0] + (z[1] - z[0]) * p}) translate(${x[0] + (x[1] - x[0]) * p}px, ${y[0] + (y[1] - y[0]) * p}px)`, filter: GRADES[spec.grade ?? 'doc']}} />
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.8) 100%)'}} />
		</AbsoluteFill>
	);
};

const Kicker: React.FC<{l: Layer; t: number}> = ({l, t}) => {
	const at = l.at ?? 0.2;
	const o = r(t, at, at + 0.45);
	return (
		<div style={{position: 'absolute', top: l.top ?? 300, left: 60, right: 60, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: l.size ?? 80, lineHeight: 1.04, letterSpacing: -1.5, color: l.color === 'gold' ? GOLD : l.color === 'red' ? RED : l.color ?? '#fff', opacity: o, transform: `translateY(${(1 - o) * 26}px)`, textShadow: '0 4px 30px rgba(0,0,0,0.85)', whiteSpace: 'pre-line'}}>
			{l.text}
		</div>
	);
};

const Small: React.FC<{l: Layer; t: number}> = ({l, t}) => (
	<div style={{position: 'absolute', top: l.top ?? 420, left: 40, right: 40, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: l.size ?? 30, letterSpacing: 7, color: l.color === 'white' ? '#fff' : l.color === 'red' ? RED : l.color ?? GOLD, opacity: r(t, l.at ?? 0.3, (l.at ?? 0.3) + 0.4), textShadow: '0 2px 16px rgba(0,0,0,0.95)', whiteSpace: 'pre-line'}}>{l.text}</div>
);

const Stamp: React.FC<{l: Layer; t: number}> = ({l, t}) => {
	const at = l.at ?? 0.5;
	if (t < at) return null;
	const p = r(t, at, at + 0.16);
	const color = l.color === 'orange' ? '#f0a020' : l.color === 'gold' ? GOLD : RED;
	return (
		<div style={{position: 'absolute', top: l.top ?? 760, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div style={{fontFamily: SANS, fontWeight: 900, fontSize: l.size ?? 96, color, border: `8px solid ${color}`, padding: '6px 28px', borderRadius: 8, transform: `rotate(${l.rot ?? -7}deg) scale(${2.1 - p * 1.1})`, opacity: p, letterSpacing: 1, background: 'rgba(0,0,0,0.4)', whiteSpace: 'pre-line', textAlign: 'center', lineHeight: 1}}>{l.text}</div>
		</div>
	);
};

const Counter: React.FC<{l: Layer; t: number}> = ({l, t}) => {
	const at = l.at ?? 0.3;
	const v = interpolate(t, [at, at + (l.dur ?? 2.2)], [l.from ?? 0, l.to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	const txt = (l.prefix ?? '$') + Math.round(v).toLocaleString('tr-TR') + (l.suffix ?? '');
	return (
		<div style={{position: 'absolute', top: l.top ?? 760, left: 0, right: 0, textAlign: 'center', opacity: r(t, at - 0.2, at)}}>
			<span style={{position: 'relative', fontFamily: SANS, fontWeight: 900, fontSize: l.size ?? 116, color: l.color === 'white' ? '#fff' : l.color === 'red' ? RED : GOLD, letterSpacing: -2, textShadow: '0 6px 40px rgba(0,0,0,0.9)', fontVariantNumeric: 'tabular-nums'}}>
				{txt}
				{l.strikeAt ? <span style={{position: 'absolute', left: -10, right: -10, top: '52%', height: 10, background: RED, transform: `scaleX(${r(t, l.strikeAt, l.strikeAt + 0.4)})`, transformOrigin: 'left'}} /> : null}
			</span>
			{l.label ? <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: '#fff', opacity: 0.85, marginTop: 6}}>{l.label}</div> : null}
		</div>
	);
};

const DateCard: React.FC<{l: Layer; t: number}> = ({l, t}) => {
	const at = l.at ?? 0;
	return (
		<div style={{position: 'absolute', left: 340, top: l.top ?? 560, width: 400, height: 440, background: '#f4f1ea', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', transform: `perspective(1400px) rotateX(${r(t, at, at + 0.6, -90, 0)}deg)`, transformOrigin: 'top', opacity: t < at ? 0 : 1}}>
			<div style={{background: RED, color: '#fff', fontFamily: SANS, fontWeight: 900, fontSize: 50, textAlign: 'center', padding: '18px 0'}}>{l.m}</div>
			<div style={{fontFamily: SANS, fontWeight: 900, fontSize: l.d.length > 2 ? 120 : 200, color: '#222', textAlign: 'center', lineHeight: 1.15}}>{l.d}</div>
			<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 50, color: '#555', textAlign: 'center'}}>{l.y}</div>
		</div>
	);
};

const Quote: React.FC<{l: Layer; t: number}> = ({l, t}) => {
	const at = l.at ?? 0.5;
	const n = Math.floor(r(t, at, at + (l.type ?? 1.6)) * l.text.length);
	return (
		<div style={{position: 'absolute', top: l.top ?? 640, left: 80, right: 80, textAlign: 'center'}}>
			{l.who ? <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 7, color: '#a3998a', marginBottom: 26, opacity: r(t, at - 0.4, at)}}>{l.who}</div> : null}
			<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: l.size ?? 76, lineHeight: 1.22, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.9)'}}>“{l.text.slice(0, n)}{n >= l.text.length ? '”' : ''}</div>
			{l.orig ? <div style={{fontFamily: SANS, fontSize: 24, color: '#8a8378', marginTop: 24, opacity: r(t, at + 1.4, at + 1.9)}}>{l.orig}</div> : null}
		</div>
	);
};

const Doc: React.FC<{l: Layer; t: number}> = ({l, t}) => {
	const at = l.at ?? 0.3;
	const lines: string[] = l.lines;
	const total = lines.join('').length;
	const n = Math.floor(r(t, at, at + (l.type ?? 2.4)) * total);
	let acc = 0;
	return (
		<div style={{position: 'absolute', top: l.top ?? 560, left: 110, right: 110, background: l.dark ? '#0c1117' : '#f2efe6', padding: '44px 46px', borderRadius: 8, boxShadow: '0 30px 90px rgba(0,0,0,0.75)', transform: `rotate(${l.rot ?? -1.5}deg) translateY(${(1 - r(t, 0, 0.5)) * 60}px)`, opacity: r(t, 0, 0.4)}}>
			{lines.map((s, i) => {
				const vis = Math.max(0, Math.min(s.length, n - acc));
				acc += s.length;
				const hl = l.hl && s.includes(l.hl);
				return (
					<div key={i} style={{fontFamily: l.mono ? 'monospace' : SERIF, fontSize: l.size ?? 40, lineHeight: 1.35, color: l.dark ? '#bfe6c9' : '#1d1b17', fontWeight: i === 0 ? 700 : 400, minHeight: 10}}>
						{hl && vis >= s.length ? (
							<>
								{s.split(l.hl)[0]}
								<span style={{background: `linear-gradient(transparent 55%, rgba(229,72,77,${r(t, l.hlAt ?? at + 2.8, (l.hlAt ?? at + 2.8) + 0.4)}) 55%)`, color: RED, fontWeight: 900}}>{l.hl}</span>
								{s.split(l.hl)[1]}
							</>
						) : s.slice(0, vis)}
					</div>
				);
			})}
		</div>
	);
};

const Headline: React.FC<{l: Layer; t: number}> = ({l, t}) => {
	const at = l.at ?? 0.2;
	const o = r(t, at, at + 0.4);
	return (
		<div style={{position: 'absolute', top: l.top ?? 600, left: 70, right: 70, background: '#f3efe4', padding: '30px 36px', transform: `rotate(${l.rot ?? -2}deg) scale(${0.9 + o * 0.1})`, opacity: o, boxShadow: '0 30px 80px rgba(0,0,0,0.75)'}}>
			<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: '#555', borderBottom: '2px solid #222', paddingBottom: 8, marginBottom: 14}}>{l.paper ?? 'GAZETE'}</div>
			<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: l.size ?? 58, lineHeight: 1.08, color: '#111'}}>{l.text}</div>
			{l.sub ? <div style={{fontFamily: SANS, fontSize: 26, color: '#444', marginTop: 14}}>{l.sub}</div> : null}
		</div>
	);
};

const Ticker: React.FC<{l: Layer; t: number}> = ({l, t}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top: l.top ?? 1250, height: 96, display: 'flex', opacity: r(t, l.at ?? 0, (l.at ?? 0) + 0.3)}}>
		<div style={{background: RED, color: '#fff', fontFamily: SANS, fontWeight: 900, fontSize: 36, padding: '26px 22px', whiteSpace: 'nowrap'}}>{l.tag ?? 'SON DAKİKA'}</div>
		<div style={{flex: 1, background: '#f2f2f2', overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 700, fontSize: 34, color: '#111', padding: '28px 0'}}>
			<span style={{display: 'inline-block', transform: `translateX(${500 - t * 240}px)`}}>{l.text} · {l.text}</span>
		</div>
	</div>
);

const Chips: React.FC<{l: Layer; t: number}> = ({l, t}) => (
	<>
		{(l.items as string[]).map((s, i) => {
			const at = (l.at ?? 0.2) + i * (l.step ?? 0.9);
			const o = r(t, at, at + 0.35);
			return (
				<div key={s} style={{position: 'absolute', left: 110, right: 110, top: (l.top ?? 560) + i * 150, padding: '22px 0', textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: l.size ?? 50, color: '#fff', background: 'rgba(10,10,12,0.72)', borderLeft: `10px solid ${l.color === 'red' ? RED : GOLD}`, opacity: o, transform: `translateX(${(1 - o) * -110}px)`}}>
					{s}
				</div>
			);
		})}
	</>
);

const Tag: React.FC<{l: Layer}> = ({l}) => (
	<div style={{position: 'absolute', top: 236, right: 60, fontFamily: SANS, fontWeight: 700, fontSize: 21, letterSpacing: 3, color: 'rgba(255,255,255,0.78)', background: 'rgba(0,0,0,0.45)', padding: '6px 12px', borderRadius: 6}}>{l.text ?? 'TEMSİLÎ GÖRÜNTÜ'}</div>
);

const Wanted: React.FC<{l: Layer; t: number}> = ({l, t}) => {
	const o = r(t, l.at ?? 0.2, (l.at ?? 0.2) + 0.5);
	return (
		<div style={{position: 'absolute', left: 170, top: l.top ?? 420, width: 740, background: '#f4f1e8', padding: 26, transform: `rotate(-2deg) scale(${0.92 + o * 0.08})`, opacity: o, boxShadow: '0 30px 90px rgba(0,0,0,0.8)'}}>
			<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 70, color: '#b3261e', textAlign: 'center', letterSpacing: 2}}>{l.title ?? 'ARANIYOR'}</div>
			<Img src={M(l.src)} style={{width: '100%', height: l.h ?? 640, objectFit: 'cover', objectPosition: l.pos ?? '50% 30%', filter: 'grayscale(0.2) contrast(1.05)', marginTop: 10}} />
			<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 44, color: '#111', textAlign: 'center', marginTop: 14}}>{l.name}</div>
			{l.sub ? <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#b3261e', textAlign: 'center', marginTop: 6}}>{l.sub}</div> : null}
		</div>
	);
};

const PhotoCard: React.FC<{l: Layer; t: number}> = ({l, t}) => {
	const o = r(t, l.at ?? 0.2, (l.at ?? 0.2) + 0.5);
	return (
		<div style={{position: 'absolute', left: (1080 - (l.w ?? 760)) / 2, top: l.top ?? 520, width: l.w ?? 760, background: '#f4f1e8', padding: '18px 18px 60px', transform: `rotate(${l.rot ?? 2}deg) translateY(${(1 - o) * 60}px)`, opacity: o, boxShadow: '0 30px 90px rgba(0,0,0,0.8)'}}>
			<Img src={M(l.src)} style={{width: '100%', height: l.h ?? 560, objectFit: 'cover', objectPosition: l.pos ?? '50% 40%', filter: 'contrast(1.05) saturate(0.9)'}} />
			{l.caption ? <div style={{position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 30, color: '#333'}}>{l.caption}</div> : null}
		</div>
	);
};

const NoteLayer: React.FC<{l: Layer; t: number; d: number}> = ({l, t, d}) => {
	const m = l.motion ?? 'spin';
	if (m === 'slide') return <Note w={l.w ?? 520} rotY={-18} rotZ={interpolate(t, [0, d], [-20, 14])} x={interpolate(t, [l.at ?? 0, d], [-760, 760])} y={l.y ?? -120} />;
	if (m === 'dark') return <Note w={l.w ?? 720} rotY={8} rotZ={-4 + t * 2} y={l.y ?? -80} dark={r(t, 0.2, 2)} />;
	return <Note w={interpolate(t, [0, d], [l.w ?? 680, (l.w ?? 680) + 80])} rotY={interpolate(t, [0, 2, d], [-150, -12, 10], {extrapolateRight: 'clamp', easing: ease})} rotZ={-6 + t * 0.8} y={(l.y ?? -60) + r(t, 0, 2, -400, 0)} glow={r(t, 1.2, 2.6)} />;
};

const Flash: React.FC<{t: number}> = ({t}) => <AbsoluteFill style={{background: `rgba(255,255,255,${t < 0.16 ? 0.75 - t * 4.5 : 0})`}} />;

const Police: React.FC<{t: number}> = ({t}) => <AbsoluteFill style={{background: Math.sin(t * 9) > 0 ? 'rgba(255,30,40,0.16)' : 'rgba(40,80,255,0.16)', mixBlendMode: 'screen'}} />;

const LAYERS: Record<string, React.FC<{l: Layer; t: number; d: number}>> = {
	kicker: Kicker, small: Small, stamp: Stamp, counter: Counter, date: DateCard, quote: Quote, doc: Doc, headline: Headline,
	ticker: Ticker, chips: Chips, tag: Tag as any, wanted: Wanted, photo: PhotoCard, note: NoteLayer,
	flash: ({t}) => <Flash t={t} />, police: ({t}) => <Police t={t} />,
	vignette: () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)'}} />,
};

/* ---------- captions: 2–4 word chunks, active word highlighted ---------- */

const Captions: React.FC<{lines: Line[]; t: number}> = ({lines, t}) => {
	const l = lines.find((x) => t >= x.start - 0.05 && t <= x.end + 0.2);
	if (!l || !l.sub) return null;
	const words = l.sub.split(/\s+/).filter(Boolean);
	const w8 = words.map((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length + 2 + (/[.,…!?:]$/.test(w) ? 5 : 0));
	const tot = w8.reduce((a, b) => a + b, 0);
	const span = l.end - l.start;
	let acc = 0;
	const times = w8.map((w) => {
		const s = l.start + (acc / tot) * span;
		acc += w;
		return s;
	});
	let idx = times.findIndex((s, i) => t >= s && (i === times.length - 1 || t < times[i + 1]));
	if (idx < 0) idx = t < l.start ? 0 : words.length - 1;
	// chunk boundaries: break after punctuation or every 4 words
	const chunks: number[][] = [];
	let cur: number[] = [];
	words.forEach((w, i) => {
		cur.push(i);
		if (cur.length >= 4 || /[.,…!?:]$/.test(w)) {
			chunks.push(cur);
			cur = [];
		}
	});
	if (cur.length) chunks.push(cur);
	const ch = chunks.find((c) => c.includes(idx)) ?? chunks[0];
	const quote = l.role !== 'N';
	return (
		<div style={{position: 'absolute', left: 60, right: 60, top: 1420, textAlign: 'center'}}>
			{ch.map((i) => (
				<span key={i} style={{fontFamily: quote ? SERIF : SANS, fontStyle: quote ? 'italic' : 'normal', fontWeight: 900, fontSize: quote ? 64 : 62, lineHeight: 1.15, color: i === idx ? GOLD : '#fff', margin: '0 8px', display: 'inline-block', transform: i === idx ? 'scale(1.06)' : 'none', textShadow: '0 0 5px #000, 0 4px 16px rgba(0,0,0,0.95)', textTransform: quote ? 'none' : 'uppercase', letterSpacing: quote ? 0 : -0.5}}>
					{words[i]}
				</span>
			))}
		</div>
	);
};

const Grain: React.FC = () => {
	const f = useCurrentFrame();
	return <AbsoluteFill style={{backgroundImage: `url(${staticFile(`framework/grain${f % 4}.png`)})`, opacity: 0.13, mixBlendMode: 'overlay'}} />;
};

const LightLeak: React.FC<{t: number}> = ({t}) => (
	<AbsoluteFill style={{background: `radial-gradient(circle at ${20 + Math.sin(t * 0.3) * 15}% ${15 + Math.cos(t * 0.21) * 10}%, rgba(255,170,90,0.10), rgba(0,0,0,0) 45%)`, mixBlendMode: 'screen'}} />
);

const SceneView: React.FC<{spec: SceneSpec; t: number; d: number}> = ({spec, t, d}) => (
	<AbsoluteFill>
		<Bg spec={spec.bg} t={t} d={d} />
		{(spec.layers ?? []).map((l, i) => {
			const L = LAYERS[l.k];
			return L ? <L key={i} l={l} t={t} d={d} /> : null;
		})}
	</AbsoluteFill>
);

export const BanknotEpisode: React.FC<{timeline: TL; scenes: Record<string, SceneSpec>; audio: string; ep: number; title: string}> = ({timeline, scenes, audio}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const i = Math.max(0, timeline.scenes.findIndex((s) => t >= s.start && t < s.end));
	const sc = timeline.scenes[i] ?? timeline.scenes[timeline.scenes.length - 1];
	const prev = timeline.scenes[i - 1];
	const local = t - sc.start;
	const xf = 0.32;
	const inP = r(local, 0, xf);
	// subtle handheld drift
	const dx = Math.sin(t * 0.7) * 4 + Math.sin(t * 1.9) * 1.5;
	const dy = Math.cos(t * 0.6) * 3;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Audio src={staticFile(audio)} />
			<AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(1.02)`}}>
				{prev && local < xf ? <AbsoluteFill style={{transform: `scale(${1 + inP * 0.06})`, filter: `blur(${inP * 8}px)`}}><SceneView spec={scenes[prev.id] ?? {}} t={t - prev.start} d={prev.end - prev.start} /></AbsoluteFill> : null}
				<AbsoluteFill style={{opacity: prev ? inP : 1, transform: prev ? `scale(${1.05 - inP * 0.05})` : undefined}}>
					<SceneView spec={scenes[sc.id] ?? {}} t={local} d={sc.end - sc.start} />
				</AbsoluteFill>
			</AbsoluteFill>
			<LightLeak t={t} />
			<Grain />
			<Captions lines={timeline.lines} t={t} />
		</AbsoluteFill>
	);
};
