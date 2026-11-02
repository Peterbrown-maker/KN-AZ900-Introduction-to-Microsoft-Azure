import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { SimFrame, Seg, Bar } from '../ui';

export const STOP = new Set('a an the and or but if of to in on at by for with from as is are was were be been being it its this that these those i we you he she they them our my your his her their me us do did does not no so than then there here also very really just about into over after before because while up down out can could will would should may might must have has had am which who whom what when where why how all any each both few more most other some such only own same too s t'.split(' '));
const words = (t: string) => t.toLowerCase().match(/[a-záéíóúñü'$€£0-9.%-]+/gi)?.map((w) => w.replace(/^[.'-]+|[.'-]+$/g, '')).filter(Boolean) ?? [];
const sentencesOf = (t: string) => t.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [];

// ---------------- Text analysis primitives ----------------
const LANGS: Record<string, { name: string; code: string; words: string[] }> = {
  en: { name: 'English', code: 'en', words: ['the', 'and', 'is', 'was', 'to', 'of', 'i', 'my', 'it', 'for', 'a', 'with', 'this', 'you'] },
  es: { name: 'Spanish', code: 'es', words: ['el', 'la', 'y', 'es', 'de', 'que', 'en', 'me', 'mi', 'vivo', 'llamo', 'hola', 'un', 'una', 'por', 'muy'] },
  fr: { name: 'French', code: 'fr', words: ['le', 'la', 'et', 'est', 'de', 'je', 'les', 'un', 'une', 'très', 'pour', 'bonjour', 'avec'] },
  de: { name: 'German', code: 'de', words: ['der', 'die', 'und', 'ist', 'ich', 'nicht', 'das', 'ein', 'eine', 'mit', 'sehr', 'hallo'] },
};
export function detectLanguage(t: string) {
  const w = words(t);
  const scores = Object.entries(LANGS).map(([k, l]) => [k, w.filter((x) => l.words.includes(x)).length] as const).sort((a, b) => b[1] - a[1]);
  const total = scores.reduce((s, [, n]) => s + n, 0) || 1;
  return { ...LANGS[scores[0][0]], confidence: scores[0][1] ? scores[0][1] / total : 0 };
}
const POS = ['fantastic', 'perfectly', 'tasty', 'friendly', 'efficient', 'great', 'recommend', 'wonderful', 'cozy', 'excellent', 'enjoyable', 'love', 'good', 'happy', 'fast', 'helpful', 'quickly', 'thanks', 'resolved', 'perfect', 'attentive', 'easy'];
const NEG = ['terrible', 'awful', 'bad', 'slow', 'rude', 'broken', 'twice', 'angry', 'worst', 'disappointed', 'never', 'late', 'cold', 'wrong', 'charged', 'refund', 'problem', 'useless', 'poor', 'missing'];
export function sentiment(s: string) {
  const w = words(s);
  let score = 0;
  w.forEach((x, i) => { const neg = i > 0 && ['not', "n't", 'never', 'no'].includes(w[i - 1]); if (POS.includes(x)) score += neg ? -1 : 1; if (NEG.includes(x)) score += neg ? 0.5 : -1; });
  const label = score > 0.5 ? 'positive' : score < -0.5 ? 'negative' : 'neutral';
  return { score, label };
}
/** RAKE: candidate phrases are runs of non-stop words; score = Σ degree/frequency. */
export function keyPhrases(t: string, n = 8) {
  const cands: string[][] = [];
  for (const s of sentencesOf(t)) {
    let cur: string[] = [];
    for (const w of s.split(/[\s,;:()"—–-]+/)) {
      const lw = w.toLowerCase().replace(/[.!?'"]/g, '');
      if (!lw || STOP.has(lw) || /^\d/.test(lw)) { if (cur.length) cands.push(cur); cur = []; } else cur.push(lw);
    }
    if (cur.length) cands.push(cur);
  }
  const freq: Record<string, number> = {}, deg: Record<string, number> = {};
  cands.forEach((c) => c.forEach((w) => { freq[w] = (freq[w] ?? 0) + 1; deg[w] = (deg[w] ?? 0) + c.length; }));
  const uniq = [...new Map(cands.filter((c) => c.length <= 3).map((c) => [c.join(' '), c])).values()];
  return uniq.map((c) => ({ p: c.join(' '), s: c.reduce((a, w) => a + deg[w] / freq[w], 0) })).sort((a, b) => b.s - a.s).slice(0, n);
}
const ORGS = ['Microsoft', 'Contoso', 'Fourth Coffee', 'Azure', 'Adventure Works', 'DHL'];
const LOCS = ['Seattle', 'New York', 'London', 'Madrid', 'España', 'Portland', 'Lisbon', 'UK', 'Paris'];
const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
export type Ent = { text: string; type: string; pii?: boolean };
export function entities(t: string): Ent[] {
  const out: Ent[] = [];
  const add = (re: RegExp, type: string, pii = false) => { for (const m of t.matchAll(re)) if (!out.some((e) => e.text.includes(m[0]) || m[0].includes(e.text))) out.push({ text: m[0], type, pii }); };
  add(/[\w.+-]+@[\w-]+\.[\w.]+/g, 'Email', true);
  add(/\b(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3,4}\)?[\s-]?)\d{3}[\s-]?\d{3,4}\b/g, 'Phone number', true);
  add(/\b\d{1,4}\s+[A-Z][a-z]+\s+(?:Road|Street|St|Avenue|Ave|Lane)\b[^.]*?(?=\.|$)/g, 'Address', true);
  add(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, 'Credit card number', true);
  add(new RegExp(`\\b(?:${MONTHS})\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,\\s*\\d{4})?`, 'g'), 'DateTime · Date');
  add(/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/g, 'DateTime · Date');
  add(/\b\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?/g, 'DateTime · Time');
  add(/\b\d+\s+(?:hours?|minutes?|days?)\b/g, 'DateTime · Duration');
  add(/[$€£]\s?\d[\d,]*(?:\.\d+)?/g, 'Quantity · Currency');
  add(/\b\d+(?:\.\d+)?%/g, 'Quantity · Percentage');
  add(/\b\d+\s+(?:miles|km|kilometres|kilometers)\b/g, 'Quantity · Dimension');
  ORGS.forEach((o) => add(new RegExp(`\\b${o}\\b`, 'g'), 'Organization'));
  LOCS.forEach((l) => add(new RegExp(`\\b${l}\\b`, 'g'), 'Location'));
  add(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g, 'Person', true);
  for (const m of t.matchAll(/(?:waiter|server|name is|this is|Hi|from|llamo),?\s+([A-Z][a-z]+)/g)) if (!out.some((e) => e.text.includes(m[1]))) out.push({ text: m[1], type: 'Person', pii: true });
  return out.filter((e) => !(e.type === 'Person' && [...ORGS, ...LOCS].some((x) => e.text.includes(x))));
}
export function summarize(t: string, n = 2) {
  const ss = sentencesOf(t);
  const f: Record<string, number> = {};
  words(t).filter((w) => !STOP.has(w)).forEach((w) => (f[w] = (f[w] ?? 0) + 1));
  const scored = ss.map((s, i) => ({ s, i, v: words(s).filter((w) => !STOP.has(w)).reduce((a, w) => a + f[w], 0) / Math.max(4, words(s).length) }));
  return scored.sort((a, b) => b.v - a.v).slice(0, n).sort((a, b) => a.i - b.i).map((x) => x.s);
}

const SAMPLES = [
  { name: 'Restaurant review', text: 'I had a fantastic meal at the diner in Seattle on Saturday. The mushroom risotto was perfectly prepared, and really tasty. Our waiter, Pete, was friendly and efficient; and gave us a great recommendation for a dessert (strawberry cheesecake). I\'d definitely recommend this place for a casual dinner.' },
  { name: 'Support message', text: 'Hi, this is Maria Garcia. Contoso charged my card twice on March 3rd for $49.99 and nobody has replied to my emails. Please call me on 020 7946 0958 or write to maria.garcia@example.com. Send the refund letter to 42 Market Road, London. I am very disappointed with the slow service.' },
  { name: 'Spanish message', text: '¡Hola! Me llamo Josefina y vivo en Madrid, España. El servicio fue muy rápido y el personal muy amable.' },
  { name: 'Conference note', text: 'On May 2nd, 2017, John Smith visited New York to attend a conference hosted by Microsoft. The event started at 8:00 AM and lasted 3 hours. Over 25% of the 40 attendees traveled more than 10 miles to participate.' },
];
const ENT_COL: Record<string, string> = { Person: '#f472b6', Location: '#34d399', Organization: '#60a5fa', Email: '#f87171', 'Phone number': '#f87171', Address: '#f87171', 'Credit card number': '#f87171' };
const entColor = (t: string) => ENT_COL[t] ?? (t.startsWith('DateTime') ? '#f59e0b' : '#a78bfa');

function Highlight({ text, ents, redact }: { text: string; ents: Ent[]; redact?: boolean }) {
  const list = ents.filter((e) => !redact || e.pii);
  if (!list.length) return <>{text}</>;
  const re = new RegExp(`(${list.map((e) => e.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  return <>{text.split(re).map((p, i) => { const e = list.find((x) => x.text === p); if (!e) return <span key={i}>{p}</span>; return redact ? <span key={i} className="px-1 rounded bg-red-500/30 text-red-100 font-mono text-xs">[{e.type}]</span> : <mark key={i} className="rounded px-0.5 text-white" style={{ background: `${entColor(e.type)}44`, borderBottom: `2px solid ${entColor(e.type)}` }}>{p}</mark>; })}</>;
}

export function NLPLab() {
  const [si, setSi] = useState(0);
  const [text, setText] = useState(SAMPLES[0].text);
  const [tab, setTab] = useState<'lang' | 'sent' | 'key' | 'ent' | 'pii' | 'sum'>('sent');
  const lang = useMemo(() => detectLanguage(text), [text]);
  const sents = useMemo(() => sentencesOf(text).map((s) => ({ s, ...sentiment(s) })), [text]);
  const overall = sentiment(text);
  const kp = useMemo(() => keyPhrases(text), [text]);
  const ents = useMemo(() => entities(text), [text]);
  const sum = useMemo(() => summarize(text), [text]);
  const col = { positive: '#34d399', negative: '#f87171', neutral: '#94a3b8' } as const;
  return (
    <SimFrame title="NLP laboratory" icon="FileSearch"
      shows="One piece of text, many analyses: language, sentiment per sentence, key phrases (RAKE algorithm), named entities, PII redaction and an extractive summary. Edit the text and everything updates."
      omits="These are lightweight rule- and statistics-based implementations running in your browser. Azure Language uses trained models and is far more accurate across languages and edge cases.">
      <div className="flex flex-wrap gap-2 mb-3">
        {SAMPLES.map((s, i) => <button key={s.name} onClick={() => { setSi(i); setText(s.text); }} className={`text-xs px-3 py-1.5 rounded-full border ${i === si ? 'text-[#050a17] border-transparent' : 'border-white/10 text-gray-300'}`} style={i === si ? { background: 'var(--accent)' } : undefined}>{s.name}</button>)}
      </div>
      <textarea aria-label="Text to analyse" value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-sm text-gray-100 focus:outline-none focus:border-white/30" />
      <div className="my-3 overflow-x-auto"><Seg label="Analysis" value={tab} onChange={setTab} options={[{ value: 'lang', label: 'Language' }, { value: 'sent', label: 'Sentiment' }, { value: 'key', label: 'Key phrases' }, { value: 'ent', label: 'Entities' }, { value: 'pii', label: 'PII redaction' }, { value: 'sum', label: 'Summary' }]} /></div>
      <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-sm min-h-[140px]">
        {tab === 'lang' && <div><p className="text-2xl font-bold text-white">{lang.confidence ? lang.name : 'Unknown'}</p><p className="text-gray-400 font-mono mt-1">ISO 639-1: {lang.code} · confidence {lang.confidence.toFixed(2)}</p><p className="text-xs text-gray-500 mt-2">Often the first step in a pipeline: route the text to the right model or translator.</p></div>}
        {tab === 'sent' && (
          <div className="space-y-2">
            <p>Overall: <b style={{ color: col[overall.label as keyof typeof col] }}>{overall.label}</b> <span className="text-gray-500 font-mono">(score {overall.score})</span></p>
            {sents.map((s, i) => <p key={i} className="pl-3 border-l-2 text-gray-200" style={{ borderColor: col[s.label as keyof typeof col] }}>{s.s} <span className="text-xs" style={{ color: col[s.label as keyof typeof col] }}>{s.label}</span></p>)}
          </div>
        )}
        {tab === 'key' && <div className="flex flex-wrap gap-1.5">{kp.map((k) => <span key={k.p} className="px-2 py-1 rounded-lg bg-violet-500/15 border border-violet-400/30 text-violet-100 text-xs">{k.p} <span className="text-violet-300/60 font-mono">{k.s.toFixed(1)}</span></span>)}</div>}
        {tab === 'ent' && (
          <div className="space-y-3">
            <p className="leading-relaxed text-gray-200"><Highlight text={text} ents={ents} /></p>
            <div className="overflow-x-auto"><table className="text-xs w-full"><thead><tr className="text-gray-400 text-left"><th className="py-1 pr-3">Entity</th><th>Type</th></tr></thead><tbody>{ents.map((e, i) => <tr key={i} className="border-t border-white/5"><td className="py-1 pr-3 text-gray-100">{e.text}</td><td style={{ color: entColor(e.type) }}>{e.type}</td></tr>)}</tbody></table></div>
          </div>
        )}
        {tab === 'pii' && <div><p className="leading-relaxed text-gray-200"><Highlight text={text} ents={ents} redact /></p><p className="text-xs text-gray-500 mt-2">{ents.filter((e) => e.pii).length} PII entities redacted before storing or sharing.</p></div>}
        {tab === 'sum' && <div className="space-y-2"><p className="text-xs uppercase tracking-widest text-gray-500">Extractive summary (top sentences by word-frequency score)</p>{sum.map((s, i) => <p key={i} className="text-gray-100">• {s}</p>)}</div>}
      </motion.div>
    </SimFrame>
  );
}

// ---------------- Preprocessing lab ----------------
const LEMMA: Record<string, string> = { better: 'good', best: 'good', ran: 'run', running: 'run', runs: 'run', went: 'go', goes: 'go', are: 'be', is: 'be', was: 'be', were: 'be', things: 'thing', choose: 'choose', chose: 'choose', mice: 'mouse', children: 'child', easier: 'easy', harder: 'hard' };
const stem = (w: string) => w.replace(/(ing|edly|ed|ies|es|s|ly|er|est)$/, (m) => (m === 'ies' ? 'i' : '')).replace(/(.)\1$/, '$1') || w;
const PRE_TEXT = 'We choose to go to the Moon! We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard. Running harder, we went further.';

export function PreprocessLab() {
  const [opts, setOpts] = useState({ norm: false, stop: false, stem: false, lemma: false, bigram: false });
  const toks = useMemo(() => {
    let t: string[] = (opts.norm ? PRE_TEXT.toLowerCase().replace(/[^\w\s']/g, ' ') : PRE_TEXT).match(opts.norm ? /[\w']+/g : /[\w']+|[^\w\s]/g) ?? [];
    if (opts.stop) t = t.filter((w) => !STOP.has(w.toLowerCase()));
    if (opts.lemma) t = t.map((w) => LEMMA[w.toLowerCase()] ?? w);
    else if (opts.stem) t = t.map((w) => (/^[\w']+$/.test(w) ? stem(w) : w));
    if (opts.bigram) t = t.slice(0, -1).map((w, i) => `${w} ${t[i + 1]}`);
    return t;
  }, [opts]);
  const freq = Object.entries(toks.reduce<Record<string, number>>((m, w) => ((m[w] = (m[w] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const T = (k: keyof typeof opts, label: string) => (
    <label className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border cursor-pointer ${opts[k] ? 'border-transparent text-[#050a17]' : 'border-white/15 text-gray-300'}`} style={opts[k] ? { background: 'var(--accent)' } : undefined}>
      <input type="checkbox" className="sr-only" checked={opts[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked, ...(k === 'lemma' && e.target.checked ? { stem: false } : k === 'stem' && e.target.checked ? { lemma: false } : {}) })} />{label}
    </label>
  );
  return (
    <SimFrame title="Preprocessing lab" icon="Filter" onReset={() => setOpts({ norm: false, stop: false, stem: false, lemma: false, bigram: false })}
      shows="Normalisation makes 'Moon' and 'moon' the same token. Stop-word removal drops low-meaning words. Stemming crudely chops suffixes (note odd results); lemmatisation maps words to dictionary forms ('ran' → 'run', 'are' → 'be'). N-grams keep phrases together."
      omits="The stemmer and lemmatiser here are tiny rule sets; real libraries use full language dictionaries.">
      <p className="text-sm text-gray-400 italic mb-3">"{PRE_TEXT}"</p>
      <div className="flex flex-wrap gap-2 mb-4">{T('norm', 'Normalise (lower-case, strip punctuation)')}{T('stop', 'Remove stop words')}{T('stem', 'Stemming')}{T('lemma', 'Lemmatisation')}{T('bigram', 'Bi-grams')}</div>
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-4">
        <div className="flex flex-wrap gap-1 content-start">{toks.map((t, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-white/8 text-xs font-mono text-gray-100 border border-white/10">{t}</span>)}</div>
        <div className="space-y-1.5"><p className="text-xs text-gray-400">{toks.length} tokens · top frequencies</p>{freq.map(([w, n]) => <div key={w} className="grid grid-cols-[6.5rem_1fr_1.5rem] gap-2 items-center text-xs"><span className="font-mono truncate">{w}</span><Bar value={n / freq[0][1]} /><span className="font-mono text-right">{n}</span></div>)}</div>
      </div>
    </SimFrame>
  );
}

// ---------------- TF-IDF lab ----------------
const DOCS = [
  'Microsoft Copilot Studio lets you build an AI agent declaratively. A declarative agent uses instructions and knowledge, with no code. Copilot Studio publishes the agent to Microsoft 365 so users can chat with the AI agent.',
  'Microsoft Foundry lets developers build an AI agent in code. The agent calls tools through the SDK, and the code deploys the AI agent to Azure. Developers test the agent in the Foundry playground.',
];
export function TfidfLab() {
  const [docs, setDocs] = useState(DOCS);
  const [d, setD] = useState(0);
  const tok = (t: string) => words(t).filter((w) => !STOP.has(w) && w.length > 1);
  const toks = docs.map(tok);
  const N = docs.length;
  const df = (w: string) => toks.filter((t) => t.includes(w)).length;
  const rows = [...new Set(toks[d])].map((w) => { const tf = toks[d].filter((x) => x === w).length; const idf = Math.log(N / df(w)); return { w, tf, df: df(w), idf, tfidf: tf * idf }; });
  const byTf = [...rows].sort((a, b) => b.tf - a.tf).slice(0, 5);
  const byTfidf = [...rows].sort((a, b) => b.tfidf - a.tfidf || b.tf - a.tf).slice(0, 8);
  return (
    <SimFrame title="TF-IDF lab" icon="Sigma" onReset={() => setDocs(DOCS)}
      shows="Words that appear in every document (agent, Microsoft, AI) get IDF = log(N/N) = 0, so TF-IDF surfaces the words that actually distinguish each document."
      omits="Natural log is used; libraries often add smoothing (e.g. log((1+N)/(1+df)) + 1) so common words are not exactly zero.">
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        {docs.map((t, i) => (
          <div key={i}>
            <button onClick={() => setD(i)} className={`text-xs mb-1 font-semibold ${d === i ? 'text-white' : 'text-gray-500'}`}>Sample {String.fromCharCode(65 + i)} {d === i && '← analysing'}</button>
            <textarea aria-label={`Document ${i + 1}`} value={t} onChange={(e) => setDocs(docs.map((x, j) => (j === i ? e.target.value : x)))} rows={4} className={`w-full rounded-xl bg-black/40 border p-2.5 text-xs text-gray-200 ${d === i ? 'border-white/30' : 'border-white/10'}`} />
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-[1fr_1.6fr] gap-4">
        <div><p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Top by raw frequency (TF)</p>{byTf.map((r) => <div key={r.w} className="grid grid-cols-[6rem_1fr_1.5rem] gap-2 items-center text-xs mb-1"><span className="font-mono">{r.w}</span><Bar value={r.tf / byTf[0].tf} color="#94a3b8" /><span className="font-mono text-right">{r.tf}</span></div>)}</div>
        <div className="overflow-x-auto">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Top by TF-IDF</p>
          <table className="text-xs w-full font-mono"><thead><tr className="text-gray-400 text-left"><th className="pr-2">term</th><th className="pr-2">tf</th><th className="pr-2">df</th><th className="pr-2">idf=ln({N}/df)</th><th>tf×idf</th></tr></thead>
            <tbody>{byTfidf.map((r) => <tr key={r.w} className="border-t border-white/5"><td className="pr-2 py-0.5 text-gray-100">{r.w}</td><td className="pr-2">{r.tf}</td><td className="pr-2">{r.df}</td><td className="pr-2">{r.idf.toFixed(3)}</td><td style={{ color: 'var(--accent)' }}>{r.tfidf.toFixed(3)}</td></tr>)}</tbody></table>
          <p className="text-[11px] text-gray-500 mt-2">Zero-IDF terms (in all docs): {rows.filter((r) => r.idf === 0).map((r) => r.w).slice(0, 8).join(', ') || 'none'}</p>
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Naive Bayes ----------------
const TRAIN = {
  spam: { pos: ['miracle cure lose weight fast', 'anti-aging miracle cream free offer', 'win a free prize claim now', 'lose weight fast guaranteed results', 'cheap pills free shipping click now', 'exclusive offer act now free'], neg: ['meeting moved to friday afternoon', 'please review the attached report', 'lunch with the team tomorrow', 'your invoice for october is attached', 'can we discuss the project timeline', 'thanks for the update on the budget'], labels: ['Spam', 'Not spam'] },
  sentiment: { pos: ['great food and friendly staff', 'loved it excellent service', 'fast delivery very happy', 'good quality would recommend', 'fantastic experience thank you', 'easy to use and helpful'], neg: ['terrible service very slow', 'the product broke awful', 'rude staff never again', 'bad quality disappointed', 'late delivery and cold food', 'not good at all poor value'], labels: ['Positive', 'Negative'] },
};
export function SpamClassifier() {
  const [mode, setMode] = useState<'spam' | 'sentiment'>('spam');
  const [text, setText] = useState('Claim your free miracle cure now');
  const model = useMemo(() => {
    const data = TRAIN[mode];
    const count = (docs: string[]) => docs.flatMap((d) => d.split(' ')).reduce<Record<string, number>>((m, w) => ((m[w] = (m[w] ?? 0) + 1), m), {});
    const cp = count(data.pos), cn = count(data.neg);
    const vocab = new Set([...Object.keys(cp), ...Object.keys(cn)]);
    const tp = Object.values(cp).reduce((a, b) => a + b, 0), tn = Object.values(cn).reduce((a, b) => a + b, 0);
    return { lr: (w: string) => Math.log(((cp[w] ?? 0) + 1) / (tp + vocab.size)) - Math.log(((cn[w] ?? 0) + 1) / (tn + vocab.size)), vocab, labels: data.labels };
  }, [mode]);
  const ws = words(text);
  const contrib = ws.map((w) => ({ w, v: model.vocab.has(w) ? model.lr(w) : 0 }));
  const logOdds = contrib.reduce((s, c) => s + c.v, 0);
  const p = 1 / (1 + Math.exp(-logOdds));
  return (
    <SimFrame title="Bag-of-words + Naive Bayes" icon="Mail"
      controls={<Seg label="Classifier" value={mode} onChange={(v) => { setMode(v); setText(v === 'spam' ? 'Claim your free miracle cure now' : 'The staff were not good'); }} options={[{ value: 'spam', label: 'Spam filter' }, { value: 'sentiment', label: 'Sentiment' }]} />}
      shows="Each word's count-based evidence pushes the probability toward one class. Word order is ignored — try 'not good' in sentiment mode: 'good' still counts as positive evidence."
      omits="Trained on only 12 tiny examples with equal priors; real filters learn from millions of messages.">
      <input aria-label="Message to classify" value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-gray-100" />
      <div className="flex flex-wrap gap-1.5 my-3">
        {contrib.map((c, i) => <span key={i} className="px-2 py-1 rounded-lg text-xs font-mono border" style={{ background: c.v > 0 ? `rgba(244,114,182,${Math.min(0.5, c.v / 3)})` : c.v < 0 ? `rgba(34,211,238,${Math.min(0.5, -c.v / 3)})` : 'transparent', borderColor: 'rgba(255,255,255,0.1)' }}>{c.w} <span className="opacity-60">{c.v ? (c.v > 0 ? '+' : '') + c.v.toFixed(1) : 'unseen'}</span></span>)}
      </div>
      <div className="grid sm:grid-cols-2 gap-3 items-center">
        <div><div className="flex justify-between text-sm"><span style={{ color: '#f472b6' }}>{model.labels[0]}</span><span className="font-mono">{(p * 100).toFixed(0)}%</span></div><Bar value={p} color="#f472b6" /></div>
        <p className="text-lg font-bold text-white">→ {p >= 0.5 ? model.labels[0] : model.labels[1]}</p>
      </div>
      <details className="mt-3 text-xs text-gray-400"><summary className="cursor-pointer">Training data</summary><div className="grid sm:grid-cols-2 gap-2 mt-2"><ul>{TRAIN[mode].pos.map((d) => <li key={d}>• {d}</li>)}</ul><ul>{TRAIN[mode].neg.map((d) => <li key={d}>• {d}</li>)}</ul></div></details>
    </SimFrame>
  );
}

// ---------------- TextRank ----------------
const TR_S = ['Cloud computing provides on-demand access to computing resources.', 'Computing resources include servers, storage, and networking.', 'Azure is Microsoft\'s cloud computing platform.', 'Organizations use cloud platforms to reduce infrastructure costs.', 'Cloud computing enables scalability and flexibility.'];
const TR_W: Record<string, number> = { '0-1': 0.5, '0-2': 0.6, '0-3': 0.2, '0-4': 0.7, '1-2': 0.2, '1-3': 0.1, '1-4': 0.1, '2-3': 0.5, '2-4': 0.4, '3-4': 0.3 };
const w = (i: number, j: number) => TR_W[`${Math.min(i, j)}-${Math.max(i, j)}`] ?? 0;
export function TextRank() {
  const [scores, setScores] = useState([1, 1, 1, 1, 1]);
  const [it, setIt] = useState(0);
  const iterate = (n = 1) => {
    let s = scores;
    for (let k = 0; k < n; k++) s = s.map((_, i) => 0.15 + 0.85 * s.reduce((acc, sj, j) => { if (j === i) return acc; const out = [0, 1, 2, 3, 4].filter((x) => x !== j).reduce((a, x) => a + w(j, x), 0); return acc + (w(j, i) / out) * sj; }, 0));
    setScores(s); setIt((x) => x + n);
  };
  const top = [...scores.map((v, i) => [v, i] as const)].sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, i]) => i);
  const P = [[160, 30], [285, 105], [240, 210], [80, 210], [35, 105]];
  return (
    <SimFrame title="TextRank" icon="Share2" onReset={() => { setScores([1, 1, 1, 1, 1]); setIt(0); }}
      shows="Sentences are nodes; edge thickness is word-overlap similarity (weights from the course notes). Each iteration, a sentence's score is redistributed from its neighbours (damping d = 0.85). Well-connected sentences rise — and become the summary."
      omits="Edge weights are given rather than computed; real implementations calculate them with word overlap or cosine similarity.">
      <div className="grid md:grid-cols-[1fr_1.1fr] gap-4 items-center">
        <svg viewBox="0 0 320 250" className="w-full">
          {P.map((a, i) => P.map((b, j) => j > i && <line key={`${i}${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#a78bfa" strokeOpacity={0.15 + w(i, j)} strokeWidth={w(i, j) * 7} />))}
          {P.map(([x, y], i) => (
            <g key={i}><motion.circle cx={x} cy={y} animate={{ r: 12 + scores[i] * 10 }} fill={it && top.includes(i) ? 'var(--accent)' : '#1e293b'} stroke="#a78bfa" strokeWidth={2} /><text x={x} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={it && top.includes(i) ? '#050a17' : '#fff'}>S{i + 1}</text></g>
          ))}
        </svg>
        <div className="space-y-2">
          <div className="flex gap-2"><button className="ai-btn" onClick={() => iterate(1)}>Iterate</button><button className="ai-btn-ghost" onClick={() => iterate(30)}>Run to convergence</button><span className="text-xs text-gray-400 self-center">iteration {it}</span></div>
          {TR_S.map((s, i) => <div key={i} className={`text-xs rounded-lg px-2.5 py-1.5 ${it && top.includes(i) ? 'bg-white/10 text-white' : 'text-gray-400'}`}><span className="font-mono mr-1">S{i + 1} {scores[i].toFixed(3)}</span>{s}</div>)}
          {it > 0 && <p className="text-sm text-gray-200 pt-1"><b>Extractive summary:</b> {top.sort((a, b) => a - b).map((i) => TR_S[i]).join(' ')}</p>}
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- General model vs Azure Language ----------------
const REVIEW = 'I had a wonderful dinner at a cozy bistro in Portland on Friday evening. The grilled salmon was cooked perfectly, but the wait for a table was far too slow.';
const llmVariants = [
  (p: number) => [`Sentiment: Mostly positive. The diner loved the food and atmosphere, with a minor complaint about waiting.`, `Overall the review is **positive (mixed)** — high praise for the salmon and bistro, one negative point about the wait.`, `• Sentence 1: Positive\n• Sentence 2: Mixed (positive food, negative wait)\nOverall: positive`][p],
  (p: number) => [`The tone is largely upbeat — I'd call it positive with a caveat about slow seating.`, `Positive overall (≈ 4/5). Strength: food. Weakness: wait time.`, `• "wonderful dinner…" → Positive\n• "grilled salmon… slow" → Mixed\nOverall: mostly positive`][p],
];
export function LlmVsLanguage() {
  const [prompt, setPrompt] = useState(0);
  const [run, setRun] = useState(0);
  const prompts = ['"What\'s the sentiment of this review?"', '"Rate the sentiment and list strengths and weaknesses."', '"Give sentence-by-sentence sentiment as bullets."'];
  return (
    <SimFrame title="General model vs Azure Language" icon="Scale" controls={<button className="ai-btn-ghost text-xs" onClick={() => setRun((r) => r + 1)}><RefreshCw className="w-3.5 h-3.5" /> Run again</button>}
      shows="A general-purpose model's output changes with prompt wording (and between runs). Azure Language returns the same structured JSON every time — ideal for automated pipelines."
      omits="Outputs are representative simulations; the JSON shape is simplified from the real API.">
      <p className="text-sm text-gray-300 italic mb-3">"{REVIEW}"</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest text-violet-300 mb-2">General-purpose model (prompted)</p>
          <select aria-label="Prompt wording" value={prompt} onChange={(e) => setPrompt(Number(e.target.value))} className="w-full mb-2 rounded-lg bg-black/40 border border-white/15 px-2 py-1.5 text-xs">{prompts.map((p, i) => <option key={i} value={i}>{p}</option>)}</select>
          <motion.pre key={`${prompt}${run}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-pre-wrap font-sans text-sm text-gray-100" dangerouslySetInnerHTML={{ __html: llmVariants[run % 2](prompt).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }} />
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-widest text-cyan-300 mb-2">Azure Language — sentiment analyzer</p>
          <pre className="text-[11px] font-mono text-gray-200 overflow-x-auto">{`{
  "sentiment": "mixed",
  "confidenceScores": { "positive": 0.62, "neutral": 0.04, "negative": 0.34 },
  "sentences": [
    { "text": "I had a wonderful dinner…", "sentiment": "positive" },
    { "text": "The grilled salmon…slow.", "sentiment": "mixed",
      "opinions": [
        { "target": "salmon", "assessment": "perfectly", "sentiment": "positive" },
        { "target": "wait", "assessment": "slow", "sentiment": "negative" } ] }
  ]
}`}</pre>
          <p className="text-[11px] text-gray-500 mt-1">Run #{run + 1} — identical output.</p>
        </div>
      </div>
    </SimFrame>
  );
}
