import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Edit3,
  Check,
  Download,
  Loader2,
  Lightbulb,
  TrendingUp,
  Zap,
  Target,
  Rocket,
  Crown,
  RefreshCcw,
  Calendar,
  Phone,
  ChevronLeft,
} from 'lucide-react';
import type { NicheOption, Persona, ProgramName, PricingStrategy, RoadmapPhase } from '@/types';
import Stepper from '@/components/Stepper';
import NicheCard from '@/components/NicheCard';
import PersonaCard from '@/components/PersonaCard';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/Toast';
import {
  submitNicheForm,
  generatePersona,
  generateProgramNames,
  generatePricing,
  generateRoadmap,
  fetchProblems,
  fetchBlueprint,
  fetchAllBlueprints,
  updateBlueprint,
  deleteBlueprint,
  downloadPDF,
} from '@/lib/api';
import { mockNiches, mockPersona, mockProgramNames, mockPricing, mockRoadmap, mockProblems } from '@/lib/mockData';

const steps = ['Niche Discovery', 'Audience Mapping', 'Program Builder', 'Roadmap & PDF'];

const coachingCategories = [
  '💪 Fitness & Health',
  '💼 Business & Career',
  '🎓 Education & Skills',
  '🧘 Yoga & Mindfulness',
  '💰 Personal Finance',
  '👨‍👩‍👧 Parenting',
  '🎨 Creative Arts',
  '💻 Technology',
  '🗣️ Communication',
  '🏠 Life Coaching',
  '🎵 Music & Performing Arts',
  '📸 Photography & Video',
  '🍳 Cooking & Nutrition',
  '🧠 Mental Health',
  '📱 Digital Marketing',
  '🏋️ Sports Coaching',
  '✈️ Travel & Lifestyle',
  '🌿 Ayurveda & Naturopathy',
];

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

// ─── Skeleton Card for Loading ───
function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse"
    >
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-3 bg-gray-200 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 rounded w-5/6 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-4/6 mb-4" />
      <div className="h-2 bg-gray-200 rounded w-full mb-4" />
      <div className="h-3 bg-gray-200 rounded w-full mb-2" />
      <div className="h-10 bg-gray-200 rounded-full w-full mt-4" />
    </motion.div>
  );
}

// ─── Mini Stepper for Step 3 ───
function MiniStepper({ subStep, labels }: { subStep: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      {labels.map((label, i) => {
        const num = i + 1;
        const isActive = num === subStep;
        const isDone = num < subStep;
        return (
          <div key={num} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : num}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-gray-900' : isDone ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`w-8 h-[2px] ${isDone ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN BLUEPRINT COMPONENT
// ═══════════════════════════════════════════════════
export default function Blueprint() {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [passions, setPassions] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  // Data state
  const [nicheOptions, setNicheOptions] = useState<NicheOption[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<NicheOption | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [programNames, setProgramNames] = useState<ProgramName[]>([]);
  const [selectedProgramName, setSelectedProgramName] = useState<ProgramName | null>(null);
  const [pricing, setPricing] = useState<PricingStrategy | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [credits, setCredits] = useState(100);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [blueprintId, setBlueprintId] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const { toasts, removeToast, success, info } = useToast();

  // Helper tags
  const skillTags = ['Leadership', 'Public Speaking', 'Team Management', 'Problem Solving', 'Mentoring'];
  const expTags = ['10+ years corporate', 'Built teams from scratch', 'Managed P&L', 'Career pivots'];
  const passionTags = ['Helping others grow', 'Teaching', 'Building communities', 'Writing'];

  // Suppress unused variable warnings for state tracked but not rendered
  void selectedProgramName;
  void credits;
  void skillTags;
  void expTags;
  void passionTags;
  void showBooking;

  // Load existing blueprint on mount
  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const queryId = params.get('id');

        const all = await fetchAllBlueprints();

        // Find blueprint by query param id, or fallback to latest
        let target = queryId ? all.find((b) => b.id === queryId) : null;
        if (!target) {
          target = all[0];
        }

        if (target) {
          setBlueprintId(target.id);
          if (target.currentStep > 1) {
            // Restore step based on backend currentStep
            const restoredStep = Math.min(target.currentStep, 4);
            setStep(restoredStep <= 3 ? restoredStep : 4);
            if (target.currentStep >= 3 && target.currentStep <= 5) {
              setSubStep(target.currentStep - 2); // 3->1, 4->2, 5->3
            } else if (target.currentStep >= 6) {
              setSubStep(3);
            }
            if (target.niche) {
              setSkills(target.niche.skills);
              setExperience(target.niche.experience);
              setPassions(target.niche.passions);
              setSelectedDomains(target.niche.domains || []);
              setSelectedNiche(target.niche.selectedNiche);
              setNicheOptions([target.niche.selectedNiche]);
            }
            if (target.audience) {
              setPersona(target.audience.persona);
            }
            if (target.program) {
              setSelectedProblems(target.program.selectedProblems || []);
              setSelectedProgramName(target.program.selectedName);
              if (target.program.pricing) setPricing(target.program.pricing);
            }
            if (target.roadmap) {
              setRoadmap(target.roadmap.phases);
            }
          }
        }
      } catch {
        // Ignore load errors
      }
    };
    load();
  }, []);

  const handleTagClick = (setter: React.Dispatch<React.SetStateAction<string>>, current: string, tag: string) => {
    setter(current ? `${current}, ${tag}` : tag);
  };

  const goToStep = (targetStep: number) => {
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  };

  const handleReset = async () => {
    if (blueprintId) {
      try { await deleteBlueprint(blueprintId); } catch { /* ignore */ }
    }
    setStep(1);
    setSubStep(1);
    setDirection(-1);
    setNicheOptions([]);
    setSelectedNiche(null);
    setPersona(null);
    setProblems([]);
    setSelectedProblems([]);
    setProgramNames([]);
    setSelectedProgramName(null);
    setPricing(null);
    setRoadmap([]);
    setPdfDownloaded(false);
    setShowBooking(false);
    setSkills('');
    setExperience('');
    setPassions('');
    setSelectedDomains([]);
    setBlueprintId(null);
    info('Blueprint progress has been reset. Start fresh!');
  };

  const handleCategoryClick = (category: string) => {
    const clean = category.replace(/^[\p{Emoji}\uFE0F]+\s*/u, '');
    setSelectedDomains(prev =>
      prev.includes(clean)
        ? prev.filter(d => d !== clean)
        : [...prev, clean]
    );
  };

  // ─── Step 1: Submit Niche Form ───
  const handleDiscoverNiche = async () => {
    if (!skills.trim() || !experience.trim() || !passions.trim()) {
      info('Please fill in all three fields');
      return;
    }
    setLoading(true);
    try {
      const result = await submitNicheForm({ skills, experience, passions, domains: selectedDomains });
      setNicheOptions(result.niches);
      setBlueprintId(result.blueprint.id);
      setCredits(prev => prev - result.creditsDeducted);
    } catch {
      setNicheOptions(mockNiches);
    }
    setLoading(false);
  };

  const handleSelectNiche = async (niche: NicheOption) => {
    setSelectedNiche(niche);
    if (blueprintId) {
      try {
        await updateBlueprint(blueprintId, {
          niche: { selectedNiche: niche, skills, experience, passions, domains: selectedDomains },
          currentStep: 2,
          progress: 20,
        });
      } catch { /* ignore */ }
    }
    goToStep(2);
  };

  // ─── Step 2: Generate Persona ───
  const handleGeneratePersona = async () => {
    setLoading(true);
    try {
      const result = await generatePersona(selectedNiche?.id || '1');
      setPersona(result.persona);
      setCredits(prev => prev - result.creditsDeducted);
    } catch {
      setPersona(mockPersona);
    }
    setLoading(false);
  };

  const handleConfirmPersona = async () => {
    goToStep(3);
    setSubStep(1);
    if (blueprintId) {
      try {
        await updateBlueprint(blueprintId, {
          audience: { persona: persona || mockPersona },
          currentStep: 3,
          progress: 35,
        });
      } catch { /* ignore */ }
    }
    setLoading(true);
    try {
      const fetchedProblems = await fetchProblems();
      setProblems(fetchedProblems);
    } catch {
      setProblems(mockProblems);
    }
    setLoading(false);
  };

  // ─── Step 3a: Problem Identification ───
  const handleToggleProblem = (problem: string) => {
    setSelectedProblems(prev =>
      prev.includes(problem) ? prev.filter(p => p !== problem) : [...prev, problem]
    );
  };

  const handleConfirmProblems = async () => {
    if (selectedProblems.length === 0) {
      info('Please select at least one problem');
      return;
    }
    setSubStep(2);
    if (blueprintId) {
      try {
        const bp = await fetchBlueprint();
        const program = bp.program || { selectedProblems: selectedProblems, selectedName: mockProgramNames[1], pricing: mockPricing, modules: [] };
        program.selectedProblems = selectedProblems;
        await updateBlueprint(blueprintId, {
          program,
          currentStep: 4,
          progress: 45,
        });
      } catch { /* ignore */ }
    }
    setLoading(true);
    try {
      const result = await generateProgramNames();
      setProgramNames(result.names);
      setCredits(prev => prev - result.creditsDeducted);
    } catch {
      setProgramNames(mockProgramNames);
    }
    setLoading(false);
  };

  // ─── Step 3b: Program Naming ───
  const handleSelectProgramName = async (name: ProgramName) => {
    setSelectedProgramName(name);
    setSubStep(3);
    if (blueprintId) {
      try {
        const bp = await fetchBlueprint();
        const program = bp.program || { selectedProblems: selectedProblems, selectedName: name, pricing: mockPricing, modules: [] };
        program.selectedName = name;
        await updateBlueprint(blueprintId, {
          program,
          currentStep: 5,
          progress: 55,
        });
      } catch { /* ignore */ }
    }
    setLoading(true);
    try {
      const result = await generatePricing();
      setPricing(result.pricing);
      setCredits(prev => prev - result.creditsDeducted);
    } catch {
      setPricing(mockPricing);
    }
    setLoading(false);
  };

  // ─── Step 3c: Continue to Roadmap ───
  const handleContinueToRoadmap = async () => {
    goToStep(4);
    if (blueprintId) {
      try {
        const bp = await fetchBlueprint();
        const program = bp.program || { selectedProblems: selectedProblems, selectedName: selectedProgramName || mockProgramNames[1], pricing: pricing || mockPricing, modules: [] };
        if (pricing) program.pricing = pricing;
        await updateBlueprint(blueprintId, {
          program,
          currentStep: 6,
          progress: 70,
        });
      } catch { /* ignore */ }
    }
    setLoading(true);
    try {
      const result = await generateRoadmap();
      setRoadmap(result.phases);
      setCredits(prev => prev - result.creditsDeducted);
    } catch {
      setRoadmap(mockRoadmap);
    }
    setLoading(false);
  };

  // ─── Step 4: Download PDF ───
  const handleDownloadPDF = async () => {
    if (!blueprintId || isPdfLoading) return;

    setIsPdfLoading(true);
    try {
      await downloadPDF(blueprintId);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F97316', '#22C55E', '#FFD700', '#FFFFFF'],
      });
      setPdfDownloaded(true);

      try {
        await updateBlueprint(blueprintId, {
          status: 'completed',
          currentStep: 7,
          progress: 100,
        });
      } catch { /* ignore */ }

      success('Your Blueprint PDF is ready for download!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download PDF';
      console.error('[Blueprint] PDF download failed:', message);
      alert(`PDF download failed: ${message}`);
    } finally {
      setIsPdfLoading(false);
    }
  };

  // ═══ RENDER ═══
  return (
    <div className="min-h-full">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Top bar with Reset */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset Blueprint
        </button>
        {blueprintId && (
          <span className="text-xs text-gray-400">ID: {blueprintId}</span>
        )}
      </div>

      {/* Stepper */}
      <Stepper currentStep={step} steps={steps} />

      {/* Content */}
      <div className="max-w-4xl mx-auto py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* ════════════════════════════════════════════
                STEP 1: NICHE DISCOVERY
            ════════════════════════════════════════════ */}
            {step === 1 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-3">
                    Let's Find Your{' '}
                    <span className="italic text-orange-500">Perfect</span> Niche
                  </h2>
                  <p className="text-gray-500 max-w-lg mx-auto">
                    Tell us about your background and we will use AI to discover coaching niches perfectly suited to your experience.
                  </p>
                </div>

                {/* Niche Form */}
                {nicheOptions.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto space-y-6"
                  >
                    {/* Category Quick Select */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Choose Your Coaching Domain
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {coachingCategories.map(cat => {
                          const clean = cat.replace(/^[\p{Emoji}\uFE0F]+\s*/u, '');
                          const isSelected = selectedDomains.includes(clean);
                          return (
                            <button
                              key={cat}
                              onClick={() => handleCategoryClick(cat)}
                              className={`text-xs font-medium border rounded-full px-3 py-1.5 transition-all active:scale-95 ${
                                isSelected
                                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50'
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        What are your top skills? <span className="text-gray-400 font-normal">({skills.length} chars)</span>
                      </label>
                      <textarea
                        value={skills}
                        onChange={e => setSkills(e.target.value)}
                        placeholder="e.g. Leadership, team building, strategic planning, mentoring junior developers..."
                        className="w-full min-h-[120px] bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 placeholder:text-gray-300 focus:border-orange-500 focus:ring-[0_0_0_3px_rgba(249,115,22,0.15)] outline-none transition-all resize-y text-sm"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skillTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleTagClick(setSkills, skills, tag)}
                            className="text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-3 py-1 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all active:scale-95"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        What's your professional experience? <span className="text-gray-400 font-normal">({experience.length} chars)</span>
                      </label>
                      <textarea
                        value={experience}
                        onChange={e => setExperience(e.target.value)}
                        placeholder="e.g. 12 years in tech, managed teams of 20+ people, led digital transformation projects..."
                        className="w-full min-h-[120px] bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 placeholder:text-gray-300 focus:border-orange-500 focus:ring-[0_0_0_3px_rgba(249,115,22,0.15)] outline-none transition-all resize-y text-sm"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {expTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleTagClick(setExperience, experience, tag)}
                            className="text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-3 py-1 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all active:scale-95"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Passions */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        What are you passionate about? <span className="text-gray-400 font-normal">({passions.length} chars)</span>
                      </label>
                      <textarea
                        value={passions}
                        onChange={e => setPassions(e.target.value)}
                        placeholder="e.g. Helping people grow, writing about leadership, conducting workshops, building communities..."
                        className="w-full min-h-[120px] bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 placeholder:text-gray-300 focus:border-orange-500 focus:ring-[0_0_0_3px_rgba(249,115,22,0.15)] outline-none transition-all resize-y text-sm"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {passionTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleTagClick(setPassions, passions, tag)}
                            className="text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-3 py-1 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all active:scale-95"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-center pt-4">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDiscoverNiche}
                        className="py-3.5 px-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-semibold rounded-full hover:from-orange-600 hover:to-orange-700 transition-all shadow-orange inline-flex items-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        Discover My Niche
                      </motion.button>
                      <p className="text-xs text-gray-400 mt-3">This will deduct 10 credits from your account</p>
                    </div>
                  </motion.div>
                )}

                {/* Loading Skeleton */}
                {loading && nicheOptions.length === 0 && (
                  <div className="grid gap-6">
                    <div className="flex items-center justify-center gap-2 text-orange-500 mb-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">AI is analyzing your profile...</span>
                    </div>
                    {[0, 1, 2].map(i => (
                      <SkeletonCard key={i} index={i} />
                    ))}
                  </div>
                )}

                {/* Results */}
                {nicheOptions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        We found <span className="font-semibold text-gray-700">3 recommended niches</span> based on your profile
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setNicheOptions([]);
                            setSkills('');
                            setExperience('');
                            setPassions('');
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit My Answers
                        </button>
                        <button
                          onClick={handleDiscoverNiche}
                          className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          Regenerate
                        </button>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {nicheOptions.map((niche, i) => (
                        <NicheCard
                          key={niche.id}
                          niche={niche}
                          index={i}
                          onSelect={handleSelectNiche}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 2: AUDIENCE MAPPING
            ════════════════════════════════════════════ */}
            {step === 2 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-3">
                    Meet Your <span className="italic text-orange-500">Ideal</span> Student
                  </h2>
                  <p className="text-gray-500 max-w-lg mx-auto">
                    Here is a detailed persona of the person most likely to buy your coaching program.
                  </p>
                </div>

                {/* Selected niche context bar */}
                {selectedNiche && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 mb-8 flex items-center gap-3 max-w-2xl mx-auto"
                  >
                    <Target className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Selected Niche</p>
                      <p className="text-sm text-gray-800">{selectedNiche.name}</p>
                    </div>
                  </motion.div>
                )}

                {/* Persona */}
                {!persona && !loading && (
                  <div className="text-center py-12">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGeneratePersona}
                      className="py-3.5 px-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-semibold rounded-full hover:from-orange-600 hover:to-orange-700 transition-all shadow-orange inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Generate My Ideal Student
                    </motion.button>
                    <p className="text-xs text-gray-400 mt-3">This will deduct 10 credits</p>
                  </div>
                )}

                {loading && !persona && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">AI is crafting your ideal student profile...</span>
                    </div>
                  </div>
                )}

                {persona && <PersonaCard persona={persona} onConfirm={handleConfirmPersona} />}

                <div className="text-center mt-8">
                  <button
                    onClick={() => {
                      setPersona(null);
                      handleGeneratePersona();
                    }}
                    className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 mx-auto transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Regenerate Avatar
                  </button>
                  <button
                    onClick={() => goToStep(1)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto mt-3 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Niche
                  </button>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 3: PROGRAM BUILDER
            ════════════════════════════════════════════ */}
            {step === 3 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-3">
                    Build Your <span className="italic text-orange-500">Signature</span> Program
                  </h2>
                </div>

                <MiniStepper
                  subStep={subStep}
                  labels={['Problems', 'Naming', 'Pricing']}
                />

                {/* ─── 3a: Problem Identification ─── */}
                {subStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl font-serif text-gray-900 mb-2">
                      What Problems Will You <span className="italic text-orange-500">Solve?</span>
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Select the problems your coaching program will solve for your ideal student. These become the foundation of your offer.
                    </p>

                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-orange-500 mr-2" />
                        <span className="text-sm text-orange-500">Loading problems...</span>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 mb-6">
                          {problems.map((problem, i) => (
                            <motion.label
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedProblems.includes(problem)
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <div className="relative flex items-center mt-0.5">
                                <input
                                  type="checkbox"
                                  checked={selectedProblems.includes(problem)}
                                  onChange={() => handleToggleProblem(problem)}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                    selectedProblems.includes(problem)
                                      ? 'bg-orange-500 border-orange-500'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {selectedProblems.includes(problem) && (
                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                  )}
                                </div>
                              </div>
                              <span className="text-sm text-gray-700 leading-relaxed">{problem}</span>
                            </motion.label>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => goToStep(2)}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Audience
                          </button>
                          <p className="text-sm text-gray-500 hidden sm:block">
                            <span className="font-semibold text-gray-700">{selectedProblems.length}</span> of {problems.length} selected
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleConfirmProblems}
                            className="py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-full hover:from-orange-600 hover:to-orange-700 transition-all shadow-orange inline-flex items-center gap-2"
                          >
                            Confirm Problems
                            <ArrowRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ─── 3b: Program Naming ─── */}
                {subStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl font-serif text-gray-900 mb-2">
                      Name Your <span className="italic text-orange-500">Signature</span> Program
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Choose a name that resonates with your audience and reflects the transformation you provide.
                    </p>

                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-orange-500 mr-2" />
                        <span className="text-sm text-orange-500">AI is generating names...</span>
                      </div>
                    ) : (
                      <>
                        <div className="grid md:grid-cols-3 gap-5 mb-8">
                          {programNames.map((name, i) => (
                            <motion.div
                              key={name.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                              className={`relative bg-white border-2 rounded-2xl p-6 transition-all ${
                                name.isAiRecommended
                                  ? 'border-yellow-400 shadow-lg'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {name.isAiRecommended && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-50 border border-yellow-300 rounded-full px-3 py-0.5 flex items-center gap-1.5">
                                  <Crown className="w-3.5 h-3.5 text-yellow-600" />
                                  <span className="text-[11px] font-semibold text-yellow-700 uppercase tracking-wider">AI Recommended</span>
                                </div>
                              )}
                              <h4 className="text-base font-semibold text-gray-900 mb-3 mt-2">{name.name}</h4>
                              <p className="text-sm text-gray-500 leading-relaxed mb-5">{name.description}</p>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectProgramName(name)}
                                className="w-full py-2.5 bg-[#0A0A0A] text-white text-sm font-semibold rounded-full hover:bg-[#141414] transition-colors"
                              >
                                Select
                              </motion.button>
                            </motion.div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setSubStep(1)}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Problems
                          </button>
                          <button
                            onClick={() => {
                              setLoading(true);
                              setTimeout(() => {
                                setProgramNames([...mockProgramNames].sort(() => Math.random() - 0.5));
                                setLoading(false);
                              }, 1500);
                            }}
                            className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            Regenerate Names
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ─── 3c: Pricing Strategy ─── */}
                {subStep === 3 && pricing && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl font-serif text-gray-900 mb-2">
                      Set Your <span className="italic text-orange-500">Pricing</span> Strategy
                    </h3>
                    <p className="text-gray-500 mb-8">
                      AI-recommended pricing based on Indian coaching market research and your target audience's paying capacity.
                    </p>

                    {/* Price Display */}
                    <div className="text-center mb-8">
                      <div className="inline-flex items-baseline gap-1">
                        <span className="text-5xl font-mono font-medium text-orange-500">
                          ₹{pricing.startingPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-lg text-gray-400">/student</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">Starting price (Launch tier)</p>
                    </div>

                    {/* Price Justification */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 mb-1">Why this price?</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{pricing.priceJustification}</p>
                        </div>
                      </div>
                    </div>

                    {/* Market Insight */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-700 mb-1">Market Insight</p>
                          <p className="text-sm text-emerald-600 leading-relaxed">{pricing.marketInsight}</p>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Projections */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {([
                        { label: '10 Students', value: pricing.milestones.students10, icon: Zap },
                        { label: '50 Students', value: pricing.milestones.students50, icon: Target },
                        { label: '100 Students', value: pricing.milestones.students100, icon: Rocket },
                      ]).map(({ label, value, icon: Icon }) => (
                        <motion.div
                          key={label}
                          whileHover={{ y: -2 }}
                          className="bg-white border border-gray-200 rounded-xl p-5 text-center"
                        >
                          <Icon className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                          <p className="text-lg font-mono font-semibold text-gray-900">
                            ₹{value.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{label}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Price Evolution */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                      <p className="text-sm font-semibold text-gray-700 mb-4">Price Evolution</p>
                      <div className="flex items-center justify-between">
                        {[
                          { label: 'Launch', value: `₹${pricing.priceEvolution.launch.toLocaleString('en-IN')}`, active: true },
                          { label: 'After 10 Students', value: pricing.priceEvolution.after10Students, active: false },
                          { label: 'Premium Tier', value: pricing.priceEvolution.premiumTier, active: false },
                        ].map((item, i, arr) => (
                          <div key={item.label} className="flex items-center gap-3 flex-1">
                            <div className="text-center flex-1">
                              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${item.active ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                <span className="text-xs font-semibold">{i + 1}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">{item.label}</p>
                              <p className={`text-sm font-semibold mt-0.5 ${item.active ? 'text-orange-500' : 'text-gray-700'}`}>
                                {item.value}
                              </p>
                            </div>
                            {i < arr.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sweet Spot */}
                    <div className="text-center mb-8">
                      <p className="text-xs text-gray-400 mb-1">Sweet Spot Range</p>
                      <p className="text-sm font-semibold text-gray-700">{pricing.sweetSpotRange}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setSubStep(2)}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Naming
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleContinueToRoadmap}
                        className="py-3.5 px-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-semibold rounded-full hover:from-orange-600 hover:to-orange-700 transition-all shadow-orange inline-flex items-center gap-2"
                      >
                        Continue to Roadmap
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 4: ROADMAP & PDF
            ════════════════════════════════════════════ */}
            {step === 4 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-3">
                    Your <span className="italic text-orange-500">Business</span> Roadmap
                  </h2>
                  <p className="text-gray-500 max-w-lg mx-auto">
                    A 12-week execution plan to take you from zero to your first paying coaching clients.
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-3" />
                    <span className="text-base text-orange-500 font-medium">AI is building your roadmap...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={() => { setStep(3); setSubStep(3); }}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Pricing
                      </button>
                    </div>
                    {/* Roadmap Timeline */}
                    <div className="relative mb-10">
                      {roadmap.map((phase, phaseIndex) => (
                        <motion.div
                          key={phase.phase}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: phaseIndex * 0.15, duration: 0.5 }}
                          className="mb-6"
                        >
                          {/* Phase Header */}
                          <div
                            className="rounded-xl overflow-hidden border border-gray-200 bg-white"
                          >
                            <div
                              className="px-6 py-4 flex items-center justify-between"
                              style={{ backgroundColor: `${phase.color}10`, borderBottom: `1px solid ${phase.color}30` }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                  style={{ backgroundColor: phase.color }}
                                >
                                  {phase.phase}
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{phase.title}</h4>
                                  <p className="text-xs text-gray-500 font-medium">{phase.weeks}</p>
                                </div>
                              </div>
                              <div
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: `${phase.color}20`,
                                  color: phase.color,
                                }}
                              >
                                {phase.items.length} tasks
                              </div>
                            </div>

                            {/* Tasks */}
                            <div className="p-6">
                              <div className="space-y-5">
                                {phase.items.map((item, itemIndex) => (
                                  <div key={itemIndex}>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                      {item.week}
                                    </p>
                                    <ul className="space-y-2">
                                      {item.tasks.map((task, taskIndex) => (
                                        <motion.li
                                          key={taskIndex}
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: phaseIndex * 0.15 + itemIndex * 0.05 + taskIndex * 0.03 }}
                                          className="flex items-start gap-3"
                                        >
                                          <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{ backgroundColor: `${phase.color}15` }}
                                          >
                                            <div
                                              className="w-1.5 h-1.5 rounded-full"
                                              style={{ backgroundColor: phase.color }}
                                            />
                                          </div>
                                          <span className="text-sm text-gray-600 leading-relaxed">{task}</span>
                                        </motion.li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Download CTA */}
                    {!pdfDownloaded ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                      >
                        <motion.button
                          onClick={handleDownloadPDF}
                          whileHover={isPdfLoading ? {} : { scale: 1.03 }}
                          whileTap={isPdfLoading ? {} : { scale: 0.98 }}
                          disabled={isPdfLoading}
                          className="py-4 px-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-semibold rounded-full hover:from-orange-600 hover:to-orange-700 transition-all shadow-orange inline-flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isPdfLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
                          {isPdfLoading ? 'Generating PDF...' : 'Download My Blueprint PDF'}
                        </motion.button>
                        <p className="text-sm text-gray-400 mt-4">This will deduct 15 credits</p>
                      </motion.div>
                    ) : !showBooking ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <div className="inline-flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-full px-6 py-3 mb-4">
                          <Check className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm font-semibold text-emerald-700">Your Blueprint PDF is ready!</span>
                        </div>
                        <p className="text-gray-500 text-sm">
                          Check your downloads folder for <span className="font-medium text-gray-700">My-Coaching-Blueprint.pdf</span>
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-6">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowBooking(true)}
                            className="py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-full hover:from-orange-600 hover:to-orange-700 transition-all shadow-orange inline-flex items-center gap-2"
                          >
                            <Calendar className="w-4 h-4" />
                            Book a Strategy Call
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleReset}
                            className="py-3 px-6 bg-[#0A0A0A] text-white text-sm font-semibold rounded-full hover:bg-[#141414] transition-colors inline-flex items-center gap-2"
                          >
                            <RotateCw className="w-4 h-4" />
                            Start Over
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-xl mx-auto text-center py-8"
                      >
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8">
                          <Phone className="w-10 h-10 text-orange-500 mx-auto mb-4" />
                          <h3 className="text-2xl font-serif text-gray-900 mb-2">
                            Ready to <span className="italic text-orange-500">Launch?</span>
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Book a free 1-on-1 strategy call with Hamza to review your blueprint and plan your next steps.
                          </p>
                          <a
                            href="https://hamzaccoaching.com/1hfbpvsl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 py-3.5 px-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-semibold rounded-full hover:from-orange-600 hover:to-orange-700 transition-all shadow-orange"
                          >
                            <Calendar className="w-5 h-5" />
                            Book My Call Now
                          </a>
                          <button
                            onClick={handleReset}
                            className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto transition-colors"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            Start a New Blueprint
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
