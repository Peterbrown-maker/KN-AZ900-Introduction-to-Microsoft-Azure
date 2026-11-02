import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, LocateFixed } from 'lucide-react';
import { useLab } from './store';
import { fmt, getNeuron, layerNeurons, type Network } from './engine';

export const W = 1000, H = 560;
const R = 25, R_IN = 21;

export function layout(net: Network) {
  const L = net.sizes.length;
  const pos: Record<string, { x: number; y: number }> = {};
  net.sizes.forEach((n, l) => {
    // The two-layer apple neuron needs room on the left for its feature labels.
    const left = L === 2 ? 300 : 110, right = L === 2 ? 220 : 110;
    const x = L === 1 ? W / 2 : left + (l * (W - left - right)) / (L - 1);
    const gap = Math.min(125, (H - 140) / Math.max(1, n - 1 || 1));
    layerNeurons(net, l).forEach((nr, i) => (pos[nr.id] = { x, y: H / 2 + 10 + (i - (n - 1) / 2) * gap }));
  });
  return pos;
}

const ACT_SHORT = { step: 'step', relu: 'ReLU', sigmoid: 'σ', tanh: 'tanh' } as const;
const POS = '#22d3ee', NEG = '#f59e0b', GRAD = '#c084fc';

/** Shorten a segment so hit areas stop short of the neurons (prevents neuron/line conflicts). */
function trim(a: { x: number; y: number }, b: { x: number; y: number }, ra: number, rb: number) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  return { x1: a.x + (dx / len) * ra, y1: a.y + (dy / len) * ra, x2: b.x - (dx / len) * rb, y2: b.y - (dy / len) * rb };
}

export function NetworkCanvas({ height = 520 }: { height?: number }) {
  const { s, d, net, fwd, sel, revealed, currentOp } = useLab();
  const reduce = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const [cam, setCam] = useState({ k: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ x: number; y: number; dist?: number } | null>(null);
  const pos = useMemo(() => layout(net), [net]);
  const build = s.build;
  const stage = build ?? 99;
  const maxAbsW = Math.max(1, ...net.connections.map((c) => Math.abs(c.weight)));
  const grads = s.view.gradients && s.mode === 'full' ? s.training.last?.back : undefined;
  const maxAbsG = grads ? Math.max(1e-9, ...Object.values(grads.gradW).map(Math.abs)) : 1;

  const toUnits = useCallback((dx: number, dy: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    const scale = Math.max(W / r.width, H / r.height);
    return { dx: dx * scale, dy: dy * scale };
  }, []);

  const zoomAt = useCallback((factor: number, cx = W / 2, cy = H / 2) => {
    setCam((c) => {
      const k = Math.min(4, Math.max(0.5, c.k * factor));
      const f = k / c.k;
      return { k, x: cx - (cx - c.x) * f, y: cy - (cy - c.y) * f };
    });
  }, []);
  const fit = () => setCam({ k: 1, x: 0, y: 0 });

  // Wheel zoom needs a non-passive listener so the page does not scroll.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const scale = Math.max(W / r.width, H / r.height);
      const ox = (r.width * scale - W) / 2, oy = (r.height * scale - H) / 2;
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, (e.clientX - r.left) * scale - ox, (e.clientY - r.top) * scale - oy);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  // Smoothly bring the selected object into focus — only when the selection changes,
  // not when training updates parameters (positions depend on architecture, not weights).
  const geom = useRef({ pos, net });
  geom.current = { pos, net };
  const selKey = sel ? `${sel.type}:${sel.id}` : '';
  useEffect(() => {
    // The simple network always fits on screen, so only the dense full network zooms to a selection.
    if (!selKey || s.mode === 'simple') return;
    const [type, id] = selKey.split(':');
    const { pos: P, net: N } = geom.current;
    let p: { x: number; y: number } | undefined;
    if (type === 'neuron') p = P[id];
    else {
      const c = N.connections.find((x) => x.id === id);
      if (c) p = { x: (P[c.from].x + P[c.to].x) / 2, y: (P[c.from].y + P[c.to].y) / 2 };
    }
    if (!p) return;
    const k = 1.35;
    setCam({ k, x: W / 2 - p.x * k, y: H / 2 - p.y * k });
  }, [selKey, s.mode]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).getAttribute('data-bg') !== '1') return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    last.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = [...pointers.current.values()];
    if (ps.length === 2) {
      const dist = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      if (last.current?.dist) zoomAt(dist / last.current.dist);
      last.current = { x: e.clientX, y: e.clientY, dist };
      return;
    }
    if (!last.current) return;
    const { dx, dy } = toUnits(e.clientX - last.current.x, e.clientY - last.current.y);
    last.current = { x: e.clientX, y: e.clientY };
    setCam((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) { setDragging(false); last.current = null; }
  };

  const selNeuron = sel?.type === 'neuron' ? sel.id : null;
  const selConn = sel?.type === 'connection' ? net.connections.find((c) => c.id === sel.id) : undefined;
  const related = (cid: string, from: string, to: string) =>
    selConn ? cid === selConn.id : selNeuron ? from === selNeuron || to === selNeuron : false;
  const anySel = !!sel;
  const activeConn = currentOp?.kind === 'multiply' ? currentOp.target.id : null;
  const activeNeuron = currentOp && currentOp.kind !== 'multiply' ? currentOp.neuronId : null;
  const opDur = reduce ? 0 : Math.max(0.15, 0.85 / s.speed);
  const keyAct = (e: React.KeyboardEvent, fn: () => void) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#040815] overflow-hidden select-none">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full block touch-none" style={{ aspectRatio: `${W} / ${H}`, maxHeight: height }} role="application" aria-label={`${net.name}: ${net.sizes.join(' → ')} neurons`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onClick={(e) => { if ((e.target as Element).getAttribute('data-bg') === '1' && !dragging) d({ t: 'clear' }); }}>
        <defs>
          <radialGradient id="nn-glow"><stop offset="0%" stopColor="#22d3ee" stopOpacity="0.55" /><stop offset="100%" stopColor="#22d3ee" stopOpacity="0" /></radialGradient>
          <pattern id="nn-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.035)" /></pattern>
        </defs>
        <rect data-bg="1" x={-4000} y={-4000} width={9000} height={9000} fill="url(#nn-grid)" className={dragging ? 'cursor-grabbing' : 'cursor-grab'} />
        <g style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.k})`, transformOrigin: '0 0', transition: dragging || reduce ? 'none' : 'transform 0.55s cubic-bezier(.22,1,.36,1)' }}>
          {/* Layer labels */}
          {s.view.layers && stage >= 4 && net.sizes.map((n, l) => {
            const first = layerNeurons(net, l)[0];
            if (stage < 4 + Math.min(2, l === 0 ? 0 : l === net.sizes.length - 1 ? 2 : 1)) return null;
            return (
              <g key={l}>
                <text x={pos[first.id].x} y={28} textAnchor="middle" fontSize={14} fontWeight={700} fill="#e2e8f0">{net.layerNames[l]}</text>
                <text x={pos[first.id].x} y={46} textAnchor="middle" fontSize={11} fill="#64748b">{l === 0 ? `${n} input feature${n > 1 ? 's' : ''}` : `${n} neuron${n > 1 ? 's' : ''}`}</text>
              </g>
            );
          })}

          {/* Connections: visible line + wide transparent hit path */}
          {stage >= 7 && net.connections.map((c, i) => {
            const a = pos[c.from], b = pos[c.to];
            const fromN = getNeuron(net, c.from)!;
            const t = trim(a, b, (fromN.kind === 'input' ? R_IN : R) + 6, R + 6);
            const isRel = related(c.id, c.from, c.to);
            const g = grads?.gradW[c.id];
            const color = g !== undefined ? GRAD : c.weight >= 0 ? POS : NEG;
            const width = g !== undefined ? 0.8 + (Math.abs(g) / maxAbsG) * 6 : 0.8 + (Math.abs(c.weight) / maxAbsW) * 5.5;
            const opacity = anySel ? (isRel ? 1 : 0.12) : activeConn ? (activeConn === c.id ? 1 : 0.25) : 0.6;
            const isFocus = focus === c.id;
            const label = `Connection from ${c.from} to ${c.to}, weight ${fmt(c.weight)}${c.weight < 0 ? ' (negative)' : ''}`;
            const lt = s.mode === 'simple' ? 0.45 : 0.3;
            return (
              <g key={c.id}>
                <motion.line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={width} strokeOpacity={opacity}
                  strokeDasharray={c.weight < 0 && g === undefined ? '7 4' : undefined} strokeLinecap="round" pointerEvents="none"
                  initial={build !== null && build === 7 ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: build === 7 ? i * 0.03 : 0 }} />
                {(isFocus || (selConn?.id === c.id)) && <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#fff" strokeOpacity={0.8} strokeWidth={width + 5} fill="none" pointerEvents="none" strokeLinecap="round" style={{ mixBlendMode: 'overlay' }} />}
                <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="transparent" strokeWidth={18} pointerEvents="stroke" className="cursor-pointer outline-none"
                  data-conn={c.id} tabIndex={build === null || stage >= 10 ? 0 : -1} role="button" aria-label={label} aria-pressed={selConn?.id === c.id}
                  onClick={(e) => { e.stopPropagation(); d({ t: 'select', sel: { type: 'connection', id: c.id } }); }}
                  onKeyDown={(e) => keyAct(e, () => d({ t: 'select', sel: { type: 'connection', id: c.id } }))}
                  onFocus={() => setFocus(c.id)} onBlur={() => setFocus(null)}><title>{label}</title></line>
                {s.view.weights && stage >= 8 && (s.mode === 'simple' || !anySel || isRel) && (
                  <text x={a.x + (b.x - a.x) * lt} y={a.y + (b.y - a.y) * lt - 6} textAnchor="middle" fontSize={s.mode === 'simple' ? 15 : 10} fontWeight={600} fill={color} fillOpacity={anySel && !isRel ? 0.2 : 0.95} pointerEvents="none"
                    style={{ paintOrder: 'stroke', stroke: '#040815', strokeWidth: 4 }}>
                    {g !== undefined ? `∂${g !== 0 && Math.abs(g) < 0.001 ? g.toExponential(1) : fmt(g, 3)}` : `${c.weight >= 0 ? '+' : ''}${fmt(c.weight, 2)}`}
                  </text>
                )}
              </g>
            );
          })}

          {/* Forward signal: a particle travels along the connection whose multiplication is being performed. */}
          {activeConn && (() => {
            const c = net.connections.find((x) => x.id === activeConn)!;
            const a = pos[c.from], b = pos[c.to];
            const v = currentOp!.value;
            return (
              <motion.circle key={`p${currentOp!.seq}`} r={6} fill={v >= 0 ? POS : NEG} initial={{ cx: a.x, cy: a.y, opacity: 1 }} animate={{ cx: b.x, cy: b.y }} transition={{ duration: opDur, ease: 'easeInOut' }}
                style={{ filter: `drop-shadow(0 0 6px ${v >= 0 ? POS : NEG})` }} pointerEvents="none" />
            );
          })()}
          {s.trace && (() => {
            const c = net.connections.find((x) => x.id === s.trace!.id);
            if (!c) return null;
            const a = pos[c.from], b = pos[c.to];
            const v = fwd.values[c.from].a * c.weight;
            return <motion.circle key={`t${s.trace.key}`} r={7} fill={v >= 0 ? POS : NEG} initial={{ cx: a.x, cy: a.y, opacity: 1 }} animate={{ cx: b.x, cy: b.y, opacity: [1, 1, 0] }} transition={{ duration: reduce ? 0 : 1.4 }} pointerEvents="none" />;
          })()}
          {/* Backpropagation: gradient information flows from the loss back toward the inputs. */}
          {s.backAnim && s.mode === 'full' && net.connections.map((c) => {
            const a = pos[c.from], b = pos[c.to];
            const delay = (net.sizes.length - 1 - getNeuron(net, c.to)!.layer) * 0.9;
            return <motion.circle key={`b${s.backAnim!.key}${c.id}`} r={4} fill={GRAD} initial={{ cx: b.x, cy: b.y, opacity: 0 }} animate={{ cx: a.x, cy: a.y, opacity: [0, 1, 1, 0] }} transition={{ duration: reduce ? 0 : 1.1, delay: reduce ? 0 : delay }} pointerEvents="none" />;
          })}

          {/* Neurons */}
          {net.neurons.map((n) => {
            const visible = stage >= (n.kind === 'input' ? 4 : n.kind === 'hidden' ? 5 : 6);
            if (!visible) return null;
            const p = pos[n.id], r = n.kind === 'input' ? R_IN : R;
            const shown = revealed(n.id);
            const v = fwd.values[n.id];
            const val = n.kind === 'input' ? s.inputs[s.mode][n.index] : v.a;
            const intensity = shown || n.kind === 'input' ? Math.min(1, Math.abs(val)) : 0;
            const isSel = selNeuron === n.id;
            const isNeighbour = selConn ? selConn.from === n.id || selConn.to === n.id : selNeuron ? net.connections.some((c) => (c.from === selNeuron && c.to === n.id) || (c.to === selNeuron && c.from === n.id)) : false;
            const dim = anySel && !isSel && !isNeighbour;
            const isActive = activeNeuron === n.id;
            const base = n.kind === 'input' ? '#38bdf8' : n.kind === 'output' ? '#c084fc' : '#818cf8';
            const label = `${n.kind === 'input' ? 'Input feature' : 'Neuron'} ${n.id}${n.kind === 'input' ? `: ${n.label}, value ${fmt(val)}` : shown ? `, output ${fmt(val)}` : ', not calculated yet'}`;
            return (
              <motion.g key={n.id} initial={build !== null && stage <= 6 ? { opacity: 0, scale: 0.4 } : false} animate={{ opacity: dim ? 0.3 : 1, scale: 1 }} style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                role="button" tabIndex={build === null || stage >= 10 ? 0 : -1} aria-label={label} aria-pressed={isSel} className="cursor-pointer outline-none"
                onClick={(e) => { e.stopPropagation(); d({ t: 'select', sel: { type: 'neuron', id: n.id } }); }}
                onKeyDown={(e) => keyAct(e, () => d({ t: 'select', sel: { type: 'neuron', id: n.id } }))}
                onFocus={() => setFocus(n.id)} onBlur={() => setFocus(null)}>
                <title>{label}</title>
                {(isSel || isActive) && <circle cx={p.x} cy={p.y} r={r + 22} fill="url(#nn-glow)" pointerEvents="none" />}
                <circle cx={p.x} cy={p.y} r={r + 8} fill="transparent" />
                <circle cx={p.x} cy={p.y} r={r} fill={`color-mix(in srgb, ${val < 0 && shown ? NEG : base} ${Math.round(12 + intensity * 55)}%, #060b1c)`}
                  stroke={isSel ? '#fff' : focus === n.id ? '#fde047' : base} strokeWidth={isSel || focus === n.id ? 3 : 1.6} strokeDasharray={n.kind === 'input' ? '4 3' : undefined} />
                {s.view.outputs && (
                  <text x={p.x} y={p.y + 4.5} textAnchor="middle" fontSize={n.kind === 'input' ? 13 : 12} fontWeight={700} fill="#f8fafc" pointerEvents="none">
                    {n.kind === 'input' ? fmt(val, 2) : shown ? fmt(val, 2) : '?'}
                  </text>
                )}
                {n.kind === 'input' && s.mode === 'simple' && <text x={p.x - r - 8} y={p.y + 4} textAnchor="end" fontSize={13} fill="#cbd5e1" pointerEvents="none">{n.label}</text>}
                {n.kind !== 'input' && stage >= 9 && (
                  <text x={p.x} y={p.y + r + 15} textAnchor="middle" fontSize={s.mode === 'simple' ? 13 : 9.5} fill="#94a3b8" pointerEvents="none">{ACT_SHORT[n.activation]} · b={fmt(n.bias, 2)}</text>
                )}
                {n.kind === 'output' && s.mode === 'simple' && shown && (
                  <text x={p.x + r + 14} y={p.y + 5} fontSize={16} fontWeight={800} fill={v.a > 0.5 ? '#34d399' : '#f87171'} pointerEvents="none">→ {v.a > 0.5 ? 'YES' : 'NO'}</text>
                )}
              </motion.g>
            );
          })}
          {stage === 10 && build !== null && net.neurons.filter((n) => n.kind === 'output').map((n) => (
            <motion.circle key="ready" cx={pos[n.id].x} cy={pos[n.id].y} r={R} fill="none" stroke="#34d399" strokeWidth={2} initial={{ r: R, opacity: 1 }} animate={{ r: R + 40, opacity: 0 }} transition={{ duration: 1.4, repeat: reduce ? 0 : Infinity }} pointerEvents="none" />
          ))}
        </g>
      </svg>

      {/* Camera controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button className="nn-icon" onClick={() => zoomAt(1.25)} aria-label="Zoom in"><ZoomIn className="w-4 h-4" /></button>
        <button className="nn-icon" onClick={() => zoomAt(0.8)} aria-label="Zoom out"><ZoomOut className="w-4 h-4" /></button>
        <button className="nn-icon" onClick={fit} aria-label="Fit network to screen"><Maximize2 className="w-4 h-4" /></button>
        <button className="nn-icon" onClick={() => { fit(); d({ t: 'clear' }); }} aria-label="Reset camera and return to overview"><LocateFixed className="w-4 h-4" /></button>
      </div>
      {/* Legend */}
      {stage >= 7 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] sm:text-[11px] text-gray-300 border-t border-white/10 px-3 py-2">
          {grads ? <span className="flex items-center gap-1"><span className="w-5 h-0.5" style={{ background: GRAD }} /> line width = |∂L/∂w| (last training step)</span> : <>
            <span className="flex items-center gap-1"><span className="w-5 h-[3px] rounded" style={{ background: POS }} /> + positive weight</span>
            <span className="flex items-center gap-1"><span className="w-5 h-0 border-t-[3px] border-dashed" style={{ borderColor: NEG }} /> − negative weight (dashed)</span>
            <span>thicker = larger |weight|</span>
          </>}
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-dashed border-sky-400" /> input feature</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-indigo-400" /> computational neuron</span>
          <span>? = not calculated yet</span>
        </div>
      )}
    </div>
  );
}
