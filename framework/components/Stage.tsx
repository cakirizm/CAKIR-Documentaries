import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';
import {push} from './anim';

/** Common background for graphic shots: deep slate with a soft light pool and
 *  a very faint architectural grid (a nod to airport floor plans). */
export const Stage: React.FC<{
	children: React.ReactNode;
	grid?: boolean;
	pushAmount?: number;
	tint?: string;
}> = ({children, grid = true, pushAmount = 0.03, tint}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const s = push(frame, durationInFrames, pushAmount);
	return (
		<AbsoluteFill style={{backgroundColor: theme.color.bg, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 70% 60% at 50% 42%, ${tint ?? 'rgba(229,161,58,0.07)'} 0%, rgba(0,0,0,0) 70%)`,
				}}
			/>
			{grid ? (
				<AbsoluteFill
					style={{
						transform: `scale(${s * 1.02})`,
						backgroundImage: `linear-gradient(${theme.color.line} 1px, transparent 1px), linear-gradient(90deg, ${theme.color.line} 1px, transparent 1px)`,
						backgroundSize: '120px 120px',
						opacity: 0.18,
						maskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, black 0%, transparent 100%)',
						WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, black 0%, transparent 100%)',
					}}
				/>
			) : null}
			<AbsoluteFill style={{transform: `scale(${s})`}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const Note: React.FC<{text?: string; style?: React.CSSProperties}> = ({text, style}) =>
	text ? (
		<div
			style={{
				fontFamily: theme.font.mono,
				fontSize: 22,
				letterSpacing: 3,
				textTransform: 'uppercase',
				color: theme.color.inkDim,
				...style,
			}}
		>
			{text}
		</div>
	) : null;
