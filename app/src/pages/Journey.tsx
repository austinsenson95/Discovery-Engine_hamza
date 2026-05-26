// ============================================================
// DISCOVERY ENGINE — My Journey Page
// ============================================================

import { useState, useEffect } from 'react';
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

const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Niche Discovery',
    description: 'Completed',
    detail: 'Clarity & Confidence Coach',
    status: 'completed',
    timestamp: 'Completed on May 15, 2025',
  },
  {
    id: 2,
    title: 'Audience Mapping',
    description: 'Completed',
    detail: 'Persona: Kartik',
    status: 'completed',
    timestamp: 'Completed on May 16, 2025',
  },
  {
    id: 3,
    title: 'Program Builder',
    description: 'In Progress',
    detail: 'Setting up your program',
    status: 'in_progress',
    timestamp: 'Started on May 17, 2025',
  },
  {
    id: 4,
    title: 'Roadmap Generation',
    description: 'Upcoming',
    detail: 'Generate your roadmap',
    status: 'upcoming',
    timestamp: 'Complete step 3 to unlock',
  },
];

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

const achievements: Achievement[] = [
  {
    id: 1,
    icon: 'rocket',
    title: 'First Steps',
    description: 'Complete Step 1',
    earned: true,
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  {
    id: 2,
    icon: 'users',
    title: 'People Person',
    description: 'Complete Step 2',
    earned: true,
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  {
    id: 3,
    icon: 'zap',
    title: 'Getting Started',
    description: 'Start the wizard',
    earned: true,
    color: '#F05A28',
    bgColor: '#FFF0EB',
  },
  {
    id: 4,
    icon: 'filetext',
    title: 'Program Builder',
    description: 'Complete Step 3',
    earned: false,
    color: '#D4D4D4',
    bgColor: '#F5F5F5',
  },
  {
    id: 5,
    icon: 'trophy',
    title: 'Roadmapper',
    description: 'Complete Step 4',
    earned: false,
    color: '#D4D4D4',
    bgColor: '#F5F5F5',
  },
  {
    id: 6,
    icon: 'download',
    title: 'PDF Pro',
    description: 'Download your first blueprint',
    earned: false,
    color: '#D4D4D4',
    bgColor: '#F5F5F5',
  },
  {
    id: 7,
    icon: 'star',
    title: 'Credit Saver',
    description: 'Complete with credits remaining',
    earned: false,
    color: '#D4D4D4',
    bgColor: '#F5F5F5',
  },
  {
    id: 8,
    icon: 'lightbulb',
    title: 'Speed Runner',
    description: 'Complete all steps in one day',
    earned: false,
    color: '#D4D4D4',
    bgColor: '#F5F5F5',
  },
];

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

// ------------------------------------------------------------------
// Activity Item Type
// ------------------------------------------------------------------
interface Activity {
  id: number;
  text: string;
  time: string;
  color: 'green' | 'orange' | 'gray';
}

const activities: Activity[] = [
  { id: 1, text: 'Started Program Builder', time: '2 hours ago', color: 'orange' },
  { id: 2, text: 'Completed Audience Mapping', time: 'Yesterday', color: 'green' },
  { id: 3, text: 'Generated niche recommendations', time: '2 days ago', color: 'green' },
  { id: 4, text: 'Started Blueprint Wizard', time: '2 days ago', color: 'green' },
  { id: 5, text: 'Joined Discovery Engine', time: '3 days ago', color: 'gray' },
];

// ------------------------------------------------------------------
// MAIN: Journey Page
// ------------------------------------------------------------------
export default function Journey() {
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
          Dashboard / My Journey
        </p>
        <h1 className="font-serif text-[44px] text-[#0A0A0A] leading-tight mb-2">
          My <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>Journey</em>
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
              <CircularProgress percentage={50} size={160} strokeWidth={10} />
            </motion.div>

            {/* Progress Info */}
            <motion.div variants={staggerChild} className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                <h2 className="font-serif text-2xl text-[#0A0A0A]">
                  Blueprint in <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>Progress</em>
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] bg-[#FFF0EB] text-[#F05A28]">
                  In Progress
                </span>
              </div>
              <p className="text-[#4A4A4A] text-lg mb-1">2 of 4 steps completed</p>
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

        {/* Blueprint Card */}
        <motion.div
          variants={staggerChild}
          className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden max-w-[600px]"
          whileHover={{ translateY: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
          transition={{ duration: 0.25 }}
        >
          {/* Top section */}
          <div className="bg-[#FFF0EB] p-6">
            <h3 className="font-serif text-2xl text-[#0A0A0A] mb-1">Coaching Blueprint #1</h3>
            <p className="text-sm text-[#4A4A4A]">From scattered to centered in 90 days</p>
            <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] bg-white text-[#0A0A0A]">
              Created May 15, 2025
            </span>
          </div>

          {/* Middle section */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-[#F05A28]" />
                <span className="text-sm text-[#4A4A4A]">Clarity & Confidence Coach</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#059669]" />
                <span className="text-sm text-[#4A4A4A]">Persona: Kartik</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#0A0A0A]" />
                <span className="text-sm text-[#4A4A4A]">6 Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#F59E0B]" />
                <span className="text-sm text-[#4A4A4A]">Starting at $497</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="w-full bg-[#E5E5E5] rounded-full overflow-hidden" style={{ height: 4 }}>
                <div
                  className="bg-[#059669] rounded-full"
                  style={{
                    width: '50%',
                    height: '100%',
                    transition: 'width 800ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
              <p className="text-xs text-[#6B7280] mt-1.5">50% complete</p>
            </div>
          </div>

          {/* Bottom section */}
          <div className="px-6 py-4 border-t border-[#E5E5E5] flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] bg-[#FFF0EB] text-[#F05A28]">
              In Progress
            </span>
            <button className="btn-ghost text-sm py-2 px-4">
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* Empty state hint */}
        <motion.p variants={staggerChild} className="text-sm text-[#6B7280] mt-4">
          Complete your first blueprint to see it here.
        </motion.p>
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
