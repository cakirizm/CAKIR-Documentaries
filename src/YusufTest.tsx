import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage} from '../framework/yusuf/Stage';
import {Cam, Cow, Grass, Ground, PAL, lerp, range} from '../framework/yusuf/Kit';

export const YusufTest: React.FC = () => {
	const f = useCurrentFrame();
	const rise = range(f, 60, 330);
	return (
		<AbsoluteFill style={{background: PAL.bg}}>
			<Stage bg="#c8cbb2" fog={[10, 55]} sun={{pos: [-10, 12, 8], color: '#fff1cf', intensity: 2.2}} fill={{color: '#cfd8c0', intensity: 0.7}}>
				<Cam pos={[lerp(-2, 0, rise), lerp(1.2, 9, rise), lerp(9, 14, rise)]} target={[0, lerp(0.8, 0, rise), 0]} fov={46} />
				<Ground color="#557a3a" />
				<Grass frame={f} w={40} d={40} count={9000} height={0.22} />
				{Array.from({length: 7}, (_, i) => {
					const enter = 12 + i * 22;
					const p = range(f, enter, enter + 70);
					const x = lerp(-14, -4.5 + i * 1.5, p);
					return <Cow key={i} position={[x, 0, -1.5 + (i % 3) * 1.4 - (i % 2) * 0.6]} rotY={0} fat={1} walk={f * 0.18 + i} stride={1 - p * 0.7} />;
				})}
			</Stage>
		</AbsoluteFill>
	);
};
