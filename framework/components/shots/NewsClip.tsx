import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../../theme';
import {clamp, ease, rise} from '../anim';

/** Newspaper-style clipping cards that summarise contemporary reporting.
 *  Generic newsprint design (no real mastheads or logos). Each item:
 *  {source, date, headline, body?, highlight?}; `highlight` is a phrase inside
 *  headline or body that gets a marker sweep. Items appear one after another,
 *  stacked with a slight offset. A small footer states that these are summaries. */
type Item = {source: string; date: string; headline: string; body?: string; highlight?: string};

const Marked: React.FC<{text: string; mark?: string; p: number}> = ({text, mark, p}) => {
	if (!mark || !text.includes(mark)) return <>{text}</>;
	const [a, b] = text.split(mark);
	return (
		<>
			{a}
			<span style={{position: 'relative', whiteSpace: 'nowrap'}}>
				<span style={{position: 'absolute', left: -4, right: -4, top: '18%', bottom: '4%', background: 'rgba(255, 214, 64, 0.85)', transformOrigin: 'left center', transform: `scaleX(${p})`, zIndex: 0, borderRadius: 3}} />
				<span style={{position: 'relative', zIndex: 1}}>{mark}</span>
			</span>
			{b}
		</>
	);
};

export const NewsClip: React.FC<{shot: any; background?: React.ReactNode}> = ({shot, background}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	const items: Item[] = shot.items ?? [];
	const gap = Math.max(1.2 * fps, Math.min(3.2 * fps, (durationInFrames - fps) / Math.max(1, items.length)));
	const push = interpolate(frame, [0, durationInFrames], [1, 1.05], {...clamp, easing: ease});
	return (
		<AbsoluteFill style={{backgroundColor: '#0d1013', overflow: 'hidden'}}>
			{background ? <AbsoluteFill style={{filter: 'blur(14px) brightness(0.35)', transform: 'scale(1.1)'}}>{background}</AbsoluteFill> : null}
			<AbsoluteFill style={{transform: `scale(${push})`}}>
				{items.map((it, i) => {
					const st = Math.round(i * gap);
					const t = frame - st;
					if (t < 0) return null;
					const inn = rise(frame, st, 14);
					const mark = interpolate(t, [16, 34], [0, 1], {...clamp, easing: ease});
					const n = items.length;
					const x = 960 + (i - (n - 1) / 2) * 190;
					const y = (n >= 3 ? 520 : 450) + (i - (n - 1) / 2) * 175;
					const rot = [-2.2, 1.6, -0.8, 2.4][i % 4];
					return (
						<div key={i} style={{position: 'absolute', left: x, top: y, width: 1040, transform: `translate(-50%, -50%) translateY(${(1 - inn) * 40}px) rotate(${rot}deg)`, opacity: inn,
							background: 'linear-gradient(170deg, #f3eee2 0%, #e9e2d1 60%, #ded5c0 100%)', boxShadow: '0 26px 70px rgba(0,0,0,0.65)', padding: '34px 46px 30px',
							clipPath: 'polygon(0 1%, 3% 0, 22% 1.2%, 47% 0.2%, 71% 1.4%, 96% 0, 100% 2%, 99.4% 34%, 100% 67%, 99.2% 98%, 96% 100%, 70% 98.8%, 44% 100%, 18% 98.9%, 2% 100%, 0 97%, 0.7% 62%, 0 30%)'}}>
							<div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2b2a27', paddingBottom: 10, fontFamily: theme.font.mono, fontSize: 19, letterSpacing: 3, color: '#3a3833', textTransform: 'uppercase'}}>
								<span>{it.source}</span>
								<span>{it.date}</span>
							</div>
							<div style={{fontFamily: theme.font.serif, fontWeight: 700, fontSize: 54, lineHeight: 1.12, color: '#141311', marginTop: 18}}>
								<Marked text={it.headline} mark={it.highlight} p={mark} />
							</div>
							{it.body ? (
								<div style={{fontFamily: theme.font.serif, fontSize: 27, lineHeight: 1.42, color: '#2e2c28', marginTop: 16, maxWidth: 900}}>
									<Marked text={it.body} mark={it.highlight} p={mark} />
								</div>
							) : null}
						</div>
					);
				})}
			</AbsoluteFill>
			<div style={{position: 'absolute', left: theme.safe.x, bottom: 210, fontFamily: theme.font.mono, fontSize: 16, letterSpacing: 2, color: 'rgba(236,229,216,0.6)', textTransform: 'uppercase', opacity: rise(frame, 8, 20)}}>
				{shot.footer ?? 'Summary of contemporary news reports · not a reproduction'}
			</div>
		</AbsoluteFill>
	);
};
