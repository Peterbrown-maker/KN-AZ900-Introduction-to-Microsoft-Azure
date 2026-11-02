import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import type { SimId } from '../types';

// Each simulation module is code-split so a lesson only downloads the labs it uses.
const pick = <M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M) =>
  lazy(() => load().then((m) => ({ default: m[name] as ComponentType })));

const foundations = () => import('./foundations');
const drills = () => import('./drills');
const ml = () => import('./ml');
const genai = () => import('./genai');
const prompting = () => import('./prompting');
const rag = () => import('./rag');
const agents = () => import('./agents');
const nlp = () => import('./nlp');
const speech = () => import('./speech');
const vision = () => import('./vision');
const docs = () => import('./docs');
const responsible = () => import('./responsible');
const azure = () => import('./azure');
const map = () => import('./conceptMap');

const registry: Record<SimId, LazyExoticComponent<ComponentType>> = {
  'electric-brain': pick(foundations, 'ElectricBrain'),
  'neuron-tlu': pick(foundations, 'NeuronTLU'),
  'black-white-box': pick(foundations, 'BlackWhiteBox'),
  'ai-hierarchy': pick(foundations, 'AIHierarchy'),
  'data-to-insight': pick(foundations, 'DataToInsight'),
  'workload-matcher': pick(drills, 'WorkloadMatcher'),
  'train-infer': pick(ml, 'TrainInfer'),
  'supervised-playground': pick(ml, 'SupervisedPlayground'),
  'cluster-playground': pick(ml, 'ClusterPlayground'),
  'rl-gridworld': pick(ml, 'RLGridworld'),
  'learning-compare': pick(ml, 'LearningCompare'),
  'forex-lab': pick(ml, 'ForexLab'),
  'neural-net': pick(ml, 'NeuralNet'),
  'prompt-to-response': pick(genai, 'PromptToResponse'),
  'next-token': pick(genai, 'NextToken'),
  'verify-claims': pick(genai, 'VerifyClaims'),
  tokenizer: pick(genai, 'Tokenizer'),
  'embedding-explorer': pick(genai, 'EmbeddingExplorer'),
  'cosine-lab': pick(genai, 'CosineLab'),
  attention: pick(genai, 'Attention'),
  'transformer-flow': pick(genai, 'TransformerFlow'),
  'conversation-history': pick(prompting, 'ConversationHistory'),
  'prompt-lab': pick(prompting, 'PromptLab'),
  'parameter-playground': pick(prompting, 'ParameterPlayground'),
  'prompt-injection': pick(prompting, 'PromptInjection'),
  'grounding-toggle': pick(rag, 'GroundingToggle'),
  'chunking-lab': pick(rag, 'ChunkingLab'),
  'rag-pipeline': pick(rag, 'RAGPipeline'),
  'rag-diagnose': pick(drills, 'RAGDiagnose'),
  'model-vs-agent': pick(agents, 'ModelVsAgent'),
  'agent-simulator': pick(agents, 'AgentSimulator'),
  'multi-agent': pick(agents, 'MultiAgent'),
  'nlp-lab': pick(nlp, 'NLPLab'),
  'preprocess-lab': pick(nlp, 'PreprocessLab'),
  'tfidf-lab': pick(nlp, 'TfidfLab'),
  'spam-classifier': pick(nlp, 'SpamClassifier'),
  textrank: pick(nlp, 'TextRank'),
  'llm-vs-language': pick(nlp, 'LlmVsLanguage'),
  'speech-sorter': pick(drills, 'SpeechSorter'),
  'speech-stt': pick(speech, 'SpeechSTT'),
  'speech-tts': pick(speech, 'SpeechTTS'),
  prosody: pick(speech, 'Prosody'),
  'vision-lab': pick(vision, 'VisionLab'),
  'convolution-lab': pick(vision, 'ConvolutionLab'),
  'cnn-flow': pick(vision, 'CNNFlow'),
  'vit-patches': pick(vision, 'ViTPatches'),
  diffusion: pick(vision, 'Diffusion'),
  'ocr-pipeline': pick(docs, 'OCRPipeline'),
  'document-lab': pick(docs, 'DocumentLab'),
  'schema-builder': pick(docs, 'SchemaBuilder'),
  'rai-scenarios': pick(responsible, 'RAIScenarios'),
  'confidence-threshold': pick(responsible, 'ConfidenceThreshold'),
  'azure-hierarchy': pick(azure, 'AzureHierarchy'),
  'foundry-architecture': pick(azure, 'FoundryArchitecture'),
  'deployment-config': pick(azure, 'DeploymentConfig'),
  'client-server': pick(azure, 'ClientServer'),
  'solution-designer': pick(drills, 'SolutionDesigner'),
  'concept-map': pick(map, 'ConceptMap'),
  'confused-pairs': pick(drills, 'ConfusedPairs'),
};

export function Sim({ id }: { id: SimId }) {
  const C = registry[id];
  return (
    <Suspense fallback={<div className="h-48 rounded-2xl border border-white/10 grid place-items-center text-sm text-gray-500">Loading simulation…</div>}>
      <C />
    </Suspense>
  );
}
