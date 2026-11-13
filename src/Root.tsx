import React from 'react';
import {Composition, Still} from 'remotion';
import render from '../framework/config/render.json';
import {Film} from '../framework/components/Film';
import {YusufTest} from './YusufTest';
import {YusufFilm} from '../framework/yusuf/YusufFilm';
import yusufTimeline from '../episodes/yusuf/build/timeline.json';
import {Thumbnail} from '../framework/components/Thumbnail';
import {EPISODES} from './episodes';
import {ANIM_QC, ANIM_SCENES, AnimTest, SEA_SCENES, SeaTest, DriftTest} from './AnimTest';

export const Root: React.FC = () => (
	<>
		{EPISODES.map((e) => (
			<Composition
				key={e.id}
				id={e.id}
				component={Film as any}
				width={render.width}
				height={render.height}
				fps={render.fps}
				durationInFrames={Math.ceil((e.timeline as any).durationSec * render.fps)}
				defaultProps={{episode: e.episode, timeline: e.timeline, assets: e.assets, audio: e.audio, endCardLines: e.endCardLines, credits: (e as any).credits}}
			/>
		))}
		<Composition id="CAKIR-AnimTest" component={AnimTest as any} width={1920} height={1080} fps={30} durationInFrames={ANIM_SCENES.length * 7 * 30} defaultProps={{}} />
		<Composition id="CAKIR-AnimQC" component={AnimTest as any} width={1920} height={1080} fps={30} durationInFrames={ANIM_QC.length * 7 * 30} defaultProps={{scenes: ANIM_QC, sec: 7}} />
		<Composition id="CAKIR-SeaTest" component={SeaTest} width={1920} height={1080} fps={30} durationInFrames={SEA_SCENES.length * 6 * 30} defaultProps={{}} />
		<Composition id="CAKIR-DriftTest" component={DriftTest} width={1920} height={1080} fps={30} durationInFrames={360} defaultProps={{}} />
		<Composition id="Yusuf-7Inek" component={YusufFilm as any} durationInFrames={Math.round((yusufTimeline as any).durationSec * 30)} fps={30} width={1080} height={1920} defaultProps={{timeline: yusufTimeline as any, audio: 'episodes/yusuf/audio/mix.wav'}} />
		<Composition id="YusufTest" component={YusufTest} durationInFrames={360} fps={30} width={1080} height={1920} />
		<Still id="CAKIR-Airport-Thumbnail" component={Thumbnail as any} width={1280} height={720} defaultProps={{headline: '18 YEARS', subline: 'IN AN AIRPORT', photo: null}} />
		<Still id="CAKIR-438Days-Thumbnail" component={Thumbnail as any} width={1280} height={720} defaultProps={{headline: '438 DAYS', subline: 'LOST AT SEA', photo: 'episodes/alvarenga/media/alv_photo_2.jpg', focus: [0.58, 0.3]}} />
	</>
);
