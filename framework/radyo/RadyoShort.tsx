import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Easing, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/great-vibes/400.css';
import '@fontsource/oswald/700.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource/alegreya/700.css';

/* Vertical (9:16) Shorts for Çakır Radyo Tiyatrosu: same visual identity as the episode title card
 * (soft, hazy, violet-tinted real photo + script logo), plus a hook title, live captions with speaker
 * names, a gentle audio-reactive pulse and an end card pointing to the full episode. */

type Cue = {start: number; end: number; who: string; text: string};
export type ShortSpec = {id: string; title: string; hook: string; dur: number; audio: string; cues: Cue[]; bg: string; ep: number; epTitle: string};

const r = (t: number, a: number, b: number, f = 0, to = 1) => interpolate(t, [a, b], [f, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 0, 0.2, 1)});
const COLORS: Record<string, string> = {Yusuf: '#ffd98a', Yakup: '#9fd3ff', 'Bünyamin': '#b8f2a6', Anlatıcı: '#e9dcff', Lavi: '#ff9b8a', Rubil: '#f7c6a3', "Şem'un": '#ff7a7a', Yahuda: '#c9b6ff'};

const Caption: React.FC<{cues: Cue[]; t: number}> = ({cues, t}) => {
	const c = cues.find((x) => t >= x.start - 0.1 && t <= x.end + 0.3);
	if (!c) return null;
	// long lines: show the sentence being spoken (time-proportional split)
	const parts = c.text.split(/(?<=[.?!…])\s+/).filter(Boolean);
	const tot = parts.reduce((s, p) => s + p.length, 0);
	let acc = c.start, cur = parts[0];
	for (const p of parts) {
		const d = ((c.end - c.start) * p.length) / tot;
		if (t >= acc - 0.05) cur = p;
		acc += d;
	}
	const o = r(t, c.start - 0.1, c.start + 0.15);
	return (
		<div style={{position: 'absolute', left: 70, right: 70, top: 1010, textAlign: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)`}}>
			<div style={{display: 'inline-block', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 38, letterSpacing: 6, color: COLORS[c.who] ?? '#fff', textShadow: '0 2px 12px rgba(0,0,0,.9)', marginBottom: 14}}>{c.who.toLocaleUpperCase('tr')}</div>
			<div style={{fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 58, lineHeight: 1.22, color: '#fff', textShadow: '0 0 6px #000, 0 4px 18px rgba(0,0,0,.95)'}}>{cur}</div>
		</div>
	);
};

export const RadyoShort: React.FC<{spec: ShortSpec}> = ({spec}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = f / fps;
	const end = spec.dur - 3.0;
	const z = interpolate(t, [0, spec.dur], [1.08, 1.18]);
	const hookO = r(t, 0.2, 0.8) * (1 - r(t, 4.5, 5.3));
	const endO = r(t, end - 0.2, end + 0.5);
	const talking = spec.cues.some((c) => t >= c.start && t <= c.end);
	return (
		<AbsoluteFill style={{background: '#1a1020'}}>
			<Audio src={staticFile(spec.audio)} />
			<AbsoluteFill style={{overflow: 'hidden'}}>
				<Img src={staticFile(`episodes/radyo_yusuf/media/${spec.bg}`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, filter: 'blur(5px) saturate(0.6) contrast(0.92) brightness(0.72) sepia(0.15) hue-rotate(-12deg)'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,225,240,.38) 0%, rgba(120,80,140,.18) 28%, rgba(20,10,30,.25) 55%, rgba(15,8,22,.85) 100%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(25,10,35,.75) 100%)'}} />
			{/* header identity */}
			<div style={{position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 28, letterSpacing: 10, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>ÇAKIR RADYO TİYATROSU</div>
			<div style={{position: 'absolute', top: 240, left: 0, right: 0, textAlign: 'center', fontFamily: '"Great Vibes", cursive', fontSize: 200, color: 'rgba(255,255,255,.95)', textShadow: '0 0 30px rgba(255,220,240,.55), 0 6px 24px rgba(40,10,40,.55)'}}>Hz. Yusuf</div>
			<div style={{position: 'absolute', top: 500, left: 0, right: 0, textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 40, letterSpacing: 5, color: '#ffeedd', textShadow: '0 2px 12px rgba(0,0,0,.8)'}}>{spec.ep}. BÖLÜM · {spec.epTitle.toLocaleUpperCase('tr')}</div>
			{/* hook title */}
			<div style={{position: 'absolute', top: 640, left: 60, right: 60, textAlign: 'center', opacity: hookO, transform: `scale(${0.94 + 0.06 * r(t, 0.2, 0.8)})`}}>
				<div style={{fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 92, lineHeight: 1.05, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,.35), 0 8px 30px rgba(0,0,0,.8)'}}>{spec.title}</div>
				<div style={{fontFamily: 'Alegreya, serif', fontWeight: 700, fontSize: 40, color: '#ffe3b0', marginTop: 18, textShadow: '0 2px 12px rgba(0,0,0,.9)'}}>{spec.hook}</div>
			</div>
			{/* audio pulse: three soft bars that breathe while someone speaks */}
			<div style={{position: 'absolute', top: 900, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, opacity: t > 5 && t < end ? 0.8 : 0}}>
				{[0, 1, 2, 3, 4].map((i) => {
					const h = talking ? 14 + 26 * Math.abs(Math.sin(t * (5 + i) + i * 1.7)) : 8;
					return <div key={i} style={{width: 10, height: h, borderRadius: 5, background: '#ffe3b0', alignSelf: 'center'}} />;
				})}
			</div>
			{t < end ? <Caption cues={spec.cues} t={t} /> : null}
			{/* end card */}
			<AbsoluteFill style={{background: `rgba(15,8,22,${0.75 * endO})`, opacity: endO, justifyContent: 'center', alignItems: 'center'}}>
				<div style={{textAlign: 'center', transform: `translateY(${(1 - endO) * 30}px)`}}>
					<div style={{fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 70, color: '#fff', letterSpacing: 2}}>TAM BÖLÜM KANALDA</div>
					<div style={{fontFamily: 'Alegreya, serif', fontWeight: 700, fontSize: 44, color: '#ffe3b0', marginTop: 20}}>Hz. Yusuf · {spec.ep}. Bölüm: {spec.epTitle}</div>
					<div style={{fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 30, color: '#e9dcff', marginTop: 30, letterSpacing: 4}}>Gözlerini kapat, dinle.</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
