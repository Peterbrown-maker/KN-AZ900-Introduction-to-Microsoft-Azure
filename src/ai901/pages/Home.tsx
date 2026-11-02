import { motion } from 'framer-motion';
import { Play, ArrowRight, Clock, BookOpen, Layers, Check, Lock, Flag, Search, BookA, FileText, Target, GraduationCap, Sparkles, CircleDashed, ShieldAlert } from 'lucide-react';
import { chapters, course, lessonById, lessonRefs, totals } from '../data';
import { objectives, domains } from '../data/objectives';
import { useProgress, overallPct, isLessonDone, quizPassed, isChapterComplete, chapterLessonsDone, finalPassed, bestAttempt, CHAPTER_PASS, FINAL_PASS, readinessScore } from '../progress';
import { navigate } from '../router';
import { iconByName, Bar } from '../ui';
import { Ring } from '../components/common';
import { ElectricBrainCanvas } from '../sims/foundations';

export function continueLessonId(p: ReturnType<typeof useProgress>) {
  if (p.lastLessonId && lessonById.has(p.lastLessonId) && !isLessonDone(p, p.lastLessonId)) return p.lastLessonId;
  return (lessonRefs.find((r) => !isLessonDone(p, r.lesson.id)) ?? lessonRefs[0]).lesson.id;
}

export function Home() {
  const p = useProgress();
  const pct = overallPct(p);
  const started = Object.keys(p.lessons).length > 0;
  const nextId = continueLessonId(p);
  const next = lessonById.get(nextId)!;
  const final = bestAttempt(p, 'final');
  const allChapters = chapters.every((c) => isChapterComplete(p, c.id));
  const criteria = [
    { ok: lessonRefs.every((r) => isLessonDone(p, r.lesson.id)), t: `Complete all ${totals.lessons} lessons (answer each lesson's knowledge check, then mark it complete)` },
    { ok: chapters.every((c) => quizPassed(p, c.id)), t: `Pass every chapter quiz with ${Math.round(CHAPTER_PASS * 100)}% or more` },
    { ok: finalPassed(p), t: `Pass the final comprehensive assessment with ${Math.round(FINAL_PASS * 100)}% or more` },
  ];
  const hours = Math.round((totals.minutes / 60) * 10) / 10;

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative -mx-4 sm:-mx-6 -mt-6 px-4 sm:px-6 pt-10 pb-12 overflow-hidden rounded-b-[2.5rem]">
        <div className="absolute inset-0 opacity-70 pointer-events-none"><ElectricBrainCanvas height={560} intensity={1.4} /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050a17]/30 via-[#050a17]/70 to-[#050a17] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto grid lg:grid-cols-[1.5fr_1fr] gap-10 items-center pt-10">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] px-3 py-1 rounded-full border border-white/15 bg-white/5 text-cyan-200">
              <Sparkles className="w-3.5 h-3.5" /> {course.code} · {course.level}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-white">
              Introduction to <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">AI in Azure</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-5 text-lg text-gray-300 max-w-xl leading-relaxed">{course.description}</motion.p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-cyan-300" /> {totals.chapters} chapters</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-cyan-300" /> {totals.lessons} lessons</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-cyan-300" /> ≈ {hours} hours</span>
              <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-cyan-300" /> Maps to Exam AI-901</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <button className="ai-btn text-base px-6 py-3" onClick={() => navigate({ view: 'lesson', id: nextId })}>{started ? 'Continue learning' : 'Start the course'} <ArrowRight className="w-5 h-5" /></button>
              <button className="ai-btn-ghost text-base px-5 py-3" onClick={() => navigate({ view: 'prologue' })}><Play className="w-5 h-5" /> Watch the opening</button>
            </div>
            {started && <p className="text-xs text-gray-500 mt-3">Next up: Chapter {next.chapter.number} · {next.lesson.title}</p>}
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="ai-panel p-6 backdrop-blur-md">
            <div className="flex items-center gap-5">
              <Ring value={pct / 100} size={96} stroke={8} color="#22d3ee"><span className="text-2xl font-extrabold text-white">{pct}%</span></Ring>
              <div className="text-sm space-y-1">
                <p className="text-white font-semibold">Your progress</p>
                <p className="text-gray-400">{Object.values(p.lessons).filter((l) => l.completedAt).length}/{totals.lessons} lessons</p>
                <p className="text-gray-400">{chapters.filter((c) => quizPassed(p, c.id)).length}/{totals.chapters} chapter quizzes passed</p>
                <p className="text-gray-400">Final: {final ? `${Math.round((final.score / final.total) * 100)}% best` : 'not attempted'}</p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-gray-400">Exam readiness</span>
              <span className="font-mono text-white">{readinessScore(p)}%</span>
            </div>
            <Bar value={readinessScore(p) / 100} className="mt-2" color="#a78bfa" />
            <button className="ai-btn-ghost w-full justify-center mt-4 text-sm" onClick={() => navigate({ view: 'progress' })}>View detailed progress</button>
          </motion.div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">What you'll be able to do</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {course.outcomes.map((o, i) => (
            <motion.div key={o} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="ai-panel p-5">
              <span className="text-xs font-mono text-cyan-300">0{i + 1}</span>
              <p className="text-gray-200 mt-2 leading-relaxed">{o}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Chapter explorer */}
      <section className="max-w-5xl mx-auto" id="chapters">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Chapter explorer</h2>
          <p className="text-sm text-gray-500">Every chapter is open — learn in any order.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((c, i) => {
            const Icon = iconByName(c.icon);
            const done = chapterLessonsDone(p, c.id);
            const complete = isChapterComplete(p, c.id);
            return (
              <motion.button key={c.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.06 }} whileHover={{ y: -4 }}
                onClick={() => navigate({ view: 'chapter', id: c.id })} className="group relative text-left ai-panel p-5 overflow-hidden">
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: c.accent }} />
                <div className="relative flex items-start justify-between">
                  <span className="w-11 h-11 rounded-xl grid place-items-center" style={{ background: `${c.accent}22`, border: `1px solid ${c.accent}44` }}><Icon className="w-5 h-5" style={{ color: c.accent }} /></span>
                  {complete ? <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Complete</span> : <span className="text-xs font-mono text-gray-500">{String(c.number).padStart(2, '0')}</span>}
                </div>
                <p className="relative mt-4 text-lg font-bold text-white leading-snug">{c.title}</p>
                <p className="relative text-sm text-gray-400 mt-1 line-clamp-2">{c.tagline}</p>
                <div className="relative mt-4"><div className="flex justify-between text-[11px] text-gray-500 mb-1"><span>{done}/{c.lessons.length} lessons</span><span>{quizPassed(p, c.id) ? 'Quiz passed' : 'Quiz pending'}</span></div><Bar value={(done + (quizPassed(p, c.id) ? 1 : 0)) / (c.lessons.length + 1)} color={c.accent} /></div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Exam preparation */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Exam preparation</h2>
        <p className="text-gray-400 mb-6 max-w-3xl">Every official AI-901 skill (study guide, skills measured as of April 15, 2026) is mapped to lessons below. Items marked <span className="text-amber-300">hands-on</span> benefit from practice in a real Microsoft Foundry project.</p>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <button className="ai-panel p-5 text-left hover:border-white/25" onClick={() => navigate({ view: 'practice' })}><Target className="w-6 h-6 text-cyan-300" /><p className="font-semibold text-white mt-3">Mixed practice test</p><p className="text-sm text-gray-400 mt-1">20 random questions from the whole bank, with instant feedback.</p></button>
          <button className="ai-panel p-5 text-left hover:border-white/25" onClick={() => navigate({ view: 'review' })}><CircleDashed className="w-6 h-6 text-amber-300" /><p className="font-semibold text-white mt-3">Review mode</p><p className="text-sm text-gray-400 mt-1">Every question you got wrong, with explanations and links to lessons.</p></button>
          <button className="ai-panel p-5 text-left hover:border-white/25" onClick={() => navigate({ view: 'progress' })}><GraduationCap className="w-6 h-6 text-violet-300" /><p className="font-semibold text-white mt-3">Readiness summary</p><p className="text-sm text-gray-400 mt-1">Accuracy by topic and the weak areas to revisit.</p></button>
        </div>
        <div className="space-y-6">
          {(Object.keys(domains) as (keyof typeof domains)[]).map((d) => {
            const groups = [...new Set(objectives.filter((o) => o.domain === d).map((o) => o.group))];
            return (
              <div key={d} className="ai-panel p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3"><p className="font-bold text-white">{domains[d].label}</p><span className="text-sm font-mono text-cyan-300">{domains[d].weight}</span></div>
                {groups.map((g) => (
                  <div key={g} className="mb-4 last:mb-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{g}</p>
                    <ul className="space-y-1.5">
                      {objectives.filter((o) => o.group === g).map((o) => {
                        const ls = lessonRefs.filter((r) => r.lesson.objectiveIds?.includes(o.id));
                        const hands = ls.some((r) => r.lesson.handsOn) || o.domain === 'foundry';
                        return (
                          <li key={o.id} className="grid md:grid-cols-[1fr_1.2fr] gap-2 text-sm">
                            <span className="text-gray-200">{o.text}{hands && <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-300">hands-on</span>}</span>
                            <span className="flex flex-wrap gap-1">{ls.map((r) => <button key={r.lesson.id} onClick={() => navigate({ view: 'lesson', id: r.lesson.id })} className={`text-[11px] px-2 py-0.5 rounded-full border ${isLessonDone(p, r.lesson.id) ? 'border-emerald-400/40 text-emerald-200' : 'border-white/10 text-gray-400 hover:text-white'}`}>{r.chapter.number}.{r.chapter.lessons.indexOf(r.lesson) + 1} {r.lesson.title}</button>)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final assessment + criteria */}
      <section className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">
        <div className="relative ai-panel p-6 overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-25" style={{ background: '#facc15' }} />
          <Flag className="relative w-7 h-7 text-yellow-300" />
          <p className="relative text-xl font-bold text-white mt-3">Final knowledge assessment</p>
          <p className="relative text-sm text-gray-400 mt-2">50 questions drawn from every chapter, in mixed formats. No feedback until you submit — just like an exam. Pass mark {Math.round(FINAL_PASS * 100)}%.</p>
          {!allChapters && <p className="relative text-xs text-amber-300 mt-3 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Open to you now, but recommended after finishing the chapters.</p>}
          <button className="relative ai-btn mt-5" onClick={() => navigate({ view: 'final' })}>{final ? 'Retake final assessment' : 'Start final assessment'}</button>
        </div>
        <div className="ai-panel p-6">
          <p className="text-xl font-bold text-white">Course completion criteria</p>
          <ul className="mt-4 space-y-3">{criteria.map((c) => <li key={c.t} className="flex gap-3 text-sm"><span className={`w-5 h-5 shrink-0 rounded-full grid place-items-center ${c.ok ? 'bg-emerald-500/30 text-emerald-200' : 'bg-white/5 text-gray-500'}`}>{c.ok ? <Check className="w-3 h-3" /> : ''}</span><span className={c.ok ? 'text-gray-200' : 'text-gray-400'}>{c.t}</span></li>)}</ul>
          <p className="text-xs text-gray-500 mt-4 flex gap-2"><ShieldAlert className="w-4 h-4 shrink-0 text-amber-300" />Opening a lesson never counts as completing it. Completing this course is a learning milestone on this platform — it is not a Microsoft certification. Certification requires passing Exam AI-901.</p>
          {criteria.every((c) => c.ok) && <button className="ai-btn mt-4" onClick={() => navigate({ view: 'complete' })}>View completion summary</button>}
        </div>
      </section>

      {/* Study tools */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Your study reference</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Search, t: 'Search all notes', d: 'Full-text search across every lesson, term, trap and recap.', go: () => navigate({ view: 'notes' }) },
            { icon: BookA, t: 'Glossary', d: 'Every AI and Azure term defined, with links back to its lesson.', go: () => navigate({ view: 'glossary' }) },
            { icon: FileText, t: 'Printable study guide', d: 'A consolidated guide generated from the full course content.', go: () => navigate({ view: 'guide' }) },
          ].map((x) => <button key={x.t} onClick={x.go} className="ai-panel p-5 text-left hover:border-white/25"><x.icon className="w-6 h-6 text-cyan-300" /><p className="font-semibold text-white mt-3">{x.t}</p><p className="text-sm text-gray-400 mt-1">{x.d}</p></button>)}
        </div>
      </section>
    </div>
  );
}
