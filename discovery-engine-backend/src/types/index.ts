/**
 * ============================================================================
 * DISCOVERY ENGINE - Shared TypeScript Type Definitions
 * ============================================================================
 * These types mirror the frontend types and define the data contracts
 * between the frontend and backend API.
 * ============================================================================
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  credits: number;
  language: 'english' | 'hindi';
  createdAt: Date;
  updatedAt: Date;
}

export interface NicheOption {
  id: string;
  name: string;
  whoYouHelp: string;
  problemSolved: string;
  resultDelivered: string;
  revenuePotential: string;
  marketDemand: number;
  fitExplanation: string;
  competitionLevel: string;
  keywords: string[];
  isSelected?: boolean;
}

export interface Persona {
  id: string;
  name: string;
  ageRange: string;
  role: string;
  location: string;
  currentSituation: string;
  biggestDesire: string;
  onlinePlatforms: string[];
  payingCapacity: string;
  painPoints: string[];
  goals: string[];
  quote: string;
  avatar: string;
}

export interface ProgramName {
  id: string;
  name: string;
  description: string;
  isAiRecommended: boolean;
}

export interface PricingStrategy {
  startingPrice: number;
  aiRecommendedPrice?: number;
  priceJustification: string;
  marketInsight: string;
  milestones: {
    students10: number;
    students50: number;
    students100: number;
  };
  priceEvolution: {
    launch: number;
    after10Students: string;
    premiumTier: string;
  };
  sweetSpotRange: string;
}

export type CourseDuration = '4_weeks' | '8_weeks' | '12_weeks';

export interface CurriculumLesson {
  id: string;
  title: string;
  duration?: string;
  learningOutcome?: string;
}

export interface CurriculumModule {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  lessons: CurriculumLesson[];
  output?: string;
}

export interface CourseCurriculum {
  modules: CurriculumModule[];
  totalLessons: number;
  totalDuration: string;
}

export interface RoadmapPhase {
  phase: number;
  weeks: string;
  title: string;
  color: string;
  items: { week: string; tasks: string[] }[];
}

export interface QuizOption {
  id: string;
  text: string;
  points: number;
}

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: QuizOption[];
}

export interface ReadinessQuiz {
  answers: number[];
  rawScore: number;
  score: number;
  persona: string;
  weakestArea: string;
  actionTips: string[];
  completedAt: Date;
  retakeCount: number;
}

export interface Blueprint {
  id: string;
  userId: string;
  title?: string;
  status: 'in_progress' | 'completed';
  currentStep: number;
  progress: number;
  niche?: {
    selectedNiche: NicheOption;
    skills: string;
    experience: string;
    passions: string;
    domains?: string[];
  };
  audience?: {
    persona: Persona;
  };
  program?: {
    selectedProblems: string[];
    generatedProblems?: string[];
    selectedName: ProgramName;
    pricing: PricingStrategy;
    modules: ModuleItem[];
    curriculum?: CourseCurriculum;
    duration?: CourseDuration;
  };
  roadmap?: {
    phases: RoadmapPhase[];
    pdfUrl: string;
    completedAt?: Date;
  };
  readinessQuiz?: ReadinessQuiz;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  duration: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    creditsDeducted?: number;
    remainingCredits?: number;
    processingTime?: number;
  };
}

export interface CreditDeductions {
  niche: number;
  audience: number;
  program: number;
  pricing: number;
  problems: number;
  curriculum: number;
  roadmap: number;
  quiz: number;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceInPaise: number;
  priceDisplay: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: 'created' | 'paid' | 'failed' | 'cancelled';
  amount: number;
  creditsAdded: number;
  createdAt: Date;
}

export interface ActivityItem {
  id: string;
  userId: string;
  blueprintId?: string;
  title: string;
  description?: string;
  type: 'blueprint' | 'niche' | 'audience' | 'program' | 'roadmap' | 'credit' | 'quiz';
  createdAt: Date;
}
