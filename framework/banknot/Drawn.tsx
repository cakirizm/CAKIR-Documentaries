import React from 'react';
import {AbsoluteFill} from 'remotion';

/* Noir graphic-novel illustrations drawn in SVG (1080x1920). Silhouettes only,
 * hard rim light, limited palette. t = seconds into the scene (for motion). */

const Defs: React.FC = () => (
	<defs>
		<filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" /><feDisplacementMap in="SourceGraphic" scale="4" /></filter>
		<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
		<filter id="soft"><feGaussianBlur stdDeviation="6" /></filter>
		<filter id="halftone" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed="2" />
			<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.10 0" />
		</filter>
		<linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05070d" /><stop offset="0.7" stopColor="#111a2b" /><stop offset="1" stopColor="#1a2233" /></linearGradient>
		<linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141820" /><stop offset="1" stopColor="#06070a" /></linearGradient>
		<radialGradient id="lamp" cx="0.5" cy="0" r="1"><stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient>
		<radialGradient id="tvGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#8fc2ff" stopOpacity="0.7" /><stop offset="1" stopColor="#8fc2ff" stopOpacity="0" /></radialGradient>
		<linearGradient id="room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0d14" /><stop offset="1" stopColor="#151a26" /></linearGradient>
	</defs>
);

/** Man silhouette (side/back), ~ 600px tall at s=1, origin at feet centre */
const Man: React.FC<{x: number; y: number; s?: number; flip?: boolean; rim?: string; armUp?: number; briefcase?: boolean; hat?: boolean}> = ({x, y, s = 1, flip, rim = '#ffcf7a', armUp = 0, briefcase, hat = true}) => (
	<g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
		{/* legs */}
		<path d="M-40 0 L-30 -260 L5 -260 L-5 0 Z" fill="#030304" />
		<path d="M10 0 L5 -260 L45 -260 L45 0 Z" fill="#030304" />
		{/* coat */}
		<path d="M-70 -230 C-80 -330 -75 -430 -55 -470 C-20 -500 40 -500 70 -470 C85 -420 85 -320 78 -230 Z" fill="#050507" />
		{/* arm */}
		<g transform={`rotate(${-armUp * 120} 60 -450)`}>
			<path d="M55 -455 C80 -400 85 -340 82 -290 L62 -290 C60 -340 50 -390 40 -440 Z" fill="#050507" />
			{briefcase ? <rect x="45" y="-300" width="90" height="70" rx="6" fill="#0a0a0c" stroke={rim} strokeWidth="2" strokeOpacity="0.6" /> : null}
		</g>
		{/* head */}
		<ellipse cx="5" cy="-530" rx="42" ry="50" fill="#050507" />
		{hat ? <path d="M-75 -555 L85 -555 L60 -545 L-55 -545 Z M-45 -555 C-45 -610 55 -610 55 -555 Z" fill="#050507" /> : null}
		{/* rim light */}
		<path d="M70 -470 C85 -420 85 -320 78 -230" stroke={rim} strokeWidth="4" fill="none" opacity="0.8" />
		<path d="M45 -545 C50 -520 48 -500 40 -488" stroke={rim} strokeWidth="3" fill="none" opacity="0.8" />
		<path d="M45 -260 L45 0" stroke={rim} strokeWidth="3" opacity="0.5" />
	</g>
);

/** Robbery: night parking lot, car, figure running away with briefcase, police lights */
export const DrawnRobbery: React.FC<{t: number}> = ({t}) => {
	const red = Math.sin(t * 9) > 0;
	const runX = 860 - t * 70;
	return (
		<AbsoluteFill>
			<svg width="1080" height="1920" viewBox="0 0 1080 1920">
				<Defs />
				<rect width="1080" height="1920" fill="url(#nightSky)" />
				{/* distant building with neon sign */}
				<rect x="40" y="620" width="620" height="520" fill="#0a0d14" />
				<rect x="120" y="680" width="420" height="90" rx="10" fill="none" stroke="#ff4fa3" strokeWidth="6" opacity={0.85} />
				<rect x="120" y="680" width="420" height="90" rx="10" fill="none" stroke="#ff4fa3" strokeWidth="18" opacity={0.25} filter="url(#soft)" />
				<text x="330" y="745" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize="56" fill="#ff7cc0" letterSpacing="6">CLUB</text>
				{[0, 1, 2, 3].map((i) => <rect key={i} x={90 + i * 140} y={850} width={90} height={140} fill="#16120a" stroke="#3a2c14" />)}
				{/* street lamp */}
				<rect x="840" y="560" width="10" height="700" fill="#0b0b0e" />
				<path d="M845 560 Q845 530 800 530 L770 530" stroke="#0b0b0e" strokeWidth="10" fill="none" />
				<ellipse cx="770" cy="540" rx="28" ry="10" fill="#ffe2a0" />
				<path d="M770 540 L560 1400 L980 1400 Z" fill="url(#lamp)" />
				{/* ground */}
				<rect y="1140" width="1080" height="780" fill="url(#asphalt)" />
				{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={60 + i * 220} y={1500} width={8} height={300} fill="#c9c2a8" opacity={0.25} transform={`skewX(-20)`} />)}
				{/* car (SUV) */}
				<g transform="translate(150 1330)">
					<path d="M0 120 L0 40 Q10 0 60 -10 L170 -90 Q200 -110 260 -110 L520 -110 Q570 -110 600 -70 L660 -10 Q720 0 730 40 L730 120 Z" fill="#0c0e13" />
					<path d="M190 -80 L260 -95 L380 -95 L380 -20 L150 -20 Z" fill="#1f2a3c" />
					<path d="M400 -95 L520 -95 Q550 -95 575 -60 L600 -20 L400 -20 Z" fill="#1f2a3c" />
					{/* broken window shards */}
					<path d="M410 -90 L470 -40 L430 -30 L500 -70 L520 -25" stroke="#cfe3ff" strokeWidth="3" fill="none" opacity="0.8" />
					<circle cx="150" cy="125" r="62" fill="#050506" />
					<circle cx="600" cy="125" r="62" fill="#050506" />
					<path d="M0 40 L730 40" stroke="#ffcf7a" strokeWidth="2" opacity="0.4" />
				</g>
				{/* glass on ground */}
				{Array.from({length: 14}, (_, i) => <path key={i} d={`M${560 + (i * 37) % 200} ${1475 + (i * 23) % 40} l${6 + (i % 3) * 4} -8 l4 10 z`} fill="#cfe3ff" opacity={0.6} />)}
				{/* running thief */}
				<Man x={runX} y={1560} s={0.62} flip rim="#ff6a6a" briefcase armUp={0.15} />
				{/* police light wash */}
				<rect width="1080" height="1920" fill={red ? '#ff2030' : '#2050ff'} opacity={0.13} />
				<circle cx={red ? 1060 : 20} cy="1250" r="380" fill={red ? '#ff2030' : '#2050ff'} opacity={0.35} filter="url(#glow)" />
				<rect width="1080" height="1920" filter="url(#halftone)" />
			</svg>
		</AbsoluteFill>
	);
};

/** The win: dark living room, man silhouette in front of glowing TV, Christmas tree lights */
export const DrawnWin: React.FC<{t: number}> = ({t}) => {
	const flick = 0.85 + Math.sin(t * 17) * 0.06 + Math.sin(t * 5.3) * 0.05;
	return (
		<AbsoluteFill>
			<svg width="1080" height="1920" viewBox="0 0 1080 1920">
				<Defs />
				<rect width="1080" height="1920" fill="url(#room)" />
				{/* window with snow */}
				<rect x="90" y="420" width="300" height="420" fill="#16233a" stroke="#05060a" strokeWidth="18" />
				<path d="M240 420 V840 M90 630 H390" stroke="#05060a" strokeWidth="12" />
				{Array.from({length: 30}, (_, i) => <circle key={i} cx={100 + ((i * 53) % 280)} cy={430 + ((i * 97 + t * 40 * (1 + (i % 3))) % 400)} r={2 + (i % 3)} fill="#dfe8ff" opacity={0.8} />)}
				{/* Christmas tree */}
				<g transform="translate(860 1350)">
					<path d="M0 -560 L150 -260 L90 -260 L190 0 L-190 0 L-90 -260 L-150 -260 Z" fill="#06100b" />
					{Array.from({length: 22}, (_, i) => {
						const yy = -500 + (i * 23) % 480; const xx = ((i * 71) % 260) - 130;
						const on = Math.sin(t * 3 + i * 1.7) > -0.3;
						const c = ['#ff5d5d', '#ffd36b', '#7fd0ff', '#9dff8a'][i % 4];
						return Math.abs(xx) < 40 + (yy + 560) * 0.3 ? <circle key={i} cx={xx} cy={yy} r={7} fill={c} opacity={on ? 1 : 0.25} /> : null;
					})}
					<path d="M0 -600 l12 30 l-30 -18 h36 l-30 18 z" fill="#ffd36b" />
				</g>
				{/* TV */}
				<circle cx="540" cy="900" r="520" fill="url(#tvGlow)" opacity={flick} />
				<rect x="300" y="760" width="480" height="300" rx="16" fill="#0b0d12" />
				<rect x="322" y="780" width="436" height="260" rx="6" fill="#a9d1ff" opacity={flick} />
				<text x="540" y="890" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize="44" fill="#0b2a55">$314.9 M</text>
				<rect x="322" y="990" width="436" height="50" fill="#e5484d" />
				<text x="540" y="1025" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize="28" fill="#fff">TEK KAZANAN</text>
				<rect x="380" y="1060" width="320" height="130" fill="#0a0b10" />
				{/* floor */}
				<rect y="1190" width="1080" height="730" fill="#07080c" />
				<ellipse cx="540" cy="1260" rx="460" ry="60" fill="#8fc2ff" opacity={0.12 * flick} />
				{/* man from behind, arm raised holding ticket */}
				<Man x={540} y={1760} s={1.25} rim="#b9dcff" armUp={0.9} hat={false} />
				<g transform={`translate(796 1095) rotate(-18)`}>
					<rect x="-46" y="-30" width="92" height="56" fill="#f2efe4" />
					<rect x="-46" y="-30" width="92" height="12" fill="#e5484d" />
				</g>
				<rect width="1080" height="1920" filter="url(#halftone)" />
			</svg>
		</AbsoluteFill>
	);
};
