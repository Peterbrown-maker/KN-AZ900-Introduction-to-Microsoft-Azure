export type SceneType =
  | 'opener'
  | 'slide'
  | 'concept'
  | 'memory'
  | 'exam-trap'
  | 'knowledge-check'
  | 'comparison'
  | 'interaction'
  | 'chapter-complete';

export type InteractionKind =
  | 'load-balancer'
  | 'availability-zones'
  | 'mfa'
  | 'zero-trust'
  | 'rbac'
  | 'encryption'
  | 'defense-in-depth'
  | 'storage-redundancy'
  | 'queue-pressure'
  | 'build-network'
  | 'drag-data'
  | 'conditional-access'
  | 'key-vault'
  | 'service-model-shift'
  | 'resource-hierarchy'
  | 'vm-families'
  | 'region-pairs'
  | 'shared-responsibility'
  | 'sla-calculator'
  | 'pricing-factors'
  | 'compute-chooser'
  | 'architecture-story'
  | 'service-selection'
  | 'identity-scenario'
  | 'security-scenario'
  | 'governance-scenario'
  | 'management-scenario'
  | 'cost-optimization'
  | 'reliability-scenario'
  | 'ai-ml-compare'
  | 'iot-edge'
  | 'data-architecture'
  | 'storage-decision'
  | 'final-assessment';

export interface BaseScene {
  id: string;
  type: SceneType;
  title: string;
}

export interface SlideScene extends BaseScene {
  type: 'slide';
  subtitle?: string;
  body: string;
  visual?: 'cloud-intro' | 'world-map' | 'data-flow' | 'server' | 'network' | 'storage' | 'database' | 'identity' | 'security' | 'governance' | 'management' | 'pricing' | 'reliability' | 'ai' | 'edge';
  bullets?: { icon: string; label: string; detail: string }[];
}

export interface ConceptScene extends BaseScene {
  type: 'concept';
  subtitle?: string;
  body: string;
  icon: string;
  accent?: string;
}

export interface MemoryScene extends BaseScene {
  type: 'memory';
  lines: { text: string; emphasis?: boolean }[];
}

export interface ExamTrapScene extends BaseScene {
  type: 'exam-trap';
  claim: string;
  verdict: 'TRUE' | 'FALSE' | 'PARTIALLY TRUE';
  explanation: string;
}

export interface KnowledgeCheckScene extends BaseScene {
  type: 'knowledge-check';
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  format?: 'multiple-choice' | 'reveal';
}

export interface ComparisonScene extends BaseScene {
  type: 'comparison';
  columns: { label: string; icon: string; accent: string; items: string[] }[];
  verdict?: string;
}

export interface InteractionScene extends BaseScene {
  type: 'interaction';
  kind: InteractionKind;
  description?: string;
}

export interface OpenerScene extends BaseScene {
  type: 'opener';
  chapterNumber: number;
  chapterTitle: string;
  tagline: string;
  items: string[];
}

export interface ChapterCompleteScene extends BaseScene {
  type: 'chapter-complete';
  chapterNumber: number;
  concepts: string[];
  memoryMap: { label: string; children?: string[] }[];
}

export type Scene =
  | OpenerScene
  | SlideScene
  | ConceptScene
  | MemoryScene
  | ExamTrapScene
  | KnowledgeCheckScene
  | ComparisonScene
  | InteractionScene
  | ChapterCompleteScene;

export interface Chapter {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  icon: string;
  accent: string;
  description: string;
  scenes: Scene[];
}

export interface ProgressState {
  completedChapters: number[];
  currentChapter: number;
  currentScene: number;
  knowledgeCheckResults: Record<string, boolean>;
  assessmentScore?: number;
  totalAssessmentQuestions?: number;
}
