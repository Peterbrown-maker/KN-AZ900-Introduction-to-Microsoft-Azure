import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock, Flag, Search, Printer, RotateCcw, Trophy, BookOpen, AlertTriangle, Award, ExternalLink } from 'lucide-react';
import type { Question } from '../types';
import { chapters, chapterById, chapterQuizQuestions, glossary, lessonById, lessonRefs, questionBank, searchDocs, totals, course } from '../data';
import { useProgress, isLessonDone, quizPassed, bestAttempt, topicStats, readinessScore, mistakes, overallPct, courseCompleteEligible, actions, finalPassed, CHAPTER_PASS, FINAL_PASS, isChapterComplete } from '../progress';
import { navigate } from '../router';
import { QuizRunner } from '../components/QuizRunner';
import { QuestionView } from '../components/Question';
import { BlockView } from '../components/Blocks';
import { PageTitle, SourceBadges, Ring } from '../components/common';
import { iconByName, Bar, Rich, shuffle, Seg } from '../ui';

// ---------------- Chapter overview ----------------
export function ChapterPage({ id }: { id: string }) {
  const p = useProgress();
  const c = chapterById.get(id);
  if (!c) return <p className="text-gray-400">Chapter not found.</p>;
  const Icon = iconByName(c.icon);
  const best = bestAttempt(p, `chapter:${c.id}`);
  const idx = chapters.indexOf(c);
  return (
    <div className="max-w-4xl mx-auto" style={{ ['--accent' as string]: c.accent }}>
      <header className="relative py-8">
        <div className="absolute -top-20 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none" style={{ background: c.accent }} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-16 h-16 rounded-2xl grid place-items-center mb-5" style={{ background: `${c.accent}22`, border: `1px solid ${c.accent}55` }}><Icon className="w-8 h-8" style={{ color: c.accent }} /></motion.div>
        <p className="relative text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: c.accent }}>Chapter {c.number}</p>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative text-4xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">{c.title}</motion.h1>
        <p className="relative text-xl text-gray-300 mt-3 italic">{c.tagline}</p>
        <p className="relative text-gray-400 mt-4 max-w-2xl leading-relaxed">{c.description}</p>
      </header>
      <div className="space-y-3">
        {c.lessons.map((l, i) => {
          const d = isLessonDone(p, l.id), s = !!p.lessons[l.id];
          return (
            <motion.button key={l.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} onClick={() => navigate({ view: 'lesson', id: l.id })} className="w-full text-left ai-panel p-5 flex gap-4 items-center hover:border-white/25">
              <span className={`w-10 h-10 shrink-0 rounded-full grid place-items-center font-bold ${d ? 'bg-emerald-500/25 text-emerald-200' : 'bg-white/5 text-gray-300'}`}>{d ? <Check className="w-5 h-5" /> : i + 1}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-white">{l.title}</span>
                <span className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400"><Clock className="w-3 h-3" /> {l.minutes} min · {l.blocks.filter((b) => b.kind === 'sim').length} interactive · {d ? 'completed' : s ? 'in progress' : 'not started'} <SourceBadges sources={l.sources} /></span>
              </span>
              <ArrowRight className="w-5 h-5 text-gray-500 shrink-0" />
            </motion.button>
          );
        })}
        <button onClick={() => navigate({ view: 'quiz', id: c.id })} className="w-full text-left ai-panel p-5 flex gap-4 items-center hover:border-white/25" style={{ borderColor: `${c.accent}55` }}>
          <span className="w-10 h-10 shrink-0 rounded-full grid place-items-center" style={{ background: `${c.accent}33` }}><Flag className="w-5 h-5" style={{ color: c.accent }} /></span>
          <span className="flex-1"><span className="block font-semibold text-white">Chapter {c.number} quiz</span><span className="text-xs text-gray-400">{chapterQuizQuestions(c.id).length} questions · pass mark {Math.round(CHAPTER_PASS * 100)}% · {best ? `best ${Math.round((best.score / best.total) * 100)}%${quizPassed(p, c.id) ? ' ✓ passed' : ''}` : 'not attempted'}</span></span>
          <ArrowRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <section className="ai-panel p-6 mt-8">
        <p className="font-bold text-white mb-3">Chapter summary</p>
        <ul className="space-y-2">{c.summary.map((s) => <li key={s} className="flex gap-2 text-sm text-gray-300"><span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.accent }} /><Rich text={s} /></li>)}</ul>
      </section>
      <div className="flex justify-between mt-6 text-sm">
        {idx > 0 ? <button className="ai-btn-ghost" onClick={() => navigate({ view: 'chapter', id: chapters[idx - 1].id })}>← {chapters[idx - 1].short}</button> : <span />}
        {idx < chapters.length - 1 && <button className="ai-btn-ghost" onClick={() => navigate({ view: 'chapter', id: chapters[idx + 1].id })}>{chapters[idx + 1].short} →</button>}
      </div>
    </div>
  );
}

// ---------------- Chapter quiz ----------------
export function QuizPage({ id }: { id: string }) {
  const c = chapterById.get(id);
  const qs = useMemo(() => chapterQuizQuestions(id), [id]);
  if (!c) return <p className="text-gray-400">Chapter not found.</p>;
  const idx = chapters.indexOf(c);
  return (
    <div className="max-w-3xl mx-auto" style={{ ['--accent' as string]: c.accent }}>
      <QuizRunner title={`Chapter ${c.number} quiz · ${c.short}`} subtitle="Feedback after each question. Explanations show why each option is right or wrong." questions={qs} mode="learn" attemptKey={`chapter:${c.id}`} passMark={CHAPTER_PASS}
        onExit={() => navigate(idx < chapters.length - 1 ? { view: 'chapter', id: chapters[idx + 1].id } : { view: 'home' })} exitLabel={idx < chapters.length - 1 ? 'Next chapter' : 'Course home'} />
    </div>
  );
}

// ---------------- Practice tests ----------------
export function PracticePage() {
  const p = useProgress();
  const [cfg, setCfg] = useState<{ n: number; focus: 'all' | 'weak' | 'new'; mode: 'learn' | 'exam' } | null>(null);
  const [n, setN] = useState('20');
  const [focus, setFocus] = useState<'all' | 'weak' | 'new'>('all');
  const [mode, setMode] = useState<'learn' | 'exam'>('learn');
  const qs = useMemo(() => {
    if (!cfg) return [];
    const weak = new Set(topicStats(p).filter((s) => s.status === 'weak' || s.status === 'developing').map((s) => s.chapterId));
    let pool = questionBank;
    if (cfg.focus === 'weak') pool = questionBank.filter((q) => weak.has(q.chapterId!) || (p.answers[q.id] && !p.answers[q.id].correct));
    if (cfg.focus === 'new') pool = questionBank.filter((q) => !p.answers[q.id]);
    if (pool.length < 5) pool = questionBank;
    return shuffle(pool, Date.now() % 100000).slice(0, cfg.n);
  }, [cfg]); // eslint-disable-line react-hooks/exhaustive-deps
  if (cfg) return <div className="max-w-3xl mx-auto"><QuizRunner title="Mixed practice test" questions={qs} mode={cfg.mode} attemptKey="practice" passMark={0.8} onExit={() => setCfg(null)} exitLabel="Practice menu" shuffleQuestions={false} /></div>;
  return (
    <div className="max-w-3xl mx-auto">
      <PageTitle eyebrow="Practice" title="Mixed-topic practice tests">Questions are drawn at random from the full bank of {questionBank.length} original questions across all {totals.chapters} chapters — single choice, choose-all-that-apply, ordering and matching.</PageTitle>
      <div className="ai-panel p-6 space-y-5">
        <div><p className="text-sm text-gray-300 mb-2">Length</p><Seg label="Number of questions" value={n} onChange={setN} options={['10', '20', '30'].map((v) => ({ value: v, label: `${v} questions` }))} /></div>
        <div><p className="text-sm text-gray-300 mb-2">Focus</p><Seg label="Question focus" value={focus} onChange={setFocus} options={[{ value: 'all', label: 'Everything' }, { value: 'weak', label: 'Weak topics & mistakes' }, { value: 'new', label: 'Not yet answered' }]} /></div>
        <div><p className="text-sm text-gray-300 mb-2">Feedback</p><Seg label="Mode" value={mode} onChange={setMode} options={[{ value: 'learn', label: 'After each question' }, { value: 'exam', label: 'At the end (exam style)' }]} /></div>
        <button className="ai-btn" onClick={() => setCfg({ n: Number(n), focus, mode })}>Start practice <ArrowRight className="w-4 h-4" /></button>
      </div>
      <AttemptHistory k="practice" />
    </div>
  );
}

function AttemptHistory({ k }: { k: string }) {
  const p = useProgress();
  const list = (p.attempts[k] ?? []).slice(-8).reverse();
  if (!list.length) return null;
  return (
    <div className="ai-panel p-5 mt-6">
      <p className="text-sm font-semibold text-white mb-3">Recent attempts</p>
      <ul className="space-y-1.5">{list.map((a) => <li key={a.at} className="grid grid-cols-[1fr_6rem_3rem] gap-3 items-center text-xs"><span className="text-gray-400">{new Date(a.at).toLocaleString()}</span><Bar value={a.score / a.total} /><span className="font-mono text-right text-gray-200">{Math.round((a.score / a.total) * 100)}%</span></li>)}</ul>
    </div>
  );
}

// ---------------- Final assessment ----------------
export function buildFinal(seed: number): Question[] {
  const perChapter = chapters.filter((c) => c.id !== 'revision').map((c) => shuffle(questionBank.filter((q) => q.chapterId === c.id), seed + c.number).slice(0, 4));
  const extra = shuffle(questionBank.filter((q) => q.chapterId === 'revision'), seed).slice(0, 2);
  return shuffle([...perChapter.flat(), ...extra], seed).slice(0, 50);
}
export function FinalPage() {
  const [started, setStarted] = useState(false);
  const [seed, setSeed] = useState(() => Date.now() % 1e6);
  const qs = useMemo(() => buildFinal(seed), [seed]);
  if (started) return <div className="max-w-3xl mx-auto" style={{ ['--accent' as string]: '#facc15' }}><QuizRunner title="Final comprehensive assessment" questions={qs} mode="exam" attemptKey="final" passMark={FINAL_PASS} onExit={() => { setStarted(false); setSeed(Date.now() % 1e6); }} exitLabel="Assessment overview" shuffleQuestions={false} /></div>;
  return (
    <div className="max-w-3xl mx-auto" style={{ ['--accent' as string]: '#facc15' }}>
      <PageTitle eyebrow="Final assessment" title="Final comprehensive mock assessment">
        {qs.length} questions covering every chapter (about four per chapter), in mixed formats. You can move freely between questions; feedback and explanations appear only after you submit. Pass mark: {Math.round(FINAL_PASS * 100)}%. A new random selection is drawn for each attempt.
      </PageTitle>
      <div className="ai-panel p-6">
        <ul className="text-sm text-gray-300 space-y-2 mb-5">
          <li>• Covers AI concepts (≈40–45% of the real exam) and Microsoft Foundry implementation (≈55–60%).</li>
          <li>• Questions are original practice items written for this course — not the official question bank.</li>
          <li>• Your results update your readiness summary and review mode.</li>
        </ul>
        <button className="ai-btn" onClick={() => setStarted(true)}>Begin assessment <ArrowRight className="w-4 h-4" /></button>
      </div>
      <AttemptHistory k="final" />
    </div>
  );
}

// ---------------- Review mode ----------------
export function ReviewPage() {
  const p = useProgress();
  const ms = mistakes(p);
  const [practise, setPractise] = useState<Question[] | null>(null);
  if (practise) return <div className="max-w-3xl mx-auto"><QuizRunner title="Practise my mistakes" questions={practise} mode="learn" attemptKey="review" passMark={0.8} onExit={() => setPractise(null)} exitLabel="Review list" /></div>;
  const groups = chapters.map((c) => ({ c, qs: ms.filter((q) => q.chapterId === c.id) })).filter((g) => g.qs.length);
  return (
    <div className="max-w-3xl mx-auto">
      <PageTitle eyebrow="Review mode" title="Your mistakes, explained">Every question whose most recent answer was incorrect, with the correct answer, the explanation, and the lesson to revisit. Answer them correctly in any quiz and they leave this list.</PageTitle>
      {ms.length === 0 ? (
        <div className="ai-panel p-8 text-center"><Trophy className="w-10 h-10 mx-auto text-yellow-300" /><p className="text-white font-semibold mt-3">No outstanding mistakes.</p><p className="text-sm text-gray-400 mt-1">Take a practice test to find any weak spots.</p><button className="ai-btn mt-4" onClick={() => navigate({ view: 'practice' })}>Practice test</button></div>
      ) : (
        <>
          <button className="ai-btn mb-6" onClick={() => setPractise(shuffle(ms, Date.now() % 9999))}><RotateCcw className="w-4 h-4" /> Practise all {ms.length} mistakes</button>
          <div className="space-y-8">
            {groups.map(({ c, qs }) => (
              <section key={c.id} style={{ ['--accent' as string]: c.accent }}>
                <h2 className="text-lg font-bold text-white mb-3">Chapter {c.number} · {c.title} <span className="text-sm text-gray-500 font-normal">({qs.length})</span></h2>
                <div className="space-y-3">
                  {qs.map((q) => (
                    <div key={q.id} className="ai-panel p-5 border-l-4 border-l-red-400">
                      <QuestionView q={q} answer={undefined} onChange={() => {}} revealed seed={1} />
                      {q.lessonId && <button className="ai-btn-ghost text-xs mt-3" onClick={() => navigate({ view: 'lesson', id: q.lessonId! })}><BookOpen className="w-3.5 h-3.5" /> {lessonById.get(q.lessonId)?.lesson.title}</button>}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------- Notes search ----------------
function snippet(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  const at = Math.max(0, Math.min(...terms.map((t) => { const i = lower.indexOf(t); return i < 0 ? Infinity : i; })) - 80);
  const s = (at > 0 ? '…' : '') + text.slice(at, at + 260) + (at + 260 < text.length ? '…' : '');
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return s.split(re).map((part, i) => (terms.includes(part.toLowerCase()) ? <mark key={i} className="bg-cyan-400/30 text-white rounded px-0.5">{part}</mark> : <span key={i}>{part}</span>));
}
export function NotesPage({ q: initial }: { q?: string }) {
  const [q, setQ] = useState(initial ?? '');
  const [ch, setCh] = useState('all');
  useEffect(() => setQ(initial ?? ''), [initial]);
  const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  const results = useMemo(() => {
    if (!terms.length) return [];
    return searchDocs
      .filter((d) => (ch === 'all' || d.chapterId === ch))
      .map((d) => { const hay = `${d.title} ${d.section} ${d.text}`.toLowerCase(); if (!terms.every((t) => hay.includes(t))) return null; const score = terms.reduce((s, t) => s + hay.split(t).length - 1 + (d.title.toLowerCase().includes(t) ? 5 : 0) + (d.section.toLowerCase().includes(t) ? 3 : 0), 0); return { d, score }; })
      .filter(Boolean).sort((a, b) => b!.score - a!.score).slice(0, 40) as { d: (typeof searchDocs)[number]; score: number }[];
  }, [q, ch]); // eslint-disable-line react-hooks/exhaustive-deps
  const suggestions = ['cosine similarity', 'TF-IDF', 'chunk', 'prosody', 'semantic segmentation', 'temperature', 'Foundry project', 'accountability', 'beam search', 'analyzer'];
  return (
    <div className="max-w-3xl mx-auto">
      <PageTitle eyebrow="Study notes" title="Search the entire course">Searches every lesson's notes, tables, key terms, exam traps and recaps.</PageTitle>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <label className="relative flex-1"><span className="sr-only">Search notes</span><Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. attention, PII, deployment type…" className="w-full rounded-xl bg-black/40 border border-white/15 pl-10 pr-3 py-3 text-gray-100 focus:outline-none focus:border-cyan-400/60" />
        </label>
        <select aria-label="Filter by chapter" value={ch} onChange={(e) => setCh(e.target.value)} className="rounded-xl bg-black/40 border border-white/15 px-3 py-3 text-sm text-gray-200"><option value="all">All chapters</option>{chapters.map((c) => <option key={c.id} value={c.id}>{c.number}. {c.short}</option>)}</select>
      </div>
      {!terms.length && <div className="flex flex-wrap gap-2 mb-8">{suggestions.map((s) => <button key={s} className="ai-btn-ghost text-xs" onClick={() => setQ(s)}>{s}</button>)}</div>}
      {terms.length > 0 && <p className="text-sm text-gray-500 mb-3" aria-live="polite">{results.length} result{results.length === 1 ? '' : 's'}</p>}
      <ul className="space-y-3">
        {results.map(({ d }, i) => {
          const c = chapterById.get(d.chapterId)!;
          return (
            <li key={i}><button onClick={() => navigate({ view: 'lesson', id: d.lessonId })} className="w-full text-left ai-panel p-4 hover:border-white/25">
              <p className="text-xs" style={{ color: c.accent }}>Chapter {c.number} · {d.title} · <span className="text-gray-400">{d.section}</span></p>
              <p className="text-sm text-gray-300 mt-1.5 leading-relaxed">{snippet(d.text, terms)}</p>
            </button></li>
          );
        })}
      </ul>
      {!terms.length && (
        <section>
          <h2 className="text-lg font-bold text-white mb-3">Browse chapter notes</h2>
          <div className="grid sm:grid-cols-2 gap-3">{chapters.map((c) => <div key={c.id} className="ai-panel p-4"><p className="font-semibold text-white text-sm mb-2" style={{ color: c.accent }}>{c.number}. {c.title}</p><ul className="space-y-1">{c.lessons.map((l) => <li key={l.id}><button className="text-xs text-gray-300 hover:text-white text-left" onClick={() => navigate({ view: 'lesson', id: l.id })}>{l.title}</button></li>)}</ul></div>)}</div>
        </section>
      )}
    </div>
  );
}

// ---------------- Glossary ----------------
export function GlossaryPage() {
  const [q, setQ] = useState('');
  const list = glossary.filter((g) => !q || `${g.term} ${g.def}`.toLowerCase().includes(q.toLowerCase()));
  const letters = [...new Set(list.map((g) => g.term[0].toUpperCase()))];
  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle eyebrow="Reference" title="Glossary of AI and Azure terms">{glossary.length} terms collected from every lesson. Select a term's chapter tag to jump to where it is taught.</PageTitle>
      <input aria-label="Filter glossary" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter terms…" className="w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-gray-100 mb-4 focus:outline-none focus:border-cyan-400/60" />
      <nav className="flex flex-wrap gap-1 mb-6" aria-label="Jump to letter">{letters.map((l) => <a key={l} href={`#gl-${l}`} onClick={(e) => { e.preventDefault(); document.getElementById(`gl-${l}`)?.scrollIntoView({ behavior: 'smooth' }); }} className="w-8 h-8 grid place-items-center rounded-lg bg-white/5 text-sm text-gray-300 hover:text-white">{l}</a>)}</nav>
      {letters.map((l) => (
        <section key={l} id={`gl-${l}`} className="mb-8 scroll-mt-24">
          <h2 className="text-2xl font-extrabold text-cyan-300 mb-3">{l}</h2>
          <dl className="grid sm:grid-cols-2 gap-3">
            {list.filter((g) => g.term[0].toUpperCase() === l).map((g) => { const c = chapterById.get(g.chapterId)!; return (
              <div key={g.term} className="ai-panel p-4"><dt className="flex justify-between gap-2"><span className="font-semibold text-white">{g.term}</span><button onClick={() => navigate({ view: 'lesson', id: g.lessonId })} className="text-[10px] shrink-0 px-2 py-0.5 rounded-full border h-fit" style={{ color: c.accent, borderColor: `${c.accent}55` }}>Ch {c.number}</button></dt><dd className="text-sm text-gray-400 mt-1">{g.def}</dd></div>
            ); })}
          </dl>
        </section>
      ))}
    </div>
  );
}

// ---------------- Study guide ----------------
export function GuidePage() {
  const [full, setFull] = useState(false);
  return (
    <div className="max-w-4xl mx-auto ai-guide">
      <div className="ai-noprint">
        <PageTitle eyebrow="Study guide" title="Consolidated AI-901 study guide">Generated from the complete course content: chapter summaries, every lesson's key terms, comparison tables, exam traps, memory aids and recaps. Use your browser's print dialog to save it as a PDF.</PageTitle>
        <div className="flex flex-wrap gap-3 mb-8">
          <button className="ai-btn" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print / save as PDF</button>
          <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={full} onChange={(e) => setFull(e.target.checked)} /> Include full lesson notes (long)</label>
        </div>
      </div>
      <div className="hidden print:block mb-6"><h1 className="text-2xl font-bold">{course.code} — {course.title}: Study guide</h1><p className="text-sm">Generated {new Date().toLocaleDateString()} · Not an official Microsoft document.</p></div>
      {chapters.map((c) => (
        <section key={c.id} className="mb-12 ai-print-break" style={{ ['--accent' as string]: c.accent }}>
          <h2 className="text-2xl font-extrabold text-white border-b border-white/10 pb-2 mb-4"><span style={{ color: c.accent }}>{c.number}.</span> {c.title}</h2>
          <ul className="mb-6 space-y-1.5">{c.summary.map((s) => <li key={s} className="text-sm text-gray-200">• <Rich text={s} /></li>)}</ul>
          {c.lessons.map((l) => (
            <article key={l.id} className="mb-8 pl-4 border-l-2" style={{ borderColor: `${c.accent}66` }}>
              <h3 className="text-lg font-bold text-white">{l.title}</h3>
              <p className="text-xs text-gray-500 mb-2">{l.sources.map((s) => ({ notes: 'Course notes', official: 'Verified Microsoft Learn', supplemental: 'Supplemental' })[s]).join(' · ')}</p>
              {full ? <div className="space-y-4 my-3">{l.blocks.filter((b) => b.kind !== 'sim').map((b, i) => <BlockView key={i} b={b} />)}</div> : (
                <div className="space-y-3 my-3">{l.blocks.filter((b) => b.kind === 'table' || b.kind === 'steps' || b.kind === 'formula').map((b, i) => <BlockView key={i} b={b} />)}</div>
              )}
              {l.terms?.length ? <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1 my-3">{l.terms.map((t) => <div key={t.term} className="text-sm"><dt className="inline font-semibold text-white">{t.term}: </dt><dd className="inline text-gray-400">{t.def}</dd></div>)}</dl> : null}
              {l.traps?.map((t) => <p key={t.claim} className="text-sm my-1"><span className="text-red-300 font-semibold">Trap: </span><span className="text-gray-400 line-through decoration-red-400/50">{t.claim}</span> → <span className="text-gray-200"><Rich text={t.truth} /></span></p>)}
              {l.memory && <p className="text-sm my-2"><span className="font-semibold" style={{ color: c.accent }}>Remember: </span><span className="text-gray-100">{l.memory}</span></p>}
              <ul className="text-sm text-gray-300">{l.recap.map((r) => <li key={r}>✓ <Rich text={r} /></li>)}</ul>
            </article>
          ))}
        </section>
      ))}
      <section className="ai-print-break">
        <h2 className="text-2xl font-extrabold text-white mb-4">Glossary</h2>
        <dl className="columns-1 sm:columns-2 gap-8">{glossary.map((g) => <div key={g.term} className="break-inside-avoid mb-2 text-sm"><dt className="font-semibold text-white">{g.term}</dt><dd className="text-gray-400">{g.def}</dd></div>)}</dl>
      </section>
      <p className="text-xs text-gray-500 mt-8">This guide is derived from course notes based on Microsoft Learn AI-901 content, supplemented and verified on 29 October 2026. Verify service details against current Microsoft documentation before your exam.</p>
    </div>
  );
}

// ---------------- Progress & readiness ----------------
const STATUS = { untested: ['Not enough data', '#64748b'], weak: ['Needs revision', '#f87171'], developing: ['Developing', '#f59e0b'], strong: ['Strong', '#34d399'] } as const;
export function ProgressPage() {
  const p = useProgress();
  const stats = topicStats(p);
  const ready = readinessScore(p);
  const [confirm, setConfirm] = useState(false);
  const weak = stats.filter((s) => s.status === 'weak' || s.status === 'untested');
  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle eyebrow="Progress" title="Readiness summary" />
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="ai-panel p-5 flex items-center gap-4"><Ring value={overallPct(p) / 100} color="#22d3ee"><span className="font-bold text-white">{overallPct(p)}%</span></Ring><div><p className="text-white font-semibold">Course progress</p><p className="text-xs text-gray-400">lessons, quizzes & final</p></div></div>
        <div className="ai-panel p-5 flex items-center gap-4"><Ring value={ready / 100} color="#a78bfa"><span className="font-bold text-white">{ready}%</span></Ring><div><p className="text-white font-semibold">Exam readiness</p><p className="text-xs text-gray-400">accuracy × coverage</p></div></div>
        <div className="ai-panel p-5"><p className="text-white font-semibold">Final assessment</p>{bestAttempt(p, 'final') ? <p className="text-3xl font-extrabold text-white mt-1">{Math.round((bestAttempt(p, 'final')!.score / bestAttempt(p, 'final')!.total) * 100)}%<span className="text-sm font-normal text-gray-400"> best</span></p> : <p className="text-sm text-gray-400 mt-1">Not attempted</p>}<p className={`text-xs mt-1 ${finalPassed(p) ? 'text-emerald-300' : 'text-gray-500'}`}>{finalPassed(p) ? 'Passed' : `Pass mark ${Math.round(FINAL_PASS * 100)}%`}</p></div>
      </div>
      {weak.length > 0 && (
        <div className="ai-panel p-5 mb-8 border-amber-400/30">
          <p className="flex items-center gap-2 font-semibold text-amber-200"><AlertTriangle className="w-4 h-4" /> Topics to revise</p>
          <div className="flex flex-wrap gap-2 mt-3">{weak.map((s) => { const c = chapterById.get(s.chapterId)!; return <button key={s.chapterId} className="ai-btn-ghost text-xs" onClick={() => navigate({ view: 'chapter', id: c.id })}>{c.number}. {c.short} · {STATUS[s.status][0]}</button>; })}</div>
        </div>
      )}
      <div className="ai-panel p-5 overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead><tr className="text-left text-xs text-gray-400"><th className="pb-2">Chapter</th><th>Lessons</th><th>Quiz best</th><th>Question accuracy</th><th>Status</th></tr></thead>
          <tbody>{stats.map((s) => { const c = chapterById.get(s.chapterId)!; const b = bestAttempt(p, `chapter:${c.id}`); return (
            <tr key={c.id} className="border-t border-white/5">
              <td className="py-2.5 pr-3"><button className="text-left text-gray-100 hover:text-white" onClick={() => navigate({ view: 'chapter', id: c.id })}>{c.number}. {c.short}</button>{isChapterComplete(p, c.id) && <Check className="inline w-3.5 h-3.5 ml-1 text-emerald-400" />}</td>
              <td className="font-mono text-gray-300">{c.lessons.filter((l) => isLessonDone(p, l.id)).length}/{c.lessons.length}</td>
              <td className="font-mono text-gray-300">{b ? `${Math.round((b.score / b.total) * 100)}%` : '—'}{quizPassed(p, c.id) && ' ✓'}</td>
              <td className="pr-3"><div className="flex items-center gap-2"><Bar value={s.accuracy ?? 0} className="w-24" color={STATUS[s.status][1]} /><span className="font-mono text-xs text-gray-400">{s.accuracy === null ? '—' : `${Math.round(s.accuracy * 100)}%`} ({s.answered}/{s.bank})</span></div></td>
              <td><span className="text-xs" style={{ color: STATUS[s.status][1] }}>{STATUS[s.status][0]}</span></td>
            </tr>
          ); })}</tbody>
        </table>
      </div>
      <div className="mt-10 ai-panel p-5">
        <p className="text-sm text-white font-semibold">Reset AI-901 progress</p>
        <p className="text-xs text-gray-400 mt-1">Clears AI-901 lessons, answers and attempts only. AZ-900 and DP-900 progress are stored separately and are not affected.</p>
        {!confirm ? <button className="ai-btn-ghost text-xs mt-3" onClick={() => setConfirm(true)}>Reset…</button> : (
          <div className="flex gap-2 mt-3"><button className="ai-btn text-xs !bg-red-500" onClick={() => { actions.reset(); setConfirm(false); }}>Yes, erase AI-901 progress</button><button className="ai-btn-ghost text-xs" onClick={() => setConfirm(false)}>Cancel</button></div>
        )}
      </div>
    </div>
  );
}

// ---------------- Completion ----------------
export function CompletePage() {
  const p = useProgress();
  const eligible = courseCompleteEligible(p);
  useEffect(() => { if (eligible) actions.markCourseComplete(); }, [eligible]);
  const stats = topicStats(p);
  const final = bestAttempt(p, 'final');
  if (!eligible) {
    const missingLessons = lessonRefs.filter((r) => !isLessonDone(p, r.lesson.id)).length;
    const missingQuizzes = chapters.filter((c) => !quizPassed(p, c.id)).length;
    return (
      <div className="max-w-2xl mx-auto ai-panel p-8 text-center">
        <Award className="w-12 h-12 mx-auto text-gray-500" />
        <p className="text-2xl font-bold text-white mt-3">Not complete yet</p>
        <ul className="text-sm text-gray-300 mt-4 space-y-1">
          {missingLessons > 0 && <li>{missingLessons} lesson(s) still to complete</li>}
          {missingQuizzes > 0 && <li>{missingQuizzes} chapter quiz(zes) still to pass</li>}
          {!finalPassed(p) && <li>Final assessment not yet passed ({Math.round(FINAL_PASS * 100)}% required)</li>}
        </ul>
        <button className="ai-btn mt-6" onClick={() => navigate({ view: 'home' })}>Back to course</button>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }} className="w-28 h-28 mx-auto rounded-full grid place-items-center" style={{ background: 'radial-gradient(circle, #facc15 0%, #f59e0b55 60%, transparent 70%)' }}><Award className="w-14 h-14 text-[#050a17]" /></motion.div>
      <p className="text-xs uppercase tracking-[0.3em] text-yellow-300 mt-6">Course complete</p>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2">{course.title}</h1>
      <p className="text-gray-400 mt-2">{course.code} · completed {p.completedAt ? new Date(p.completedAt).toLocaleDateString() : 'today'}</p>
      <div className="grid sm:grid-cols-3 gap-4 mt-10 text-left">
        <div className="ai-panel p-5"><p className="text-3xl font-extrabold text-white">{totals.lessons}</p><p className="text-sm text-gray-400">lessons completed</p></div>
        <div className="ai-panel p-5"><p className="text-3xl font-extrabold text-white">{chapters.length}</p><p className="text-sm text-gray-400">chapter quizzes passed</p></div>
        <div className="ai-panel p-5"><p className="text-3xl font-extrabold text-white">{final ? Math.round((final.score / final.total) * 100) : 0}%</p><p className="text-sm text-gray-400">best final assessment</p></div>
      </div>
      <div className="ai-panel p-6 mt-6 text-left">
        <p className="font-semibold text-white mb-3">Topics to revisit</p>
        {stats.filter((s) => s.status !== 'strong').length ? <div className="flex flex-wrap gap-2">{stats.filter((s) => s.status !== 'strong').map((s) => { const c = chapterById.get(s.chapterId)!; return <button key={c.id} className="ai-btn-ghost text-xs" onClick={() => navigate({ view: 'chapter', id: c.id })}>{c.number}. {c.short} — {s.accuracy === null ? 'untested' : `${Math.round(s.accuracy * 100)}%`}</button>; })}</div> : <p className="text-sm text-emerald-300">Strong across every chapter. Excellent work.</p>}
      </div>
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/[0.07] p-5 mt-6 text-left text-sm text-gray-200">
        <p className="font-semibold text-amber-200 mb-1">This is not a Microsoft certification</p>
        You have completed this platform's AI-901 learning course. To earn <b>Microsoft Certified: Azure AI Fundamentals</b> you must pass Exam AI-901. Recommended next steps: take Microsoft's free official practice assessment, complete the hands-on Foundry exercises flagged in the lessons, and re-check the study guide for updates.
        <a className="flex items-center gap-1 text-cyan-300 mt-2" href="https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-901" target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5" /> Official AI-901 study guide</a>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-8"><button className="ai-btn" onClick={() => navigate({ view: 'guide' })}>Open study guide</button><button className="ai-btn-ghost" onClick={() => navigate({ view: 'home' })}>Course home</button></div>
    </div>
  );
}

