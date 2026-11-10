// Episode registry. To add an episode: create episodes/<id>/ (episode.json,
// assets.json), run the build scripts, then add an entry here.
import airportEpisode from '../episodes/airport/episode.json';
import airportTimeline from '../episodes/airport/build/timeline.json';
import airportSample from '../episodes/airport/build/timeline_sample.json';
import airportAssets from '../episodes/airport/build/assets.resolved.json';

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
