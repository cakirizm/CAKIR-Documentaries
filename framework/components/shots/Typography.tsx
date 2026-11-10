import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../../theme';
import {clamp, rise} from '../anim';
import {Note, Stage} from '../Stage';

const C = theme.color;
const center: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
	padding: `0 ${theme.safe.x * 1.6}px`,
};

/** Words appear one by one with a soft blur-to-sharp reveal. */
export const RevealText: React.FC<{text: string; start?: number; per?: number; style?: React.CSSProperties}> = ({
	text,
	start = 6,
	per = 3,
	style,
}) => {
	const frame = useCurrentFrame();
	const words = text.split(' ');
	return (
		<div style={style}>
			{words.map((w, i) => {
				const p = rise(frame, start + i * per, 16);
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							opacity: p,
							filter: `blur(${(1 - p) * 8}px)`,
							transform: `translateY(${(1 - p) * 14}px)`,
							marginRight: '0.26em',
						}}
					>
						{w}
					</span>
				);
			})}
		</div>
	);
};

export const Statement: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const words = String(shot.text).split(' ').length;
	return (
		<Stage>
			<AbsoluteFill style={{...center, flexDirection: 'column', gap: 44}}>
				<RevealText
					text={shot.text}
					style={{fontFamily: theme.font.serif, fontSize: 84, lineHeight: 1.18, color: C.ink, textAlign: 'center', maxWidth: 1450}}
				/>
				<div style={{width: interpolate(frame, [words * 3 + 10, words * 3 + 40], [0, 120], clamp), height: 2, background: C.accent}} />
				<Note text={shot.note} style={{opacity: rise(frame, words * 3 + 20, 20)}} />
			</AbsoluteFill>
		</Stage>
	);
};

export const NameCard: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const spacing = interpolate(frame, [0, 90], [18, 6], clamp);
	return (
		<Stage>
			<AbsoluteFill style={{...center, flexDirection: 'column', gap: 34}}>
				<div style={{width: interpolate(frame, [4, 40], [0, 900], clamp), height: 1, background: C.inkFaint}} />
				<div
					style={{
						fontFamily: theme.font.serif,
						fontSize: 112,
						color: C.ink,
						letterSpacing: spacing,
						opacity: rise(frame, 6, 30),
						textAlign: 'center',
					}}
				>
					{shot.name}
				</div>
				<Note text={shot.sub} style={{opacity: rise(frame, 24, 24), letterSpacing: 6, fontSize: 26}} />
				<div style={{width: interpolate(frame, [4, 40], [0, 900], clamp), height: 1, background: C.inkFaint}} />
			</AbsoluteFill>
		</Stage>
	);
};

export const TitleCard: React.FC<{shot: any; background?: React.ReactNode}> = ({shot, background}) => {
	const frame = useCurrentFrame();
	const lines = String(shot.title).split('\n');
	return (
		<Stage grid={false} tint="rgba(229,161,58,0.10)">
			{background ? (
				<AbsoluteFill>
					{background}
					<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(13,16,20,0.55) 0%, rgba(13,16,20,0.88) 100%)'}} />
				</AbsoluteFill>
			) : null}
			<AbsoluteFill style={{...center, flexDirection: 'column', gap: 26}}>
				<Note text={shot.kicker} style={{opacity: rise(frame, 4, 24), letterSpacing: 10, color: C.accent}} />
				{lines.map((l, i) => (
					<div
						key={i}
						style={{
							fontFamily: theme.font.serif,
							fontSize: 128,
							lineHeight: 1.0,
							color: C.ink,
							opacity: rise(frame, 12 + i * 12, 34),
							transform: `translateY(${(1 - rise(frame, 12 + i * 12, 40)) * 30}px)`,
							fontStyle: i === 1 ? 'italic' : 'normal',
						}}
					>
						{l}
					</div>
				))}
				<div style={{marginTop: 18, width: interpolate(frame, [30, 70], [0, 260], clamp), height: 2, background: C.accent}} />
			</AbsoluteFill>
		</Stage>
	);
};

export const Myth: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const strike = interpolate(frame, [26, 50], [0, 100], clamp);
	return (
		<Stage>
			<AbsoluteFill style={{...center, flexDirection: 'column', alignItems: 'flex-start', gap: 30, paddingLeft: 260}}>
				<Note text="Often repeated" style={{opacity: rise(frame, 0, 16)}} />
				<div style={{position: 'relative', fontFamily: theme.font.serif, fontSize: 76, color: C.inkDim, opacity: rise(frame, 4, 20)}}>
					{shot.myth}
					<div style={{position: 'absolute', left: 0, top: '54%', height: 5, width: `${strike}%`, background: C.alert}} />
				</div>
				<div style={{height: 40}} />
				<Note text="What reports show" style={{opacity: rise(frame, 54, 16), color: C.accent}} />
				<RevealText text={shot.fact} start={60} style={{fontFamily: theme.font.serif, fontSize: 84, color: C.ink}} />
			</AbsoluteFill>
		</Stage>
	);
};

export const Routine: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const items: string[] = shot.items;
	const step = Math.max(10, (durationInFrames - 30) / items.length);
	return (
		<Stage>
			<AbsoluteFill style={{...center}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 0}}>
					{items.map((it, i) => {
						const p = rise(frame, 6 + i * step * 0.5, 18);
						const active = frame >= 6 + i * step && frame < 6 + (i + 1) * step;
						return (
							<React.Fragment key={i}>
								{i > 0 ? <div style={{width: 70, height: 1, background: C.inkFaint, opacity: p}} /> : null}
								<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: p, padding: '0 22px'}}>
									<div
										style={{
											width: 16,
											height: 16,
											borderRadius: 8,
											background: active ? C.accent : 'transparent',
											border: `2px solid ${active ? C.accent : C.inkFaint}`,
											boxShadow: active ? `0 0 24px ${C.accent}` : 'none',
										}}
									/>
									<div style={{fontFamily: theme.font.serif, fontSize: 58, color: active ? C.ink : C.inkDim}}>{it}</div>
								</div>
							</React.Fragment>
						);
					})}
				</div>
			</AbsoluteFill>
		</Stage>
	);
};

export const Works: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	return (
		<Stage>
			<AbsoluteFill style={{...center, flexDirection: 'column', alignItems: 'stretch', padding: '0 360px', gap: 0}}>
				{shot.items.map((w: any, i: number) => {
					const p = rise(frame, 8 + i * 26, 24);
					return (
						<div
							key={i}
							style={{
								display: 'flex',
								alignItems: 'baseline',
								gap: 60,
								padding: '38px 0',
								borderTop: `1px solid ${C.line}`,
								borderBottom: i === shot.items.length - 1 ? `1px solid ${C.line}` : undefined,
								opacity: p,
								transform: `translateX(${(1 - p) * -40}px)`,
							}}
						>
							<div style={{fontFamily: theme.font.mono, fontSize: 40, color: C.accent, width: 140}}>{w.year}</div>
							<div style={{fontFamily: theme.font.serif, fontStyle: 'italic', fontSize: 76, color: C.ink, flex: 1}}>{w.title}</div>
							<div style={{fontFamily: theme.font.mono, fontSize: 22, letterSpacing: 2, color: C.inkDim, textTransform: 'uppercase'}}>{w.kind}</div>
						</div>
					);
				})}
			</AbsoluteFill>
		</Stage>
	);
};

export const FilmCard: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const spacing = interpolate(frame, [0, 120], [40, 26], clamp);
	return (
		<Stage grid={false} tint="rgba(120,150,190,0.10)">
			<AbsoluteFill style={{...center, flexDirection: 'column', gap: 30}}>
				<Note text={shot.year} style={{opacity: rise(frame, 4, 20), color: C.accent, letterSpacing: 12, fontSize: 30}} />
				<div style={{fontFamily: theme.font.sans, fontWeight: 300, fontSize: 130, letterSpacing: spacing, color: C.ink, opacity: rise(frame, 8, 30), paddingLeft: spacing}}>
					{shot.title}
				</div>
				{shot.lines.map((l: string, i: number) => (
					<div key={i} style={{fontFamily: theme.font.serif, fontSize: 40, color: C.inkDim, opacity: rise(frame, 26 + i * 10, 20)}}>
						{l}
					</div>
				))}
				<div style={{height: 20}} />
				<Note text={shot.note} style={{opacity: rise(frame, 50, 20)}} />
			</AbsoluteFill>
		</Stage>
	);
};

export const Figure: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const digits = String(shot.value);
	return (
		<Stage>
			<AbsoluteFill style={{...center, flexDirection: 'column', gap: 30}}>
				<div style={{fontFamily: theme.font.serif, fontSize: 210, color: C.ink, display: 'flex'}}>
					{digits.split('').map((d, i) => (
						<span key={i} style={{opacity: rise(frame, 4 + i * 3, 14), transform: `translateY(${(1 - rise(frame, 4 + i * 3, 20)) * 40}px)`, display: 'inline-block'}}>
							{d}
						</span>
					))}
				</div>
				<div style={{fontFamily: theme.font.serif, fontSize: 44, color: C.inkDim, opacity: rise(frame, 30, 20)}}>{shot.label}</div>
				<Note text={shot.note} style={{opacity: rise(frame, 44, 20), color: C.accent}} />
			</AbsoluteFill>
		</Stage>
	);
};

export const Identity: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const col = (title: string, lines: string[], start: number, accent: boolean) => {
		const p = rise(frame, start, 24);
		return (
			<div style={{flex: 1, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, padding: '50px 60px', border: `1px solid ${accent ? C.accentDim : C.line}`, background: 'rgba(255,255,255,0.02)'}}>
				<Note text={title} style={{color: accent ? C.accent : C.inkDim, marginBottom: 34}} />
				{lines.map((l, i) => (
					<div key={i} style={{fontFamily: i === 0 ? theme.font.serif : theme.font.mono, fontSize: i === 0 ? 62 : 32, color: C.ink, marginBottom: 18}}>
						{l}
					</div>
				))}
			</div>
		);
	};
	return (
		<Stage>
			<AbsoluteFill style={{...center, flexDirection: 'column', gap: 50}}>
				<div style={{display: 'flex', gap: 60, width: 1500}}>
					{col('The papers offered', shot.offered, 6, false)}
					{col('How he wished to be named', shot.wanted, 40, true)}
				</div>
				<Note text={shot.note} style={{opacity: rise(frame, 70, 20)}} />
			</AbsoluteFill>
		</Stage>
	);
};

export const Obituary: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	return (
		<Stage grid={false} tint="rgba(236,229,216,0.05)" pushAmount={0.02}>
			<AbsoluteFill style={{...center, flexDirection: 'column', gap: 30}}>
				<div style={{fontFamily: theme.font.serif, fontSize: 104, color: C.ink, opacity: rise(frame, 6, 50)}}>{shot.name}</div>
				<div style={{fontFamily: theme.font.mono, fontSize: 34, letterSpacing: 6, color: C.accent, opacity: rise(frame, 34, 40)}}>{shot.dates}</div>
				<div style={{width: interpolate(frame, [40, 90], [0, 220], clamp), height: 1, background: C.inkFaint}} />
				<div style={{fontFamily: theme.font.serif, fontStyle: 'italic', fontSize: 40, color: C.inkDim, opacity: rise(frame, 60, 40)}}>{shot.line}</div>
			</AbsoluteFill>
		</Stage>
	);
};

export const Documents: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	return (
		<Stage>
			<AbsoluteFill style={{...center, flexDirection: 'column', gap: 0}}>
				<div style={{width: 1240}}>
					{shot.items.map(([label, status]: [string, string], i: number) => {
						const p = rise(frame, 8 + i * 22, 20);
						const stamp = rise(frame, 20 + i * 22, 10);
						return (
							<div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '40px 10px', borderBottom: `1px solid ${C.line}`, opacity: p}}>
								<div style={{fontFamily: theme.font.serif, fontSize: 64, color: C.ink}}>{label}</div>
								<div
									style={{
										fontFamily: theme.font.mono,
										fontWeight: 500,
										fontSize: 34,
										letterSpacing: 6,
										color: C.alert,
										border: `3px solid ${C.alert}`,
										padding: '10px 22px',
										opacity: stamp,
										transform: `scale(${1.6 - stamp * 0.6}) rotate(-3deg)`,
									}}
								>
									{status}
								</div>
							</div>
						);
					})}
				</div>
				<Note text={shot.note} style={{marginTop: 60, opacity: rise(frame, 60, 20)}} />
			</AbsoluteFill>
		</Stage>
	);
};
