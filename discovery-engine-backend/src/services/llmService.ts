/**
 * ============================================================================
 * DISCOVERY ENGINE - LLM Service (Claude Integration)
 * ============================================================================
 * Real-time AI generation powered by Anthropic Claude API.
 *
 * Each method constructs a detailed prompt, calls Claude, and parses the
 * JSON response. If the API key is missing or the call fails, it throws
 * an explicit error so the frontend can surface it to the user.
 *
 * Setup:
 *   1. Add ANTHROPIC_API_KEY to .env
 *   2. (Optional) Set ANTHROPIC_MODEL to override the default model
 * ============================================================================
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import {
  NicheOption,
  Persona,
  ProgramName,
  PricingStrategy,
  Blueprint,
  RoadmapPhase,
  CourseCurriculum,
  CourseDuration,
} from '../types';
import {
  dummyNiches,
  dummyPersona,
  dummyProgramNames,
  dummyModules,
  dummyPricing,
  dummyRoadmapPhases,
  dummyCurriculum,
  dummyCurriculum4Weeks,
  dummyCurriculum8Weeks,
  dummyCurriculum12Weeks,
  dummyRoadmap4Weeks,
  dummyRoadmap8Weeks,
  dummyRoadmap12Weeks,
} from '../data/dummyData';

// ---------------------------------------------------------------------------
// Claude Client Setup
// ---------------------------------------------------------------------------
const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

const anthropic = config.anthropicApiKey
  ? new Anthropic({ apiKey: config.anthropicApiKey })
  : null;

// ---------------------------------------------------------------------------
// Prompt Templates
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT_NICHE = `You are an expert coaching business strategist. Your job is to analyse a person's background and recommend 3 high-potential coaching niches.

Return ONLY a valid JSON object with this exact shape:
{
  "niches": [
    {
      "id": "niche_001",
      "name": "Descriptive niche name",
      "whoYouHelp": "1-sentence description of the target audience",
      "problemSolved": "The core problem this niche solves",
      "resultDelivered": "The transformation / outcome clients get",
      "revenuePotential": "Estimated monthly revenue range in Indian Rupees (e.g. ₹50K - ₹2L/month)",
      "marketDemand": 8.5,
      "fitExplanation": "Why this niche fits the user's background",
      "competitionLevel": "Low / Medium / High / Low-Medium / Medium-High",
      "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
    }
  ]
}

Rules:
- marketDemand must be a number between 1 and 10.
- revenuePotential should be realistic for the Indian coaching market.
- Make each niche distinct and specific.
- Do NOT wrap the JSON in markdown code blocks.`;

const SYSTEM_PROMPT_PERSONA = `You are a customer research expert. Create a detailed, realistic buyer persona for a coaching niche.

Return ONLY a valid JSON object with this exact shape:
{
  "persona": {
    "id": "persona_001",
    "name": "First name only",
    "ageRange": "e.g. 30-45",
    "role": "Job title or primary identity",
    "location": "City / Region in India",
    "currentSituation": "2-3 sentence vivid description of their current life / struggle",
    "biggestDesire": "1-2 sentence description of what they deeply want",
    "onlinePlatforms": ["Platform 1 (frequency)", "Platform 2", "Platform 3"],
    "payingCapacity": "Price range they can afford for coaching",
    "painPoints": ["Pain 1", "Pain 2", "Pain 3", "Pain 4", "Pain 5", "Pain 6"],
    "goals": ["Goal 1", "Goal 2", "Goal 3", "Goal 4", "Goal 5"],
    "quote": "A realistic, emotionally resonant quote they might say",
    "avatar": ""
  }
}

Rules:
- The persona must feel real and specific (not generic).
- painPoints should be 6 items.
- goals should be 5 items.
- Avatar should always be an empty string.
- Do NOT wrap the JSON in markdown code blocks.`;

const SYSTEM_PROMPT_PROGRAM_NAMES = `You are a creative naming strategist for coaching programs.

Return ONLY a valid JSON object with this exact shape:
{
  "names": [
    {
      "id": "progname_001",
      "name": "Program Name 1",
      "description": "1-sentence description of what the program does",
      "isAiRecommended": false
    },
    {
      "id": "progname_002",
      "name": "Program Name 2",
      "description": "AI-recommended: 1-sentence description",
      "isAiRecommended": true
    },
    {
      "id": "progname_003",
      "name": "Program Name 3",
      "description": "1-sentence description",
      "isAiRecommended": false
    }
  ]
}

Rules:
- Exactly 3 names.
- One must have isAiRecommended: true (the best fit).
- Names should be compelling, memorable, and professional.
- Do NOT wrap the JSON in markdown code blocks.`;

const SYSTEM_PROMPT_PRICING = `You are a pricing strategist for the Indian online coaching market.

Return ONLY a valid JSON object with this exact shape:
{
  "pricing": {
    "startingPrice": 4999,
    "aiRecommendedPrice": 4999,
    "priceJustification": "2-3 sentence explanation of why this price makes sense",
    "marketInsight": "1-2 sentence market insight specific to India",
    "milestones": {
      "students10": 49990,
      "students50": 249950,
      "students100": 499900
    },
    "priceEvolution": {
      "launch": 4999,
      "after10Students": "Raise strategy after first 10 students",
      "premiumTier": "Premium tier description with price"
    },
    "sweetSpotRange": "Price range after validation phase"
  }
}

Rules:
- Prices should be in Indian Rupees (₹).
- startingPrice should be an accessible entry point (₹2,000 - ₹10,000).
- milestones should be startingPrice * 10, * 50, * 100.
- priceEvolution.after10Students should describe the raise strategy.
- sweetSpotRange should be 2x-4x the starting price.
- Do NOT wrap the JSON in markdown code blocks.`;

const SYSTEM_PROMPT_PROBLEMS = `You are an expert coaching business strategist. Your job is to identify the specific, actionable problems that a target audience faces in a given coaching niche.

Return ONLY a valid JSON object with this exact shape:
{
  "problems": [
    "Problem statement 1",
    "Problem statement 2",
    "Problem statement 3",
    "Problem statement 4",
    "Problem statement 5",
    "Problem statement 6",
    "Problem statement 7",
    "Problem statement 8"
  ]
}

Rules:
- Generate exactly 8 problems.
- Each problem should be a specific, actionable statement (not vague or generic).
- Problems should reflect the real struggles of the target audience in this niche.
- Problems should be suitable for a coaching program to solve.
- Do NOT wrap the JSON in markdown code blocks.`;

const SYSTEM_PROMPT_CURRICULUM = `You are a curriculum designer for online coaching programs.

Return ONLY a valid JSON object with this exact shape:
{
  "curriculum": {
    "modules": [
      {
        "id": "mod_unique_id",
        "title": "Module Title",
        "subtitle": "Optional subtitle describing the module focus",
        "lessons": [
          {
            "id": "les_unique_id",
            "title": "Lesson Title",
            "duration": "X min",
            "learningOutcome": "What the student will learn"
          }
        ],
        "output": "What the student produces by the end of this module"
      }
    ],
    "totalLessons": 18,
    "totalDuration": "X hours"
  }
}

Rules:
- Design modules appropriate for the specified duration (4 weeks = 3-4 modules, 8 weeks = 5-6 modules, 12 weeks = 5-6 modules with more depth).
- Each module should have 2-5 lessons.
- Lesson durations should be realistic (10-45 min each).
- Include a Welcome module and a Graduation module.
- The subtitle and output fields are optional but recommended for core modules.
- Do NOT wrap the JSON in markdown code blocks.`;

const SYSTEM_PROMPT_ROADMAP = `You are a business launch strategist for coaches.

Return ONLY a valid JSON object with this exact shape:
{
  "phases": [
    {
      "phase": 1,
      "weeks": "Weeks 1-2",
      "title": "Phase Title",
      "color": "#F97316",
      "items": [
        {
          "week": "Week 1",
          "tasks": ["Task 1", "Task 2", "Task 3", "Task 4"]
        }
      ]
    }
  ]
}

Rules:
- Adapt the number of phases to the duration:
  * 4 weeks  → 2 phases (Build, Launch)
  * 8 weeks  → 4 phases (Foundation, Build, Launch, Scale)
  * 12 weeks → 4 phases (Foundation & Validation, Build & Prepare, Launch & Acquire, Scale & Optimize)
- Each phase should have 1-3 week entries.
- Each week should have 3-4 specific, actionable tasks.
- Use these colors for phases: #F97316 (orange), #3B82F6 (blue), #22C55E (green), #8B5CF6 (purple), #EC4899 (pink), #14B8A6 (teal).
- Tasks should be concrete and achievable in one week.
- Do NOT wrap the JSON in markdown code blocks.`;

// ---------------------------------------------------------------------------
// Helper: Call Claude API
// ---------------------------------------------------------------------------

async function callClaude<T>(
  systemPrompt: string,
  userPrompt: string,
  fallback: T
): Promise<T> {
  if (!anthropic || !config.anthropicApiKey) {
    console.error('[LLM] ANTHROPIC_API_KEY not set — cannot generate AI content');
    throw new Error('AI service is not configured. Please contact support.');
  }

  try {
    console.log(`[LLM] Calling Claude (${CLAUDE_MODEL})...`);
    const start = Date.now();

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === 'text')
      .map((c) => c.text)
      .join('');

    // Strip markdown code blocks if present
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    const parsed = JSON.parse(cleaned);
    console.log(`[LLM] Claude responded in ${Date.now() - start}ms`);
    return parsed;
  } catch (error) {
    console.error('[LLM] Claude API error:', error);
    throw new Error('AI generation failed. Please try again in a moment.');
  }
}

// ---------------------------------------------------------------------------
// LLM Service
// ---------------------------------------------------------------------------

class LLMService {
  private static instance: LLMService;

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  /**
   * Generate 3 niche recommendations based on user's background.
   */
  async generateNicheRecommendations(
    skills: string,
    experience: string,
    passions: string,
    domains?: string[]
  ): Promise<NicheOption[]> {
    console.log(`[LLM] Generating niche recommendations...`);
    console.log(`[LLM]   Skills: ${skills}`);
    console.log(`[LLM]   Experience: ${experience}`);
    console.log(`[LLM]   Passions: ${passions}`);
    console.log(`[LLM]   Domains: ${domains?.join(', ') ?? 'none'}`);

    const domainContext = domains && domains.length > 0
      ? ` The user has selected these coaching domain(s): ${domains.join(', ')}.`
      : '';

    const userPrompt = `Generate 3 coaching niche recommendations for a person with the following background:

Skills: ${skills}
Experience: ${experience}
Passions: ${passions}${domainContext}

Return the result as a JSON object with a "niches" array.`;

    const fallback = {
      niches: dummyNiches.map((niche) => ({
        ...niche,
        fitExplanation: `${niche.fitExplanation} Your background in "${skills}" and passion for "${passions}" strongly aligns with this niche.${domainContext}`,
      })),
    };

    const result = await callClaude<{ niches: NicheOption[] }>(
      SYSTEM_PROMPT_NICHE,
      userPrompt,
      fallback
    );

    return result.niches;
  }

  /**
   * Generate a detailed audience persona for the selected niche.
   */
  async generatePersona(nicheName: string): Promise<Persona> {
    console.log(`[LLM] Generating audience persona for niche: ${nicheName}`);

    const userPrompt = `Create a detailed buyer persona for a coach in the "${nicheName}" niche.

The persona should represent a realistic Indian professional who would buy this coaching program.

Return the result as a JSON object with a "persona" field.`;

    const fallback = {
      persona: {
        ...dummyPersona,
        quote: `"I know I need help with ${nicheName.toLowerCase()}, but I don't know where to start."`,
      },
    };

    const result = await callClaude<{ persona: Persona }>(
      SYSTEM_PROMPT_PERSONA,
      userPrompt,
      fallback
    );

    return result.persona;
  }

  /**
   * Generate 8 specific audience problems for the selected niche and persona.
   */
  async generateProblems(
    nicheName: string,
    persona: Persona
  ): Promise<string[]> {
    console.log(`[LLM] Generating audience problems for niche: ${nicheName}`);

    const userPrompt = `Generate 8 specific problems for coaches in the "${nicheName}" niche.

Target persona details:
- Name: ${persona.name}
- Role: ${persona.role}
- Age: ${persona.ageRange}
- Location: ${persona.location}
- Current situation: ${persona.currentSituation}
- Biggest desire: ${persona.biggestDesire}
- Existing pain points: ${persona.painPoints.join(', ')}
- Goals: ${persona.goals.join(', ')}

Return the result as a JSON object with a "problems" array.`;

    const fallback = { problems: persona.painPoints.slice(0, 8) };

    const result = await callClaude<{ problems: string[] }>(
      SYSTEM_PROMPT_PROBLEMS,
      userPrompt,
      fallback
    );

    return result.problems;
  }

  /**
   * Generate 3 program name suggestions (one AI-recommended).
   */
  async generateProgramNames(
    niche: string,
    persona: string
  ): Promise<ProgramName[]> {
    console.log(`[LLM] Generating program names for niche: ${niche}`);
    console.log(`[LLM]   Target persona: ${persona}`);

    const userPrompt = `Generate 3 compelling program names for a coaching program in the "${niche}" niche.

Target persona: ${persona}

Return the result as a JSON object with a "names" array.`;

    const fallback = { names: dummyProgramNames };

    const result = await callClaude<{ names: ProgramName[] }>(
      SYSTEM_PROMPT_PROGRAM_NAMES,
      userPrompt,
      fallback
    );

    return result.names;
  }

  /**
   * Generate pricing strategy based on persona, niche, and program.
   */
  async generatePricing(
    persona: Persona,
    niche: string,
    program: string
  ): Promise<PricingStrategy> {
    console.log(`[LLM] Generating pricing strategy...`);
    console.log(`[LLM]   Program: ${program}`);
    console.log(`[LLM]   Niche: ${niche}`);
    console.log(`[LLM]   Persona paying capacity: ${persona.payingCapacity}`);

    const userPrompt = `Generate a pricing strategy for a coaching program called "${program}" in the "${niche}" niche.

Target persona details:
- Role: ${persona.role}
- Age: ${persona.ageRange}
- Location: ${persona.location}
- Paying capacity: ${persona.payingCapacity}
- Biggest desire: ${persona.biggestDesire}

Return the result as a JSON object with a "pricing" field.`;

    const fallback = { pricing: dummyPricing };

    const result = await callClaude<{ pricing: PricingStrategy }>(
      SYSTEM_PROMPT_PRICING,
      userPrompt,
      fallback
    );

    return result.pricing;
  }

  /**
   * Generate a complete roadmap adapted to the chosen duration.
   */
  async generateRoadmap(
    blueprint: Blueprint,
    duration?: CourseDuration
  ): Promise<{ phases: RoadmapPhase[] }> {
    const dur = duration || '12_weeks';
    console.log(`[LLM] Generating roadmap for blueprint: ${blueprint.id}, duration: ${dur}`);

    const niche = blueprint.niche?.selectedNiche?.name || 'Career Coaching';
    const program = blueprint.program?.selectedName?.name || 'Coaching Program';
    const personaName = blueprint.audience?.persona?.name || 'your ideal client';

    const quiz = blueprint.readinessQuiz;
    const quizContext = quiz
      ? `

ADDITIONAL CONTEXT — Coach Readiness Assessment:
- Readiness Score: ${quiz.score}/10 (${quiz.persona})
- Weakest Area: ${quiz.weakestArea}

INSTRUCTION: Tailor the roadmap tone, urgency, and action items to this readiness level.
If score is low (< 5), emphasize foundational steps and conservative timelines.
If score is high (> 7), emphasize acceleration, premium pricing, and aggressive launch tactics.
Address the weakest area explicitly in Week 1 tasks.`
      : '';

    const userPrompt = `Generate a ${dur.replace('_', '-')} launch roadmap for a coaching program called "${program}" in the "${niche}" niche.

Target client: ${personaName}

The roadmap should guide the coach from zero to their first paying clients.${quizContext}

Return the result as a JSON object with a "phases" array.`;

    const roadmapMap: Record<string, RoadmapPhase[]> = {
      '4_weeks': dummyRoadmap4Weeks,
      '8_weeks': dummyRoadmap8Weeks,
      '12_weeks': dummyRoadmapPhases,
    };

    const fallback = { phases: roadmapMap[dur] || dummyRoadmapPhases };

    const result = await callClaude<{ phases: RoadmapPhase[] }>(
      SYSTEM_PROMPT_ROADMAP,
      userPrompt,
      fallback
    );

    return { phases: result.phases };
  }

  /**
   * Generate a detailed course curriculum based on program, niche, and duration.
   */
  async generateCurriculum(
    niche: string,
    program: string,
    problems: string[],
    duration?: CourseDuration
  ): Promise<CourseCurriculum> {
    const dur = duration || '12_weeks';
    console.log(`[LLM] Generating course curriculum...`);
    console.log(`[LLM]   Program: ${program}`);
    console.log(`[LLM]   Niche: ${niche}`);
    console.log(`[LLM]   Problems: ${problems.join(', ')}`);
    console.log(`[LLM]   Duration: ${dur}`);

    const userPrompt = `Generate a ${dur.replace('_', '-')} course curriculum for a coaching program called "${program}" in the "${niche}" niche.

The program solves these problems for students:
${problems.map((p) => `- ${p}`).join('\n')}

Design modules with clear learning outcomes and realistic lesson durations.

Return the result as a JSON object with a "curriculum" field.`;

    const curriculumMap: Record<string, CourseCurriculum> = {
      '4_weeks': dummyCurriculum4Weeks,
      '8_weeks': dummyCurriculum8Weeks,
      '12_weeks': dummyCurriculum,
    };

    const fallback = { curriculum: curriculumMap[dur] || dummyCurriculum };

    const result = await callClaude<{ curriculum: CourseCurriculum }>(
      SYSTEM_PROMPT_CURRICULUM,
      userPrompt,
      fallback
    );

    return result.curriculum;
  }

  /**
   * Generate module content for a given module and program context.
   */
  async generateModuleContent(
    moduleId: string,
    programContext: string
  ): Promise<{ title: string; lessons: string[]; worksheets: string[] }> {
    console.log(`[LLM] Generating module content for: ${moduleId}`);

    const module = dummyModules.find((m) => m.id === moduleId);
    return {
      title: module?.title || 'Module Content',
      lessons: [
        'Lesson 1: Introduction and Framework Overview',
        'Lesson 2: Core Concepts and Principles',
        'Lesson 3: Practical Application Exercise',
        'Lesson 4: Case Study and Real-World Examples',
        'Lesson 5: Action Steps and Implementation Plan',
      ],
      worksheets: [
        'Self-Assessment Worksheet',
        'Action Planning Template',
        'Progress Tracker',
      ],
    };
  }
}

export const llmService = LLMService.getInstance();
