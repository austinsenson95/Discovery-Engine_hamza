import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Compass,
  Check,
  Zap,
  Target,
  Users,
  FileText,
  Clock,
  ArrowRight,
  Lock,
  Loader2,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { mockUser } from '@/lib/mockData';
import { fetchAllBlueprints } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ActivityItem {
  id: string;
  title: string;
  timeAgo: string;
  color: 'green' | 'orange' | 'gray';
}

interface WizardStep {
  id: string;
  number: number;
  title: string;
  status: 'completed' | 'in_progress' | 'upcoming';
}

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' as const },
  }),
};

const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Static Data                                                        */
/* ------------------------------------------------------------------ */
const featureList = [
  { icon: Zap, text: 'AI-Powered Niche Discovery' },
  { icon: Users, text: 'Ideal Student Persona' },
  { icon: FileText, text: 'Program Builder & Pricing' },
  { icon: Target, text: '12-Week Launch Roadmap' },
];

const getWizardSteps = (bp?: any): WizardStep[] => {
  const step = bp?.currentStep || 1;
  return [
    { id: '1', number: 1, title: 'Niche Discovery', status: step >= 2 ? 'completed' : step === 1 ? 'in_progress' : 'upcoming' },
    { id: '2', number: 2, title: 'Audience Mapping', status: step >= 3 ? 'completed' : step === 2 ? 'in_progress' : 'upcoming' },
    { id: '3', number: 3, title: 'Program Builder', status: step >= 6 ? 'completed' : step >= 3 && step <= 5 ? 'in_progress' : 'upcoming' },
    { id: '4', number: 4, title: 'Roadmap', status: step >= 7 ? 'completed' : step === 6 ? 'in_progress' : 'upcoming' },
  ];
};



const activityItems: ActivityItem[] = [
  { id: '1', title: 'Started Program Builder', timeAgo: '2 hours ago', color: 'orange' },
  { id: '2', title: 'Completed Audience Mapping', timeAgo: 'Yesterday', color: 'green' },
  { id: '3', title: 'Generated niche recommendations', timeAgo: '2 days ago', color: 'green' },
  { id: '4', title: 'Started Blueprint Wizard', timeAgo: '2 days ago', color: 'green' },
  { id: '5', title: 'Joined Discovery Engine', timeAgo: '3 days ago', color: 'gray' },
];

/* ------------------------------------------------------------------ */
/*  Helper Components                                                  */
/* ------------------------------------------------------------------ */

/** Small status badge for wizard steps */
function StepStatusBadge({ status }: { status: WizardStep['status'] }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
        <Check className="h-3 w-3" />
        Completed
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
      <Lock className="h-3 w-3" />
      Upcoming
    </span>
  );
}

/** Colored dot for activity items */
function ActivityDot({ color }: { color: ActivityItem['color'] }) {
  const colorMap = {
    green: 'bg-emerald-500',
    orange: 'bg-[#F05A28]',
    gray: 'bg-gray-400',
  };
  return <span className={`h-2.5 w-2.5 rounded-full ${colorMap[color]}`} />;
}

/** Circular progress ring for the blueprint card */
function ProgressRing({
  progress,
  size = 140,
  stroke = 10,
}: {
  progress: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F05A28"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' as const, delay: 0.4 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#0A0A0A]">{progress}%</span>
        <span className="text-xs text-gray-500">Complete</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard Component                                           */
/* ------------------------------------------------------------------ */
export default function Home() {
  const navigate = useNavigate();
  const userName = mockUser.name.split(' ')[0]; // "John"
  const creditsTotal = mockUser.credits;
  const [blueprints, setBlueprints] = useState<any[]>([]);

  useEffect(() => {
    fetchAllBlueprints().then(setBlueprints).catch(() => setBlueprints([]));
  }, []);

  const latest = blueprints[0];
  const creditsUsed = latest
    ? (latest.currentStep >= 2 ? 10 : 0) +
      (latest.currentStep >= 3 ? 10 : 0) +
      (latest.currentStep >= 5 ? 5 : 0) +
      (latest.currentStep >= 6 ? 5 : 0) +
      (latest.currentStep >= 7 ? 15 : 0)
    : 0;
  const creditsRemaining = creditsTotal - creditsUsed;

  const currentStepNumber = latest
    ? latest.currentStep >= 7
      ? 4
      : latest.currentStep >= 3
        ? 3
        : latest.currentStep >= 2
          ? 2
          : 1
    : 1;
  const currentStepTitle = ['Niche Discovery', 'Audience Mapping', 'Program Builder', 'Roadmap'][currentStepNumber - 1];
  const progressPercent = latest ? latest.progress : 0;
  const statusText = latest ? (latest.status === 'completed' ? 'Completed' : 'In Progress') : 'Not Started';

  return (
    <div className="min-h-full w-full bg-[#FAFAFA] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* ============================================================ */}
        {/* SECTION 1: Welcome Header                                    */}
        {/* ============================================================ */}
        <motion.section
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h1
            className="text-3xl font-normal text-[#0A0A0A] sm:text-4xl"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Welcome back,{' '}
            <span className="italic text-[#F05A28]">{userName}</span>
          </h1>
          <p className="mt-2 text-base text-gray-500">
            You have {creditsTotal} credits remaining
          </p>
        </motion.section>

        {/* ============================================================ */}
        {/* SECTION 2: Blueprint CTA Card (Hero)                         */}
        {/* ============================================================ */}
        <motion.section
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              {/* Left side */}
              <div className="flex-1 space-y-5">
                {/* Compass icon + badge */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50">
                    <Compass className="h-5 w-5 text-[#F05A28]" />
                  </div>
                  <span
                    className="inline-block rounded-full bg-[#0A0A0A] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white"
                  >
                    Discovery Blueprint
                  </span>
                </div>

                {/* Title */}
                <h2
                  className="text-2xl font-normal text-[#0A0A0A] sm:text-3xl"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Discover Your <span className="italic text-[#F05A28]">Perfect</span> Niche
                </h2>

                {/* Description */}
                <p className="max-w-xl text-sm leading-relaxed text-gray-600">
                  Answer a few questions and our AI will help you discover your coaching niche,
                  define your ideal student, build your program, and create your business roadmap.
                </p>

                {/* Feature list */}
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {featureList.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                        <Check className="h-3 w-3 text-emerald-500" />
                      </span>
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right side — Progress Ring */}
              <div className="flex flex-col items-center gap-4 lg:pl-8">
                <ProgressRing progress={progressPercent} />
                <p className="text-center text-xs text-gray-400">
                  {progressPercent}% complete
                </p>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 flex flex-col items-start gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-400">
                {creditsTotal} credits available — each step uses 5-15 credits
              </p>
              <motion.button
                onClick={() => navigate('/blueprint')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full bg-[#F05A28] px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#d94d20]"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.section>

        {/* ============================================================ */}
        {/* SECTION 3: Quick Stats Row (3 cards)                         */}
        {/* ============================================================ */}
        <motion.section
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 — Current Step */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                  <Target className="h-5 w-5 text-[#F05A28]" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Current Step
                  </p>
                  <p className="mt-0.5 text-xl font-bold text-[#0A0A0A]">
                    Step {currentStepNumber} <span className="text-sm font-normal text-gray-400">of 4</span>
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#F05A28]">
                  {currentStepTitle}
                </span>
              </div>
            </motion.div>

            {/* Card 2 — Credits Used */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <Zap className="h-5 w-5 text-[#059669]" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Credits Used
                  </p>
                  <p className="mt-0.5 text-xl font-bold text-[#0A0A0A]">
                    {creditsUsed} / {creditsTotal}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <Progress
                  value={(creditsUsed / creditsTotal) * 100}
                  className="h-2 w-full [&>div]:bg-[#059669] [&_[data-slot=progress-indicator]]:bg-[#059669]"
                />
                <p className="text-xs text-gray-500">{creditsRemaining} remaining</p>
              </div>
            </motion.div>

            {/* Card 3 — Blueprint Status */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                  <Loader2 className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Blueprint Status
                  </p>
                  <p className="mt-0.5 text-xl font-bold text-[#0A0A0A]">{statusText}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusText === 'Completed' ? 'bg-emerald-50 text-emerald-600' : statusText === 'Not Started' ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusText === 'Completed' ? 'bg-emerald-500' : statusText === 'Not Started' ? 'bg-gray-400' : 'bg-amber-500'}`} />
                  {statusText === 'Completed' ? 'Done' : statusText === 'Not Started' ? 'Start Now' : 'Active'}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ============================================================ */}
        {/* SECTION 4: Progress Overview (4 wizard step cards)           */}
        {/* ============================================================ */}
        <motion.section
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h3
            className="mb-4 text-xl font-normal text-[#0A0A0A]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Progress <span className="italic text-[#F05A28]">Overview</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {getWizardSteps(latest).map((step) => (
              <motion.div
                key={step.id}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    step.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-600'
                      : step.status === 'in_progress'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0A0A0A]">
                    {step.title}
                  </p>
                  <div className="mt-1">
                    <StepStatusBadge status={step.status} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ============================================================ */}
        {/* SECTION 5: Recent Activity                                     */}
        {/* ============================================================ */}
        <motion.section
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h3
            className="mb-4 text-xl font-normal text-[#0A0A0A]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Recent <span className="italic text-[#F05A28]">Activity</span>
          </h3>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <ul className="divide-y divide-gray-100">
              {activityItems.map((item, index) => (
                <motion.li
                  key={item.id}
                  custom={index}
                  variants={slideInLeft}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <ActivityDot color={item.color} />
                  <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-medium text-[#0A0A0A]">
                      {item.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 sm:mt-0">
                      <Clock className="h-3 w-3" />
                      {item.timeAgo}
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
