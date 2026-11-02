import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowLeft, Menu, X, Sparkles, Search } from 'lucide-react';
import { CinematicBackground } from '@/components/CinematicBackground';
import { useRoute, navigate, type Route } from './router';
import { Home } from './pages/Home';
import { Prologue } from './pages/Prologue';
import { ChapterPage, QuizPage, PracticePage, FinalPage, ReviewPage, NotesPage, GlossaryPage, GuidePage, ProgressPage, CompletePage } from './pages/Pages';
import { LessonView } from './components/LessonView';
import { lessonById, chapterById, course } from './data';
import { useProgress, overallPct } from './progress';

const NNLab = lazy(() => import('./nnlab/NNLab'));

const NAV: { label: string; route: Route; match: Route['view'][] }[] = [
  { label: 'Course', route: { view: 'home' }, match: ['home', 'chapter', 'lesson', 'quiz'] },
  { label: 'NN Lab', route: { view: 'lab' }, match: ['lab'] },
  { label: 'Practice', route: { view: 'practice' }, match: ['practice'] },
  { label: 'Final', route: { view: 'final' }, match: ['final'] },
  { label: 'Review', route: { view: 'review' }, match: ['review'] },
  { label: 'Notes', route: { view: 'notes' }, match: ['notes'] },
  { label: 'Glossary', route: { view: 'glossary' }, match: ['glossary'] },
  { label: 'Study guide', route: { view: 'guide' }, match: ['guide'] },
  { label: 'Progress', route: { view: 'progress' }, match: ['progress', 'complete'] },
];

function titleFor(r: Route) {
  if (r.view === 'lesson') return lessonById.get(r.id)?.lesson.title;
  if (r.view === 'chapter' || r.view === 'quiz') return chapterById.get(r.id)?.title;
  return NAV.find((n) => n.match.includes(r.view))?.label;
}

export default function AI901App({ onBack }: { onBack: () => void }) {
  const route = useRoute();
  const p = useProgress();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = `${titleFor(route) ?? 'Course'} · AI-901 Introduction to AI in Azure`;
    return () => { document.title = prev; };
  }, [route]);
  useEffect(() => setMenu(false), [route]);

  const leave = () => {
    if (window.location.hash.startsWith('#/ai901')) history.replaceState(null, '', window.location.pathname + window.location.search);
    onBack();
  };

  let page: React.ReactNode;
  switch (route.view) {
    case 'lesson': page = <LessonView id={route.id} />; break;
    case 'chapter': page = <ChapterPage id={route.id} />; break;
    case 'quiz': page = <QuizPage id={route.id} />; break;
    case 'practice': page = <PracticePage />; break;
    case 'final': page = <FinalPage />; break;
    case 'review': page = <ReviewPage />; break;
    case 'notes': page = <NotesPage q={route.q} />; break;
    case 'glossary': page = <GlossaryPage />; break;
    case 'guide': page = <GuidePage />; break;
    case 'progress': page = <ProgressPage />; break;
    case 'complete': page = <CompletePage />; break;
    case 'lab': page = <Suspense fallback={<p className="text-gray-400">Loading the neural network lab…</p>}><NNLab /></Suspense>; break;
    default: page = <Home />;
  }

  return (
    <div className="ai901 min-h-screen relative" style={{ ['--accent' as string]: '#22d3ee' }}>
      <CinematicBackground />
      <a href="#ai-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] ai-btn">Skip to content</a>
      <header className="sticky z-40 glass border-b border-white/8 ai-noprint" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={leave} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white shrink-0" aria-label="Back to all courses"><ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">All courses</span></button>
          <span className="w-px h-6 bg-white/10" />
          <button onClick={() => navigate({ view: 'home' })} className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{ background: 'linear-gradient(135deg, #22d3ee55, #a78bfa55)' }}><Sparkles className="w-4 h-4 text-white" /></span>
            <span className="text-left min-w-0"><span className="block text-sm font-bold text-white leading-tight">AI-901</span><span className="block text-[10px] text-gray-400 truncate">{course.title}</span></span>
          </button>
          <nav className="hidden xl:flex items-center gap-0.5 ml-4" aria-label="AI-901 sections">
            {NAV.map((n) => <button key={n.label} onClick={() => navigate(n.route)} aria-current={n.match.includes(route.view) ? 'page' : undefined} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${n.match.includes(route.view) ? 'text-white bg-white/[0.08]' : 'text-gray-400 hover:text-white'}`}>{n.label}</button>)}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => navigate({ view: 'notes' })} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white" aria-label="Search notes"><Search className="w-4 h-4" /></button>
            <span className="hidden sm:flex items-center gap-2 text-xs text-gray-400"><span className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden"><span className="block h-full bg-cyan-400" style={{ width: `${overallPct(p)}%` }} /></span>{overallPct(p)}%</span>
            <button className="xl:hidden p-2 rounded-lg hover:bg-white/5" onClick={() => setMenu(!menu)} aria-label="Open menu" aria-expanded={menu}>{menu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
        {menu && (
          <nav className="xl:hidden border-t border-white/8 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-1" aria-label="AI-901 sections">
            {NAV.map((n) => <button key={n.label} onClick={() => navigate(n.route)} className={`px-3 py-2 rounded-lg text-sm text-left ${n.match.includes(route.view) ? 'text-white bg-white/[0.08]' : 'text-gray-300'}`}>{n.label}</button>)}
          </nav>
        )}
      </header>
      <main id="ai-main" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24">{page}</main>
      {route.view === 'prologue' && <Prologue />}
    </div>
  );
}
