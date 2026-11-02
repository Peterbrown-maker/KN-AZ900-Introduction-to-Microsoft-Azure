import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Volume2, Mic } from 'lucide-react';
import { SimFrame, Bar } from '../ui';

function Waveform({ seed = 3, active = true, color = '#2dd4bf', height = 70 }: { seed?: number; active?: boolean; color?: string; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    let raf = 0, t = 0;
    const draw = () => {
      const w = (c.width = c.clientWidth * 2), h = (c.height = height * 2);
      ctx.clearRect(0, 0, w, h); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
      for (let x = 0; x < w; x += 2) {
        const env = Math.max(0, Math.sin((x / w) * Math.PI * 3 + seed) * 0.6 + 0.4) * (active ? 1 : 0.15);
        const y = h / 2 + Math.sin(x * 0.09 + t + seed) * Math.sin(x * 0.013 + seed) * env * h * 0.42;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      if (!reduce && active) { t += 0.15; raf = requestAnimationFrame(draw); }
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [seed, active, color, height, reduce]);
  return <canvas ref={ref} className="w-full block" style={{ height }} aria-hidden="true" />;
}

// ---------------- Speech recognition pipeline ----------------
const STT = [
  { t: 'Audio capture', d: 'Microphone → digital samples. 16,000 numbers per second (16 kHz). Filters remove hum and clicks.' },
  { t: 'Pre-processing (MFCC)', d: 'Split into 25 ms overlapping frames → Fourier transform → Mel scale → 13 coefficients per frame.' },
  { t: 'Acoustic model', d: 'A transformer predicts phoneme probabilities for each frame, using attention over neighbouring frames.' },
  { t: 'Language model', d: 'Vocabulary and grammar resolve sound-alikes: "send the report by Friday" beats "sent the report buy Friday".' },
  { t: 'Decoding (beam search)', d: 'Keep the top hypotheses at each step, prune weak paths, pick the best overall sequence.' },
  { t: 'Post-processing', d: 'Capitalise, punctuate, format numbers and times, filter profanity, attach confidence scores.' },
];
export function SpeechSTT() {
  const [st, setSt] = useState(0);
  const mfcc = useMemo(() => Array.from({ length: 13 }, (_, r) => Array.from({ length: 28 }, (_, c) => Math.abs(Math.sin(r * 0.7 + c * 0.45) * Math.cos(c * 0.21 + r)))), []);
  const beams = [
    [['please', -0.2], ['peas', -1.9], ['police', -2.4]],
    [['please send', -0.5], ['please sent', -1.6], ['peas send', -2.6]],
    [['please send the report', -0.9], ['please sent the report', -2.1], ['please send the reports', -2.3]],
    [['please send the report by friday', -1.2], ['please send the report buy friday', -3.4], ['please sent the report by friday', -3.6]],
  ];
  return (
    <SimFrame title="Speech recognition: six stages" icon="Mic"
      controls={<div className="flex gap-1"><button className="ai-btn-ghost text-xs" disabled={!st} onClick={() => setSt(st - 1)}>Back</button><button className="ai-btn text-xs" disabled={st === 5} onClick={() => setSt(st + 1)}>Next stage</button></div>}
      shows="How spoken audio becomes formatted text, stage by stage. When transcription fails you can usually trace it to one stage."
      omits="Feature values, probabilities and scores are illustrative; real systems process thousands of frames and hypotheses.">
      <ol className="flex flex-wrap gap-1 mb-4">{STT.map((s, i) => <li key={i}><button onClick={() => setSt(i)} className={`text-[11px] px-2 py-1 rounded-full border ${i === st ? 'text-[#050a17] border-transparent' : 'border-white/10 text-gray-400'}`} style={i === st ? { background: 'var(--accent)' } : undefined}>{i + 1}. {s.t}</button></li>)}</ol>
      <div className="rounded-xl bg-black/30 p-4 min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div key={st} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {st === 0 && <><Waveform /><p className="text-xs font-mono text-gray-400 mt-2">samples: [0.012, 0.018, -0.004, -0.031, 0.022, 0.047, …] × 16,000 per second</p></>}
            {st === 1 && (
              <div>
                <div className="grid gap-px" style={{ gridTemplateColumns: 'repeat(28, 1fr)' }}>{mfcc.flatMap((row, r) => row.map((v, c) => <div key={`${r}-${c}`} className="h-2.5" style={{ background: `rgba(45,212,191,${v})` }} />))}</div>
                <p className="text-xs text-gray-400 mt-2">Each column is one 25 ms frame; each row one of 13 MFCC coefficients.</p>
                <p className="text-xs font-mono text-gray-500">Frame 1: [-113.2, 45.3, 12.1, -3.4, 7.8, …]</p>
              </div>
            )}
            {st === 2 && (
              <div className="grid sm:grid-cols-3 gap-3">
                {[['frame 41', [['/k/', 0.9], ['/g/', 0.08]]], ['frame 42', [['/æ/', 0.8], ['/ɛ/', 0.15], ['/ʌ/', 0.05]]], ['frame 43', [['/t/', 0.7], ['/d/', 0.25]]]].map(([f, ps]) => (
                  <div key={f as string} className="rounded-lg bg-white/5 p-2.5"><p className="text-xs text-gray-400 mb-1">{f as string}</p>{(ps as [string, number][]).map(([p, v]) => <div key={p} className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-1 text-xs"><span className="font-mono">{p}</span><Bar value={v} /><span className="text-right font-mono">{Math.round(v * 100)}%</span></div>)}</div>
                ))}
                <p className="sm:col-span-3 text-xs text-gray-400">/k/ /æ/ /t/ → "cat". English uses about 44 phonemes.</p>
              </div>
            )}
            {st === 3 && (
              <div className="space-y-2 text-sm">
                {[['The weather is nice', 0.94], ['The whether is nice', 0.04], ['The wether is nice', 0.02]].map(([s, p]) => <div key={s as string} className="grid grid-cols-[1fr_6rem_3rem] gap-2 items-center"><span className="text-gray-100">{s}</span><Bar value={p as number} /><span className="font-mono text-xs text-right">{Math.round((p as number) * 100)}%</span></div>)}
                <p className="text-xs text-gray-400">Identical phonemes, different words. The language model knows which sequence is likely.</p>
              </div>
            )}
            {st === 4 && (
              <div className="space-y-2">
                {beams.map((b, i) => <div key={i} className="flex flex-wrap gap-1.5 items-center"><span className="text-[10px] text-gray-500 w-12">step {i + 1}</span>{b.map(([h, s], j) => <span key={h as string} className={`text-xs px-2 py-1 rounded font-mono ${j === 0 ? 'bg-teal-500/25 text-teal-100' : 'bg-white/5 text-gray-500 line-through decoration-white/20'}`}>{h} <span className="opacity-60">{s}</span></span>)}</div>)}
                <p className="text-xs text-gray-400">Beam width 3: the best hypothesis (highest log-probability) survives each step.</p>
              </div>
            )}
            {st === 5 && (
              <div className="space-y-2 text-sm">
                <p className="font-mono text-gray-500">please send the report by friday at three p m one thousand twenty three units</p>
                <p className="text-lg text-white">Please send the report by Friday at <span className="text-teal-300">3 PM</span>. <span className="text-teal-300">1,023</span> units.</p>
                <div className="flex flex-wrap gap-1 text-xs">{[['Please', 0.98], ['send', 0.97], ['the', 0.99], ['report', 0.95], ['by', 0.81], ['Friday', 0.93], ['3 PM', 0.88], ['1,023', 0.62]].map(([w, c]) => <span key={w as string} className={`px-1.5 py-0.5 rounded ${(c as number) < 0.7 ? 'bg-amber-500/25 text-amber-100' : 'bg-white/5 text-gray-300'}`}>{w} {(c as number).toFixed(2)}</span>)}</div>
                <p className="text-xs text-gray-400">Low-confidence words (amber) can be flagged for human review — important in medical transcription.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-3 text-sm text-gray-300"><b className="text-white">{STT[st].t}: </b>{STT[st].d}</p>
    </SimFrame>
  );
}

// ---------------- Text normalisation helpers ----------------
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export function numWords(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${numWords(n % 100)}` : ''}`;
  if (n < 1e6) return `${numWords(Math.floor(n / 1000))} thousand${n % 1000 ? ` ${numWords(n % 1000)}` : ''}`;
  return String(n);
}
const ORD: Record<string, string> = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth' };
const ordinal = (n: number) => { const w = numWords(n); const last = w.split(/[- ]/).pop()!; return w.slice(0, w.length - last.length) + (ORD[last] ?? (last.endsWith('y') ? last.slice(0, -1) + 'ieth' : last + 'th')); };
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const year = (y: number) => (y >= 2000 && y < 2010 ? numWords(y) : y >= 2010 && y < 2100 ? numWords(y) : `${numWords(Math.floor(y / 100))} ${numWords(y % 100)}`);
export function normalise(t: string) {
  return t
    .replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, (_, m, d, y) => `${MON[+m - 1] ?? m} ${ordinal(+d)}, ${year(+y)}`)
    .replace(/\$(\d+)\.(\d{2})/g, (_, d, c) => `${numWords(+d)} dollars and ${numWords(+c)} cents`)
    .replace(/\$(\d+)/g, (_, d) => `${numWords(+d)} dollars`)
    .replace(/\b(\d{1,2}):00\s?([AP])\.?M\.?/gi, (_, h, ap) => `${numWords(+h)} o'clock ${ap.toUpperCase()} M`)
    .replace(/\b(\d{1,2}):(\d{2})\s?([AP])\.?M\.?/gi, (_, h, m, ap) => `${numWords(+h)} ${numWords(+m)} ${ap.toUpperCase()} M`)
    .replace(/\bDr\./g, 'Doctor').replace(/\bMr\./g, 'Mister').replace(/\bInc\./g, 'Incorporated').replace(/\bSt\./g, 'Street')
    .replace(/(\d+)%/g, (_, n) => `${numWords(+n)} percent`).replace(/@/g, ' at ').replace(/&/g, ' and ')
    .replace(/\b\d+\b/g, (n) => numWords(+n));
}
const LEX: Record<string, string> = { doctor: 'ˈdɑktər', chen: 'tʃɛn', "chen's": 'tʃɛnz', appointment: 'əˈpɔɪntmənt', is: 'ɪz', at: 'æt', three: 'θri', "o'clock": 'əˈklɑk', p: 'pi', m: 'ɛm', smith: 'smɪθ', ordered: 'ˈɔrdərd', items: 'ˈaɪtəmz', for: 'fɔr', dollars: 'ˈdɑlərz', and: 'ænd', cents: 'sɛnts', on: 'ɑn', the: 'ðə', hello: 'həˈloʊ', world: 'wɜrld', though: 'θoʊ', through: 'θruː', cough: 'kɔːf', i: 'aɪ', read: 'riːd', book: 'bʊk', books: 'bʊks', yesterday: 'ˈjɛstərdeɪ', that: 'ðæt', your: 'jɔr', train: 'treɪn', leaves: 'livz', twenty: 'ˈtwɛnti', five: 'faɪv', fifty: 'ˈfɪfti', december: 'dɪˈsɛmbər', fifteenth: 'fɪfˈtinθ', two: 'tu', thousand: 'ˈθaʊzənd', 'twenty-three': 'ˈtwɛntiˈθri', 'twenty-five': 'ˈtwɛntiˈfaɪv', a: 'ə', meeting: 'ˈmitɪŋ', today: 'təˈdeɪ', you: 'ju', are: 'ɑr', welcome: 'ˈwɛlkəm' };
const g2p = (w: string) => LEX[w.toLowerCase().replace(/[,.?!]/g, '')] ?? w.toLowerCase().replace(/[,.?!]/g, '').replace(/th/g, 'θ').replace(/sh/g, 'ʃ').replace(/ch/g, 'tʃ').replace(/ee|ea/g, 'i').replace(/oo/g, 'u').replace(/c/g, 'k').replace(/y$/g, 'i');

// ---------------- Speech synthesis pipeline ----------------
export function SpeechTTS() {
  const [text, setText] = useState("Dr. Chen's appointment is at 3:00 PM.");
  const [st, setSt] = useState(3);
  const [speaking, setSpeaking] = useState(false);
  const norm = normalise(text);
  const ws = norm.split(/\s+/).filter(Boolean);
  const question = text.trim().endsWith('?');
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const speak = () => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(norm);
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };
  useEffect(() => () => { if (canSpeak) window.speechSynthesis.cancel(); }, [canSpeak]);
  const pitch = ws.map((w, i) => { const base = 50 + Math.sin(i * 0.9) * 8; const stress = /appointment|three|report|never/i.test(w) ? 18 : 0; const end = i === ws.length - 1 ? (question ? 22 : -16) : 0; return base + stress + end; });
  return (
    <SimFrame title="Speech synthesis: four stages" icon="Volume2"
      controls={<button className="ai-btn text-xs" onClick={speak} disabled={!canSpeak}><Volume2 className="w-3.5 h-3.5" /> {speaking ? 'Speaking…' : canSpeak ? 'Play (browser voice)' : 'Audio unavailable'}</button>}
      shows="Text is normalised into speakable words, converted to phonemes (G2P), given prosody (pitch, duration, pauses), then turned into a waveform by a vocoder. End a sentence with '?' to see pitch rise."
      omits="The Play button uses your browser's built-in voice, not Azure neural voices. Phonemes come from a small lexicon with crude fallbacks for unknown words.">
      <input aria-label="Text to synthesise" value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-gray-100 mb-3" />
      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        {["Dr. Smith ordered 3 items for $25.50 on 12/15/2023.", "Dr. Chen's appointment is at 3:00 PM.", 'Though through cough.', 'Is your train at 5:30 PM?'].map((s) => <button key={s} className="ai-btn-ghost" onClick={() => setText(s)}>{s}</button>)}
      </div>
      <div className="grid sm:grid-cols-4 gap-2">
        {['1 · Normalise', '2 · Linguistic analysis', '3 · Prosody', '4 · Synthesis'].map((s, i) => (
          <button key={s} onClick={() => setSt(i)} className={`rounded-lg py-2 text-xs border ${st === i ? 'border-transparent text-[#050a17]' : 'border-white/10 text-gray-300'}`} style={st === i ? { background: 'var(--accent)' } : undefined}>{s}</button>
        ))}
      </div>
      <div className="rounded-xl bg-black/30 p-4 mt-3 min-h-[130px]">
        {st === 0 && <><p className="text-xs text-gray-500 font-mono">{text}</p><p className="text-gray-100 mt-2">→ {norm}</p></>}
        {st === 1 && <div className="flex flex-wrap gap-2">{ws.map((w, i) => <div key={i} className="text-center"><p className="text-xs text-gray-400">{w}</p><p className="font-mono text-teal-200">/{g2p(w)}/</p></div>)}</div>}
        {st === 2 && (
          <svg viewBox={`0 0 ${Math.max(300, ws.length * 60)} 110`} className="w-full">
            <polyline points={pitch.map((p, i) => `${30 + i * 60},${100 - p}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
            {ws.map((w, i) => <g key={i}><circle cx={30 + i * 60} cy={100 - pitch[i]} r={4} fill="var(--accent)" /><text x={30 + i * 60} y={106} textAnchor="middle" fontSize={10} fill="#cbd5e1">{w}</text></g>)}
            <text x={4} y={12} fontSize={9} fill="#64748b">pitch</text>
          </svg>
        )}
        {st === 3 && <><Waveform seed={text.length} active={speaking || true} /><p className="text-xs text-gray-400 mt-2">Mel-spectrogram → neural vocoder (e.g. HiFi-GAN) → 24,000 samples per second.</p></>}
      </div>
    </SimFrame>
  );
}

// ---------------- Prosody / emphasis ----------------
const EMPH = [
  ['I', 'Someone else said it — not me.'],
  ['never', 'I deny ever saying it, at any time.'],
  ['said', 'I may have implied it, but I didn\'t say it.'],
  ['he', 'I said someone ate it — just not him.'],
  ['ate', 'He did something with the cake, but didn\'t eat it.'],
  ['the', 'He ate a cake, just not that particular one.'],
  ['cake', 'He ate something — but not the cake.'],
];
export function Prosody() {
  const [e, setE] = useState(1);
  return (
    <SimFrame title="Prosody changes meaning" icon="AudioWaveform"
      shows="Stress on a single word changes what a sentence means. Prosody models must predict emphasis from context to sound natural and convey the right meaning."
      omits="Real prosody combines pitch, duration, loudness and pauses continuously across a sentence.">
      <div className="flex flex-wrap gap-2 justify-center text-xl sm:text-2xl mb-4" role="radiogroup" aria-label="Emphasised word">
        {EMPH.map(([w], i) => (
          <motion.button key={w} role="radio" aria-checked={i === e} onClick={() => setE(i)} animate={{ y: i === e ? -6 : 0, scale: i === e ? 1.18 : 1 }}
            className={`px-1.5 rounded ${i === e ? 'font-extrabold' : 'text-gray-400 font-medium'}`} style={i === e ? { color: 'var(--accent)' } : undefined}>{w}</motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait"><motion.p key={e} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-gray-200">Implied meaning: <i>{EMPH[e][1]}</i></motion.p></AnimatePresence>
      <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1"><Mic className="w-3 h-3" /> Try saying each version aloud.</p>
    </SimFrame>
  );
}
