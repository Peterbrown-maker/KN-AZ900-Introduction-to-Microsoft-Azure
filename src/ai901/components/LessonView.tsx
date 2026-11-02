import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, Target, Brain, ListChecks, ExternalLink, Hammer, Flag, BookMarked } from 'lucide-react';
import type { Question } from '../types';
import { lessonById, lessonRefs } from '../data';
import { objectives } from '../data/objectives';
import { actions, isLessonDone, useProgress } from '../progress';
import { navigate } from '../router';
import { BlockView } from './Blocks';
import { QuestionView, initialAnswer, isAnswered, isCorrect, type Answer } from './Question';
import { Rich, iconByName } from '../ui';
import { SourceBadges } from './common';

function InlineCheck({ q, index }: { q: Question; index: number }) {
  const p = useProgress();
  const [seed] = useState(() => Math.floor(Math.random() * 1e6) + 1);
  const [a, setA] = useState<Answer>(() => initialAnswer(q, seed));
  const [touched, setTouched] = useState(false);
  const [rev, setRev] = useState(false);
  const prev = p.answers[q.id];
  return (
    <div className="ai-panel p-5">
      <QuestionView q={q} answer={a} onChange={(x) => { setA(x); setTouched(true); }} revealed={rev} seed={seed} index={index} />
      <div className="flex flex-wrap items-center gap-3 mt-4">
        {!rev ? (
          <button className="ai-btn" disabled={!isAnswered(q, a) || (q.type === 'order' && !touched)} onClick={() => { setRev(true); actions.recordAnswer(q.id, isCorrect(q, a)); }}>Check answer</button>
        ) : (
          <button className="ai-btn-ghost text-sm" onClick={() => { setRev(false); setA(initialAnswer(q, seed + 1)); setTouched(false); }}>Try again</button>
        )}
        {prev && !rev && <span className="text-xs text-gray-500">Previously answered {prev.correct ? 'correctly' : 'incorrectly'}.</span>}
      </div>
    </div>
  );
}

export function LessonView({ id }: { id: string }) {
  const ref = lessonById.get(id);
  const p = useProgress();
  useEffect(() => { if (ref) actions.startLesson(id); }, [id, ref]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!ref || !e.altKey) return;
      const next = lessonRefs[ref.index + 1], prev = lessonRefs[ref.index - 1];
      if (e.key === 'ArrowRight' && next) navigate({ view: 'lesson', id: next.lesson.id });
      if (e.key === 'ArrowLeft' && prev) navigate({ view: 'lesson', id: prev.lesson.id });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ref]);
  const objs = useMemo(() => objectives.filter((o) => ref?.lesson.objectiveIds?.includes(o.id)), [ref]);
  if (!ref) return <p className="text-gray-400">Lesson not found. <button className="underline" onClick={() => navigate({ view: 'home' })}>Back to course</button></p>;
  const { lesson, chapter } = ref;
  const done = isLessonDone(p, id);
  const checksAnswered = lesson.checks.every((q) => p.answers[q.id]);
  const prev = lessonRefs[ref.index - 1];
  const next = lessonRefs[ref.index + 1];
  const isLastInChapter = chapter.lessons[chapter.lessons.length - 1].id === id;
  const Icon = iconByName(chapter.icon);

  return (
    <div className="grid lg:grid-cols-[16rem_1fr] gap-8" style={{ ['--accent' as string]: chapter.accent }}>
      {/* Chapter navigation */}
      <aside className="hidden lg:block ai-noprint">
        <div className="sticky top-20 space-y-1">
          <button onClick={() => navigate({ view: 'chapter', id: chapter.id })} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white mb-3"><ArrowLeft className="w-3.5 h-3.5" /> Chapter {chapter.number} overview</button>
          {chapter.lessons.map((l, i) => {
            const d = isLessonDone(p, l.id);
            return (
              <button key={l.id} onClick={() => navigate({ view: 'lesson', id: l.id })} aria-current={l.id === id ? 'page' : undefined}
                className={`w-full text-left flex gap-2.5 items-start rounded-lg px-2.5 py-2 text-sm ${l.id === id ? 'bg-white/[0.07] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'}`}>
                <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full grid place-items-center text-[10px] font-bold ${d ? 'bg-emerald-500/25 text-emerald-300' : 'bg-white/5'}`}>{d ? <Check className="w-3 h-3" /> : i + 1}</span>
                <span className="leading-snug">{l.title}</span>
              </button>
            );
          })}
          <button onClick={() => navigate({ view: 'quiz', id: chapter.id })} className="w-full text-left flex gap-2.5 items-center rounded-lg px-2.5 py-2 text-sm text-gray-400 hover:text-gray-200"><Flag className="w-4 h-4" /> Chapter quiz</button>
        </div>
      </aside>

      <article className="min-w-0 max-w-3xl">
        {/* Hero */}
        <header className="relative mb-8">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none" style={{ background: chapter.accent }} />
          <nav className="relative flex flex-wrap items-center gap-1.5 text-xs text-gray-400 mb-4" aria-label="Breadcrumb">
            <button className="hover:text-white" onClick={() => navigate({ view: 'home' })}>AI-901</button><span>/</span>
            <button className="hover:text-white" onClick={() => navigate({ view: 'chapter', id: chapter.id })}>Chapter {chapter.number}</button><span>/</span>
            <span className="text-gray-300">Lesson {chapter.lessons.findIndex((l) => l.id === id) + 1}</span>
          </nav>
          <div className="relative flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: `${chapter.accent}22`, border: `1px solid ${chapter.accent}55` }}><Icon className="w-5 h-5" style={{ color: chapter.accent }} /></span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: chapter.accent }}>{chapter.short}</span>
          </div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">{lesson.title}</motion.h1>
          <div className="relative flex flex-wrap items-center gap-3 mt-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {lesson.minutes} min</span>
            <SourceBadges sources={lesson.sources} />
            {done && <span className="flex items-center gap-1 text-emerald-300"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>}
          </div>
        </header>

        <section className="ai-panel p-5 mb-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300 mb-3"><Target className="w-4 h-4" style={{ color: chapter.accent }} /> Learning objectives</p>
          <ul className="space-y-1.5">{lesson.objectives.map((o) => <li key={o} className="flex gap-2 text-sm text-gray-200"><Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: chapter.accent }} />{o}</li>)}</ul>
        </section>

        <p className="text-lg sm:text-xl text-gray-200 leading-relaxed mb-8"><Rich text={lesson.intro} /></p>

        <div className="space-y-6">{lesson.blocks.map((b, i) => <BlockView key={i} b={b} />)}</div>

        {lesson.terms?.length ? (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><BookMarked className="w-5 h-5" style={{ color: chapter.accent }} /> Key terms</h2>
            <dl className="grid sm:grid-cols-2 gap-3">{lesson.terms.map((t) => <div key={t.term} className="ai-panel p-4"><dt className="font-semibold text-white text-sm">{t.term}</dt><dd className="text-sm text-gray-400 mt-1">{t.def}</dd></div>)}</dl>
          </section>
        ) : null}

        {lesson.traps?.length ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-red-400" /> Common misunderstandings & exam traps</h2>
            <div className="space-y-3">{lesson.traps.map((t) => (
              <div key={t.claim} className="grid sm:grid-cols-2 rounded-xl overflow-hidden border border-white/10">
                <p className="p-4 bg-red-500/[0.07] text-sm text-red-100"><span className="block text-[10px] font-bold uppercase tracking-widest text-red-300 mb-1">Myth</span>{t.claim}</p>
                <p className="p-4 bg-emerald-500/[0.07] text-sm text-emerald-50"><span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-300 mb-1">Reality</span><Rich text={t.truth} /></p>
              </div>
            ))}</div>
          </section>
        ) : null}

        {lesson.memory && (
          <section className="mt-10 rounded-2xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${chapter.accent}22, transparent)`, border: `1px solid ${chapter.accent}40` }}>
            <Brain className="w-6 h-6 mx-auto mb-2" style={{ color: chapter.accent }} />
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-1">Memory aid</p>
            <p className="text-lg sm:text-xl font-semibold text-white">{lesson.memory}</p>
          </section>
        )}

        {lesson.handsOn && (
          <aside className="mt-8 rounded-xl border border-amber-400/30 bg-amber-500/[0.07] p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-200 mb-1"><Hammer className="w-4 h-4" /> Hands-on practice recommended</p>
            <p className="text-sm text-gray-200">{lesson.handsOn} The simulations in this course do not require Azure; this exercise strengthens exam readiness for the Foundry implementation domain.</p>
          </aside>
        )}

        <section className="mt-12 ai-noprint">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ListChecks className="w-5 h-5" style={{ color: chapter.accent }} /> Knowledge check</h2>
          <div className="space-y-4">{lesson.checks.map((q, i) => <InlineCheck key={q.id} q={q} index={i} />)}</div>
        </section>

        <section className="mt-12 ai-panel p-5">
          <h2 className="text-lg font-bold text-white mb-3">Lesson recap</h2>
          <ul className="space-y-1.5">{lesson.recap.map((r) => <li key={r} className="flex gap-2 text-sm text-gray-200"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" /><Rich text={r} /></li>)}</ul>
        </section>

        <section className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="ai-panel p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Microsoft Learn references</p>
            <ul className="space-y-1.5">{lesson.references.map((r) => <li key={r.url}><a href={r.url} target="_blank" rel="noreferrer" className="text-sm text-cyan-300 hover:text-cyan-200 inline-flex items-start gap-1.5"><ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" />{r.label}</a></li>)}</ul>
          </div>
          {objs.length > 0 && (
            <div className="ai-panel p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Official AI-901 objectives covered</p>
              <ul className="space-y-1.5">{objs.map((o) => <li key={o.id} className="text-xs text-gray-300">• {o.text}</li>)}</ul>
            </div>
          )}
        </section>

        {/* Completion + navigation */}
        <section className="mt-10 ai-panel p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ai-noprint">
          {done ? (
            <p className="flex-1 text-sm text-emerald-300 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Lesson completed {new Date(p.lessons[id].completedAt!).toLocaleDateString()}. You can revisit it any time.</p>
          ) : (
            <p className="flex-1 text-sm text-gray-300">{checksAnswered ? 'You\'ve answered the knowledge checks. Mark this lesson complete when you\'re ready.' : 'Answer the knowledge check above to unlock completion.'}</p>
          )}
          {!done && <button className="ai-btn" disabled={!checksAnswered} onClick={() => actions.completeLesson(id)}><Check className="w-4 h-4" /> Mark lesson complete</button>}
        </section>

        <nav className="mt-6 flex flex-col sm:flex-row gap-3 justify-between ai-noprint" aria-label="Lesson navigation">
          {prev ? <button className="ai-btn-ghost justify-start" onClick={() => navigate({ view: 'lesson', id: prev.lesson.id })}><ArrowLeft className="w-4 h-4" /> <span className="truncate">{prev.lesson.title}</span></button> : <span />}
          {isLastInChapter ? (
            <button className="ai-btn justify-end" onClick={() => navigate({ view: 'quiz', id: chapter.id })}>Chapter {chapter.number} quiz <ArrowRight className="w-4 h-4" /></button>
          ) : next ? (
            <button className="ai-btn justify-end" onClick={() => navigate({ view: 'lesson', id: next.lesson.id })}><span className="truncate">{next.lesson.title}</span> <ArrowRight className="w-4 h-4" /></button>
          ) : null}
        </nav>
        <p className="text-[11px] text-gray-600 mt-3 text-center ai-noprint">Tip: Alt + ← / → moves between lessons.</p>
      </article>
    </div>
  );
}

