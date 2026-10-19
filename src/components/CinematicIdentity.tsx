import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * CinematicIdentity
 * Active Directory -> Microsoft Entra ID -> Azure RBAC, told in six chapters.
 *
 * Design principles for this version:
 *  - One idea per chapter, with its title + explanation in real HTML (readable, selectable)
 *    instead of a 14px caption squeezed into the SVG.
 *  - Every chapter has ONE clean target layout; users glide between layouts.
 *  - The timeline is segmented by chapter: click to jump, click inside a segment to scrub.
 *  - Controls live in their own bar and never overlap the scene.
 *  - Keyboard: Space = play/pause, ← / → = previous/next chapter, Esc = close.
 *  - Time engine is a single ref-based clock (no stale closures, no pause bookkeeping).
 */

const CHAPTER_MS = 10000;
const SETTLE = 0.3; // fraction of each chapter spent transitioning from the previous layout

type Props = {
  onClose?: () => void;
  reducedMotionBehavior?: 'static-endframe' | 'still-timeline' | 'shortened';
  pageMode?: boolean;
};

// ---------------------------------------------------------------- data

const DEPTS = [
  { label: 'Developers', color: '#60a5fa', role: 'Contributor', scope: 'Resource group · rg-app' },
  { label: 'Finance', color: '#fbbf24', role: 'Cost Mgmt Reader', scope: 'Subscription · prod' },
  { label: 'HR', color: '#f472b6', role: 'Reader', scope: 'Resource · st-hr-docs' },
  { label: 'Operations', color: '#4ade80', role: 'Contributor', scope: 'Resource group · rg-ops' },
  { label: 'IT Admins', color: '#a78bfa', role: 'Owner', scope: 'Subscription · prod' },
  { label: 'Management', color: '#f87171', role: 'Reader', scope: 'Management group · mg-corp' },
];

const CHAPTERS = [
  {
    short: 'Chaos',
    title: 'The problem: identity chaos',
    body: 'Every person has hand-assigned permissions. Access drifts, duplicates and goes stale, and nobody can say who can reach what.',
  },
  {
    short: 'AD',
    title: 'Active Directory adds structure',
    body: 'Domain controllers authenticate users. Organisational Units (OUs) organise them so you can delegate admin and apply Group Policy.',
  },
  {
    short: 'Groups',
    title: 'Security groups carry the permissions',
    body: 'OUs organise objects; security groups grant access. Assign permissions once to a group and reuse them for every member.',
  },
  {
    short: 'Sync',
    title: 'Hybrid identity: sync to Microsoft Entra ID',
    body: 'Entra Connect syncs users and groups from AD to the cloud, so one identity works on-premises and in Azure.',
  },
  {
    short: 'RBAC',
    title: 'Azure RBAC: role + scope',
    body: 'Assign a role to a group at a scope. Permissions inherit downward: management group → subscription → resource group → resource.',
  },
  {
    short: 'Secure',
    title: 'Secure it: MFA, Conditional Access, PIM',
    body: 'Verify sign-ins, enforce policy, make privilege just-in-time and review access regularly. From identity chaos to control.',
  },
];

const PER_DEPT = 8;
const N_NODES = DEPTS.length * PER_DEPT;
const TOTAL_MS = CHAPTERS.length * CHAPTER_MS;

// ---------------------------------------------------------------- math

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};
const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// ---------------------------------------------------------------- layouts (one per chapter)

const rowY = (d: number) => 150 + d * 52;
const clusterCenter = (d: number, ch: number) => ({
  x: 120 + (d % 3) * 120 + (ch >= 3 ? 480 : 0),
  y: 190 + Math.floor(d / 3) * 150,
});

const LAYOUTS: { x: number; y: number }[][] = CHAPTERS.map((_, ch) =>
  Array.from({ length: N_NODES }, (_, i) => {
    const d = i % DEPTS.length;
    const k = Math.floor(i / DEPTS.length);
    if (ch === 0) return { x: 70 + hash(i) * 820, y: 120 + hash(i + 99) * 320 };
    if (ch === 1) return { x: 200 + k * 28, y: rowY(d) };
    if (ch === 2 || ch === 3) {
      const c = clusterCenter(d, ch);
      const a = (k / PER_DEPT) * Math.PI * 2 - Math.PI / 2;
      return { x: c.x + Math.cos(a) * 30, y: c.y + Math.sin(a) * 30 };
    }
    return { x: 190 + k * 22, y: rowY(d) };
  })
);

// ---------------------------------------------------------------- icons

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d={d} />
  </svg>
);
const PLAY = 'M8 5v14l11-7z';
const PAUSE = 'M6 5h4v14H6zM14 5h4v14h-4z';
const REPLAY = 'M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z';
const CLOSE = 'M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z';

// ---------------------------------------------------------------- component

export default function CinematicIdentity({
  onClose,
  reducedMotionBehavior = 'still-timeline',
  pageMode = false,
}: Props) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const initialTime = prefersReduced && reducedMotionBehavior === 'static-endframe' ? TOTAL_MS : 0;
  const [time, setTime] = useState(initialTime);
  const [playing, setPlaying] = useState(!prefersReduced);
  const [explainer, setExplainer] = useState(false);
  const timeRef = useRef(initialTime);
  const lastRef = useRef<number | null>(null);

  // --- clock
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    lastRef.current = null;
    const speed = prefersReduced && reducedMotionBehavior === 'shortened' ? 2.5 : 1;
    const tick = (ts: number) => {
      if (lastRef.current == null) lastRef.current = ts;
      const dt = ts - lastRef.current;
      lastRef.current = ts;
      timeRef.current = Math.min(TOTAL_MS, timeRef.current + dt * speed);
      setTime(timeRef.current);
      if (timeRef.current >= TOTAL_MS) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, prefersReduced, reducedMotionBehavior]);

  const seek = useCallback((ms: number) => {
    timeRef.current = clamp(ms, 0, TOTAL_MS);
    lastRef.current = null;
    setExplainer(false);
    setTime(timeRef.current);
  }, []);

  const togglePlay = useCallback(() => {
    if (timeRef.current >= TOTAL_MS) seek(0);
    setPlaying((p) => !p);
  }, [seek]);

  const goChapter = useCallback(
    (i: number) => {
      const c = clamp(i, 0, CHAPTERS.length - 1);
      seek(c * CHAPTER_MS + (c === 0 ? 0 : SETTLE * CHAPTER_MS)); // land on the settled layout
    },
    [seek]
  );

  // --- derived scene state
  const idx = Math.min(CHAPTERS.length - 1, Math.floor(time / CHAPTER_MS));
  const local = (time - idx * CHAPTER_MS) / CHAPTER_MS;
  const prev = Math.max(0, idx - 1);
  const e = idx === 0 ? 1 : ease(clamp(local / SETTLE));
  const at = (arr: number[]) => lerp(arr[prev], arr[idx], e);

  // --- keyboard
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        if (explainer) setExplainer(false);
        else onClose?.();
      } else if (ev.key === 'ArrowRight') goChapter(idx + 1);
      else if (ev.key === 'ArrowLeft') goChapter(idx - 1);
      else if (ev.key === ' ' && !(ev.target instanceof HTMLButtonElement)) {
        ev.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, goChapter, togglePlay, onClose, explainer]);

  const ended = time >= TOTAL_MS;

  // --- visibility curves, one value per chapter
  const vAD = at([0, 1, 1, 0.3, 0, 0]);
  const vEntra = at([0, 0, 0, 1, 0, 0]);
  const vAzure = at([0, 0, 0, 0, 1, 1]);
  const vOU = at([0, 1, 0, 0, 0, 0]);
  const vCluster = at([0, 0, 1, 1, 0, 0]);
  const vRows = at([0, 0, 0, 0, 1, 1]);
  const vColor = at([0, 1, 1, 1, 1, 1]);
  const vChaos = at([1, 0, 0, 0, 0, 0]);
  const vSecure = at([0, 0, 0, 0, 0, 1]);
  const vSync = at([0, 0, 0, 1, 0, 0]);
  const drift = at([6, 0, 0, 0, 0, 0]);

  const nodePos = (i: number) => {
    const a = LAYOUTS[prev][i];
    const b = LAYOUTS[idx][i];
    return {
      x: lerp(a.x, b.x, e) + drift * Math.sin(time / 700 + i * 1.7),
      y: lerp(a.y, b.y, e) + drift * Math.cos(time / 900 + i * 2.3),
    };
  };

  const chapter = CHAPTERS[idx];

  return (
    <div
      className={`fixed inset-0 z-[60] ${pageMode ? '' : 'flex items-center justify-center p-4'}`}
      style={{ background: pageMode ? '#050b18' : undefined }}
      role="dialog"
      aria-label="From identity chaos to control"
    >
      {!pageMode && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onClose?.()} />
      )}

      <div
        className={`relative flex flex-col overflow-hidden border border-white/10 text-slate-100 ${
          pageMode ? 'h-full w-full' : 'h-[88vh] w-full max-w-[1280px] rounded-2xl shadow-2xl'
        }`}
        style={{ background: '#050b18' }}
      >
        {/* header: chapter title + explanation */}
        <header className="flex items-start justify-between gap-6 px-6 pt-5 pb-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-cyan-300/80">
              {explainer ? 'Summary' : `Chapter ${idx + 1} of ${CHAPTERS.length}`}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">{explainer ? 'Before vs after: why this works' : chapter.title}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {explainer
                ? 'The same 48 people, managed two ways. Numbers are illustrative.'
                : chapter.body}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <Icon d={CLOSE} />
            </button>
          )}
        </header>

        {/* scene */}
        <main className="relative min-h-0 flex-1 px-4">
          <svg
            viewBox="0 60 960 470"
            preserveAspectRatio="xMidYMid meet"
            className="h-full w-full"
            role="img"
            aria-label={chapter.title}
            fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
          >
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 10 5 0 10z" fill="#22d3ee" />
              </marker>
            </defs>

            {/* panels */}
            <g opacity={vAD}>
              <rect x={40} y={80} width={400} height={400} rx={14} fill="#0a1a30" stroke="#1e3a5f" />
              <text x={60} y={108} fill="#9fc9ff" fontSize={14} fontWeight={600}>
                On-premises · Active Directory
              </text>
              <text x={60} y={126} fill="#64748b" fontSize={11}>
                Domain controller · corp.local
              </text>
            </g>
            <g opacity={vEntra}>
              <rect x={520} y={80} width={400} height={400} rx={14} fill="#06202e" stroke="#0e7490" />
              <text x={540} y={108} fill="#67e8f9" fontSize={14} fontWeight={600}>
                Microsoft Entra ID
              </text>
              <text x={540} y={126} fill="#64748b" fontSize={11}>
                Cloud identity · synced groups
              </text>
            </g>
            <g opacity={vAzure}>
              <rect x={40} y={80} width={880} height={400} rx={14} fill="#06202e" stroke="#0e7490" />
              <text x={60} y={108} fill="#67e8f9" fontSize={14} fontWeight={600}>
                Azure RBAC
              </text>
              <g fill="#64748b" fontSize={11} fontWeight={600} letterSpacing={1}>
                <text x={190} y={128}>GROUP</text>
                <text x={400} y={128}>ROLE</text>
                <text x={630} y={128}>SCOPE</text>
              </g>
            </g>

            {/* chapter 1: OU rows */}
            <g opacity={vOU}>
              {DEPTS.map((d, di) => (
                <g key={d.label}>
                  <line x1={190} x2={410} y1={rowY(di)} y2={rowY(di)} stroke="#1e3a5f" strokeDasharray="3 4" />
                  <text x={60} y={rowY(di) + 4} fill="#cfe6ff" fontSize={12}>
                    OU={d.label}
                  </text>
                </g>
              ))}
            </g>

            {/* chapters 2–3: group clusters */}
            <g opacity={vCluster}>
              {DEPTS.map((d, di) => {
                const a = clusterCenter(di, prev);
                const b = clusterCenter(di, idx);
                const cx = lerp(a.x, b.x, e);
                const cy = lerp(a.y, b.y, e);
                return (
                  <g key={d.label}>
                    <circle cx={cx} cy={cy} r={48} fill={d.color + '14'} stroke={d.color} strokeOpacity={0.7} />
                    <text x={cx} y={cy + 68} textAnchor="middle" fill="#e2e8f0" fontSize={12}>
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* chapter 3: sync arrow */}
            <g opacity={vSync}>
              <path
                d="M450 280 H510"
                stroke="#22d3ee"
                strokeWidth={2}
                strokeDasharray="6 5"
                strokeDashoffset={-time / 30}
                markerEnd="url(#arrow)"
                fill="none"
              />
              <text x={480} y={262} textAnchor="middle" fill="#67e8f9" fontSize={10}>
                Entra
              </text>
              <text x={480} y={298} textAnchor="middle" fill="#67e8f9" fontSize={10}>
                Connect
              </text>
            </g>

            {/* chapters 4–5: group → role → scope rows */}
            <g opacity={vRows}>
              {DEPTS.map((d, di) => {
                const y = rowY(di);
                return (
                  <g key={d.label}>
                    <text x={60} y={y + 4} fill={d.color} fontSize={12} fontWeight={600}>
                      {d.label}
                    </text>
                    <path d={`M340 ${y} H400`} stroke="#334155" />
                    <rect x={400} y={y - 15} width={150} height={30} rx={8} fill="#0f2a44" stroke="#2563eb" strokeOpacity={0.6} />
                    <text x={475} y={y + 4} textAnchor="middle" fill="#bfdbfe" fontSize={12}>
                      {d.role}
                    </text>
                    <path d={`M550 ${y} H630`} stroke="#334155" markerEnd="url(#arrow)" />
                    <rect x={630} y={y - 15} width={270} height={30} rx={8} fill="#0b2e3a" stroke="#0e7490" strokeOpacity={0.6} />
                    <text x={645} y={y + 4} fill="#a5f3fc" fontSize={12}>
                      {d.scope}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* chapter 5: security layer */}
            <g opacity={vSecure}>
              <rect x={352} y={126} width={36} height={314} rx={10} fill="#22d3ee10" stroke="#22d3ee" strokeDasharray="4 4" />
              <text x={370} y={460} textAnchor="middle" fill="#67e8f9" fontSize={10}>
                sign-in gate
              </text>
              {['MFA', 'Conditional Access', 'PIM · just-in-time', 'Access reviews'].map((label, i) => (
                <g key={label}>
                  <rect x={40 + i * 224} y={492} width={208} height={28} rx={14} fill="#0b2e3a" stroke="#22d3ee" strokeOpacity={0.7} />
                  <text x={144 + i * 224} y={510} textAnchor="middle" fill="#a5f3fc" fontSize={12}>
                    {label}
                  </text>
                </g>
              ))}
            </g>

            {/* chapter 0 annotation */}
            <text x={480} y={486} textAnchor="middle" fill="#fca5a5" fontSize={14} opacity={vChaos}>
              {N_NODES} users · {N_NODES} separate permission sets · no single source of truth
            </text>

            {/* users */}
            {Array.from({ length: N_NODES }, (_, i) => {
              const { x, y } = nodePos(i);
              const d = DEPTS[i % DEPTS.length];
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={6} fill="#64748b" opacity={1 - vColor} />
                  <circle cx={x} cy={y} r={6} fill={d.color} opacity={vColor} />
                </g>
              );
            })}
          </svg>

          {/* end-of-timeline prompt */}
          {ended && !explainer && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center px-4">
              <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur">
                <span className="text-sm text-slate-300">Want the short version?</span>
                <button
                  onClick={() => setExplainer(true)}
                  className="rounded-full bg-cyan-500 px-4 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                >
                  Before vs after
                </button>
                <button
                  onClick={togglePlay}
                  className="rounded-full px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  Replay
                </button>
              </div>
            </div>
          )}

          {/* optional explanation, shown after the timeline ends */}
          {explainer && (
            <div className="absolute inset-0 overflow-y-auto px-4 pb-4" style={{ background: '#050b18' }}>
              <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
                <section className="rounded-2xl border border-rose-400/30 bg-rose-500/5 p-5">
                  <h3 className="text-base font-semibold text-rose-200">Without groups and roles</h3>
                  <p className="mt-3 text-4xl font-semibold tabular-nums text-white">240</p>
                  <p className="text-sm text-slate-400">individual assignments (48 users × 5 resources)</p>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-300">
                    <li>• A new starter means up to 5 manual grants.</li>
                    <li>• A leaver means hunting down every grant, and some get missed.</li>
                    <li>• Nobody can answer “who has access to this?” without an audit.</li>
                    <li>• Copying a colleague’s permissions copies their mistakes too.</li>
                  </ul>
                </section>

                <section className="rounded-2xl border border-cyan-400/30 bg-cyan-500/5 p-5">
                  <h3 className="text-base font-semibold text-cyan-200">With AD + Entra ID + RBAC</h3>
                  <p className="mt-3 text-4xl font-semibold tabular-nums text-white">6</p>
                  <p className="text-sm text-slate-400">role assignments (one per group, at the right scope)</p>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-300">
                    <li>• A new starter means one group membership.</li>
                    <li>• A leaver is removed from the group and loses everything at once.</li>
                    <li>• “Who has access?” is answered by reading group membership.</li>
                    <li>• MFA, Conditional Access and PIM apply to everyone consistently.</li>
                  </ul>
                </section>
              </div>

              <div className="mx-auto mt-4 grid max-w-5xl gap-3 sm:grid-cols-3">
                {[
                  ['OUs organise, groups grant', 'Use OUs for structure and Group Policy; use security groups for permissions.'],
                  ['Role + scope', 'Give the narrowest role at the narrowest scope that still does the job.'],
                  ['Protect privilege', 'Make powerful roles eligible through PIM and review access on a schedule.'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
                  </div>
                ))}
              </div>

              <div className="mx-auto mt-4 flex max-w-5xl gap-3">
                <button
                  onClick={() => setExplainer(false)}
                  className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white transition hover:bg-white/20"
                >
                  Back to animation
                </button>
                <button
                  onClick={togglePlay}
                  className="rounded-full px-4 py-1.5 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  Replay
                </button>
              </div>
            </div>
          )}
        </main>

        {/* controls */}
        <footer className="flex items-center gap-3 border-t border-white/10 bg-black/20 px-4 py-3">
          <button
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : time >= TOTAL_MS ? 'Replay' : 'Play'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-200 transition hover:bg-cyan-500/30"
          >
            <Icon d={playing ? PAUSE : time >= TOTAL_MS ? REPLAY : PLAY} />
          </button>

          <div className="flex min-w-0 flex-1 gap-1.5">
            {CHAPTERS.map((c, i) => {
              const fill = clamp((time - i * CHAPTER_MS) / CHAPTER_MS) * 100;
              return (
                <button
                  key={c.short}
                  aria-label={`Chapter ${i + 1}: ${c.short}`}
                  aria-current={i === idx}
                  onClick={(ev) => {
                    const r = ev.currentTarget.getBoundingClientRect();
                    seek((i + clamp((ev.clientX - r.left) / r.width)) * CHAPTER_MS);
                  }}
                  className="group min-w-0 flex-1 text-left"
                >
                  <span
                    className={`block truncate text-[11px] font-medium transition ${
                      i === idx ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    {c.short}
                  </span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300"
                      style={{ width: `${fill}%` }}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          {ended && (
            <button
              onClick={() => setExplainer((v) => !v)}
              className="shrink-0 rounded-full border border-cyan-400/40 px-3 py-1 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/10"
            >
              {explainer ? 'Back' : 'Before vs after'}
            </button>
          )}

          <span className="hidden shrink-0 text-xs tabular-nums text-slate-400 sm:block">
            {fmt(time)} / {fmt(TOTAL_MS)}
          </span>
        </footer>
      </div>
    </div>
  );
}