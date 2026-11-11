// CAKIR sea reconstructions — a small open fishing skiff riding animated waves.
// Illustrative only; every scene carries an on-screen "Illustrative
// reconstruction" label. Time-based (seconds), works at any shot length.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../../theme';
import {rand} from '../anim';
import {BEND, LEG_LEN, Look, Pose, Puppet, SIT, STAND, lerpPose, walkBob, walkPose} from './Puppet';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.25, 1);
const seg = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...cl, easing: ease});

export const ALVARENGA: Look = {skin: '#a36d4d', hair: '#1e1916', jacket: '#6d8ea8', jacketShade: '#5a7891', shirt: '#6d8ea8', trousers: '#3d3b36', trousersShade: '#302e2a', shoes: '#8c5b40', beard: 0.3, mustache: true, build: 1};
export const CORDOBA: Look = {skin: '#b27b58', hair: '#1a1512', jacket: '#c7ae73', jacketShade: '#ae975f', shirt: '#c7ae73', trousers: '#4a4f5a', trousersShade: '#3c414b', shoes: '#9a6748', cap: '#b03e2e', build: 0.95};

type Mood = {sky: [string, string]; sea: [string, string]; amp: number; speed: number; night?: boolean; rain?: number; storm?: boolean; haze?: string};
const MOODS: Record<string, Mood> = {
	dawn: {sky: ['#2b3a55', '#e7a46b'], sea: ['#3a5a73', '#1d2f40'], amp: 0.6, speed: 0.7},
	day: {sky: ['#6f9cc4', '#d9e4ea'], sea: ['#2f6f8f', '#173f55'], amp: 0.7, speed: 0.8},
	hot: {sky: ['#8fb4cf', '#f1e6c9'], sea: ['#3a7d93', '#1a4a5c'], amp: 0.45, speed: 0.5, haze: 'rgba(255,220,160,0.18)'},
	overcast: {sky: ['#5d6a74', '#9aa3a8'], sea: ['#3c5563', '#1e2f3a'], amp: 1.1, speed: 1},
	storm: {sky: ['#1b2228', '#3e4a52'], sea: ['#26363f', '#0e171d'], amp: 2.4, speed: 1.6, rain: 1, storm: true},
	rain: {sky: ['#4c5961', '#7d878c'], sea: ['#35505e', '#1b2c36'], amp: 0.9, speed: 0.9, rain: 0.6},
	dusk: {sky: ['#24304a', '#d9875c'], sea: ['#2e4a5e', '#141f2a'], amp: 0.6, speed: 0.6},
	night: {sky: ['#05070d', '#18233a'], sea: ['#0f1c2a', '#05090e'], amp: 0.5, speed: 0.5, night: true},
};

const HORIZON = 470;
const waveY = (x: number, t: number, m: Mood, base = 760) =>
	base + m.amp * (14 * Math.sin(x * 0.006 - t * 1.3 * m.speed) + 8 * Math.sin(x * 0.013 + t * 1.9 * m.speed + 1) + 4 * Math.sin(x * 0.031 - t * 2.7 * m.speed + 2));

const Sky: React.FC<{m: Mood; t: number}> = ({m, t}) => (
	<g>
		<defs>
			<linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={m.sky[0]} /><stop offset="1" stopColor={m.sky[1]} /></linearGradient>
			<radialGradient id="cloudG"><stop offset="0" stopColor={m.night ? '#1d2638' : m.storm ? '#2a3238' : '#ffffff'} stopOpacity={m.storm ? 0.9 : 0.55} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></radialGradient>
		</defs>
		<rect width={1920} height={HORIZON + 4} fill="url(#skyG)" />
		{m.night
			? Array.from({length: 220}, (_, i) => {
					const x = rand(i * 3.3) * 1920, y = rand(i * 7.1) * (HORIZON - 30);
					const tw = 0.5 + 0.5 * Math.sin(t * (1 + rand(i) * 3) + i);
					return <circle key={i} cx={x} cy={y} r={rand(i * 1.7) * 1.8 + 0.4} fill="#fff" opacity={0.35 + 0.55 * tw * rand(i * 5.5)} />;
				})
			: null}
		{Array.from({length: m.night ? 3 : 7}, (_, i) => {
			const x = ((rand(i * 9.1) * 2400 + t * (12 + i * 3) * (m.storm ? 3 : 1)) % 2600) - 340;
			return <ellipse key={i} cx={x} cy={80 + rand(i * 4.2) * 260} rx={260 + rand(i) * 260} ry={50 + rand(i * 2.2) * 50} fill="url(#cloudG)" />;
		})}
	</g>
);

const Moon: React.FC<{x: number; y: number; phase: number}> = ({x, y, phase}) => {
	// phase 0..1 (0 new, 0.5 full)
	const off = Math.cos(phase * Math.PI * 2) * 46;
	return (
		<g>
			<circle cx={x} cy={y} r={70} fill="#fdf6df" opacity={0.08} />
			<clipPath id="moonClip"><circle cx={x} cy={y} r={40} /></clipPath>
			<circle cx={x} cy={y} r={40} fill="#f4ecd0" />
			<circle cx={x + (phase < 0.5 ? -off : off)} cy={y} r={40} fill="#0a0f1a" opacity={Math.abs(Math.cos(phase * Math.PI)) > 0.02 ? 0.92 : 0} clipPath="url(#moonClip)" />
		</g>
	);
};

const SeaLayer: React.FC<{m: Mood; t: number; base: number; color: string; opacity?: number; phase?: number}> = ({m, t, base, color, opacity = 1, phase = 0}) => {
	const pts: string[] = [];
	for (let x = -40; x <= 1960; x += 40) pts.push(`${x},${waveY(x + phase, t, m, base)}`);
	return <polygon points={`-40,1080 ${pts.join(' ')} 1960,1080`} fill={color} opacity={opacity} />;
};

const Seas: React.FC<{m: Mood; t: number}> = ({m, t}) => (
	<g>
		<defs><linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={m.sea[0]} /><stop offset="1" stopColor={m.sea[1]} /></linearGradient></defs>
		<rect x={0} y={HORIZON} width={1920} height={1080 - HORIZON} fill="url(#seaG)" />
		{Array.from({length: 26}, (_, i) => {
			const y = HORIZON + 8 + Math.pow(i / 26, 1.6) * 520;
			const x = ((rand(i * 2.7) * 1920 + t * 30 * m.speed * (1 + i / 10)) % 2100) - 90;
			return <line key={i} x1={x} x2={x + 60 + i * 6} y1={y} y2={y} stroke="rgba(255,255,255,0.18)" strokeWidth={1 + i / 12} />;
		})}
		<SeaLayer m={m} t={t * 0.8} base={640} color={m.sea[0]} opacity={0.5} phase={300} />
	</g>
);

const Rain: React.FC<{t: number; amount: number}> = ({t, amount}) => (
	<g opacity={0.55 * amount}>
		{Array.from({length: Math.round(260 * amount)}, (_, i) => {
			const x = ((rand(i * 1.3) * 2200 + t * 380) % 2200) - 140;
			const y = ((rand(i * 2.9) * 1200 + t * 1500 * (0.8 + rand(i) * 0.4)) % 1200) - 60;
			return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 46} stroke="#cfd8dd" strokeWidth={1.4} />;
		})}
	</g>
);

/** The skiff: ~7 m open fibreglass boat, outboard at the stern, icebox amidships. */
const Boat: React.FC<{x: number; t: number; m: Mood; L?: number; children?: React.ReactNode; motorSmoke?: number; wake?: boolean}> = ({x, t, m, L = 1000, children, motorSmoke = 0, wake}) => {
	const yb = waveY(x + L / 2, t, m), ys = waveY(x - L / 2, t, m);
	const ang = (Math.atan2(yb - ys, L) * 180) / Math.PI;
	const y = (yb + ys) / 2 - 18;
	return (
		<g>
			<g transform={`translate(${x},${y}) rotate(${ang})`}>
				{/* interior */}
				<path d={`M ${-L / 2} -40 L ${L / 2 - 40} -54 L ${L / 2 - 60} -30 L ${-L / 2 + 10} -24 Z`} fill="#b9bfbd" />
				{/* icebox */}
				<rect x={-110} y={-128} width={240} height={100} rx={6} fill="#eef0ec" stroke="#c7ccc8" strokeWidth={4} />
				<rect x={-110} y={-132} width={240} height={14} rx={4} fill="#dfe3df" />
				<clipPath id="boatFloor"><rect x={-2000} y={-2000} width={4000} height={2016} /></clipPath>
				<g clipPath="url(#boatFloor)">{children}</g>
				{/* hull side */}
				<path d={`M ${-L / 2 - 6} -42 L ${L / 2} -58 Q ${L / 2 + 30} -56 ${L / 2 + 10} -30 Q ${L / 2 - 60} 24 ${L / 2 - 200} 30 L ${-L / 2 + 10} 30 Q ${-L / 2 - 6} 0 ${-L / 2 - 6} -42 Z`} fill="#eceee9" />
				<path d={`M ${-L / 2 - 4} -26 L ${L / 2 + 8} -40`} stroke="#2f6f9f" strokeWidth={9} />
				<path d={`M ${-L / 2 - 6} -42 L ${L / 2} -58`} stroke="#d2d6d2" strokeWidth={6} />
				{/* outboard motor */}
				<rect x={-L / 2 - 74} y={-120} width={70} height={66} rx={14} fill="#2c2f33" />
				<rect x={-L / 2 - 50} y={-58} width={20} height={110} fill="#3a3d42" />
				{motorSmoke > 0
					? [0, 1, 2].map((k) => <circle key={k} cx={-L / 2 - 90 - k * 26 - motorSmoke * 40} cy={-130 - k * 20 - motorSmoke * 30} r={14 + k * 8 + motorSmoke * 10} fill="#9aa0a4" opacity={0.5 * (1 - motorSmoke)} />)
					: null}
			</g>
			{wake ? Array.from({length: 10}, (_, i) => <ellipse key={i} cx={x - L / 2 - 80 - i * 70 - ((t * 120) % 70)} cy={waveY(x - L / 2 - 80 - i * 70, t, m) + 6} rx={50 + i * 6} ry={6} fill="#fff" opacity={0.35 - i * 0.03} />) : null}
		</g>
	);
};

const Label: React.FC = () => (
	<div style={{position: 'absolute', right: theme.safe.x, top: theme.safe.y + 46, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.85}}>
		<div style={{width: 8, height: 8, borderRadius: 4, border: `2px solid ${theme.color.accent}`}} />
		<div style={{fontFamily: theme.font.mono, fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(236,229,216,0.88)', textShadow: '0 1px 6px rgba(0,0,0,0.8)'}}>Illustrative reconstruction</div>
	</div>
);

const H = 330; // character height in the boat
const STANDY = -LEG_LEN * H + 6; // hip y (boat coords) when standing on the floor
const SITICE = -132 - 4; // hip y sitting on the icebox lid

const Ship: React.FC<{x: number; s?: number}> = ({x, s = 1}) => (
	<g transform={`translate(${x},${HORIZON - 4}) scale(${s})`} opacity={0.85}>
		<path d="M -220 0 L 230 0 L 200 22 L -200 22 Z" fill="#2a2e33" />
		{Array.from({length: 9}, (_, i) => <rect key={i} x={-170 + i * 38} y={-34 - (i % 3) * 8} width={36} height={34 + (i % 3) * 8} fill={['#7a3b32', '#3c5466', '#6b6b5f'][i % 3]} />)}
		<rect x={150} y={-58} width={40} height={58} fill="#d8d8d2" />
	</g>
);

const Island: React.FC<{s: number}> = ({s}) => (
	<g transform={`translate(1420,${HORIZON + 2}) scale(${s})`}>
		<path d="M -260 0 Q -150 -26 0 -30 Q 140 -26 260 0 Z" fill="#2f4a2c" />
		<path d="M -240 2 L 250 2 L 230 8 L -230 8 Z" fill="#e9dfbf" />
		{[-160, -90, -10, 70, 150].map((x, i) => (
			<g key={i} transform={`translate(${x},-24)`}>
				<path d={`M 0 0 Q ${4 + i} -40 ${10 - i * 2} -78`} stroke="#4a3b2a" strokeWidth={5} fill="none" />
				{[-60, -20, 20, 60, 100, 140].map((a, k) => (
					<path key={k} d={`M ${10 - i * 2} -78 q ${Math.cos((a * Math.PI) / 180) * 30} ${Math.sin((a * Math.PI) / 180) * 10 - 10} ${Math.cos((a * Math.PI) / 180) * 56} ${Math.sin((a * Math.PI) / 180) * 26}`} stroke="#2d5a2a" strokeWidth={6} fill="none" />
				))}
			</g>
		))}
	</g>
);

const Bird: React.FC<{x: number; y: number; flap: number; s?: number}> = ({x, y, flap, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<ellipse cx={0} cy={0} rx={22} ry={9} fill="#f2f2ee" />
		<path d={`M -4 -2 Q -30 ${-26 * flap} -58 ${-6 * flap - 4} Q -30 ${-6 * flap} -4 4 Z`} fill="#2d2d2d" />
		<path d={`M 4 -2 Q 30 ${-26 * flap} 58 ${-6 * flap - 4} Q 30 ${-6 * flap} 4 4 Z`} fill="#3a3a3a" />
		<circle cx={20} cy={-5} r={6} fill="#f2f2ee" />
		<path d="M 25 -5 L 38 -2 L 25 -1 Z" fill="#7a8fa0" />
	</g>
);

const Fish: React.FC<{x: number; y: number; wiggle: number}> = ({x, y, wiggle}) => (
	<g transform={`translate(${x},${y}) rotate(${80 + wiggle * 25})`}>
		<ellipse cx={0} cy={0} rx={34} ry={12} fill="#7fa7b8" />
		<path d="M -30 0 L -52 -14 L -50 14 Z" fill="#6a93a4" />
		<circle cx={22} cy={-3} r={3} fill="#111" />
	</g>
);

export const SeaScene: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const t = frame / fps + (shot.startAt ?? 0);
	const D = durationInFrames / fps;
	const scene: string = shot.scene;
	const beard = shot.beard ?? 0.3;
	const ALV: Look = {...ALVARENGA, beard};
	let mood = MOODS[shot.mood ?? 'day'];
	let people: React.ReactNode = null;
	let extraBack: React.ReactNode = null;
	let extraFront: React.ReactNode = null;
	let smoke = 0;
	let wake = false;
	let flash = 0;
	let boatX = 980;
	let zoom: [number, number, string] = [1.42, 1.5, '52% 64%'];

	if (scene === 'depart') {
		mood = MOODS.dawn; wake = true;
		const coast = interpolate(t, [0, D], [0, -380]);
		extraBack = <path d={`M ${-200 + coast} ${HORIZON} L ${-200 + coast} ${HORIZON - 70} Q ${200 + coast} ${HORIZON - 120} ${520 + coast} ${HORIZON - 30} L ${720 + coast} ${HORIZON} Z`} fill="#1d2a2e" opacity={0.85} />;
		people = (
			<g>
				<Puppet x={-380} y={STANDY} h={H} pose={{...STAND, nShoulder: -40, nElbow: 30, head: -4}} look={ALV} />
				<Puppet x={20} y={SITICE} h={H} pose={{...SIT, head: Math.sin(t) * 3}} look={CORDOBA} flip shadow={false} />
			</g>
		);
	} else if (scene === 'prepare') {
		mood = MOODS.dawn;
		// a fisherman carries a fuel can across the beach to the boat; his partner works in the boat
		const walk = seg(t, 0, Math.min(4.5, D - 0.5));
		const px = interpolate(walk, [0, 1], [-100, 560]);
		const ph = (px / 300) * Math.PI * 2;
		extraBack = (
			<g>
				<path d={`M 0 ${HORIZON + 90} Q 500 ${HORIZON + 60} 900 ${HORIZON + 150} Q 1050 ${HORIZON + 260} 1180 1080 L 0 1080 Z`} fill="#c9b48a" />
				<path d={`M 900 ${HORIZON + 150} Q 1050 ${HORIZON + 260} 1180 1080`} stroke="#eae1c8" strokeWidth={10} fill="none" opacity={0.8} />
			</g>
		);
		extraFront = (
			<Puppet x={px} y={930 - LEG_LEN * 300} h={300} pose={walk < 1 ? walkPose(ph) : STAND} look={CORDOBA}
				nearProp={(hand) => <g><rect x={hand[0] - 20} y={hand[1]} width={40} height={52} rx={6} fill="#b43a2c" /><rect x={hand[0] - 6} y={hand[1] - 8} width={12} height={10} fill="#222" /></g>} />
		);
		boatX = 1300;
		const coil = Math.sin(t * 3);
		people = <Puppet x={-150} y={STANDY} h={H} pose={{...BEND, lean: 30 + coil * 6, nShoulder: 30 + coil * 30, nElbow: 40, fShoulder: 20 - coil * 20, fElbow: 50}} look={ALV} flip />;
		zoom = [1.12, 1.18, '45% 66%'];
	} else if (scene === 'storm') {
		mood = MOODS.storm;
		const bail = (t * 1.3) % 1;
		const up = Math.sin(bail * Math.PI);
		const tl = t % 3.7;
		flash = tl < 0.12 ? 1 - tl / 0.12 : 0;
		people = (
			<g>
				<Puppet x={-330} y={STANDY + 40} h={H} pose={{...BEND, lean: 40 + up * 25, nShoulder: 20 + up * 120, nElbow: 30, fShoulder: 10 + up * 100, fElbow: 30, head: -10}} look={ALV}
					betweenHands={(n) => <rect x={n[0] - 18} y={n[1] - 10} width={36} height={30} rx={4} fill="#3a6fa0" />} />
				<Puppet x={200} y={STANDY + 60} h={H} pose={{...BEND, lean: 55, nShoulder: 70, nElbow: 30, fShoulder: 60, fElbow: 40, head: 6}} look={CORDOBA} flip />
				{up > 0.85 ? Array.from({length: 8}, (_, i) => <circle key={i} cx={-500 - i * 14} cy={-260 + i * 10} r={5} fill="#cde" opacity={0.7} />) : null}
			</g>
		);
		zoom = [1.45, 1.53, '50% 65%'];
	} else if (scene === 'engine') {
		mood = MOODS.overcast;
		const c = t % 2.2;
		const pull = c < 0.35 ? seg(c, 0, 0.35) : c < 0.8 ? 1 - seg(c, 0.35, 0.8) : 0;
		smoke = c > 0.35 && c < 1.3 ? (c - 0.35) / 0.95 : 0;
		people = (
			<g>
				<Puppet x={-410} y={STANDY + 20} h={H} flip pose={{...STAND, lean: 30 - pull * 35, head: 8, nShoulder: 80 - pull * 100, nElbow: 20 + pull * 40, fShoulder: 30, fElbow: 40}} look={ALV} />
				<Puppet x={60} y={SITICE} h={H} pose={{...SIT, head: -6 + Math.sin(t) * 2}} look={CORDOBA} flip shadow={false} />
			</g>
		);
	} else if (scene === 'rain') {
		mood = MOODS.rain;
		people = (
			<g>
				<Puppet x={-260} y={STANDY} h={H} pose={{...STAND, head: -18, nShoulder: 165, nElbow: 10, fShoulder: 150, fElbow: 20}} look={ALV}
					betweenHands={(n, f) => <g><rect x={(n[0] + f[0]) / 2 - 16} y={Math.min(n[1], f[1]) - 50} width={32} height={60} rx={8} fill="rgba(200,225,235,0.75)" stroke="#9cc" /></g>} />
				<Puppet x={200} y={STANDY + 30} h={H} flip pose={{...BEND, lean: 30, nShoulder: 70, nElbow: 40, fShoulder: 60, fElbow: 50}} look={CORDOBA}
					betweenHands={(n, f) => <rect x={Math.min(n[0], f[0]) - 10} y={Math.max(n[1], f[1]) - 10} width={70} height={36} rx={6} fill="#4f7a9a" />} />
			</g>
		);
	} else if (scene === 'catch') {
		mood = MOODS.day;
		const c = t % 4;
		const reach = c < 1.4 ? seg(c, 0, 1.4) : c < 2.2 ? 1 : 1 - seg(c, 2.2, 3.2);
		const hasFish = c > 2.2 && c < 3.6;
		const birdIn = seg(t, 0.5, 3);
		const bx = interpolate(birdIn, [0, 1], [1700, 1380]), by = interpolate(birdIn, [0, 1], [200, 640]);
		people = (
			<Puppet x={0} y={STANDY + 50} h={H} pose={{...BEND, lean: 58 + reach * 10, head: 14, nShoulder: 10 - reach * 30, nElbow: 6, fShoulder: 30, fElbow: 50}} look={ALV}
				nearProp={(hand) => (hasFish ? <Fish x={hand[0] + 10} y={hand[1] + 10} wiggle={Math.sin(t * 18)} /> : null)} />
		);
		extraFront = <Bird x={bx} y={by} flap={birdIn < 1 ? Math.sin(t * 14) : 0.15} s={1.1} />;
		boatX = 900;
	} else if (scene === 'shelter') {
		mood = MOODS.hot;
		people = (
			<g>
				<g transform="translate(150,-150) rotate(-90)">
					<Puppet x={0} y={0} h={H * 0.95} shadow={false} pose={{lean: 0, head: -6, nThigh: 2, nKnee: 4, fThigh: 0, fKnee: 2, nShoulder: 4, nElbow: 12, fShoulder: 2, fElbow: 8}} look={CORDOBA} breathe={Math.sin(t * 1.4)} />
				</g>
				<Puppet x={-300} y={SITICE + 60} h={H} pose={{...SIT, lean: 14, head: 16 + Math.sin(t * 0.6) * 3, nShoulder: 40, nElbow: 70}} look={ALV} flip={false} />
			</g>
		);
	} else if (scene === 'alone' || scene === 'moons') {
		mood = MOODS.night;
		const phase = scene === 'moons' ? (t / 1.6) % 1 : 0.62;
		extraBack = <Moon x={1240} y={250} phase={phase} />;
		people = <Puppet x={-40} y={SITICE} h={H} pose={{...SIT, lean: 12, head: -14 + Math.sin(t * 0.5) * 6, nShoulder: 30, nElbow: 80, fShoulder: 25, fElbow: 90}} look={ALV} flip shadow={false} />;
		zoom = [1.36, 1.44, '52% 62%'];
	} else if (scene === 'ship') {
		mood = MOODS.day;
		const sx = interpolate(t, [0, D], [300, 1500]);
		extraBack = <Ship x={sx} s={0.55} />;
		const wave = seg(t, 1, 1.6);
		const w = Math.sin(t * 7) * wave;
		people = <Puppet x={-100} y={STANDY} h={H} pose={lerpPose(STAND, {...STAND, head: -6, nShoulder: 170 + w * 20, nElbow: 10, fShoulder: 160 - w * 20, fElbow: 14}, wave)} look={ALV} />;
		zoom = [1.22, 1.3, '56% 56%'];
	} else if (scene === 'island') {
		mood = MOODS.dawn;
		const s = interpolate(t, [0, D], [0.55, 1.25], {...cl, easing: ease});
		extraBack = <Island s={s} />;
		const shade = seg(t, 1.2, 2.2);
		people = <Puppet x={60} y={STANDY} h={H} pose={lerpPose(STAND, {...STAND, head: -4, nShoulder: 140, nElbow: 90, lean: 4}, shade)} look={ALV} />;
		zoom = [1.22, 1.34, '62% 55%'];
	}

	const cam = interpolate(frame, [0, durationInFrames], [zoom[0], zoom[1]], {...cl, easing: ease});
	return (
		<AbsoluteFill style={{backgroundColor: '#000', opacity: interpolate(frame, [0, 10], [0, 1], cl)}}>
			<AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: zoom[2]}}>
				<svg width={1920} height={1080}>
					<Sky m={mood} t={t} />
					{scene === 'prepare' ? null : extraBack}
					<Seas m={mood} t={t} />
					{scene === 'prepare' ? extraBack : null}
					<Boat x={boatX} t={t} m={mood} motorSmoke={smoke} wake={wake}>{people}</Boat>
					<SeaLayer m={mood} t={t} base={800} color={mood.sea[1]} opacity={0.9} />
					{mood.rain ? <Rain t={t} amount={mood.rain} /> : null}
					{extraFront}
					{flash > 0 ? <g><rect width={1920} height={1080} fill="#e8f0ff" opacity={flash * 0.55} /><path d="M 1300 0 L 1240 160 L 1290 170 L 1210 360 L 1250 368 L 1180 520" stroke="#fff" strokeWidth={5} fill="none" opacity={flash} /></g> : null}
				</svg>
			</AbsoluteFill>
			{mood.haze ? <AbsoluteFill style={{background: mood.haze}} /> : null}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)'}} />
			<Label />
		</AbsoluteFill>
	);
};
