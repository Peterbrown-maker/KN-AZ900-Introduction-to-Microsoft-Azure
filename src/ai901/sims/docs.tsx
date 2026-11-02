import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, FileJson } from 'lucide-react';
import { SimFrame, Seg, Slider } from '../ui';

const LINES = [
  { t: 'FOURTH COFFEE', y: 0, conf: 0.99, field: 'MerchantName' },
  { t: '123 Main St, Redmond WA', y: 1, conf: 0.96, field: 'MerchantAddress' },
  { t: '08/15/2024  10:42', y: 2, conf: 0.95, field: 'TransactionDate' },
  { t: 'Latte (L)          1   $4.49', y: 4, conf: 0.93, field: 'Items[0]' },
  { t: 'Blueberry muffin   1   $1.99', y: 5, conf: 0.9, field: 'Items[1]' },
  { t: 'Subtotal               $6.48', y: 7, conf: 0.94, field: 'Subtotal' },
  { t: 'Tax                    $0.49', y: 8, conf: 0.92, field: 'Tax' },
  { t: 'TOTAL                  $6.97', y: 9, conf: 0.97, field: 'Total' },
  { t: 'VISA ****1234', y: 11, conf: 0.89, field: 'PaymentMethod' },
];

// ---------------- OCR pipeline ----------------
const OCR_ST = ['1 · Acquire', '2 · Preprocess', '3 · Detect regions', '4 · Recognise', '5 · Output'];
export function OCRPipeline() {
  const [st, setSt] = useState(0);
  const raw = st === 0;
  return (
    <SimFrame title="OCR pipeline" icon="ScanLine"
      controls={<div className="flex gap-1"><button className="ai-btn-ghost text-xs" disabled={!st} onClick={() => setSt(st - 1)}>Back</button><button className="ai-btn text-xs" disabled={st === 4} onClick={() => setSt(st + 1)}>Next</button></div>}
      shows="A skewed, noisy phone photo is cleaned, straightened and enhanced; text regions are found and ordered; characters are recognised with confidence scores; and text with coordinates is output."
      omits="Each stage uses many techniques (filters, CNNs, transformers, language models) that are summarised here.">
      <div className="flex flex-wrap gap-1 mb-3">{OCR_ST.map((s, i) => <button key={s} onClick={() => setSt(i)} className={`text-[11px] px-2 py-1 rounded-full border ${i === st ? 'text-[#050a17] border-transparent' : 'border-white/10 text-gray-400'}`} style={i === st ? { background: 'var(--accent)' } : undefined}>{s}</button>)}</div>
      <div className="grid md:grid-cols-[1fr_1.2fr] gap-4 items-start">
        <div className="relative rounded-xl bg-[#1f2937] p-4 overflow-hidden min-h-[260px]">
          <motion.div animate={{ rotate: raw ? -7 : 0, filter: raw ? 'blur(1.2px) contrast(0.6) brightness(0.8)' : 'blur(0px) contrast(1.15) brightness(1)' }} transition={{ duration: 0.8 }}
            className="bg-[#f5f1e6] text-[#1f2937] font-mono text-[11px] leading-[1.6] rounded shadow-xl p-3 mx-auto max-w-[240px] relative">
            {raw && <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(#0003 1px, transparent 1px)', backgroundSize: '5px 5px' }} />}
            {Array.from({ length: 12 }, (_, y) => { const l = LINES.find((x) => x.y === y); return (
              <div key={y} className="relative whitespace-pre min-h-[1.6em]">
                {l?.t ?? ''}
                {st >= 2 && l && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -inset-x-1 inset-y-0 border rounded-sm" style={{ borderColor: st >= 3 && l.conf < 0.92 ? '#f59e0b' : '#0ea5e9' }} />}
                {st >= 2 && l && <span className="absolute -left-4 top-0 text-[8px] text-sky-600">{LINES.indexOf(l) + 1}</span>}
              </div>
            ); })}
          </motion.div>
        </div>
        <div className="text-sm text-gray-300 space-y-2">
          <AnimatePresence mode="wait">
            <motion.div key={st} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {st === 0 && <p>A smartphone photo arrives: rotated 7°, low contrast, speckled with noise. <b className="text-white">Image quality here strongly affects final accuracy.</b></p>}
              {st === 1 && <ul className="space-y-1"><li>✓ Noise reduction (median / Gaussian filter, denoising CNN)</li><li>✓ Contrast adjustment (adaptive thresholding)</li><li>✓ Skew correction (Hough transform → −7° fixed)</li><li>✓ Resolution optimisation (bicubic / super-resolution)</li></ul>}
              {st === 2 && <ul className="space-y-1"><li>Layout analysis: text vs blank areas</li><li>Text blocks grouped into lines</li><li>Reading order: top-to-bottom (numbers 1–9)</li><li>Region classes: header, line items, totals</li></ul>}
              {st === 3 && <div className="space-y-1 font-mono text-xs">{LINES.map((l) => <p key={l.t} className={l.conf < 0.92 ? 'text-amber-300' : ''}>{l.t.replace(/\s+/g, ' ')} <span className="opacity-60">conf {l.conf.toFixed(2)}</span></p>)}<p className="font-sans text-gray-400 pt-1">Context analysis (dictionaries, language models) fixes "C0FFEE" → "COFFEE".</p></div>}
              {st === 4 && <pre className="text-[11px] font-mono bg-black/40 rounded-lg p-3 overflow-x-auto">{JSON.stringify({ pages: [{ lines: LINES.slice(0, 4).map((l) => ({ text: l.t.replace(/\s+/g, ' '), boundingBox: [12, 18 + l.y * 18, 228, 18 + l.y * 18 + 14], confidence: l.conf })) }] }, null, 1).slice(0, 520)}…</pre>}
            </motion.div>
          </AnimatePresence>
          {st === 4 && <p className="text-xs text-gray-400">OCR knows <i>what text is where</i>. It does not yet know that "$6.97" is the total — that's field extraction.</p>}
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Document intelligence lab ----------------
type Field = { key: string; raw: string; value: string; conf: number };
export function DocumentLab() {
  const [st, setSt] = useState(0);
  const [smudged, setSmudged] = useState(false);
  const [th, setTh] = useState(0.8);
  const [fixed, setFixed] = useState<string | null>(null);
  const totalRaw = smudged ? '$6.37' : '$6.97';
  const totalConf = smudged ? 0.58 : 0.97;
  const fields: Field[] = [
    { key: 'MerchantName', raw: 'FOURTH COFFEE', value: 'Fourth Coffee', conf: 0.99 },
    { key: 'TransactionDate', raw: '08/15/2024', value: '2024-08-15', conf: 0.95 },
    { key: 'Items', raw: 'Latte (L) $4.49; Blueberry muffin $1.99', value: '[{Latte (L), 1, 4.49}, {Blueberry muffin, 1, 1.99}]', conf: 0.9 },
    { key: 'Subtotal', raw: '$6.48', value: '6.48', conf: 0.94 },
    { key: 'Tax', raw: '$0.49', value: '0.49', conf: 0.92 },
    { key: 'Total', raw: fixed ?? totalRaw, value: (fixed ?? totalRaw).replace('$', ''), conf: fixed ? 1 : totalConf },
  ];
  const total = Number(fields[5].value);
  const sumOk = Math.abs(4.49 + 1.99 - 6.48) < 0.001;
  const totalOk = Math.abs(6.48 + 0.49 - total) < 0.001;
  const review = fields.filter((f) => f.conf < th);
  const needsHuman = !totalOk || review.length > 0;
  const stages = ['OCR', 'Map fields', 'Normalise', 'Validate', 'Output'];
  return (
    <SimFrame title="Document intelligence lab" icon="Receipt" onReset={() => { setSt(0); setSmudged(false); setFixed(null); setTh(0.8); }}
      controls={<label className="flex items-center gap-1.5 text-xs text-gray-300"><input type="checkbox" checked={smudged} onChange={(e) => { setSmudged(e.target.checked); setFixed(null); }} /> Smudged receipt</label>}
      shows="Text from OCR is mapped to schema fields using labels and position, normalised (dates to ISO, currency to numbers), validated (items sum to subtotal; subtotal + tax = total), and low-confidence or inconsistent results are routed to a human."
      omits="Field mapping here is pre-computed; real services use trained layout-aware models or LLMs with a schema.">
      <div className="flex flex-wrap gap-1 mb-3">{stages.map((s, i) => <button key={s} onClick={() => setSt(i)} className={`text-xs px-3 py-1.5 rounded-full border ${i === st ? 'text-[#050a17] border-transparent' : i < st ? 'border-white/20 text-gray-300' : 'border-white/10 text-gray-500'}`} style={i === st ? { background: 'var(--accent)' } : undefined}>{i + 1}. {s}</button>)}<button className="ai-btn text-xs ml-auto" onClick={() => setSt(Math.min(4, st + 1))} disabled={st === 4}>Next</button></div>
      <div className="grid md:grid-cols-[1fr_1.3fr] gap-4">
        <div className="bg-[#f5f1e6] text-[#1f2937] font-mono text-[11px] leading-[1.7] rounded-lg p-3 shadow-xl max-w-[260px] w-full mx-auto">
          {Array.from({ length: 12 }, (_, y) => {
            const l = LINES.find((x) => x.y === y);
            const txt = l?.field === 'Total' ? `TOTAL                  ${totalRaw}` : l?.t ?? '';
            return <div key={y} className={`whitespace-pre min-h-[1.7em] rounded-sm ${st >= 1 && l ? 'bg-sky-200/60' : ''} ${smudged && l?.field === 'Total' ? 'blur-[0.6px] text-[#6b7280]' : ''}`}>{txt}</div>;
          })}
        </div>
        <div className="text-sm">
          {st === 0 && <div className="space-y-1 font-mono text-xs text-gray-300">{LINES.map((l) => <p key={l.t}>{l.field === 'Total' ? `TOTAL ${totalRaw}` : l.t.replace(/\s+/g, ' ')} <span className={l.field === 'Total' && smudged ? 'text-amber-300' : 'opacity-50'}>({(l.field === 'Total' ? totalConf : l.conf).toFixed(2)})</span></p>)}<p className="font-sans text-gray-500 pt-1">Raw text + positions + confidence. No meaning yet.</p></div>}
          {st >= 1 && st <= 2 && (
            <table className="w-full text-xs"><thead><tr className="text-gray-400 text-left"><th className="py-1">Field</th><th>{st === 1 ? 'Raw value' : 'Normalised'}</th><th className="text-right">conf</th></tr></thead>
              <tbody>{fields.map((f) => <tr key={f.key} className="border-t border-white/5"><td className="py-1 pr-2 text-gray-100">{f.key}</td><td className="font-mono text-gray-300 pr-2">{st === 1 ? f.raw : f.value}</td><td className={`text-right font-mono ${f.conf < th ? 'text-amber-300' : 'text-gray-400'}`}>{f.conf.toFixed(2)}</td></tr>)}</tbody></table>
          )}
          {st === 1 && <p className="text-xs text-gray-500 mt-2">"TOTAL" label + position at the bottom → Total. Items detected as a table: description, quantity, price.</p>}
          {st === 2 && <p className="text-xs text-gray-500 mt-2">Date 08/15/2024 → ISO 2024-08-15. "$6.48" → 6.48 (number, USD).</p>}
          {st >= 3 && (
            <div className="space-y-2">
              <Slider label="Review threshold (min confidence)" value={th} min={0.5} max={0.99} step={0.01} onChange={setTh} format={(v) => v.toFixed(2)} />
              <p className="flex items-center gap-2">{sumOk ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />} Items 4.49 + 1.99 = 6.48 = Subtotal</p>
              <p className="flex items-center gap-2">{totalOk ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />} Subtotal 6.48 + Tax 0.49 = 6.97 {totalOk ? '= Total' : `≠ Total ${total}`}</p>
              <p className="flex items-center gap-2">{review.length ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />} {review.length ? `${review.map((r) => r.key).join(', ')} below ${th.toFixed(2)} confidence` : 'All fields above threshold'}</p>
              {needsHuman ? (
                <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-3">
                  <p className="text-amber-200 font-semibold text-sm">Routed to human review</p>
                  <p className="text-xs text-gray-300 mb-2">A clerk checks the original image and corrects the value.</p>
                  <button className="ai-btn text-xs" onClick={() => setFixed('$6.97')}>Reviewer confirms total = $6.97</button>
                </div>
              ) : <p className="text-emerald-300 text-sm">✓ Straight-through processing — no human needed.</p>}
            </div>
          )}
          {st === 4 && <pre className="mt-3 text-[11px] font-mono bg-black/40 rounded-lg p-3 overflow-x-auto"><FileJson className="w-3.5 h-3.5 inline mr-1" />{JSON.stringify({ vendor: 'Fourth Coffee', date: '2024-08-15', subtotal: 6.48, tax: 0.49, total: total, status: needsHuman ? 'needs_review' : 'validated' }, null, 2)}</pre>}
        </div>
      </div>
    </SimFrame>
  );
}

// ---------------- Content Understanding schema builder ----------------
type CField = { name: string; type: string; method: 'extract' | 'generate' | 'classify'; value: unknown; conf: number };
const CONTENT: Record<string, { analyzer: string; label: string; preview: string; fields: CField[] }> = {
  invoice: { analyzer: 'prebuilt-invoice', label: 'Invoice (document)', preview: 'Adventure Works Cycles · Invoice 1234 · 03/07/2025 · 3 line items · Total 1585.98', fields: [
    { name: 'VendorName', type: 'string', method: 'extract', value: 'Adventure Works Cycles', conf: 0.97 },
    { name: 'InvoiceNumber', type: 'string', method: 'extract', value: '1234', conf: 0.95 },
    { name: 'InvoiceDate', type: 'date', method: 'extract', value: '2025-03-07', conf: 0.93 },
    { name: 'CustomerName', type: 'string', method: 'extract', value: 'John Smith', conf: 0.96 },
    { name: 'Items', type: 'array<object>', method: 'extract', value: [{ Description: '38" Racing Bike (Red)', UnitPrice: 1299.0, Quantity: 1, LineTotal: 1299.0 }, { Description: 'Cycling helmet (Black)', UnitPrice: 25.99, Quantity: 1, LineTotal: 25.99 }, { Description: 'Cycling shirt (L)', UnitPrice: 42.5, Quantity: 2, LineTotal: 85.0 }], conf: 0.9 },
    { name: 'Subtotal', type: 'number', method: 'extract', value: 1409.99, conf: 0.94 },
    { name: 'Tax', type: 'number', method: 'extract', value: 140.99, conf: 0.92 },
    { name: 'ShippingCharge', type: 'number', method: 'extract', value: 35.0, conf: 0.9 },
    { name: 'InvoiceTotal', type: 'number', method: 'extract', value: 1585.98, conf: 0.97 },
  ] },
  audio: { analyzer: 'prebuilt-audioSearch (+ custom fields)', label: 'Voicemail (audio)', preview: '"Hi, this is Ava from Contoso. Just calling to follow up on our meeting… call me back on 555-12345 or email Ava@contoso.com…"', fields: [
    { name: 'Caller', type: 'string', method: 'extract', value: 'Ava from Contoso', conf: 0.93 },
    { name: 'MessageSummary', type: 'string', method: 'generate', value: 'Ava followed up on last week\'s meeting; Contoso can meet the price expectations and wants to discuss next steps.', conf: 0.88 },
    { name: 'RequestedActions', type: 'string', method: 'generate', value: 'Call back or email to discuss next steps.', conf: 0.86 },
    { name: 'CallbackNumber', type: 'string', method: 'extract', value: '555-12345', conf: 0.95 },
    { name: 'AlternativeContact', type: 'string', method: 'extract', value: 'Ava@contoso.com', conf: 0.94 },
    { name: 'Sentiment', type: 'string', method: 'classify', value: 'positive', conf: 0.81 },
  ] },
  image: { analyzer: 'custom image analyzer', label: 'Meeting snapshot (image)', preview: 'Camera image: one person in a conference room, three remote attendees on screen.', fields: [
    { name: 'Location', type: 'string', method: 'classify', value: 'Conference room', conf: 0.9 },
    { name: 'InPersonAttendees', type: 'integer', method: 'extract', value: 1, conf: 0.92 },
    { name: 'RemoteAttendees', type: 'integer', method: 'extract', value: 3, conf: 0.89 },
    { name: 'TotalAttendees', type: 'integer', method: 'generate', value: 4, conf: 0.9 },
  ] },
  video: { analyzer: 'prebuilt-videoSearch (+ custom fields)', label: 'Recorded meeting (video)', preview: '42-minute project meeting recording with screen share.', fields: [
    { name: 'Segments', type: 'array<object>', method: 'extract', value: [{ start: '00:00', end: '06:10', topic: 'Status update' }, { start: '06:10', end: '30:45', topic: 'Budget review' }], conf: 0.84 },
    { name: 'Speakers', type: 'array<string>', method: 'extract', value: ['Speaker 1', 'Speaker 2', 'Speaker 3'], conf: 0.86 },
    { name: 'DiscussionSummary', type: 'string', method: 'generate', value: 'The team reviewed progress and agreed to cut cloud spend 10% next quarter.', conf: 0.83 },
    { name: 'ActionItems', type: 'array<string>', method: 'generate', value: ['Finance to revise budget by Friday', 'Ops to right-size VMs'], conf: 0.8 },
  ] },
};
export function SchemaBuilder() {
  const [ct, setCt] = useState<keyof typeof CONTENT>('invoice');
  const c = CONTENT[ct];
  const [on, setOn] = useState<Record<string, boolean>>({});
  const isOn = (n: string) => on[`${ct}.${n}`] ?? true;
  const result = { analyzerId: c.analyzer.split(' ')[0], status: 'Succeeded', contents: [{ fields: Object.fromEntries(c.fields.filter((f) => isOn(f.name)).map((f) => [f.name, { type: f.type, value: f.value, confidence: f.conf }])) }] };
  return (
    <SimFrame title="Content Understanding: schema builder" icon="Braces"
      controls={<Seg label="Content type" value={ct} onChange={setCt} options={Object.entries(CONTENT).map(([k, v]) => ({ value: k as keyof typeof CONTENT, label: v.label.split(' (')[0] }))} />}
      shows="An analyzer applies your schema to content and returns structured JSON. Some fields are extracted verbatim, some classified, some generated (e.g. summaries). The same approach works across documents, images, audio and video."
      omits="Results are representative; the real API returns additional metadata (markdown/transcript, spans, grounding, timestamps).">
      <p className="text-xs text-gray-400 mb-1">{c.label} · analyzer <code className="text-cyan-200">{c.analyzer}</code></p>
      <p className="text-sm text-gray-200 rounded-lg bg-white/5 p-2.5 mb-3 italic">{c.preview}</p>
      <div className="grid md:grid-cols-[1fr_1.3fr] gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Schema fields</p>
          {c.fields.map((f) => (
            <label key={f.name} className="flex items-center gap-2 text-sm rounded-lg px-2 py-1.5 hover:bg-white/5 cursor-pointer">
              <input type="checkbox" checked={isOn(f.name)} onChange={(e) => setOn({ ...on, [`${ct}.${f.name}`]: e.target.checked })} />
              <span className="text-gray-100 flex-1">{f.name}</span>
              <span className="text-[10px] font-mono text-gray-500">{f.type}</span>
              <span className={`text-[10px] px-1.5 rounded ${f.method === 'generate' ? 'bg-violet-500/20 text-violet-200' : f.method === 'classify' ? 'bg-amber-500/20 text-amber-200' : 'bg-cyan-500/20 text-cyan-200'}`}>{f.method}</span>
            </label>
          ))}
        </div>
        <pre className="text-[11px] font-mono bg-black/40 rounded-xl p-3 overflow-auto max-h-80 text-gray-200">{JSON.stringify(result, null, 2)}</pre>
      </div>
    </SimFrame>
  );
}
