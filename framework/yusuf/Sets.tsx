/* Reusable sets for "Yedi İneğin Sırrı": palace hall, night exterior,
 * prison cell, granary cut-away, 3D timeline blocks, vortex, ripples. */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Column, PAL, hash, lerp, mixColor, clamp01, smooth} from './Kit';

const mat = (color: string, extra: any = {}) => <meshStandardMaterial color={color} roughness={0.93} metalness={0} {...extra} />;

/* flickering brazier with a warm point light */
export const Brazier: React.FC<{position: [number, number, number]; frame: number; seed?: number; light?: number}> = ({position, frame, seed = 0, light = 6}) => {
	const fl = 0.85 + 0.15 * Math.sin(frame * 0.7 + seed * 3) * Math.sin(frame * 0.31 + seed);
	return (
		<group position={position}>
			<mesh castShadow position={[0, 0.5, 0]}>
				<cylinderGeometry args={[0.08, 0.14, 1, 8]} />
				{mat(PAL.stoneDark)}
			</mesh>
			<mesh position={[0, 1.05, 0]}>
				<cylinderGeometry args={[0.32, 0.18, 0.18, 12]} />
				{mat('#5a4632')}
			</mesh>
			<mesh position={[0, 1.32, 0]} scale={[1, fl, 1]}>
				<coneGeometry args={[0.2, 0.55, 10]} />
				<meshBasicMaterial color="#ffb04a" transparent opacity={0.9} />
			</mesh>
			<mesh position={[0, 1.25, 0]} scale={[1, fl * 0.8, 1]}>
				<coneGeometry args={[0.12, 0.35, 8]} />
				<meshBasicMaterial color="#fff0b8" />
			</mesh>
			<pointLight position={[0, 1.6, 0]} color="#ff9a3c" intensity={light * fl} distance={14} decay={1.6} />
		</group>
	);
};

/* palace hall interior: floor, two colonnades, back wall, dais + throne */
export const Hall: React.FC<{frame: number; braziers?: boolean}> = ({frame, braziers = true}) => (
	<group>
		<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
			<planeGeometry args={[40, 60]} />
			{mat('#6d5a45')}
		</mesh>
		{/* floor slabs */}
		{Array.from({length: 9}, (_, i) => (
			<mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -14 + i * 3]}>
				<planeGeometry args={[5.2, 0.04]} />
				<meshBasicMaterial color="#4c3e30" />
			</mesh>
		))}
		{Array.from({length: 6}, (_, i) => (
			<React.Fragment key={i}>
				<Column position={[-3.4, 0, -14 + i * 3.2]} h={6.5} r={0.5} />
				<Column position={[3.4, 0, -14 + i * 3.2]} h={6.5} r={0.5} />
			</React.Fragment>
		))}
		{/* architraves */}
		{[-3.4, 3.4].map((x) => (
			<mesh key={x} position={[x, 7.45, -6]} castShadow>
				<boxGeometry args={[1.6, 0.5, 18]} />
				{mat(PAL.stone)}
			</mesh>
		))}
		{/* back wall with relief bands */}
		<mesh position={[0, 4, -16.5]} receiveShadow>
			<boxGeometry args={[16, 8, 0.6]} />
			{mat('#8f7a5e')}
		</mesh>
		{[1.2, 2.2, 5.6].map((y) => (
			<mesh key={y} position={[0, y, -16.15]}>
				<boxGeometry args={[12, 0.08, 0.08]} />
				{mat('#6a5640')}
			</mesh>
		))}
		{/* dais + throne */}
		<mesh position={[0, 0.2, -12.5]} receiveShadow castShadow>
			<boxGeometry args={[5, 0.4, 3]} />
			{mat('#9c8664')}
		</mesh>
		<mesh position={[0, 0.5, -12.6]} receiveShadow castShadow>
			<boxGeometry args={[3.4, 0.2, 2]} />
			{mat('#a89070')}
		</mesh>
		<group position={[0, 0.6, -13]}>
			<mesh castShadow position={[0, 0.5, 0]}>
				<boxGeometry args={[1.3, 0.12, 1]} />
				{mat(PAL.gold, {metalness: 0.4, roughness: 0.5})}
			</mesh>
			<mesh castShadow position={[0, 1.35, -0.45]}>
				<boxGeometry args={[1.3, 1.8, 0.12]} />
				{mat(PAL.gold, {metalness: 0.4, roughness: 0.5})}
			</mesh>
			{[-0.6, 0.6].map((x) => (
				<mesh key={x} castShadow position={[x, 0.75, 0]}>
					<boxGeometry args={[0.12, 0.5, 1]} />
					{mat(PAL.gold, {metalness: 0.4, roughness: 0.5})}
				</mesh>
			))}
		</group>
		{braziers ? (
			<>
				<Brazier position={[-2, 0, -10.5]} frame={frame} seed={1} />
				<Brazier position={[2, 0, -10.5]} frame={frame} seed={2} />
				<Brazier position={[-2.2, 0, -3]} frame={frame} seed={3} light={4} />
				<Brazier position={[2.2, 0, -3]} frame={frame} seed={4} light={4} />
			</>
		) : null}
	</group>
);

/* starry night sky + moon (for exterior night) */
export const NightSky: React.FC<{moonPos?: [number, number, number]}> = ({moonPos = [-14, 22, -60]}) => {
	const geo = useMemo(() => {
		const p: number[] = [];
		for (let i = 0; i < 900; i++) {
			const a = hash(i) * Math.PI * 2, e = 0.05 + hash(i * 3.7) * 1.3;
			const r = 140;
			p.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r);
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
		return g;
	}, []);
	return (
		<group>
			<points geometry={geo}>
				<pointsMaterial color="#dfe6ff" size={0.7} sizeAttenuation fog={false} />
			</points>
			<mesh position={moonPos}>
				<sphereGeometry args={[3.2, 24, 16]} />
				<meshBasicMaterial color="#f3ecd2" fog={false} />
			</mesh>
			<mesh position={moonPos}>
				<sphereGeometry args={[5.5, 24, 16]} />
				<meshBasicMaterial color="#9fb1d6" transparent opacity={0.12} fog={false} />
			</mesh>
		</group>
	);
};

/* palace exterior facade with a colonnade avenue leading to a lit doorway */
export const PalaceExterior: React.FC<{frame: number}> = ({frame}) => (
	<group>
		<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
			<planeGeometry args={[200, 200]} />
			{mat('#3a3128')}
		</mesh>
		{Array.from({length: 7}, (_, i) => (
			<React.Fragment key={i}>
				<Column position={[-3, 0, 18 - i * 3.4]} h={5.5} r={0.42} />
				<Column position={[3, 0, 18 - i * 3.4]} h={5.5} r={0.42} />
			</React.Fragment>
		))}
		{/* facade with doorway */}
		<mesh position={[-6.5, 4.5, -6]} castShadow receiveShadow>
			<boxGeometry args={[9, 9, 2]} />
			{mat('#7c6a52')}
		</mesh>
		<mesh position={[6.5, 4.5, -6]} castShadow receiveShadow>
			<boxGeometry args={[9, 9, 2]} />
			{mat('#7c6a52')}
		</mesh>
		<mesh position={[0, 7.5, -6]} castShadow>
			<boxGeometry args={[4, 3, 2]} />
			{mat('#7c6a52')}
		</mesh>
		{/* warm interior glow behind the doorway */}
		<mesh position={[0, 3, -7.2]}>
			<planeGeometry args={[4, 6]} />
			<meshBasicMaterial color="#5b3a1e" />
		</mesh>
		<Brazier position={[-1.4, 0, -4.4]} frame={frame} seed={5} light={5} />
		<Brazier position={[1.4, 0, -4.4]} frame={frame} seed={6} light={5} />
	</group>
);

/* bedchamber: bed platform, curtains */
export const Bedchamber: React.FC<{frame: number}> = ({frame}) => (
	<group position={[0, 0, -12]}>
		<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
			<planeGeometry args={[14, 14]} />
			{mat('#4a3c2f')}
		</mesh>
		<mesh position={[0, 3.5, -3]} receiveShadow>
			<boxGeometry args={[12, 7, 0.4]} />
			{mat('#6b5843')}
		</mesh>
		<mesh castShadow receiveShadow position={[0, 0.35, 0]}>
			<boxGeometry args={[2.4, 0.5, 3.6]} />
			{mat('#8b6e4c')}
		</mesh>
		<mesh receiveShadow position={[0, 0.66, 0.1]}>
			<boxGeometry args={[2.2, 0.14, 3.3]} />
			{mat('#d9cfbd')}
		</mesh>
		<mesh receiveShadow position={[0, 0.8, -1.4]}>
			<boxGeometry args={[1.6, 0.18, 0.5]} />
			{mat('#e6ddcc')}
		</mesh>
		{[-1.5, 1.5].map((x) => (
			<mesh key={x} position={[x, 2.6, -1.6]} castShadow>
				<boxGeometry args={[0.15, 5.2, 0.15]} />
				{mat(PAL.gold, {metalness: 0.3})}
			</mesh>
		))}
		<Brazier position={[-2.6, 0, -1.6]} frame={frame} seed={8} light={3.5} />
	</group>
);

/* prison cell: walls, high window with light shaft, door */
export const Prison: React.FC<{frame: number; door?: number; beam?: number}> = ({frame, door = 0, beam = 1}) => (
	<group>
		<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
			<planeGeometry args={[14, 14]} />
			{mat('#3c3329')}
		</mesh>
		{/* stone block walls */}
		{[
			[0, 3, -4, 10, 6, 0.6],
			[-4.5, 3, 0, 0.6, 6, 10],
			[4.5, 3, 0, 0.6, 6, 10],
		].map(([x, y, z, w, h, d], i) => (
			<mesh key={i} position={[x, y, z]} receiveShadow castShadow>
				<boxGeometry args={[w, h, d]} />
				{mat('#5d5043')}
			</mesh>
		))}
		{/* block joints */}
		{Array.from({length: 8}, (_, i) => (
			<mesh key={i} position={[0, 0.7 + i * 0.7, -3.68]}>
				<boxGeometry args={[10, 0.03, 0.02]} />
				<meshBasicMaterial color="#3f352b" />
			</mesh>
		))}
		{/* window opening + light shaft */}
		<mesh position={[1.2, 4.6, -3.69]}>
			<planeGeometry args={[0.9, 0.7]} />
			<meshBasicMaterial color="#fff2cf" />
		</mesh>
		{[0.75, 1.05].map((x) => (
			<mesh key={x} position={[x + 0.07, 4.6, -3.66]}>
				<boxGeometry args={[0.05, 0.7, 0.05]} />
				{mat('#2b241d')}
			</mesh>
		))}
		<mesh position={[0.6, 2.4, -1.6]} rotation={[0.82, 0, 0.25]}>
			<cylinderGeometry args={[0.45, 1.3, 5.2, 16, 1, true]} />
			<meshBasicMaterial color="#ffe7b0" transparent opacity={0.07 * beam} depthWrite={false} side={THREE.DoubleSide} />
		</mesh>
		<spotLight position={[1.2, 4.6, -3.4]} target-position={[-0.3, 0, 0.6]} angle={0.45} penumbra={0.6} intensity={30 * beam} distance={14} color="#ffe2a8" castShadow />
		{/* door in the right wall */}
		<group position={[4.2, 0, 1.8]} rotation={[0, -door * 1.3, 0]}>
			<mesh castShadow position={[0, 1.4, -0.7]}>
				<boxGeometry args={[0.15, 2.8, 1.4]} />
				{mat('#4b3626')}
			</mesh>
		</group>
		{/* light spilling through the open door */}
		<pointLight position={[5.5, 1.8, 1.2]} intensity={door * 6} distance={8} color="#ffcf8a" />
	</group>
);

/* granary cut-away: transparent bin with grain fill (0..1) */
export const Granary: React.FC<{position?: [number, number, number]; fill: number; w?: number; h?: number; d?: number; color?: string}> = ({position = [0, 0, 0], fill, w = 3, h = 4, d = 3, color = PAL.wheat}) => {
	const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), [w, h, d]);
	const fh = Math.max(0.02, clamp01(fill) * (h - 0.1));
	return (
		<group position={position}>
			<mesh position={[0, h / 2, 0]}>
				<boxGeometry args={[w, h, d]} />
				<meshStandardMaterial color="#e8dcc0" transparent opacity={0.12} depthWrite={false} roughness={0.2} />
			</mesh>
			<lineSegments geometry={edges} position={[0, h / 2, 0]}>
				<lineBasicMaterial color="#efe1c2" transparent opacity={0.8} />
			</lineSegments>
			<mesh castShadow position={[0, fh / 2 + 0.02, 0]}>
				<boxGeometry args={[w - 0.12, fh, d - 0.12]} />
				{mat(color)}
			</mesh>
			{/* grain heap on top */}
			<mesh position={[0, fh + 0.02, 0]} scale={[1, 0.25, 1]}>
				<sphereGeometry args={[Math.min(w, d) * 0.45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
				{mat(mixColor(color, '#fff0b0', 0.15))}
			</mesh>
		</group>
	);
};

/* label rendered to a canvas texture (numbers / short words) */
export const Label3D: React.FC<{text: string; position: [number, number, number]; size?: number; color?: string; opacity?: number}> = ({text, position, size = 0.8, color = '#f3e6c8', opacity = 1}) => {
	const tex = useMemo(() => {
		const c = document.createElement('canvas');
		c.width = 256; c.height = 256;
		const g = c.getContext('2d')!;
		g.fillStyle = color;
		g.font = 'bold 150px Alegreya, Georgia, serif';
		g.textAlign = 'center'; g.textBaseline = 'middle';
		g.fillText(text, 128, 138);
		const t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		return t;
	}, [text, color]);
	return (
		<sprite position={position} scale={[size, size, size]}>
			<spriteMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
		</sprite>
	);
};

/* row of year blocks (timeline). lit[i] in 0..1 */
export const YearBlocks: React.FC<{
	n: number;
	lit: (i: number) => number;
	color: (i: number) => string;
	position?: [number, number, number];
	gap?: number;
	labels?: boolean;
	labelOffset?: number;
	size?: number;
}> = ({n, lit, color, position = [0, 0, 0], gap = 1.15, labels = true, labelOffset = 0, size = 1}) => (
	<group position={position}>
		{Array.from({length: n}, (_, i) => {
			const l = lit(i);
			const x = (i - (n - 1) / 2) * gap * size;
			return (
				<group key={i} position={[x, 0, 0]}>
					<mesh castShadow position={[0, (0.2 + l * 0.5) * size, 0]} scale={[1, 0.4 + l, 1]}>
						<boxGeometry args={[0.9 * size, 0.5 * size, 0.9 * size]} />
						<meshStandardMaterial color={mixColor('#3a2f25', color(i), l)} roughness={0.6} emissive={color(i)} emissiveIntensity={0.25 * l} />
					</mesh>
					{labels ? <Label3D text={String(i + 1 + labelOffset)} position={[0, (1.1 + l * 0.5) * size, 0]} size={0.7 * size} opacity={0.35 + 0.65 * l} /> : null}
				</group>
			);
		})}
	</group>
);

/* dark swirling vortex disc (symbolic "devouring") */
export const Vortex: React.FC<{position: [number, number, number]; radius: number; frame: number; opacity: number}> = ({position, radius, frame, opacity}) => (
	<group position={position} rotation={[-Math.PI / 2, 0, frame * 0.03]}>
		{Array.from({length: 6}, (_, i) => (
			<mesh key={i} rotation={[0, 0, i * 1.05]}>
				<ringGeometry args={[radius * (0.15 + i * 0.13), radius * (0.24 + i * 0.13), 48, 1, 0, Math.PI * 1.4]} />
				<meshBasicMaterial color={i % 2 ? '#1b1410' : '#2e231b'} transparent opacity={opacity * (1 - i * 0.12)} depthWrite={false} side={THREE.DoubleSide} />
			</mesh>
		))}
		<mesh>
			<circleGeometry args={[radius * 0.2, 32]} />
			<meshBasicMaterial color="#0c0907" transparent opacity={opacity} depthWrite={false} />
		</mesh>
	</group>
);

/* expanding water ripples */
export const Ripples: React.FC<{position: [number, number, number]; t: number; count?: number}> = ({position, t, count = 3}) => (
	<group position={position} rotation={[-Math.PI / 2, 0, 0]}>
		{Array.from({length: count}, (_, i) => {
			const p = t - i * 0.25;
			if (p <= 0 || p > 1.6) return null;
			return (
				<mesh key={i}>
					<ringGeometry args={[p * 1.1, p * 1.1 + 0.04, 48]} />
					<meshBasicMaterial color="#cfe3ee" transparent opacity={Math.max(0, 0.7 * (1 - p / 1.6))} depthWrite={false} />
				</mesh>
			);
		})}
	</group>
);

/* water canals (strips) whose width shrinks with dryness */
export const Canals: React.FC<{width: number; wet?: number}> = ({width}) => (
	<group>
		{[-6, 0.5, 7].map((x, i) => (
			<mesh key={i} rotation={[-Math.PI / 2, 0, 0.12 * (i - 1)]} position={[x, 0.02, -6]}>
				<planeGeometry args={[Math.max(0.01, width), 60]} />
				<meshStandardMaterial color={PAL.water} roughness={0.15} metalness={0.1} />
			</mesh>
		))}
	</group>
);

export {lerp, smooth};
