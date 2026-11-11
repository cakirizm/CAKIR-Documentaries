// Illustrative character reconstructions (2D, rigged). Every scene is labelled
// on screen as an illustrative reconstruction; nothing here is presented as
// historical footage. Scenes are time-based (seconds) and work at any length.
import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoConicConformal, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import {theme} from '../../theme';
import {BEND, LEG_LEN, Look, NASSERI, Pose, PRESENT, Puppet, READ, SIT, STAND, WRITE, lerpPose, walkBob, walkPose} from './Puppet';

const ease = Easing.bezier(0.45, 0, 0.25, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const seg = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...cl, easing: ease});

const H = 430; // main character height (px)
const GROUND = 892;
const HIP_STAND = GROUND - LEG_LEN * H;
const SEAT_Y = 800;
const HIP_SIT = SEAT_Y - 6;
const STRIDE = 300; // px per full walk cycle at H

// passers-by
const LOOKS: Look[] = [
	{skin: '#c99b7c', hair: '#2a2420', jacket: '#2d3b55', jacketShade: '#24304a', shirt: '#d9d9d9', trousers: '#2b2f38', trousersShade: '#22252c', shoes: '#151515'},
	{skin: '#e0b896', hair: '#6b4a2f', jacket: '#8c3b34', jacketShade: '#743029', shirt: '#e8e0d0', trousers: '#3a3d45', trousersShade: '#2e3037', shoes: '#222', longHair: true},
	{skin: '#8d5f45', hair: '#191514', jacket: '#55634a', jacketShade: '#465240', shirt: '#cfc6b5', trousers: '#4a4a4a', trousersShade: '#3a3a3a', shoes: '#1b1b1b'},
	{skin: '#d6a985', hair: '#b9a07c', jacket: '#7a7f86', jacketShade: '#666a70', shirt: '#2f3e57', trousers: '#2a2c33', trousersShade: '#202228', shoes: '#111', longHair: true},
	{skin: '#c48c68', hair: '#3a2c22', jacket: '#3f4a5a', jacketShade: '#343e4c', shirt: '#b3a58a', trousers: '#58534b', trousersShade: '#48443d', shoes: '#1e1e1e'},
];

const Suitcase: React.FC<{hand: [number, number]; h: number; color?: string}> = ({hand, h, color = '#3b4452'}) => {
	const g = LEG_LEN * h + 0.02 * h;
	const cx = hand[0] - 0.13 * h, top = g - 0.26 * h;
	return (
		<g>
			<line x1={hand[0]} y1={hand[1]} x2={cx + 0.04 * h} y2={top} stroke="#2a2a2a" strokeWidth={0.012 * h} strokeLinecap="round" />
			<rect x={cx - 0.06 * h} y={top} width={0.13 * h} height={0.24 * h} rx={0.015 * h} fill={color} />
			<line x1={cx - 0.02 * h} y1={top + 0.02 * h} x2={cx - 0.02 * h} y2={top + 0.22 * h} stroke="rgba(0,0,0,0.25)" strokeWidth={0.006 * h} />
			<circle cx={cx - 0.04 * h} cy={g} r={0.018 * h} fill="#151515" />
			<circle cx={cx + 0.05 * h} cy={g} r={0.018 * h} fill="#151515" />
		</g>
	);
};

const Box: React.FC<{x: number; y: number; w: number; h: number; tone?: number}> = ({x, y, w, h, tone = 0}) => (
	<g>
		<rect x={x} y={y} width={w} height={h} fill={tone ? '#9a7550' : '#a98258'} stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
		<rect x={x + w * 0.45} y={y} width={w * 0.1} height={h} fill="rgba(210,190,150,0.6)" />
	</g>
);

/** Luggage trolley with stacked belongings (boxes, bags) — after the photographs. */
const Trolley: React.FC<{x: number; boxes?: number}> = ({x, boxes = 3}) => {
	const y = GROUND;
	const items = [] as React.ReactNode[];
	for (let i = 0; i < boxes; i++) {
		const w = 120 - (i % 3) * 14, hh = 62 + (i % 2) * 14;
		const by = y - 70 - (i + 1) * 66;
		items.push(<Box key={i} x={x + 12 + (i % 2) * 10} y={by} w={w} h={hh} tone={i % 2} />);
	}
	return (
		<g>
			<ellipse cx={x + 80} cy={y + 4} rx={110} ry={10} fill="rgba(0,0,0,0.3)" />
			{items}
			<path d={`M ${x + 140} ${y - 260} L ${x + 165} ${y - 70} L ${x} ${y - 70}`} stroke="#9aa1a8" strokeWidth={7} fill="none" />
			<line x1={x - 4} y1={y - 70} x2={x + 165} y2={y - 70} stroke="#8c939a" strokeWidth={9} />
			<circle cx={x + 18} cy={y - 8} r={12} fill="#1b1b1b" /><circle cx={x + 145} cy={y - 8} r={12} fill="#1b1b1b" />
			<path d={`M ${x - 40} ${y - 4} q 30 -70 70 -40 q 20 20 -10 44 z`} fill="#3f5a7a" opacity={0.95} />
			<path d={`M ${x + 150} ${y - 2} q 18 -54 60 -28 q 14 18 -6 30 z`} fill="#d8d4cb" opacity={0.95} />
		</g>
	);
};

/** Red bench after the photographs (seen from the side, back on the right). */
const Bench: React.FC<{x: number; w?: number}> = ({x, w = 300}) => (
	<g>
		<ellipse cx={x + w / 2} cy={GROUND + 6} rx={w * 0.6} ry={12} fill="rgba(0,0,0,0.3)" />
		<path d={`M ${x} ${SEAT_Y} L ${x + w} ${SEAT_Y} L ${x + w + 40} ${SEAT_Y - 24} L ${x + 40} ${SEAT_Y - 24} Z`} fill="#c4433a" />
		<rect x={x} y={SEAT_Y} width={w} height={46} rx={10} fill="#a8352e" />
		<rect x={x + w - 34} y={SEAT_Y - 170} width={52} height={216} rx={18} fill="#b23a32" />
		<rect x={x + 30} y={SEAT_Y + 40} width={14} height={GROUND - SEAT_Y - 40} fill="#2b2b2b" />
		<rect x={x + w - 44} y={SEAT_Y + 40} width={14} height={GROUND - SEAT_Y - 40} fill="#2b2b2b" />
	</g>
);

const Table: React.FC<{x: number}> = ({x}) => (
	<g>
		<ellipse cx={x} cy={GROUND + 4} rx={70} ry={9} fill="rgba(0,0,0,0.3)" />
		<rect x={x - 6} y={712} width={12} height={GROUND - 712} fill="#b23a32" />
		<ellipse cx={x} cy={GROUND - 2} rx={44} ry={8} fill="#222" />
		<ellipse cx={x} cy={712} rx={86} ry={12} fill="#1f1f22" />
	</g>
);

/** Terminal-1-like interior: concrete, slanted columns, lit shop windows. */
const Interior: React.FC<{night?: number; t: number; immigration?: boolean; board?: string}> = ({night = 0, t, immigration, board}) => {
	const vp = [960, 520];
	return (
		<g>
			<defs>
				<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={immigration ? '#5d666c' : '#6f685e'} /><stop offset="1" stopColor={immigration ? '#4b5257' : '#5b554c'} /></linearGradient>
				<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={immigration ? '#7a8084' : '#8a8378'} /><stop offset="1" stopColor={immigration ? '#4f5458' : '#55504a'} /></linearGradient>
				<linearGradient id="shop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3dcae" /><stop offset="1" stopColor="#b98d55" /></linearGradient>
			</defs>
			<rect width={1920} height={1080} fill="url(#wall)" />
			{Array.from({length: 13}, (_, i) => <line key={i} x1={i * 160} y1={0} x2={i * 160} y2={700} stroke="rgba(0,0,0,0.08)" strokeWidth={3} />)}
			<rect x={0} y={0} width={1920} height={90} fill="rgba(0,0,0,0.25)" />
			{immigration ? (
				<g>
					{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={140 + i * 360} y={120} width={220} height={18} fill="#e9eef0" opacity={0.85} />)}
					<rect x={700} y={190} width={520} height={70} fill="#1e2a38" />
					<text x={960} y={238} textAnchor="middle" fontFamily={theme.font.sans} fontWeight={600} fontSize={34} letterSpacing={8} fill="#e8edf0">ARRIVALS · PASSPORT CONTROL</text>
				</g>
			) : (
				<g>
					{[[80, 470], [620, 360], [1460, 420]].map(([x, w], i) => (
						<g key={i}>
							<rect x={x} y={360} width={w} height={340} fill="url(#shop)" opacity={1 - night * 0.75} />
							<rect x={x} y={360} width={w} height={340} fill="none" stroke="#3c3833" strokeWidth={8} />
							{Array.from({length: Math.floor(w / 90)}, (_, k) => (
								<g key={k} opacity={0.55 - night * 0.35}>
									<circle cx={x + 50 + k * 90} cy={460} r={16} fill="#6e5a43" />
									<rect x={x + 32 + k * 90} y={478} width={36} height={120} rx={14} fill={k % 2 ? '#7b3b33' : '#4d5566'} />
								</g>
							))}
							{night > 0.5 ? Array.from({length: 12}, (_, k) => <line key={k} x1={x} x2={x + w} y1={370 + k * 28} y2={370 + k * 28} stroke="#2b2a28" strokeWidth={5} opacity={(night - 0.5) * 2} />) : null}
						</g>
					))}
					{board ? (
						<g>
							<rect x={710} y={150} width={420} height={150} fill="#101214" stroke="#2c2c2c" strokeWidth={6} />
							<text x={740} y={196} fontFamily={theme.font.mono} fontSize={26} fill="#d8d2c4" letterSpacing={4}>DÉPARTS · DEPARTURES</text>
							<text x={920} y={272} textAnchor="middle" fontFamily={theme.font.mono} fontWeight={500} fontSize={70} fill={theme.color.accent} letterSpacing={18}>{board}</text>
						</g>
					) : null}
				</g>
			)}
			{/* slanted concrete columns, as in Terminal 1 */}
			{!immigration ? (
				<g>
					<path d="M 470 0 L 560 0 L 640 760 L 520 760 Z" fill="#5a544b" />
					<path d="M 1300 0 L 1380 0 L 1300 760 L 1190 760 Z" fill="#544e46" />
					<path d="M 470 0 L 500 0 L 560 760 L 520 760 Z" fill="rgba(255,255,255,0.05)" />
				</g>
			) : null}
			<rect x={0} y={700} width={1920} height={380} fill="url(#floor)" />
			{Array.from({length: 17}, (_, i) => <line key={i} x1={vp[0]} y1={vp[1]} x2={-1400 + i * 300} y2={1080} stroke="rgba(0,0,0,0.12)" strokeWidth={2} clipPath="url(#floorClip)" />)}
			<clipPath id="floorClip"><rect x={0} y={700} width={1920} height={380} /></clipPath>
			{[740, 790, 860, 960].map((y) => <line key={y} x1={0} x2={1920} y1={y} y2={y} stroke="rgba(0,0,0,0.1)" strokeWidth={2} />)}
			<rect x={0} y={700} width={1920} height={6} fill="rgba(0,0,0,0.25)" />
			{void t}
		</g>
	);
};

type Walker = {look: Look; plane: 0 | 1; dir: 1 | -1; speed: number; offset: number; suitcase?: boolean};
const WALKERS: Walker[] = [
	{look: LOOKS[0], plane: 0, dir: 1, speed: 1, offset: 0, suitcase: true},
	{look: LOOKS[1], plane: 0, dir: -1, speed: 0.9, offset: 700},
	{look: LOOKS[2], plane: 1, dir: -1, speed: 1.1, offset: 300, suitcase: true},
	{look: LOOKS[3], plane: 0, dir: 1, speed: 0.95, offset: 1300},
	{look: LOOKS[4], plane: 1, dir: 1, speed: 1.05, offset: 1100},
	{look: LOOKS[0], plane: 0, dir: -1, speed: 1, offset: 1800, suitcase: true},
];

/** Travellers crossing the hall on two depth planes. rate > 1 = timelapse. */
const Crowd: React.FC<{t: number; plane: 0 | 1; rate?: number; density?: number; night?: number}> = ({t, plane, rate = 1, density = 1, night = 0}) => {
	const h = plane === 0 ? 235 : 320;
	const g = plane === 0 ? 770 : 838;
	const out: React.ReactNode[] = [];
	WALKERS.slice(0, Math.max(1, Math.round(WALKERS.length * density))).forEach((w, i) => {
		if (w.plane !== plane) return;
		const span = 2400;
		const v = 300 * (h / H) * w.speed * rate;
		const d = (t * v + w.offset) % span;
		const x = w.dir > 0 ? -240 + d : 2160 - d;
		const ph = ((t * v) / (STRIDE * (h / H))) * Math.PI * 2;
		out.push(
			<Puppet key={i} x={x} y={g - LEG_LEN * h + walkBob(ph) * h} h={h} pose={walkPose(ph)} look={w.look} flip={w.dir < 0}
				opacity={(plane === 0 ? 0.78 : 0.92) * (1 - night * 0.35)} farProp={w.suitcase ? (hand) => <Suitcase hand={hand} h={h} color={i % 2 ? '#5b2f2b' : '#2f3a4a'} /> : undefined} />,
		);
	});
	return <g>{out}</g>;
};

const Label: React.FC<{text?: string}> = ({text = 'Illustrative reconstruction'}) => (
	<div style={{position: 'absolute', right: theme.safe.x, top: theme.safe.y + 46, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.85}}>
		<div style={{width: 8, height: 8, borderRadius: 4, border: `2px solid ${theme.color.accent}`}} />
		<div style={{fontFamily: theme.font.mono, fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(236,229,216,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.7)'}}>{text}</div>
	</div>
);

const Grade: React.FC<{night?: number}> = ({night = 0}) => (
	<>
		<AbsoluteFill style={{background: `rgba(20,30,55,${0.45 * night})`, mixBlendMode: 'multiply'}} />
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 70% at 50% 55%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)'}} />
	</>
);

// ---------- scenes ----------
const seatX = 940; // bench left edge
const hipSeatX = 1110; // seated hip (facing left)

const SeatedNasseri: React.FC<{t: number; pose: Pose; prop?: 'paper' | 'pen' | 'none'; breathe?: number}> = ({t, pose, prop = 'none', breathe}) => {
	const turn = Math.sin(t * 0.9) * 0.5 + 0.5;
	const page = (t % 4) / 4;
	return (
		<Puppet x={hipSeatX} y={HIP_SIT} h={H} flip groundY={GROUND} pose={{...pose, head: pose.head + Math.sin(t * 0.7) * 2}} breathe={breathe ?? Math.sin(t * 2.2)}
			betweenHands={prop === 'paper' ? (n, f) => {
				const cx = Math.max(n[0], f[0]) + 6, cy = Math.min(n[1], f[1]);
				const flapW = page > 0.85 ? (1 - (page - 0.85) / 0.15) : 1;
				return (
					<g>
						<path d={`M ${cx} ${cy - 0.2 * H} L ${cx + 0.05 * H * flapW} ${cy - 0.215 * H} L ${cx + 0.05 * H * flapW} ${cy + 0.03 * H} L ${cx} ${cy + 0.04 * H} Z`} fill="#e3ded2" />
						<path d={`M ${cx} ${cy - 0.2 * H} L ${cx - 0.035 * H} ${cy - 0.19 * H} L ${cx - 0.035 * H} ${cy + 0.045 * H} L ${cx} ${cy + 0.04 * H} Z`} fill="#cfc9bb" />
						{[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={cx + 0.006 * H} x2={cx + 0.044 * H * flapW} y1={cy - 0.18 * H + k * 0.03 * H} y2={cy - 0.19 * H + k * 0.03 * H} stroke="#8b867c" strokeWidth={2} />)}
					</g>
				);
			} : undefined}
			nearProp={prop === 'pen' ? (hand) => <line x1={hand[0]} y1={hand[1]} x2={hand[0] + 0.035 * H} y2={hand[1] + 0.03 * H} stroke="#151515" strokeWidth={4} strokeLinecap="round" /> : undefined}
		/>
	);
	void turn;
};

export const Reenactment: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const t = frame / fps + (shot.startAt ?? 0);
	const D = durationInFrames / fps;
	const scene: string = shot.scene;
	const fade = interpolate(frame, [0, 10], [0, 1], cl);
	const CAM: Record<string, [number, number, string]> = {
		arrival: [1.18, 1.34, '58% 72%'], read: [1.62, 1.72, '57% 70%'], write: [1.55, 1.64, '50% 70%'], organize: [1.5, 1.58, '58% 74%'],
		sleep: [1.5, 1.58, '57% 74%'], years: [1.28, 1.34, '52% 62%'], press: [1.3, 1.38, '45% 70%'], refused: [1.28, 1.36, '50% 72%'],
	};
	const [z0, z1, origin] = CAM[scene] ?? [1, 1.05, '50% 50%'];
	const cam = interpolate(frame, [0, durationInFrames], [shot.zoom0 ?? z0, shot.zoom1 ?? z1], {...cl, easing: ease});
	let night = shot.night ?? 0;
	let content: React.ReactNode = null;
	let board: string | undefined;
	let crowdRate = 1, density = 1;

	if (scene === 'arrival') {
		// walk in with a suitcase, stop, look around, turn and sit on the bench
		const tStop = 3.4, tTurn = 4.1, tSit = 4.6, tSat = 5.6;
		const walkEnd = 1230;
		const x = walkEnd - (tStop - Math.min(t, tStop)) * 300;
		const ph = ((x - (walkEnd - tStop * 300)) / STRIDE) * Math.PI * 2;
		const stopping = seg(t, tStop - 0.3, tStop + 0.2);
		const sitK = seg(t, tSit, tSat);
		const flip = t > tTurn;
		let pose = lerpPose(walkPose(ph, 1 - stopping), STAND, stopping);
		if (t > tStop && t < tTurn) pose = {...pose, head: -10 * Math.sin(((t - tStop) / (tTurn - tStop)) * Math.PI)};
		if (flip) pose = lerpPose(STAND, SIT, sitK);
		const hx = flip ? interpolate(sitK, [0, 1], [walkEnd, hipSeatX]) : x;
		const hy = flip ? interpolate(sitK, [0, 1], [HIP_STAND, HIP_SIT]) : HIP_STAND + walkBob(ph) * H * (1 - stopping);
		const caseX = t < tStop ? null : walkEnd - 0.13 * H - 60 + seg(t, tStop + 0.1, tTurn) * 210;
		content = (
			<g>
				<Bench x={seatX} />
				<Trolley x={1290} boxes={2} />
				{caseX !== null ? <g transform={`translate(${caseX},${HIP_STAND})`}><Suitcase hand={[0.13 * H + 0.04 * H, (GROUND - HIP_STAND) - 0.48 * H]} h={H} /></g> : null}
				<Puppet x={hx} y={hy} h={H} pose={pose} flip={flip} groundY={GROUND} farProp={!flip && t < tStop ? (hand) => <Suitcase hand={hand} h={H} /> : undefined} />
			</g>
		);
	} else if (scene === 'read' || scene === 'write' || scene === 'years' || scene === 'press') {
		const pose = scene === 'write' ? {...WRITE, nElbow: WRITE.nElbow + Math.sin(t * 9) * 3, nShoulder: WRITE.nShoulder + Math.sin(t * 2.3) * 3} : scene === 'press' ? SIT : READ;
		let extra: React.ReactNode = null;
		if (scene === 'years') {
			const y = Math.floor(interpolate(t, [0.5, Math.max(1, D - 0.8)], [1988, 2006], cl));
			board = String(y);
			night = 0.5 - 0.5 * Math.cos(t * 2.4);
			crowdRate = 5;
		}
		let nasseriPose: Pose = pose;
		if (scene === 'press') {
			// two journalists arrive; one photographs (flash), one takes notes
			const arrive = seg(t, 0, 2.2);
			const ph = arrive * 6 * Math.PI;
			const px = interpolate(arrive, [0, 1], [-200, 620]);
			const rx = interpolate(arrive, [0, 1], [-420, 430]);
			const raise = seg(t, 2.4, 3.0);
			const flashT = t > 3.1 ? ((t - 3.1) % 1.6) : 99;
			const flash = flashT < 0.12 ? 1 - flashT / 0.12 : 0;
			const camPose = lerpPose(arrive < 1 ? walkPose(ph) : STAND, {...STAND, lean: 6, head: 4, nShoulder: 72, nElbow: -64, fShoulder: 60, fElbow: -40}, raise);
			const notes = lerpPose(arrive < 1 ? walkPose(ph + 1) : STAND, {...STAND, head: 14, nShoulder: 40, nElbow: 60, fShoulder: 30, fElbow: 70}, seg(t, 2.3, 2.9));
			const talk = t > 3 ? Math.sin(t * 3.2) : 0;
			nasseriPose = {...SIT, head: -4 + talk * 3, nShoulder: 30 + Math.max(0, talk) * 22, nElbow: 50 + talk * 10};
			extra = (
				<g>
					<Puppet x={rx} y={HIP_STAND + 6} h={H * 0.97} pose={notes} look={LOOKS[3]} nearProp={(hand) => <rect x={hand[0] - 10} y={hand[1] - 34} width={26} height={36} fill="#efeae0" />} />
					<Puppet x={px} y={HIP_STAND} h={H} pose={camPose} look={LOOKS[2]} nearProp={(hand) => (
						<g>
							<rect x={hand[0] - 14} y={hand[1] - 26} width={46} height={32} rx={5} fill="#141414" />
							<circle cx={hand[0] + 32} cy={hand[1] - 10} r={10} fill="#2c2c2c" />
							{flash > 0 ? <circle cx={hand[0] + 6} cy={hand[1] - 34} r={30 + 60 * flash} fill="#fff" opacity={flash} /> : null}
						</g>
					)} />
					{flash > 0 ? <rect width={1920} height={1080} fill="#fff" opacity={flash * 0.28} /> : null}
				</g>
			);
		}
		const boxes = scene === 'years' ? Math.round(interpolate(t, [0.5, Math.max(1, D - 0.8)], [2, 5], cl)) : 3;
		content = (
			<g>
				<Bench x={seatX} />
				<Trolley x={1290} boxes={boxes} />
				{scene === 'write' ? <g><Table x={770} /><rect x={760} y={704} width={70} height={8} fill="#ece6da" transform="rotate(-4 790 708)" /></g> : null}
				<SeatedNasseri t={t} pose={scene === 'press' ? nasseriPose : pose} prop={scene === 'write' ? 'pen' : scene === 'press' ? 'none' : 'paper'} />
				{extra}
			</g>
		);
	} else if (scene === 'organize') {
		// lift a box from the floor onto the trolley, repeatedly
		const c = t % 4;
		const bend = c < 1 ? seg(c, 0, 1) : c < 1.6 ? 1 : c < 2.6 ? 1 - seg(c, 1.6, 2.6) : 0;
		const lift = c > 2.6 && c < 3.4 ? seg(c, 2.6, 3.2) : c >= 3.4 ? 1 - seg(c, 3.4, 4) : 0;
		const carrying = c > 1.2 && c < 3.3;
		let pose = lerpPose(STAND, BEND, bend);
		pose = lerpPose(pose, {...STAND, lean: -4, nShoulder: 150, nElbow: -10, fShoulder: 140, fElbow: -6}, lift);
		content = (
			<g>
				<Bench x={seatX - 260} />
				<Trolley x={1210} boxes={2 + (Math.floor(t / 4) % 2)} />
				{!carrying ? <Box x={1010} y={GROUND - 62} w={110} h={62} /> : null}
				<Puppet x={1080} y={HIP_STAND} h={H} pose={pose} groundY={GROUND} betweenHands={carrying ? (n, f) => <Box x={(n[0] + f[0]) / 2 - 55} y={Math.min(n[1], f[1]) - 30} w={110} h={62} /> : undefined} />
			</g>
		);
	} else if (scene === 'sleep') {
		night = 1;
		const br = Math.sin(t * 1.7);
		content = (
			<g>
				<Bench x={seatX - 60} w={420} />
				<Trolley x={1380} boxes={3} />
				<g transform={`translate(${seatX + 215},${SEAT_Y - 30}) rotate(-90)`}>
					<Puppet x={0} y={0} h={H * 0.95} flip={false} shadow={false} breathe={br}
						pose={{lean: 0, head: -10, nThigh: 10, nKnee: 16, fThigh: 6, fKnee: 12, nShoulder: 6, nElbow: 30, fShoulder: 2, fElbow: 24}} />
				</g>
				<path d={`M ${seatX + 100} ${SEAT_Y - 26 - br * 2} C ${seatX + 170} ${SEAT_Y - 66 - br * 3} ${seatX + 280} ${SEAT_Y - 70} ${seatX + 345} ${SEAT_Y - 40} L ${seatX + 348} ${SEAT_Y + 6} L ${seatX + 96} ${SEAT_Y + 6} Z`} fill="#2f4766" />
			</g>
		);
		crowdRate = 1; density = 0.35;
	} else if (scene === 'refused') {
		// at passport control: offers his paper, is turned back
		const tArrive = 2.4, tHand = 2.6, tBack = 4.0, tTurn = 4.9;
		const x0 = 300, x1 = 900;
		const walkIn = seg(t, 0, tArrive);
		const xi = interpolate(walkIn, [0, 1], [x0, x1]);
		const ph = ((xi - x0) / STRIDE) * Math.PI * 2;
		let pose: Pose = walkIn < 1 ? walkPose(ph, 1 - seg(t, tArrive - 0.3, tArrive)) : STAND;
		pose = lerpPose(pose, PRESENT, seg(t, tHand, tHand + 0.6) * (1 - seg(t, tBack, tBack + 0.5)));
		const flip = t > tTurn;
		let x = xi;
		if (flip) {
			const back = (t - tTurn) * 260;
			x = x1 - back;
			const ph2 = (back / STRIDE) * Math.PI * 2;
			pose = walkPose(ph2, seg(t, tTurn, tTurn + 0.4));
		}
		const officerShake = t > tBack - 0.6 && t < tBack + 0.8 ? Math.sin((t - tBack) * 14) * 6 : 0;
		const palm = seg(t, tBack - 0.6, tBack - 0.2) * (1 - seg(t, tBack + 0.8, tBack + 1.2));
		content = (
			<g>
				<rect x={1060} y={430} width={420} height={470} fill="#3a434b" />
				<rect x={1080} y={450} width={380} height={230} fill="rgba(170,200,215,0.25)" stroke="#2a3138" strokeWidth={8} />
				<Puppet x={1300} y={720} h={380} flip pose={{...STAND, head: officerShake, nShoulder: 20 + palm * 70, nElbow: 20 - palm * 70, fShoulder: 30, fElbow: 50}}
					look={{skin: '#d9ab8a', hair: '#4a3a2e', jacket: '#26303d', jacketShade: '#1e2731', shirt: '#dfe5ea', trousers: '#232a33', trousersShade: '#1b2128', shoes: '#111'}} shadow={false} />
				<rect x={1040} y={680} width={460} height={220} fill="#4a535b" />
				<rect x={1040} y={680} width={460} height={14} fill="#5d676f" />
				<Puppet x={x} y={HIP_STAND + walkBob(ph) * H * (1 - walkIn)} h={H} pose={pose} flip={flip}
					nearProp={!flip && t > tHand - 0.2 && t < tBack + 0.6 ? (hand) => <rect x={hand[0] - 4} y={hand[1] - 30} width={44} height={30} fill="#e7e2d6" transform={`rotate(-12 ${hand[0]} ${hand[1]})`} /> : undefined}
					farProp={(hand) => <Suitcase hand={hand} h={H} />} />
			</g>
		);
	} else if (scene === 'journey') {
		return <Journey t={t} D={D} shot={shot} />;
	}

	return (
		<AbsoluteFill style={{backgroundColor: '#000', opacity: fade}}>
			<AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: origin}}>
				<svg width={1920} height={1080} viewBox="0 0 1920 1080">
					<Interior night={night} t={t} immigration={scene === 'refused'} board={board} />
					<Crowd t={t} plane={0} rate={crowdRate} density={density} night={night} />
					{scene !== 'refused' ? <Crowd t={t + 3} plane={1} rate={crowdRate} density={scene === 'sleep' ? 0 : density} night={night} /> : null}
					{content}
				</svg>
			</AbsoluteFill>
			<Grade night={night} />
			<Label />
		</AbsoluteFill>
	);
};

const countries = feature(world as any, (world as any).objects.countries) as any;

/** Early journey: the figure walks with a suitcase while the map scrolls west. */
const Journey: React.FC<{t: number; D: number; shot: any}> = ({t, D, shot}) => {
	const {paths, P1, P2} = useMemo(() => {
		const pr = geoConicConformal().parallels([35, 55]).rotate([-25, 0]).center([0, 44]).scale(1700).translate([960, 520]);
		const gp = geoPath(pr);
		return {paths: countries.features.map((f: any) => gp(f)), P1: pr([49.3, 31.94]) as [number, number], P2: pr([4.35, 50.85]) as [number, number]};
	}, []);
	const k = interpolate(t, [0.3, Math.max(1, D - 0.5)], [0, 1], {...cl, easing: ease});
	const pan = interpolate(k, [0, 1], [960 - P1[0], 960 - P2[0]]);
	const panY = interpolate(k, [0, 1], [420 - P1[1], 420 - P2[1]]);
	const ph = (t * 300 / STRIDE) * Math.PI * 2;
	const routeLen = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]);
	return (
		<AbsoluteFill style={{backgroundColor: theme.color.bg}}>
			<svg width={1920} height={1080}>
				<g transform={`translate(${pan},${panY})`}>
					{paths.map((d: string | null, i: number) => (d ? <path key={i} d={d} fill="#2a333d" stroke="rgba(236,229,216,0.35)" strokeWidth={1.6} /> : null))}
					<line x1={P1[0]} y1={P1[1]} x2={P1[0] + (P2[0] - P1[0]) * k} y2={P1[1] + (P2[1] - P1[1]) * k} stroke={theme.color.accent} strokeWidth={4} strokeDasharray={`${routeLen}`} />
					{[[P1, shot.from_ ?? 'Iran'], [P2, shot.to ?? 'Belgium']].map(([p, name]: any, i) => (
						<g key={i}>
							<circle cx={p[0]} cy={p[1]} r={9} fill={theme.color.accent} />
							<text x={p[0] + 18} y={p[1] - 14} fill={theme.color.ink} fontFamily={theme.font.sans} fontSize={32}>{name}</text>
						</g>
					))}
				</g>
				<rect x={0} y={780} width={1920} height={300} fill="rgba(13,16,20,0.75)" />
				<line x1={0} x2={1920} y1={GROUND - 30} y2={GROUND - 30} stroke="rgba(236,229,216,0.25)" strokeWidth={2} />
				<g transform="translate(0,-30)">
					<Puppet x={760} y={HIP_STAND + walkBob(ph) * 380} h={380} pose={walkPose(ph)} flip farProp={(hand) => <Suitcase hand={hand} h={380} />} />
				</g>
			</svg>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)'}} />
			<Label />
		</AbsoluteFill>
	);
};
