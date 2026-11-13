import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/alegreya/400.css';
import '@fontsource/alegreya/700.css';
import '@fontsource/alegreya/400-italic.css';
import '@fontsource/amiri-quran/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/400.css';
import {SCENES} from './Scenes';

const FPS = 30;
const SERIF = 'Alegreya, Georgia, serif';
const SANS = 'Inter, sans-serif';
const QURAN = '"Amiri Quran", serif';
const GOLD = '#d9b25e';
const INK = '#f4ecdc';
const SAFE_BOTTOM = 430; // Reels / Shorts UI
const SAFE_TOP = 230;

type Block = {id: string; type: 'narr' | 'ayah'; scene: string; start: number; end: number; sentences?: {text: string; start: number; end: number}[]; chunks?: {text: string; start: number; meal: number}[]; mealSegments?: string[]; ayah?: number; recStart?: number; recEnd?: number};
type TL = {durationSec: number; tailSec: number; blocks: Block[]; cues: {start: number; end: number; text: string; kind?: string}[]};

const fade = (frame: number, a: number, b: number, d = 12) => interpolate(frame, [a, a + d, b - d, b], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/* big short on-screen statements per scene */
const HEADERS: Record<string, {text: string; at?: number; dur?: number; size?: number}> = {
	fatcows: {text: '7 BESİLİ İNEK', at: 1.2},
	thincows: {text: '7 ZAYIF İNEK', at: 0.8},
	ears: {text: '7 + 7', at: 3.5, dur: 4, size: 150},
	council: {text: '"KARMAKARIŞIK DÜŞLER"', at: 7.5, size: 64},
	fields: {text: 'İLK 7 YIL — ÜRETİM', at: 0.6},
	store: {text: 'TÜKETİMİ SINIRLA —\nÜRÜNÜ SAKLA', at: 0.8},
	drying: {text: 'SONRAKİ 7 YIL — KITLIK', at: 0.6},
	silo: {text: 'BİRİKİM AZALIR,\nAMA TÜKENMEZ', at: 1.5},
	timeline14: {text: '7 YIL + 7 YIL =\n14 YILLIK HAZIRLIK', at: 0.8},
	revival: {text: 'YENİDEN BEREKET', at: 6},
};
const REPRESENTATIVE: Record<string, string> = {
	night: 'Temsilî canlandırma',
	prison: 'Temsilî canlandırma · Hz. Yusuf’un yüzü gösterilmez',
	revival: 'Temsilî canlandırma',
	remember: 'Temsilî canlandırma',
};

const Header: React.FC<{text: string; size?: number}> = ({text, size = 84}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
	const y = interpolate(f, [0, 18], [24, 0], {extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', top: SAFE_TOP + 40, left: 70, right: 140, opacity: o, transform: `translateY(${y}px)`}}>
			<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.05, color: INK, whiteSpace: 'pre-line', textShadow: '0 2px 18px rgba(0,0,0,0.65)'}}>{text}</div>
			<div style={{width: 120, height: 4, background: GOLD, marginTop: 22, opacity: 0.9}} />
		</div>
	);
};

const Subtitle: React.FC<{text: string}> = ({text}) => (
	<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: SAFE_BOTTOM}}>
		<div style={{maxWidth: 900, textAlign: 'center', whiteSpace: 'pre-line', fontFamily: SANS, fontWeight: 600, fontSize: 48, lineHeight: 1.3, color: '#fff', textShadow: '0 0 3px rgba(0,0,0,0.95), 0 3px 10px rgba(0,0,0,0.85), 0 0 26px rgba(0,0,0,0.6)'}}>{text}</div>
	</AbsoluteFill>
);

/* the verse: reference, Arabic chunk synced to the recitation, Diyanet meal */
const AyahOverlay: React.FC<{b: Block}> = ({b}) => {
	const f = useCurrentFrame();
	const t = b.start + f / FPS;
	const chunks = b.chunks!;
	let ci = chunks.findIndex((c, i) => t >= c.start - 0.15 && (i + 1 >= chunks.length || t < chunks[i + 1].start - 0.15));
	if (ci < 0) ci = 0;
	const cur = chunks[ci];
	const local = (t - (cur.start - 0.15)) * FPS;
	const inO = interpolate(local, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const total = (b.end - b.start) * FPS;
	const o = fade(f, 0, total, 18);
	const seg = cur.meal;
	return (
		<AbsoluteFill style={{opacity: o}}>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,7,5,0.88) 0%, rgba(10,7,5,0.55) 34%, rgba(10,7,5,0) 52%, rgba(10,7,5,0) 56%, rgba(10,7,5,0.7) 72%, rgba(10,7,5,0.92) 100%)'}} />
			<div style={{position: 'absolute', top: SAFE_TOP + 10, left: 0, right: 0, textAlign: 'center'}}>
				<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: 6, color: GOLD}}>YÛSUF SURESİ · {b.ayah}. AYET</div>
				<div style={{width: 80, height: 2, background: GOLD, margin: '16px auto 0', opacity: 0.7}} />
			</div>
			<div style={{position: 'absolute', top: SAFE_TOP + 80, left: 70, right: 70, height: 430, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div dir="rtl" lang="ar" style={{fontFamily: QURAN, fontSize: 82, lineHeight: 1.75, color: INK, textAlign: 'center', opacity: inO, transform: `translateY(${(1 - inO) * 16}px)`, textShadow: '0 2px 20px rgba(0,0,0,0.7)'}}>
					{cur.text}
				</div>
			</div>
			<div style={{position: 'absolute', left: 80, right: 80, bottom: SAFE_BOTTOM - 20, fontFamily: SERIF, fontSize: 40, lineHeight: 1.36, color: INK, textAlign: 'center'}}>
				{b.mealSegments!.map((s, i) => (
					<span key={i} style={{color: i === seg ? '#fff' : INK, opacity: i < seg ? 0.55 : i === seg ? 1 : 0.28, background: i === seg ? 'rgba(217,178,94,0.22)' : 'none', borderRadius: 6, transition: 'none'}}>
						{s}
					</span>
				))}
				<div style={{fontFamily: SANS, fontSize: 20, letterSpacing: 2, color: 'rgba(244,236,220,0.6)', marginTop: 16}}>Diyanet İşleri meali</div>
			</div>
			{f < 5 * FPS ? (
				<div style={{position: 'absolute', top: SAFE_TOP + 520, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontSize: 22, color: 'rgba(244,236,220,0.7)', opacity: fade(f, 10, 5 * FPS)}}>
					Tilavet: Mahmud Halil el-Husarî
				</div>
			) : null}
		</AbsoluteFill>
	);
};

const Tag: React.FC<{text: string}> = ({text}) => (
	<div style={{position: 'absolute', right: 150, top: SAFE_TOP - 70, fontFamily: SANS, fontSize: 20, letterSpacing: 1.5, color: 'rgba(244,236,220,0.75)', background: 'rgba(0,0,0,0.35)', padding: '6px 12px', borderRadius: 4}}>{text}</div>
);

const Opening: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: SAFE_TOP + 40, left: 70, right: 140, opacity: fade(f, 0, 4.5 * FPS, 14)}}>
				<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 80, lineHeight: 1.08, color: INK, textShadow: '0 2px 18px rgba(0,0,0,0.7)'}}>7 İnek Bir Ülkenin Geleceğini Nasıl Değiştirdi?</div>
				<div style={{width: 120, height: 4, background: GOLD, marginTop: 24}} />
			</div>
			<div style={{position: 'absolute', bottom: SAFE_BOTTOM + 180, left: 70, right: 140, fontFamily: SANS, fontSize: 24, color: 'rgba(244,236,220,0.75)', opacity: fade(f, 0.6 * FPS, 5 * FPS, 14)}}>
				Kaynak: Kur&#8217;an-ı Kerim, Yûsuf Suresi 43–49 · Canlandırmalar temsilîdir.
			</div>
		</AbsoluteFill>
	);
};

const EndCard: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{background: `rgba(14,10,7,${0.55 * o})`, justifyContent: 'center', alignItems: 'center'}}>
			<div style={{textAlign: 'center', opacity: o, marginTop: -120}}>
				<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 92, color: INK, letterSpacing: 2}}>YÛSUF SURESİ</div>
				<div style={{fontFamily: SERIF, fontSize: 70, color: GOLD, marginTop: 6}}>43 – 49</div>
				<div style={{width: 140, height: 3, background: GOLD, margin: '34px auto', opacity: 0.8}} />
				<div style={{fontFamily: SANS, fontSize: 24, lineHeight: 1.7, color: 'rgba(244,236,220,0.8)'}}>
					Tilavet: Mahmud Halil el-Husarî
					<br />
					Meal: Diyanet İşleri · Arapça metin: Tanzil
					<br />
					Müzik: Kevin MacLeod (incompetech.com), CC BY 4.0
					<br />
					Türkçe seslendirme: yapay zekâ sesi (ElevenLabs)
					<br />
					3D canlandırmalar temsilîdir
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const YusufFilm: React.FC<{timeline: TL; audio: string}> = ({timeline, audio}) => {
	const f = (s: number) => Math.round(s * FPS);
	const blocks = timeline.blocks;
	const total = f(timeline.durationSec);
	const XF = 14;
	return (
		<AbsoluteFill style={{background: '#16110d'}}>
			{blocks.map((b, i) => {
				const st = f(b.start), en = i + 1 < blocks.length ? f(blocks[i + 1].start) : total;
				const S = SCENES[b.scene];
				return (
					<Sequence key={b.id} from={st} durationInFrames={en - st + XF} name={`${b.id} ${b.scene}`}>
						<SceneFade inFrames={i ? XF : 0}>
							<SceneHost S={S} D={en - st} />
						</SceneFade>
					</Sequence>
				);
			})}
			{/* overlays */}
			<Sequence from={0} durationInFrames={f(5)}>
				<Opening />
			</Sequence>
			{blocks.map((b, i) => {
				const st = f(b.start), en = i + 1 < blocks.length ? f(blocks[i + 1].start) : total - f(timeline.tailSec);
				const h = HEADERS[b.scene];
				const out: React.ReactNode[] = [];
				if (h) {
					const a = st + f(h.at ?? 0.6), d = h.dur ? f(h.dur) : en - a - 6;
					out.push(
						<Sequence key={b.id + 'h'} from={a} durationInFrames={Math.max(1, d)}>
							<Header text={h.text} size={h.size} />
						</Sequence>,
					);
				}
				if (REPRESENTATIVE[b.scene]) {
					out.push(
						<Sequence key={b.id + 'r'} from={st + 10} durationInFrames={Math.min(f(4), en - st - 10)}>
							<Tag text={REPRESENTATIVE[b.scene]} />
						</Sequence>,
					);
				}
				if (b.type === 'ayah') {
					out.push(
						<Sequence key={b.id + 'a'} from={st} durationInFrames={en - st}>
							<AyahOverlay b={b} />
						</Sequence>,
					);
				}
				return out;
			})}
			{timeline.cues
				.filter((c) => c.kind !== 'meal')
				.map((c, i) => (
					<Sequence key={'c' + i} from={f(c.start)} durationInFrames={Math.max(1, f(c.end) - f(c.start))}>
						<Subtitle text={c.text} />
					</Sequence>
				))}
			<Sequence from={total - f(timeline.tailSec)} durationInFrames={f(timeline.tailSec)}>
				<EndCard dur={f(timeline.tailSec)} />
			</Sequence>
			<Audio src={staticFile(audio)} />
		</AbsoluteFill>
	);
};

const SceneHost: React.FC<{S: React.FC<{f: number; D: number}>; D: number}> = ({S, D}) => {
	const fr = useCurrentFrame();
	return <S f={fr} D={D} />;
};

const SceneFade: React.FC<{children: React.ReactNode; inFrames: number}> = ({children, inFrames}) => {
	const fr = useCurrentFrame();
	const o = inFrames ? interpolate(fr, [0, inFrames], [0, 1], {extrapolateRight: 'clamp'}) : 1;
	return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};
