import React from 'react';
import {random} from 'remotion';
import {Defs, Man} from './Drawn';

/* Noir illustration library (SVG 1080x1920). Silhouettes, hard rim light,
 * limited palette, halftone grain. Every scene takes t (seconds) for subtle motion. */

type P = {t: number};
const W = 1080;
const H = 1920;
const S: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = '#07090f'}) => (
	<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
		<Defs />
		<rect width={W} height={H} fill={bg} />
		{children}
		<rect width={W} height={H} filter="url(#halftone)" />
	</svg>
);

const Woman: React.FC<{x: number; y: number; s?: number; rim?: string; armUp?: number}> = ({x, y, s = 1, rim = '#ffd7a0', armUp = 0}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path d="M-120 0 C-90 -150 -70 -300 -55 -430 L55 -430 C70 -300 90 -150 120 0 Z" fill="#050507" />
		<path d="M-55 -430 C-60 -500 -40 -540 0 -540 C40 -540 60 -500 55 -430 Z" fill="#050507" />
		<g transform={`rotate(${-armUp * 140} 50 -500)`}><path d="M45 -505 C75 -450 80 -400 78 -340 L62 -340 C58 -400 50 -450 35 -495 Z" fill="#050507" /></g>
		<ellipse cx="0" cy="-590" rx="40" ry="48" fill="#050507" />
		<path d="M-45 -600 C-60 -540 -70 -470 -60 -420 L-40 -440 C-48 -500 -40 -560 -30 -600 Z" fill="#050507" />
		<path d="M40 -630 C55 -600 52 -570 44 -555 M55 -430 C70 -300 90 -150 120 0" stroke={rim} strokeWidth="4" fill="none" opacity="0.85" />
	</g>
);

const Monitor: React.FC<{x: number; y: number; w: number; h: number; glow?: string; children?: React.ReactNode; t: number}> = ({x, y, w, h, glow = '#7fb6ff', children, t}) => {
	const f = 0.85 + Math.sin(t * 13 + x) * 0.05;
	return (
		<g>
			<ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 1.2} ry={h * 1.4} fill={glow} opacity={0.18 * f} filter="url(#glow)" />
			<rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} rx="10" fill="#0b0c10" />
			<rect x={x} y={y} width={w} height={h} fill={glow} opacity={0.22 * f} />
			<svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>{children}</svg>
		</g>
	);
};

const CodeLines: React.FC<{w: number; h: number; t: number; color?: string; speed?: number}> = ({w, h, t, color = '#bfe0ff', speed = 40}) => (
	<g>
		{Array.from({length: Math.floor(h / 22)}, (_, i) => {
			const y = ((i * 22 - t * speed) % h + h) % h;
			const len = 30 + random(`cl${i}`) * (w - 80);
			return <rect key={i} x={20 + random(`cx${i}`) * 30} y={y} width={len} height={8} rx="3" fill={color} opacity={0.55} />;
		})}
	</g>
);

const Chart: React.FC<{w: number; h: number; t: number; down?: boolean}> = ({w, h, t, down = true}) => {
	const n = 40;
	const prog = Math.min(1, t / 3);
	let d = '';
	for (let i = 0; i <= n * prog; i++) {
		const x = (i / n) * w;
		const base = down ? h * 0.25 + (i / n) * h * 0.6 : h * 0.8 - (i / n) * h * 0.6;
		const y = base + Math.sin(i * 1.7) * 18 + (random(`ch${i}`) - 0.5) * 30;
		d += `${i ? 'L' : 'M'}${x} ${y}`;
	}
	return <path d={d} stroke={down ? '#ff4d4f' : '#3ddc84'} strokeWidth="6" fill="none" />;
};

export const DRAWN: Record<string, React.FC<P>> = {
	boxes: ({t}) => (
		<S bg="#0a0d14">
			<rect x="0" y="0" width={W} height="1250" fill="#0e1420" />
			{Array.from({length: 7}, (_, i) => <rect key={i} x={i * 160} y="0" width="10" height="1250" fill="#05070b" />)}
			<rect x="0" y="1250" width={W} height="670" fill="#06070a" />
			<rect x="300" y="700" width="480" height="560" fill="#1a2232" />
			<rect x="300" y="700" width="480" height="560" fill="url(#lamp)" opacity="0.8" />
			{[0, 1, 2].map((k) => {
				const x = 250 + k * 260 + (k === 1 ? -t * 20 : t * 12);
				return (
					<g key={k}>
						<Man x={x} y={1660 + k * 30} s={0.75 - k * 0.06} rim="#9fc2ff" hat={false} flip={k === 2} />
						<rect x={x - 10} y={1660 + k * 30 - 0.75 * 360} width="150" height="105" fill="#4a3a26" stroke="#9fc2ff" strokeOpacity="0.4" />
					</g>
				);
			})}
		</S>
	),
	crash: ({t}) => (
		<S bg="#05060a">
			{[0, 1, 2].map((i) => (
				<Monitor key={i} x={70 + i * 330} y={420 + (i === 1 ? -40 : 0)} w={280} h={200} glow="#ff5a5a" t={t}>
					<Chart w={280} h={200} t={t - i * 0.3} />
				</Monitor>
			))}
			{[0, 1].map((i) => (
				<Monitor key={`b${i}`} x={230 + i * 330} y={720} w={280} h={200} glow="#ff5a5a" t={t}>
					<Chart w={280} h={200} t={t - 0.6 - i * 0.3} />
				</Monitor>
			))}
			<rect x="0" y="1060" width={W} height="40" fill="#0d0f15" />
			<g transform="translate(540 1820) scale(1.35)">
				<path d="M-150 0 C-150 -200 -120 -330 -80 -380 L80 -380 C120 -330 150 -200 150 0 Z" fill="#030304" />
				<ellipse cx="0" cy="-440" rx="62" ry="70" fill="#030304" />
				<path d="M-80 -380 C-110 -420 -95 -480 -60 -500 L-40 -470 Z M80 -380 C110 -420 95 -480 60 -500 L40 -470 Z" fill="#030304" />
				<path d="M-150 0 C-150 -200 -120 -330 -80 -380" stroke="#ff6b6b" strokeWidth="3" fill="none" opacity="0.7" />
			</g>
		</S>
	),
	desk: ({t}) => (
		<S bg="#06070b">
			<rect x="0" y="1180" width={W} height="740" fill="#0b0c11" />
			<Monitor x={330} y={760} w={420} h={300} t={t}>
				<CodeLines w={420} h={300} t={t} />
			</Monitor>
			<rect x="500" y="1072" width="80" height="110" fill="#0b0c10" />
			<rect x="250" y="1180" width="580" height="22" fill="#14161d" />
			<g transform="translate(540 1900) scale(1.3)">
				<path d="M-160 0 C-170 -180 -140 -320 -90 -370 L90 -370 C140 -320 170 -180 160 0 Z" fill="#030304" />
				<ellipse cx="0" cy="-430" rx="66" ry="74" fill="#030304" />
				<path d="M-62 -470 C-70 -430 -66 -400 -50 -380 M90 -370 C140 -320 170 -180 160 0" stroke="#9fc8ff" strokeWidth="4" fill="none" opacity="0.8" />
			</g>
			<circle cx="140" cy="1120" r="40" fill="#ffcf7a" opacity="0.18" filter="url(#glow)" />
		</S>
	),
	pizza: ({t}) => (
		<S bg="#0c0907">
			<ellipse cx="540" cy="760" rx="520" ry="420" fill="#ffcf7a" opacity="0.16" filter="url(#glow)" />
			<path d="M540 300 L420 560 L660 560 Z" fill="#ffcf7a" opacity="0.12" />
			<rect x="520" y="200" width="40" height="110" fill="#0a0806" />
			<ellipse cx="540" cy="320" rx="70" ry="20" fill="#1b140c" />
			<rect x="0" y="1150" width={W} height="770" fill="#120d09" />
			{[0, 1].map((k) => (
				<g key={k} transform={`translate(${300 + k * 40} ${1080 - k * 90}) skewX(-8)`}>
					<rect x="0" y="0" width="460" height="80" fill="#e9dcc2" />
					<rect x="0" y="0" width="460" height="80" fill="none" stroke="#5a4630" strokeWidth="3" />
					<circle cx="230" cy="40" r="26" fill="#c0392b" opacity="0.85" />
				</g>
			))}
			{[0, 1, 2].map((k) => (
				<path key={k} d={`M${470 + k * 50} ${960 - ((t * 40 + k * 60) % 220)} q20 -30 0 -60 q-20 -30 0 -60`} stroke="#fff" strokeWidth="5" fill="none" opacity={0.18} />
			))}
		</S>
	),
	ghost: ({t}) => (
		<S bg="#020406">
			{Array.from({length: 26}, (_, c) => (
				<g key={c}>
					{Array.from({length: 30}, (_, r2) => {
						const y = ((r2 * 64 + t * (80 + random(`gv${c}`) * 120)) % 1980) - 40;
						return <text key={r2} x={c * 42 + 10} y={y} fontFamily="monospace" fontSize="30" fill="#6dd3a8" opacity={0.08 + random(`go${c}-${r2}`) * 0.3}>{random(`gc${c}-${r2}`) > 0.5 ? '1' : '0'}</text>;
					})}
				</g>
			))}
			<ellipse cx="540" cy="1000" rx="380" ry="520" fill="#000" opacity="0.6" filter="url(#glow)" />
			<ellipse cx="540" cy="1150" rx="420" ry="300" fill="#6dd3a8" opacity="0.12" filter="url(#glow)" />
			<g transform="translate(540 1900) scale(1.5)">
				<path d="M-190 0 C-190 -230 -150 -360 -100 -400 L100 -400 C150 -360 190 -230 190 0 Z" fill="#010203" />
				<path d="M-110 -390 C-140 -470 -110 -590 0 -610 C110 -590 140 -470 110 -390 C80 -430 -80 -430 -110 -390 Z" fill="#010203" />
				<path d="M-60 -520 C-40 -560 40 -560 60 -520 C50 -470 -50 -470 -60 -520 Z" fill="#000" />
				<path d="M110 -390 C140 -470 110 -590 0 -610 C-110 -590 -140 -470 -110 -390 M190 0 C190 -230 150 -360 100 -400 M-190 0 C-190 -230 -150 -360 -100 -400" stroke="#6dd3a8" strokeWidth="5" fill="none" opacity="0.9" />
			</g>
		</S>
	),
	drawer: ({t}) => (
		<S bg="#07080b">
			<ellipse cx="540" cy="900" rx="430" ry="300" fill="#ffd38a" opacity="0.18" filter="url(#glow)" />
			<rect x="120" y="1060" width="840" height="300" fill="#1a130c" />
			<rect x="120" y="1060" width="840" height="30" fill="#2a1f13" />
			<rect x="460" y="1180" width="160" height="22" rx="8" fill="#6b5a40" />
			<g transform={`translate(540 ${880 + Math.sin(t * 1.5) * 6}) rotate(-8)`}>
				<rect x="-200" y="-130" width="400" height="260" rx="14" fill="#9aa3ad" />
				<rect x="-200" y="-130" width="400" height="260" rx="14" fill="none" stroke="#dfe6ee" strokeWidth="3" opacity="0.6" />
				<circle cx="-20" cy="0" r="92" fill="#7e8790" />
				<circle cx="-20" cy="0" r="18" fill="#c9d0d7" />
				<path d="M60 -20 L170 60" stroke="#c9d0d7" strokeWidth="14" strokeLinecap="round" />
				<rect x="120" y="-110" width="60" height="30" fill="#2a2e33" />
			</g>
		</S>
	),
	bag: ({t}) => (
		<S bg="#10141c">
			<rect x="0" y="0" width={W} height="1100" fill="#1b2130" />
			<rect x="150" y="300" width="360" height="760" fill="#0b0d12" />
			<rect x="170" y="320" width="320" height="720" fill="#e9c98a" opacity="0.15" />
			<rect x="0" y="1100" width={W} height="820" fill="#0c0e13" />
			<g transform="translate(640 1520)">
				<path d="M-190 0 C-230 -140 -170 -300 -60 -330 L-30 -380 L30 -380 L60 -330 C170 -300 230 -140 190 0 Z" fill="#050506" />
				<path d="M-30 -380 L-55 -430 M30 -380 L55 -430" stroke="#050506" strokeWidth="14" strokeLinecap="round" />
				<path d="M60 -330 C170 -300 230 -140 190 0" stroke="#9fb3d1" strokeWidth="4" fill="none" opacity="0.55" />
				<path d="M-120 -200 C-60 -230 30 -220 90 -180" stroke="#2b2f38" strokeWidth="5" fill="none" />
			</g>
			{Array.from({length: 40}, (_, i) => <rect key={i} x={(i * 97) % W} y={((i * 131 + t * 700) % 1100)} width="2" height="34" fill="#9fb3d1" opacity="0.35" transform="rotate(12)" />)}
		</S>
	),
	landfill: ({t}) => (
		<S bg="#1d222a">
			<rect width={W} height="900" fill="#2b3139" />
			<ellipse cx="300" cy="300" rx="420" ry="120" fill="#3a4049" opacity="0.6" filter="url(#glow)" />
			<path d="M0 1050 C180 860 330 900 470 820 C620 740 760 860 1080 780 L1080 1920 L0 1920 Z" fill="#14171b" />
			<path d="M0 1300 C250 1180 500 1260 700 1180 C850 1120 950 1180 1080 1150 L1080 1920 L0 1920 Z" fill="#0d0f12" />
			{Array.from({length: 90}, (_, i) => <rect key={i} x={(random(`lx${i}`) * W)} y={900 + random(`ly${i}`) * 900} width={10 + random(`lw${i}`) * 40} height={6 + random(`lh${i}`) * 18} fill={['#2a2f36', '#3b3226', '#262a33', '#3d4450'][i % 4]} transform={`rotate(${random(`lr${i}`) * 60 - 30} ${random(`lx${i}`) * W} ${900 + random(`ly${i}`) * 900})`} />)}
			<g transform={`translate(${620 + Math.sin(t * 0.6) * 20} 900)`}>
				<rect x="0" y="-120" width="230" height="90" fill="#c9a227" />
				<rect x="40" y="-200" width="110" height="85" fill="#b08d1f" />
				<rect x="55" y="-188" width="80" height="50" fill="#1b2530" />
				<path d="M-10 -60 L-90 -20 L-110 30 L-20 20 Z" fill="#8f7419" />
				<rect x="-10" y="-30" width="260" height="50" rx="25" fill="#111" />
			</g>
			{[0, 1, 2, 3, 4].map((i) => {
				const x = ((i * 230 + t * (60 + i * 15)) % 1300) - 100;
				const y = 380 + i * 60 + Math.sin(t * 3 + i) * 20;
				return <path key={i} d={`M${x} ${y} q20 -18 40 0 q20 -18 40 0`} stroke="#d9dde3" strokeWidth="5" fill="none" />;
			})}
		</S>
	),
	court: ({t}) => (
		<S bg="#0c0906">
			<rect x="140" y="380" width="800" height="900" fill="#1c140c" />
			{[0, 1, 2, 3].map((i) => <rect key={i} x={200 + i * 200} y="380" width="40" height="900" fill="#140e08" />)}
			<circle cx="540" cy="520" r="90" fill="#c9a24a" opacity="0.4" />
			<circle cx="540" cy="520" r="70" fill="none" stroke="#c9a24a" strokeWidth="6" opacity="0.6" />
			<rect x="100" y="1080" width="880" height="260" fill="#2a1d10" />
			<rect x="100" y="1080" width="880" height="24" fill="#3c2a16" />
			<g transform="translate(540 1080)"><Man x={0} y={0} s={0.55} rim="#ffcf7a" hat={false} /></g>
			<g transform={`translate(760 1060) rotate(${t < 1.2 ? -30 + t * 25 : 0})`}>
				<rect x="-14" y="-90" width="28" height="90" fill="#5a3b1c" />
				<rect x="-60" y="-120" width="120" height="44" rx="10" fill="#6b4622" />
			</g>
			<ellipse cx="540" cy="700" rx="460" ry="420" fill="#ffcf7a" opacity="0.1" filter="url(#glow)" />
		</S>
	),
	hacker: ({t}) => (
		<S bg="#03050a">
			{[[60, 520], [400, 470], [740, 520], [230, 820], [570, 820]].map(([x, y], i) => (
				<Monitor key={i} x={x} y={y} w={290} h={210} glow={i % 2 ? '#56ffa5' : '#5fb1ff'} t={t}>
					<CodeLines w={290} h={210} t={t + i} color={i % 2 ? '#7bffb8' : '#a7d4ff'} speed={60 + i * 10} />
				</Monitor>
			))}
			<rect x="0" y="1120" width={W} height="40" fill="#0b0d12" />
			<g transform="translate(540 1900) scale(1.45)">
				<path d="M-190 0 C-190 -230 -150 -360 -100 -400 L100 -400 C150 -360 190 -230 190 0 Z" fill="#010203" />
				<path d="M-110 -390 C-140 -470 -110 -590 0 -610 C110 -590 140 -470 110 -390 C80 -430 -80 -430 -110 -390 Z" fill="#010203" />
				<path d="M110 -390 C140 -470 110 -590 0 -610" stroke="#56ffa5" strokeWidth="3" fill="none" opacity="0.6" />
			</g>
		</S>
	),
	printer: ({t}) => {
		const blink = Math.sin(t * 8) > 0;
		return (
			<S bg="#08090c">
				<ellipse cx="540" cy="1000" rx="460" ry="300" fill="#ffffff" opacity="0.06" filter="url(#glow)" />
				<rect x="200" y="860" width="680" height="340" rx="24" fill="#2a2d33" />
				<rect x="240" y="800" width="600" height="90" rx="12" fill="#353941" />
				<rect x="300" y="1140" width="480" height="30" fill="#111" />
				<path d="M330 1150 L330 1320 L760 1320 L760 1150" fill="#e8e6df" />
				<path d="M330 1220 L760 1240 M330 1260 L760 1250" stroke="#bbb" strokeWidth="3" />
				<circle cx="800" cy="930" r="18" fill={blink ? '#ff3b3b' : '#4a1515'} />
				<circle cx="800" cy="930" r="40" fill="#ff3b3b" opacity={blink ? 0.35 : 0} filter="url(#glow)" />
				<rect x="300" y="910" width="300" height="50" rx="6" fill="#0e1a12" />
				<text x="450" y="945" textAnchor="middle" fontFamily="monospace" fontSize="30" fill={blink ? '#ff5a5a' : '#552020'}>ERROR</text>
			</S>
		);
	},
	casinoTable: ({t}) => (
		<S bg="#040604">
			<ellipse cx="540" cy="1200" rx="700" ry="420" fill="#0f5132" />
			<ellipse cx="540" cy="1200" rx="700" ry="420" fill="none" stroke="#3a2a14" strokeWidth="40" />
			<path d="M540 300 L200 1100 L880 1100 Z" fill="#ffe0a0" opacity="0.1" />
			<ellipse cx="540" cy="300" rx="120" ry="30" fill="#ffe0a0" opacity="0.8" />
			{Array.from({length: 14}, (_, i) => {
				const x = 300 + (i % 7) * 70; const y = 1150 + Math.floor(i / 7) * 60 - (i % 3) * 14;
				const c = ['#c0392b', '#2c3e50', '#f1c40f', '#ecf0f1'][i % 4];
				return <g key={i}><ellipse cx={x} cy={y} rx="34" ry="14" fill={c} /><ellipse cx={x} cy={y - 6} rx="34" ry="14" fill={c} stroke="#fff" strokeWidth="2" strokeDasharray="6 6" /></g>;
			})}
			{[0, 1].map((k) => <rect key={k} x={620 + k * 70} y={1230 - k * 10} width="110" height="160" rx="10" fill="#f4f1ea" transform={`rotate(${-10 + k * 14} ${660 + k * 70} 1300)`} />)}
			<g transform={`translate(${170 + t * 15} 1900) scale(1.1)`}>
				<path d="M-150 0 C-150 -200 -120 -330 -80 -380 L80 -380 C120 -330 150 -200 150 0 Z" fill="#020202" />
				<ellipse cx="0" cy="-440" rx="62" ry="70" fill="#020202" />
			</g>
		</S>
	),
	stage: ({t}) => (
		<S bg="#05030a">
			{[-1, 1].map((k) => <path key={k} d={`M${540 + k * 420} 0 L${540 + k * 60} 1300 L${540 + k * 260} 1300 Z`} fill="#c9a7ff" opacity={0.13 + Math.sin(t * 2 + k) * 0.03} />)}
			<path d="M540 0 L380 1300 L700 1300 Z" fill="#ffe6b0" opacity="0.16" />
			<rect x="0" y="1300" width={W} height="40" fill="#1a1325" />
			<ellipse cx="540" cy="1300" rx="260" ry="40" fill="#ffe6b0" opacity="0.3" />
			<Woman x={540} y={1300} s={1.05} armUp={0.55 + Math.sin(t * 1.2) * 0.05} />
			{Array.from({length: 26}, (_, i) => {
				const x = (i % 13) * 88 + (Math.floor(i / 13) ? 44 : 0) - 20;
				const y = 1600 + Math.floor(i / 13) * 150 + Math.sin(t * 4 + i) * (i % 3 === 0 ? 10 : 2);
				return <g key={i}><ellipse cx={x} cy={y} rx="44" ry="52" fill="#010101" /><rect x={x - 70} y={y + 40} width="140" height="260" rx="50" fill="#010101" /></g>;
			})}
			{Array.from({length: 8}, (_, i) => <circle key={i} cx={100 + i * 120} cy={1560 - (i % 3) * 30} r="5" fill="#fff" opacity={Math.sin(t * 6 + i * 2) > 0.6 ? 0.9 : 0} />)}
		</S>
	),
	plane: ({t}) => {
		const p = Math.min(1, t / 6);
		return (
			<S bg="#0a0f1c">
				<rect width={W} height="1300" fill="#0d1526" />
				{Array.from({length: 50}, (_, i) => <circle key={i} cx={random(`px${i}`) * W} cy={random(`py${i}`) * 1000} r={random(`pr${i}`) * 2 + 0.5} fill="#fff" opacity={0.6} />)}
				<rect y="1300" width={W} height="620" fill="#05070c" />
				{Array.from({length: 12}, (_, i) => <circle key={i} cx={i * 100 + 40} cy="1420" r="6" fill={i % 2 ? '#ffd27a' : '#7fb6ff'} />)}
				<g transform={`translate(${-200 + p * 1350} ${1250 - p * 800}) rotate(-24) scale(1.1)`}>
					<path d="M-200 0 Q-190 -26 -120 -26 L160 -20 Q210 -14 220 0 Q210 14 160 20 L-120 26 Q-190 26 -200 0 Z" fill="#c9ccd3" />
					<path d="M-20 -20 L-110 -150 L-60 -150 L60 -20 Z M-20 20 L-110 150 L-60 150 L60 20 Z" fill="#a9adb6" />
					<path d="M-170 -20 L-210 -90 L-180 -90 L-130 -22 Z" fill="#a9adb6" />
					<circle cx="200" cy="0" r="8" fill="#ff3b3b" opacity={Math.sin(t * 8) > 0 ? 1 : 0.2} />
				</g>
			</S>
		);
	},
	laptop: ({t}) => (
		<S bg="#05070b">
			<ellipse cx="540" cy="900" rx="420" ry="300" fill="#7fb6ff" opacity="0.2" filter="url(#glow)" />
			<path d="M260 720 L820 720 L820 1080 L260 1080 Z" fill="#0d1018" />
			<rect x="285" y="745" width="510" height="310" fill="#122036" />
			<path d="M200 1080 L880 1080 L940 1140 L140 1140 Z" fill="#1a1d24" />
			<g transform={`translate(540 ${880 + Math.sin(t * 2) * 4})`}>
				<rect x="-70" y="-10" width="140" height="110" rx="14" fill="#e8c26a" />
				<path d="M-45 -10 V-55 A45 45 0 0 1 45 -55 V-10" stroke="#e8c26a" strokeWidth="18" fill="none" />
				<circle cx="0" cy="40" r="14" fill="#5a4318" />
				<rect x="-5" y="40" width="10" height="34" fill="#5a4318" />
			</g>
			<text x="540" y="1030" textAnchor="middle" fontFamily="monospace" fontSize="28" fill="#7fb6ff">● ● ● ● ● ● ● ●</text>
		</S>
	),
	vault: ({t}) => (
		<S bg="#060607">
			<ellipse cx="540" cy="1000" rx="480" ry="480" fill="#ffffff" opacity="0.05" filter="url(#glow)" />
			<rect x="250" y="620" width="580" height="680" rx="20" fill="#2a2c31" />
			<rect x="290" y="660" width="500" height="600" rx="10" fill="#0a0a0c" />
			<g transform={`translate(830 960) rotate(${-Math.min(70, t * 30)})`}>
				<rect x="0" y="-340" width="40" height="680" fill="#3a3d44" />
			</g>
			{[0, 1, 2].map((i) => <rect key={i} x="310" y={760 + i * 170} width="460" height="10" fill="#1e1f23" />)}
			<text x="540" y="520" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize="72" fill="#ff5a5a" opacity={Math.min(1, Math.max(0, t - 1.5))}>BOŞ</text>
		</S>
	),
	grave: ({t}) => (
		<S bg="#0b0d14">
			<rect width={W} height="1200" fill="#141a28" />
			<circle cx="800" cy="420" r="80" fill="#e8e6dc" opacity="0.8" />
			<circle cx="800" cy="420" r="160" fill="#e8e6dc" opacity="0.12" filter="url(#glow)" />
			<path d="M0 1200 C300 1150 700 1170 1080 1130 L1080 1920 L0 1920 Z" fill="#07080c" />
			{[[180, 1180, 0.6], [880, 1160, 0.55]].map(([x, y, s], i) => <path key={i} d={`M${x - 60 * s} ${y} V${y - 160 * s} Q${x} ${y - 230 * s} ${x + 60 * s} ${y - 160 * s} V${y} Z`} fill="#05060a" />)}
			<path d="M400 1420 V1050 Q540 900 680 1050 V1420 Z" fill="#20242e" />
			<path d="M400 1420 V1050 Q540 900 680 1050" stroke="#9fb3d1" strokeWidth="3" fill="none" opacity="0.5" />
			
			
			{Array.from({length: 4}, (_, i) => <ellipse key={i} cx={((i * 300 + t * 40) % 1400) - 200} cy={1380 + i * 40} rx="380" ry="40" fill="#c9d2e6" opacity="0.06" filter="url(#soft)" />)}
		</S>
	),
	penthouse: ({t}) => (
		<S bg="#071019">
			<rect width={W} height="1100" fill="#0b1a2a" />
			<circle cx="260" cy="320" r="60" fill="#f2efe3" opacity="0.8" />
			<rect y="900" width={W} height="200" fill="#0d2b3a" />
			{Array.from({length: 18}, (_, i) => <rect key={i} x={i * 60} y={940 + Math.sin(t * 2 + i) * 4} width="40" height="3" fill="#cfe3ff" opacity="0.3" />)}
			<rect y="1100" width={W} height="820" fill="#0a0d12" />
			<rect x="60" y="1060" width="960" height="18" fill="#c9d6e3" opacity="0.4" />
			{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={80 + i * 125} y="1078" width="8" height="160" fill="#c9d6e3" opacity="0.3" />)}
			{[[140, 1100], [940, 1080]].map(([x, y], i) => (
				<g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t + i) * 2})`}>
					<path d="M0 0 Q10 -300 30 -560" stroke="#030405" strokeWidth="26" fill="none" />
					{[-60, -20, 20, 60, 100].map((a) => <path key={a} d={`M30 -560 Q${30 + Math.cos(a * Math.PI / 180) * 200} ${-560 - Math.sin(a * Math.PI / 180) * 60 - 60} ${30 + Math.cos(a * Math.PI / 180) * 300} ${-560 + 90}`} stroke="#030405" strokeWidth="18" fill="none" />)}
				</g>
			))}
			<Man x={560} y={1700} s={0.95} rim="#9fd3ff" hat={false} />
		</S>
	),
	bars: ({t}) => (
		<S bg="#060606">
			<rect x="340" y="400" width="400" height="300" fill="#e9e1cf" opacity="0.85" />
			<path d="M340 700 L120 1920 L1080 1920 L740 700 Z" fill="#e9e1cf" opacity="0.08" />
			{Array.from({length: 9}, (_, i) => <rect key={i} x={70 + i * 118} y="0" width="34" height={H} fill="#111" />)}
			<rect y="900" width={W} height="30" fill="#111" />
			<g transform="translate(540 1900)"><Man x={0} y={0} s={0.9} rim="#e9e1cf" hat={false} /></g>
		</S>
	),
	tower: ({t}) => {
		const cols = 9, rows = 28;
		const off = Math.min(1, Math.max(0, (t - 1) / 5));
		return (
			<S bg="#04060a">
				<rect x="310" y="380" width="460" height="1300" fill="#121a26" />
				{Array.from({length: cols * rows}, (_, i) => {
					const lit = random(`tw${i}`) > off;
					return <rect key={i} x={332 + (i % cols) * 48} y={410 + Math.floor(i / cols) * 44} width="30" height="26" fill={lit ? '#f4d58d' : '#0b0f16'} opacity={lit ? 0.85 : 1} />;
				})}
				<rect y="1680" width={W} height="240" fill="#020306" />
			</S>
		);
	},
};
