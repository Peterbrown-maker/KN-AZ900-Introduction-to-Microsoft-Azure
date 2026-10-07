import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { chapters } from '@/data/chapters';

interface SidebarProps {
  currentChapter: number;
  completedChapters: number[];
  onSelectChapter: (index: number) => void;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

export function Sidebar({
  currentChapter,
  completedChapters,
  onSelectChapter,
  isOpen,
  isCollapsed,
  onClose,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        id="course-sidebar"
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 glass z-50 lg:z-30 transition-[transform,width,opacity,flex-basis] duration-300 flex flex-col shrink-0 overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed
            ? 'lg:!w-0 lg:!basis-0 lg:min-w-0 lg:opacity-0 lg:pointer-events-none lg:border-0'
            : 'lg:opacity-100'
        }`}
      >
        <div className="p-6 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center shadow-lg shadow-azure-500/30">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                <path d="M6 9l6-6 6 6-1.5 1.5L13 7v12h-2V7L7.5 10.5 6 9z" transform="rotate(180 12 12)" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">AZ-900</h2>
              <p className="text-xs text-gray-400">Azure Fundamentals</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4">
          <p className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Journey</p>
          <nav className="space-y-1">
            {chapters.map((ch, i) => {
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
                      ? 'bg-azure-500/15 border border-azure-400/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : isCurrent
                        ? 'bg-azure-500/20 text-azure-300 border border-azure-400/40 animate-pulse-slow'
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
                      className="w-1.5 h-1.5 rounded-full bg-azure-400"
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
            <span className="text-azure-300 font-semibold">
              {completedChapters.length} / {chapters.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-azure-400 to-azure-600"
              initial={{ width: 0 }}
              animate={{ width: `${(completedChapters.length / chapters.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
