// Episode registry. To add an episode: create episodes/<id>/ (episode.json,
// assets.json), run the build scripts, then add an entry here.
import airportEpisode from '../episodes/airport/episode.json';
import airportTimeline from '../episodes/airport/build/timeline.json';
import airportSample from '../episodes/airport/build/timeline_sample.json';
import airportAssets from '../episodes/airport/build/assets.resolved.json';
import airportRegister from '../episodes/airport/assets.json';
import {buildCredits} from './credits';

const airportCredits = buildCredits(airportEpisode, airportRegister as any[], [
	{heading: 'Animated reconstructions', lines: ['Illustrative 2D reconstructions created for CAKIR. They are not historical footage.']},
	{heading: 'Maps', lines: ['Natural Earth (public domain)']},
	{heading: 'Narration · Music', lines: ['Synthetic narration: Kokoro TTS (Apache-2.0)', 'Original score composed for CAKIR']},
	{heading: 'Principal sources', lines: ['CBS News / Associated Press (2022)', 'ABC News Australia (2022) · RFE/RL (2022) · NPR (2022)', 'The Guardian (2004) · Mail & Guardian / AFP (2004)', 'Full source list in the video description']},
	{heading: 'Licences', lines: ['CC BY / CC BY-SA 2.0–4.0: creativecommons.org/licenses · CC0 · Public domain', 'Contemporary airport footage is used for illustration and does not depict Nasseri or the events of 1988–2006']},
]);

const endCard = (extra: string[]) => [
	...extra,
	'Narration: synthetic voice (Kokoro TTS)',
	'Original score: CAKIR',
	'Sources & licences in the description',
];

export const EPISODES = [
	{
		id: 'CAKIR-Airport',
		episode: airportEpisode,
		timeline: airportTimeline,
		assets: airportAssets,
		audio: 'episodes/airport/audio/mix.wav',
		endCardLines: endCard(['The Man Who Lived in an Airport']),
		credits: airportCredits,
	},
	{
		id: 'CAKIR-Airport-Sample',
		episode: airportEpisode,
		timeline: airportSample,
		assets: airportAssets,
		audio: 'episodes/airport/audio/mix_sample.wav',
		endCardLines: endCard(['Pipeline test']),
	},
];
