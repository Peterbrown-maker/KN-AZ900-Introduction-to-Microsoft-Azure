import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { CinematicBackground } from '@/components/CinematicBackground';
import { Sidebar } from '@/components/Sidebar';
import { ChapterOpener } from '@/components/ChapterOpener';
import { ChapterComplete } from '@/components/ChapterComplete';
import { Slide } from '@/components/scenes/Slide';
import { ConceptCard } from '@/components/scenes/ConceptCard';
import { MemoryMoment } from '@/components/scenes/MemoryMoment';
import { ExamTrap } from '@/components/scenes/ExamTrap';
import { KnowledgeCheck } from '@/components/scenes/KnowledgeCheck';
import { ComparisonSceneView } from '@/components/scenes/ComparisonScene';
import { InteractionRouter } from '@/components/interactions/InteractionRouter';
import { FinalCompletion } from '@/components/FinalCompletion';
import { LandingPage } from '@/components/LandingPage';
import { chapters } from '@/data/chapters';
import type { Scene, ProgressState } from '@/types/course';

const STORAGE_KEY = 'az900-progress';
const LANDING_KEY = 'az900-landing-seen';

function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProgressState;
      return {
        completedChapters: parsed.completedChapters ?? [],
        currentChapter: parsed.currentChapter ?? 0,
        currentScene: parsed.currentScene ?? 0,
        knowledgeCheckResults: parsed.knowledgeCheckResults ?? {},
        assessmentScore: parsed.assessmentScore,
        totalAssessmentQuestions: parsed.totalAssessmentQuestions,
      };
    }
  } catch {
    // ignore
  }

  return {
    completedChapters: [],
    currentChapter: 0,
    currentScene: 0,
    knowledgeCheckResults: {},
  };
}

function App() {
  const [progress, setProgress] = useState<ProgressState>(loadProgress);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  // The landing page is now the front door of the course.
  // The learner can always enter the existing course engine with one click.
  const [showLanding, setShowLanding] = useState(() => {
    try {
      return localStorage.getItem(LANDING_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  const enterCourse = useCallback(() => {
    try {
      localStorage.setItem(LANDING_KEY, 'true');
    } catch {
      // ignore
    }
    setShowLanding(false);
    setShowFinal(false);
  }, []);

  const chapter = chapters[progress.currentChapter];
  const scene = chapter?.scenes[progress.currentScene];
  const isLastScene = progress.currentScene >= chapter.scenes.length - 1;
  const isLastChapter = progress.currentChapter >= chapters.length - 1;

  const goToScene = useCallback((chapterIdx: number, sceneIdx: number) => {
    setTransitioning(true);

    setTimeout(() => {
      setProgress((prev) => ({
        ...prev,
        currentChapter: chapterIdx,
        currentScene: sceneIdx,
      }));
      setTransitioning(false);
    }, 300);
  }, []);

  const nextScene = useCallback(() => {
    if (isLastScene) {
      setProgress((prev) => {
        const completed = prev.completedChapters.includes(prev.currentChapter)
          ? prev.completedChapters
          : [...prev.completedChapters, prev.currentChapter];

        if (isLastChapter) {
          setShowFinal(true);
          return { ...prev, completedChapters: completed };
        }

        const nextChapter = prev.currentChapter + 1;

        return {
          ...prev,
          completedChapters: completed,
          currentChapter: nextChapter,
          currentScene: 0,
        };
      });
    } else {
      goToScene(progress.currentChapter, progress.currentScene + 1);
    }
  }, [
    isLastScene,
    isLastChapter,
    goToScene,
    progress.currentChapter,
    progress.currentScene,
  ]);

  const prevScene = useCallback(() => {
    if (progress.currentScene > 0) {
      goToScene(progress.currentChapter, progress.currentScene - 1);
    } else if (progress.currentChapter > 0) {
      const prevChapter = progress.currentChapter - 1;
      goToScene(prevChapter, chapters[prevChapter].scenes.length - 1);
    }
  }, [goToScene, progress.currentChapter, progress.currentScene]);

  const selectChapter = useCallback((idx: number) => {
    goToScene(idx, 0);
    setShowFinal(false);
  }, [goToScene]);

  const restart = useCallback(() => {
    goToScene(0, 0);
    setShowFinal(false);
  }, [goToScene]);

  const handleKnowledgeCheck = useCallback((sceneId: string, correct: boolean) => {
    setProgress((prev) => ({
      ...prev,
      knowledgeCheckResults: {
        ...prev.knowledgeCheckResults,
        [sceneId]: correct,
      },
    }));
  }, []);

  const handleAssessmentComplete = useCallback((score: number, total: number) => {
    setProgress((prev) => ({
      ...prev,
      assessmentScore: score,
      totalAssessmentQuestions: total,
    }));
  }, []);

  const renderScene = (currentScene: Scene) => {
    if (!currentScene) return null;

    switch (currentScene.type) {
      case 'opener':
        return <ChapterOpener scene={currentScene} accent={chapter.accent} />;
      case 'slide':
        return <Slide scene={currentScene} accent={chapter.accent} />;
      case 'concept':
        return <ConceptCard scene={currentScene} />;
      case 'memory':
        return <MemoryMoment scene={currentScene} />;
      case 'exam-trap':
        return <ExamTrap scene={currentScene} />;
      case 'knowledge-check':
        return (
          <KnowledgeCheck
            scene={currentScene}
            onAnswer={(correct) => handleKnowledgeCheck(currentScene.id, correct)}
          />
        );
      case 'comparison':
        return <ComparisonSceneView scene={currentScene} />;
      case 'interaction':
        return (
          <InteractionRouter
            kind={currentScene.kind}
            description={currentScene.description}
            onAssessmentComplete={handleAssessmentComplete}
          />
        );
      case 'chapter-complete':
        return <ChapterComplete scene={currentScene} accent={chapter.accent} />;
      default:
        return null;
    }
  };

  // Landing page
  if (showLanding) {
    const hasProgress =
      progress.completedChapters.length > 0 ||
      progress.currentChapter > 0 ||
      progress.currentScene > 0;

    return (
      <LandingPage
        hasProgress={hasProgress}
        onStartLearning={enterCourse}
        onContinueLearning={enterCourse}
      />
    );
  }

  // Final course completion
  if (showFinal) {
    return (
      <div className="min-h-screen relative">
        <CinematicBackground />
        <FinalCompletion
          completedChapters={progress.completedChapters}
          assessmentScore={progress.assessmentScore}
          assessmentTotal={progress.totalAssessmentQuestions}
          onRestart={restart}
          onRetakeAssessment={() => {
            setShowFinal(false);
            const lastChapter = chapters.length - 1;
            const lastScene = chapters[lastChapter].scenes.length - 1;
            goToScene(lastChapter, lastScene);
          }}
        />
      </div>
    );
  }

  // Existing cinematic course engine
  return (
    <div className="min-h-screen flex relative">
      <CinematicBackground />

      <Sidebar
        currentChapter={progress.currentChapter}
        completedChapters={progress.completedChapters}
        onSelectChapter={selectChapter}
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-white/8 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            className="hidden lg:inline-flex p-2 rounded-lg hover:bg-white/5 transition-all"
            aria-label={sidebarCollapsed ? 'Show course navigation' : 'Hide course navigation'}
            aria-expanded={!sidebarCollapsed}
            aria-controls="course-sidebar"
            title={sidebarCollapsed ? 'Show course navigation' : 'Hide course navigation'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-gray-400" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: chapter.accent }}
            />
            <p className="text-sm font-semibold text-gray-300 truncate">
              Chapter {chapter.number} · {chapter.title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">
              Scene {progress.currentScene + 1} / {chapter.scenes.length}
            </span>

            <button
              onClick={() => setShowFinal(true)}
              className="text-xs px-3 py-1.5 rounded-lg glass-light text-gray-400 hover:text-gray-200 transition-all"
            >
              View Progress
            </button>
          </div>
        </header>

        <main
          className={`flex-1 overflow-y-auto ${
            sidebarCollapsed ? 'course-content-expanded' : ''
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${progress.currentChapter}-${progress.currentScene}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: transitioning ? 0 : 1,
                y: transitioning ? 20 : 0,
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderScene(scene)}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="sticky bottom-0 z-30 glass border-t border-white/8 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={prevScene}
              disabled={progress.currentChapter === 0 && progress.currentScene === 0}
              className="nav-btn text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-1.5">
              {chapter.scenes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToScene(progress.currentChapter, i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === progress.currentScene
                      ? 'w-6 bg-cyan-400'
                      : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to scene ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextScene}
              className="nav-btn text-cyan-400 hover:text-cyan-300"
            >
              <span className="hidden sm:inline">
                {isLastScene && !isLastChapter
                  ? 'Next Chapter'
                  : isLastScene && isLastChapter
                    ? 'Finish'
                    : 'Next'}
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;