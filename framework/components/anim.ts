import {Easing, interpolate} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** 0→1 over [start, start+dur] frames, eased */
export const rise = (frame: number, start: number, dur: number, e = easeOut) =>
	interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: e});

/** fade-in then hold then fade-out envelope for overlays */
export const envelope = (frame: number, total: number, inF = 12, outF = 12) =>
	interpolate(frame, [0, inF, total - outF, total], [0, 1, 1, 0], clamp);

/** deterministic pseudo random in [0,1) */
export const rand = (seed: number) => {
	const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};

/** slow camera push used on every shot so nothing is ever fully static */
export const push = (frame: number, dur: number, amount = 0.035) =>
	1 + interpolate(frame, [0, Math.max(1, dur)], [0, amount], clamp);
