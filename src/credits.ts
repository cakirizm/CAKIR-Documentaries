// Builds the end-credit roll from the asset register: every asset actually
// used in the edit, grouped by type, with author and licence.
import type {CreditBlock} from '../framework/components/overlays/Overlays';

const usedIds = (episode: any): Set<string> => {
	const s = new Set<string>();
	const add = (sh: any) => {
		if (!sh) return;
		if (sh.asset) s.add(sh.asset);
		if (sh.bg) s.add(sh.bg);
		if (sh.left) add(sh.left);
		if (sh.right) add(sh.right);
	};
	episode.segments.forEach((g: any) => g.shots.forEach(add));
	return s;
};

export const buildCredits = (episode: any, register: any[], extra: CreditBlock[]): CreditBlock[] => {
	const used = usedIds(episode);
	const rows = register.filter((a) => used.has(a.id) && a.status === 'approved');
	const fmt = (a: any) => {
		const author = String(a.author || '').replace(/\s+from .*$/, '');
		const what = a.commons ? String(a.commons).replace(/^File:/, '').replace(/\.(webm|jpg|jpeg|png|tif)$/i, '') : a.title || a.caption || a.id;
		return `${what} — ${author}${a.license ? ' · ' + String(a.license).replace(/^Unverified.*/, 'licence unverified') : ''}`;
	};
	const uniq = (xs: string[]) => Array.from(new Set(xs));
	const nasseri = rows.filter((a) => a.kind === 'photo' && (/nasseri/i.test(a.id) || a.userSupplied));
	const photos = rows.filter((a) => a.kind === 'photo' && !nasseri.includes(a));
	const commonsVideo = rows.filter((a) => a.kind === 'video' && a.source === 'wikimedia');
	const coverr = rows.filter((a) => a.source === 'coverr');
	return [
		{heading: 'Photographs of Mehran Karimi Nasseri', lines: uniq(nasseri.map((a) => (a.userSupplied ? `${a.caption} — supplied by the channel owner` : fmt(a))))},
		{heading: 'Photographs · Wikimedia Commons', lines: uniq(photos.map(fmt))},
		{heading: 'Footage · Wikimedia Commons', lines: uniq(commonsVideo.map(fmt))},
		{heading: 'Stock footage · Coverr (Coverr License)', lines: uniq(coverr.map((a) => a.title || a.id))},
		...extra,
	].filter((b) => b.lines.length);
};
