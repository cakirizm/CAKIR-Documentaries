import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {theme} from '../theme';
import {clamp} from './anim';
import {Board} from './shots/Board';
import {Counter} from './shots/Counter';
import {Crowd} from './shots/Crowd';
import {MapScene} from './shots/MapScene';
import {Asset, Media} from './shots/Media';
import {Terminal} from './shots/Terminal';
import {Timeline} from './shots/Timeline';
import {Documents, FilmCard, Figure, Identity, Myth, NameCard, Obituary, Routine, Statement, TitleCard, Works} from './shots/Typography';
import {ChapterLabel, Disputed, EndCard, FilmLook, LogoBug, LowerThird, Stamp} from './overlays/Overlays';

/** Registry of graphic shot types. Add new shot types here. */
export const SHOTS: Record<string, React.FC<{shot: any}>> = {
	board: Board,
	counter: Counter,
	crowd: Crowd,
	map: MapScene,
	terminal: Terminal,
	timeline: Timeline,
	statement: Statement,
	nameCard: NameCard,
	title: TitleCard,
	myth: Myth,
	routine: Routine,
	works: Works,
	filmCard: FilmCard,
	figure: Figure,
	identity: Identity,
	obituary: Obituary,
	documents: Documents,
};

export type TimelineJson = {
	durationSec: number;
	endCardStart: number;
	endCardSec: number;
	segments: {id: string; chapter: string; start: number; end: number; sentences: {i: number; text: string; start: number; end: number}[]}[];
};

export type FilmProps = {
	episode: any;
	timeline: TimelineJson;
	assets: Record<string, Asset>;
	audio: string; // path under /public
	endCardLines: string[];
	burnSubtitles?: boolean;
};

const LEAD = 0.18; // cut slightly ahead of the spoken line

const ShotView: React.FC<{shot: any; assets: Record<string, Asset>}> = ({shot, assets}) => {
	if (shot.type === 'media') {
		const a = assets[shot.asset];
		if (a) return <Media asset={a} shot={shot} />;
		return <ShotView shot={shot.fallback} assets={assets} />;
	}
	if (shot.type === 'title' && shot.bg && assets[shot.bg]) {
		return <TitleCard shot={shot} background={<Media asset={{...assets[shot.bg], credit: '', caption: ''}} shot={{kenBurns: 'out'}} />} />;
	}
	const C = SHOTS[shot.type];
	if (!C) throw new Error(`Unknown shot type: ${shot.type}`);
	return <C shot={shot} />;
};

const Fade: React.FC<{children: React.ReactNode; inFrames: number}> = ({children, inFrames}) => {
	const frame = useCurrentFrame();
	const o = inFrames ? interpolate(frame, [0, inFrames], [0, 1], clamp) : 1;
	return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const FontGate: React.FC = () => {
	const [h] = useState(() => delayRender('fonts'));
	useEffect(() => {
		document.fonts.ready.then(() => continueRender(h));
	}, [h]);
	return null;
};

const Captions: React.FC<{timeline: TimelineJson; fps: number}> = ({timeline, fps}) => {
	const frame = useCurrentFrame();
	const t = frame / fps;
	const s = timeline.segments.flatMap((g) => g.sentences).find((x) => t >= x.start && t <= x.end);
	if (!s) return null;
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 70}}>
			<div style={{maxWidth: 1400, textAlign: 'center', fontFamily: theme.font.sans, fontSize: 40, color: '#fff', background: 'rgba(0,0,0,0.55)', padding: '8px 18px', borderRadius: 4}}>{s.text}</div>
		</AbsoluteFill>
	);
};

export const Film: React.FC<FilmProps> = ({episode, timeline, assets, audio, endCardLines, burnSubtitles}) => {
	const fps = 30;
	const f = (sec: number) => Math.round(sec * fps);
	const T = theme.transitionFrames;
	const segById: Record<string, any> = Object.fromEntries(episode.segments.map((s: any) => [s.id, s]));

	type Placed = {key: string; start: number; end: number; shot: any};
	const placed: Placed[] = [];
	const overlays: {key: string; start: number; dur: number; node: React.ReactNode}[] = [];

	timeline.segments.forEach((tseg, si) => {
		const seg = segById[tseg.id];
		const nextStart = si + 1 < timeline.segments.length ? timeline.segments[si + 1].start : timeline.endCardStart;
		// a shot starts at its sentence (or segment start), plus an optional offset in seconds for mid-sentence cuts
		const starts = seg.shots.map((sh: any) => (sh.from === 0 && !sh.offset ? tseg.start : Math.max(tseg.start, tseg.sentences[sh.from].start - LEAD + (sh.offset ?? 0))));
		seg.shots.forEach((sh: any, i: number) => {
			placed.push({key: `${tseg.id}-${i}`, start: starts[i], end: i + 1 < starts.length ? starts[i + 1] : nextStart, shot: sh});
		});
		if (si > 0) {
			overlays.push({key: `ch-${si}`, start: tseg.start + 0.3, dur: theme.chapterLabelSec, node: <ChapterLabel index={si + 1} title={seg.chapter} />});
		}
		(seg.overlays ?? []).forEach((o: any, i: number) => {
			if (o.onlyWithAsset && !assets[o.onlyWithAsset]) return;
			const st = tseg.sentences[o.at].start - LEAD;
			const node = o.type === 'stamp' ? <Stamp text={o.text} /> : o.type === 'lowerThird' ? <LowerThird text={o.text} sub={o.sub} /> : <Disputed text={o.text} />;
			const dur = o.duration ?? (o.type === 'lowerThird' ? 5.5 : o.type === 'stamp' ? 4.5 : 4.5);
			overlays.push({key: `${tseg.id}-o${i}`, start: Math.max(0, st), dur, node});
		});
	});

	return (
		<AbsoluteFill style={{backgroundColor: theme.color.bg}}>
			<FontGate />
			{placed.map((p, i) => (
				<Sequence key={p.key} from={f(p.start)} durationInFrames={Math.max(1, f(p.end) - f(p.start) + T)} name={`${p.key} ${p.shot.type}`}>
					<Fade inFrames={i === 0 ? 0 : T}>
						<ShotView shot={p.shot} assets={assets} />
					</Fade>
				</Sequence>
			))}
			<Sequence from={f(1.5)} durationInFrames={f(timeline.endCardStart) - f(1.5)} name="logo bug">
				<LogoBug />
			</Sequence>
			{overlays.map((o) => (
				<Sequence key={o.key} from={f(o.start)} durationInFrames={f(o.dur)} name={o.key}>
					{o.node}
				</Sequence>
			))}
			{burnSubtitles ? <Captions timeline={timeline} fps={fps} /> : null}
			<Sequence from={f(timeline.endCardStart)} durationInFrames={f(timeline.endCardSec)} name="end card">
				<EndCard lines={endCardLines} />
			</Sequence>
			<FilmLook />
			<Audio src={staticFile(audio)} />
		</AbsoluteFill>
	);
};
