import React from 'react';
import {Composition, Still} from 'remotion';
import render from '../framework/config/render.json';
import {Film} from '../framework/components/Film';
import {YusufTest} from './YusufTest';
import {YusufFilm} from '../framework/yusuf/YusufFilm';
import yusufTimeline from '../episodes/yusuf/build/timeline.json';
import {KamerReel} from '../framework/kamer/KamerReel';
import kamerTimeline from '../episodes/kamer/build/timeline.json';
import {Banknot1} from '../framework/banknot/Banknot1';
import banknot1TL from '../episodes/banknot1/build/timeline.json';
import {DrawnTest} from '../framework/banknot/DrawnTest';
import {BanknotEpisode} from '../framework/banknot/Engine';
import bnT2 from '../episodes/banknot/build/ep2_timeline.json';
import bnS2 from '../episodes/banknot/ep2.json';
import bnT3 from '../episodes/banknot/build/ep3_timeline.json';
import bnS3 from '../episodes/banknot/ep3.json';
import bnT4 from '../episodes/banknot/build/ep4_timeline.json';
import bnS4 from '../episodes/banknot/ep4.json';
import bnT5 from '../episodes/banknot/build/ep5_timeline.json';
import bnS5 from '../episodes/banknot/ep5.json';
import bnT6 from '../episodes/banknot/build/ep6_timeline.json';
import bnS6 from '../episodes/banknot/ep6.json';
import bnT7 from '../episodes/banknot/build/ep7_timeline.json';
import bnS7 from '../episodes/banknot/ep7.json';
import bnT8 from '../episodes/banknot/build/ep8_timeline.json';
import bnS8 from '../episodes/banknot/ep8.json';
import bnT9 from '../episodes/banknot/build/ep9_timeline.json';
import bnS9 from '../episodes/banknot/ep9.json';
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
		<Composition id="Kamer-Reels" component={KamerReel as any} durationInFrames={Math.round((kamerTimeline as any).durationSec * 30)} fps={30} width={1080} height={1920} defaultProps={{timeline: kamerTimeline as any, audio: 'episodes/kamer/audio/mix.wav'}} />
		<Composition id="Banknot-B1" component={Banknot1 as any} durationInFrames={Math.round((banknot1TL as any).durationSec * 30)} fps={30} width={1080} height={1920} defaultProps={{timeline: banknot1TL as any, audio: 'episodes/banknot1/audio/mix.wav'}} />
		<Composition id="DrawnTest" component={DrawnTest as any} durationInFrames={120} fps={30} width={1080} height={1920} defaultProps={{which: 'win'}} />
		<Composition id="Banknot-B2" component={BanknotEpisode as any} durationInFrames={Math.round((bnT2 as any).durationSec * 30)} fps={30} width={1080} height={1920} defaultProps={{timeline: bnT2 as any, scenes: (bnS2 as any).scenes, audio: 'episodes/banknot/audio/ep2/mix.wav', ep: 2, title: (bnS2 as any).title}} />
		<Composition id="Banknot-B3" component={BanknotEpisode as any} durationInFrames={Math.round((bnT3 as any).durationSec * 30)} fps={30} width={1080} height={1920} defaultProps={{timeline: bnT3 as any, scenes: (bnS3 as any).scenes, audio: 'episodes/banknot/audio/ep3/mix.wav', ep: 3, title: (bnS3 as any).title}} />
		<Composition id="Banknot-B4" component={BanknotEpisode as any} durationInFrames={Math.round((bnT4 as any).durationSec * 30)} fps={30} width={1080} height={1920} defaultProps={{timeline: bnT4 as any, scenes: (bnS4 as any).scenes, audio: 'episodes/banknot/audio/ep4/mix.wav', ep: 4, title: (bnS4 as any).title}} />
		<Composition id="Banknot-B5" component={BanknotEpisode as any} durationInFrames={Math.round((bnT5 as any).durationSec * 30)} fps={30} width={1080} height={1920} defaultProps={{timeline: bnT5 as any, scenes: (bnS5 as any).scenes, audio: 'episodes/banknot/audio/ep5/mix.wav', ep: 5, title: (bnS5 as any).title}} />
		<Composition id="Banknot-B6" component={BanknotEpisode as any} durationInFrames={Math.round((bnT6 as any).durationSec * 30)} fps={30} width={1080} height={1920} defaultProps={{timeline: bnT6 as any, scenes: (bnS6 as any).scenes, audio: 'episodes/banknot/audio/ep6/mix.wav', ep: 6, title: (bnS6 as any).title}} />
		<Composition id="Banknot-B7" component={BanknotEpisode as any} durationInFrames={Math.round((bnT7 as any).durationSec * 30)} fps={30} width={1080} height={1920} defaultProps={{timeline: bnT7 as any, scenes: (bnS7 as any).scenes, audio: 'episodes/banknot/audio/ep7/mix.wav', ep: 7, title: (bnS7 as any).title}} />
		<Composition id="Banknot-B8" component={BanknotEpisode as any} durationInFrames={Math.round((bnT8 as any).durationSec * 30)} fps={30} width={1080} height={1920} defaultProps={{timeline: bnT8 as any, scenes: (bnS8 as any).scenes, audio: 'episodes/banknot/audio/ep8/mix.wav', ep: 8, title: (bnS8 as any).title}} />
		<Composition id="Banknot-B9" component={BanknotEpisode as any} durationInFrames={Math.round((bnT9 as any).durationSec * 30)} fps={30} width={1080} height={1920} defaultProps={{timeline: bnT9 as any, scenes: (bnS9 as any).scenes, audio: 'episodes/banknot/audio/ep9/mix.wav', ep: 9, title: (bnS9 as any).title}} />
		<Composition id="YusufTest" component={YusufTest} durationInFrames={360} fps={30} width={1080} height={1920} />
		<Still id="CAKIR-Airport-Thumbnail" component={Thumbnail as any} width={1280} height={720} defaultProps={{headline: '18 YEARS', subline: 'IN AN AIRPORT', photo: null}} />
		<Still id="CAKIR-438Days-Thumbnail" component={Thumbnail as any} width={1280} height={720} defaultProps={{headline: '438 DAYS', subline: 'LOST AT SEA', photo: 'episodes/alvarenga/media/alv_photo_2.jpg', focus: [0.58, 0.3]}} />
	</>
);
