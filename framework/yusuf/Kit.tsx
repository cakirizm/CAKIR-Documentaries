/* Shared 3D kit for "Yedi İneğin Sırrı" — matte, warm, minimal look
 * (stone, sand, wheat, leather). Everything is deterministic: animation is
 * driven only by the frame number passed in, randomness by seeded hashes. */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';

export const PAL = {
	bg: '#16110d',
	night: '#0b1220',
	stone: '#b9a27f',
	stoneDark: '#7d6a52',
	sand: '#c9a46a',
	dryEarth: '#8c6a43',
	green: '#4f7d3a',
	greenLight: '#78a24c',
	wheat: '#d9b45a',
	wheatDry: '#9a7a4a',
	cowFat: '#a8744a',
	cowFatLight: '#e9dcc6',
	cowThin: '#6e6156',
	robe: '#d8cdb8',
	robeDark: '#6b5a48',
	skin: '#8a5a3c',
	gold: '#d6a84a',
	red: '#9c3b2c',
	water: '#4d7f9a',
};

export const hash = (n: number) => {
	const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return s - Math.floor(s);
};
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => {
	const t = clamp01(x);
	return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (f: number, a: number, b: number) => smooth((f - a) / Math.max(1, b - a));
export const mixColor = (a: string, b: string, t: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), clamp01(t)).getHexString();

const mat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => (
	<meshStandardMaterial color={color} roughness={0.92} metalness={0} {...(extra as any)} />
);

/* ---------- Cow: fat (fat=1) or thin (fat=0); walk phase drives legs ---------- */
export const Cow: React.FC<{
	position?: [number, number, number];
	rotY?: number;
	fat?: number;
	walk?: number; // phase (radians)
	stride?: number;
	opacity?: number;
	scale?: number;
	headDown?: number;
	ghost?: boolean;
}> = ({position = [0, 0, 0], rotY = 0, fat = 1, walk = 0, stride = 1, opacity = 1, scale = 1, headDown = 0, ghost = false}) => {
	const bodyW = lerp(0.36, 0.62, fat);
	const bodyH = lerp(0.36, 0.6, fat);
	const legLen = lerp(0.82, 0.7, fat);
	const legR = lerp(0.045, 0.075, fat);
	const col = fat > 0.5 ? PAL.cowFat : PAL.cowThin;
	const tr = opacity < 1 || ghost;
	const m = (c: string) => <meshStandardMaterial color={c} roughness={0.85} transparent={tr} opacity={ghost ? 0.35 * opacity : opacity} emissive={ghost ? c : '#000'} emissiveIntensity={ghost ? 0.4 : 0} depthWrite={!tr} />;
	const legs: [number, number, number][] = [
		[0.62, 0, 0.18 * (bodyW / 0.5)],
		[0.62, Math.PI, -0.18 * (bodyW / 0.5)],
		[-0.58, Math.PI, 0.18 * (bodyW / 0.5)],
		[-0.58, 0, -0.18 * (bodyW / 0.5)],
	];
	const bob = Math.abs(Math.sin(walk)) * 0.025 * stride;
	return (
		<group position={position} rotation={[0, rotY, 0]} scale={scale}>
			<group position={[0, legLen + bodyH / 2 - 0.05 + bob, 0]}>
				{/* body: horizontal barrel + chest + hips (+ belly for fat cows) */}
				<mesh castShadow rotation={[0, 0, Math.PI / 2]} scale={[bodyH / 0.5, 1, bodyW / 0.5]}>
					<capsuleGeometry args={[0.25, 1.05, 8, 18]} />
					{m(col)}
				</mesh>
				<mesh castShadow position={[0.48, 0.04, 0]} scale={[0.42, bodyH * 1.05, bodyW * 0.98]}>
					<sphereGeometry args={[0.5, 16, 12]} />
					{m(col)}
				</mesh>
				<mesh castShadow position={[-0.5, 0.06, 0]} scale={[0.4, bodyH * lerp(1.15, 1.02, fat), bodyW * lerp(1.05, 0.98, fat)]}>
					<sphereGeometry args={[0.5, 16, 12]} />
					{m(col)}
				</mesh>
				{fat > 0.5 ? (
					<mesh castShadow position={[0, -0.12, 0]} scale={[0.9, bodyH * 0.75, bodyW * 1.05]}>
						<sphereGeometry args={[0.5, 16, 12]} />
						{m(col)}
					</mesh>
				) : null}
				{/* white patch for the fat cows */}
				{fat > 0.5 ? (
					<mesh position={[0.15, 0.08, bodyW / 2 - 0.02]} scale={[0.45, 0.28, 0.04]}>
						<sphereGeometry args={[0.5, 12, 8]} />
						{m(PAL.cowFatLight)}
					</mesh>
				) : null}
				{/* thin cows: visible hip and rib ridges */}
				{fat < 0.5
					? [-0.15, 0, 0.15].map((x, i) => (
							<mesh key={i} position={[x, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, bodyH / 0.5]}>
								<torusGeometry args={[bodyW / 2, 0.012, 6, 16, Math.PI]} />
								{m('#5a4e45')}
							</mesh>
						))
					: null}
				{/* neck + head */}
				<group position={[0.82, 0.12 - headDown * 0.25, 0]} rotation={[0, 0, -0.35 - headDown * 0.6]}>
					<mesh castShadow position={[0.12, 0, 0]} scale={[1, lerp(0.7, 1, fat), lerp(0.7, 1, fat)]}>
						<capsuleGeometry args={[0.13, 0.25, 4, 10]} />
						{m(col)}
					</mesh>
					<mesh castShadow position={[0.36, -0.08, 0]} rotation={[0, 0, -0.5]}>
						<boxGeometry args={[0.38, 0.22, 0.24]} />
						{m(col)}
					</mesh>
					<mesh position={[0.52, -0.2, 0]} rotation={[0, 0, -0.5]}>
						<boxGeometry args={[0.12, 0.16, 0.22]} />
						{m('#3d2f27')}
					</mesh>
					{[-1, 1].map((s) => (
						<mesh key={s} position={[0.26, 0.11, s * 0.14]} rotation={[s * 0.6, 0, 0.3]}>
							<coneGeometry args={[0.025, 0.16, 6]} />
							{m('#e8e0cf')}
						</mesh>
					))}
					{[-1, 1].map((s) => (
						<mesh key={s} position={[0.22, 0.02, s * 0.16]} rotation={[s * 1.2, 0, 0]} scale={[1, 1, 0.4]}>
							<sphereGeometry args={[0.07, 8, 6]} />
							{m(col)}
						</mesh>
					))}
				</group>
				{/* tail */}
				<mesh position={[-0.92, -0.05, 0]} rotation={[0, 0, 0.25 + Math.sin(walk * 0.5) * 0.15]}>
					<cylinderGeometry args={[0.015, 0.02, 0.6, 5]} />
					{m(col)}
				</mesh>
			</group>
			{/* legs: hip-pivoted swing */}
			{legs.map(([x, ph, z], i) => {
				const a = Math.sin(walk + ph) * 0.35 * stride;
				return (
					<group key={i} position={[x * lerp(0.95, 1, fat), legLen + bob, z]} rotation={[0, 0, a]}>
						<mesh castShadow position={[0, -legLen / 2, 0]}>
							<cylinderGeometry args={[legR, legR * 0.8, legLen, 7]} />
							{m(col)}
						</mesh>
						<mesh position={[0, -legLen + 0.03, 0]}>
							<cylinderGeometry args={[legR * 0.9, legR * 1.05, 0.07, 7]} />
							{m('#2a211b')}
						</mesh>
					</group>
				);
			})}
		</group>
	);
};

/* ---------- Person: robed figure, no facial features ---------- */
export const Person: React.FC<{
	position?: [number, number, number];
	rotY?: number;
	robe?: string;
	head?: string;
	scale?: number;
	headTurn?: number;
	armRaise?: number; // 0..1 (right arm)
	armSwing?: number; // walking/working swing (radians)
	bend?: number; // 0..1 forward bend
	sit?: number; // 0..1
	headdress?: string | null;
	opacity?: number;
}> = ({position = [0, 0, 0], rotY = 0, robe = PAL.robe, head = PAL.skin, scale = 1, headTurn = 0, armRaise = 0, armSwing = 0, bend = 0, sit = 0, headdress = null, opacity = 1}) => {
	const tr = opacity < 1;
	const m = (c: string) => <meshStandardMaterial color={c} roughness={0.95} transparent={tr} opacity={opacity} depthWrite={!tr} />;
	const h = lerp(1, 0.62, sit);
	return (
		<group position={position} rotation={[0, rotY, 0]} scale={scale}>
			<group rotation={[0, 0, -bend * 0.6]} position={[0, 0, 0]}>
				{/* robe (cone) */}
				<mesh castShadow position={[0, 0.62 * h, 0]} scale={[1, h, 1]}>
					<cylinderGeometry args={[0.16, 0.34, 1.24, 14]} />
					{m(robe)}
				</mesh>
				{/* shoulders */}
				<mesh castShadow position={[0, 1.27 * h + (1 - h) * 0.1, 0]} scale={[1, 0.55, 1.15]}>
					<sphereGeometry args={[0.2, 14, 10]} />
					{m(robe)}
				</mesh>
				{/* head (no face) */}
				<group position={[0, 1.5 * h + (1 - h) * 0.1, 0]} rotation={[0, headTurn, 0]}>
					<mesh castShadow>
						<sphereGeometry args={[0.13, 16, 12]} />
						{m(head)}
					</mesh>
					{headdress ? (
						<mesh castShadow position={[0, 0.03, 0]} scale={[1.08, 1.0, 1.08]}>
							<sphereGeometry args={[0.135, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
							{m(headdress)}
						</mesh>
					) : null}
				</group>
				{/* arms */}
				{[-1, 1].map((s) => {
					const raise = s === 1 ? armRaise : 0;
					const sw = Math.sin(armSwing + (s === 1 ? 0 : Math.PI)) * 0.35;
					return (
						<group key={s} position={[0, 1.3 * h + (1 - h) * 0.1, s * 0.2]} rotation={[0, 0, sw + raise * 1.8]}>
							<mesh castShadow position={[0, -0.3, 0]}>
								<capsuleGeometry args={[0.05, 0.45, 4, 8]} />
								{m(robe)}
							</mesh>
							<mesh position={[0, -0.6, 0]}>
								<sphereGeometry args={[0.05, 8, 6]} />
								{m(head)}
							</mesh>
						</group>
					);
				})}
			</group>
		</group>
	);
};

/* ---------- Wheat ear (spike) on a stalk ---------- */
export const Ear: React.FC<{
	position?: [number, number, number];
	height?: number;
	dry?: number; // 0 green .. 1 dry/brown
	ripe?: number; // 0 green .. 1 golden
	sway?: number;
	droop?: number;
	scale?: number;
	opacity?: number;
}> = ({position = [0, 0, 0], height = 1.6, dry = 0, ripe = 0, sway = 0, droop = 0, scale = 1, opacity = 1}) => {
	const col = dry > 0 ? mixColor(PAL.greenLight, PAL.wheatDry, dry) : mixColor(PAL.greenLight, PAL.wheat, ripe);
	const stalk = dry > 0 ? mixColor(PAL.green, '#7b6447', dry) : mixColor(PAL.green, '#b8953f', ripe);
	const grains = 14;
	const tr = opacity < 1;
	const m = (c: string) => <meshStandardMaterial color={c} roughness={0.8} transparent={tr} opacity={opacity} depthWrite={!tr} />;
	return (
		<group position={position} rotation={[0, 0, sway + droop * 0.9]} scale={scale}>
			<mesh castShadow position={[0, height / 2, 0]}>
				<cylinderGeometry args={[0.012, 0.02, height, 6]} />
				{m(stalk)}
			</mesh>
			<group position={[0, height, 0]} rotation={[0, 0, droop * 0.6]}>
				{Array.from({length: grains}, (_, i) => {
					const y = 0.04 + i * 0.032;
					const side = i % 2 ? 1 : -1;
					const shrink = dry > 0 ? lerp(1, 0.55, dry) : 1;
					return (
						<mesh key={i} castShadow position={[side * 0.028 * shrink, y, 0]} rotation={[0, (i * Math.PI) / 3, side * 0.35]} scale={[shrink, 1, shrink]}>
							<sphereGeometry args={[0.034, 8, 6]} />
							{m(col)}
						</mesh>
					);
				})}
				{/* awns */}
				{Array.from({length: 7}, (_, i) => (
					<mesh key={i} position={[(i % 2 ? 1 : -1) * 0.04, 0.12 + i * 0.055, 0]} rotation={[0, 0, (i % 2 ? -1 : 1) * 0.35]}>
						<cylinderGeometry args={[0.002, 0.004, 0.22, 3]} />
						{m(col)}
					</mesh>
				))}
			</group>
		</group>
	);
};

/* ---------- Instanced wheat field ---------- */
export const WheatField: React.FC<{
	count?: number;
	w?: number;
	d?: number;
	center?: [number, number, number];
	growth?: number; // 0..1 height
	ripe?: number;
	dry?: number;
	cut?: number; // 0..1 fraction harvested (from -x side)
	frame: number;
	seed?: number;
}> = ({count = 2600, w = 30, d = 30, center = [0, 0, 0], growth = 1, ripe = 0.7, dry = 0, cut = 0, frame, seed = 1}) => {
	const geo = useMemo(() => {
		const g = new THREE.CylinderGeometry(0.035, 0.012, 1, 4, 1);
		g.translate(0, 0.5, 0);
		return g;
	}, []);
	const stalkGeo = useMemo(() => {
		const g = new THREE.CylinderGeometry(0.006, 0.01, 1, 3, 1);
		g.translate(0, 0.5, 0);
		return g;
	}, []);
	const pts = useMemo(
		() =>
			Array.from({length: count}, (_, i) => ({
				x: (hash(i * 3.1 + seed) - 0.5) * w,
				z: (hash(i * 7.7 + seed * 2) - 0.5) * d,
				h: 0.8 + hash(i * 1.3 + seed) * 0.35,
				p: hash(i * 5.9) * Math.PI * 2,
			})),
		[count, w, d, seed],
	);
	const dummy = useMemo(() => new THREE.Object3D(), []);
	const earRef = React.useRef<THREE.InstancedMesh>(null);
	const stalkRef = React.useRef<THREE.InstancedMesh>(null);
	const col = dry > 0 ? mixColor(PAL.wheat, PAL.wheatDry, dry) : mixColor(PAL.greenLight, PAL.wheat, ripe);
	const scol = dry > 0 ? mixColor('#b8953f', '#6f5a40', dry) : mixColor(PAL.green, '#b8953f', ripe);
	React.useLayoutEffect(() => {
		const t = frame / 30;
		pts.forEach((p, i) => {
			const isCut = (p.x / w + 0.5) < cut;
			const hh = isCut ? 0.08 : p.h * Math.max(0.02, growth) * (1 - dry * 0.15);
			const sway = Math.sin(t * 1.3 + p.p + p.x * 0.25) * 0.07 + dry * 0.25 * Math.sin(p.p);
			dummy.position.set(p.x, 0, p.z);
			dummy.rotation.set(sway * 0.6, p.p, sway);
			dummy.scale.set(1, hh, 1);
			dummy.updateMatrix();
			stalkRef.current?.setMatrixAt(i, dummy.matrix);
			dummy.position.set(p.x + Math.sin(sway) * hh, hh * Math.cos(sway) * 0.98, p.z);
			dummy.scale.set(isCut ? 0.001 : 1, isCut ? 0.001 : 0.22 * Math.min(1, growth * 1.4), isCut ? 0.001 : 1);
			dummy.updateMatrix();
			earRef.current?.setMatrixAt(i, dummy.matrix);
		});
		if (earRef.current) earRef.current.instanceMatrix.needsUpdate = true;
		if (stalkRef.current) stalkRef.current.instanceMatrix.needsUpdate = true;
	});
	return (
		<group position={center}>
			<instancedMesh ref={stalkRef} args={[stalkGeo, undefined, count]} castShadow receiveShadow>
				<meshStandardMaterial color={scol} roughness={0.9} />
			</instancedMesh>
			<instancedMesh ref={earRef} args={[geo, undefined, count]} castShadow>
				<meshStandardMaterial color={col} roughness={0.85} />
			</instancedMesh>
		</group>
	);
};

/* ---------- Instanced grass (meadow) ---------- */
export const Grass: React.FC<{count?: number; w?: number; d?: number; color?: string; frame: number; height?: number; seed?: number}> = ({count = 3000, w = 40, d = 40, color = PAL.green, frame, height = 0.35, seed = 3}) => {
	const geo = useMemo(() => {
		const g = new THREE.ConeGeometry(0.03, 1, 3, 1);
		g.translate(0, 0.5, 0);
		return g;
	}, []);
	const pts = useMemo(() => Array.from({length: count}, (_, i) => ({x: (hash(i * 2.3 + seed) - 0.5) * w, z: (hash(i * 4.1 + seed) - 0.5) * d, h: 0.6 + hash(i * 9.1) * 0.8, p: hash(i) * 6.28})), [count, w, d, seed]);
	const ref = React.useRef<THREE.InstancedMesh>(null);
	const dummy = useMemo(() => new THREE.Object3D(), []);
	React.useLayoutEffect(() => {
		const t = frame / 30;
		pts.forEach((p, i) => {
			const s = Math.sin(t * 1.6 + p.p + p.x * 0.3) * 0.12;
			dummy.position.set(p.x, 0, p.z);
			dummy.rotation.set(s * 0.5, p.p, s);
			dummy.scale.set(1, p.h * height, 1);
			dummy.updateMatrix();
			ref.current?.setMatrixAt(i, dummy.matrix);
		});
		if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
	});
	return (
		<instancedMesh ref={ref} args={[geo, undefined, count]} receiveShadow>
			<meshStandardMaterial color={color} roughness={0.95} />
		</instancedMesh>
	);
};

/* ---------- Ground with optional dryness cracks ---------- */
export const Ground: React.FC<{color: string; size?: number; cracks?: number; wet?: number; y?: number}> = ({color, size = 120, cracks = 0, wet = 0, y = 0}) => {
	const crackGeo = useMemo(() => {
		const segs: number[] = [];
		for (let i = 0; i < 260; i++) {
			let x = (hash(i * 1.7) - 0.5) * 40, z = (hash(i * 2.9) - 0.5) * 40;
			let a = hash(i * 4.3) * Math.PI * 2;
			for (let k = 0; k < 4; k++) {
				const l = 0.4 + hash(i * 13 + k) * 0.9;
				const nx = x + Math.cos(a) * l, nz = z + Math.sin(a) * l;
				segs.push(x, 0, z, nx, 0, nz);
				x = nx; z = nz; a += (hash(i * 7 + k) - 0.5) * 1.4;
			}
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
		return g;
	}, []);
	const c = mixColor(color, '#3e3024', wet * 0.6);
	return (
		<group position={[0, y, 0]}>
			<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[size, size]} />
				<meshStandardMaterial color={c} roughness={lerp(0.98, 0.45, wet)} />
			</mesh>
			{cracks > 0 ? (
				<lineSegments geometry={crackGeo} position={[0, 0.01, 0]}>
					<lineBasicMaterial color="#3a2a1c" transparent opacity={cracks * (1 - wet)} />
				</lineSegments>
			) : null}
		</group>
	);
};

/* ---------- Stone column ---------- */
export const Column: React.FC<{position: [number, number, number]; h?: number; r?: number; color?: string}> = ({position, h = 6, r = 0.45, color = PAL.stone}) => (
	<group position={position}>
		<mesh castShadow receiveShadow position={[0, h / 2, 0]}>
			<cylinderGeometry args={[r * 0.9, r, h, 16]} />
			{mat(color)}
		</mesh>
		{/* lotus capital */}
		<mesh castShadow position={[0, h + 0.25, 0]}>
			<cylinderGeometry args={[r * 1.45, r * 0.95, 0.5, 16]} />
			{mat(color)}
		</mesh>
		<mesh castShadow position={[0, h + 0.6, 0]}>
			<boxGeometry args={[r * 3, 0.2, r * 3]} />
			{mat(color)}
		</mesh>
		<mesh receiveShadow position={[0, 0.1, 0]}>
			<cylinderGeometry args={[r * 1.3, r * 1.4, 0.2, 16]} />
			{mat(PAL.stoneDark)}
		</mesh>
	</group>
);

/* ---------- Rain (instanced streaks) ---------- */
export const Rain: React.FC<{frame: number; amount: number; area?: number; top?: number; len?: number}> = ({frame, amount, area = 24, top = 14, len = 0.6}) => {
	const N = 1400;
	const geo = useMemo(() => new THREE.CylinderGeometry(0.008 * Math.min(1, len / 0.3), 0.008 * Math.min(1, len / 0.3), len, 3), [len]);
	const ref = React.useRef<THREE.InstancedMesh>(null);
	const dummy = useMemo(() => new THREE.Object3D(), []);
	React.useLayoutEffect(() => {
		const t = frame / 30;
		for (let i = 0; i < N; i++) {
			const on = hash(i * 3.3) < amount;
			const sp = 11 + hash(i) * 4;
			const y = top - ((t * sp + hash(i * 5.1) * top) % top);
			dummy.position.set((hash(i * 1.9) - 0.5) * area, y, (hash(i * 2.7) - 0.5) * area);
			dummy.rotation.set(0, 0, 0.08);
			const s = on ? 1 : 0.0001;
			dummy.scale.set(s, s, s);
			dummy.updateMatrix();
			ref.current?.setMatrixAt(i, dummy.matrix);
		}
		if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
	});
	return (
		<instancedMesh ref={ref} args={[geo, undefined, N]}>
			<meshBasicMaterial color="#cfe0ea" transparent opacity={0.45} />
		</instancedMesh>
	);
};

/* ---------- Sheaf (bundle of cut wheat) ---------- */
export const Sheaf: React.FC<{position: [number, number, number]; scale?: number; color?: string; rot?: number}> = ({position, scale = 1, color = PAL.wheat, rot = 0}) => (
	<group position={position} scale={scale} rotation={[0, rot, 0]}>
		<mesh castShadow position={[0, 0.45, 0]}>
			<cylinderGeometry args={[0.16, 0.22, 0.9, 10]} />
			{mat(color)}
		</mesh>
		<mesh castShadow position={[0, 0.98, 0]}>
			<coneGeometry args={[0.32, 0.4, 10]} />
			{mat(mixColor(color, '#fff3c4', 0.15))}
		</mesh>
		<mesh position={[0, 0.5, 0]}>
			<torusGeometry args={[0.19, 0.025, 6, 16]} />
			{mat('#7a5a32')}
		</mesh>
	</group>
);

/* ---------- Camera helper: drives the default r3f camera ---------- */
export const Cam: React.FC<{pos: [number, number, number]; target: [number, number, number]; fov?: number}> = ({pos, target, fov = 42}) => {
	const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
	React.useLayoutEffect(() => {
		camera.position.set(...pos);
		camera.fov = fov;
		camera.near = 0.1;
		camera.far = 400;
		camera.updateProjectionMatrix();
		camera.lookAt(...target);
	});
	return null;
};
