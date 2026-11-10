import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {theme} from '../theme';
import {Logo} from './overlays/Overlays';

const C = theme.color;

/** YouTube thumbnail template (1280×720). Pass `photo` (path under /public)
 *  for the archival-photo version; without it a graphic version is drawn. */
export const Thumbnail: React.FC<{headline: string; subline: string; photo: string | null; focus?: [number, number]}> = ({headline, subline, photo, focus = [0.6, 0.35]}) => {
	return (
		<AbsoluteFill style={{backgroundColor: C.bg, overflow: 'hidden'}}>
			{photo ? (
				<Img src={staticFile(photo)} style={{position: 'absolute', right: 0, top: 0, height: '100%', width: '62%', objectFit: 'cover', objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`, filter: `${theme.grade} contrast(1.12)`}} />
			) : (
				<svg width={1280} height={720} style={{position: 'absolute'}}>
					{Array.from({length: 7}, (_, i) => {
						const a = (-90 + i * (360 / 7) + 18) * (Math.PI / 180);
						return <circle key={i} cx={930 + Math.cos(a) * 300} cy={360 + Math.sin(a) * 260} r={34} fill="none" stroke={C.inkFaint} strokeWidth={3} />;
					})}
					<circle cx={930} cy={360} r={170} fill="none" stroke={C.ink} strokeWidth={5} />
					<circle cx={930} cy={360} r={120} fill="none" stroke={C.inkFaint} strokeWidth={2} />
					<circle cx={930} cy={360} r={70} fill="rgba(255,255,255,0.03)" stroke={C.inkFaint} strokeWidth={2} />
					<circle cx={930 + Math.cos(2.5) * 130} cy={360 + Math.sin(2.5) * 130} r={60} fill={C.accent} opacity={0.15} />
					<circle cx={930 + Math.cos(2.5) * 130} cy={360 + Math.sin(2.5) * 130} r={16} fill={C.accent} />
				</svg>
			)}
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(13,16,20,1) 30%, rgba(13,16,20,0.85) 45%, rgba(13,16,20,0) 75%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 90% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)'}} />
			<div style={{position: 'absolute', left: 70, top: 150}}>
				<div style={{fontFamily: theme.font.sans, fontWeight: 600, fontSize: 168, lineHeight: 0.95, color: C.ink, letterSpacing: -2}}>
					{headline.split(' ')[0]}
					<br />
					<span style={{color: C.accent}}>{headline.split(' ').slice(1).join(' ')}</span>
				</div>
				<div style={{marginTop: 26, fontFamily: theme.font.mono, fontWeight: 500, fontSize: 46, letterSpacing: 10, color: C.ink}}>{subline}</div>
			</div>
			<div style={{position: 'absolute', left: 74, bottom: 50, opacity: 0.85}}>
				<Logo size={0.8} />
			</div>
		</AbsoluteFill>
	);
};
