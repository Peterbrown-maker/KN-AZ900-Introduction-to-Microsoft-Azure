import type { Chapter } from '../types';
import { sc, ms, mt, ref } from './helpers';

export const ch07: Chapter = {
  id: 'agents',
  number: 7,
  title: 'AI Agents and Agentic Workflows',
  short: 'AI Agents',
  icon: 'Bot',
  accent: '#34d399',
  tagline: 'From answering questions to getting things done.',
  description: 'What agents are, how models, instructions and tools combine, knowledge vs action tools, human approval, multi-agent systems, and building agents in Microsoft Foundry.',
  summary: [
    'An agent = model (brain) + instructions (job description) + tools (hands and reference books).',
    'Knowledge tools provide information (search, databases); action tools perform tasks (email, calendar, devices).',
    'Models = raw intelligence; agents = packaged, task-oriented workers built on that intelligence.',
    'Multi-agent systems split work between specialised agents that communicate through prompts.',
    'Safe agents: least-privilege tools, human approval for consequential actions, logging and monitoring.',
  ],
  lessons: [
    {
      id: 'l7-what',
      title: 'What an agent is: model, instructions, tools',
      minutes: 10,
      sources: ['notes', 'official'],
      objectives: ['Describe the three key elements of an AI agent.', 'Explain how an agent differs from a model.'],
      intro: 'Imagine a digital assistant that doesn\'t just answer questions but actually gets things done. Welcome to the world of AI agents.',
      blocks: [
        { kind: 'p', text: '**Agents** are software applications built on generative AI that can reason over and generate natural language, **automate tasks by using tools**, and respond to contextual conditions to take appropriate action.' },
        { kind: 'table', headers: ['Element', 'Role', 'Analogy'], rows: [
          ['Model (LLM)', 'Language understanding and reasoning', 'The brain'],
          ['Instructions (system prompt)', 'Defines role, behaviour, style, constraints and output rules', 'The job description'],
          ['Tools', 'How the agent interacts with the world', 'Reference books (knowledge) and hands (actions)'],
        ] },
        { kind: 'sim', id: 'model-vs-agent', caption: 'Send the same request to a bare model and to an agent with tools.' },
        { kind: 'h', text: 'Model ≠ agent' },
        { kind: 'p', text: 'Microsoft Learn puts it simply: **models = raw intelligence; agents = packaged, task-oriented workers built on top of that intelligence.** Use a model alone for pure inference ("take this prompt and generate output"). Use an agent when you need consistent, reusable, workflow-like behaviour: calling tools automatically, breaking goals into steps, maintaining working memory during a conversation, and producing structured outputs.' },
        { kind: 'callout', tone: 'warn', title: 'Not the RL "agent"', text: 'In reinforcement learning (Chapter 2) an "agent" is a learner that takes actions to earn rewards. An AI agent here is an application built on a language model. Exam questions about "AI agents" mean the generative AI kind.' },
      ],
      terms: [
        { term: 'AI agent', def: 'A generative AI application that uses a model, instructions and tools to perform tasks for a user.' },
        { term: 'Instructions', def: 'The agent\'s system prompt: role, behaviour and constraints.' },
        { term: 'Agentic AI', def: 'AI that plans and takes actions toward goals, not just one-off responses.' },
      ],
      traps: [{ claim: 'An AI agent is a human operator who handles requests the model can\'t.', truth: 'An agent is an AI system that performs tasks on behalf of a user.' }],
      memory: 'Brain + job description + toolbox = agent.',
      recap: ['Three elements: model, instructions, tools.', 'Agents add tools and workflow to raw model inference.', 'Agents automate tasks, not just answer.'],
      references: [ref.genAI, ref.foundryGenAI],
      checks: [
        sc('q7-1a', 'What is an agent in the context of AI?', [
          ['An AI system that can perform tasks on behalf of a user.', 'Correct.'],
          ['A generative AI model that operates in secret.', 'No.'],
          ['A human operator to whom generative AI models escalate requests.', 'No.'],
        ], 0, ''),
        sc('q7-1b', 'What distinguishes an agent from simply calling a model?', [
          ['The agent adds instructions and tools so it can take actions and use knowledge.', 'Correct.'],
          ['Agents never use a language model.', 'They always use one.'],
          ['Agents are always multi-agent systems.', 'Single agents exist.'],
        ], 0, ''),
      ],
      objectiveIds: ['wl-scen', 'f-agent'],
    },
    {
      id: 'l7-tools',
      title: 'Knowledge tools, action tools and human approval',
      minutes: 14,
      sources: ['notes', 'official', 'supplemental'],
      objectives: ['Distinguish knowledge tools from action tools.', 'Trace a request through an agent\'s decision loop.', 'Apply human approval to risky actions.'],
      intro: 'Tools are what turn a conversationalist into a colleague. Choosing — and limiting — them is the core of agent design.',
      blocks: [
        { kind: 'table', headers: ['Tool type', 'Purpose', 'Examples'], rows: [
          ['Knowledge tools', 'Provide access to information (context)', 'Search engines, databases, file search, Foundry IQ knowledge bases'],
          ['Action tools', 'Perform tasks in the world', 'Send email, update a calendar, create a ticket, control a device, run code'],
        ] },
        { kind: 'p', text: 'In Foundry, examples include **Code Interpreter** (data analysis, file handling), **knowledge sources**, **web search**, **MCP servers** and **custom functions or APIs**, discovered and managed in the **Foundry Tool Catalog**. When tools are enabled, the model inspects the available tools and calls them when they are relevant to a request.' },
        { kind: 'sim', id: 'agent-simulator', caption: 'Follow a request through instructions, model reasoning, tool selection, the tool\'s result and the final response. Try toggling human approval.' },
        { kind: 'h', text: 'The agent loop' },
        { kind: 'steps', items: [
          { title: 'Receive', text: 'The user request arrives, together with the agent\'s instructions and conversation context.' },
          { title: 'Reason', text: 'The model decides whether it can answer directly or needs a tool — and which one.' },
          { title: 'Act', text: 'The agent runtime calls the tool with arguments the model produced.' },
          { title: 'Observe', text: 'The tool\'s result is returned to the model as new context.' },
          { title: 'Respond or repeat', text: 'The model either responds or decides another tool call is needed.' },
        ] },
        { kind: 'h', text: 'Safe and controlled actions' },
        { kind: 'list', items: [
          '**Least privilege** — give the agent only the tools and permissions it needs.',
          '**Human approval** — require a person to confirm consequential actions (payments, emails to customers, deleting data).',
          '**Contextual decisions** — instructions can tell the agent when to escalate (e.g. refunds over a limit).',
          '**Logging and monitoring** — record tool calls so behaviour can be audited.',
          '**Validate tool inputs/outputs** — never let untrusted content trigger actions directly (prompt injection).',
        ] },
        { kind: 'callout', tone: 'forex', title: 'Forex example', text: 'A research agent could use a knowledge tool to fetch an economic calendar and an action tool to place a trade. The responsible design keeps the action tool behind **explicit human approval**, enforces position limits outside the model, and logs every call. An agent\'s confident reasoning is not a reason to skip controls.' },
      ],
      terms: [
        { term: 'Knowledge tool', def: 'A tool that gives the agent information.' },
        { term: 'Action tool', def: 'A tool that lets the agent change something in the world.' },
        { term: 'MCP (Model Context Protocol)', def: 'An open protocol for exposing tools and data to AI models/agents.' },
        { term: 'Human-in-the-loop approval', def: 'Requiring a person to confirm an agent\'s action before it runs.' },
      ],
      traps: [{ claim: 'A search tool is an action tool because it "does" a search.', truth: 'Tools that retrieve information are knowledge tools; action tools change state in external systems.' }],
      memory: 'Knowledge tools read. Action tools write — so approve the writes.',
      recap: ['Knowledge = context; tools = actions.', 'Loop: reason → act → observe → respond.', 'Least privilege + approval for risky actions.'],
      references: [ref.genAI, ref.foundryGenAI],
      checks: [
        mt('q7-2a', 'Classify each tool.', [
          ['Search the company wiki', 'Knowledge tool'], ['Book a meeting room', 'Action tool'], ['Query an orders database', 'Knowledge tool'], ['Send an SMS to a customer', 'Action tool'],
        ], 'Reading information = knowledge; changing the world = action.'),
        sc('q7-2b', 'An agent can issue refunds. Which control best reduces risk?', [
          ['Require human approval for refunds above a threshold.', 'Correct.'], ['Increase model temperature.', 'No.'], ['Remove the agent\'s instructions.', 'Makes behaviour less controlled.'],
        ], 0, ''),
      ],
      objectiveIds: ['f-agent', 'rai-acc', 'rai-rel'],
    },
    {
      id: 'l7-multi',
      title: 'Multi-agent systems',
      minutes: 8,
      sources: ['notes'],
      objectives: ['Describe multi-agent systems and how agents collaborate.', 'Identify suitable use cases and limitations.'],
      intro: 'Instead of one agent doing everything, multiple agents can collaborate — each with its own speciality.',
      blocks: [
        { kind: 'p', text: 'One agent might gather data, another analyse it, and a third take action. Together they form an AI-powered workforce that can handle complex workflows, much like a human team. Agents communicate through **prompts**, using generative AI to determine which tasks are required and which agents are responsible.' },
        { kind: 'sim', id: 'multi-agent', caption: 'Watch an orchestrator delegate a travel-planning request to specialist agents.' },
        { kind: 'table', headers: ['Benefits', 'Limitations'], rows: [
          ['Specialisation: focused instructions and tools per agent', 'More moving parts to test and monitor'],
          ['Parallel work', 'Higher token cost and latency'],
          ['Easier to update one capability', 'Errors can propagate between agents'],
          ['Clear separation of permissions', 'Harder to explain end-to-end decisions'],
        ] },
        { kind: 'p', text: 'Common use cases for agents include customer service, IT help desks, research and report generation, document processing workflows, scheduling, and software development assistance. Agentic AI is described in the notes as "the next advance in how we use technology to find information and get work done".' },
      ],
      terms: [
        { term: 'Multi-agent system', def: 'Several specialised agents collaborating on a workflow.' },
        { term: 'Orchestrator', def: 'An agent or component that plans and delegates tasks to other agents.' },
      ],
      traps: [{ claim: 'Multi-agent systems are always better than a single agent.', truth: 'They add cost and complexity; use them when specialisation genuinely helps.' }],
      memory: 'Gather, analyse, act — one specialist each.',
      recap: ['Agents collaborate through prompts.', 'Specialisation vs complexity trade-off.', 'Monitor the whole chain.'],
      references: [ref.genAI],
      checks: [
        sc('q7-3a', 'How do agents in a multi-agent system typically communicate?', [
          ['Through prompts, using generative AI to decide tasks and responsibilities', 'Correct.'], ['By sharing model weights', 'No.'], ['Only through a human operator', 'Not required.'],
        ], 0, ''),
      ],
      objectiveIds: ['wl-scen'],
    },
    {
      id: 'l7-foundry',
      title: 'Building agents in Microsoft Foundry',
      minutes: 12,
      sources: ['official'],
      objectives: ['Describe how to create and test an agent in the Foundry portal.', 'Describe how a client application calls an agent with the Foundry Projects SDK.'],
      intro: 'In Microsoft Foundry, an agent is a packaged, reusable AI component that brings together a model, instructions and tools.',
      blocks: [
        { kind: 'callout', tone: 'verify', title: 'Verified from Microsoft Learn', text: 'Summarised from "Get started with generative AI and agents in Azure → Creating an agent", checked 29 October 2026. This content is not in your notes and is heavily weighted on the exam (55–60% domain).' },
        { kind: 'steps', items: [
          { title: 'Create a Foundry project', text: 'Inside a Foundry resource (Chapter 13).' },
          { title: 'Choose a model', text: 'e.g. GPT-4.1, deployed in the project.' },
          { title: 'Write instructions', text: 'e.g. "You\'re a helpful scheduling assistant who returns answers in concise bullet points."' },
          { title: 'Add tools and knowledge', text: 'Tools = actions (Code Interpreter, functions, MCP). Knowledge = context (documents, SharePoint, Foundry IQ knowledge bases). Responses using knowledge include citations.' },
          { title: 'Save and test in the playground', text: 'Save model + instructions + tools as an agent and keep refining it in the agent playground.' },
          { title: 'Call it from code', text: 'Use the Foundry Projects SDK and the Project API with the agent\'s name/ID.' },
        ] },
        { kind: 'code', lang: 'python', caption: 'Lightweight client for an agent (from Microsoft Learn, simplified)', code: 'from azure.identity import DefaultAzureCredential\nfrom azure.ai.projects import AIProjectClient\n\nproject_client = AIProjectClient(\n    endpoint="https://<resource>.services.ai.azure.com/api/projects/<project>",\n    credential=DefaultAzureCredential(),   # Microsoft Entra ID authentication\n)\n\nagent = project_client.agents.get(agent_name="learning-agent")\nopenai_client = project_client.get_openai_client()\n\nresponse = openai_client.responses.create(\n    input=[{"role": "user", "content": "Tell me what you can help with."}],\n    extra_body={"agent": {"name": agent.name, "type": "agent_reference"}},\n)\nprint(response.output_text)' },
        { kind: 'p', text: 'The Project API lets you integrate agents into web apps, bots or back-end workflows, orchestrate multi-step tasks, pass structured inputs or tool calls, and run agents at scale. Foundry handles message threading, tool execution, safety controls and observability.' },
      ],
      terms: [
        { term: 'Foundry Projects SDK', def: 'SDK (azure-ai-projects) for working with Foundry projects, agents and models from code.' },
        { term: 'Agent playground', def: 'Foundry portal area for testing an agent\'s prompts and behaviour.' },
        { term: 'Foundry Tool Catalog', def: 'Where tools for agents are discovered and managed.' },
      ],
      traps: [{ claim: 'You must write code to create any agent in Foundry.', truth: 'Agents can be created and tested in the Foundry portal (low-code) and then called from code.' }],
      memory: 'Pick a model, write instructions, add tools, test in playground, call from code.',
      recap: ['Agents are created in the Foundry portal.', 'Tools = actions; knowledge = context.', 'Client apps call agents through the Project API.'],
      references: [ref.foundryGenAI],
      checks: [
        sc('q7-4a', 'You have built an agent in the Foundry portal. How does a Python app use it?', [
          ['Connect with the Foundry Projects SDK (AIProjectClient) and reference the agent by name in a Responses API call.', 'Correct.'],
          ['Copy the model weights into the app.', 'No.'],
          ['Email the agent ID to the user.', 'No.'],
        ], 0, ''),
      ],
      objectiveIds: ['f-agent', 'f-agent-client'],
      handsOn: 'Create and test a single agent in the Foundry portal, then call it from a short Python script. Requires an Azure subscription.',
    },
  ],
  quiz: [
    ms('c7-1', 'Which are the three key elements of an AI agent? (Choose all that apply.)', [
      ['A language model', 'Yes.'], ['Instructions', 'Yes.'], ['Tools', 'Yes.'], ['A GPU cluster owned by the user', 'Not an agent element.'],
    ], [0, 1, 2], ''),
    sc('c7-2', 'In Foundry terms, which phrase is correct?', [
      ['Tools = actions; knowledge = context.', 'Correct.'], ['Tools = context; knowledge = actions.', 'Reversed.'], ['Tools and knowledge are the same.', 'No.'],
    ], 0, ''),
    sc('c7-3', 'An agent drafts and sends emails to customers. Which design is most responsible?', [
      ['Draft automatically but require human approval before sending.', 'Correct.'], ['Send immediately to save time.', 'Risky.'], ['Disable logging for privacy.', 'Logging is needed for accountability.'],
    ], 0, ''),
    mt('c7-4', 'Match each concept.', [
      ['Model', 'Raw intelligence'], ['Agent', 'Packaged, task-oriented worker'], ['Instructions', 'Job description'], ['Multi-agent system', 'Team of specialists'],
    ], 'A model provides raw inference; an agent packages a model with instructions and tools; instructions are the agent\'s job description; a multi-agent system is a team of specialists.'),
    sc('c7-5', 'Which Foundry tool lets an agent analyse a CSV and create a chart?', [
      ['Code Interpreter', 'Correct.'], ['Azure Speech', 'No.'], ['Content filter', 'No.'],
    ], 0, ''),
  ],
};
