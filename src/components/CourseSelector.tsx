import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { Course } from '@/types/course';

interface CourseSelectorProps {
  courses: Course[];
  onSelect: (courseId: Course['id']) => void;
}

export function CourseSelector({ courses, onSelect }: CourseSelectorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white tracking-tight text-glow mb-4"
          >
            Choose Your Path
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-400 max-w-xl mx-auto"
          >
            Two certification journeys. One immersive learning experience.
            Select a course to begin.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course, i) => {
            const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>>)[course.icon] ?? Icons.BookOpen;
            const completedKey = `${course.storageKey}-completed`;
            let progressPct = 0;
            try {
              const raw = localStorage.getItem(course.storageKey);
              if (raw) {
                const parsed = JSON.parse(raw);
                progressPct = Math.round((parsed.completedChapters?.length / course.chapters.length) * 100);
              }
            } catch {
              // ignore
            }

            return (
              <motion.button
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelect(course.id)}
                className="group relative glass rounded-2xl p-8 text-left overflow-hidden border border-white/10 hover:border-white/20 transition-all"
              >
                {/* Accent glow */}
                <div
                  className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ background: course.accent }}
                />

                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${course.accent}20`, border: `1px solid ${course.accent}30` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: course.accent }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{course.title}</h2>
                      <p className="text-sm text-gray-400">{course.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Icons.BookOpen className="w-3.5 h-3.5" />
                      {course.chapters.length} chapters
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Icons.Zap className="w-3.5 h-3.5" style={{ color: course.accent }} />
                      Interactive simulations
                    </div>
                  </div>

                  {/* Progress bar if started */}
                  {progressPct > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-500">Your progress</span>
                        <span className="font-semibold" style={{ color: course.accent }}>{progressPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: course.accent }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ delay: 0.8, duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: course.accent }}>
                    {progressPct > 0 ? 'Continue Learning' : 'Start Course'}
                    <Icons.ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-xs text-gray-600 mt-8"
        >
          Your progress is saved separately for each course. Switch anytime without losing your place.
        </motion.p>
      </div>
    </div>
  );
}
