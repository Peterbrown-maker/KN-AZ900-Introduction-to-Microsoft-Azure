import { useSyncExternalStore } from 'react';
import { chapters, questionBank, totals } from './data';

// AI-901 progress lives under its own localStorage key, matching the per-course
// persistence used by AZ-900 ('az900-progress') and DP-900 ('dp900-progress').
export const AI901_STORAGE_KEY = 'ai901-progress';

export const CHAPTER_PASS = 0.7;
export const FINAL_PASS = 0.75;

export interface Attempt { at: number; score: number; total: number; wrong: string[] }

export interface AI901Progress {
  v: 1;
  lessons: Record<string, { startedAt: number; completedAt?: number }>;
  answers: Record<string, { correct: boolean; at: number; attempts: number }>;
  attempts: Record<string, Attempt[]>; // 'chapter:<id>' | 'practice' | 'final' | 'review'
  lastLessonId?: string;
  completedAt?: number;
}

const empty = (): AI901Progress => ({ v: 1, lessons: {}, answers: {}, attempts: {} });

function load(): AI901Progress {
  try {
    const raw = localStorage.getItem(AI901_STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<AI901Progress>;
      return { ...empty(), ...p, v: 1 };
    }
  } catch {
    // ignore
  }
  return empty();
}

let state: AI901Progress = load();
const listeners = new Set<() => void>();

function set(next: AI901Progress) {
  state = next;
  try {
    localStorage.setItem(AI901_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useProgress(): AI901Progress {
  return useSyncExternalStore(subscribe, () => state);
}

// ---------- Actions ----------
export const actions = {
  startLesson(id: string) {
    const existing = state.lessons[id];
    set({ ...state, lastLessonId: id, lessons: existing ? state.lessons : { ...state.lessons, [id]: { startedAt: Date.now() } } });
  },
  completeLesson(id: string) {
    const l = state.lessons[id] ?? { startedAt: Date.now() };
    set({ ...state, lessons: { ...state.lessons, [id]: { ...l, completedAt: l.completedAt ?? Date.now() } } });
  },
  recordAnswer(qid: string, correct: boolean) {
    const prev = state.answers[qid];
    set({ ...state, answers: { ...state.answers, [qid]: { correct, at: Date.now(), attempts: (prev?.attempts ?? 0) + 1 } } });
  },
  recordAttempt(key: string, attempt: Attempt, results: Record<string, boolean>) {
    const answers = { ...state.answers };
    for (const [qid, correct] of Object.entries(results)) {
      answers[qid] = { correct, at: attempt.at, attempts: (answers[qid]?.attempts ?? 0) + 1 };
    }
    set({ ...state, answers, attempts: { ...state.attempts, [key]: [...(state.attempts[key] ?? []), attempt] } });
  },
  markCourseComplete() {
    if (!state.completedAt) set({ ...state, completedAt: Date.now() });
  },
  reset() {
    set(empty());
  },
};

// ---------- Derived ----------
export const isLessonDone = (p: AI901Progress, id: string) => !!p.lessons[id]?.completedAt;

export const bestAttempt = (p: AI901Progress, key: string): Attempt | undefined =>
  (p.attempts[key] ?? []).reduce<Attempt | undefined>((best, a) => (!best || a.score / a.total > best.score / best.total ? a : best), undefined);

export const quizPassed = (p: AI901Progress, chapterId: string) => {
  const b = bestAttempt(p, `chapter:${chapterId}`);
  return !!b && b.score / b.total >= CHAPTER_PASS;
};

export const finalPassed = (p: AI901Progress) => {
  const b = bestAttempt(p, 'final');
  return !!b && b.score / b.total >= FINAL_PASS;
};

export const chapterLessonsDone = (p: AI901Progress, chapterId: string) => {
  const c = chapters.find((x) => x.id === chapterId)!;
  return c.lessons.filter((l) => isLessonDone(p, l.id)).length;
};

export const isChapterComplete = (p: AI901Progress, chapterId: string) => {
  const c = chapters.find((x) => x.id === chapterId)!;
  return chapterLessonsDone(p, chapterId) === c.lessons.length && quizPassed(p, chapterId);
};

/** Units: every lesson, every chapter quiz pass, and the final assessment pass. */
export function overallPct(p: AI901Progress) {
  const unitsTotal = totals.lessons + chapters.length + 1;
  const done =
    Object.values(p.lessons).filter((l) => l.completedAt).length +
    chapters.filter((c) => quizPassed(p, c.id)).length +
    (finalPassed(p) ? 1 : 0);
  return Math.round((done / unitsTotal) * 100);
}

export const courseCompleteEligible = (p: AI901Progress) => chapters.every((c) => isChapterComplete(p, c.id)) && finalPassed(p);

export interface TopicStat { chapterId: string; answered: number; correct: number; bank: number; accuracy: number | null; status: 'untested' | 'weak' | 'developing' | 'strong' }

export function topicStats(p: AI901Progress): TopicStat[] {
  return chapters.map((c) => {
    const qs = questionBank.filter((q) => q.chapterId === c.id);
    const answered = qs.filter((q) => p.answers[q.id]);
    const correct = answered.filter((q) => p.answers[q.id].correct).length;
    const accuracy = answered.length ? correct / answered.length : null;
    const status: TopicStat['status'] =
      accuracy === null || answered.length < 3 ? 'untested' : accuracy < 0.6 ? 'weak' : accuracy < 0.8 ? 'developing' : 'strong';
    return { chapterId: c.id, answered: answered.length, correct, bank: qs.length, accuracy, status };
  });
}

/** 0–100. Rewards both breadth (coverage of the bank) and accuracy. */
export function readinessScore(p: AI901Progress) {
  const stats = topicStats(p).filter((s) => s.chapterId !== 'revision');
  const parts = stats.map((s) => (s.accuracy ?? 0) * Math.min(1, s.answered / Math.max(4, s.bank * 0.6)));
  return Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100);
}

export const mistakes = (p: AI901Progress) => questionBank.filter((q) => p.answers[q.id] && !p.answers[q.id].correct);

/** Used by the shared course selector, which reads progress without the React store. */
export function readStoredPct(): number {
  return overallPct(load());
}
