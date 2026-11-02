import type { Question, Reference } from '../types';

type Opt = [text: string, why?: string];

const ids = 'abcdefgh';
const toOptions = (opts: Opt[]) => opts.map(([text, why], i) => ({ id: ids[i], text, why }));

/** Single-answer multiple choice. `correct` is the zero-based index of the right option. */
export const sc = (id: string, prompt: string, opts: Opt[], correct: number, explanation: string, scenario?: string): Question => ({
  id, type: 'single', prompt, scenario, options: toOptions(opts), correct: [ids[correct]], explanation,
});

/** Choose-all-that-apply. */
export const ms = (id: string, prompt: string, opts: Opt[], correct: number[], explanation: string, scenario?: string): Question => ({
  id, type: 'multi', prompt, scenario, options: toOptions(opts), correct: correct.map((i) => ids[i]), explanation,
});

/** Put the items in order. Pass them in the correct order; the UI shuffles them. */
export const ord = (id: string, prompt: string, order: string[], explanation: string): Question => ({
  id, type: 'order', prompt, order, explanation,
});

/** Match each left item to its right item. */
export const mt = (id: string, prompt: string, pairs: [string, string][], explanation: string): Question => ({
  id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), explanation,
});

const learn = (path: string) => `https://learn.microsoft.com/en-us/training/modules/${path}`;

export const ref = {
  aiConcepts: { label: 'Introduction to AI concepts', url: learn('get-started-ai-fundamentals/') },
  genAI: { label: 'Introduction to generative AI and agents', url: learn('fundamentals-generative-ai/') },
  language: { label: 'Introduction to natural language processing concepts', url: learn('introduction-language/') },
  speech: { label: 'Introduction to AI speech concepts', url: learn('introduction-ai-speech/') },
  vision: { label: 'Introduction to computer vision concepts', url: learn('introduction-computer-vision/') },
  extraction: { label: 'Introduction to AI information extraction concepts', url: learn('introduction-information-extraction/') },
  rag: { label: 'Introduction to retrieval-augmented generation', url: learn('rag-fundamentals/') },
  ml: { label: 'Introduction to machine learning concepts', url: learn('fundamentals-machine-learning/') },
  azureAI: { label: 'Get started with AI in Azure', url: learn('get-started-with-ai-in-azure/') },
  foundryGenAI: { label: 'Get started with generative AI and agents in Azure', url: learn('get-started-with-generative-ai-and-agents/') },
  foundryText: { label: 'Get started with text analysis in Azure', url: learn('get-started-text-analysis-azure/') },
  foundrySpeech: { label: 'Get started with speech in Azure', url: learn('get-started-speech-azure/') },
  foundryVision: { label: 'Get started with computer vision in Azure', url: learn('get-started-vision-azure/') },
  foundryCU: { label: 'Get started with AI-powered information extraction in Azure', url: learn('get-started-information-extraction/') },
  foundryIQ: { label: 'Get started with Microsoft Foundry IQ', url: learn('get-started-foundry-iq/') },
  studyGuide: { label: 'Study guide for Exam AI-901', url: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-901' },
  rai: { label: 'Microsoft responsible AI', url: 'https://www.microsoft.com/ai/responsible-ai' },
  attention: { label: 'Attention Is All You Need (Vaswani et al., 2017)', url: 'https://arxiv.org/abs/1706.03762' },
  llmDict: { label: 'What are large language models (LLMs)?', url: 'https://azure.microsoft.com/resources/cloud-computing-dictionary/what-are-large-language-models-llms' },
  ragDict: { label: 'What is retrieval-augmented generation (RAG)?', url: 'https://azure.microsoft.com/resources/cloud-computing-dictionary/what-is-retrieval-augmented-generation-rag' },
} satisfies Record<string, Reference>;
