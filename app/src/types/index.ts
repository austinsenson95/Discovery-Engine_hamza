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
  priceJustification: string;
  marketInsight: string;
  milestones: { students10: number; students50: number; students100: number };
  priceEvolution: { launch: number; after10Students: string; premiumTier: string };
  sweetSpotRange: string;
}

export interface RoadmapPhase {
  phase: number;
  weeks: string;
  title: string;
  color: string;
  items: { week: string; tasks: string[] }[];
}

export interface Blueprint {
  id: string;
  userId: string;
  status: 'in_progress' | 'completed';
  currentStep: number;
  progress: number;
  niche?: { selectedNiche: NicheOption; skills: string; experience: string; passions: string };
  audience?: { persona: Persona };
  program?: { selectedProblems: string[]; selectedName: ProgramName; pricing: PricingStrategy; modules: any[] };
  roadmap?: { phases: RoadmapPhase[]; pdfUrl: string; completedAt?: Date };
  createdAt: Date;
  updatedAt: Date;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'blueprint' | 'niche' | 'audience' | 'program' | 'roadmap' | 'credit';
}
