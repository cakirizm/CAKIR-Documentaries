import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../../theme';
import {clamp, ease, rise} from '../anim';
import {Note, Stage} from '../Stage';

const C = theme.color;

/** Schematic of a circular terminal building with satellite gates
 *  (Charles de Gaulle Terminal 1 is a round building with seven satellites).
 *  Labelled on screen as an illustrative diagram, not a plan to scale. */
export const Terminal: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const draw = interpolate(frame, [0, 50], [0, 1], {...clamp, easing: ease});
	const zoom = shot.focus ? interpolate(frame, [0, durationInFrames], [1, 1.5], {...clamp, easing: ease}) : 1;
	const cx = 960;
	const cy = 540;
	const R = 220;
	const sats = Array.from({length: 7}, (_, i) => {
		const a = (-90 + i * (360 / 7) + 18) * (Math.PI / 180);
		return {x: cx + Math.cos(a) * 420, y: cy + Math.sin(a) * 360, a};
	});
	// "bench" — a single point on the ring
	const bx = cx + Math.cos(2.5) * (R - 40);
	const by = cy + Math.sin(2.5) * (R - 40);
	const dot = shot.empty ? interpolate(frame, [20, 70], [1, 0], clamp) : rise(frame, 40, 20);
	const pulse = (frame % 50) / 50;
	const circ = 2 * Math.PI * R;
	return (
		<Stage pushAmount={0.02}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${bx}px ${by}px`}}>
				<svg width={1920} height={1080}>
					{sats.map((s, i) => (
						<g key={i} opacity={rise(frame, 20 + i * 4, 16)}>
							<line x1={cx + Math.cos(s.a) * R} y1={cy + Math.sin(s.a) * R} x2={s.x} y2={s.y} stroke={C.inkFaint} strokeWidth={2} strokeDasharray="4 8" />
							<circle cx={s.x} cy={s.y} r={46} fill="none" stroke={C.inkFaint} strokeWidth={2} />
						</g>
					))}
					{[R, R - 60, R - 120].map((r, i) => (
						<circle key={i} cx={cx} cy={cy} r={r} fill={i === 2 ? 'rgba(255,255,255,0.02)' : 'none'} stroke={i === 0 ? C.ink : C.inkFaint} strokeWidth={i === 0 ? 3 : 1.5} strokeDasharray={`${circ * draw} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} />
					))}
					{Array.from({length: 24}, (_, i) => {
						const a = (i / 24) * Math.PI * 2;
						return <line key={i} x1={cx + Math.cos(a) * (R - 120)} y1={cy + Math.sin(a) * (R - 120)} x2={cx + Math.cos(a) * R} y2={cy + Math.sin(a) * R} stroke={C.line} strokeWidth={1} opacity={draw} />;
					})}
					<g opacity={dot}>
						<circle cx={bx} cy={by} r={8 + pulse * 40} fill="none" stroke={C.accent} strokeWidth={2} opacity={1 - pulse} />
						<circle cx={bx} cy={by} r={9} fill={C.accent} />
					</g>
				</svg>
			</AbsoluteFill>
			<AbsoluteFill style={{justifyContent: 'flex-end', padding: `0 ${theme.safe.x}px ${theme.safe.y + 40}px`, flexDirection: 'column', gap: 12}}>
				<div style={{fontFamily: theme.font.serif, fontSize: 52, color: C.ink, opacity: rise(frame, 16, 20)}}>{shot.caption}</div>
				<Note text={shot.note} style={{fontSize: 18, opacity: rise(frame, 24, 20)}} />
			</AbsoluteFill>
		</Stage>
	);
};
