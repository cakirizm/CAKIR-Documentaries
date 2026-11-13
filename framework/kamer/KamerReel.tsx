import React from 'react';
import {AbsoluteFill, Audio, interpolate, Easing, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/alegreya/400.css';
import '@fontsource/alegreya/700.css';
import '@fontsource/alegreya/400-italic.css';
import '@fontsource/amiri-quran/400.css';

/* Editorial paper illustration style: cream paper, thin sepia ink with a
 * slight hand-drawn wobble, soft watercolour washes. All drawings are
 * original SVG made for this reel. No people / prophets are depicted. */

const PAPER = '#f4ede1';
const INK = '#5a4635';
const INK2 = '#8a735c';
const SERIF = 'Alegreya, Georgia, serif';
const QURAN = '"Amiri Quran", serif';
const C = {sand: '#e6cfa6', ochre: '#d7b37c', sky: '#c9d6d8', sea: '#a9c1c4', sage: '#c4cba9', rose: '#dfb59f', clay: '#c99a78', stone: '#d9c6ad', dusk: '#c79f8f'};

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const r = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

type Scene = {id: string; start: number; dur: number; voiceStart: number; voiceEnd: number; text: string};

const Defs: React.FC = () => (
	<defs>
		<filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
			<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" />
			<feDisplacementMap in="SourceGraphic" scale="3.2" />
		</filter>
		<filter id="wash" x="-20%" y="-20%" width="140%" height="140%">
			<feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7" result="n" />
			<feDisplacementMap in="SourceGraphic" in2="n" scale="26" result="d" />
			<feGaussianBlur in="d" stdDeviation="3.5" />
		</filter>
		<filter id="grain">
			<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" />
			<feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.2  0 0 0 0.07 0" />
		</filter>
	</defs>
);

/** Watercolour wash patch */
const Wash: React.FC<{d: string; fill: string; o?: number}> = ({d, fill, o = 0.55}) => <path d={d} fill={fill} opacity={o} filter="url(#wash)" />;
/** Ink stroke group */
const Ink: React.FC<{children: React.ReactNode; w?: number; c?: string}> = ({children, w = 2.2, c = INK}) => (
	<g filter="url(#ink)" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round">{children}</g>
);

/* ---------------- drawings (viewBox 900 x 1100) ---------------- */

const AYAHS = [17, 22, 32, 40];
const arabicDigits = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);

const PageDrawing: React.FC<{t: number}> = ({t}) => {
	// t: seconds into scene
	const lines = Array.from({length: 15}, (_, i) => i);
	const markerAt = [[2, 300], [6, 610], [10, 210], [13, 520]] as const;
	return (
		<g>
			<Wash d="M90 70 H810 V1030 H90 Z" fill={C.stone} o={0.45} />
			<Ink w={2.4}>
				<rect x="120" y="100" width="660" height="900" rx="6" />
				<rect x="146" y="126" width="608" height="848" rx="4" strokeWidth={1.2} />
				{/* corner ornaments */}
				{[[146, 126], [754, 126], [146, 974], [754, 974]].map(([x, y], i) => (
					<path key={i} d={`M${x - 14} ${y} q14 -14 28 0 q-14 14 -28 0 M${x} ${y - 14} q14 14 0 28 q-14 -14 0 -28`} strokeWidth={1.2} />
				))}
				{/* header cartouche */}
				<rect x="300" y="150" width="300" height="56" rx="28" strokeWidth={1.4} />
				<path d="M330 178 q30 -12 60 0 t60 0 t60 0 t60 0" strokeWidth={1.4} />
				{lines.map((i) => {
					const y = 260 + i * 46;
					const segs = [];
					let x = 730;
					let k = 0;
					while (x > 180) {
						const len = 40 + ((i * 37 + k * 53) % 70);
						const x2 = Math.max(180, x - len);
						segs.push(<path key={k} d={`M${x} ${y} C${x - len * 0.3} ${y - 9} ${x2 + len * 0.3} ${y + 7} ${x2} ${y}`} strokeWidth={1.3} stroke={INK2} />);
						x = x2 - 16;
						k++;
					}
					return <g key={i}>{segs}</g>;
				})}
			</Ink>
			{markerAt.map(([row, x], i) => {
				const at = 1.6 + i * 0.75;
				const on = r(t, at, at + 0.5);
				const y = 260 + row * 46;
				return (
					<g key={i}>
						<circle cx={x} cy={y} r={30 + on * 26} fill="#e9c77f" opacity={on * 0.55} filter="url(#wash)" />
						<g filter="url(#ink)">
							<circle cx={x} cy={y} r={20} fill={PAPER} stroke={INK} strokeWidth={1.8} />
							<circle cx={x} cy={y} r={14} fill="none" stroke={INK2} strokeWidth={1} />
						</g>
						<text x={x} y={y + 6} textAnchor="middle" fontFamily={QURAN} fontSize={17} fill={INK}>{arabicDigits(AYAHS[i])}</text>
						<g opacity={on} transform={`translate(${x} ${y - 52 - on * 8})`}>
							<rect x={-34} y={-24} width={68} height={40} rx={20} fill="#fbf6ec" stroke={INK} strokeWidth={1.5} />
							<text y={6} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={26} fill={INK}>{AYAHS[i]}</text>
						</g>
					</g>
				);
			})}
		</g>
	);
};

const NuhDrawing: React.FC<{t: number}> = ({t}) => {
	const bob = Math.sin(t * 1.6) * 7;
	const tilt = Math.sin(t * 1.3) * 1.6;
	const wave = (y: number, amp: number, ph: number) => {
		let d = `M-40 ${y}`;
		for (let x = -40; x <= 940; x += 60) d += ` Q${x + 30} ${y - amp * Math.sin(ph + x / 90)} ${x + 60} ${y}`;
		return d;
	};
	return (
		<g>
			<Wash d="M40 60 H860 V560 H40 Z" fill={C.sky} o={0.7} />
			<Wash d="M80 90 C250 40 420 150 600 80 C720 40 820 110 850 160 L840 300 C600 250 300 330 70 260 Z" fill="#9fa9ae" o={0.5} />
			<Wash d="M30 600 H870 V1060 H30 Z" fill={C.sea} o={0.75} />
			{/* rain */}
			<Ink w={1.3} c={INK2}>
				{Array.from({length: 42}, (_, i) => {
					const x = (i * 97) % 900;
					const y = ((i * 131 + t * 520) % 620) + 40;
					return <path key={i} d={`M${x} ${y} l-10 30`} opacity={0.75} />;
				})}
			</Ink>
			{/* ark */}
			<g transform={`translate(450 ${610 + bob}) rotate(${tilt})`}>
				<Wash d="M-300 -10 C-260 90 260 90 300 -10 Z" fill={C.clay} o={0.7} />
				<Wash d="M-150 -120 H150 V-10 H-150 Z" fill={C.ochre} o={0.6} />
				<Ink w={2.6}>
					<path d="M-320 -20 C-280 95 280 95 320 -20 Z" />
					{[0, 1, 2].map((i) => <path key={i} d={`M${-305 + i * 6} ${8 + i * 22} C-200 ${60 + i * 18} 200 ${60 + i * 18} ${305 - i * 6} ${8 + i * 22}`} strokeWidth={1.3} />)}
					<path d="M-160 -20 V-125 H160 V-20" />
					<path d="M-185 -125 L0 -190 L185 -125 Z" />
					{[-110, -40, 30, 100].map((x) => <rect key={x} x={x} y={-95} width={34} height={40} strokeWidth={1.4} />)}
				</Ink>
			</g>
			{/* waves */}
			<Ink w={2}>
				<path d={wave(700, 18, t * 1.8)} />
				<path d={wave(790, 24, t * 1.5 + 1)} />
				<path d={wave(880, 22, t * 1.3 + 2)} strokeWidth={1.6} />
				<path d={wave(970, 18, t * 1.1 + 3)} strokeWidth={1.3} c={INK2} />
			</Ink>
		</g>
	);
};

const AdDrawing: React.FC<{t: number}> = ({t}) => {
	const tower = (x: number, w: number, h: number) => (
		<g key={x}>
			<Wash d={`M${x} ${760 - h} h${w} V760 h${-w} Z`} fill={C.ochre} o={0.55} />
			<Ink w={2.2}>
				<path d={`M${x} 760 V${760 - h} h${w} V760`} />
				<path d={`M${x - 10} ${760 - h} h${w + 20} M${x - 6} ${760 - h - 14} h${w + 12} M${x - 6} ${760 - h - 14} V${760 - h}`} strokeWidth={1.6} />
				{Array.from({length: Math.floor(h / 70)}, (_, i) => <path key={i} d={`M${x + 8} ${760 - h + 40 + i * 70} h${w - 16}`} strokeWidth={1} stroke={INK2} />)}
				<path d={`M${x + w / 2 - 12} 760 v-50 q12 -18 24 0 v50`} strokeWidth={1.4} />
			</Ink>
		</g>
	);
	return (
		<g>
			<Wash d="M40 60 H860 V700 H40 Z" fill="#ead9bb" o={0.75} />
			<Wash d="M650 120 a70 70 0 1 1 1 0 Z" fill="#e8c792" o={0.6} />
			{tower(140, 90, 420)}
			{tower(270, 120, 560)}
			{tower(430, 80, 360)}
			{tower(550, 110, 500)}
			{tower(700, 70, 300)}
			<Wash d="M20 740 C200 690 380 790 560 730 C700 690 820 740 880 720 V1070 H20 Z" fill={C.sand} o={0.85} />
			<Ink w={2.2}>
				<path d="M20 760 C200 700 380 800 560 740 C700 700 820 750 880 730" />
				<path d="M40 900 C220 850 420 930 600 880 C720 850 820 880 880 870" strokeWidth={1.5} />
			</Ink>
			{/* wind streaks + dust */}
			<Ink w={1.6} c={INK2}>
				{Array.from({length: 14}, (_, i) => {
					const y = 150 + i * 62;
					const x = ((i * 173 + t * 420) % 1300) - 300;
					return <path key={i} d={`M${x} ${y} c60 -14 120 14 180 0 c30 -7 50 -16 60 -30`} opacity={0.7} />;
				})}
			</Ink>
			{Array.from({length: 60}, (_, i) => {
				const y = 600 + ((i * 53) % 420);
				const x = ((i * 211 + t * (300 + (i % 5) * 60)) % 1000) - 50;
				return <circle key={i} cx={x} cy={y + Math.sin(t * 3 + i) * 10} r={1.5 + (i % 3)} fill={C.clay} opacity={0.55} />;
			})}
		</g>
	);
};

const CamelLine: React.FC = () => (
	<Ink w={2.2}>
		<path d="M0 0 C10 -30 30 -40 45 -30 C55 -60 85 -60 95 -30 C105 -20 115 -15 120 -40 C122 -60 128 -75 140 -78 L150 -72 L142 -68 C134 -60 136 -40 130 -20 C126 -5 118 2 110 4" />
		<path d="M10 0 L5 60 M30 2 L32 60 M90 4 L86 60 M108 4 L114 60" />
		<path d="M0 0 C-6 10 -8 25 -10 35" strokeWidth={1.4} />
	</Ink>
);

const SemudDrawing: React.FC<{t: number}> = ({t}) => {
	const shake = t > 3.2 ? Math.sin(t * 40) * Math.max(0, 1 - (t - 3.2) / 1.8) * 4 : 0;
	const facade = (x: number, y: number, s: number) => (
		<g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
			<Wash d="M-60 0 V-170 H60 V0 Z" fill="#c9a07c" o={0.45} />
			<Ink w={1.9}>
				<path d="M-60 0 V-160 L-40 -175 H40 L60 -160 V0" />
				{[-48, -24, 0, 24].map((dx) => <path key={dx} d={`M${dx} -175 l12 -16 l12 16`} strokeWidth={1.3} />)}
				<path d="M-24 0 V-80 H24 V0" />
				<path d="M-34 -90 H34 M-30 -96 L0 -118 L30 -96" strokeWidth={1.4} />
				<path d="M-52 -10 V-150 M52 -10 V-150" strokeWidth={1} stroke={INK2} />
			</Ink>
		</g>
	);
	return (
		<g transform={`translate(${shake} 0)`}>
			<Wash d="M40 60 H860 V500 H40 Z" fill="#e3d3c3" o={0.7} />
			<Wash d="M30 260 C120 180 220 230 300 170 C420 90 560 180 660 150 C760 120 840 190 880 220 V860 H30 Z" fill={C.rose} o={0.7} />
			<Ink w={2.4}>
				<path d="M30 260 C120 180 220 230 300 170 C420 90 560 180 660 150 C760 120 840 190 880 220" />
				{Array.from({length: 9}, (_, i) => <path key={i} d={`M${80 + i * 95} ${300 + (i % 3) * 40} c10 60 -12 140 6 210`} strokeWidth={1.1} stroke={INK2} />)}
			</Ink>
			{facade(260, 640, 1.15)}
			{facade(520, 560, 0.95)}
			{facade(730, 660, 0.8)}
			<Wash d="M20 840 C300 800 600 860 880 820 V1070 H20 Z" fill={C.sand} o={0.8} />
			<Ink w={2}>
				<path d="M20 850 C300 810 600 870 880 830" />
				<path d={`M300 900 l30 25 l-12 30 l40 28 M560 920 l-20 30 l25 18`} strokeWidth={1.5} opacity={r(t, 3.2, 3.8)} />
			</Ink>
			<g transform="translate(560 935) scale(0.9)">
				<CamelLine />
			</g>
		</g>
	);
};

const LutDrawing: React.FC<{t: number}> = ({t}) => {
	const dark = r(t, 0.5, 6);
	const house = (x: number, y: number, w: number, h: number) => (
		<g key={`${x}-${y}`}>
			<Wash d={`M${x} ${y} h${w} v${-h} h${-w} Z`} fill={C.stone} o={0.75} />
			<Ink w={1.8}>
				<path d={`M${x} ${y} v${-h} h${w} v${h}`} />
				<path d={`M${x - 4} ${y - h} h${w + 8}`} strokeWidth={1.3} />
				<rect x={x + w * 0.35} y={y - h * 0.55} width={w * 0.22} height={h * 0.25} strokeWidth={1.2} />
			</Ink>
		</g>
	);
	const houses: [number, number, number, number][] = [[120, 860, 110, 120], [240, 840, 90, 160], [340, 860, 130, 110], [480, 830, 100, 170], [590, 860, 120, 130], [720, 850, 80, 100], [180, 950, 120, 90], [320, 960, 150, 100], [500, 950, 110, 80], [630, 960, 140, 100]];
	return (
		<g>
			<Wash d="M40 60 H860 V760 H40 Z" fill={C.sky} o={0.6 * (1 - dark)} />
			<Wash d="M40 60 H860 V760 H40 Z" fill={C.dusk} o={0.7 * dark} />
			<Wash d="M60 120 C260 60 520 200 840 110 V360 C560 420 300 300 60 380 Z" fill="#8f7c78" o={0.45 * dark} />
			{/* birds leaving */}
			<Ink w={1.6} c={INK}>
				{Array.from({length: 7}, (_, i) => {
					const x = 300 + i * 60 - t * 50 - i * 8;
					const y = 380 - i * 22 - t * 18;
					return <path key={i} d={`M${x} ${y} q8 -9 16 0 q8 -9 16 0`} />;
				})}
			</Ink>
			<Wash d="M30 790 C200 740 700 740 870 790 V1070 H30 Z" fill={C.sand} o={0.7} />
			{houses.map((h) => house(...h))}
			<Ink w={2}>
				<path d="M30 1000 C300 980 600 1010 870 990" strokeWidth={1.4} />
				<path d="M90 870 C300 820 600 820 820 870" strokeWidth={1} stroke={INK2} />
			</Ink>
		</g>
	);
};

/* -------- composition helpers -------- */

const Card: React.FC<{children: React.ReactNode; local: number; dur: number; mode: 'slide' | 'page' | 'rise'; zoom?: [number, number]; pan?: number}> = ({children, local, dur, mode, zoom = [1, 1.07], pan = 0}) => {
	const inT = r(local, 0, 0.8);
	const outT = r(local, dur - 0.7, dur);
	const z = interpolate(local, [0, dur], zoom);
	let tr = '';
	let op = 1;
	if (mode === 'slide') {
		tr = `translateX(${(1 - inT) * 900 - outT * 900}px)`;
		op = Math.min(1, inT * 1.5) * (1 - outT * 0.6);
	} else if (mode === 'page') {
		tr = `perspective(2200px) rotateY(${(1 - inT) * -70 + outT * 70}deg)`;
		op = Math.min(inT * 1.5, 1 - outT);
	} else {
		tr = `translateY(${(1 - inT) * 80 - outT * 60}px)`;
		op = inT * (1 - outT);
	}
	return (
		<div style={{position: 'absolute', left: 130, top: 370, width: 820, height: 1002, transform: tr, transformOrigin: mode === 'page' ? 'left center' : 'center', opacity: op}}>
			<div style={{position: 'absolute', inset: 0, background: '#f8f2e6', boxShadow: '0 18px 40px rgba(90,70,53,0.18), 0 2px 6px rgba(90,70,53,0.12)', overflow: 'hidden'}}>
				<svg viewBox="0 0 900 1100" width="100%" height="100%" style={{transform: `scale(${z}) translateX(${interpolate(local, [0, dur], [0, pan])}px)`}}>
					<Defs />
					{children}
				</svg>
			</div>
		</div>
	);
};

const Label: React.FC<{text: string; sub?: string; local: number; dur: number; at?: number}> = ({text, sub, local, dur, at = 0.6}) => {
	const o = r(local, at, at + 0.5) * (1 - r(local, dur - 0.6, dur));
	return (
		<div style={{position: 'absolute', top: 222, left: 0, right: 0, textAlign: 'center', opacity: o, transform: `translateY(${(1 - r(local, at, at + 0.5)) * 14}px)`}}>
			{sub ? <div style={{fontFamily: SERIF, fontSize: 30, letterSpacing: 8, color: INK2}}>{sub}</div> : null}
			<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: INK, letterSpacing: 2}}>{text}</div>
		</div>
	);
};

const Caption: React.FC<{s: Scene; t: number}> = ({s, t}) => {
	// show the sentence that is being spoken (split on sentence ends)
	const parts = s.text.split(/(?<=[.?:])\s+(?=[A-ZÇĞİÖŞÜÂÎÛ])/).filter(Boolean);
	const total = parts.reduce((a, p) => a + p.length, 0);
	const span = s.voiceEnd - s.voiceStart;
	let acc = s.voiceStart;
	let cur = '';
	for (const p of parts) {
		const d = (p.length / total) * span;
		if (t >= acc - 0.1 && t < acc + d + 0.25) cur = p;
		acc += d;
	}
	if (!cur) return null;
	return (
		<div style={{position: 'absolute', left: 80, right: 80, top: 1400, textAlign: 'center', fontFamily: SERIF, fontSize: 44, lineHeight: 1.3, color: INK, fontStyle: 'italic'}}>
			{cur}
		</div>
	);
};

const SCENE_META: Record<string, {label?: string; sub?: string; mode: 'slide' | 'page' | 'rise'; zoom?: [number, number]; pan?: number}> = {
	page: {sub: 'KAMER SURESİ', label: '17 · 22 · 32 · 40', mode: 'rise', zoom: [1.0, 1.06]},
	nuh: {sub: 'NUH KAVMİ', label: 'Kamer 54:17', mode: 'page', zoom: [1.04, 1.1], pan: -12},
	ad: {sub: 'ÂD KAVMİ', label: 'Kamer 54:22', mode: 'slide', zoom: [1.08, 1.02], pan: 14},
	semud: {sub: 'SEMÛD KAVMİ', label: 'Kamer 54:32', mode: 'page', zoom: [1.02, 1.09]},
	lut: {sub: 'LÛT KAVMİ', label: 'Kamer 54:40', mode: 'slide', zoom: [1.09, 1.02], pan: -10},
};

const DRAW: Record<string, React.FC<{t: number}>> = {page: PageDrawing, nuh: NuhDrawing, ad: AdDrawing, semud: SemudDrawing, lut: LutDrawing};

const Mini: React.FC<{id: string; i: number; local: number}> = ({id, i, local}) => {
	const D = DRAW[id];
	const at = 0.2 + i * 0.35;
	const o = r(local, at, at + 0.6);
	const x = 90 + (i % 2) * 470;
	const y = 330 + Math.floor(i / 2) * 470;
	return (
		<div style={{position: 'absolute', left: x, top: y + (1 - o) * 40, width: 430, height: 430, opacity: o, background: '#f8f2e6', boxShadow: '0 10px 24px rgba(90,70,53,0.16)', overflow: 'hidden'}}>
			<svg viewBox="0 120 900 900" width="100%" height="100%">
				<Defs />
				<D t={2 + local} />
			</svg>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 10, textAlign: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 28, color: INK, textShadow: '0 0 8px #f8f2e6, 0 0 8px #f8f2e6'}}>{['Nuh', 'Âd', 'Semûd', 'Lût'][i]} · 54:{AYAHS[i]}</div>
		</div>
	);
};

const Final: React.FC<{local: number; dur: number}> = ({local, dur}) => {
	const shrink = r(local, 3.2, 4.4);
	const vO = r(local, 3.6, 4.6);
	const mO = r(local, 4.6, 5.4);
	const end = r(local, dur - 0.8, dur);
	return (
		<AbsoluteFill style={{opacity: 1 - end}}>
			<div style={{position: 'absolute', inset: 0, transform: `translateY(${-shrink * 80}px) scale(${1 - shrink * 0.42})`, transformOrigin: '540px 300px', opacity: 1 - shrink * 0.15}}>
				{['nuh', 'ad', 'semud', 'lut'].map((id, i) => <Mini key={id} id={id} i={i} local={local} />)}
			</div>
			<div style={{position: 'absolute', top: 860, left: 70, right: 70, textAlign: 'center'}}>
				<div style={{fontFamily: SERIF, fontSize: 28, letterSpacing: 7, color: INK2, opacity: vO}}>4 KEZ TEKRAR EDEN AYET</div>
				<div dir="rtl" lang="ar" style={{fontFamily: QURAN, fontSize: 70, lineHeight: 1.9, color: INK, opacity: vO, transform: `translateY(${(1 - vO) * 16}px)`, marginTop: 18}}>
					وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِنْ مُدَّكِرٍ
				</div>
				<div style={{width: 120 * mO, height: 2, background: INK2, margin: '22px auto'}} />
				<div style={{fontFamily: SERIF, fontSize: 44, lineHeight: 1.35, color: INK, opacity: mO, transform: `translateY(${(1 - mO) * 12}px)`}}>
					“Andolsun, Kur’an’ı öğüt almak için kolaylaştırdık.
					<br />
					<b>Öğüt alan yok mu?</b>”
				</div>
				<div style={{fontFamily: SERIF, fontSize: 28, color: INK2, marginTop: 22, opacity: mO}}>Kamer 54: 17 · 22 · 32 · 40</div>
			</div>
		</AbsoluteFill>
	);
};

export const KamerReel: React.FC<{timeline: {durationSec: number; scenes: Scene[]}; audio: string}> = ({timeline, audio}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const s = timeline.scenes.find((x) => t >= x.start && t < x.start + x.dur) ?? timeline.scenes[timeline.scenes.length - 1];
	return (
		<AbsoluteFill style={{background: PAPER}}>
			<svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
				<Defs />
				<rect width="1080" height="1920" filter="url(#grain)" />
			</svg>
			<Audio src={staticFile(audio)} />
			{(() => {
				const local = t - s.start;
				if (s.id === 'final') return <Final local={local} dur={s.dur} />;
				const m = SCENE_META[s.id];
				const D = DRAW[s.id];
				return (
					<>
						<Card local={local} dur={s.dur} mode={m.mode} zoom={m.zoom} pan={m.pan}>
							<D t={local} />
						</Card>
						<Label text={m.label!} sub={m.sub} local={local} dur={s.dur} at={s.id === 'page' ? 1.4 : 0.6} />
					</>
				);
			})()}
			{s.id === 'final' && t - s.start > 3.4 ? null : <Caption s={s} t={t} />}
			<div style={{position: 'absolute', top: 160, left: 0, right: 0, textAlign: 'center', fontFamily: SERIF, fontSize: 24, letterSpacing: 10, color: INK2, opacity: 0.8}}>CAKIR</div>
		</AbsoluteFill>
	);
};
