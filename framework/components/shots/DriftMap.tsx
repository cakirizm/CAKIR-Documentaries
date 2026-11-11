import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoMercator, geoPath, geoGraticule10} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-50m.json';
import {theme} from '../../theme';
import {clamp, ease, rand, rise} from '../anim';
import {Note} from '../Stage';

const C = theme.color;
const countries = feature(world as any, (world as any).objects.countries) as any;

// Illustrative drift corridor following the North Equatorial Current, shaped
// after the University of Hawaiʻi simulation (16 tracers released ~200 nmi off
// Chiapas, 20 Dec 2012; Maximenko & Hafner 2014). NOT a GPS track.
const CORE: [number, number][] = [[-95.2, 13.0], [-100, 12.4], [-108, 11.6], [-118, 11.0], [-128, 10.6], [-138, 10.0], [-148, 9.2], [-158, 8.2], [-167, 7.2], [-175, 6.2], [178, 5.4], [172, 4.9], [168.7, 4.6]];
const PLACES = {
	costa: {name: 'Costa Azul, Chiapas', lon: -93.6, lat: 15.7},
	ebon: {name: 'Ebon Atoll, Marshall Islands', lon: 168.7, lat: 4.6},
	majuro: {name: 'Majuro', lon: 171.4, lat: 7.1},
	hawaii: {name: 'Hawaiʻi', lon: -157.8, lat: 21.3},
};

export const DriftMap: React.FC<{shot: any}> = ({shot}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const {proj, land, grat} = useMemo(() => {
		const pr = geoMercator().rotate([150, 0]).center([0, 11]).scale(860).translate([930, 560]);
		const gp = geoPath(pr);
		return {proj: pr, land: countries.features.map((f: any) => gp(f)), grat: gp(geoGraticule10())};
	}, []);
	const P = (lon: number, lat: number) => proj([lon, lat]) as [number, number];
	const p = interpolate(frame, [20, Math.max(40, durationInFrames - 40)], [0, 1], {...clamp, easing: ease});
	const tracks = useMemo(
		() =>
			Array.from({length: 16}, (_, i) =>
				CORE.map(([lon, lat], k) => {
					const jitter = (rand(i * 13.1 + k) - 0.5) * 3.0 * Math.min(1, k / 4);
					const spread = (i - 7.5) * 0.32 * Math.min(1, k / 5);
					return P(lon, lat + jitter + spread);
				}),
			),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
	const toPath = (pts: [number, number][]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
	const core = CORE.map(([lon, lat]) => P(lon, lat));
	// position along the core path
	const segs = core.slice(1).map((q, i) => Math.hypot(q[0] - core[i][0], q[1] - core[i][1]));
	const total = segs.reduce((a, b) => a + b, 0);
	let dist = p * total, k = 0;
	while (k < segs.length - 1 && dist > segs[k]) dist -= segs[k++];
	const f = segs[k] ? dist / segs[k] : 0;
	const boat: [number, number] = [core[k][0] + (core[k + 1][0] - core[k][0]) * f, core[k][1] + (core[k + 1][1] - core[k][1]) * f];
	const zoom = interpolate(frame, [0, durationInFrames], [1, 1.04], clamp);
	const days = Math.round(p * 438);
	return (
		<AbsoluteFill style={{backgroundColor: '#0b1622'}}>
			<AbsoluteFill style={{transform: `scale(${zoom})`}}>
				<svg width={1920} height={1080}>
					<defs>
						<linearGradient id="oceanG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f2131" /><stop offset="1" stopColor="#081019" /></linearGradient>
					</defs>
					<rect width={1920} height={1080} fill="url(#oceanG)" />
					<path d={grat ?? ''} fill="none" stroke="rgba(160,190,210,0.12)" strokeWidth={1} />
					{land.map((d: string | null, i: number) => (d ? <path key={i} d={d} fill="#26323b" stroke="rgba(236,229,216,0.25)" strokeWidth={1.2} /> : null))}
					{/* current arrows */}
					{Array.from({length: 18}, (_, i) => {
						const lon = -100 - i * 9 + ((frame * 0.15) % 9);
						const [x, y] = P(lon > 180 ? lon - 360 : lon, 9 + Math.sin(i) * 2);
						return <path key={i} d={`M ${x + 14} ${y} L ${x - 14} ${y} M ${x - 14} ${y} l 8 -5 M ${x - 14} ${y} l 8 5`} stroke="rgba(120,180,220,0.35)" strokeWidth={2} fill="none" />;
					})}
					{tracks.map((pts, i) => (
						<path key={i} d={toPath(pts)} fill="none" stroke={C.accent} strokeOpacity={0.22} strokeWidth={2} pathLength={1} strokeDasharray={`${p} 1`} />
					))}
					<path d={toPath(core)} fill="none" stroke={C.accent} strokeWidth={4} pathLength={1} strokeDasharray={`${p} 1`} />
					{Object.entries(PLACES).map(([key, pl], i) => {
						const [x, y] = P(pl.lon, pl.lat);
						const show = key === 'costa' ? 1 : key === 'ebon' ? rise(frame, durationInFrames - 70, 20) : rise(frame, 30 + i * 10, 20) * 0.7;
						return (
							<g key={key} opacity={show}>
								<circle cx={x} cy={y} r={key === 'hawaii' ? 5 : 8} fill={key === 'hawaii' ? C.inkDim : C.accent} />
								<text x={x + (key === 'costa' ? -14 : 14)} y={key === 'ebon' ? y + 38 : y - 14} textAnchor={key === 'costa' ? 'end' : 'start'} fill={C.ink} fontFamily={theme.font.sans} fontSize={key === 'hawaii' ? 22 : 28} stroke="#0b1622" strokeWidth={5} style={{paintOrder: 'stroke'}}>
									{pl.name}
								</text>
							</g>
						);
					})}
					<g transform={`translate(${boat[0]},${boat[1]})`}>
						<circle r={18} fill={C.accent} opacity={0.18} />
						<path d="M -14 2 L 14 2 L 9 9 L -9 9 Z" fill="#f2efe6" />
					</g>
				</svg>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: theme.safe.x, top: theme.safe.y + 10, opacity: rise(frame, 10, 20)}}>
				<div style={{fontFamily: theme.font.mono, fontSize: 20, letterSpacing: 4, color: C.accent, textTransform: 'uppercase'}}>{shot.kicker ?? 'Modeled drift corridor'}</div>
				<div style={{fontFamily: theme.font.serif, fontSize: 44, color: C.ink, marginTop: 8}}>{shot.title ?? 'Mexico to the Marshall Islands'}</div>
				{shot.showDays ? <div style={{fontFamily: theme.font.mono, fontSize: 30, color: C.ink, marginTop: 14}}>Day {days}</div> : null}
			</div>
			<Note text="Illustrative route based on ocean-current modelling (University of Hawaiʻi, 2014) · not a GPS track" style={{position: 'absolute', left: theme.safe.x, bottom: 210, fontSize: 17, maxWidth: 1100}} />
		</AbsoluteFill>
	);
};
