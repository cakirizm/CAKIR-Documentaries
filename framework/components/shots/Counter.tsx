import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../../theme';
import {clamp, ease, rise} from '../anim';
import {Note, Stage} from '../Stage';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** Day counter: dates roll from fromDate to toDate across the shot. */
export const Counter: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const a = new Date(shot.fromDate + 'T12:00:00Z').getTime();
	const b = new Date(shot.toDate + 'T12:00:00Z').getTime();
	const totalDays = Math.round((b - a) / 86400000);
	const end = shot.final ? Math.min(durationInFrames - 10, 70) : durationInFrames - 15;
	const p = interpolate(frame, [8, end], [0, 1], {...clamp, easing: ease});
	const days = Math.round(p * totalDays);
	const d = new Date(a + days * 86400000);
	const dateStr = `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
	return (
		<Stage>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 18}}>
				<Note text={shot.label} style={{opacity: rise(frame, 0, 16)}} />
				<div style={{fontFamily: theme.font.serif, fontSize: 240, color: theme.color.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
					{days.toLocaleString('en-US')}
				</div>
				<div style={{fontFamily: theme.font.mono, fontSize: 44, letterSpacing: 8, color: theme.color.accent}}>{dateStr}</div>
				<div style={{width: 900, height: 2, background: theme.color.line, marginTop: 40}}>
					<div style={{width: `${p * 100}%`, height: 2, background: theme.color.accent}} />
				</div>
			</AbsoluteFill>
		</Stage>
	);
};
