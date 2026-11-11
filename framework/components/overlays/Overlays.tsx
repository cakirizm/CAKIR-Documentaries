import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../../theme';
import {clamp, envelope, rise} from '../anim';

const C = theme.color;

/** Typewriter date/location indicator, top-left. */
export const Stamp: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const n = Math.floor(interpolate(frame, [4, 4 + text.length * 1.2], [0, text.length], clamp));
	return (
		<AbsoluteFill style={{opacity: envelope(frame, durationInFrames, 6, 16)}}>
			<div style={{position: 'absolute', left: theme.safe.x, top: theme.safe.y + 150, display: 'flex', alignItems: 'center', gap: 16}}>
				<div style={{width: 12, height: 12, borderRadius: 6, background: C.accent, opacity: frame % 30 < 20 ? 1 : 0.3}} />
				<div style={{fontFamily: theme.font.mono, fontWeight: 500, fontSize: 28, letterSpacing: 5, color: C.ink, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>
					{text.slice(0, n)}
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const LowerThird: React.FC<{text: string; sub?: string}> = ({text, sub}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const w = interpolate(frame, [0, 18], [0, 1], clamp);
	return (
		<AbsoluteFill style={{opacity: envelope(frame, durationInFrames, 4, 16)}}>
			<div style={{position: 'absolute', left: 0, bottom: 0, width: 1100, height: 520, background: 'linear-gradient(20deg, rgba(8,10,13,0.92) 0%, rgba(8,10,13,0.7) 40%, rgba(8,10,13,0) 75%)'}} />
			<div style={{position: 'absolute', left: theme.safe.x, bottom: theme.lowerThirdBottom}}>
				<div style={{width: 80 * w, height: 3, background: C.accent, marginBottom: 18}} />
				<div style={{fontFamily: theme.font.serif, fontSize: 54, color: C.ink, opacity: rise(frame, 6, 14), textShadow: '0 2px 18px rgba(0,0,0,0.85)'}}>{text}</div>
				{sub ? (
					<div style={{fontFamily: theme.font.mono, fontSize: 22, letterSpacing: 3, color: C.inkDim, marginTop: 10, opacity: rise(frame, 12, 14), textShadow: '0 2px 12px rgba(0,0,0,0.85)'}}>{sub}</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

export const Disputed: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<AbsoluteFill style={{opacity: envelope(frame, durationInFrames, 8, 14)}}>
			<div style={{position: 'absolute', right: theme.safe.x, top: theme.safe.y, padding: '12px 20px', border: `2px solid ${C.alert}`, fontFamily: theme.font.mono, fontSize: 20, letterSpacing: 3, color: C.alert, textTransform: 'uppercase', background: 'rgba(13,16,20,0.7)'}}>
				{text}
			</div>
		</AbsoluteFill>
	);
};

export const ChapterLabel: React.FC<{index: number; title: string}> = ({index, title}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const w = interpolate(frame, [0, 20], [0, 1], clamp);
	return (
		<AbsoluteFill style={{opacity: envelope(frame, durationInFrames, 6, 20)}}>
			<div style={{position: 'absolute', left: theme.safe.x, top: theme.safe.y}}>
				<div style={{fontFamily: theme.font.mono, fontSize: 20, letterSpacing: 6, color: C.accent, marginBottom: 12}}>
					CHAPTER {String(index).padStart(2, '0')}
				</div>
				<div style={{width: 340 * w, height: 1, background: C.inkFaint, marginBottom: 14}} />
				<div style={{fontFamily: theme.font.serif, fontSize: 40, color: C.ink, textShadow: '0 2px 14px rgba(0,0,0,0.8)', opacity: rise(frame, 6, 16)}}>{title}</div>
			</div>
		</AbsoluteFill>
	);
};

/** Minimal CAKIR wordmark: an open aperture ring + spaced capitals. */
export const Logo: React.FC<{size?: number; color?: string; accent?: string; draw?: number}> = ({size = 1, color = C.ink, accent = C.accent, draw = 1}) => {
	const r = 22 * size;
	const circ = 2 * Math.PI * r;
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 18 * size}}>
			<svg width={r * 2 + 8 * size} height={r * 2 + 8 * size}>
				<circle cx={r + 4 * size} cy={r + 4 * size} r={r} fill="none" stroke={color} strokeWidth={3.2 * size} strokeDasharray={`${circ * 0.78 * draw} ${circ}`} transform={`rotate(40 ${r + 4 * size} ${r + 4 * size})`} strokeLinecap="round" />
				<circle cx={r + 4 * size} cy={r + 4 * size} r={5 * size * draw} fill={accent} />
			</svg>
			<div style={{fontFamily: theme.font.sans, fontWeight: 600, fontSize: 34 * size, letterSpacing: 12 * size, color, paddingLeft: 2}}>CAKIR</div>
		</div>
	);
};

export const LogoBug: React.FC = () => (
	<div style={{position: 'absolute', right: theme.safe.x - 40, top: theme.safe.y - 40, opacity: theme.logoBugOpacity}}>
		<Logo size={0.55} />
	</div>
);

/** Film grain + vignette — the shared "look" layer. */
export const FilmLook: React.FC = () => {
	const frame = useCurrentFrame();
	const i = frame % 4;
	const ox = Math.floor(((frame * 37) % 300) - 150);
	const oy = Math.floor(((frame * 53) % 200) - 100);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
			<Img
				src={staticFile(`framework/grain${i}.png`)}
				style={{position: 'absolute', left: -200 + ox, top: -120 + oy, width: 2400, height: 1350, opacity: 0.07, mixBlendMode: 'overlay'}}
			/>
		</AbsoluteFill>
	);
};

export const EndCard: React.FC<{lines: string[]}> = ({lines}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const draw = interpolate(frame, [6, 50], [0, 1], clamp);
	return (
		<AbsoluteFill style={{backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 50, opacity: interpolate(frame, [0, 14, durationInFrames - 20, durationInFrames], [0, 1, 1, 0], clamp)}}>
			<div style={{opacity: rise(frame, 4, 24)}}>
				<Logo size={2.2} draw={draw} />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: rise(frame, 40, 24)}}>
				{lines.map((l, i) => (
					<div key={i} style={{fontFamily: theme.font.mono, fontSize: 20, letterSpacing: 3, color: C.inkDim, textTransform: 'uppercase'}}>
						{l}
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};

/** Attributed quotation over footage (published quotes only). */
export const Quote: React.FC<{text: string; attribution: string}> = ({text, attribution}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<AbsoluteFill style={{opacity: envelope(frame, durationInFrames, 14, 18)}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 42%, rgba(8,10,13,0.72) 0%, rgba(8,10,13,0.35) 100%)'}} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 30, padding: '0 260px', paddingBottom: 120}}>
				<div style={{fontFamily: theme.font.serif, fontStyle: 'italic', fontSize: 64, lineHeight: 1.25, color: C.ink, textAlign: 'center', textShadow: '0 2px 20px rgba(0,0,0,0.8)', opacity: rise(frame, 6, 20)}}>{text}</div>
				<div style={{width: interpolate(frame, [14, 40], [0, 120], clamp), height: 2, background: C.accent}} />
				<div style={{fontFamily: theme.font.mono, fontSize: 24, letterSpacing: 4, color: C.inkDim, textTransform: 'uppercase', opacity: rise(frame, 20, 20)}}>{attribution}</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
