import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SimFrame } from '../ui';
import { chapters } from '../data';
import { navigate } from '../router';

// Positions of each chapter on the map (viewBox 600 × 380) and the relationships between them.
const POS: Record<string, [number, number]> = {
  'intro-ai': [300, 34], ml: [140, 100], genai: [300, 110], transformers: [460, 100], prompts: [190, 190], rag: [300, 205], agents: [410, 190],
  nlp: [70, 270], speech: [185, 300], vision: [300, 315], extraction: [415, 300], responsible: [530, 270], azure: [300, 365],
};
const LINKS: [string, string, string][] = [
  ['intro-ai', 'ml', 'learns from data'], ['intro-ai', 'genai', 'creates'], ['ml', 'transformers', 'deep learning'], ['genai', 'transformers', 'built on'],
  ['genai', 'prompts', 'guided by'], ['genai', 'rag', 'grounded by'], ['genai', 'agents', 'powers'], ['rag', 'agents', 'knowledge'],
  ['transformers', 'nlp', 'embeddings'], ['transformers', 'speech', 'acoustic models'], ['transformers', 'vision', 'ViT'], ['vision', 'extraction', 'OCR'],
  ['nlp', 'extraction', 'NER'], ['agents', 'azure', 'Foundry agents'], ['rag', 'azure', 'Foundry IQ'], ['speech', 'azure', 'Azure Speech'],
  ['nlp', 'azure', 'Azure Language'], ['extraction', 'azure', 'Content Understanding'], ['responsible', 'azure', 'content safety'], ['responsible', 'agents', 'approval'],
];

export function ConceptMap() {
  const [sel, setSel] = useState('genai');
  const ch = chapters.find((c) => c.id === sel)!;
  const related = new Set(LINKS.filter(([a, b]) => a === sel || b === sel).flatMap(([a, b]) => [a, b]));
  return (
    <SimFrame title="The whole course in one picture" icon="Waypoints"
      shows="How every chapter connects: data and models underpin generative AI; prompts, RAG and agents shape it; workloads apply it; Azure hosts it; responsible AI governs it."
      omits="Many more connections exist — this shows the most important ones for the exam.">
      <div className="overflow-x-auto">
        <svg viewBox="0 0 600 390" className="w-full min-w-[520px]">
          {LINKS.map(([a, b, l]) => {
            const on = a === sel || b === sel;
            const [x1, y1] = POS[a], [x2, y2] = POS[b];
            return <g key={a + b}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? '#fff' : '#1e293b'} strokeWidth={on ? 1.6 : 1} />{on && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 3} textAnchor="middle" fontSize={8.5} fill="#cbd5e1">{l}</text>}</g>;
          })}
          {chapters.filter((c) => POS[c.id]).map((c) => {
            const [x, y] = POS[c.id];
            const on = c.id === sel, near = related.has(c.id);
            return (
              <g key={c.id} onClick={() => setSel(c.id)} className="cursor-pointer" role="button" tabIndex={0} aria-label={c.title} onKeyDown={(e) => e.key === 'Enter' && setSel(c.id)}>
                <motion.circle cx={x} cy={y} animate={{ r: on ? 25 : 19 }} fill={on ? c.accent : `${c.accent}${near ? '55' : '22'}`} stroke={c.accent} strokeWidth={1.5} />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill={on ? '#050a17' : '#fff'}>{c.number}</text>
                <text x={x} y={y + (on ? 38 : 32)} textAnchor="middle" fontSize={9.5} fill={on || near ? '#f1f5f9' : '#64748b'}>{c.short}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <motion.div key={sel} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white/5 p-4 mt-2">
        <p className="font-bold" style={{ color: ch.accent }}>Chapter {ch.number} · {ch.title}</p>
        <ul className="text-sm text-gray-300 mt-2 space-y-1">{ch.summary.slice(0, 3).map((s) => <li key={s}>• {s}</li>)}</ul>
        <button className="ai-btn-ghost text-xs mt-3" onClick={() => navigate({ view: 'chapter', id: ch.id })}>Open chapter <ArrowRight className="w-3.5 h-3.5" /></button>
      </motion.div>
    </SimFrame>
  );
}
