import { motion } from 'framer-motion';
import { Check, ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { Course } from '@/types/course';

interface SidebarProps {
  course: Course;
  currentChapter: number;
  completedChapters: number[];
  onSelectChapter: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
  onBackToCourseSelect: () => void;
}

export function Sidebar({ course, currentChapter, completedChapters, onSelectChapter, isOpen, onClose, onBackToCourseSelect }: SidebarProps) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>>)[course.icon] ?? Icons.BookOpen;
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 glass z-50 lg:z-30 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-white/8 shrink-0">
          <button
            onClick={onBackToCourseSelect}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> All Courses
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${course.accent}40, ${course.accent}60)`,
                boxShadow: `0 4px 20px ${course.accent}30`,
              }}
            >
              <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">{course.title}</h2>
              <p className="text-xs text-gray-400">{course.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4">
          <p className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Journey</p>
          <nav className="space-y-1">
            {course.chapters.map((ch, i) => {
              const isCompleted = completedChapters.includes(i);
              const isCurrent = i === currentChapter;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    onSelectChapter(i);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                    isCurrent
                        ? `bg-${course.id === 'az900' ? 'azure' : 'emerald'}-500/15 border-${course.id === 'az900' ? 'azure' : 'emerald'}-400/30`
                        : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : isCurrent
                        ? `bg-${course.id === 'az900' ? 'azure' : 'emerald'}-500/20 text-${course.id === 'az900' ? 'azure' : 'emerald'}-300 border border-${course.id === 'az900' ? 'azure' : 'emerald'}-400/40 animate-pulse-slow`
                        : 'bg-white/5 text-gray-500 border border-white/10'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : ch.number}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium truncate ${
                        isCurrent ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {ch.shortTitle}
                    </p>
                  </div>
                  {isCurrent && (
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: course.accent }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/8 shrink-0">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span className="font-semibold" style={{ color: course.accent }}>
              {completedChapters.length} / {course.chapters.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(to right, ${course.accent}cc, ${course.accent})` }}
              initial={{ width: 0 }}
              animate={{ width: `${(completedChapters.length / course.chapters.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
