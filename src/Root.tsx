import React from 'react';
import {Composition, Still} from 'remotion';
import render from '../framework/config/render.json';
import {Film} from '../framework/components/Film';
import {Thumbnail} from '../framework/components/Thumbnail';
import {EPISODES} from './episodes';

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
				defaultProps={{episode: e.episode, timeline: e.timeline, assets: e.assets, audio: e.audio, endCardLines: e.endCardLines}}
			/>
		))}
		<Still id="CAKIR-Airport-Thumbnail" component={Thumbnail as any} width={1280} height={720} defaultProps={{headline: '18 YEARS', subline: 'IN AN AIRPORT', photo: null}} />
	</>
);
