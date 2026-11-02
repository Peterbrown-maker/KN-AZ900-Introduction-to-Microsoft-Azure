import type { Block, Chapter, Lesson, Question } from '../types';
import { ch01 } from './ch01';
import { ch02 } from './ch02';
import { ch03 } from './ch03';
import { ch04 } from './ch04';
import { ch05 } from './ch05';
import { ch06 } from './ch06';
import { ch07 } from './ch07';
import { ch08 } from './ch08';
import { ch09 } from './ch09';
import { ch10 } from './ch10';
import { ch11 } from './ch11';
import { ch12 } from './ch12';
import { ch13 } from './ch13';
import { ch14 } from './ch14';

export const chapters: Chapter[] = [ch01, ch02, ch03, ch04, ch05, ch06, ch07, ch08, ch09, ch10, ch11, ch12, ch13, ch14];

export const course = {
  code: 'AI-901T00-A',
  title: 'Introduction to AI in Azure',
  level: 'Beginner',
  certification: 'Microsoft Certified: Azure AI Fundamentals (Exam AI-901)',
  description:
    'A cinematic, interactive journey through the fundamentals of artificial intelligence and the Azure services — Microsoft Foundry, Foundry Tools and Foundry IQ — that bring AI solutions to life.',
  outcomes: [
    'Explain how machine learning, deep learning and generative AI work — down to tokens, embeddings and attention.',
    'Write effective system and user prompts, and configure model parameters.',
    'Design retrieval-augmented generation and agent solutions with the right safeguards.',
    'Identify text, speech, vision and information-extraction workloads and techniques.',
    'Choose, deploy and call the right Microsoft Foundry capability for a scenario.',
    'Apply the six responsible AI principles to real decisions.',
  ],
};

export interface LessonRef {
  lesson: Lesson;
  chapter: Chapter;
  index: number; // global order
}

export const lessonRefs: LessonRef[] = chapters.flatMap((chapter) => chapter.lessons.map((lesson) => ({ lesson, chapter, index: 0 })));
lessonRefs.forEach((r, i) => (r.index = i));

export const lessonById = new Map(lessonRefs.map((r) => [r.lesson.id, r]));
export const chapterById = new Map(chapters.map((c) => [c.id, c]));

export const totals = {
  chapters: chapters.length,
  lessons: lessonRefs.length,
  minutes: lessonRefs.reduce((sum, r) => sum + r.lesson.minutes, 0),
};

// Question bank: every lesson check and chapter quiz question, tagged with its origin.
export const questionBank: Question[] = chapters.flatMap((c) => [
  ...c.lessons.flatMap((l) => l.checks.map((q) => ({ ...q, chapterId: c.id, lessonId: l.id }))),
  ...c.quiz.map((q) => ({ ...q, chapterId: c.id, lessonId: q.lessonId ?? c.lessons[0]?.id })),
]);
export const questionById = new Map(questionBank.map((q) => [q.id, q]));

export const chapterQuizQuestions = (chapterId: string): Question[] => {
  const c = chapterById.get(chapterId);
  if (!c) return [];
  return questionBank.filter((q) => q.chapterId === chapterId && c.quiz.some((cq) => cq.id === q.id));
};

// ---------- Plain text for search ----------
export const stripMarkup = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\*(.+?)\*/g, '$1');

function blockText(b: Block): string {
  switch (b.kind) {
    case 'p': case 'h': case 'formula': return b.text;
    case 'list': return b.items.join(' ');
    case 'table': return [b.caption ?? '', b.headers.join(' '), ...b.rows.map((r) => r.join(' '))].join(' ');
    case 'callout': return `${b.title ?? ''} ${b.text}`;
    case 'steps': return b.items.map((i) => `${i.title} ${i.text}`).join(' ');
    case 'code': return `${b.caption ?? ''} ${b.code}`;
    case 'sim': return b.caption ?? '';
  }
}

export interface SearchDoc {
  lessonId: string;
  chapterId: string;
  title: string;
  section: string;
  text: string;
}

export const searchDocs: SearchDoc[] = lessonRefs.flatMap(({ lesson, chapter }) => {
  const docs: SearchDoc[] = [];
  let section = 'Introduction';
  let buf: string[] = [lesson.intro, ...lesson.objectives];
  const flush = () => {
    if (buf.length) docs.push({ lessonId: lesson.id, chapterId: chapter.id, title: lesson.title, section, text: stripMarkup(buf.join(' ')) });
    buf = [];
  };
  for (const b of lesson.blocks) {
    if (b.kind === 'h') { flush(); section = b.text; continue; }
    buf.push(blockText(b));
  }
  flush();
  if (lesson.terms?.length) docs.push({ lessonId: lesson.id, chapterId: chapter.id, title: lesson.title, section: 'Key terms', text: lesson.terms.map((t) => `${t.term}: ${t.def}`).join(' ') });
  if (lesson.traps?.length) docs.push({ lessonId: lesson.id, chapterId: chapter.id, title: lesson.title, section: 'Exam traps', text: lesson.traps.map((t) => `${t.claim} ${t.truth}`).join(' ') });
  docs.push({ lessonId: lesson.id, chapterId: chapter.id, title: lesson.title, section: 'Recap', text: stripMarkup([...lesson.recap, lesson.memory ?? ''].join(' ')) });
  return docs;
});

// ---------- Glossary ----------
export interface GlossaryEntry { term: string; def: string; lessonId: string; chapterId: string }

const seen = new Set<string>();
export const glossary: GlossaryEntry[] = lessonRefs
  .flatMap(({ lesson, chapter }) => (lesson.terms ?? []).map((t) => ({ ...t, lessonId: lesson.id, chapterId: chapter.id })))
  .filter((g) => {
    const k = g.term.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  })
  .sort((a, b) => a.term.localeCompare(b.term));
