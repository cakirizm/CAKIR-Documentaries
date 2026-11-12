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
import {ChapterLabel, CreditBlock, Disputed, EndCard, FilmLook, LogoBug, LowerThird, NoteOverlay, Quote, Stamp} from './overlays/Overlays';
import {Reenactment} from './anim/Reenactment';
import {SeaScene} from './anim/Sea';
import {DriftMap} from './shots/DriftMap';
import {NewsClip} from './shots/NewsClip';

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
	reenact: Reenactment,
	sea: SeaScene,
	drift: DriftMap,
	news: NewsClip,
};

export type TimelineJson = {
	durationSec: number;
	endCardStart: number;
	endCardSec: number;
	segments: {id: string; chapter: string; start: number; end: number; sentences: {i: number; text: string; start: number; end: number}[]; cues?: {start: number; end: number; text: string}[]}[];
};

export type FilmProps = {
	episode: any;
	timeline: TimelineJson;
	assets: Record<string, Asset>;
	audio: string; // path under /public
	endCardLines: string[];
	credits?: CreditBlock[];
	burnSubtitles?: boolean;
};

const LEAD = 0.18; // cut slightly ahead of the spoken line

const ShotView: React.FC<{shot: any; assets: Record<string, Asset>}> = ({shot, assets}) => {
	if (shot.type === 'media') {
		const a = assets[shot.asset];
		if (a) return <Media asset={a} shot={shot} />;
		return <ShotView shot={shot.fallback} assets={assets} />;
	}
	if (shot.type === 'split') {
		// two images side by side, divided by a thin rule
		const half = (side: any, key: string, left: boolean) => (
			<div key={key} style={{position: 'absolute', top: 0, bottom: 0, left: left ? 0 : 963, width: 957, overflow: 'hidden'}}>
				<div style={{position: 'absolute', left: -480, width: 1920, height: 1080}}>
					<ShotView shot={{type: 'media', fallback: {type: 'crowd'}, noCaption: true, ...side}} assets={assets} />
				</div>
			</div>
		);
		return (
			<AbsoluteFill style={{backgroundColor: theme.color.bg}}>
				{half(shot.left, 'l', true)}
				{half(shot.right, 'r', false)}
				<div style={{position: 'absolute', left: 957, width: 6, top: 0, bottom: 0, background: theme.color.bg}} />
			</AbsoluteFill>
		);
	}
	if (shot.type === 'title' && shot.bg && assets[shot.bg]) {
		return <TitleCard shot={shot} background={<Media asset={{...assets[shot.bg], credit: '', caption: ''}} shot={{kenBurns: 'out'}} />} />;
	}
	if (shot.type === 'news' && shot.bg && assets[shot.bg]) {
		return <NewsClip shot={shot} background={<Media asset={{...assets[shot.bg], credit: '', caption: ''}} shot={{noCaption: true}} />} />;
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

/** Burned-in English subtitles: white, soft shadow, 1–2 lines, bottom-centre.
 *  Uses the same cues as the exported .srt. */
const Captions: React.FC<{timeline: TimelineJson; fps: number}> = ({timeline, fps}) => {
	const frame = useCurrentFrame();
	const t = frame / fps;
	const cue = timeline.segments.flatMap((g: any) => g.cues ?? []).find((x: any) => t >= x.start && t < x.end + 0.12);
	if (!cue) return null;
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: theme.subtitles.bottom}}>
			<div
				style={{
					maxWidth: 1500,
					textAlign: 'center',
					whiteSpace: 'pre-line',
					fontFamily: theme.font.sans,
					fontWeight: 600,
					fontSize: theme.subtitles.size,
					lineHeight: 1.28,
					color: '#ffffff',
					textShadow: '0 0 2px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.85), 0 0 18px rgba(0,0,0,0.55)',
				}}
			>
				{cue.text}
			</div>
		</AbsoluteFill>
	);
};

export const Film: React.FC<FilmProps> = ({episode, timeline, assets, audio, endCardLines, credits, burnSubtitles = true}) => {
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
			const st = tseg.sentences[o.at].start - LEAD + (o.offset ?? 0);
			const node = o.type === 'stamp' ? <Stamp text={o.text} /> : o.type === 'lowerThird' ? <LowerThird text={o.text} sub={o.sub} /> : o.type === 'quote' ? <Quote text={o.text} attribution={o.attribution} /> : o.type === 'note' ? <NoteOverlay text={o.text} /> : <Disputed text={o.text} />;
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
			{timeline.endCardSec >= 2 ? (
				<Sequence from={f(timeline.endCardStart)} durationInFrames={f(timeline.endCardSec)} name="end card">
					<EndCard lines={endCardLines} credits={credits} />
				</Sequence>
			) : null}
			<FilmLook />
			<Audio src={staticFile(audio)} />
		</AbsoluteFill>
	);
};
