/* The 19 scenes of "Yedi İneğin Sırrı". Each scene gets its local frame
 * `f` and duration `D` (frames). Hz. Yusuf is never shown from the front;
 * the faceless figures are deliberate. */
import React from 'react';
import {Stage} from './Stage';
import {Cam, Cow, Ear, Grass, Ground, Person, Rain, Sheaf, WheatField, PAL, hash, lerp, mixColor, range, smooth, clamp01} from './Kit';
import {Bedchamber, Brazier, Canals, Granary, Hall, Label3D, NightSky, PalaceExterior, Prison, Ripples, Vortex, YearBlocks} from './Sets';

type S = React.FC<{f: number; D: number}>;
const V3 = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/* piecewise camera path through keyframes [t, pos, target] */
const path = (t: number, keys: [number, [number, number, number], [number, number, number]][]) => {
	let i = 0;
	while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
	const [t0, p0, q0] = keys[i], [t1, p1, q1] = keys[i + 1];
	const u = smooth((t - t0) / Math.max(1e-6, t1 - t0));
	return {pos: V3(p0, p1, u), target: V3(q0, q1, u)};
};
const KING_ROBE = '#2f3f66';
const COWX = (i: number) => -1.3 + (i % 2) * 1.5 + i * 0.12;
const COWZ = (i: number) => 2.2 - i * 1.55;
const KING_CROWN = '#c9a042';

/* ===== 1. the night the king wakes ===== */
const Night: S = ({f, D}) => {
	const t = f / D;
	const inside = t > 0.55;
	const c = inside
		? path((t - 0.55) / 0.45, [[0, [3.2, 2.4, -6.5], [0, 0.9, -12]], [1, [2.2, 1.7, -9.2], [0, 1.1, -12]]])
		: path(t / 0.55, [[0, [0, 2.2, 24], [0, 3, 0]], [1, [0, 2.0, -3], [0, 2.4, -10]]]);
	const sit = range(f, D * 0.68, D * 0.9);
	return (
		<Stage bg={PAL.night} fog={[16, 90]} sun={{pos: [-14, 22, -10], color: '#9fb4e0', intensity: 1.1}} fill={{color: '#4a5a80', intensity: 0.35}} ambient={0.12}>
			<Cam pos={c.pos} target={c.target} fov={44} />
			{inside ? (
				<>
					<Bedchamber frame={f} />
					{/* the king, lying then sitting up (seen from the side, face turned away) */}
					<group position={[0, 0.82, -12.4 + 1.2]} rotation={[lerp(-Math.PI / 2, -0.15, sit), Math.PI, 0]}>
						<Person position={[0, -0.6 * (1 - sit), 0]} robe={KING_ROBE} headdress={KING_CROWN} sit={0.6} scale={0.9} />
					</group>
				</>
			) : (
				<>
					<NightSky />
					<PalaceExterior frame={f} />
				</>
			)}
		</Stage>
	);
};

/* ===== 2. seven fat cows ===== */
const FatCows: S = ({f, D}) => {
	const rise = range(f, D * 0.55, D);
	return (
		<Stage bg="#c3c8b0" fog={[8, 48]} sun={{pos: [-10, 12, 8], color: '#fff3d6', intensity: 2.1}} fill={{color: '#d6dfc4', intensity: 0.8}} ambient={0.3}>
			<Cam pos={[lerp(-3.2, 2.5, rise), lerp(1.3, 11, rise), lerp(9, 10, rise)]} target={[lerp(-0.6, 0.2, rise), lerp(0.9, 0, rise), lerp(-1, -3, rise)]} fov={48} />
			<Ground color="#58803c" />
			<Grass frame={f} count={6000} height={0.24} />
			{Array.from({length: 7}, (_, i) => {
				const enter = 6 + i * (D * 0.07);
				const p = range(f, enter, enter + D * 0.35);
				const x = lerp(-13, COWX(i), p);
				return <Cow key={i} position={[x, 0, COWZ(i)]} fat={1} walk={f * 0.17 + i * 1.3} stride={1 - p * 0.8} headDown={p > 0.95 ? 0.4 * (0.5 + 0.5 * Math.sin(f * 0.05 + i)) : 0} />;
			})}
		</Stage>
	);
};

/* ===== 3. seven thin cows, the fat ones vanish into a swirl ===== */
const ThinCows: S = ({f, D}) => {
	const dark = range(f, 0, D * 0.35);
	const swallow = range(f, D * 0.5, D * 0.95);
	const bg = mixColor('#c3c8b0', '#4a4136', dark);
	return (
		<Stage bg={bg} fog={[8, lerp(48, 30, dark)]} sun={{pos: [-10, 12, 8], color: mixColor('#fff3d6', '#c9a27a', dark), intensity: lerp(2.1, 1.7, dark)}} fill={{color: '#9a9580', intensity: lerp(0.8, 0.5, dark)}} ambient={lerp(0.3, 0.2, dark)}>
			<Cam pos={[lerp(2.5, 3.5, swallow), lerp(11, 7, swallow), lerp(10, 9, swallow)]} target={[0.6, 0, -3]} fov={48} />
			<Ground color={mixColor('#58803c', '#8a6d48', dark)} cracks={dark * 0.8} />
			<Grass frame={f} count={6000} height={lerp(0.24, 0.1, dark)} color={mixColor(PAL.green, '#8d7a52', dark)} />
			{Array.from({length: 7}, (_, i) => {
				const x = COWX(i), z = COWZ(i);
				const s = lerp(1, 0.05, smooth(clamp01((swallow - i * 0.04) * 1.3)));
				return <Cow key={i} position={[x, -0.4 * (1 - s), z]} fat={1} walk={i} stride={0} scale={s} opacity={s < 0.98 ? s : 1} />;
			})}
			<Vortex position={[-0.4, 0.03, -2.5]} radius={6.5} frame={f} opacity={swallow * 0.9} />
			{Array.from({length: 7}, (_, i) => {
				const p = range(f, D * 0.12 + i * D * 0.03, D * 0.55 + i * D * 0.03);
				return <Cow key={i} position={[COWX(i) + 2.6, 0, lerp(-22, COWZ(i) - 0.8, p)]} rotY={-Math.PI / 2} fat={0} walk={f * 0.14 + i} stride={1 - p * 0.6} opacity={clamp01(p * 3)} />;
			})}
		</Stage>
	);
};

/* ===== 4. seven green and seven dry ears ===== */
const Ears: S = ({f, D}) => {
	const c = path(f / D, [[0, [-3.2, 1.5, 4.8], [0, 1.4, 0]], [1, [3.2, 1.9, 4.6], [0, 1.4, -0.3]]]);
	return (
		<Stage bg="#120e0b" fog={[6, 26]} sun={{pos: [4, 9, 6], color: '#ffe7bf', intensity: 2.6}} fill={{color: '#584430', intensity: 0.3}} ambient={0.08}>
			<Cam pos={c.pos} target={c.target} fov={40} />
			<Ground color="#2a211a" />
			{Array.from({length: 7}, (_, i) => {
				const g = range(f, 10 + i * 6, 70 + i * 6);
				return <Ear key={i} position={[-1.6 + i * 0.53, 0, 0.7 + (i % 2) * 0.2]} height={2.0 * g + 0.01} sway={Math.sin(f * 0.05 + i) * 0.05} scale={1.1} />;
			})}
			{Array.from({length: 7}, (_, i) => {
				const g = range(f, D * 0.35 + i * 6, D * 0.35 + 60 + i * 6);
				return <Ear key={i} position={[-1.6 + i * 0.53, 0, -0.9 + (i % 2) * 0.2]} height={2.0 * g + 0.01} dry={1} droop={0.35 + hash(i) * 0.25} sway={Math.sin(f * 0.03 + i) * 0.02} scale={1.05} />;
			})}
		</Stage>
	);
};

/* ===== Ayah 43: the hall, dream symbols floating among the pillars ===== */
const HallDream: S = ({f, D}) => {
	const t = f / D;
	const c = path(t, [
		[0, [0, 2.2, 3], [0, 1.8, -12]],
		[0.16, [1.6, 2.3, -6], [0, 1.8, -12]],
		[0.36, [-2.2, 2.6, -4.5], [0.5, 3.2, -8]],
		[0.6, [2.4, 2.4, -5], [-0.5, 3.0, -9]],
		[0.82, [0, 3.4, -1], [0, 1.6, -10]],
		[1, [0, 4.2, 2.5], [0, 1.5, -10]],
	]);
	const ghost = range(f, D * 0.12, D * 0.22) * (1 - range(f, D * 0.9, D));
	const advisors = range(f, D * 0.6, D * 0.75);
	return (
		<Stage bg="#120d0a" fog={[10, 34]} sun={{pos: [-6, 14, 6], color: '#ffd9a0', intensity: 0.7}} fill={{color: '#6a5034', intensity: 0.3}} ambient={0.12}>
			<Cam pos={c.pos} target={c.target} fov={46} />
			<Hall frame={f} />
			<Person position={[0, 0.7, -12.9]} rotY={Math.PI / 2} robe={KING_ROBE} headdress={KING_CROWN} sit={1} armRaise={0.25 + 0.15 * Math.sin(f * 0.03)} />
			{Array.from({length: 6}, (_, i) => (
				<Person key={i} position={[(i % 2 ? 1 : -1) * (1.3 + Math.floor(i / 2) * 0.55), 0, -9.6 + Math.floor(i / 2) * 1.1]} rotY={(i % 2 ? -1 : 1) * 0.3 - Math.PI / 2} robe={i % 3 ? '#cdbf9f' : '#a99572'} headdress={i % 2 ? '#e8e0cc' : null} opacity={advisors} />
			))}
			{/* dream symbols, translucent and slowly orbiting */}
			<group position={[0, 3.2, -8]} rotation={[0, f * 0.004, 0]}>
				{Array.from({length: 7}, (_, i) => {
					const a = (i / 7) * Math.PI * 2;
					return <Cow key={'f' + i} position={[Math.cos(a) * 2.4, 0.35 + Math.sin(f * 0.03 + i) * 0.1, Math.sin(a) * 2.4]} rotY={-a} fat={1} walk={f * 0.08 + i} stride={0.4} ghost opacity={ghost} scale={0.55} />;
				})}
				{Array.from({length: 7}, (_, i) => {
					const a = (i / 7) * Math.PI * 2 + 0.45;
					return <Cow key={'t' + i} position={[Math.cos(a) * 1.4, -1.2 + Math.sin(f * 0.03 + i) * 0.1, Math.sin(a) * 1.4]} rotY={-a} fat={0} walk={f * 0.08 + i} stride={0.4} ghost opacity={ghost * range(f, D * 0.25, D * 0.32)} scale={0.5} />;
				})}
				{Array.from({length: 14}, (_, i) => {
					const a = (i / 14) * Math.PI * 2;
					return <Ear key={'e' + i} position={[Math.cos(a) * 3.3, 1.4, Math.sin(a) * 3.3]} height={0.8} dry={i % 2} droop={i % 2 ? 0.3 : 0} opacity={ghost * range(f, D * 0.36, D * 0.45) * 0.6} scale={0.9} />;
				})}
			</group>
		</Stage>
	);
};

/* ===== 5. the council cannot interpret ===== */
const Council: S = ({f, D}) => {
	const c = path(f / D, [[0, [0, 5.5, 4], [0, 1.6, -10]], [1, [-1.6, 3.2, -3.5], [0, 1.6, -11]]]);
	const holo = range(f, D * 0.15, D * 0.3) * (1 - range(f, D * 0.55, D * 0.75));
	return (
		<Stage bg="#120d0a" fog={[10, 36]} sun={{pos: [-6, 14, 6], color: '#ffd9a0', intensity: 0.8}} fill={{color: '#6a5034', intensity: 0.3}} ambient={0.12}>
			<Cam pos={c.pos} target={c.target} fov={46} />
			<Hall frame={f} />
			<Person position={[0, 0.7, -12.9]} rotY={Math.PI / 2} robe={KING_ROBE} headdress={KING_CROWN} sit={1} />
			{Array.from({length: 6}, (_, i) => {
				const side = i % 2 ? 1 : -1;
				const turn = Math.sin(f * 0.04 + i * 1.7) * 0.6 * range(f, D * 0.3, D * 0.45);
				return <Person key={i} position={[side * (1.3 + Math.floor(i / 2) * 0.55), 0, -9.6 + Math.floor(i / 2) * 1.1]} rotY={side * 0.3 - Math.PI / 2} headTurn={turn} robe={i % 3 ? '#cdbf9f' : '#a99572'} headdress={i % 2 ? '#e8e0cc' : null} armRaise={i === 2 ? 0.3 * range(f, D * 0.4, D * 0.5) : 0} />;
			})}
			<group position={[0, 3.3, -9]} rotation={[0, f * 0.01, 0]}>
				{Array.from({length: 4}, (_, i) => (
					<Cow key={i} position={[Math.cos(i * 1.57) * 1.3, Math.sin(f * 0.05 + i) * 0.2, Math.sin(i * 1.57) * 1.3]} fat={i % 2 ? 0 : 1} ghost opacity={holo * (0.6 + 0.4 * Math.sin(f * 0.3 + i))} scale={0.45} rotY={i} />
				))}
			</group>
		</Stage>
	);
};

/* ===== 6. the freed man remembers -> prison corridor ===== */
const Remember: S = ({f, D}) => {
	const t = f / D;
	const memory = t > 0.5;
	if (!memory) {
		const c = path(t / 0.5, [[0, [3.5, 2.2, -2], [1.6, 1.5, -6]], [1, [2.35, 1.52, -5.0], [1.6, 1.5, -6.2]]]);
		return (
			<Stage bg="#120d0a" fog={[8, 30]} sun={{pos: [-6, 14, 6], color: '#ffd9a0', intensity: 0.7}} fill={{color: '#6a5034', intensity: 0.3}} ambient={0.12}>
				<Cam pos={c.pos} target={c.target} fov={40} />
				<Hall frame={f} />
				<Person position={[1.6, 0, -6.4]} rotY={Math.PI * 0.75} robe="#b8a27c" headdress="#e8e0cc" headTurn={Math.sin(f * 0.02) * 0.15} />
			</Stage>
		);
	}
	const u = (t - 0.5) / 0.5;
	return (
		<Stage bg="#0d0a08" fog={[4, 22]} sun={{pos: [2, 8, 4], color: '#c9a77a', intensity: 0.35}} fill={{color: '#3b2e22', intensity: 0.25}} ambient={0.08}>
			<Cam pos={[0, 1.6, lerp(10, 2, u)]} target={[0, 1.4, -6]} fov={48} />
			<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[6, 40]} />
				<meshStandardMaterial color="#3a3027" roughness={0.95} />
			</mesh>
			{[-1.6, 1.6].map((x) => (
				<mesh key={x} position={[x, 2, 0]} receiveShadow>
					<boxGeometry args={[0.4, 4, 40]} />
					<meshStandardMaterial color="#5a4c3f" roughness={0.95} />
				</mesh>
			))}
			{Array.from({length: 5}, (_, i) => (
				<Brazier key={i} position={[i % 2 ? 1.2 : -1.2, 0.6, 6 - i * 5]} frame={f} seed={i} light={2.5} />
			))}
		</Stage>
	);
};

/* ===== 7. the answer in the prison ===== */
const PrisonScene: S = ({f, D}) => {
	const door = range(f, D * 0.05, D * 0.22);
	const walkIn = range(f, D * 0.15, D * 0.45);
	const timeline = range(f, D * 0.6, D * 0.95);
	const c = path(f / D, [[0, [-3.4, 3.0, 5.6], [0.8, 1.2, -1]], [0.55, [-2.8, 2.6, 4.4], [0.9, 1.1, -1.2]], [1, [-2.4, 2.3, 3.9], [0.9, 0.9, -1.2]]]);
	return (
		<Stage bg="#0d0a08" fog={[8, 30]} sun={{pos: [2, 9, -2], color: '#d8b47e', intensity: 0.5}} fill={{color: '#5b4632', intensity: 0.45}} ambient={0.18}>
			<Cam pos={c.pos} target={c.target} fov={46} />
			<Prison frame={f} door={door} />
			{/* Yusuf: seated, seen only from behind */}
			<Person position={[-0.6, 0, 0.9]} rotY={-Math.PI / 2 + 0.25} robe="#e1d6bf" head="#3d2a1d" headdress="#efe8d8" sit={1} armRaise={0.25 * range(f, D * 0.6, D * 0.7)} />
			{/* the visitor */}
			<Person position={[lerp(5.2, 1.6, walkIn), 0, lerp(1.6, -0.6, walkIn)]} rotY={Math.PI - 0.6} robe="#b8a27c" headdress="#e8e0cc" armSwing={walkIn < 1 ? f * 0.25 : 0} armRaise={walkIn >= 1 ? 0.3 + 0.2 * Math.sin(f * 0.1) : 0} />
			{/* golden 7-part timeline forming in the foreground */}
			<group position={[-0.2, 0.15, 2.0]} scale={0.3}>
				<YearBlocks n={7} lit={(i) => range(timeline * 7, i, i + 1)} color={() => PAL.gold} labels={false} />
			</group>
		</Stage>
	);
};

/* field cycle helpers: year index & phase within a year */
const yearPhase = (t: number, years = 7) => {
	const y = Math.min(years - 1, Math.floor(t * years));
	return {y, p: t * years - y};
};

/* ===== Ayah 47: seven years of sowing & harvest, stores grow ===== */
const Harvest7: S = ({f, D}) => {
	const t = clamp01(f / D);
	const {y, p} = yearPhase(t);
	const growth = smooth(clamp01(p / 0.55));
	const ripe = smooth(clamp01((p - 0.35) / 0.25));
	const cut = smooth(clamp01((p - 0.7) / 0.25));
	const stored = (y + cut) / 7;
	const sun = range(f, 0, 60);
	return (
		<Stage bg={mixColor('#2b2420', '#d8c49a', sun)} fog={[18, 70]} sun={{pos: [lerp(-20, -9, sun), lerp(2, 14, sun), 6], color: '#ffe1a6', intensity: lerp(0.6, 2.4, sun)}} fill={{color: '#c9b08a', intensity: 0.6}} ambient={0.25}>
			<Cam pos={[lerp(-9, -6, t), lerp(6, 7.5, t), lerp(14, 12, t)]} target={[0, 0.5, -2]} fov={44} />
			<Ground color="#7d6040" />
			<WheatField frame={f} w={22} d={14} center={[-2, 0, -4]} growth={growth} ripe={ripe} cut={cut} count={3200} />
			{/* storehouse: sheaves accumulate year by year */}
			<group position={[8, 0, -1]}>
				<Granary fill={stored * 0.92} w={3} h={3.6} d={3} />
			</group>
			{/* 3D timeline 1..7 */}
			<group position={[-1, 0.05, 4.2]} scale={0.8}>
				<YearBlocks n={7} lit={(i) => (i < y ? 1 : i === y ? clamp01(p * 1.4) : 0)} color={() => '#8db04a'} />
			</group>
		</Stage>
	);
};

/* ===== 8. the first seven years: farmers at work ===== */
const Fields: S = ({f, D}) => {
	const t = f / D;
	return (
		<Stage bg="#d8c49a" fog={[16, 70]} sun={{pos: [-9, 14, 6], color: '#ffe1a6', intensity: 2.4}} fill={{color: '#c9b08a', intensity: 0.6}} ambient={0.25}>
			<Cam pos={[lerp(-8, 4, t), lerp(3.2, 4.2, t), 9]} target={[lerp(-6, 6, t), 0.8, -2]} fov={44} />
			<Ground color="#7d6040" />
			<WheatField frame={f} w={34} d={18} center={[0, 0, -4]} growth={1} ripe={0.85} cut={0} count={4200} />
			{Array.from({length: 5}, (_, i) => (
				<Person key={i} position={[-10 + i * 4.5, 0, 1.2 + (i % 2) * 0.8]} rotY={-Math.PI / 2 + 0.4} bend={0.55 + 0.1 * Math.sin(f * 0.12 + i)} armRaise={0.4 + 0.3 * Math.sin(f * 0.12 + i)} robe={i % 2 ? '#d8cdb8' : '#c4b08b'} headdress={i % 2 ? '#efe8d8' : null} />
			))}
			{Array.from({length: 6}, (_, i) => (
				<Sheaf key={i} position={[-9 + i * 3.6, 0, 3 + (i % 2) * 0.6]} rot={i} />
			))}
		</Stage>
	);
};

/* ===== 9. eat a little, store the rest in the ear ===== */
const Store: S = ({f, D}) => {
	const t = f / D;
	const pull = range(f, D * 0.3, D * 0.7);
	return (
		<Stage bg="#2a211a" fog={[10, 40]} sun={{pos: [-6, 12, 8], color: '#ffe1a6', intensity: 2.2}} fill={{color: '#8a6e4c', intensity: 0.5}} ambient={0.2}>
			<Cam pos={[lerp(-0.3, 0.3, pull), lerp(2.0, 4.6, pull), lerp(3.4, 10.5, pull)]} target={[lerp(-0.8, 0, pull), lerp(1.9, 1.4, pull), lerp(1, -2, pull)]} fov={42} />
			<Ground color="#5c4632" />
			<Ear position={[-0.8, 0, 1]} height={1.8} ripe={1} sway={Math.sin(f * 0.04) * 0.04} scale={1.2} />
			{/* small portion eaten */}
			<group position={[-1.9, 0, -2.4]}>
				{Array.from({length: 2}, (_, i) => (
					<Sheaf key={i} position={[i * 0.6, 0, 0]} scale={0.8} />
				))}
				<Label3D text="az" position={[0.3, 1.8, 0]} size={0.9} opacity={range(f, D * 0.55, D * 0.7)} />
			</group>
			{/* large portion stored, cut-away granary filling with ears */}
			<group position={[1.3, 0, -3.2]}>
				<Granary fill={0.2 + 0.7 * range(f, D * 0.45, D)} w={2.4} h={3.4} d={2.4} />
				<Label3D text="çok" position={[0, 4.2, 0]} size={1.1} opacity={range(f, D * 0.55, D * 0.7)} />
			</group>
			{t > 0 ? null : null}
		</Stage>
	);
};

/* ===== Ayah 48: seven hard years, fields dry, stores decline ===== */
const Drought7: S = ({f, D}) => {
	const t = clamp01(f / D);
	const {y, p} = yearPhase(t);
	const dry = smooth(clamp01(t * 1.6));
	const store = lerp(0.92, 0.14, smooth(t));
	return (
		<Stage bg={mixColor('#d8c49a', '#c79a62', dry)} fog={[16, 60]} sun={{pos: [-9, 16, 6], color: mixColor('#ffe1a6', '#ffc27a', dry), intensity: 2.6}} fill={{color: '#c99a62', intensity: 0.6}} ambient={0.25}>
			<Cam pos={[lerp(-7, -4, t) + Math.sin(f * 0.2) * 0.02 * dry, lerp(7, 6, t), lerp(13, 11, t)]} target={[0, 0.4, -2]} fov={44} />
			<Ground color={mixColor('#7d6040', '#a67c4c', dry)} cracks={dry} />
			<Canals width={lerp(1.4, 0.08, dry)} />
			<WheatField frame={f} w={22} d={14} center={[-2, 0, -4]} growth={lerp(1, 0.55, dry)} ripe={1} dry={dry} count={2600} />
			<group position={[8, 0, -1]}>
				<Granary fill={store} w={3} h={3.6} d={3} />
			</group>
			<group position={[-1, 0.05, 4.2]} scale={0.8}>
				<YearBlocks n={7} lit={(i) => (i < y ? 1 : i === y ? clamp01(p * 1.4) : 0)} color={() => '#b5452f'} />
			</group>
		</Stage>
	);
};

/* ===== 10. the land changes ===== */
const Drying: S = ({f, D}) => {
	const t = f / D;
	const dry = 0.65 + 0.35 * t;
	return (
		<Stage bg={mixColor('#d8c49a', '#c79a62', dry)} fog={[14, 60]} sun={{pos: [-9, 16, 6], color: '#ffc27a', intensity: 2.6}} fill={{color: '#c99a62', intensity: 0.6}} ambient={0.25}>
			<Cam pos={[lerp(-6, 6, t), 3.6, 8 + Math.sin(f * 0.25) * 0.015]} target={[lerp(-4, 4, t), 0.6, -3]} fov={46} />
			<Ground color="#a67c4c" cracks={1} />
			<Canals width={lerp(0.4, 0.04, t)} />
			<WheatField frame={f} w={34} d={18} center={[0, 0, -4]} growth={0.5} ripe={1} dry={dry} count={3000} />
			<group position={[0, 0.05, 3.2]} scale={0.7}>
				<YearBlocks n={7} lit={(i) => range(f, D * 0.15 + i * D * 0.09, D * 0.15 + i * D * 0.09 + 12)} color={() => '#b5452f'} />
			</group>
		</Stage>
	);
};

/* ===== 11. the store is drawn down, never to zero ===== */
const Silo: S = ({f, D}) => {
	const t = clamp01(f / D);
	const up = smooth(clamp01(t / 0.45));
	const down = smooth(clamp01((t - 0.5) / 0.45));
	const fill = lerp(0.05, 0.95, up) - lerp(0, 0.8, down);
	return (
		<Stage bg="#c79a62" fog={[14, 50]} sun={{pos: [-8, 14, 8], color: '#ffd9a0', intensity: 2.4}} fill={{color: '#c99a62', intensity: 0.6}} ambient={0.25}>
			<Cam pos={[lerp(5, -4, t), 8, 21]} target={[0, 2.2, 0]} fov={44} />
			<Ground color="#a67c4c" cracks={1} />
			<Granary fill={fill} w={4.2} h={5.2} d={4.2} />
			<group position={[0, 0.05, 3.6]} scale={0.48}>
				<YearBlocks n={14} gap={1.1} lit={(i) => (i < 7 ? range(t, i / 7 * 0.45, (i + 1) / 7 * 0.45) : range(t, 0.5 + (i - 7) / 7 * 0.45, 0.5 + (i - 6) / 7 * 0.45))} color={(i) => (i < 7 ? '#8db04a' : '#b5452f')} labels={false} />
			</group>
		</Stage>
	);
};

/* ===== 12. the 14-year plan ===== */
const Timeline14: S = ({f, D}) => {
	const t = clamp01(f / D);
	const x = lerp(-7, 7, smooth(t));
	return (
		<Stage bg="#1a140f" fog={[10, 40]} sun={{pos: [-6, 12, 10], color: '#ffe1a6', intensity: 2}} fill={{color: '#6a5034', intensity: 0.4}} ambient={0.15}>
			<Cam pos={[x, 7, 13]} target={[x, 1.2, -0.6]} fov={46} />
			<Ground color="#2f251c" />
			{/* left: green earth, right: dry earth */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.1, 0.01, 0]}>
				<planeGeometry args={[8.2, 4]} />
				<meshStandardMaterial color="#3f5f2c" roughness={0.95} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.1, 0.01, 0]}>
				<planeGeometry args={[8.2, 4]} />
				<meshStandardMaterial color="#8a6a44" roughness={0.95} />
			</mesh>
			<YearBlocks n={14} gap={1.17} position={[0, 0.02, 0]} lit={(i) => range(f, 10 + i * (D * 0.05), 22 + i * (D * 0.05))} color={(i) => (i < 7 ? '#8db04a' : '#b5452f')} />
			{/* store level bars rising then falling */}
			{Array.from({length: 14}, (_, i) => {
				const level = i < 7 ? (i + 1) / 7 : 1 - ((i - 6) / 7) * 0.85;
				const on = range(f, 10 + i * (D * 0.05), 30 + i * (D * 0.05));
				return (
					<mesh key={i} position={[(i - 6.5) * 1.17, 2.2 + level * on * 1.1, -1.4]} castShadow>
						<boxGeometry args={[0.5, Math.max(0.01, level * on * 2.2), 0.5]} />
						<meshStandardMaterial color={PAL.wheat} roughness={0.7} />
					</mesh>
				);
			})}
		</Stage>
	);
};

/* ===== Ayah 49: the year of rain ===== */
const Rainfall: S = ({f, D}) => {
	const t = clamp01(f / D);
	const drop = range(f, 10, 55);
	const rain = range(f, D * 0.3, D * 0.5);
	const wet = range(f, D * 0.32, D * 0.75);
	const sprout = range(f, D * 0.7, D);
	const bright = range(f, D * 0.45, D);
	return (
		<Stage bg={mixColor('#5a4f45', '#9db0b8', bright)} fog={[10, 50]} sun={{pos: [-6, 14, 6], color: mixColor('#c9b49a', '#fff3d6', bright), intensity: lerp(0.8, 2.2, bright)}} fill={{color: '#9aa8b0', intensity: 0.6}} ambient={0.25}>
			<Cam pos={[lerp(0.4, -3, t), lerp(1.2, 5, smooth(t)), lerp(3.2, 11, smooth(t))]} target={[0, lerp(0.3, 0.5, t), lerp(0, -2, t)]} fov={44} />
			<Ground color="#a67c4c" cracks={1} wet={wet} />
			{/* the first single drop */}
			{f < 60 ? (
				<mesh position={[0, lerp(5, 0.05, drop), 0]} scale={[1, 1.4, 1]}>
					<sphereGeometry args={[0.06, 12, 10]} />
					<meshStandardMaterial color="#d9ecf5" roughness={0.05} metalness={0.2} />
				</mesh>
			) : null}
			<Ripples position={[0, 0.02, 0]} t={(f - 55) / 45} />
			<Rain frame={f} amount={rain} />
			{/* little streams forming */}
			{[-3, 1.5, 4.5].map((x, i) => (
				<mesh key={i} rotation={[-Math.PI / 2, 0, 0.3 * (i - 1)]} position={[x, 0.025, -3]}>
					<planeGeometry args={[0.18 + wet * 0.25, 30 * wet + 0.01]} />
					<meshStandardMaterial color="#6f99ad" roughness={0.1} transparent opacity={wet} />
				</mesh>
			))}
			<Grass frame={f} count={2500} height={0.18 * sprout + 0.001} color="#6f9e43" w={30} d={30} />
		</Stage>
	);
};

/* ===== 13. a single drop, close ===== */
const Raindrop: S = ({f, D}) => {
	const fall = range(f, 0, 40);
	const rain = range(f, D * 0.45, D * 0.8);
	return (
		<Stage bg="#7d8b90" fog={[5, 30]} sun={{pos: [-4, 10, 6], color: '#e9eef0', intensity: 1.5}} fill={{color: '#9aa8b0', intensity: 0.6}} ambient={0.3}>
			<Cam pos={[0.9, 0.55, 1.8]} target={[0, 0.1, 0]} fov={36} />
			<Ground color="#8c6a43" cracks={1} wet={range(f, 40, D)} />
			{fall < 1 ? (
				<mesh position={[0, lerp(2.2, 0.06, fall), 0]} scale={[1, 1.35, 1]}>
					<sphereGeometry args={[0.07, 14, 12]} />
					<meshStandardMaterial color="#d9ecf5" roughness={0.05} metalness={0.2} />
				</mesh>
			) : null}
			<Ripples position={[0, 0.02, 0]} t={(f - 40) / 30} count={4} />
			<Rain frame={f} amount={rain * 0.6} area={6} top={4} len={0.14} />
		</Stage>
	);
};

/* ===== 14. the land comes back to life; pressing ===== */
const Revival: S = ({f, D}) => {
	const t = clamp01(f / D);
	const g = range(f, 0, D * 0.4);
	const c = path(t, [[0, [0, 1.2, 4], [0, 0.4, 0]], [0.45, [-2, 3.5, 9], [0, 0.8, -1]], [1, [3, 2.6, 6.5], [5, 1, 0]]]);
	return (
		<Stage bg="#cfd9c4" fog={[14, 60]} sun={{pos: [-8, 14, 8], color: '#fff1cf', intensity: 2.4}} fill={{color: '#d6dfc4', intensity: 0.7}} ambient={0.3}>
			<Cam pos={c.pos} target={c.target} fov={44} />
			<Ground color={mixColor('#6d5a40', '#5d7f3b', g)} />
			<WheatField frame={f} w={26} d={16} center={[-3, 0, -5]} growth={g} ripe={range(f, D * 0.3, D * 0.6)} count={3200} />
			{/* grape treading vat */}
			<group position={[4.5, 0, 0]}>
				<mesh castShadow position={[0, 0.35, 0]}>
					<cylinderGeometry args={[0.9, 0.95, 0.7, 20, 1, true]} />
					<meshStandardMaterial color="#7a5a3a" roughness={0.9} side={2} />
				</mesh>
				<mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
					<circleGeometry args={[0.88, 20]} />
					<meshStandardMaterial color="#5b2440" roughness={0.6} />
				</mesh>
				<Person position={[0, 0.5 + Math.abs(Math.sin(f * 0.15)) * 0.12, 0]} rotY={-0.6} armSwing={f * 0.15} robe="#d8cdb8" headdress="#efe8d8" scale={0.9} />
			</group>
			{/* olive press: rotating stone wheel */}
			<group position={[7.5, 0, -1.5]}>
				<mesh position={[0, 0.3, 0]} castShadow>
					<cylinderGeometry args={[1, 1.05, 0.6, 24]} />
					<meshStandardMaterial color="#9c8664" roughness={0.95} />
				</mesh>
				<group rotation={[0, f * 0.03, 0]}>
					<mesh position={[0.45, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
						<cylinderGeometry args={[0.38, 0.38, 0.22, 20]} />
						<meshStandardMaterial color="#b9a27f" roughness={0.95} />
					</mesh>
				</group>
				<Person position={[1.6, 0, 0.4]} rotY={Math.PI + f * 0.0} armRaise={0.5} bend={0.2} robe="#c4b08b" scale={0.9} />
			</group>
		</Stage>
	);
};

/* ===== 15. finale: dry and green halves merge ===== */
const Finale: S = ({f, D}) => {
	const merge = range(f, D * 0.35, D * 0.7);
	const ears = range(f, D * 0.08, D * 0.3);
	return (
		<Stage bg={mixColor('#2a211a', '#1e1a12', merge)} fog={[12, 45]} sun={{pos: [-6, 12, 8], color: '#ffe7bf', intensity: 2.2}} fill={{color: '#6a5a40', intensity: 0.5}} ambient={0.2}>
			<Cam pos={[0, lerp(3, 6, smooth(f / D)), lerp(8, 12, smooth(f / D))]} target={[0, 1, 0]} fov={42} />
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0, 0]} receiveShadow>
				<planeGeometry args={[10, 30]} />
				<meshStandardMaterial color="#4f7d3a" roughness={0.95} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0, 0]} receiveShadow>
				<planeGeometry args={[10, 30]} />
				<meshStandardMaterial color={mixColor('#a67c4c', '#4f7d3a', merge)} roughness={0.95} />
			</mesh>
			<group position={[-5, 0, 0]}>
				<Grass frame={f} count={2000} w={10} d={30} height={0.22} />
			</group>
			<group position={[5, 0, 0]}>
				<Grass frame={f} count={2000} w={10} d={30} height={0.22 * merge + 0.001} seed={9} />
			</group>
			{Array.from({length: 7}, (_, i) => (
				<Ear key={i} position={[-1.5 + i * 0.5, 0, 0.5]} height={2.2 * ears + 0.01} ripe={0.7} sway={Math.sin(f * 0.04 + i) * 0.04} scale={1.1} />
			))}
		</Stage>
	);
};

export const SCENES: Record<string, S> = {
	night: Night,
	fatcows: FatCows,
	thincows: ThinCows,
	ears: Ears,
	hall_dream: HallDream,
	council: Council,
	remember: Remember,
	prison: PrisonScene,
	harvest7: Harvest7,
	fields: Fields,
	store: Store,
	drought7: Drought7,
	drying: Drying,
	silo: Silo,
	timeline14: Timeline14,
	rainfall: Rainfall,
	raindrop: Raindrop,
	revival: Revival,
	finale: Finale,
};

export {Brazier};
