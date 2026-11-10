import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../../theme';
import {clamp, ease, rise} from '../anim';
import {Stage} from '../Stage';

const C = theme.color;

/** Horizontal animated timeline with sequential markers. */
export const Timeline: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const W = 1560;
	const x0 = (1920 - W) / 2;
	const y = 560;
	const span = shot.end - shot.start;
	const X = (yr: number) => x0 + ((yr - shot.start) / span) * W;
	const axis = interpolate(frame, [0, 26], [0, 1], {...clamp, easing: ease});
	const markers: any[] = shot.markers;
	const step = Math.min(26, (durationInFrames - 40) / Math.max(1, markers.length));
	const [h0, h1] = shot.highlight ?? [shot.start, shot.start];
	const hp = interpolate(frame, [20, 20 + markers.length * step], [0, 1], {...clamp, easing: ease});
	const ticks: number[] = [];
	const tickStep = span > 40 ? 10 : 5;
	for (let t = Math.ceil(shot.start / tickStep) * tickStep; t <= shot.end; t += tickStep) ticks.push(t);
	return (
		<Stage>
			<AbsoluteFill>
				<svg width={1920} height={1080}>
					<line x1={x0} x2={x0 + W * axis} y1={y} y2={y} stroke={C.inkFaint} strokeWidth={2} />
					{ticks.map((t) => (
						<g key={t} opacity={rise(frame, 6 + ((t - shot.start) / span) * 20, 10)}>
							<line x1={X(t)} x2={X(t)} y1={y - 8} y2={y + 8} stroke={C.inkFaint} strokeWidth={2} />
							<text x={X(t)} y={y + 46} fill={C.inkDim} fontFamily={theme.font.mono} fontSize={22} textAnchor="middle">
								{t}
							</text>
						</g>
					))}
					<rect x={X(h0)} y={y - 3} width={(X(h1) - X(h0)) * hp} height={6} fill={C.accent} />
					{markers.map((m, i) => {
						const p = rise(frame, 22 + i * step, 18);
						const up = i % 2 === 0;
						const ly = up ? y - 150 : y + 170;
						return (
							<g key={i} opacity={p}>
								<line x1={X(m.year)} x2={X(m.year)} y1={y} y2={up ? ly + 20 : ly - 60} stroke={m.disputed ? C.alert : C.accent} strokeWidth={2} strokeDasharray={m.disputed ? '6 6' : undefined} />
								<circle cx={X(m.year)} cy={y} r={10 * p} fill={C.bg} stroke={m.disputed ? C.alert : C.accent} strokeWidth={3} />
								<text x={X(m.year)} y={up ? ly - 30 : ly - 18} fill={m.disputed ? C.alert : C.accent} fontFamily={theme.font.mono} fontSize={30} textAnchor="middle">
									{m.year}
								</text>
								<text x={X(m.year)} y={up ? ly + 8 : ly + 24} fill={C.ink} fontFamily={theme.font.serif} fontSize={34} textAnchor="middle">
									{m.label}
								</text>
								{m.disputed ? (
									<text x={X(m.year)} y={up ? ly - 70 : ly + 62} fill={C.alert} fontFamily={theme.font.mono} fontSize={18} letterSpacing={3} textAnchor="middle">
										DISPUTED
									</text>
								) : null}
							</g>
						);
					})}
				</svg>
			</AbsoluteFill>
		</Stage>
	);
};
