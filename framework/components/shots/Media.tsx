import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../../theme';
import {clamp, ease, rise} from '../anim';

export type Asset = {
	id: string;
	kind: 'photo' | 'video';
	file: string; // path under /public
	credit: string; // on-screen attribution line
	modern?: boolean; // modern footage — caption must say so
	caption?: string; // e.g. "Terminal 1, January 2006" or "Modern footage · illustrative"
	focus?: [number, number]; // Ken Burns focal point (0..1)
	trimStartSec?: number;
};

/** Archival photograph or licensed clip with a consistent grade,
 *  subtle Ken Burns motion and a mandatory on-screen credit. */
export const Media: React.FC<{asset: Asset; shot: any}> = ({asset, shot}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	const [fx, fy] = asset.focus ?? [0.5, 0.45];
	const kb = shot.kenBurns ?? 'in';
	const s = interpolate(frame, [0, durationInFrames], kb === 'out' ? [1.14, 1.04] : [1.04, 1.14], {...clamp, easing: ease});
	const tx = interpolate(frame, [0, durationInFrames], [0, (0.5 - fx) * 60], clamp);
	const ty = interpolate(frame, [0, durationInFrames], [0, (0.5 - fy) * 40], clamp);
	const style: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: shot.fit ?? 'cover',
		filter: theme.grade,
		transform: asset.kind === 'photo' ? `translate(${tx}px, ${ty}px) scale(${s})` : `scale(${1 + (s - 1) * 0.3})`,
		transformOrigin: `${fx * 100}% ${fy * 100}%`,
	};
	if (asset.kind === 'photo' && shot.fit === 'framed') {
		// archival print treatment for small / period photographs: the print
		// floats over a blurred, darkened enlargement of itself
		const ps = interpolate(frame, [0, durationInFrames], [1.0, 1.06], {...clamp, easing: ease});
		const rot = shot.rotate ?? -1.2;
		return (
			<AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
				<Img src={staticFile(asset.file)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: `${theme.grade} blur(36px) brightness(0.38)`, transform: `scale(${1.15 * ps})`}} />
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<div style={{transform: `translateX(${shot.printOffsetX ?? 0}px) scale(${ps}) rotate(${rot}deg)`, padding: 18, background: '#efe9de', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', opacity: rise(frame, 0, 12)}}>
						<Img src={staticFile(asset.file)} style={{display: 'block', height: shot.printHeight ?? 760, filter: theme.grade}} />
					</div>
				</AbsoluteFill>
				<Credit asset={asset} frame={frame} />
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{asset.kind === 'photo' && shot.fit === 'contain' ? (
				// portrait/odd-ratio stills: blurred fill behind, sharp image on top
				<Img src={staticFile(asset.file)} style={{...style, objectFit: 'cover', filter: `${theme.grade} blur(40px) brightness(0.45)`, position: 'absolute'}} />
			) : null}
			{asset.kind === 'photo' ? (
				<Img src={staticFile(asset.file)} style={{...style, position: 'absolute'}} />
			) : (
				<OffthreadVideo src={staticFile(asset.file)} muted startFrom={Math.round((shot.clipStart ?? 0) * fps)} style={style} />
			)}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.5) 100%)'}} />
			<Credit asset={asset} frame={frame} />
		</AbsoluteFill>
	);
};

/** On-screen attribution: caption (what/when) + author · licence · source. */
const Credit: React.FC<{asset: Asset; frame: number}> = ({asset, frame}) => (
	<div
		style={{
			position: 'absolute',
			right: 60,
			top: 112,
			fontFamily: theme.font.mono,
			fontSize: 16,
			letterSpacing: 1,
			color: 'rgba(236,229,216,0.72)',
			opacity: rise(frame, 10, 15),
			textAlign: 'right',
			textShadow: '0 1px 6px rgba(0,0,0,0.9)',
		}}
	>
		{asset.caption ? <div style={{color: 'rgba(236,229,216,0.92)', marginBottom: 4}}>{asset.caption}</div> : null}
		{asset.credit}
	</div>
);
