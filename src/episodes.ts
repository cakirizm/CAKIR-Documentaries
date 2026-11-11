// Episode registry. To add an episode: create episodes/<id>/ (episode.json,
// assets.json), run the build scripts, then add an entry here.
import airportEpisode from '../episodes/airport/episode.json';
import airportTimeline from '../episodes/airport/build/timeline.json';
import airportSample from '../episodes/airport/build/timeline_sample.json';
import airportAssets from '../episodes/airport/build/assets.resolved.json';
import airportRegister from '../episodes/airport/assets.json';
import alvEpisode from '../episodes/alvarenga/episode.json';
import alvTimeline from '../episodes/alvarenga/build/timeline.json';
import alvAssets from '../episodes/alvarenga/build/assets.resolved.json';
import alvRegister from '../episodes/alvarenga/assets.json';
import {buildCredits} from './credits';

const airportCredits = buildCredits(airportEpisode, airportRegister as any[], [
	{heading: 'Animated reconstructions', lines: ['Illustrative 2D reconstructions created for CAKIR. They are not historical footage.']},
	{heading: 'Maps', lines: ['Natural Earth (public domain)']},
	{heading: 'Narration', lines: ['AI narration voice generated with ElevenLabs']},
	{heading: 'Principal sources', lines: ['CBS News / Associated Press (2022)', 'ABC News Australia (2022) · RFE/RL (2022) · NPR (2022)', 'The Guardian (2004) · Mail & Guardian / AFP (2004)', 'Full source list in the video description']},
	{heading: 'Licences', lines: ['CC BY / CC BY-SA 2.0–4.0: creativecommons.org/licenses · CC0 · Public domain', 'Contemporary airport footage is used for illustration and does not depict Nasseri or the events of 1988–2006']},
]);

const alvCredits = buildCredits(alvEpisode, alvRegister as any[], [
	{heading: 'Animated reconstructions', lines: ['Illustrative 2D reconstructions created for CAKIR. They are not historical footage and do not show the real people.']},
	{heading: 'Drift map', lines: ['Illustrative route based on ocean-current modelling by N. Maximenko & J. Hafner, University of Hawaiʻi (2014) · not a GPS track', 'Basemap: Natural Earth (public domain)']},
	{heading: 'Narration', lines: ['AI narration voice generated with ElevenLabs']},
	{heading: 'Principal sources', lines: ['University of Hawaiʻi / IPRC (2014)', 'Associated Press · CNN · CBS News (2014)', 'The Guardian · The Telegraph (2014–2015)', 'Jonathan Franklin, 438 Days (Atria Books, 2015)', 'Full source list in the video description']},
	{heading: 'Licences', lines: ['CC BY / CC BY-SA 2.0–4.0: creativecommons.org/licenses · CC0 · Public domain · Coverr License', 'Ocean, boat and wildlife footage is illustrative and does not show Alvarenga']},
]);

const endCard = (extra: string[]) => [
	...extra,
	'Narration: ElevenLabs AI voice',
	'Music: Kevin MacLeod (incompetech.com), CC BY 4.0',
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
		id: 'CAKIR-438Days',
		episode: alvEpisode,
		timeline: alvTimeline,
		assets: alvAssets,
		audio: 'episodes/alvarenga/audio/mix.wav',
		endCardLines: ['438 Days Lost at Sea', 'Real Stories. Beyond the Headlines.', 'Narration: ElevenLabs AI voice', 'Music: Kevin MacLeod (incompetech.com), CC BY 4.0', 'Sources & licences in the description'],
		credits: alvCredits,
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
