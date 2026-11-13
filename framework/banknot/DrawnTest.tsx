import React from 'react';
import {useCurrentFrame} from 'remotion';
import {DrawnRobbery, DrawnWin} from './Drawn';
export const DrawnTest: React.FC<{which: string}> = ({which}) => {
	const t = useCurrentFrame() / 30;
	return which === 'win' ? <DrawnWin t={t} /> : <DrawnRobbery t={t} />;
};
