// CAKIR character rig — a jointed 2D figure in side view (forward kinematics).
// Every limb is driven by joint angles, so poses can be blended and cycled
// (walk, sit, read, write, lie down) instead of moving a static cut-out.
import React from 'react';

export type Pose = {
	lean: number; // torso, degrees from vertical (+ = forward)
	head: number; // head tilt relative to torso (+ = down/forward)
	nThigh: number; nKnee: number; // near leg: thigh from vertical (+ forward), knee bend (+)
	fThigh: number; fKnee: number; // far leg
	nShoulder: number; nElbow: number; // near arm: from vertical (+ forward), elbow bend (+ forward)
	fShoulder: number; fElbow: number;
	nFoot?: number; fFoot?: number; // ankle flex (+ toes up)
};

export type Look = {
	skin: string; hair: string; jacket: string; jacketShade: string; shirt: string;
	trousers: string; trousersShade: string; shoes: string;
	bald?: boolean; mustache?: boolean; longHair?: boolean; build?: number; beard?: number; cap?: string; shortSleeves?: boolean;
};

// Nasseri as seen in the press photographs: light beige jacket, blue shirt,
// dark trousers, receding dark-grey hair, moustache, slim build.
export const NASSERI: Look = {
	skin: '#b98a6c', hair: '#3b3633', jacket: '#bdb19b', jacketShade: '#a39883', shirt: '#55739c',
	trousers: '#30353f', trousersShade: '#262a32', shoes: '#1d1d1f', bald: true, mustache: true, build: 0.95,
};

export const STAND: Pose = {lean: 0, head: 0, nThigh: 0, nKnee: 0, fThigh: 0, fKnee: 0, nShoulder: 4, nElbow: 8, fShoulder: -4, fElbow: 8};

// proportions in body-height units
const P = {head: 0.135, neck: 0.03, torso: 0.3, thigh: 0.245, shin: 0.235, upper: 0.175, fore: 0.16, foot: 0.075};
export const LEG_LEN = P.thigh + P.shin + 0.03;

const rad = (d: number) => (d * Math.PI) / 180;
const down = (x: number, y: number, len: number, a: number): [number, number] => [x + len * Math.sin(rad(a)), y + len * Math.cos(rad(a))];

export const lerpPose = (a: Pose, b: Pose, t: number): Pose => {
	const o: any = {};
	for (const k of Object.keys(a) as (keyof Pose)[]) o[k] = (a[k] ?? 0) + ((b[k] ?? 0) - (a[k] ?? 0)) * t;
	return o;
};

/** Walk cycle at phase (radians). Natural gait: legs in antiphase, knees bend
 *  in swing, arms counter-swing, slight torso lean. */
export const walkPose = (ph: number, amp = 1): Pose => {
	const leg = (p: number) => ({thigh: 22 * amp * Math.sin(p), knee: 6 + 42 * amp * Math.max(0, Math.sin(p - 1.3)) ** 1.4});
	const n = leg(ph), f = leg(ph + Math.PI);
	return {
		lean: 4, head: -2,
		nThigh: n.thigh, nKnee: n.knee, fThigh: f.thigh, fKnee: f.knee,
		nShoulder: -16 * amp * Math.sin(ph), nElbow: 14 + 8 * Math.max(0, -Math.sin(ph)),
		fShoulder: 16 * amp * Math.sin(ph), fElbow: 14 + 8 * Math.max(0, Math.sin(ph)),
		nFoot: 8 * Math.sin(ph + 0.8), fFoot: 8 * Math.sin(ph + Math.PI + 0.8),
	};
};
/** vertical hip bob for the walk (body-height units) */
export const walkBob = (ph: number) => -0.012 * Math.abs(Math.sin(ph)) + 0.006;

export const SIT: Pose = {lean: -6, head: 2, nThigh: 88, nKnee: 92, fThigh: 84, fKnee: 86, nShoulder: 22, nElbow: 40, fShoulder: 18, fElbow: 40};
export const READ: Pose = {lean: 2, head: 14, nThigh: 88, nKnee: 92, fThigh: 84, fKnee: 86, nShoulder: 48, nElbow: 62, fShoulder: 52, fElbow: 58};
export const WRITE: Pose = {lean: 20, head: 22, nThigh: 86, nKnee: 90, fThigh: 82, fKnee: 84, nShoulder: 62, nElbow: 34, fShoulder: 40, fElbow: 70};
export const BEND: Pose = {lean: 62, head: 12, nThigh: -8, nKnee: 18, fThigh: 6, fKnee: 22, nShoulder: 6, nElbow: 6, fShoulder: 2, fElbow: 8};
export const LIE: Pose = {lean: 0, head: -4, nThigh: 22, nKnee: 30, fThigh: 16, fKnee: 26, nShoulder: 150, nElbow: -40, fShoulder: 20, fElbow: 90};
export const PRESENT: Pose = {lean: 6, head: 0, nThigh: 0, nKnee: 0, fThigh: 0, fKnee: 0, nShoulder: 70, nElbow: 20, fShoulder: 6, fElbow: 10};

export type Hands = {near: [number, number]; far: [number, number]; shoulder: [number, number]; hip: [number, number]};

/** Draws the figure. (x, y) = hip position in px, h = body height in px.
 *  Returns hand positions through onHands for props (newspaper, pen, box). */
export const Puppet: React.FC<{
	x: number; y: number; h: number; pose: Pose; look?: Look; flip?: boolean; rotate?: number; breathe?: number;
	nearProp?: (hand: [number, number], ang: number) => React.ReactNode;
	farProp?: (hand: [number, number], ang: number) => React.ReactNode;
	betweenHands?: (n: [number, number], f: [number, number]) => React.ReactNode;
	opacity?: number; shadow?: boolean; groundY?: number;
}> = ({x, y, h, pose, look = NASSERI, flip = false, rotate = 0, breathe = 0, nearProp, farProp, betweenHands, opacity = 1, shadow = true, groundY}) => {
	const L = look;
	const b = L.build ?? 1;
	// local coordinates: hip at (0,0), units = px
	const u = (v: number) => v * h;
	const hip: [number, number] = [0, 0];
	const sh: [number, number] = [u(P.torso) * Math.sin(rad(pose.lean)), -u(P.torso) * Math.cos(rad(pose.lean)) * (1 + breathe * 0.01)];
	const neck: [number, number] = [sh[0] + u(P.neck) * Math.sin(rad(pose.lean)), sh[1] - u(P.neck) * Math.cos(rad(pose.lean))];
	const leg = (thigh: number, knee: number) => {
		const k = down(0, 0, u(P.thigh), thigh);
		const a = down(k[0], k[1], u(P.shin), thigh - knee);
		return {k, a, shinA: thigh - knee};
	};
	const arm = (s: number, e: number, side: number) => {
		const o: [number, number] = [sh[0] + side * u(0.012), sh[1] + u(0.02)];
		const el = down(o[0], o[1], u(P.upper), s + pose.lean * 0.3);
		const ha = down(el[0], el[1], u(P.fore), s + e + pose.lean * 0.3);
		return {o, el, ha, foreA: s + e + pose.lean * 0.3};
	};
	const nl = leg(pose.nThigh, pose.nKnee), fl = leg(pose.fThigh, pose.fKnee);
	const na = arm(pose.nShoulder, pose.nElbow, 1), fa = arm(pose.fShoulder, pose.fElbow, -1);

	const limb = (pts: [number, number][], w: number, color: string) => (
		<polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
	);
	const shoe = (a: [number, number], shinA: number, flex: number, color: string) => {
		const ang = shinA - 90 + (flex ?? 0);
		const len = u(P.foot);
		const tip = down(a[0], a[1], len, 180 - ang - 180 + 90 + 90);
		return (
			<g transform={`translate(${a[0]},${a[1]}) rotate(${-(shinA) + (flex ?? 0) * 0.5})`}>
				<path d={`M ${-u(0.022)} ${-u(0.01)} L ${len} ${-u(0.006)} Q ${len + u(0.018)} ${u(0.012)} ${len - u(0.004)} ${u(0.024)} L ${-u(0.026)} ${u(0.024)} Z`} fill={color} />
			</g>
		);
		void tip;
	};
	const torsoPath = () => {
		const w1 = u(0.058) * b, w2 = u(0.05) * b;
		const nx = Math.cos(rad(pose.lean)), ny = Math.sin(rad(pose.lean));
		const p1 = [sh[0] - w1 * nx * 0.9, sh[1] - w1 * ny * 0.9], p2 = [sh[0] + w1 * nx, sh[1] + w1 * ny];
		const p3 = [hip[0] + w2 * nx * 1.1, hip[1] + w2 * ny * 1.1 + u(0.03)], p4 = [hip[0] - w2 * nx, hip[1] - w2 * ny + u(0.03)];
		return `M ${p1.join(' ')} Q ${(p1[0] + p2[0]) / 2} ${(p1[1] + p2[1]) / 2 - u(0.02)} ${p2.join(' ')} L ${p3.join(' ')} Q ${(p3[0] + p4[0]) / 2} ${(p3[1] + p4[1]) / 2 + u(0.01)} ${p4.join(' ')} Z`;
	};
	const headRot = pose.lean + pose.head;
	const hs = u(P.head);
	const head = (
		<g transform={`translate(${neck[0]},${neck[1]}) rotate(${headRot})`}>
			<rect x={-hs * 0.13} y={-hs * 0.3} width={hs * 0.26} height={hs * 0.36} rx={hs * 0.1} fill={L.skin} />
			{/* skull + face profile (facing +x) */}
			<path d={`M ${-hs * 0.33} ${-hs * 0.55} C ${-hs * 0.4} ${-hs * 0.95} ${hs * 0.2} ${-hs * 1.12} ${hs * 0.36} ${-hs * 0.82}
				L ${hs * 0.4} ${-hs * 0.62} L ${hs * 0.5} ${-hs * 0.5} L ${hs * 0.4} ${-hs * 0.44} L ${hs * 0.38} ${-hs * 0.3}
				C ${hs * 0.36} ${-hs * 0.18} ${hs * 0.2} ${-hs * 0.12} ${hs * 0.05} ${-hs * 0.16} C ${-hs * 0.2} ${-hs * 0.2} ${-hs * 0.32} ${-hs * 0.32} ${-hs * 0.33} ${-hs * 0.55} Z`}
				fill={L.skin} />
			{/* hair: receding — back and sides only */}
			{L.bald ? (
				<path d={`M ${-hs * 0.36} ${-hs * 0.4} C ${-hs * 0.44} ${-hs * 0.7} ${-hs * 0.3} ${-hs * 0.86} ${-hs * 0.08} ${-hs * 0.86} C ${-hs * 0.2} ${-hs * 0.78} ${-hs * 0.16} ${-hs * 0.6} ${-hs * 0.02} ${-hs * 0.56} C ${-hs * 0.1} ${-hs * 0.44} ${-hs * 0.2} ${-hs * 0.3} ${-hs * 0.28} ${-hs * 0.24} Z`} fill={L.hair} />
			) : (
				<path d={`M ${-hs * 0.38} ${L.longHair ? -hs * 0.05 : -hs * 0.36} C ${-hs * 0.46} ${-hs * 0.9} ${hs * 0.15} ${-hs * 1.2} ${hs * 0.4} ${-hs * 0.8} C ${hs * 0.2} ${-hs * 0.86} ${hs * 0.05} ${-hs * 0.76} ${-hs * 0.05} ${-hs * 0.62} C ${-hs * 0.14} ${-hs * 0.46} ${-hs * 0.22} ${-hs * 0.3} ${-hs * 0.3} ${L.longHair ? -hs * 0.02 : -hs * 0.22} Z`} fill={L.hair} />
			)}
			<ellipse cx={-hs * 0.04} cy={-hs * 0.5} rx={hs * 0.06} ry={hs * 0.09} fill={L.skin} stroke="rgba(0,0,0,0.18)" strokeWidth={hs * 0.02} />
			<circle cx={hs * 0.27} cy={-hs * 0.6} r={hs * 0.03} fill="#1b1714" />
			<path d={`M ${hs * 0.2} ${-hs * 0.69} L ${hs * 0.34} ${-hs * 0.7}`} stroke={L.hair} strokeWidth={hs * 0.035} strokeLinecap="round" />
			{L.beard ? <path d={`M ${hs * 0.42} ${-hs * 0.4} C ${hs * 0.44} ${-hs * (0.2 - 0.12 * L.beard)} ${hs * 0.2} ${-hs * (0.02 - 0.12 * L.beard)} ${-hs * 0.02} ${-hs * 0.12} C ${-hs * 0.12} ${-hs * 0.2} ${-hs * 0.08} ${-hs * 0.36} ${-hs * 0.04} ${-hs * 0.44} C ${hs * 0.1} ${-hs * 0.34} ${hs * 0.3} ${-hs * 0.36} ${hs * 0.42} ${-hs * 0.4} Z`} fill={L.hair} opacity={0.92} /> : null}
			{L.cap ? <path d={`M ${-hs * 0.36} ${-hs * 0.66} C ${-hs * 0.36} ${-hs * 1.08} ${hs * 0.34} ${-hs * 1.1} ${hs * 0.36} ${-hs * 0.72} L ${hs * 0.66} ${-hs * 0.68} L ${hs * 0.64} ${-hs * 0.62} L ${-hs * 0.36} ${-hs * 0.62} Z`} fill={L.cap} /> : null}
			{L.mustache ? <path d={`M ${hs * 0.27} ${-hs * 0.39} Q ${hs * 0.38} ${-hs * 0.42} ${hs * 0.42} ${-hs * 0.36} Q ${hs * 0.34} ${-hs * 0.32} ${hs * 0.25} ${-hs * 0.34} Z`} fill={L.hair} /> : null}
		</g>
	);
	const hand = (p: [number, number], c: string) => <circle cx={p[0]} cy={p[1]} r={u(0.022)} fill={c} />;
	const sleeveW = u(0.052) * b, legW = u(0.07) * b;
	return (
		<g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1) rotate(${rotate})`} opacity={opacity}>
			{shadow ? <ellipse cx={u(0.02)} cy={(groundY !== undefined ? groundY - y : u(LEG_LEN)) + u(0.012)} rx={u(0.16)} ry={u(0.022)} fill="rgba(0,0,0,0.28)" /> : null}
			{/* far side */}
			{limb([fa.o, fa.el, fa.ha], sleeveW * 0.95, L.jacketShade)}
			{hand(fa.ha, L.skin)}
			{farProp ? farProp(fa.ha, fa.foreA) : null}
			{limb([[0, 0], fl.k, fl.a], legW, L.trousersShade)}
			{shoe(fl.a, fl.shinA, pose.fFoot ?? 0, L.shoes)}
			{/* torso */}
			<path d={torsoPath()} fill={L.jacket} />
			<path d={`M ${sh[0] - u(0.004)} ${sh[1] - u(0.004)} L ${sh[0] + u(0.04) * Math.cos(rad(pose.lean))} ${sh[1] + u(0.07)} L ${sh[0] + u(0.008)} ${sh[1] + u(0.09)} Z`} fill={L.shirt} />
			{/* near side */}
			{limb([[0, 0], nl.k, nl.a], legW, L.trousers)}
			{shoe(nl.a, nl.shinA, pose.nFoot ?? 0, L.shoes)}
			{head}
			{betweenHands ? betweenHands(na.ha, fa.ha) : null}
			{limb([na.o, na.el, na.ha], sleeveW, L.jacket)}
			{hand(na.ha, L.skin)}
			{nearProp ? nearProp(na.ha, na.foreA) : null}
		</g>
	);
};
