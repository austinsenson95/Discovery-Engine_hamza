import type { NicheOption, Persona, ProgramName, PricingStrategy, RoadmapPhase, User, Blueprint } from '@/types';
import { mockUser, mockNiches, mockPersona, mockProgramNames, mockProblems, mockPricing, mockRoadmap } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchUser = (): Promise<User> => Promise.resolve(mockUser);

export const fetchBlueprint = (): Promise<Blueprint> =>
  Promise.resolve({
    id: '1',
    userId: '1',
    status: 'in_progress',
    currentStep: 1,
    progress: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

export const submitNicheForm = async (_data: any): Promise<{ niches: NicheOption[]; creditsDeducted: number }> => {
  await delay(2000);
  return { niches: mockNiches, creditsDeducted: 10 };
};

export const generatePersona = async (_nicheId: string): Promise<{ persona: Persona; creditsDeducted: number }> => {
  await delay(2000);
  return { persona: mockPersona, creditsDeducted: 10 };
};

export const generateProgramNames = async (): Promise<{ names: ProgramName[]; creditsDeducted: number }> => {
  await delay(1500);
  return { names: mockProgramNames, creditsDeducted: 5 };
};

export const generatePricing = async (): Promise<{ pricing: PricingStrategy; creditsDeducted: number }> => {
  await delay(1500);
  return { pricing: mockPricing, creditsDeducted: 5 };
};

export const generateRoadmap = async (): Promise<{ phases: RoadmapPhase[]; pdfUrl: string; creditsDeducted: number }> => {
  await delay(3000);
  return { phases: mockRoadmap, pdfUrl: '/My-Coaching-Blueprint.pdf', creditsDeducted: 15 };
};

export const fetchProblems = async (): Promise<string[]> => {
  await delay(800);
  return mockProblems;
};
