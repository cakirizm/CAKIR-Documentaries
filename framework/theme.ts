// CAKIR channel identity — shared by every episode.
// Change these values to restyle the whole channel in one place.
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';

export const theme = {
	color: {
		bg: '#0d1014',
		bgRaised: '#151a20',
		ink: '#ece5d8', // warm paper white
		inkDim: 'rgba(236,229,216,0.62)',
		inkFaint: 'rgba(236,229,216,0.28)',
		line: 'rgba(236,229,216,0.16)',
		accent: '#e5a13a', // departure-board amber
		accentDim: 'rgba(229,161,58,0.35)',
		alert: '#d0573c',
		land: '#1b2229',
		landEdge: 'rgba(236,229,216,0.18)',
		sea: '#0d1014',
	},
	font: {
		serif: '"Playfair Display", Georgia, serif',
		sans: 'Inter, "Helvetica Neue", Arial, sans-serif',
		mono: '"IBM Plex Mono", Menlo, monospace',
	},
	// colour grade applied to every archival photo / stock clip so mixed
	// sources feel like one film
	grade: 'contrast(1.06) saturate(0.82) sepia(0.10) brightness(0.96)',
	safe: {x: 120, y: 90},
	transitionFrames: 14,
	chapterLabelSec: 4.2,
	logoBugOpacity: 0.42,
	subtitles: {size: 44, bottom: 64},
	lowerThirdBottom: 250,
} as const;

export type Theme = typeof theme;
