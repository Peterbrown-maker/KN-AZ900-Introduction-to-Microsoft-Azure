import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Flag, RotateCcw, Trophy, BookOpen } from 'lucide-react';
import type { Question } from '../types';
import { QuestionView, initialAnswer, isAnswered, isCorrect, type Answer } from './Question';
import { actions } from '../progress';
import { chapterById, lessonById } from '../data';
import { navigate } from '../router';
import { shuffle, Bar } from '../ui';

interface Props {
  title: string;
  subtitle?: string;
  questions: Question[];
  /** learn = feedback after each question; exam = feedback only at the end. */
  mode: 'learn' | 'exam';
  attemptKey: string;
  passMark: number;
  onExit: () => void;
  exitLabel?: string;
  shuffleQuestions?: boolean;
}

export function QuizRunner(props: Props) {
  const [run, setRun] = useState(0);
  return <Attempt key={run} {...props} onRetake={() => setRun((r) => r + 1)} />;
}

function Attempt({ title, subtitle, questions, mode, attemptKey, passMark, onExit, exitLabel = 'Back', shuffleQuestions = true, onRetake }: Props & { onRetake: () => void }) {
  const [seed] = useState(() => Math.floor(Math.random() * 1e9) + 1);
  const qs = useMemo(() => (shuffleQuestions ? shuffle(questions, seed) : questions), [questions, seed, shuffleQuestions]);
  const [answers, setAnswers] = useState<Record<string, Answer>>(() => Object.fromEntries(qs.map((q) => [q.id, initialAnswer(q, seed)])));
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const q = qs[i];

  const finish = () => {
    const results = Object.fromEntries(qs.map((x) => [x.id, isCorrect(x, answers[x.id])]));
    const score = Object.values(results).filter(Boolean).length;
    actions.recordAttempt(attemptKey, { at: Date.now(), score, total: qs.length, wrong: qs.filter((x) => !results[x.id]).map((x) => x.id) }, results);
    setDone(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!qs.length) return <p className="text-gray-400">No questions available.</p>;

  if (done) {
    const results = qs.map((x) => ({ q: x, ok: isCorrect(x, answers[x.id]) }));
    const score = results.filter((r) => r.ok).length;
    const pct = score / qs.length;
    const pass = pct >= passMark;
    const byChapter = [...new Set(qs.map((x) => x.chapterId!))].map((cid) => {
      const rs = results.filter((r) => r.q.chapterId === cid);
      return { c: chapterById.get(cid)!, ok: rs.filter((r) => r.ok).length, n: rs.length };
    });
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="ai-panel p-6 sm:p-8 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-2" style={{ color: pass ? '#facc15' : '#64748b' }} />
          <p className="text-sm uppercase tracking-widest text-gray-400">{title}</p>
          <p className="text-5xl font-extrabold text-white mt-2">{Math.round(pct * 100)}%</p>
          <p className="text-gray-300 mt-1">{score} of {qs.length} correct · pass mark {Math.round(passMark * 100)}%</p>
          <p className={`mt-3 font-semibold ${pass ? 'text-emerald-300' : 'text-amber-300'}`}>{pass ? 'Passed — well done.' : 'Not passed yet. Review the explanations below, revisit the lessons, and retake.'}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <button className="ai-btn" onClick={onRetake}><RotateCcw className="w-4 h-4" /> Retake</button>
            <button className="ai-btn-ghost" onClick={onExit}>{exitLabel}</button>
            <button className="ai-btn-ghost" onClick={() => navigate({ view: 'review' })}>Review mode</button>
          </div>
        </motion.div>
        {byChapter.length > 1 && (
          <div className="ai-panel p-5">
            <p className="text-sm font-semibold text-white mb-3">Performance by chapter</p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {byChapter.map(({ c, ok, n }) => (
                <div key={c.id} className="text-xs"><div className="flex justify-between mb-1"><span className="text-gray-300">{c.number}. {c.short}</span><span className="font-mono text-gray-400">{ok}/{n}</span></div><Bar value={ok / n} color={ok / n >= 0.8 ? '#34d399' : ok / n >= 0.6 ? '#f59e0b' : '#f87171'} /></div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-white">Answer review</p>
          {results.map(({ q: x, ok }, k) => (
            <div key={x.id} className={`ai-panel p-5 border-l-4 ${ok ? 'border-l-emerald-400' : 'border-l-red-400'}`}>
              <QuestionView q={x} answer={answers[x.id]} onChange={() => {}} revealed seed={seed} index={k} />
              {x.lessonId && lessonById.get(x.lessonId) && (
                <button className="ai-btn-ghost text-xs mt-3" onClick={() => navigate({ view: 'lesson', id: x.lessonId! })}><BookOpen className="w-3.5 h-3.5" /> Revisit: {lessonById.get(x.lessonId)!.lesson.title}</button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const answered = isAnswered(q, answers[q.id]) && (q.type !== 'order' || touched[q.id] || revealed[q.id]);
  const isRev = mode === 'learn' && revealed[q.id];
  const allAnswered = qs.every((x) => isAnswered(x, answers[x.id]));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><p className="text-sm uppercase tracking-widest text-gray-400">{title}</p>{subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}</div>
        <p className="text-sm font-mono text-gray-400">Question {i + 1} / {qs.length}</p>
      </div>
      <Bar value={(i + (isRev ? 1 : 0)) / qs.length} />
      {mode === 'exam' && (
        <div className="flex flex-wrap gap-1" aria-label="Question navigator">
          {qs.map((x, k) => <button key={x.id} onClick={() => setI(k)} aria-label={`Go to question ${k + 1}`} className={`w-7 h-7 rounded-md text-[11px] font-mono border ${k === i ? 'border-transparent text-[#050a17]' : isAnswered(x, answers[x.id]) && (x.type !== 'order' || touched[x.id]) ? 'border-white/20 bg-white/10 text-gray-200' : 'border-white/10 text-gray-500'}`} style={k === i ? { background: 'var(--accent)' } : undefined}>{k + 1}</button>)}
        </div>
      )}
      <motion.div key={q.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="ai-panel p-5 sm:p-6">
        <QuestionView q={q} index={i} seed={seed} answer={answers[q.id]} revealed={!!isRev}
          onChange={(a) => { setAnswers({ ...answers, [q.id]: a }); setTouched({ ...touched, [q.id]: true }); }} />
      </motion.div>
      <div className="flex flex-wrap justify-between gap-2">
        <button className="ai-btn-ghost" onClick={() => (i === 0 ? onExit() : setI(i - 1))}><ArrowLeft className="w-4 h-4" /> {i === 0 ? exitLabel : 'Previous'}</button>
        <div className="flex gap-2">
          {mode === 'learn' && !isRev && <button className="ai-btn" disabled={!answered} onClick={() => setRevealed({ ...revealed, [q.id]: true })}>Check answer</button>}
          {(mode === 'exam' || isRev) && i < qs.length - 1 && <button className="ai-btn" onClick={() => setI(i + 1)}>Next <ArrowRight className="w-4 h-4" /></button>}
          {(mode === 'exam' || isRev) && i === qs.length - 1 && (
            <button className="ai-btn" onClick={finish} disabled={mode === 'exam' && !allAnswered} title={mode === 'exam' && !allAnswered ? 'Answer every question first' : undefined}><Flag className="w-4 h-4" /> {mode === 'exam' ? 'Submit assessment' : 'See results'}</button>
          )}
        </div>
      </div>
      {mode === 'exam' && i === qs.length - 1 && !allAnswered && <p className="text-xs text-amber-300 text-right">{qs.filter((x) => !isAnswered(x, answers[x.id])).length} question(s) still unanswered.</p>}
    </div>
  );
}
