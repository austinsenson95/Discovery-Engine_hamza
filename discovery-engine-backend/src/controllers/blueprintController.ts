/**
 * ============================================================================
 * DISCOVERY ENGINE - Blueprint Controller
 * ============================================================================
 * Handles all blueprint-related API endpoints:
 *   - GET /api/blueprint           → Get current blueprint state
 *   - POST /api/blueprint/niche    → Submit niche form, get 3 AI niche options
 *   - POST /api/blueprint/audience → Generate audience persona
 *   - POST /api/blueprint/problems → Save selected audience problems
 *   - POST /api/blueprint/program-name  → Generate program name suggestions
 *   - POST /api/blueprint/pricing       → Generate pricing strategy
   *   - POST /api/blueprint/roadmap       → Generate 12-week roadmap + PDF
 *   - GET /api/blueprint/pdf/:id   → Download generated PDF
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { llmService } from '../services/llmService';
import { pdfService } from '../services/pdfService';
import { creditService } from '../services/creditService';
import {
  dummyBlueprint,
  dummyNiches,
  dummyPersona,
  dummySelectedProblems,
  dummyProgramNames,
  dummyPricing,
  dummyModules,
  dummyRoadmapPhases,
  dummyUser,
} from '../data/dummyData';
import { Blueprint, NicheOption } from '../types';

// In-memory blueprint store (replace with database)
const blueprintStore = new Map<string, Blueprint>();
blueprintStore.set(dummyBlueprint.id, { ...dummyBlueprint });

/**
 * Utility: Send standardized success response
 */
const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: { creditsDeducted?: number; remainingCredits?: number; processingTime?: number }
) => {
  res.status(statusCode).json({
    success: true,
    data,
    meta: meta || undefined,
  });
};

/**
 * Utility: Artificial delay to simulate LLM processing
 */
const simulateProcessing = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// GET /api/blueprint
// ---------------------------------------------------------------------------
export const getBlueprint = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(`[Blueprint] GET /api/blueprint — fetching blueprint`);

    // TODO: Get userId from authenticated request (JWT token)
    const userId = dummyUser.id;
    const blueprint = blueprintStore.get('bp_001') || {
      ...dummyBlueprint,
      userId,
    };

    sendSuccess(res, blueprint);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/blueprint/niche
// Request: { skills: string, experience: string, passions: string }
// Response: { niches: NicheOption[], creditsDeducted: number }
// ---------------------------------------------------------------------------
export const submitNiche = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  try {
    const { skills, experience, passions } = req.body;
    console.log(`[Blueprint] POST /api/blueprint/niche — skills="${skills}"`);

    // TODO: Get userId from authenticated request
    const userId = dummyUser.id;

    // Check if user has enough credits
    const canAfford = await creditService.hasEnoughCredits(userId, 'niche');
    if (!canAfford) {
      res.status(402).json({
        success: false,
        message: 'Insufficient credits. Please top up your credits to continue.',
      });
      return;
    }

    // Generate niche recommendations via LLM (or dummy data for now)
    const niches = await llmService.generateNicheRecommendations(
      skills,
      experience,
      passions
    );

    // Deduct credits
    const { deducted, remaining } = await creditService.deductCredits(
      userId,
      'niche'
    );

    // Update blueprint in store
    const blueprint = blueprintStore.get('bp_001') || {
      ...dummyBlueprint,
      userId,
    };
    blueprint.niche = {
      selectedNiche: niches[0], // Default to first; user can change
      skills,
      experience,
      passions,
    };
    blueprint.currentStep = 2;
    blueprint.progress = 20;
    blueprint.updatedAt = new Date();
    blueprintStore.set(blueprint.id, blueprint);

    const processingTime = Date.now() - startTime;
    console.log(`[Blueprint] Niche generation complete in ${processingTime}ms`);

    sendSuccess(
      res,
      { niches, blueprint },
      200,
      {
        creditsDeducted: deducted,
        remainingCredits: remaining,
        processingTime,
      }
    );
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/blueprint/audience
// Request: { nicheId: string }
// Response: { persona: Persona, creditsDeducted: number }
// ---------------------------------------------------------------------------
export const generateAudience = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  try {
    const { nicheId } = req.body;
    console.log(`[Blueprint] POST /api/blueprint/audience — nicheId="${nicheId}"`);

    const userId = dummyUser.id;

    // Check credits
    const canAfford = await creditService.hasEnoughCredits(userId, 'audience');
    if (!canAfford) {
      res.status(402).json({
        success: false,
        message: 'Insufficient credits. Please top up your credits to continue.',
      });
      return;
    }

    // Get the selected niche name
    const blueprint = blueprintStore.get('bp_001');
    const nicheName =
      blueprint?.niche?.selectedNiche?.name ||
      dummyNiches.find((n) => n.id === nicheId)?.name ||
      'Career Coaching';

    // Generate persona via LLM
    const persona = await llmService.generatePersona(nicheName);

    // Deduct credits
    const { deducted, remaining } = await creditService.deductCredits(
      userId,
      'audience'
    );

    // Update blueprint
    if (blueprint) {
      blueprint.audience = { persona };
      blueprint.currentStep = 3;
      blueprint.progress = 35;
      blueprint.updatedAt = new Date();
      blueprintStore.set(blueprint.id, blueprint);
    }

    const processingTime = Date.now() - startTime;
    console.log(`[Blueprint] Audience generation complete in ${processingTime}ms`);

    sendSuccess(
      res,
      { persona },
      200,
      {
        creditsDeducted: deducted,
        remainingCredits: remaining,
        processingTime,
      }
    );
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/blueprint/problems
// Request: { selectedProblems: string[] }
// Response: { success: boolean, problems: string[] }
// ---------------------------------------------------------------------------
export const submitProblems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { selectedProblems } = req.body;
    console.log(`[Blueprint] POST /api/blueprint/problems — ${selectedProblems?.length} problems`);

    const userId = dummyUser.id;
    const problems = selectedProblems || dummySelectedProblems;

    // Update blueprint
    const blueprint = blueprintStore.get('bp_001');
    if (blueprint) {
      if (!blueprint.program) {
        blueprint.program = {
          selectedProblems: problems,
          selectedName: dummyProgramNames[1], // Default to AI recommended
          pricing: dummyPricing,
          modules: dummyModules,
        };
      } else {
        blueprint.program.selectedProblems = problems;
      }
      blueprint.currentStep = 4;
      blueprint.progress = 45;
      blueprint.updatedAt = new Date();
      blueprintStore.set(blueprint.id, blueprint);
    }

    sendSuccess(res, { success: true, problems });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/blueprint/program-name
// Request: { nicheId?: string, personaId?: string }
// Response: { names: ProgramName[], creditsDeducted: number }
// ---------------------------------------------------------------------------
export const generateProgramNames = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  try {
    console.log(`[Blueprint] POST /api/blueprint/program-name`);

    const userId = dummyUser.id;

    // Check credits
    const canAfford = await creditService.hasEnoughCredits(userId, 'program');
    if (!canAfford) {
      res.status(402).json({
        success: false,
        message: 'Insufficient credits. Please top up your credits to continue.',
      });
      return;
    }

    const blueprint = blueprintStore.get('bp_001');
    const niche = blueprint?.niche?.selectedNiche?.name || 'Career Coaching';
    const persona = blueprint?.audience?.persona?.name || 'Target Audience';

    // Generate program names via LLM
    const names = await llmService.generateProgramNames(niche, persona);

    // Deduct credits
    const { deducted, remaining } = await creditService.deductCredits(
      userId,
      'program'
    );

    // Update blueprint
    if (blueprint && blueprint.program) {
      blueprint.program.selectedName = names.find((n) => n.isAiRecommended) || names[0];
      blueprint.currentStep = 5;
      blueprint.progress = 55;
      blueprint.updatedAt = new Date();
      blueprintStore.set(blueprint.id, blueprint);
    }

    const processingTime = Date.now() - startTime;
    console.log(`[Blueprint] Program names generated in ${processingTime}ms`);

    sendSuccess(
      res,
      { names },
      200,
      {
        creditsDeducted: deducted,
        remainingCredits: remaining,
        processingTime,
      }
    );
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/blueprint/pricing
// Request: { programId?: string }
// Response: { pricing: PricingStrategy, creditsDeducted: number }
// ---------------------------------------------------------------------------
export const generatePricing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  try {
    console.log(`[Blueprint] POST /api/blueprint/pricing`);

    const userId = dummyUser.id;

    // Check credits
    const canAfford = await creditService.hasEnoughCredits(userId, 'pricing');
    if (!canAfford) {
      res.status(402).json({
        success: false,
        message: 'Insufficient credits. Please top up your credits to continue.',
      });
      return;
    }

    const blueprint = blueprintStore.get('bp_001');
    const persona = blueprint?.audience?.persona || dummyPersona;
    const niche = blueprint?.niche?.selectedNiche?.name || 'Career Coaching';
    const program = blueprint?.program?.selectedName?.name || 'Coaching Program';

    // Generate pricing via LLM
    const pricing = await llmService.generatePricing(persona, niche, program);

    // Deduct credits
    const { deducted, remaining } = await creditService.deductCredits(
      userId,
      'pricing'
    );

    // Update blueprint
    if (blueprint && blueprint.program) {
      blueprint.program.pricing = pricing;
      blueprint.currentStep = 6;
      blueprint.progress = 70;
      blueprint.updatedAt = new Date();
      blueprintStore.set(blueprint.id, blueprint);
    }

    const processingTime = Date.now() - startTime;
    console.log(`[Blueprint] Pricing generated in ${processingTime}ms`);

    sendSuccess(
      res,
      { pricing },
      200,
      {
        creditsDeducted: deducted,
        remainingCredits: remaining,
        processingTime,
      }
    );
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/blueprint/roadmap
// Request: { blueprintId?: string }
// Response: { roadmap: { phases }, pdfUrl: string, creditsDeducted: number }
// ---------------------------------------------------------------------------
export const generateRoadmap = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  try {
    console.log(`[Blueprint] POST /api/blueprint/roadmap — generating 12-week roadmap`);

    const userId = dummyUser.id;

    // Check credits
    const canAfford = await creditService.hasEnoughCredits(userId, 'roadmap');
    if (!canAfford) {
      res.status(402).json({
        success: false,
        message: 'Insufficient credits. Please top up your credits to continue.',
      });
      return;
    }

    // Get current blueprint
    const blueprint = blueprintStore.get('bp_001');
    if (!blueprint) {
      res.status(404).json({
        success: false,
        message: 'Blueprint not found. Please complete previous steps first.',
      });
      return;
    }

    // Generate roadmap via LLM
    const { phases } = await llmService.generateRoadmap(blueprint);

    // Generate PDF
    const pdfUrl = await pdfService.generateBlueprintPDF(blueprint);

    // Deduct credits
    const { deducted, remaining } = await creditService.deductCredits(
      userId,
      'roadmap'
    );

    // Update blueprint — mark as completed
    blueprint.roadmap = {
      phases,
      pdfUrl,
      completedAt: new Date(),
    };
    blueprint.status = 'completed';
    blueprint.currentStep = 7;
    blueprint.progress = 100;
    blueprint.updatedAt = new Date();
    blueprintStore.set(blueprint.id, blueprint);

    const processingTime = Date.now() - startTime;
    console.log(`[Blueprint] Roadmap + PDF generated in ${processingTime}ms`);

    sendSuccess(
      res,
      { roadmap: { phases }, pdfUrl },
      200,
      {
        creditsDeducted: deducted,
        remainingCredits: remaining,
        processingTime,
      }
    );
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/blueprint/pdf/:id
// Download the generated blueprint PDF
// ---------------------------------------------------------------------------
export const downloadPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    console.log(`[Blueprint] GET /api/blueprint/pdf/${id} — downloading PDF`);

    const blueprint = blueprintStore.get(id);
    if (!blueprint) {
      res.status(404).json({
        success: false,
        message: 'Blueprint PDF not found.',
      });
      return;
    }

    // Generate PDF buffer
    const pdfBuffer = await pdfService.streamPDF(id);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="discovery-engine-blueprint-${id}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
