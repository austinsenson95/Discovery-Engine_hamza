/**
 * ============================================================================
 * DISCOVERY ENGINE - Blueprint Controller
 * ============================================================================
 * Handles all blueprint-related API endpoints:
 *   - GET  /api/blueprint              → Get current blueprint state
 *   - GET  /api/blueprint/all          → Get all blueprints for user
 *   - POST /api/blueprint              → Create a new blueprint
 *   - PUT  /api/blueprint/:id          → Update a blueprint
 *   - DELETE /api/blueprint/:id        → Delete a blueprint
 *   - POST /api/blueprint/niche        → Submit niche form, get 3 AI niche options
 *   - POST /api/blueprint/audience     → Generate audience persona
 *   - POST /api/blueprint/problems     → Save selected audience problems
 *   - POST /api/blueprint/program-name → Generate program name suggestions
 *   - POST /api/blueprint/pricing      → Generate pricing strategy
 *   - POST /api/blueprint/roadmap      → Generate 12-week roadmap + PDF
 *   - GET  /api/blueprint/pdf/:id      → Download generated PDF
 * ============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { llmService } from '../services/llmService';
import { pdfService } from '../services/pdfService';
import { validateBlueprintForPDF, compileBlueprintTemplate } from '../services/templateEngine';
import { invalidatePDFCache } from '../services/pdfService';
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
  quizQuestions,
  quizActionTips,
} from '../data/dummyData';
import { Blueprint, NicheOption } from '../types';
import {
  getBlueprintsByUser,
  getBlueprintById,
  createBlueprint,
  updateBlueprint,
  deleteBlueprint,
  addActivity,
} from '../db/blueprintRepository';

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

    const userId = dummyUser.id;
    const blueprints = getBlueprintsByUser(userId);
    const blueprint = blueprints[0] || {
      ...dummyBlueprint,
      userId,
    };

    sendSuccess(res, blueprint);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/blueprint/all
// ---------------------------------------------------------------------------
export const getAllBlueprints = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(`[Blueprint] GET /api/blueprint/all — fetching all blueprints`);
    const userId = dummyUser.id;
    const blueprints = getBlueprintsByUser(userId);
    sendSuccess(res, blueprints);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/blueprint
// ---------------------------------------------------------------------------
export const createNewBlueprint = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(`[Blueprint] POST /api/blueprint — creating new blueprint`);
    const userId = dummyUser.id;
    const id = `bp_${Date.now()}`;
    const now = new Date();

    const blueprint: Blueprint = {
      id,
      userId,
      status: 'in_progress',
      currentStep: 1,
      progress: 0,
      createdAt: now,
      updatedAt: now,
    };

    createBlueprint(blueprint);
    addActivity({
      userId,
      blueprintId: id,
      title: 'Created new blueprint',
      description: 'Started a new coaching blueprint',
      type: 'blueprint',
      createdAt: now,
    });

    sendSuccess(res, blueprint, 201);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PUT /api/blueprint/:id
// ---------------------------------------------------------------------------
export const updateBlueprintById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    console.log(`[Blueprint] PUT /api/blueprint/${id} — updating blueprint`);

    const updates = req.body as Partial<Blueprint>;
    const updated = updateBlueprint(id, updates);

    if (!updated) {
      res.status(404).json({ success: false, message: 'Blueprint not found' });
      return;
    }

    // Invalidate cached PDF if blueprint data changed
    invalidatePDFCache(id);

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/blueprint/:id
// ---------------------------------------------------------------------------
export const deleteBlueprintById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    console.log(`[Blueprint] DELETE /api/blueprint/${id} — deleting blueprint`);

    const success = deleteBlueprint(id);
    if (!success) {
      res.status(404).json({ success: false, message: 'Blueprint not found' });
      return;
    }

    sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/blueprint/niche
// ---------------------------------------------------------------------------
export const submitNiche = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  try {
    const { skills, experience, passions, domains } = req.body;
    console.log(`[Blueprint] POST /api/blueprint/niche — skills="${skills}" domains="${domains?.join(', ') ?? ''}"`);

    const userId = dummyUser.id;

    const canAfford = await creditService.hasEnoughCredits(userId, 'niche');
    if (!canAfford) {
      res.status(402).json({
        success: false,
        message: 'Insufficient credits. Please top up your credits to continue.',
      });
      return;
    }

    const niches = await llmService.generateNicheRecommendations(
      skills,
      experience,
      passions,
      domains
    );

    const { deducted, remaining } = await creditService.deductCredits(
      userId,
      'niche'
    );

    // Find or create blueprint
    const blueprints = getBlueprintsByUser(userId);
    let blueprint = blueprints[0];
    if (!blueprint) {
      blueprint = {
        id: `bp_${Date.now()}`,
        userId,
        status: 'in_progress',
        currentStep: 2,
        progress: 20,
        niche: {
          selectedNiche: niches[0],
          skills,
          experience,
          passions,
          domains,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      createBlueprint(blueprint);
    } else {
      blueprint = updateBlueprint(blueprint.id, {
        currentStep: 2,
        progress: 20,
        niche: {
          selectedNiche: niches[0],
          skills,
          experience,
          passions,
          domains,
        },
      })!;
    }

    addActivity({
      userId,
      blueprintId: blueprint.id,
      title: 'Completed Niche Discovery',
      description: `Found niche: ${niches[0].name}`,
      type: 'niche',
      createdAt: new Date(),
    });

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

    const canAfford = await creditService.hasEnoughCredits(userId, 'audience');
    if (!canAfford) {
      res.status(402).json({
        success: false,
        message: 'Insufficient credits. Please top up your credits to continue.',
      });
      return;
    }

    const blueprints = getBlueprintsByUser(userId);
    const blueprint = blueprints[0];
    const nicheName =
      blueprint?.niche?.selectedNiche?.name ||
      dummyNiches.find((n) => n.id === nicheId)?.name ||
      'Career Coaching';

    const persona = await llmService.generatePersona(nicheName);

    const { deducted, remaining } = await creditService.deductCredits(
      userId,
      'audience'
    );

    if (blueprint) {
      updateBlueprint(blueprint.id, {
        audience: { persona },
        currentStep: 3,
        progress: 35,
      });
      addActivity({
        userId,
        blueprintId: blueprint.id,
        title: 'Completed Audience Mapping',
        description: `Persona: ${persona.name}`,
        type: 'audience',
        createdAt: new Date(),
      });
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

    const blueprints = getBlueprintsByUser(userId);
    const blueprint = blueprints[0];
    if (blueprint) {
      const program = blueprint.program || {
        selectedProblems: problems,
        selectedName: dummyProgramNames[1],
        pricing: dummyPricing,
        modules: dummyModules,
      };
      program.selectedProblems = problems;
      updateBlueprint(blueprint.id, {
        program,
        currentStep: 4,
        progress: 45,
      });
    }

    sendSuccess(res, { success: true, problems });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/blueprint/program-name
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

    const canAfford = await creditService.hasEnoughCredits(userId, 'program');
    if (!canAfford) {
      res.status(402).json({
        success: false,
        message: 'Insufficient credits. Please top up your credits to continue.',
      });
      return;
    }

    const blueprints = getBlueprintsByUser(userId);
    const blueprint = blueprints[0];
    const niche = blueprint?.niche?.selectedNiche?.name || 'Career Coaching';
    const persona = blueprint?.audience?.persona?.name || 'Target Audience';

    const names = await llmService.generateProgramNames(niche, persona);

    const { deducted, remaining } = await creditService.deductCredits(
      userId,
      'program'
    );

    if (blueprint && blueprint.program) {
      blueprint.program.selectedName = names.find((n) => n.isAiRecommended) || names[0];
      updateBlueprint(blueprint.id, {
        program: blueprint.program,
        currentStep: 5,
        progress: 55,
      });
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

    const canAfford = await creditService.hasEnoughCredits(userId, 'pricing');
    if (!canAfford) {
      res.status(402).json({
        success: false,
        message: 'Insufficient credits. Please top up your credits to continue.',
      });
      return;
    }

    const blueprints = getBlueprintsByUser(userId);
    const blueprint = blueprints[0];
    const persona = blueprint?.audience?.persona || dummyPersona;
    const niche = blueprint?.niche?.selectedNiche?.name || 'Career Coaching';
    const program = blueprint?.program?.selectedName?.name || 'Coaching Program';

    const pricing = await llmService.generatePricing(persona, niche, program);

    const { deducted, remaining } = await creditService.deductCredits(
      userId,
      'pricing'
    );

    if (blueprint && blueprint.program) {
      blueprint.program.pricing = pricing;
      updateBlueprint(blueprint.id, {
        program: blueprint.program,
        currentStep: 6,
        progress: 70,
      });
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
// POST /api/blueprint/curriculum
// ---------------------------------------------------------------------------
export const generateCurriculum = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  try {
    console.log(`[Blueprint] POST /api/blueprint/curriculum — generating course curriculum`);

    const userId = dummyUser.id;

    const canAfford = await creditService.hasEnoughCredits(userId, 'curriculum');
    if (!canAfford) {
      res.status(402).json({
        success: false,
        message: 'Insufficient credits. Please top up your credits to continue.',
      });
      return;
    }

    const blueprints = getBlueprintsByUser(userId);
    const blueprint = blueprints[0];
    if (!blueprint) {
      res.status(404).json({
        success: false,
        message: 'Blueprint not found. Please complete previous steps first.',
      });
      return;
    }

    const niche = blueprint.niche?.selectedNiche?.name || 'Career Coaching';
    const program = blueprint.program?.selectedName?.name || 'Coaching Program';
    const problems = blueprint.program?.selectedProblems || [];
    const duration = blueprint.program?.duration || '12_weeks';

    const curriculum = await llmService.generateCurriculum(niche, program, problems, duration);

    const { deducted, remaining } = await creditService.deductCredits(
      userId,
      'curriculum'
    );

    if (blueprint && blueprint.program) {
      blueprint.program.curriculum = curriculum;
      updateBlueprint(blueprint.id, {
        program: blueprint.program,
        currentStep: 7,
        progress: 80,
      });
    }

    addActivity({
      userId,
      blueprintId: blueprint.id,
      title: 'Generated Course Curriculum',
      description: `${curriculum.totalLessons} lessons across ${curriculum.modules.length} modules (${duration})`,
      type: 'program',
      createdAt: new Date(),
    });

    const processingTime = Date.now() - startTime;
    console.log(`[Blueprint] Curriculum generated in ${processingTime}ms`);

    sendSuccess(
      res,
      { curriculum },
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
// POST /api/blueprint/quiz
// ---------------------------------------------------------------------------
export const submitQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  try {
    console.log(`[Blueprint] POST /api/blueprint/quiz — submitting readiness quiz`);

    const { answers } = req.body as { answers: number[] };

    if (!answers || !Array.isArray(answers) || answers.length !== 5 || answers.some((a) => a < 0 || a > 3)) {
      res.status(400).json({
        success: false,
        message: 'Invalid quiz submission. Expected 5 answers with values 0–3.',
      });
      return;
    }

    const userId = dummyUser.id;

    const canAfford = await creditService.hasEnoughCredits(userId, 'quiz');
    if (!canAfford) {
      res.status(402).json({
        success: false,
        message: 'Insufficient credits. Quiz submission requires 5 credits.',
      });
      return;
    }

    const blueprints = getBlueprintsByUser(userId);
    const blueprint = blueprints[0];
    if (!blueprint) {
      res.status(404).json({
        success: false,
        message: 'Blueprint not found. Please complete previous steps first.',
      });
      return;
    }

    if (blueprint.readinessQuiz && blueprint.readinessQuiz.retakeCount >= 1) {
      res.status(409).json({
        success: false,
        message: 'Quiz retake limit reached. You can only retake the quiz once.',
      });
      return;
    }

    // Calculate score
    const rawScore = answers.reduce((sum, answerIndex, qIndex) => {
      return sum + quizQuestions[qIndex].options[answerIndex].points;
    }, 0);

    let score: number;
    let persona: string;
    if (rawScore <= 8) {
      score = 3;
      persona = 'Early Explorer';
    } else if (rawScore <= 12) {
      score = 5;
      persona = 'Building Momentum';
    } else if (rawScore <= 16) {
      score = 7.5;
      persona = 'Almost Ready';
    } else {
      score = 9;
      persona = 'Launch-Ready';
    }

    // Identify weakest area
    let weakestIndex = 0;
    let minAnswer = answers[0];
    for (let i = 1; i < answers.length; i++) {
      if (answers[i] < minAnswer) {
        minAnswer = answers[i];
        weakestIndex = i;
      }
    }
    const weakestArea = quizQuestions[weakestIndex].category;
    const actionTips = quizActionTips[weakestArea] || [];

    const retakeCount = (blueprint.readinessQuiz?.retakeCount ?? -1) + 1;

    const readinessQuiz = {
      answers,
      rawScore,
      score,
      persona,
      weakestArea,
      actionTips,
      completedAt: new Date(),
      retakeCount,
    };

    const { deducted, remaining } = await creditService.deductCredits(userId, 'quiz');

    updateBlueprint(blueprint.id, {
      readinessQuiz,
    });

    addActivity({
      userId,
      blueprintId: blueprint.id,
      title: 'Completed Coach Readiness Quiz',
      description: `Scored ${score}/10 — ${persona}`,
      type: 'quiz',
      createdAt: new Date(),
    });

    const processingTime = Date.now() - startTime;
    console.log(`[Blueprint] Quiz submitted in ${processingTime}ms — Score: ${score}/10 (${persona})`);

    sendSuccess(
      res,
      { readinessQuiz },
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

    const canAfford = await creditService.hasEnoughCredits(userId, 'roadmap');
    if (!canAfford) {
      res.status(402).json({
        success: false,
        message: 'Insufficient credits. Please top up your credits to continue.',
      });
      return;
    }

    const blueprints = getBlueprintsByUser(userId);
    const blueprint = blueprints[0];
    if (!blueprint) {
      res.status(404).json({
        success: false,
        message: 'Blueprint not found. Please complete previous steps first.',
      });
      return;
    }

    const duration = blueprint.program?.duration || '12_weeks';
    const { phases } = await llmService.generateRoadmap(blueprint, duration);
    const pdfUrl = await pdfService.generateBlueprintPDF(blueprint);

    const { deducted, remaining } = await creditService.deductCredits(
      userId,
      'roadmap'
    );

    const updated = updateBlueprint(blueprint.id, {
      roadmap: {
        phases,
        pdfUrl,
        completedAt: new Date(),
      },
      status: 'completed',
      currentStep: 8,
      progress: 100,
    });

    addActivity({
      userId,
      blueprintId: blueprint.id,
      title: 'Completed Blueprint Roadmap',
      description: `${duration.replace('_', '-')} roadmap generated and PDF ready`,
      type: 'roadmap',
      createdAt: new Date(),
    });

    const processingTime = Date.now() - startTime;
    console.log(`[Blueprint] Roadmap + PDF generated in ${processingTime}ms`);

    sendSuccess(
      res,
      { phases, pdfUrl, blueprint: updated },
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
// ---------------------------------------------------------------------------
export const downloadPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    console.log(`[Blueprint] GET /api/blueprint/pdf/${id} — downloading PDF`);

    const blueprint = getBlueprintById(id);
    if (!blueprint) {
      res.status(404).json({
        success: false,
        message: 'Blueprint not found.',
      });
      return;
    }

    // Validate blueprint completeness before generating PDF
    const missingFields = validateBlueprintForPDF(blueprint);
    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Blueprint is incomplete. Missing: ${missingFields.join(', ')}. Please complete all wizard steps before downloading.`,
        data: { missingFields },
      });
      return;
    }

    const pdfBuffer = await pdfService.streamPDF(id, blueprint);
    const { filename } = compileBlueprintTemplate(blueprint);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
