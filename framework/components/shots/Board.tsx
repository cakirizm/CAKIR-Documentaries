import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {theme} from '../../theme';
import {rand, rise} from '../anim';
import {Note, Stage} from '../Stage';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:';
const COLS = [6, 14, 10];

/** Split-flap style information board. A motion graphic, not footage. */
const Cell: React.FC<{ch: string; settle: number; seed: number; color: string}> = ({ch, settle, seed, color}) => {
	const frame = useCurrentFrame();
	const flipping = frame < settle;
	const shown = flipping ? GLYPHS[Math.floor(rand(seed + Math.floor(frame / 2)) * GLYPHS.length)] : ch;
	const phase = flipping ? (frame % 2) / 2 : 0;
	return (
		<div
			style={{
				width: 46,
				height: 66,
				margin: 2,
				background: '#16191d',
				borderRadius: 3,
				position: 'relative',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: theme.font.mono,
				fontWeight: 500,
				fontSize: 44,
				color,
				boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.5)',
				transform: `scaleY(${1 - phase * 0.3})`,
			}}
		>
			{shown === ' ' ? '' : shown}
			<div style={{position: 'absolute', left: 0, right: 0, top: 32, height: 2, background: 'rgba(0,0,0,0.65)'}} />
		</div>
	);
};

export const Board: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const header = shot.mode === 'arrivals' ? 'ARRIVÉES  ·  ARRIVALS' : 'DÉPARTS  ·  DEPARTURES';
	return (
		<Stage grid={false} tint="rgba(229,161,58,0.06)" pushAmount={0.045}>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div style={{padding: '40px 50px', background: '#0a0c0f', border: '1px solid #222', borderRadius: 8, opacity: rise(frame, 0, 14)}}>
					<div style={{fontFamily: theme.font.sans, fontWeight: 600, letterSpacing: 8, fontSize: 30, color: theme.color.ink, marginBottom: 28, display: 'flex', justifyContent: 'space-between'}}>
						<span>{header}</span>
						<span style={{color: theme.color.accent}}>CDG</span>
					</div>
					{shot.rows.map((row: string[], r: number) => (
						<div key={r} style={{display: 'flex', gap: 34, marginBottom: 6}}>
							{row.map((txt, c) => {
								const padded = txt.toUpperCase().padEnd(COLS[c], ' ').slice(0, COLS[c]);
								const color = c === 2 ? (/(DELAY|CANCEL)/.test(padded) ? theme.color.alert : theme.color.accent) : theme.color.ink;
								return (
									<div key={c} style={{display: 'flex'}}>
										{padded.split('').map((ch, i) => (
											<Cell key={i} ch={ch} color={color} seed={r * 100 + c * 20 + i} settle={8 + r * 7 + c * 5 + i * 1.5 + rand(r * 9 + i) * 10} />
										))}
									</div>
								);
							})}
						</div>
					))}
				</div>
			</AbsoluteFill>
			{shot.illustrative ? <Note text="Illustrative graphic" style={{position: 'absolute', right: 140, bottom: 110, fontSize: 18}} /> : null}
		</Stage>
	);
};
