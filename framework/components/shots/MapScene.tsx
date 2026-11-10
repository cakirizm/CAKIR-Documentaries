import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoConicConformal, geoGraticule10, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
// Natural Earth 1:50m via world-atlas (public domain data, ISC-licensed package)
import world from 'world-atlas/countries-50m.json';
import {theme} from '../../theme';
import {clamp, ease, rise} from '../anim';
import {Note, Stage} from '../Stage';

const C = theme.color;

export type Place = {name: string; lon: number; lat: number; label?: 'left' | 'right' | 'above' | 'below'};
export type MapView = {center: [number, number]; scale: number; parallels?: [number, number]};

/** Default gazetteer & views; episodes can extend these via props. */
export const PLACES: Record<string, Place> = {
	masjed: {name: 'Masjed Soleyman', lon: 49.3, lat: 31.94, label: 'below'},
	tehran: {name: 'Tehran', lon: 51.39, lat: 35.69},
	brussels: {name: 'Brussels', lon: 4.35, lat: 50.85, label: 'right'},
	cdg: {name: 'Charles de Gaulle Airport', lon: 2.55, lat: 49.01, label: 'right'},
	lhr: {name: 'London', lon: -0.45, lat: 51.47, label: 'left'},
	paris: {name: 'Paris', lon: 2.35, lat: 48.86, label: 'left'},
};

export const VIEWS: Record<string, MapView> = {
	iran: {center: [50, 33], scale: 2600},
	europe_iran: {center: [25, 44], scale: 1500, parallels: [35, 55]},
	channel: {center: [2.2, 50.3], scale: 9500},
	paris: {center: [2.45, 48.94], scale: 90000},
};

const countries = feature(world as any, (world as any).objects.countries) as any;

export const MapScene: React.FC<{shot: any; places?: Record<string, Place>; views?: Record<string, MapView>}> = ({shot, places = PLACES, views = VIEWS}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const view = views[shot.view];
	const {projection, landPath, grat} = useMemo(() => {
		const pr = geoConicConformal()
			.parallels(view.parallels ?? [view.center[1] - 5, view.center[1] + 5])
			.rotate([-view.center[0], 0])
			.center([0, view.center[1]])
			.scale(view.scale)
			.translate([960, 540]);
		const gp = geoPath(pr);
		return {projection: pr, landPath: countries.features.map((f: any) => gp(f)), grat: gp(geoGraticule10())};
	}, [view]);

	const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.07], {...clamp, easing: ease});
	const fade = rise(frame, 0, 18);
	const pts = (shot.points as string[]).map((k) => ({k, ...places[k], xy: projection([places[k].lon, places[k].lat]) as [number, number]}));
	const P = (k: string) => pts.find((p) => p.k === k)!.xy;

	return (
		<Stage grid={false} pushAmount={0}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, opacity: fade}}>
				<svg width={1920} height={1080}>
					<path d={grat ?? ''} fill="none" stroke={C.line} strokeWidth={1} opacity={0.5} />
					{landPath.map((d: string | null, i: number) => (d ? <path key={i} d={d} fill={C.land} stroke={C.landEdge} strokeWidth={1.2} /> : null))}
					{(shot.routes as [string, string][]).map(([a, b], i) => {
						const [x1, y1] = P(a);
						const [x2, y2] = P(b);
						const mx = (x1 + x2) / 2;
						const my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.22;
						const d = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
						const len = Math.hypot(x2 - x1, y2 - y1) * 1.15;
						const p = interpolate(frame, [14 + i * 22, 50 + i * 22], [0, 1], {...clamp, easing: ease});
						const refused = shot.refused === a;
						return (
							<g key={i}>
								<path d={d} fill="none" stroke={refused ? C.alert : C.accent} strokeWidth={4} strokeDasharray={`${len * p} ${len}`} strokeLinecap="round" />
							</g>
						);
					})}
					{pts.map((p, i) => {
						const a = rise(frame, 6 + i * 6, 14);
						const pulse = ((frame + i * 13) % 45) / 45;
						const lab = p.label ?? 'right';
						const dx = lab === 'left' ? -24 : lab === 'right' ? 24 : 0;
						const dy = lab === 'above' ? -26 : lab === 'below' ? 46 : 10;
						const anchor = lab === 'left' ? 'end' : lab === 'right' ? 'start' : 'middle';
						const isRefused = shot.refused === p.k;
						return (
							<g key={p.k} opacity={a}>
								<circle cx={p.xy[0]} cy={p.xy[1]} r={8 + pulse * 26} fill="none" stroke={isRefused ? C.alert : C.accent} strokeWidth={2} opacity={1 - pulse} />
								<circle cx={p.xy[0]} cy={p.xy[1]} r={8} fill={isRefused ? C.alert : C.accent} />
								<text x={p.xy[0] + dx} y={p.xy[1] + dy} fill={C.ink} fontFamily={theme.font.sans} fontSize={30} textAnchor={anchor} style={{paintOrder: 'stroke'}} stroke={C.bg} strokeWidth={6}>
									{p.name}
								</text>
								{isRefused ? (
									<text x={p.xy[0] + dx} y={p.xy[1] + dy + 34} fill={C.alert} fontFamily={theme.font.mono} fontSize={20} letterSpacing={3} textAnchor={anchor} stroke={C.bg} strokeWidth={5} style={{paintOrder: 'stroke'}}>
										ENTRY REFUSED
									</text>
								) : null}
							</g>
						);
					})}
				</svg>
			</AbsoluteFill>
			<AbsoluteFill style={{justifyContent: 'flex-end', padding: `0 ${theme.safe.x}px ${theme.safe.y + 40}px`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: rise(frame, 20, 20)}}>
					<div style={{width: 60, height: 2, background: C.accent}} />
					<div style={{fontFamily: theme.font.serif, fontSize: 46, color: C.ink}}>{shot.caption}</div>
				</div>
			</AbsoluteFill>
			<Note text="Map data: Natural Earth" style={{position: 'absolute', right: 60, bottom: 40, fontSize: 14, opacity: 0.6}} />
		</Stage>
	);
};
