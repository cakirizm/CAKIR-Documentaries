import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useVideoConfig} from 'remotion';
import * as THREE from 'three';

/** One 3D stage: background colour, fog, sun/moon key light with soft
 *  shadows, warm fill, ACES tone mapping. Children are the scene. */
export const Stage: React.FC<{
	children: React.ReactNode;
	bg: string;
	fog?: [number, number];
	sun?: {pos: [number, number, number]; color: string; intensity: number};
	fill?: {color: string; intensity: number};
	ambient?: number;
	exposure?: number;
	dpr?: number;
}> = ({children, dpr = 0.75, bg, fog = [18, 70], sun = {pos: [8, 14, 6], color: '#ffe2b0', intensity: 2.4}, fill = {color: '#7f8fb0', intensity: 0.5}, ambient = 0.25, exposure = 1}) => {
	const {width, height} = useVideoConfig();
	return (
		<ThreeCanvas
			width={width}
			height={height}
			shadows
			dpr={dpr}
			gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure, preserveDrawingBuffer: true}}
			camera={{fov: 42, position: [0, 3, 10], near: 0.1, far: 400}}
			style={{position: 'absolute', inset: 0}}
		>
			<color attach="background" args={[bg]} />
			<fog attach="fog" args={[bg, fog[0], fog[1]]} />
			<ambientLight intensity={ambient} />
			<hemisphereLight args={[fill.color, '#2a1d12', fill.intensity]} />
			<directionalLight
				position={sun.pos}
				color={sun.color}
				intensity={sun.intensity}
				castShadow
				shadow-mapSize-width={1024}
				shadow-mapSize-height={1024}
				shadow-camera-left={-22}
				shadow-camera-right={22}
				shadow-camera-top={22}
				shadow-camera-bottom={-22}
				shadow-camera-near={0.5}
				shadow-camera-far={80}
				shadow-bias={-0.0004}
				shadow-radius={4}
			/>
			{children}
		</ThreeCanvas>
	);
};
