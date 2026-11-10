import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {theme} from '../../theme';
import {rand, rise} from '../anim';
import {Stage} from '../Stage';

/** Abstract passenger-flow visualisation: hundreds of travellers stream
 *  through a concourse in perspective; one point of light stays still. */
export const Crowd: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const night = !!shot.night;
	const N = night ? 70 : 220;
	const horizon = 360;
	const items = Array.from({length: N}, (_, i) => {
		const depth = rand(i * 3.1); // 0 far .. 1 near
		const dir = rand(i * 7.7) > 0.5 ? 1 : -1;
		const speed = (0.6 + rand(i * 1.3) * 1.6) * (0.4 + depth);
		const x0 = rand(i * 5.3) * 2400 - 240;
		const x = ((((x0 + dir * speed * frame * 3) % 2400) + 2400) % 2400) - 240;
		const y = horizon + depth * 600;
		const size = 2 + depth * 9;
		const len = size * (2 + speed * 3);
		return {x, y, size, len, dir, a: 0.25 + depth * 0.6};
	});
	const pulse = (frame % 60) / 60;
	return (
		<Stage grid={false} tint={night ? 'rgba(80,110,160,0.10)' : 'rgba(229,161,58,0.06)'} pushAmount={0.04}>
			<AbsoluteFill>
				<svg width={1920} height={1080} style={{opacity: rise(frame, 0, 14)}}>
					<defs>
						<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="rgba(236,229,216,0)" />
							<stop offset="1" stopColor="rgba(236,229,216,0.06)" />
						</linearGradient>
					</defs>
					<rect x={0} y={horizon} width={1920} height={1080 - horizon} fill="url(#floor)" />
					{Array.from({length: 14}, (_, i) => (
						<line key={i} x1={960} y1={horizon - 120} x2={-600 + i * 240} y2={1080} stroke={theme.color.line} strokeWidth={1} opacity={0.5} />
					))}
					{Array.from({length: 6}, (_, i) => {
						const yy = horizon + Math.pow(i / 6, 1.8) * 720;
						return <line key={i} x1={0} x2={1920} y1={yy} y2={yy} stroke={theme.color.line} strokeWidth={1} opacity={0.35} />;
					})}
					{items.map((p, i) => (
						<rect key={i} x={p.dir > 0 ? p.x - p.len : p.x} y={p.y - p.size / 2} width={p.len} height={p.size} rx={p.size / 2} fill={theme.color.ink} opacity={p.a * (night ? 0.6 : 0.8)} />
					))}
					<g>
						<circle cx={960} cy={720} r={10 + pulse * 70} fill="none" stroke={theme.color.accent} strokeWidth={2} opacity={(1 - pulse) * 0.9} />
						<circle cx={960} cy={720} r={11} fill={theme.color.accent} />
						<circle cx={960} cy={720} r={40} fill={theme.color.accent} opacity={0.12} />
					</g>
				</svg>
			</AbsoluteFill>
		</Stage>
	);
};
