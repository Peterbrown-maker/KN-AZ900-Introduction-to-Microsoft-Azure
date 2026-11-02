import { ChoiceDrill, type DrillItem } from './ChoiceDrill';

const workloads = ['Generative AI & agents', 'Text analysis', 'Speech', 'Computer vision', 'Information extraction'];

const workloadItems: DrillItem[] = [
  { prompt: 'A bank wants to read cheque amounts and payee names from scanned images into its ledger.', answer: 'Information extraction', why: 'OCR plus field mapping turns scanned documents into structured fields.' },
  { prompt: 'A retailer\'s cameras count how many cereal boxes remain on each shelf.', answer: 'Computer vision', why: 'Object detection locates and counts items in images.' },
  { prompt: 'An online shop flags product reviews as positive, neutral or negative.', answer: 'Text analysis', why: 'Sentiment analysis is a form of text classification.' },
  { prompt: 'A help desk assistant answers questions and resets passwords by calling an IT system.', answer: 'Generative AI & agents', why: 'Reasoning in natural language plus an action tool = an agent.' },
  { prompt: 'A clinic transcribes doctors\' spoken notes into electronic health records.', answer: 'Speech', why: 'Speech recognition (speech-to-text).' },
  { prompt: 'A security team redacts names and card numbers from chat logs before analysis.', answer: 'Text analysis', why: 'PII detection and redaction is a text-analysis technique.' },
  { prompt: 'A museum app describes uploaded photos of vintage computers.', answer: 'Computer vision', why: 'Multimodal image analysis generates descriptions of images.' },
  { prompt: 'A forex research tool drafts a plain-English summary of this week\'s economic calendar.', answer: 'Generative AI & agents', why: 'Generating a new summary is a generative AI task.' },
  { prompt: 'An insurer pulls policy numbers and claim amounts from emailed claim forms.', answer: 'Information extraction', why: 'Extracting fields from forms is information extraction.' },
  { prompt: 'A car assistant confirms "Navigation set to the airport" out loud.', answer: 'Speech', why: 'Speech synthesis (text-to-speech).' },
];

export const WorkloadMatcher = () => (
  <ChoiceDrill title="Workload matcher" icon="Shapes" buckets={workloads} items={workloadItems}
    intro="Decide which AI workload each scenario belongs to."
    shows="How scenario wording maps to the five AI workloads." omits="Real solutions often combine several workloads (e.g. speech + generative AI)." />
);

const speechItems: DrillItem[] = [
  { prompt: 'Live captions appear during a video meeting.', answer: 'Recognition', why: 'Audio → text.' },
  { prompt: 'An e-book app reads a chapter aloud.', answer: 'Synthesis', why: 'Text → audio.' },
  { prompt: 'A caller says "billing" and is routed to the billing team.', answer: 'Recognition', why: 'The system must understand spoken words.' },
  { prompt: 'A voice agent listens to a question and answers out loud.', answer: 'Both', why: 'Recognition for input, synthesis for output — speech-to-speech.' },
  { prompt: 'A warehouse system announces "Aisle 4 blocked" over speakers.', answer: 'Synthesis', why: 'Generating spoken alerts from text.' },
  { prompt: 'A language-learning app listens to your pronunciation and replies with corrections.', answer: 'Both', why: 'Recognises your speech and speaks feedback.' },
  { prompt: 'Call-centre recordings are turned into searchable text.', answer: 'Recognition', why: 'Batch transcription.' },
  { prompt: 'A podcast draft is produced from a written script.', answer: 'Synthesis', why: 'Text-to-speech voiceover.' },
];

export const SpeechSorter = () => (
  <ChoiceDrill title="Recognition or synthesis?" icon="AudioLines" buckets={['Recognition', 'Synthesis', 'Both']} items={speechItems}
    shows="The direction of conversion: recognition = audio → text, synthesis = text → audio." omits="Translation and analysis steps that often sit between them." />
);

const ragItems: DrillItem[] = [
  { prompt: 'The question was about hotel limits, but the retrieved chunks are all about flights.', answer: 'Retrieval: relevance', why: 'The search returned the wrong content. Fix chunking, metadata, query processing or ranking — not the generation prompt.' },
  { prompt: 'The correct chunk was retrieved, but the answer adds a meal allowance that isn\'t in it.', answer: 'Generation: groundedness', why: 'The model made a claim unsupported by the context. Strengthen "answer only from context" instructions and evaluate groundedness.' },
  { prompt: 'The answer quotes a taxi limit that was changed three months ago.', answer: 'Retrieval: freshness', why: 'The index contains outdated content. Update and re-index sources; remove obsolete documents.' },
  { prompt: 'A contractor receives content from an executive-only policy.', answer: 'Retrieval: security', why: 'Access controls / permission filters were not applied at retrieval time.' },
  { prompt: 'Nothing relevant exists in the data, yet the assistant confidently invents a policy.', answer: 'Generation: appropriate uncertainty', why: 'The app should say it couldn\'t find the answer rather than guess.' },
  { prompt: 'The citation links to a page that does not support the claim it is attached to.', answer: 'Generation: citation quality', why: 'Citations must point to sources that support the associated claims.' },
  { prompt: 'Only half of a two-part policy rule is retrieved because the chunk boundary split it.', answer: 'Retrieval: coverage', why: 'Adjust chunk size and overlap so related statements stay together.' },
];

export const RAGDiagnose = () => (
  <ChoiceDrill title="RAG diagnostics" icon="Stethoscope"
    buckets={['Retrieval: relevance', 'Retrieval: coverage', 'Retrieval: freshness', 'Retrieval: security', 'Generation: groundedness', 'Generation: citation quality', 'Generation: appropriate uncertainty']}
    items={ragItems} intro="Each answer below failed. Identify the pipeline stage and criterion at fault."
    shows="Evaluating retrieval and generation separately, as the RAG module recommends." omits="Real evaluation uses test sets and automated evaluators across many questions." />
);

const services = [
  'Generative model (model catalog)', 'Foundry agent with tools', 'Foundry IQ knowledge base', 'Azure Language', 'Azure Speech', 'Azure Speech Voice Live',
  'Multimodal model', 'Azure Vision', 'Image-generation model', 'Azure Content Understanding', 'Azure AI Content Safety',
];

const solutionItems: DrillItem[] = [
  { prompt: 'Draft personalised marketing emails from a short product brief.', answer: 'Generative model (model catalog)', why: 'Open-ended text generation from a prompt.' },
  { prompt: 'Detect and redact PHI in 50,000 clinical notes with consistent, auditable output.', answer: 'Azure Language', why: 'Deterministic PII/PHI detection for automated pipelines.' },
  { prompt: 'Employees ask questions about HR policies stored in SharePoint; answers must cite sources and respect permissions.', answer: 'Foundry IQ knowledge base', why: 'Permission-aware, multi-source knowledge with agentic retrieval and citations.' },
  { prompt: 'An IT assistant answers questions AND creates tickets in the service desk system.', answer: 'Foundry agent with tools', why: 'Actions require an agent with an action tool.' },
  { prompt: 'Transcribe 2,000 recorded sales calls overnight.', answer: 'Azure Speech', why: 'Batch speech-to-text.' },
  { prompt: 'A phone-based concierge that holds natural, interruptible voice conversations in real time.', answer: 'Azure Speech Voice Live', why: 'Managed real-time speech-to-speech for voice agents.' },
  { prompt: 'Users upload a photo of a broken appliance and ask "what part is this and how do I replace it?"', answer: 'Multimodal model', why: 'Free-form questions about an image in a prompt.' },
  { prompt: 'Generate tags and a caption for every image in a photo library using a prebuilt service.', answer: 'Azure Vision', why: 'Prebuilt image analysis — tags and captions.' },
  { prompt: 'Create concept artwork for a new board game from a text description.', answer: 'Image-generation model', why: 'Creating new visual output.' },
  { prompt: 'Extract vendor, line items and totals from invoices — and caller details from voicemails — into JSON.', answer: 'Azure Content Understanding', why: 'Schema-based extraction across documents and audio.' },
  { prompt: 'Block hateful content and jailbreak attempts in a public chatbot.', answer: 'Azure AI Content Safety', why: 'Content filters and prompt shields.' },
  { prompt: 'Summarise long research reports into executive briefings.', answer: 'Generative model (model catalog)', why: 'Abstractive summarisation with a capable model.' },
  { prompt: 'Determine the language of incoming messages and return an ISO code and confidence score.', answer: 'Azure Language', why: 'Language detection is a prebuilt Azure Language analyzer.' },
  { prompt: 'Count attendees in conference-room camera snapshots and return the numbers as structured fields.', answer: 'Azure Content Understanding', why: 'Image analysis with a schema returns structured fields (Location, attendees…).' },
];

export const SolutionDesigner = () => (
  <ChoiceDrill title="Azure solution designer" icon="Blocks" buckets={services} items={solutionItems}
    intro="Match each requirement to the best Microsoft Foundry capability."
    shows="Service selection by input, output, predictability, knowledge and action needs." omits="Many production designs combine several of these; cost and region availability also matter." />
);

const pairs: DrillItem[] = [
  { prompt: 'Your policy changes monthly and answers must stay current without retraining.', options: ['RAG', 'Fine-tuning'], answer: 'RAG', why: 'RAG supplies knowledge at run time; update the index.' },
  { prompt: 'You need the model to permanently adopt a specialised writing style from 5,000 examples.', options: ['RAG', 'Fine-tuning'], answer: 'Fine-tuning', why: 'Changing behaviour/weights from many examples is fine-tuning.' },
  { prompt: 'Draw rectangles around every pedestrian.', options: ['Object detection', 'Semantic segmentation'], answer: 'Object detection', why: 'Boxes = detection.' },
  { prompt: 'Identify exactly which pixels are road surface.', options: ['Object detection', 'Semantic segmentation'], answer: 'Semantic segmentation', why: 'Pixel-level = segmentation.' },
  { prompt: 'Predict tomorrow\'s EUR/USD closing price.', options: ['Regression', 'Classification'], answer: 'Regression', why: 'A numeric value. (Predicting it accurately is another matter!)' },
  { prompt: 'Predict whether a transaction is fraudulent.', options: ['Regression', 'Classification'], answer: 'Classification', why: 'A category.' },
  { prompt: '"You are a polite banking assistant. Never give investment advice."', options: ['System prompt', 'User prompt'], answer: 'System prompt', why: 'Behaviour and constraints.' },
  { prompt: '"What\'s the fee for an international transfer?"', options: ['System prompt', 'User prompt'], answer: 'User prompt', why: 'A specific request.' },
  { prompt: 'Tool that looks up order status in a database.', options: ['Knowledge tool', 'Action tool'], answer: 'Knowledge tool', why: 'Reads information.' },
  { prompt: 'Tool that cancels an order.', options: ['Knowledge tool', 'Action tool'], answer: 'Action tool', why: 'Changes state.' },
  { prompt: 'A summary that reuses the three most central sentences verbatim.', options: ['Extractive', 'Abstractive'], answer: 'Extractive', why: 'Selected original sentences.' },
  { prompt: 'A summary written in new words by an LLM.', options: ['Extractive', 'Abstractive'], answer: 'Abstractive', why: 'Generated text.' },
  { prompt: 'Return the raw text and its positions from a scanned page.', options: ['OCR', 'Field extraction'], answer: 'OCR', why: 'Reading text, without meaning.' },
  { prompt: 'Recognise that "Inv #" 4471 is the InvoiceNumber.', options: ['OCR', 'Field extraction'], answer: 'Field extraction', why: 'Mapping text to meaning.' },
  { prompt: 'A bank tells customers that AI helped assess their application.', options: ['Transparency', 'Accountability'], answer: 'Transparency', why: 'Disclosure and understanding.' },
  { prompt: 'A named committee signs off and can shut down the AI system.', options: ['Transparency', 'Accountability'], answer: 'Accountability', why: 'People answer for outcomes.' },
  { prompt: 'Raw intelligence you call with a prompt.', options: ['Model', 'Agent'], answer: 'Model', why: 'Pure inference.' },
  { prompt: 'Packaged worker with instructions and tools that completes tasks.', options: ['Model', 'Agent'], answer: 'Agent', why: 'Model + instructions + tools.' },
  { prompt: 'The Azure resource that hosts models and quotas.', options: ['Foundry resource', 'Foundry project'], answer: 'Foundry resource', why: 'Resource = platform capabilities.' },
  { prompt: 'A workspace containing one team\'s agents, evaluations and indexes.', options: ['Foundry resource', 'Foundry project'], answer: 'Foundry project', why: 'Project = workspace.' },
];

export const ConfusedPairs = () => (
  <ChoiceDrill title="Commonly confused concepts" icon="SplitSquareHorizontal" items={pairs}
    shows="The decisive difference between concepts exam distractors deliberately blur." omits="Some real scenarios legitimately combine both sides of a pair." />
);
