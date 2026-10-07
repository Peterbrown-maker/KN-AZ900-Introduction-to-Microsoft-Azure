import { motion } from 'framer-motion';
import {
  ArrowRight, BookOpen, Brain, Cloud, Gamepad2, LockKeyhole, Play, Rocket,
  Shield, Sparkles, Target, Trophy, Network, Database, Server,
} from 'lucide-react';

/**
 * LOGO: import the file (a plain '../../assets/Logo.png' string will NOT work
 * inside src with Vite/CRA). Adjust the path to match this file's location.
 * Comment the import and set `const logo = ''` to show the placeholder instead.
 */
import logo from '../../assets/Logo.png';

interface LandingPageProps {
  onStartLearning: () => void;
  onContinueLearning?: () => void;
  hasProgress?: boolean;
}

const topics = [
  { icon: Cloud, title: 'Cloud Concepts', description: 'Build the foundation of how cloud computing works.', color: 'cyan' },
  { icon: Server, title: 'Azure Architecture', description: 'Explore regions, resources, subscriptions and zones.', color: 'blue' },
  { icon: Network, title: 'Compute & Networking', description: 'See VMs, containers, VNets, load balancing and more.', color: 'violet' },
  { icon: Database, title: 'Storage & Data', description: 'Understand storage, databases, redundancy and data flow.', color: 'emerald' },
  { icon: LockKeyhole, title: 'Identity & Security', description: 'Experience Entra ID, MFA, RBAC, Zero Trust and protection.', color: 'pink' },
  { icon: Target, title: 'Pricing & Reliability', description: 'Learn costs, SLAs, redundancy and cloud reliability.', color: 'amber' },
];

const colorMap: Record<string, string> = {
  cyan: 'from-cyan-500/20 to-cyan-400/5 border-cyan-400/30 text-cyan-300',
  blue: 'from-blue-500/20 to-blue-400/5 border-blue-400/30 text-blue-300',
  violet: 'from-violet-500/20 to-violet-400/5 border-violet-400/30 text-violet-300',
  emerald: 'from-emerald-500/20 to-emerald-400/5 border-emerald-400/30 text-emerald-300',
  pink: 'from-pink-500/20 to-pink-400/5 border-pink-400/30 text-pink-300',
  amber: 'from-amber-500/20 to-amber-400/5 border-amber-400/30 text-amber-300',
};

/** Shows your PNG, or a dashed placeholder box while `logo` is empty. */
function Logo({ className = 'h-12 w-auto', fallback }: { className?: string; fallback?: string }) {
  return logo ? (
    <img src={logo} alt="Logo" className={className} />
  ) : (
    <div
      aria-label="Logo placeholder"
      className="flex h-12 w-32 items-center justify-center rounded-2xl border border-dashed border-cyan-300/40 text-[10px] font-semibold uppercase tracking-widest text-cyan-200/60"
    >
      {fallback ?? 'Your logo'}
    </div>
  );
}

export function LandingPage({ onStartLearning, onContinueLearning, hasProgress = false }: LandingPageProps) {
  const start = onContinueLearning ?? onStartLearning;

  return (
    <div className="min-h-screen overflow-hidden bg-[#030817] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute right-[-180px] top-[15%] h-[620px] w-[620px] rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute bottom-[-220px] left-[30%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
        <motion.div className="absolute left-[12%] top-[18%] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_18px_5px_rgba(34,211,238,.35)]"
          animate={{ y: [0, -30, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />
        <motion.div className="absolute right-[18%] top-[32%] h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_18px_5px_rgba(167,139,250,.35)]"
          animate={{ y: [0, 35, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} />
        <motion.div className="absolute left-[45%] top-[10%] h-1 w-1 rounded-full bg-blue-300"
          animate={{ x: [0, 50, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} />
      </div>

      {/* Navigation */}
      <header className="relative z-20 border-b border-white/10 bg-[#030817]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button onClick={onStartLearning} className="group flex items-center gap-3 text-left" aria-label="AZ-900 home">
            <Logo />
            <div>
              <div className="text-xl font-black tracking-tight">AZ-<span className="text-cyan-400">900</span></div>
              <div className="text-[9px] font-semibold tracking-[0.28em] text-slate-400">MICROSOFT AZURE</div>
            </div>
          </button>

          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#experience" className="transition hover:text-white">Experience</a>
            <a href="#curriculum" className="transition hover:text-white">Curriculum</a>
            <a href="#how-it-works" className="transition hover:text-white">How it works</a>
          </nav>

          <button onClick={start}
            className="hidden rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/60 hover:bg-cyan-400/20 sm:block">
            {hasProgress ? 'Continue Learning' : 'Start Learning'}
          </button>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:py-20">
          <div className="relative">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-bold tracking-[0.18em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              AZ-900 · INTRODUCTION TO MICROSOFT AZURE
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
              className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Don't just learn Azure.
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">Experience it.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              A cinematic, interactive way to learn Azure Fundamentals. Explore concepts through animated stories,
              visual simulations, unexpected interactions and game-like challenges.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button onClick={onStartLearning}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-7 py-4 font-bold text-slate-950 shadow-[0_0_45px_rgba(34,211,238,.2)] transition hover:scale-[1.02]">
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Play className="h-5 w-5 fill-current" />
                  {hasProgress ? 'Continue Learning' : 'Start Learning'}
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </span>
                <motion.div className="absolute inset-y-0 -left-20 w-20 bg-white/40 blur-xl"
                  animate={{ x: [0, 380] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }} />
              </button>
              <a href="#curriculum"
                className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] px-7 py-4 font-semibold text-slate-200 backdrop-blur transition hover:border-white/30 hover:bg-white/[0.08]">
                <BookOpen className="h-5 w-5" /> Explore the Course
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[['14', 'Learning Chapters'], ['180+', 'Interactive Scenes'], ['100%', 'Visual Learning']].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur">
                  <div className="text-2xl font-black text-cyan-300">{value}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-400">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Interactive visual */}
          <div id="experience" className="relative flex min-h-[520px] items-center justify-center">
            <motion.div className="absolute h-[420px] w-[420px] rounded-full border border-cyan-300/10"
              animate={{ rotate: 360 }} transition={{ duration: 35, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="absolute h-[330px] w-[330px] rounded-full border border-violet-300/10"
              animate={{ rotate: -360 }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }} />

            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 w-full max-w-[560px]">
              <div className="absolute inset-8 rounded-[40px] bg-cyan-400/10 blur-[70px]" />
              <div className="relative overflow-hidden rounded-[36px] border border-white/15 bg-gradient-to-br from-[#0a1731]/95 via-[#071027]/95 to-[#160b31]/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Your Azure World</div>
                    <div className="mt-1 text-sm text-slate-400">Explore. Interact. Understand.</div>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_10px_#a78bfa]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
                  </div>
                </div>

                <div className="relative flex min-h-[350px] items-center justify-center">
                  {/* central core: your logo goes here */}
                  <motion.div whileHover={{ scale: 1.06, rotate: 2 }}
                    className="relative z-20 flex h-36 w-36 cursor-pointer items-center justify-center rounded-[34px] border border-cyan-300/50 bg-gradient-to-br from-cyan-300/25 to-blue-600/25 p-6 shadow-[0_0_70px_rgba(34,211,238,.22)]">
                    <div className="absolute inset-3 rounded-[26px] border border-white/10" />
                    {logo ? (
                      <img src={logo} alt="Logo" className="relative max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-center text-[10px] font-semibold uppercase tracking-widest text-cyan-200/60">Logo space</span>
                    )}
                  </motion.div>

                  {[
                    { icon: Cloud, label: 'Cloud', x: '4%', y: '13%' },
                    { icon: Network, label: 'Network', x: '69%', y: '7%' },
                    { icon: Shield, label: 'Security', x: '76%', y: '61%' },
                    { icon: Database, label: 'Storage', x: '6%', y: '67%' },
                    { icon: Brain, label: 'AI + IoT', x: '40%', y: '79%' },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div key={item.label} className="absolute z-20" style={{ left: item.x, top: item.y }}
                        animate={{ y: [0, index % 2 ? -7 : 7, 0] }}
                        transition={{ duration: 3.5 + index * 0.35, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}>
                        <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/70 px-3 py-2 shadow-xl backdrop-blur">
                          <Icon className="h-4 w-4 text-cyan-300" />
                          <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                        </div>
                      </motion.div>
                    );
                  })}

                  <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 500 350" fill="none">
                    <motion.path d="M70 70 C170 110 180 160 250 175" stroke="url(#line1)" strokeWidth="1.5" strokeDasharray="6 8"
                      animate={{ strokeDashoffset: [0, -56] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
                    <motion.path d="M410 62 C330 100 325 150 275 175" stroke="url(#line2)" strokeWidth="1.5" strokeDasharray="6 8"
                      animate={{ strokeDashoffset: [0, -56] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }} />
                    <motion.path d="M390 250 C335 230 315 205 275 190" stroke="url(#line3)" strokeWidth="1.5" strokeDasharray="6 8"
                      animate={{ strokeDashoffset: [0, -56] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }} />
                    <defs>
                      <linearGradient id="line1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#22d3ee" stopOpacity=".1" /><stop offset="1" stopColor="#22d3ee" stopOpacity=".8" /></linearGradient>
                      <linearGradient id="line2" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#60a5fa" stopOpacity=".1" /><stop offset="1" stopColor="#818cf8" stopOpacity=".8" /></linearGradient>
                      <linearGradient id="line3" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a78bfa" stopOpacity=".1" /><stop offset="1" stopColor="#f472b6" stopOpacity=".8" /></linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[['SEE', 'Animated concepts'], ['TOUCH', 'Interactive scenes'], ['MASTER', 'Knowledge checks']].map(([title, text]) => (
                    <div key={title} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="text-[10px] font-black tracking-[0.18em] text-cyan-300">{title}</div>
                      <div className="mt-1 text-[10px] leading-4 text-slate-500">{text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Learning philosophy */}
        <section id="how-it-works" className="border-y border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">A different way to learn</div>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Learn by <span className="text-cyan-300">seeing it happen.</span></h2>
              <p className="mt-5 text-slate-400">Every major Azure concept becomes a visual story, a simulation, an interaction or a challenge — so the idea sticks.</p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {[
                { icon: Sparkles, number: '01', title: 'SEE', text: 'Watch cloud systems, networks, storage and security come alive.' },
                { icon: Gamepad2, number: '02', title: 'INTERACT', text: 'Break servers, reroute traffic, connect services and test decisions.' },
                { icon: Trophy, number: '03', title: 'MASTER', text: 'Use memory moments, exam traps and scenario challenges to lock it in.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.number} whileHover={{ y: -7 }}
                    className="group rounded-3xl border border-white/10 bg-white/[0.035] p-7 backdrop-blur transition hover:border-cyan-300/25 hover:bg-white/[0.055]">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300"><Icon className="h-5 w-5" /></div>
                      <span className="text-sm font-black text-slate-700">{item.number}</span>
                    </div>
                    <div className="mt-7 text-sm font-black tracking-[0.25em] text-cyan-300">{item.title}</div>
                    <p className="mt-3 leading-7 text-slate-400">{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section id="curriculum" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">The complete journey</div>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Your Azure map.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-slate-400">From cloud concepts to identity, security, governance, pricing, reliability, AI, IoT and edge — everything connects.</p>
            </div>
            <button onClick={start}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400/20 md:self-auto">
              Enter the journey <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <motion.div key={topic.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.015 }}
                  className={`rounded-3xl border bg-gradient-to-br p-6 ${colorMap[topic.color]}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-current/20 bg-black/20"><Icon className="h-5 w-5" /></div>
                    <span className="text-xs font-bold text-white/30">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white">{topic.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{topic.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-20 sm:px-8">
          <motion.div whileHover={{ scale: 1.005 }}
            className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-cyan-300/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 p-8 sm:p-12">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-[80px]" />
            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2 text-cyan-300"><Rocket className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Your journey starts here</span></div>
                <h2 className="mt-3 text-3xl font-black sm:text-4xl">Build your Azure mental model.</h2>
                <p className="mt-3 max-w-2xl text-slate-400">Explore the concepts. Interact with the systems. Complete the journey.</p>
              </div>
              <button onClick={onStartLearning}
                className="group flex shrink-0 items-center gap-3 rounded-2xl bg-white px-6 py-4 font-black text-slate-950 transition hover:scale-[1.02]">
                Start AZ-900 <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-slate-600">
        AZ-900 · Introduction to Microsoft Azure · Learn · Explore · Master
      </footer>
    </div>
  );
}