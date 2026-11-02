// AI-901 course model. Kept separate from the scene-based AZ-900 / DP-900 types
// because AI-901 is lesson-based with notes, simulations and a question bank.

export type SimId =
  // Chapter 1 — foundations
  | 'electric-brain'
  | 'neuron-tlu'
  | 'black-white-box'
  | 'ai-hierarchy'
  | 'data-to-insight'
  | 'workload-matcher'
  // Chapter 2 — machine learning
  | 'train-infer'
  | 'supervised-playground'
  | 'cluster-playground'
  | 'rl-gridworld'
  | 'learning-compare'
  | 'forex-lab'
  | 'neural-net'
  // Chapter 3 — generative AI
  | 'prompt-to-response'
  | 'next-token'
  | 'verify-claims'
  // Chapter 4 — tokens, embeddings, transformers
  | 'tokenizer'
  | 'embedding-explorer'
  | 'cosine-lab'
  | 'attention'
  | 'transformer-flow'
  // Chapter 5 — prompts
  | 'conversation-history'
  | 'prompt-lab'
  | 'parameter-playground'
  | 'prompt-injection'
  // Chapter 6 — RAG
  | 'grounding-toggle'
  | 'chunking-lab'
  | 'rag-pipeline'
  | 'rag-diagnose'
  // Chapter 7 — agents
  | 'model-vs-agent'
  | 'agent-simulator'
  | 'multi-agent'
  // Chapter 8 — NLP
  | 'nlp-lab'
  | 'preprocess-lab'
  | 'tfidf-lab'
  | 'spam-classifier'
  | 'textrank'
  | 'llm-vs-language'
  // Chapter 9 — speech
  | 'speech-sorter'
  | 'speech-stt'
  | 'speech-tts'
  | 'prosody'
  // Chapter 10 — vision
  | 'vision-lab'
  | 'convolution-lab'
  | 'cnn-flow'
  | 'vit-patches'
  | 'diffusion'
  // Chapter 11 — information extraction
  | 'ocr-pipeline'
  | 'document-lab'
  | 'schema-builder'
  // Chapter 12 — responsible AI
  | 'rai-scenarios'
  | 'confidence-threshold'
  // Chapter 13 — Azure
  | 'azure-hierarchy'
  | 'foundry-architecture'
  | 'deployment-config'
  | 'client-server'
  | 'solution-designer'
  // Chapter 14 — revision
  | 'concept-map'
  | 'confused-pairs';

export type CalloutTone = 'tip' | 'note' | 'warn' | 'trap' | 'forex' | 'verify' | 'correction';

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'list'; items: string[]; ordered?: boolean }
  | { kind: 'table'; headers: string[]; rows: string[][]; caption?: string }
  | { kind: 'callout'; tone: CalloutTone; title?: string; text: string }
  | { kind: 'sim'; id: SimId; caption?: string }
  | { kind: 'code'; lang: string; code: string; caption?: string }
  | { kind: 'steps'; items: { title: string; text: string }[] }
  | { kind: 'formula'; text: string; caption?: string };

export type QuestionType = 'single' | 'multi' | 'order' | 'match';

export interface QOption {
  id: string;
  text: string;
  /** Why this option is right or wrong. Shown after answering. */
  why?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  /** Optional scenario text shown above the prompt. */
  scenario?: string;
  options?: QOption[];
  /** single/multi: correct option ids. */
  correct?: string[];
  /** order: items in their correct order. */
  order?: string[];
  /** match: left → right pairs. */
  pairs?: { left: string; right: string }[];
  explanation: string;
  /** Filled in by the course index. */
  chapterId?: string;
  lessonId?: string;
}

export type SourceTag = 'notes' | 'official' | 'supplemental';

export interface Reference {
  label: string;
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  /** Where the content comes from: supplied notes, verified Microsoft Learn pages, or added material. */
  sources: SourceTag[];
  objectives: string[];
  intro: string;
  blocks: Block[];
  terms?: { term: string; def: string }[];
  traps?: { claim: string; truth: string }[];
  memory?: string;
  recap: string[];
  references: Reference[];
  checks: Question[];
  /** Official AI-901 objective ids covered (see objectives.ts). */
  objectiveIds?: string[];
  /** Requires real hands-on practice in Azure for full exam readiness. */
  handsOn?: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  short: string;
  icon: string;
  accent: string;
  tagline: string;
  description: string;
  lessons: Lesson[];
  quiz: Question[];
  summary: string[];
}
