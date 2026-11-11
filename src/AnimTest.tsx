import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Reenactment} from '../framework/components/anim/Reenactment';
import {FilmLook} from '../framework/components/overlays/Overlays';

export const ANIM_SCENES = ['arrival', 'read', 'write', 'organize', 'sleep', 'years', 'press', 'refused', 'journey'];
export const ANIM_QC = ['arrival', 'read', 'write', 'organize', 'sleep'];
export const AnimTest: React.FC<{scenes?: string[]; sec?: number}> = ({scenes = ANIM_SCENES, sec = 7}) => (
	<AbsoluteFill style={{background: '#000'}}>
		{scenes.map((s, i) => (
			<Sequence key={s} from={i * sec * 30} durationInFrames={sec * 30} name={s}>
				<Reenactment shot={{scene: s}} />
			</Sequence>
		))}
		<FilmLook />
	</AbsoluteFill>
);

import {SeaScene} from '../framework/components/anim/Sea';
export const SEA_SCENES = ['prepare', 'depart', 'storm', 'engine', 'rain', 'catch', 'shelter', 'alone', 'moons', 'ship', 'island'];
export const SeaTest: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		{SEA_SCENES.map((s, i) => (
			<Sequence key={s} from={i * 6 * 30} durationInFrames={6 * 30} name={s}>
				<SeaScene shot={{scene: s, beard: s === 'island' || s === 'alone' || s === 'moons' || s === 'ship' ? 0.9 : 0.3}} />
			</Sequence>
		))}
		<FilmLook />
	</AbsoluteFill>
);

import {DriftMap} from '../framework/components/shots/DriftMap';
export const DriftTest: React.FC = () => <DriftMap shot={{showDays: true}} />;
