import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Easing, staticFile, useCurrentFrame, useVideoConfig, random} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/900.css';
import '@fontsource/alegreya/700.css';
import '@fontsource/alegreya/400-italic.css';

const GOLD = '#e8c26a';
const RED = '#e5484d';
const SANS = 'Inter, sans-serif';
const SERIF = 'Alegreya, Georgia, serif';
const M = (f: string) => staticFile(`episodes/banknot1/media/${f}`);
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const r = (t: number, a: number, b: number, from = 0, to = 1) => interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

type Line = {scene: string; role: string; start: number; end: number; sub: string};
type TL = {durationSec: number; scenes: {id: string; start: number; end: number}[]; lines: Line[]};

/* ---------- building blocks ---------- */

const Photo: React.FC<{src: string; t: number; d: number; from?: number; to?: number; x?: [number, number]; y?: [number, number]; filter?: string; fit?: 'cover' | 'contain'}> = ({src, t, d, from = 1.05, to = 1.18, x = [0, 0], y = [0, 0], filter = 'saturate(0.85) contrast(1.05) brightness(0.8)', fit = 'cover'}) => {
	const p = r(t, 0, d);
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Img src={src} style={{width: '100%', height: '100%', objectFit: fit, transform: `scale(${from + (to - from) * p}) translate(${x[0] + (x[1] - x[0]) * p}px, ${y[0] + (y[1] - y[0]) * p}px)`, filter}} />
		</AbsoluteFill>
	);
};

const Temsili: React.FC = () => (
	<div style={{position: 'absolute', top: 236, right: 60, fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: 'rgba(255,255,255,0.75)', background: 'rgba(0,0,0,0.45)', padding: '6px 12px', borderRadius: 6}}>TEMSİLÎ GÖRÜNTÜ</div>
);

const Vignette: React.FC<{o?: number}> = ({o = 0.85}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 35%, rgba(0,0,0,${o}) 100%)`}} />
);

const Grain: React.FC = () => {
	const f = useCurrentFrame();
	return <AbsoluteFill style={{backgroundImage: `url(${staticFile(`framework/grain${f % 4}.png`)})`, opacity: 0.12, mixBlendMode: 'overlay'}} />;
};

/** The hero: a $100 note as a 3D card */
const Note: React.FC<{w?: number; rotY?: number; rotZ?: number; x?: number; y?: number; dark?: number; glow?: number}> = ({w = 760, rotY = 0, rotZ = 0, x = 0, y = 0, dark = 0, glow = 0}) => (
	<div style={{position: 'absolute', left: 540 - w / 2 + x, top: 900 - w * 0.215 + y, width: w, height: w * 0.43, perspective: 1800}}>
		<div style={{width: '100%', height: '100%', transform: `rotateY(${rotY}deg) rotateZ(${rotZ}deg)`, borderRadius: 10, overflow: 'hidden', boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 ${glow * 120}px rgba(232,194,106,${glow * 0.6})`, border: '6px solid #d9dccb', background: '#cfd3c0'}}>
			<Img src={M('bill.jpg')} style={{width: '100%', height: '230%', objectFit: 'cover', objectPosition: '50% 18%', filter: `sepia(0.25) contrast(1.05) brightness(${1 - dark * 0.75})`}} />
			<div style={{position: 'absolute', right: 18, top: 10, fontFamily: SERIF, fontWeight: 700, fontSize: w * 0.09, color: '#2f3d2d', opacity: 0.85}}>100</div>
			<div style={{position: 'absolute', left: 18, bottom: 6, fontFamily: SERIF, fontWeight: 700, fontSize: w * 0.09, color: '#2f3d2d', opacity: 0.85}}>100</div>
		</div>
	</div>
);

const Kicker: React.FC<{text: string; t: number; at?: number; top?: number; color?: string; size?: number}> = ({text, t, at = 0.2, top = 300, color = '#fff', size = 74}) => {
	const o = r(t, at, at + 0.4);
	return (
		<div style={{position: 'absolute', top, left: 60, right: 60, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1.05, letterSpacing: -1, color, opacity: o, transform: `translateY(${(1 - o) * 30}px) scale(${0.94 + o * 0.06})`, textShadow: '0 4px 30px rgba(0,0,0,0.8)', whiteSpace: 'pre-line'}}>
			{text}
		</div>
	);
};

const Small: React.FC<{text: string; t: number; at?: number; top: number; color?: string}> = ({text, t, at = 0.3, top, color = GOLD}) => (
	<div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 32, letterSpacing: 8, color, opacity: r(t, at, at + 0.4), textShadow: '0 2px 16px rgba(0,0,0,0.9)'}}>{text}</div>
);

const Stamp: React.FC<{text: string; t: number; at: number; top: number; rot?: number; color?: string; size?: number}> = ({text, t, at, top, rot = -8, color = RED, size = 92}) => {
	const p = r(t, at, at + 0.18);
	if (t < at) return null;
	return (
		<div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
			<div style={{fontFamily: SANS, fontWeight: 900, fontSize: size, color, border: `8px solid ${color}`, padding: '6px 28px', borderRadius: 8, transform: `rotate(${rot}deg) scale(${2.2 - p * 1.2})`, opacity: p, letterSpacing: 2, background: 'rgba(0,0,0,0.35)'}}>{text}</div>
		</div>
	);
};

const Counter: React.FC<{t: number; a: number; b: number; from: number; to: number; top: number; color?: string; size?: number; strike?: number}> = ({t, a, b, from, to, top, color = GOLD, size = 120, strike = 0}) => {
	const v = Math.round(interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}));
	return (
		<div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center'}}>
			<span style={{position: 'relative', fontFamily: SANS, fontWeight: 900, fontSize: size, color, letterSpacing: -2, textShadow: '0 6px 40px rgba(0,0,0,0.9)', fontVariantNumeric: 'tabular-nums'}}>
				${v.toLocaleString('tr-TR')}
				<span style={{position: 'absolute', left: -10, right: -10, top: '52%', height: 10, background: RED, transform: `scaleX(${strike})`, transformOrigin: 'left'}} />
			</span>
		</div>
	);
};

const Snow: React.FC<{t: number; n?: number}> = ({t, n = 70}) => (
	<AbsoluteFill>
		{Array.from({length: n}, (_, i) => {
			const x = random(`sx${i}`) * 1080 + Math.sin(t * 0.8 + i) * 30;
			const y = ((random(`sy${i}`) * 1920 + t * (60 + random(`sv${i}`) * 90)) % 1960) - 20;
			const s = 3 + random(`ss${i}`) * 7;
			return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: '#fff', opacity: 0.75}} />;
		})}
	</AbsoluteFill>
);

const Candle: React.FC<{t: number}> = ({t}) => {
	const fl = 1 + Math.sin(t * 13) * 0.05 + Math.sin(t * 7.3) * 0.04;
	return (
		<div style={{position: 'absolute', left: 540 - 50, top: 760}}>
			<div style={{position: 'absolute', left: -230, top: -260, width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,180,90,0.35), rgba(255,140,60,0) 65%)', transform: `scale(${fl})`}} />
			<div style={{position: 'absolute', left: 38, top: -70, width: 24, height: 60 * fl, borderRadius: '50% 50% 45% 45% / 70% 70% 30% 30%', background: 'radial-gradient(ellipse at 50% 80%, #fff6d0, #ffb347 55%, rgba(255,120,40,0) 75%)', transform: `skewX(${Math.sin(t * 5) * 4}deg)`}} />
			<div style={{position: 'absolute', left: 48, top: -14, width: 4, height: 16, background: '#222'}} />
			<div style={{width: 100, height: 300, background: 'linear-gradient(90deg, #d9cdb4, #f3ead6 45%, #c4b597)', borderRadius: '6px 6px 2px 2px'}} />
		</div>
	);
};

const Building: React.FC<{t: number; d: number}> = ({t, d}) => {
	const cols = 9, rows = 26;
	const off = r(t, 2.5, d - 1.2);
	return (
		<div style={{position: 'absolute', left: 540 - 230, top: 470, width: 460, height: 1150, background: 'linear-gradient(#1b2433, #0c1018)', boxShadow: '0 0 120px rgba(80,120,200,0.15)'}}>
			{Array.from({length: cols * rows}, (_, i) => {
				const lit = random(`w${i}`) > off;
				return <div key={i} style={{position: 'absolute', left: 22 + (i % cols) * 48, top: 30 + Math.floor(i / cols) * 42, width: 30, height: 24, background: lit ? '#f4d58d' : '#141a24', opacity: lit ? 0.9 : 1, boxShadow: lit ? '0 0 10px rgba(244,213,141,0.5)' : 'none'}} />;
			})}
		</div>
	);
};

const TV: React.FC<{t: number; children: React.ReactNode}> = ({t, children}) => (
	<AbsoluteFill style={{background: '#050505'}}>
		<div style={{position: 'absolute', left: 50, right: 50, top: 520, height: 820, borderRadius: 40, border: '18px solid #1e1e1e', overflow: 'hidden', background: '#0a1a33', boxShadow: '0 0 140px rgba(60,120,255,0.25)'}}>
			{children}
			<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, rgba(0,0,0,0) 2px 5px)'}} />
			<AbsoluteFill style={{background: `rgba(255,255,255,${t < 0.25 ? 0.6 - t * 2.4 : 0})`}} />
		</div>
	</AbsoluteFill>
);

/* ---------- scenes ---------- */

type SP = {t: number; d: number};
const SCENES: Record<string, React.FC<SP>> = {
	hook: ({t, d}) => (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 47%, rgba(232,194,106,${0.18 * r(t, 0.3, 2)}), rgba(0,0,0,0) 55%)`}} />
			<Note rotY={interpolate(t, [0, 2.2, d], [-160, -12, 10], {extrapolateRight: 'clamp', easing: ease})} rotZ={-6 + t * 0.8} y={r(t, 0, 2.2, -500, 0)} w={r(t, 0, d, 700, 820)} glow={r(t, 1.5, 3)} />
			<Small text="TEK BİR BANKNOT · BÖLÜM 1" t={t} at={d - 2.4} top={1260} />
		</AbsoluteFill>
	),
	date: ({t, d}) => (
		<AbsoluteFill>
			<Photo src={M('town.jpg')} t={t} d={d} from={1.15} to={1.3} x={[30, -30]} filter="saturate(0.4) brightness(0.45) hue-rotate(185deg) contrast(1.1)" />
			<Snow t={t} />
			<Vignette />
			<div style={{position: 'absolute', left: 340, top: 520, width: 400, height: 460, background: '#f4f1ea', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', transform: `perspective(1400px) rotateX(${r(t, 0, 0.7, -90, 0)}deg)`, transformOrigin: 'top'}}>
				<div style={{background: RED, color: '#fff', fontFamily: SANS, fontWeight: 900, fontSize: 52, textAlign: 'center', padding: '20px 0'}}>ARALIK</div>
				<div style={{fontFamily: SANS, fontWeight: 900, fontSize: 210, color: '#222', textAlign: 'center', lineHeight: 1.15}}>25</div>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 52, color: '#555', textAlign: 'center'}}>2002</div>
			</div>
			<Small text="BATI VİRGİNİA · ABD" t={t} at={1.8} top={1040} />
			<Small text="NOEL SABAHI" t={t} at={1.2} top={430} color="#fff" />
		</AbsoluteFill>
	),
	ticket: ({t, d}) => (
		<AbsoluteFill>
			<Photo src={M('ticket.jpg')} t={t} d={d} from={1.25} to={1.6} x={[-60, 40]} y={[0, 30]} filter="saturate(0.7) brightness(0.75) contrast(1.1)" />
			<Vignette o={0.9} />
			<Temsili />
			<Kicker text="JACK WHITTAKER" t={t} at={0.4} top={320} />
			<Small text="MÜTEAHHİT · 55 YAŞINDA" t={t} at={0.9} top={410} />
		</AbsoluteFill>
	),
	news: ({t, d}) => (
		<TV t={t}>
			<Photo src={M('stack.jpg')} t={t} d={d} from={1.1} to={1.3} filter="brightness(0.35) saturate(0.8)" />
			<div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 50, color: '#fff', letterSpacing: 4}}>POWERBALL</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 260}}>
				<Counter t={t} a={0.6} b={5.5} from={0} to={314900000} top={0} size={104} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 40, color: '#fff', opacity: r(t, 5.2, 5.8)}}>TEK BİLET · TEK KAZANAN</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, display: 'flex'}}>
				<div style={{background: RED, color: '#fff', fontFamily: SANS, fontWeight: 900, fontSize: 40, padding: '30px 24px', opacity: Math.sin(t * 6) > -0.6 ? 1 : 0.6}}>SON DAKİKA</div>
				<div style={{flex: 1, background: '#f2f2f2', overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 700, fontSize: 36, color: '#111', padding: '34px 0'}}>
					<span style={{display: 'inline-block', transform: `translateX(${600 - t * 260}px)`}}>BATI VİRGİNİA'DA TEK BİLET 314,9 MİLYON DOLARLIK İKRAMİYEYİ KAZANDI · BATI VİRGİNİA'DA TEK BİLET…</span>
				</div>
			</div>
		</TV>
	),
	cash: ({t, d}) => (
		<AbsoluteFill>
			<Photo src={M('stack.jpg')} t={t} d={d} from={1.2} to={1.45} filter="brightness(0.4) saturate(0.9)" />
			<Vignette />
			<Temsili />
			<Small text="O GÜNE KADAR TEK BİLETE ÇIKAN" t={t} at={0.2} top={330} color="#fff" />
			<Kicker text={'EN BÜYÜK\nİKRAMİYE'} t={t} at={0.5} top={390} color={GOLD} size={96} />
			<Counter t={t} a={0} b={0.1} from={314900000} to={314900000} top={700} color="#fff" size={84} strike={r(t, 4.0, 4.6)} />
			<Small text="VERGİLERDEN SONRA NAKİT" t={t} at={4.6} top={860} />
			<Counter t={t} a={4.8} b={6.6} from={314900000} to={113000000} top={920} size={120} />
		</AbsoluteFill>
	),
	good: ({t, d}) => (
		<AbsoluteFill>
			<Photo src={M('town.jpg')} t={t} d={d} from={1.1} to={1.2} x={[0, -40]} filter="saturate(0.9) brightness(0.55) sepia(0.3)" />
			<Vignette />
			{['KİLİSELERE BAĞIŞ', 'VAKIF', 'HERKES ONU SEVİYOR'].map((s, i) => {
				const at = 0.2 + i * 1.25;
				const o = r(t, at, at + 0.4);
				return (
					<div key={s} style={{position: 'absolute', left: 120, right: 120, top: 560 + i * 170, padding: '26px 0', textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 54, color: '#fff', background: 'rgba(20,16,8,0.6)', borderLeft: `10px solid ${GOLD}`, opacity: o, transform: `translateX(${(1 - o) * -120}px)`}}>
						{s}
					</div>
				);
			})}
		</AbsoluteFill>
	),
	turn: ({t, d}) => (
		<AbsoluteFill style={{background: '#000'}}>
			<Note rotY={8} rotZ={-4 + t * 2} w={720} y={-80} dark={r(t, 0.2, 2)} />
			<AbsoluteFill style={{background: `rgba(255,255,255,${t < 0.15 ? 0.7 : 0})`}} />
			<Kicker text={'AMA PARA…\nKENDİ KURALLARINI KOYAR'} t={t} at={0.7} top={1150} size={64} />
		</AbsoluteFill>
	),
	robbery: ({t, d}) => {
		const red = Math.sin(t * 9) > 0;
		return (
			<AbsoluteFill>
				<Photo src={M('police.jpg')} t={t} d={d} from={1.5} to={1.7} x={[60, -20]} y={[140, 120]} filter="brightness(0.6) saturate(1.1) contrast(1.1)" />
				<AbsoluteFill style={{background: red ? 'rgba(255,30,40,0.18)' : 'rgba(40,80,255,0.18)', mixBlendMode: 'screen'}} />
				<Vignette />
				<Temsili />
			<Small text="BİR GECE · ARABASI SOYULUYOR" t={t} at={0.2} top={420} color="#fff" />
				<Stamp text="$545.000" t={t} at={2.3} top={760} color={RED} size={110} />
				<Small text="ÇANTADAN ÇALINDI" t={t} at={2.7} top={960} color={RED} />
			</AbsoluteFill>
		);
	},
	fall: ({t, d}) => {
		const cand = r(t, 4.2, 5.0);
		return (
			<AbsoluteFill style={{background: '#070707'}}>
				<div style={{opacity: 1 - cand}}>
					<Stamp text="DAVALAR" t={t} at={0.4} top={600} rot={-7} />
					<Stamp text="SKANDALLAR" t={t} at={1.5} top={820} rot={5} color="#f0a020" />
				</div>
				<div style={{opacity: cand}}>
					<Candle t={t} />
					<div style={{position: 'absolute', top: 1140, left: 0, right: 0, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: '#eadbc0'}}>Brandi</div>
					<div style={{position: 'absolute', top: 1230, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: '#9b8f7c'}}>TORUNU · 2004</div>
				</div>
			</AbsoluteFill>
		);
	},
	quote: ({t, d}) => {
		const q = 'Keşke o bileti yırtıp atsaydım.';
		const qs = 2.9;
		const n = Math.floor(r(t, qs, qs + 1.6) * q.length);
		const tear = r(t, d - 1.1, d - 0.3);
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<Small text="JEWELL WHITTAKER · EŞİ" t={t} at={0.4} top={560} color="#9b8f7c" />
				<div style={{position: 'absolute', top: 680, left: 90, right: 90, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, lineHeight: 1.2, color: '#fff'}}>“{q.slice(0, n)}{n < q.length && t > qs ? '|' : ''}{n >= q.length ? '”' : ''}</div>
				<div style={{position: 'absolute', top: 1060, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: r(t, qs + 1.4, qs + 1.8)}}>
					{[0, 1].map((k) => (
						<div key={k} style={{width: 210, height: 130, background: '#f6f0e2', clipPath: k === 0 ? 'polygon(0 0,100% 0,92% 20%,100% 40%,90% 60%,100% 80%,94% 100%,0 100%)' : 'polygon(8% 0,100% 0,100% 100%,6% 100%,0 80%,10% 60%,0 40%,8% 20%)', transform: `translateX(${(k ? 1 : -1) * tear * 90}px) rotate(${(k ? 1 : -1) * tear * 14}deg)`, fontFamily: SANS, fontWeight: 900, fontSize: 30, color: RED, display: 'flex', alignItems: 'center', justifyContent: k ? 'flex-start' : 'flex-end', padding: '0 8px'}}>
							{k ? 'BALL' : 'POWER'}
						</div>
					))}
				</div>
				<div style={{position: 'absolute', top: 1220, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontSize: 24, color: '#6d665b', opacity: r(t, qs + 1.5, qs + 2)}}>“I wish I would have torn the ticket up.”</div>
			</AbsoluteFill>
		);
	},
	casino: ({t, d}) => {
		const a = d / 3;
		const which = t < a ? 'boardwalk.jpg' : t < 2 * a ? 'slots.jpg' : 'blackjack.jpg';
		const lt = t < a ? t : t < 2 * a ? t - a : t - 2 * a;
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<div style={{position: 'absolute', inset: 0, opacity: r(lt, 0, 0.35)}}>
					<Photo src={M(which)} t={lt} d={a} from={1.15} to={1.35} filter="brightness(0.6) saturate(1.1)" />
				</div>
				<Vignette />
				<Temsili />
			<Small text="ATLANTIC CITY" t={t} at={0.3} top={360} color="#fff" />
				{t > 2 * a ? <Note w={520} rotY={-20} rotZ={interpolate(t, [2 * a, d], [-25, 15])} x={interpolate(t, [2 * a, d], [-700, 700])} y={-120} /> : null}
				<Stamp text="$1.500.000" t={t} at={a + 2.2} top={700} color={RED} size={100} />
				<Small text="KARŞILIKSIZ ÇEK · DAVA" t={t} at={a + 2.6} top={890} color={RED} />
			</AbsoluteFill>
		);
	},
	next: ({t, d}) => (
		<AbsoluteFill style={{background: 'linear-gradient(#06080c, #0e1520)'}}>
			<Building t={t} d={d} />
			<Kicker text="158 YIL" t={t} at={0.6} top={300} color={GOLD} size={120} />
		</AbsoluteFill>
	),
	end: ({t, d}) => (
		<AbsoluteFill style={{background: '#000'}}>
			<Note w={560} rotY={-15 + t * 4} rotZ={-5} y={-260} glow={0.5} />
			<Small text="TEK BİR BANKNOT" t={t} at={0.2} top={960} />
			<Kicker text={'BÖLÜM 2\n158 YIL'} t={t} at={1.2} top={1020} size={84} />
			<div style={{position: 'absolute', top: 1290, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontSize: 26, color: '#8a8a8a', opacity: r(t, 2, 2.6)}}>Banknotun yolculuğu kurgudur · Hikâye gerçektir</div>
			<div style={{position: 'absolute', top: 1335, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontSize: 22, color: '#666', opacity: r(t, 2, 2.6)}}>Fotoğraflar: Wikimedia Commons (lisanslar açıklamada) · Müzik: Kevin MacLeod CC BY 4.0</div>
		</AbsoluteFill>
	),
};

const Subtitle: React.FC<{l?: Line}> = ({l}) => {
	if (!l || !l.sub) return null;
	const quote = l.role !== 'N';
	return (
		<div style={{position: 'absolute', left: 70, right: 70, top: 1440, textAlign: 'center'}}>
			<span style={{fontFamily: quote ? SERIF : SANS, fontStyle: quote ? 'italic' : 'normal', fontWeight: 700, fontSize: quote ? 50 : 46, lineHeight: 1.28, color: quote ? GOLD : '#fff', textShadow: '0 0 4px #000, 0 3px 12px rgba(0,0,0,0.95)'}}>{l.sub}</span>
		</div>
	);
};

export const Banknot1: React.FC<{timeline: TL; audio: string}> = ({timeline, audio}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const sc = timeline.scenes.find((s) => t >= s.start && t < s.end) ?? timeline.scenes[timeline.scenes.length - 1];
	const prev = timeline.scenes[timeline.scenes.indexOf(sc) - 1];
	const local = t - sc.start;
	const S = SCENES[sc.id];
	const P = prev ? SCENES[prev.id] : null;
	const xf = 0.3;
	const line = timeline.lines.find((l) => t >= l.start - 0.05 && t <= l.end + 0.15);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Audio src={staticFile(audio)} />
			{P && local < xf ? <AbsoluteFill><P t={t - prev.start} d={prev.end - prev.start} /></AbsoluteFill> : null}
			<AbsoluteFill style={{opacity: P ? r(local, 0, xf) : 1}}>
				<S t={local} d={sc.end - sc.start} />
			</AbsoluteFill>
			<Grain />
			<Subtitle l={line} />
		</AbsoluteFill>
	);
};
