// ============================================================
// DISCOVERY ENGINE — My Journey Page
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { Blueprint } from '@/types';
import { fetchAllBlueprints, fetchActivity, fetchAchievements } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Check,
  Loader2,
  Lock,
  FileText,
  Download,
  Sparkles,
  Rocket,
  Lightbulb,
  Users,
  Trophy,
  Zap,
  Star,
  ArrowRight,
  CircleDot,
} from 'lucide-react';

// ------------------------------------------------------------------
// Animation helpers
// ------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const staggerChild = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

// ------------------------------------------------------------------
// Circular Progress Component
// ------------------------------------------------------------------
function CircularProgress({
  percentage,
  size = 160,
  strokeWidth = 10,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPct / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPct(percentage), 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#059669"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[32px] font-serif text-[#0A0A0A]">{animatedPct}%</span>
        <span className="text-xs text-[#6B7280] uppercase tracking-[0.12em] font-semibold">
          Complete
        </span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Timeline Step Type
// ------------------------------------------------------------------
type StepStatus = 'completed' | 'in_progress' | 'upcoming';

interface TimelineStep {
  id: number;
  title: string;
  description: string;
  detail: string;
  status: StepStatus;
  timestamp: string;
}

function getTimelineSteps(bp?: Blueprint): TimelineStep[] {
  const step = bp?.currentStep || 1;
  const nicheName = bp?.niche?.selectedNiche?.name || 'Your niche';
  const personaName = bp?.audience?.persona?.name || 'Your persona';
  return [
    {
      id: 1,
      title: 'Niche Discovery',
      description: step >= 2 ? 'Completed' : step === 1 ? 'In Progress' : 'Upcoming',
      detail: nicheName,
      status: step >= 2 ? 'completed' : step === 1 ? 'in_progress' : 'upcoming',
      timestamp: step >= 2 ? 'Completed' : step === 1 ? 'In Progress' : 'Complete previous step to unlock',
    },
    {
      id: 2,
      title: 'Audience Mapping',
      description: step >= 3 ? 'Completed' : step === 2 ? 'In Progress' : 'Upcoming',
      detail: `Persona: ${personaName}`,
      status: step >= 3 ? 'completed' : step === 2 ? 'in_progress' : 'upcoming',
      timestamp: step >= 3 ? 'Completed' : step === 2 ? 'In Progress' : 'Complete Niche Discovery first',
    },
    {
      id: 3,
      title: 'Program Builder',
      description: step >= 6 ? 'Completed' : step >= 3 ? 'In Progress' : 'Upcoming',
      detail: 'Setting up your program',
      status: step >= 6 ? 'completed' : step >= 3 ? 'in_progress' : 'upcoming',
      timestamp: step >= 6 ? 'Completed' : step >= 3 ? 'In Progress' : 'Complete Audience Mapping first',
    },
    {
      id: 4,
      title: 'Roadmap Generation',
      description: step >= 8 ? 'Completed' : step === 7 ? 'In Progress' : 'Upcoming',
      detail: 'Generate your roadmap',
      status: step >= 8 ? 'completed' : step === 7 ? 'in_progress' : 'upcoming',
      timestamp: step >= 8 ? 'Completed' : step === 7 ? 'In Progress' : 'Complete Program Builder first',
    },
  ];
}

// ------------------------------------------------------------------
// Timeline Icon
// ------------------------------------------------------------------
function TimelineIcon({ status }: { status: StepStatus }) {
  if (status === 'completed') {
    return (
      <div className="w-10 h-10 rounded-full bg-[#059669] flex items-center justify-center flex-shrink-0">
        <Check size={18} className="text-white" />
      </div>
    );
  }
  if (status === 'in_progress') {
    return (
      <div className="w-10 h-10 rounded-full bg-[#F05A28] flex items-center justify-center flex-shrink-0">
        <Loader2 size={18} className="text-white animate-spin" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-[#D4D4D4] flex items-center justify-center flex-shrink-0">
      <Lock size={16} className="text-white" />
    </div>
  );
}

// ------------------------------------------------------------------
// Status Badge
// ------------------------------------------------------------------
function StatusBadge({ status }: { status: StepStatus }) {
  const styles = {
    completed: 'bg-[#ECFDF5] text-[#059669]',
    in_progress: 'bg-[#FFF0EB] text-[#F05A28]',
    upcoming: 'bg-[#F5F5F5] text-[#6B7280]',
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] ${styles[status]}`}
    >
      {status === 'in_progress' ? 'In Progress' : status === 'completed' ? 'Completed' : 'Upcoming'}
    </span>
  );
}

// ------------------------------------------------------------------
// Achievement Badge Type
// ------------------------------------------------------------------
interface Achievement {
  id: number;
  icon: 'rocket' | 'users' | 'zap' | 'filetext' | 'download' | 'trophy' | 'star' | 'lightbulb';
  title: string;
  description: string;
  earned: boolean;
  color: string;
  bgColor: string;
}



function AchievementIcon({
  icon,
  size = 24,
  color,
}: {
  icon: Achievement['icon'];
  size?: number;
  color: string;
}) {
  const props = { size, color, strokeWidth: 2 };
  switch (icon) {
    case 'rocket':
      return <Rocket {...props} />;
    case 'users':
      return <Users {...props} />;
    case 'zap':
      return <Zap {...props} />;
    case 'filetext':
      return <FileText {...props} />;
    case 'download':
      return <Download {...props} />;
    case 'trophy':
      return <Trophy {...props} />;
    case 'star':
      return <Star {...props} />;
    case 'lightbulb':
      return <Lightbulb {...props} />;
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString();
}

function getActivityColor(type: string): 'green' | 'orange' | 'gray' {
  if (type === 'blueprint' || type === 'niche' || type === 'audience' || type === 'program' || type === 'roadmap') return 'green';
  if (type === 'credit' || type === 'quiz') return 'orange';
  return 'gray';
}

// ------------------------------------------------------------------
// MAIN: Journey Page
// ------------------------------------------------------------------
export default function Journey() {
  const navigate = useNavigate();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activities, setActivities] = useState<Array<{ id: string; text: string; time: string; color: 'green' | 'orange' | 'gray' }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bps, achs, acts] = await Promise.all([
          fetchAllBlueprints(),
          fetchAchievements().catch(() => []),
          fetchActivity().catch(() => []),
        ]);
        setBlueprints(bps);
        setAchievements(achs.map((a: { id: string; icon: string; title: string; description: string; earned: boolean; color: string; bgColor: string }) => ({
          id: Number(a.id),
          icon: a.icon as Achievement['icon'],
          title: a.title,
          description: a.description,
          earned: a.earned,
          color: a.color,
          bgColor: a.bgColor,
        })));
        setActivities(acts.map((a: { id: string | number; title: string; createdAt: string; type: string }) => ({
          id: String(a.id),
          text: a.title,
          time: formatRelativeTime(new Date(a.createdAt)),
          color: getActivityColor(a.type),
        })));
      } catch {
        setBlueprints([]);
        setAchievements([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const latest = blueprints[0];
  const timelineSteps = getTimelineSteps(latest);
  const progressPercent = latest ? latest.progress : 0;
  const completedSteps = latest
    ? (latest.currentStep >= 2 ? 1 : 0) +
      (latest.currentStep >= 3 ? 1 : 0) +
      (latest.currentStep >= 6 ? 1 : 0) +
      (latest.currentStep >= 8 ? 1 : 0)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F05A28]" />
      </div>
    );
  }

  return (
    <div>
      {/* ========== PAGE HEADER ========== */}
      <motion.section
        className="pt-8 pb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <p className="text-sm text-[#6B7280] mb-2">
          Dashboard / MY Journey
        </p>
        <h1 className="font-serif text-[44px] text-[#0A0A0A] leading-tight mb-2">
          MY <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>Journey</em>
        </h1>
        <p className="text-lg text-[#4A4A4A]">
          Track your progress and celebrate milestones
        </p>
      </motion.section>

      {/* ========== OVERALL PROGRESS SECTION ========== */}
      <motion.section
        className="mb-16"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Circular Progress */}
            <motion.div variants={staggerChild} className="flex-shrink-0">
              <CircularProgress percentage={progressPercent} size={160} strokeWidth={10} />
            </motion.div>

            {/* Progress Info */}
            <motion.div variants={staggerChild} className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                <h2 className="font-serif text-2xl text-[#0A0A0A]">
                  Blueprint in <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>Progress</em>
                </h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] ${latest?.status === 'completed' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FFF0EB] text-[#F05A28]'}`}>
                  {latest?.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
              </div>
              <p className="text-[#4A4A4A] text-lg mb-1">{completedSteps} of 4 steps completed</p>
              <p className="text-[#6B7280] text-sm mb-4">
                You are halfway there! Complete the Program Builder to continue.
              </p>

              {/* Mini step labels */}
              <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                {timelineSteps.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${
                        step.status === 'completed'
                          ? 'text-[#059669]'
                          : step.status === 'in_progress'
                            ? 'text-[#F05A28]'
                            : 'text-[#6B7280]'
                      }`}
                    >
                      {step.status === 'completed' ? `${step.title} ✓` : step.title}
                    </span>
                    {idx < timelineSteps.length - 1 && (
                      <ArrowRight size={12} className="text-[#D4D4D4]" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ========== STEPS TIMELINE ========== */}
      <motion.section
        className="mb-16"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Section Header */}
        <motion.div variants={staggerChild} className="mb-8">
          <p className="label-badge text-[#6B7280] mb-2">PROGRESS OVERVIEW</p>
          <h2 className="font-serif text-2xl text-[#0A0A0A]">
            Your <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>Growth</em> Path
          </h2>
        </motion.div>

        {/* Vertical Timeline */}
        <div className="relative max-w-[700px]">
          {timelineSteps.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex gap-5 mb-8 last:mb-0"
              custom={index}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Left: Icon + Connector */}
              <div className="flex flex-col items-center flex-shrink-0">
                <TimelineIcon status={step.status} />
                {index < timelineSteps.length - 1 && (
                  <div
                    className={`w-[2px] flex-1 min-h-[40px] mt-2 ${
                      step.status === 'completed' ? 'bg-[#059669]' : 'bg-[#E5E5E5]'
                    }`}
                  />
                )}
              </div>

              {/* Right: Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="text-base font-bold text-[#0A0A0A]">{step.title}</h3>
                  <StatusBadge status={step.status} />
                </div>
                <p className="text-sm text-[#4A4A4A] mb-1">{step.detail}</p>
                <p className="text-xs text-[#6B7280]">{step.timestamp}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ========== ACHIEVEMENT BADGES ========== */}
      <motion.section
        className="mb-16"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Section Header */}
        <motion.div variants={staggerChild} className="mb-8">
          <p className="label-badge text-[#6B7280] mb-2">ACHIEVEMENTS</p>
          <h2 className="font-serif text-2xl text-[#0A0A0A]">
            Milestones <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>Unlocked</em>
          </h2>
        </motion.div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map((badge, index) => (
            <motion.div
              key={badge.id}
              custom={index}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={badge.earned ? { scale: 1.05 } : undefined}
              className={`bg-white border rounded-xl p-5 text-center transition-shadow duration-200 ${
                badge.earned
                  ? 'border-[#E5E5E5] shadow-sm hover:shadow-md'
                  : 'border-[#E5E5E5] opacity-60'
              }`}
              style={badge.earned ? { borderTopWidth: 3, borderTopColor: badge.color } : undefined}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: badge.bgColor }}
              >
                <AchievementIcon icon={badge.icon} color={badge.color} size={24} />
              </div>

              {/* Title */}
              <h4
                className={`text-sm font-bold mb-1 ${
                  badge.earned ? 'text-[#0A0A0A]' : 'text-[#6B7280]'
                }`}
              >
                {badge.title}
              </h4>

              {/* Description */}
              <p className="text-xs text-[#6B7280] mb-2">{badge.description}</p>

              {/* Status */}
              {!badge.earned && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em] bg-[#F5F5F5] text-[#6B7280]">
                  Locked
                </span>
              )}
              {badge.earned && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em] bg-[#ECFDF5] text-[#059669]">
                  Earned
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ========== BLUEPRINTS LIBRARY ========== */}
      <motion.section
        className="mb-16"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Section Header */}
        <motion.div variants={staggerChild} className="mb-8">
          <p className="label-badge text-[#6B7280] mb-2">YOUR BLUEPRINTS</p>
          <h2 className="font-serif text-2xl text-[#0A0A0A]">
            My <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>Blueprints</em>
          </h2>
        </motion.div>

        {blueprints.length === 0 ? (
          <motion.p variants={staggerChild} className="text-sm text-[#6B7280]">
            No blueprints yet. Start your first blueprint to see it here.
          </motion.p>
        ) : (
          <div className="grid gap-4">
            {blueprints.map((bp, idx) => (
              <motion.div
                key={bp.id}
                variants={staggerChild}
                className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden max-w-[600px]"
                whileHover={{ translateY: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                transition={{ duration: 0.25 }}
              >
                {/* Top section */}
                <div className="bg-[#FFF0EB] p-6">
                  <h3 className="font-serif text-2xl text-[#0A0A0A] mb-1">
                    {bp.niche?.selectedNiche?.name || `Blueprint #${idx + 1}`}
                  </h3>
                  <p className="text-sm text-[#4A4A4A]">
                    {bp.niche?.selectedNiche?.resultDelivered || 'Your coaching blueprint'}
                  </p>
                  <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] bg-white text-[#0A0A0A]">
                    Created {new Date(bp.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Middle section */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={16} className="text-[#F05A28]" />
                      <span className="text-sm text-[#4A4A4A]">{bp.niche?.selectedNiche?.name || 'Niche TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#059669]" />
                      <span className="text-sm text-[#4A4A4A]">Persona: {bp.audience?.persona?.name || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#0A0A0A]" />
                      <span className="text-sm text-[#4A4A4A]">{bp.program?.selectedProblems?.length || 0} Problems</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#F59E0B]" />
                      <span className="text-sm text-[#4A4A4A]">
                        {bp.program?.pricing?.startingPrice
                          ? `Starting at ₹${bp.program.pricing.startingPrice.toLocaleString('en-IN')}`
                          : 'Pricing TBD'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="w-full bg-[#E5E5E5] rounded-full overflow-hidden" style={{ height: 4 }}>
                      <div
                        className="bg-[#059669] rounded-full"
                        style={{
                          width: `${bp.progress}%`,
                          height: '100%',
                          transition: 'width 800ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1.5">{bp.progress}% complete</p>
                  </div>
                </div>

                {/* Bottom section */}
                <div className="px-6 py-4 border-t border-[#E5E5E5] flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] ${bp.status === 'completed' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FFF0EB] text-[#F05A28]'}`}>
                    {bp.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                  <button
                    className="btn-ghost text-sm py-2 px-4"
                    onClick={() => navigate(`/blueprint?id=${bp.id}`)}
                  >
                    {bp.status === 'completed' ? 'View' : 'Continue'}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* ========== ACTIVITY TIMELINE ========== */}
      <motion.section
        className="mb-16"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Section Header */}
        <motion.div variants={staggerChild} className="mb-8">
          <p className="label-badge text-[#6B7280] mb-2">TIMELINE</p>
          <h2 className="font-serif text-2xl text-[#0A0A0A]">
            Recent <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>Activity</em>
          </h2>
        </motion.div>

        {/* Activity Feed */}
        <div className="max-w-[700px] space-y-0">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="flex items-start gap-4 pb-5 last:pb-0"
              custom={index}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Dot */}
              <div className="flex flex-col items-center flex-shrink-0 mt-1">
                <CircleDot
                  size={12}
                  className={
                    activity.color === 'green'
                      ? 'text-[#059669]'
                      : activity.color === 'orange'
                        ? 'text-[#F05A28]'
                        : 'text-[#D4D4D4]'
                  }
                />
                {index < activities.length - 1 && (
                  <div className="w-[2px] flex-1 min-h-[32px] mt-2 bg-[#E5E5E5]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0A0A0A]">{activity.text}</p>
                <p className="text-xs text-[#6B7280]">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
