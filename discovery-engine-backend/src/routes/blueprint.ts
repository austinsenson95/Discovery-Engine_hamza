/**
 * ============================================================================
 * DISCOVERY ENGINE - Blueprint Routes
 * ============================================================================
 * Routes:
 *   GET  /api/blueprint              → Get current blueprint state
 *   GET  /api/blueprint/all          → Get all blueprints for user
 *   POST /api/blueprint              → Create a new blueprint
 *   PUT  /api/blueprint/:id          → Update a blueprint
 *   DELETE /api/blueprint/:id        → Delete a blueprint
 *   POST /api/blueprint/niche        → Submit niche form, get 3 AI niche options
 *   POST /api/blueprint/audience     → Generate audience persona
 *   POST /api/blueprint/problems          → Save selected audience problems
 *   POST /api/blueprint/generate-problems → Generate AI audience problems
 *   POST /api/blueprint/program-name → Generate program name suggestions
 *   POST /api/blueprint/pricing      → Generate pricing strategy
 *   POST /api/blueprint/curriculum   → Generate course curriculum
 *   POST /api/blueprint/quiz         → Submit coach readiness quiz
 *   POST /api/blueprint/roadmap      → Generate 12-week roadmap + PDF
 *   GET  /api/blueprint/pdf/:id      → Download generated PDF
 * ============================================================================
 */

import { Router } from 'express';
import {
  getBlueprint,
  getAllBlueprints,
  createNewBlueprint,
  updateBlueprintById,
  deleteBlueprintById,
  submitNiche,
  generateAudience,
  submitProblems,
  generateProblems,
  generateProgramNames,
  generatePricing,
  generateCurriculum,
  submitQuiz,
  generateRoadmap,
  downloadPDF,
} from '../controllers/blueprintController';
import { validateNicheForm } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';

const router = Router();

// All blueprint routes require authentication
router.use(authenticate);

// Blueprint state
router.get('/', getBlueprint);
router.get('/all', getAllBlueprints);
router.post('/', createNewBlueprint);
router.put('/:id', updateBlueprintById);
router.delete('/:id', deleteBlueprintById);

// Step-by-step generation endpoints
router.post('/niche', validateNicheForm, submitNiche);
router.post('/audience', generateAudience);
router.post('/problems', submitProblems);
router.post('/generate-problems', generateProblems);
router.post('/program-name', generateProgramNames);
router.post('/pricing', generatePricing);
router.post('/curriculum', generateCurriculum);
router.post('/quiz', submitQuiz);
router.post('/roadmap', generateRoadmap);

// PDF download
router.get('/pdf/:id', downloadPDF);

export default router;
