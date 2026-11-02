// Official "Skills measured" for Exam AI-901 (as of April 15, 2026), taken from the
// Microsoft Learn study guide. Lessons reference these ids via `objectiveIds`.
// Source: https://learn.microsoft.com/credentials/certifications/resources/study-guides/ai-901

export interface Objective {
  id: string;
  domain: 'concepts' | 'foundry';
  group: string;
  text: string;
}

export const domains = {
  concepts: { label: 'Identify AI concepts and capabilities', weight: '40–45%' },
  foundry: { label: 'Implement AI solutions by using Microsoft Foundry', weight: '55–60%' },
} as const;

export const objectives: Objective[] = [
  // Responsible AI
  { id: 'rai-fair', domain: 'concepts', group: 'Describe principles of responsible AI', text: 'Describe considerations for fairness in an AI solution' },
  { id: 'rai-rel', domain: 'concepts', group: 'Describe principles of responsible AI', text: 'Describe considerations for reliability and safety in an AI solution' },
  { id: 'rai-priv', domain: 'concepts', group: 'Describe principles of responsible AI', text: 'Describe considerations for privacy and security in an AI solution' },
  { id: 'rai-incl', domain: 'concepts', group: 'Describe principles of responsible AI', text: 'Describe considerations for inclusiveness in an AI solution' },
  { id: 'rai-trans', domain: 'concepts', group: 'Describe principles of responsible AI', text: 'Describe considerations for transparency in an AI solution' },
  { id: 'rai-acc', domain: 'concepts', group: 'Describe principles of responsible AI', text: 'Describe considerations for accountability in an AI solution' },
  // Model components
  { id: 'model-how', domain: 'concepts', group: 'Identify AI model components and configurations', text: 'Describe how generative AI models work' },
  { id: 'model-pick', domain: 'concepts', group: 'Identify AI model components and configurations', text: 'Identify an appropriate AI model, based on capabilities' },
  { id: 'model-deploy', domain: 'concepts', group: 'Identify AI model components and configurations', text: 'Identify appropriate model deployment options and configuration parameters' },
  // Workloads
  { id: 'wl-scen', domain: 'concepts', group: 'Identify AI workloads', text: 'Identify scenarios for common AI workloads, including generative and agentic AI, text analysis, speech, computer vision, and information extraction' },
  { id: 'wl-text', domain: 'concepts', group: 'Identify AI workloads', text: 'Describe common text analysis techniques, including keyword extraction, entity detection, sentiment analysis, and summarization' },
  { id: 'wl-speech', domain: 'concepts', group: 'Identify AI workloads', text: 'Identify features and capabilities of speech recognition and speech synthesis' },
  { id: 'wl-vision', domain: 'concepts', group: 'Identify AI workloads', text: 'Identify features and capabilities of computer vision and image-generation models' },
  { id: 'wl-extract', domain: 'concepts', group: 'Identify AI workloads', text: 'Identify techniques to extract information from text, images, audio, and videos' },
  // Gen AI & agents in Foundry
  { id: 'f-prompts', domain: 'foundry', group: 'Implement generative AI apps and agents by using Foundry', text: 'Create effective system and user prompts for generative AI models' },
  { id: 'f-deploy', domain: 'foundry', group: 'Implement generative AI apps and agents by using Foundry', text: 'Deploy a model and interact with it in the Foundry portal' },
  { id: 'f-chat', domain: 'foundry', group: 'Implement generative AI apps and agents by using Foundry', text: 'Create a lightweight chat client application by using the Foundry SDK' },
  { id: 'f-agent', domain: 'foundry', group: 'Implement generative AI apps and agents by using Foundry', text: 'Create and test a single-agent solution in the Foundry portal' },
  { id: 'f-agent-client', domain: 'foundry', group: 'Implement generative AI apps and agents by using Foundry', text: 'Create a lightweight client application for an agent' },
  // Text and speech
  { id: 'f-text', domain: 'foundry', group: 'Implement AI solutions for text and speech by using Foundry', text: 'Build a lightweight application that includes text analysis' },
  { id: 'f-spoken', domain: 'foundry', group: 'Implement AI solutions for text and speech by using Foundry', text: 'Respond to spoken prompts by using a deployed multimodal model' },
  { id: 'f-speech', domain: 'foundry', group: 'Implement AI solutions for text and speech by using Foundry', text: 'Build a lightweight application by using Azure Speech in Foundry Tools' },
  // Vision
  { id: 'f-vis-in', domain: 'foundry', group: 'Implement AI solutions with computer vision and image-generation capabilities by using Foundry', text: 'Interpret visual input in prompts by using a deployed multimodal model' },
  { id: 'f-vis-gen', domain: 'foundry', group: 'Implement AI solutions with computer vision and image-generation capabilities by using Foundry', text: 'Create new visual outputs by using generative models' },
  { id: 'f-vis-app', domain: 'foundry', group: 'Implement AI solutions with computer vision and image-generation capabilities by using Foundry', text: 'Build a lightweight application that includes vision capabilities' },
  // Information extraction
  { id: 'f-cu-doc', domain: 'foundry', group: 'Implement AI solutions for information extraction by using Foundry', text: 'Extract information from documents and forms by using Azure Content Understanding in Foundry Tools' },
  { id: 'f-cu-img', domain: 'foundry', group: 'Implement AI solutions for information extraction by using Foundry', text: 'Extract information from images by using Content Understanding' },
  { id: 'f-cu-av', domain: 'foundry', group: 'Implement AI solutions for information extraction by using Foundry', text: 'Extract information from audio and video by using Content Understanding' },
  { id: 'f-cu-app', domain: 'foundry', group: 'Implement AI solutions for information extraction by using Foundry', text: 'Build a lightweight application with information extraction capabilities by using Content Understanding' },
];
