import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Target, Zap } from 'lucide-react';
import type { ReadinessQuiz } from '@/types';

interface QuizResultProps {
  quiz: ReadinessQuiz;
  onRetake?: () => void;
  canRetake?: boolean;
}

export default function QuizResult({ quiz, onRetake, canRetake }: QuizResultProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * quiz.score * 10) / 10);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [quiz.score]);

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (displayScore / 10) * circumference;

  const personaColors: Record<string, string> = {
    'Early Explorer': 'bg-amber-50 text-amber-700 border-amber-200',
    'Building Momentum': 'bg-blue-50 text-blue-700 border-blue-200',
    'Almost Ready': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Launch-Ready': 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const personaColor = personaColors[quiz.persona] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-gray-200 rounded-2xl p-8 text-center mb-6"
      >
        <h3 className="text-xl font-serif text-gray-900 mb-6">
          Your Coach <span className="italic text-orange-500">Readiness</span> Score
        </h3>

        <div className="relative w-40 h-40 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#F3F4F6" strokeWidth="8" />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#F97316"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-bold text-gray-900"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {displayScore}
            </motion.span>
            <span className="text-sm text-gray-400">/ 10</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className={`inline-block px-4 py-1.5 rounded-full border text-sm font-semibold mb-4 ${personaColor}`}
        >
          {quiz.persona}
        </motion.div>

        <p className="text-sm text-gray-500 mb-2">
          Raw Score: {quiz.rawScore} / 20
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-orange-500" />
          <h4 className="text-base font-semibold text-gray-900">Your Focus Area</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4 capitalize">
          Weakest area: <span className="font-semibold text-gray-800">{quiz.weakestArea.replace('_', ' ')}</span>
        </p>

        <div className="space-y-3">
          {quiz.actionTips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.15, duration: 0.4 }}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <Zap className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">{tip}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {canRetake && onRetake && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <button
            onClick={onRetake}
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1.5 mx-auto transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retake Quiz (once)
          </button>
        </motion.div>
      )}
    </div>
  );
}
