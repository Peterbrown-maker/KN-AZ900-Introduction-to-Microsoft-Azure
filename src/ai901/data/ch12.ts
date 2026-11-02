import type { Chapter } from '../types';
import { sc, ms, mt, ref } from './helpers';

export const ch12: Chapter = {
  id: 'responsible',
  number: 12,
  title: 'Responsible AI',
  short: 'Responsible AI',
  icon: 'ShieldCheck',
  accent: '#f87171',
  tagline: 'Powerful systems need principled design.',
  description: 'Microsoft\'s six responsible AI principles applied through realistic decisions, plus safeguards: content filters, confidence thresholds, human oversight, evaluation and monitoring.',
  summary: [
    'Six principles: fairness, reliability & safety, privacy & security, inclusiveness, transparency, accountability.',
    'Fairness: no unfounded discrimination. Reliability & safety: avoid harm; use confidence thresholds.',
    'Privacy & security: protect personal data; delete when no longer needed; restrict access.',
    'Inclusiveness: usable by everyone (e.g. captions for speech systems). Transparency: disclose AI use and data characteristics.',
    'Accountability: people remain responsible for AI systems and their outcomes.',
    'Responsible AI spans the whole life cycle — conception, design, implementation and operation.',
  ],
  lessons: [
    {
      id: 'l12-principles',
      title: 'The six principles',
      minutes: 12,
      sources: ['notes', 'supplemental'],
      objectives: ['Name and describe Microsoft\'s six responsible AI principles.', 'Map example practices to principles.'],
      intro: 'Responsible AI describes the guardrails that mitigate the risk of harmful, illegal or offensive content generation or automated actions — considered from conception through design, implementation and operation.',
      blocks: [
        { kind: 'callout', tone: 'note', title: 'Gap in the notes', text: 'Your notes say "Principles for responsible AI include:" but the list itself was not captured (it is an image on Microsoft Learn). The six principles below are Microsoft\'s published responsible AI principles and match the AI-901 objectives exactly.' },
        { kind: 'table', headers: ['Principle', 'Core question', 'Example from the notes'], rows: [
          ['**Fairness**', 'Does the system treat all people fairly?', 'A college admissions system tested to evaluate applications on relevant academic criteria, avoiding discrimination on irrelevant demographics.'],
          ['**Reliability & safety**', 'Does it perform reliably and avoid harm?', 'A robot only acts on object identification when confidence exceeds a threshold.'],
          ['**Privacy & security**', 'Is personal data protected?', 'Airport facial identification deletes temporary images when no longer needed and restricts who can view them.'],
          ['**Inclusiveness**', 'Can everyone use and benefit from it?', 'A speech-based agent also generates text captions for users with hearing impairments.'],
          ['**Transparency**', 'Do people understand that and how AI is used?', 'A bank discloses AI use in loan approval and describes its training data (without revealing confidential information).'],
          ['**Accountability**', 'Who is responsible?', 'People and organisations remain answerable — governance, oversight, ability to override.'],
        ] },
        { kind: 'callout', tone: 'tip', title: 'Memory aid', text: 'Fairness and Reliability come first; then Privacy, Inclusiveness, Transparency, Accountability — "**F**riendly **R**obots **P**rotect **I**nclusive, **T**ransparent **A**ctions". Some sources note that transparency and accountability underpin the other four.' },
        { kind: 'p', text: '**Content filters** are one mechanism (for example blocking a computing-history assistant from helping with illegal or harmful activity), but no single tool makes a system responsible. It requires decisions at every stage.' },
      ],
      terms: [
        { term: 'Fairness', def: 'AI systems should treat all people fairly and avoid unfounded discrimination.' },
        { term: 'Reliability and safety', def: 'AI systems should perform reliably and safely, avoiding unintended harm.' },
        { term: 'Privacy and security', def: 'AI systems should be secure and respect privacy.' },
        { term: 'Inclusiveness', def: 'AI systems should empower and engage everyone, including people with disabilities.' },
        { term: 'Transparency', def: 'AI systems should be understandable; users should know when AI is used and its limits.' },
        { term: 'Accountability', def: 'People should be accountable for AI systems.' },
      ],
      traps: [{ claim: 'Adding a content filter makes an AI solution responsible.', truth: 'Filters help, but responsible AI requires consideration across the full life cycle and all six principles.' }],
      memory: 'FRPITA — Fair, Reliable, Private, Inclusive, Transparent, Accountable.',
      recap: ['Six principles.', 'Each maps to concrete practices.', 'Apply them from idea to operation.'],
      references: [ref.aiConcepts, ref.rai],
      checks: [
        mt('q12-1a', 'Match each practice to its principle.', [
          ['Provide captions for a voice agent', 'Inclusiveness'], ['Disclose that a loan decision used AI', 'Transparency'], ['Delete biometric images after use', 'Privacy and security'], ['Test admissions outcomes across demographic groups', 'Fairness'],
        ], 'Captions make a voice system usable by people with hearing impairments (inclusiveness); disclosure is transparency; deleting biometric data is privacy and security; testing by group is fairness.'),
      ],
      objectiveIds: ['rai-fair', 'rai-rel', 'rai-priv', 'rai-incl', 'rai-trans', 'rai-acc'],
    },
    {
      id: 'l12-scenarios',
      title: 'Responsible AI in practice: decision scenarios',
      minutes: 15,
      sources: ['notes', 'supplemental'],
      objectives: ['Apply responsible AI principles to realistic decisions.', 'Identify which principle is at stake in a scenario.'],
      intro: 'Principles are easy to list and hard to apply. Make the call in each scenario, see the consequences, and learn which principle applies.',
      blocks: [
        { kind: 'sim', id: 'rai-scenarios', caption: 'Eight realistic decisions across banking, healthcare, retail, cybersecurity and your forex project.' },
        { kind: 'h', text: 'Questions to ask in any scenario' },
        { kind: 'list', items: [
          '**Fairness** — Who could be disadvantaged? Is the data representative? Have outcomes been tested by group?',
          '**Reliability & safety** — What happens when the model is wrong? Are there confidence thresholds and fallbacks?',
          '**Privacy & security** — What personal data is used, stored and for how long? Who can access it?',
          '**Inclusiveness** — Can people with disabilities, different languages or low connectivity use it?',
          '**Transparency** — Do users know AI is involved? Can decisions be explained?',
          '**Accountability** — Who signs off, monitors and can override? Is there an appeal process?',
        ] },
      ],
      terms: [{ term: 'Impact assessment', def: 'A structured review of who may be affected by an AI system and how.' }],
      traps: [{ claim: 'If a model is accurate overall, it is fair.', truth: 'Overall accuracy can hide poor performance for specific groups. Measure by group.' }],
      memory: 'Ask "who could be harmed, and who answers for it?"',
      recap: ['Scenarios often involve several principles.', 'Look for the primary one in exam questions.', 'Human oversight is a recurring answer.'],
      references: [ref.rai],
      checks: [
        sc('q12-2a', 'A bank\'s AI loan system declines applicants without telling them AI was involved. Which principle is most directly violated?', [
          ['Transparency', 'Correct.'], ['Inclusiveness', 'Not the main issue.'], ['Reliability and safety', 'Not the main issue.'],
        ], 0, ''),
        sc('q12-2b', 'A facial identification system keeps all images of travellers indefinitely and lets any staff member browse them. Which principle is violated?', [
          ['Privacy and security', 'Correct.'], ['Fairness', 'Not primarily.'], ['Inclusiveness', 'No.'],
        ], 0, ''),
      ],
      objectiveIds: ['rai-fair', 'rai-rel', 'rai-priv', 'rai-incl', 'rai-trans', 'rai-acc'],
    },
    {
      id: 'l12-safeguards',
      title: 'Safeguards: filters, thresholds and human oversight',
      minutes: 12,
      sources: ['notes', 'official', 'supplemental'],
      objectives: ['Describe content filters and content safety.', 'Use confidence thresholds to balance automation and safety.', 'Explain human oversight patterns.'],
      intro: 'Principles become real through safeguards built into the system.',
      blocks: [
        { kind: 'h', text: 'Content filters and content safety' },
        { kind: 'p', text: 'Models deployed in Microsoft Foundry are protected by **content filtering** (Azure AI Content Safety), which screens prompts and completions for categories such as hate, sexual content, violence and self-harm at configurable severity levels, and can detect jailbreak / prompt-injection attempts (prompt shields) and protected material.' },
        { kind: 'h', text: 'Confidence thresholds' },
        { kind: 'sim', id: 'confidence-threshold', caption: 'Set the robot\'s confidence threshold. Watch the trade-off between automation, mistakes and escalations.' },
        { kind: 'p', text: 'A higher threshold means fewer mistakes but more cases handed to humans; a lower threshold automates more but risks harm. The right threshold depends on the **cost of an error**: a photo-tagging app can tolerate mistakes; a medical or physical-robot system cannot.' },
        { kind: 'h', text: 'Human oversight patterns' },
        { kind: 'table', headers: ['Pattern', 'Example'], rows: [
          ['Human approval before action', 'Agent drafts a refund; a person approves it'],
          ['Human review of low-confidence results', 'Invoice fields below 0.80 confidence go to a clerk'],
          ['Escalation on sensitive topics', 'Health questions are routed to a clinician'],
          ['Override and appeal', 'Customers can contest an automated decision'],
          ['Monitoring dashboards', 'Track error rates by group over time'],
        ] },
      ],
      terms: [
        { term: 'Content filter', def: 'A safeguard that detects and blocks harmful prompts or outputs.' },
        { term: 'Azure AI Content Safety', def: 'Azure service for detecting harmful content and prompt attacks.' },
        { term: 'Confidence threshold', def: 'Minimum confidence required before a system acts automatically.' },
      ],
      traps: [{ claim: 'A higher confidence threshold always makes a system better.', truth: 'It reduces errors but increases escalations and may reduce usefulness; choose based on the cost of errors.' }],
      memory: 'Filter what goes in and out; threshold what acts; human for what matters.',
      recap: ['Content filters screen prompts and completions.', 'Thresholds trade automation for safety.', 'Humans approve, review, override.'],
      references: [ref.aiConcepts, ref.rai],
      checks: [
        sc('q12-3a', 'Raising a vision robot\'s action threshold from 0.6 to 0.95 will most likely…', [
          ['Reduce incorrect actions but increase cases needing human help.', 'Correct.'], ['Increase incorrect actions.', 'Opposite.'], ['Have no effect.', 'It changes behaviour.'],
        ], 0, ''),
      ],
      objectiveIds: ['rai-rel', 'rai-acc'],
    },
    {
      id: 'l12-deploy',
      title: 'Responsible deployment, evaluation and monitoring',
      minutes: 10,
      sources: ['official', 'supplemental'],
      objectives: ['Describe evaluation of AI quality and safety in Foundry.', 'Outline a responsible deployment life cycle.'],
      intro: 'Responsibility does not end at launch. Systems must be evaluated before release and monitored after.',
      blocks: [
        { kind: 'steps', items: [
          { title: 'Identify', text: 'Map potential harms through impact assessment and red-teaming (deliberately trying to make the system fail).' },
          { title: 'Measure', text: 'Evaluate quality and safety with test sets and evaluators.' },
          { title: 'Mitigate', text: 'Apply layered mitigations: model choice, system prompt, grounding, content filters, UX design, human oversight.' },
          { title: 'Operate', text: 'Monitor, collect feedback, respond to incidents, re-evaluate when anything changes.' },
        ] },
        { kind: 'p', text: 'In Foundry, **evaluators** measure the quality, safety and effectiveness of model or agent outputs. Classic NLP metrics include accuracy, precision, recall and F1; **AI-assisted metrics** include groundedness, relevance, coherence, fluency and similarity. **Safety evaluators** scan for harmful or unsafe content, bias and protected-class harms. Evaluators **detect and score issues but do not resolve them** — mitigation is up to you.' },
        { kind: 'list', items: ['Publish transparency notes / model cards describing capabilities and limits.', 'Log decisions and tool calls for audit.', 'Monitor drift and outcomes by group.', 'Provide feedback and appeal channels.'] },
      ],
      terms: [
        { term: 'Evaluator', def: 'A Foundry component that scores outputs for quality or safety.' },
        { term: 'Red-teaming', def: 'Adversarial testing to discover how a system can fail or be misused.' },
        { term: 'Model card', def: 'Documentation of a model\'s intended use, data and limitations.' },
      ],
      traps: [{ claim: 'Foundry evaluators automatically fix unsafe outputs.', truth: 'Evaluators detect, scan and score issues; they don\'t actively resolve them.' }],
      memory: 'Identify, Measure, Mitigate, Operate.',
      recap: ['Evaluate before release.', 'Mitigate in layers.', 'Monitor after release.'],
      references: [ref.foundryGenAI, ref.rai],
      checks: [
        ms('q12-4a', 'Which are AI-assisted quality metrics available in Foundry evaluation? (Choose all that apply.)', [
          ['Groundedness', 'Yes.'], ['Relevance', 'Yes.'], ['Coherence', 'Yes.'], ['Disk throughput', 'No.'],
        ], [0, 1, 2], ''),
      ],
      objectiveIds: ['rai-acc', 'rai-rel', 'rai-trans'],
    },
  ],
  quiz: [
    sc('c12-1', 'A speech agent provides text captions so it can be used by people with hearing impairments. Which principle?', [
      ['Inclusiveness', 'Correct.'], ['Transparency', 'No.'], ['Fairness', 'Related, but inclusiveness is the specific principle.'],
    ], 0, ''),
    sc('c12-2', 'An organisation assigns a named team to approve, monitor and, if necessary, shut down its AI system. Which principle?', [
      ['Accountability', 'Correct.'], ['Privacy', 'No.'], ['Inclusiveness', 'No.'],
    ], 0, ''),
    sc('c12-3', 'A hiring model rejects more qualified women than men. Which principle is violated?', [
      ['Fairness', 'Correct.'], ['Reliability', 'Not primarily.'], ['Transparency', 'Not primarily.'],
    ], 0, ''),
    ms('c12-4', 'Which are effective safeguards? (Choose all that apply.)', [
      ['Content filters on prompts and completions', 'Yes.'], ['Confidence thresholds before automated action', 'Yes.'], ['Human review of high-impact decisions', 'Yes.'], ['Hiding AI use from users', 'Violates transparency.'],
    ], [0, 1, 2], ''),
    mt('c12-5', 'Match the principle to the question it asks.', [
      ['Reliability & safety', 'What happens when it\'s wrong?'], ['Transparency', 'Do users know AI is involved?'], ['Privacy & security', 'Is personal data protected?'], ['Accountability', 'Who answers for outcomes?'],
    ], 'Reliability and safety asks what happens when the system errs; transparency asks whether people know AI is involved; privacy asks whether data is protected; accountability asks who answers for outcomes.'),
  ],
};
