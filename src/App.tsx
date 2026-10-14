import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
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
import { CourseSelector } from '@/components/CourseSelector';
import { courses, courseList } from '@/data/courses';
import type { Scene, ProgressState, Course, CourseId } from '@/types/course';
import Logo from '../assets/Logo.png';

const SELECTED_COURSE_KEY = 'selected-course';

function loadSelectedCourse(): CourseId | null {
  try {
    return (localStorage.getItem(SELECTED_COURSE_KEY) as CourseId) ?? null;
  } catch {
    return null;
  }
}

function loadProgress(storageKey: string): ProgressState {
  try {
    const raw = localStorage.getItem(storageKey);
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
  const [selectedCourseId, setSelectedCourseId] = useState<CourseId | null>(loadSelectedCourse);
  const course: Course | null = selectedCourseId ? courses[selectedCourseId] : null;
  const storageKey = course?.storageKey ?? 'az900-progress';

  const [progress, setProgress] = useState<ProgressState>(() =>
    course ? loadProgress(course.storageKey) : { completedChapters: [], currentChapter: 0, currentScene: 0, knowledgeCheckResults: {} }
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Save progress when it changes
  useEffect(() => {
    if (!course) return;
    try {
      localStorage.setItem(course.storageKey, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress, course]);

  const selectCourse = useCallback((courseId: CourseId) => {
    try {
      localStorage.setItem(SELECTED_COURSE_KEY, courseId);
    } catch {
      // ignore
    }
    setSelectedCourseId(courseId);
    setProgress(loadProgress(courses[courseId].storageKey));
    setShowFinal(false);
  }, []);

  const backToCourseSelect = useCallback(() => {
    try {
      localStorage.removeItem(SELECTED_COURSE_KEY);
    } catch {
      // ignore
    }
    setSelectedCourseId(null);
    setShowFinal(false);
  }, []);

  // Derived course/chapter/scene state and navigation callbacks
  const chapters = course?.chapters ?? [];
  const chapter = course && chapters[progress.currentChapter] ? chapters[progress.currentChapter] : ({} as any);
  const scene = chapter?.scenes ? chapter.scenes[progress.currentScene] : undefined;
  const isLastScene = !!chapter?.scenes && progress.currentScene >= chapter.scenes.length - 1;
  const isLastChapter = chapters.length > 0 && progress.currentChapter >= chapters.length - 1;

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
    setProgress((prev) => {
      const curChapter = prev.currentChapter;
      const curScene = prev.currentScene;
      const chs = course?.chapters ?? [];
      const curChapterObj = chs[curChapter];
      const lastSceneIdx = curChapterObj?.scenes ? curChapterObj.scenes.length - 1 : 0;
      const lastChapterIdx = chs.length - 1;

      if (curScene >= lastSceneIdx) {
        const completed = prev.completedChapters.includes(curChapter) ? prev.completedChapters : [...prev.completedChapters, curChapter];

        if (curChapter >= lastChapterIdx) {
          setShowFinal(true);
          return { ...prev, completedChapters: completed };
        }

        const nextChapter = curChapter + 1;
        return {
          ...prev,
          completedChapters: completed,
          currentChapter: nextChapter,
          currentScene: 0,
        };
      } else {
        // advance scene within same chapter
        return { ...prev, currentScene: curScene + 1 };
      }
    });
  }, [course]);

  const prevScene = useCallback(() => {
    setProgress((prev) => {
      const curChapter = prev.currentChapter;
      const curScene = prev.currentScene;
      if (curScene > 0) {
        return { ...prev, currentScene: curScene - 1 };
      } else if (curChapter > 0) {
        const prevChapter = curChapter - 1;
        const prevChapterScenes = course?.chapters?.[prevChapter]?.scenes ?? [];
        const prevSceneIdx = prevChapterScenes.length ? prevChapterScenes.length - 1 : 0;
        return { ...prev, currentChapter: prevChapter, currentScene: prevSceneIdx };
      }
      return prev;
    });
  }, [course]);

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
      knowledgeCheckResults: { ...prev.knowledgeCheckResults, [sceneId]: correct },
    }));
  }, []);

  const handleAssessmentComplete = useCallback((score: number, total: number) => {
    setProgress((prev) => ({
      ...prev,
      assessmentScore: score,
      totalAssessmentQuestions: total,
    }));
  }, []);

  const renderScene = (scene: Scene | undefined) => {
    if (!scene) return null;
    switch (scene.type) {
      case 'opener':
        return <ChapterOpener scene={scene} accent={chapter.accent} />;
      case 'slide':
        return <Slide scene={scene} accent={chapter.accent} />;
      case 'concept':
        return <ConceptCard scene={scene} />;
      case 'memory':
        return <MemoryMoment scene={scene} />;
      case 'exam-trap':
        return <ExamTrap scene={scene} />;
      case 'knowledge-check':
        return (
          <KnowledgeCheck
            scene={scene}
            onAnswer={(correct) => handleKnowledgeCheck(scene.id, correct)}
          />
        );
      case 'comparison':
        return <ComparisonSceneView scene={scene} />;
      case 'interaction':
        return (
          <InteractionRouter
            kind={scene.kind}
            description={scene.description}
            onAssessmentComplete={handleAssessmentComplete}
          />
        );
      case 'chapter-complete':
        return <ChapterComplete scene={scene} accent={chapter.accent} />;
      default:
        return null;
    }
  };

  // Course selector screen
  if (!course) {
    return (
      <div className="min-h-screen relative">
        <CinematicBackground />
        <CourseSelector courses={courseList} onSelect={selectCourse} />
      </div>
    );
  }

  if (showFinal) {
    return (
      <div className="min-h-screen relative">
        <CinematicBackground />
        <FinalCompletion
          course={course}
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
          onBackToCourseSelect={backToCourseSelect}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative">
      <CinematicBackground />
      <Sidebar
        course={course}
        currentChapter={progress.currentChapter}
        completedChapters={progress.completedChapters}
        onSelectChapter={selectChapter}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onBackToCourseSelect={backToCourseSelect}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass border-b border-white/8 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <img src={Logo} alt="Logo" className="w-8 h-8 mr-2 hidden sm:block" />
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

        {/* Scene content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${progress.currentChapter}-${progress.currentScene}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: transitioning ? 0 : 1, y: transitioning ? 20 : 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderScene(scene)}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom navigation */}
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
                      ? 'w-6'
                      : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                  style={i === progress.currentScene ? { background: course.accent } : {}}
                  aria-label={`Go to scene ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextScene}
              className="nav-btn hover:text-white"
              style={{ color: course.accent }}
            >
              <span className="hidden sm:inline">
                {isLastScene && !isLastChapter ? 'Next Chapter' : isLastScene && isLastChapter ? 'Finish' : 'Next'}
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
