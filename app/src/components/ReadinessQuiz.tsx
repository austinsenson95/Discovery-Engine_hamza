import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { quizQuestions } from '@/lib/mockData';

interface ReadinessQuizProps {
  onSubmit: (answers: number[]) => void;
  isLoading?: boolean;
}

export default function ReadinessQuiz({ onSubmit, isLoading }: ReadinessQuizProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(quizQuestions.length).fill(-1));

  const handleSelect = (optionIndex: number) => {
    const next = [...answers];
    next[currentQ] = optionIndex;
    setAnswers(next);
  };

  const handleNext = () => {
    if (currentQ < quizQuestions.length - 1) setCurrentQ((q) => q + 1);
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ((q) => q - 1);
  };

  const allAnswered = answers.every((a) => a !== -1);
  const progress = ((currentQ + 1) / quizQuestions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Question {currentQ + 1} of {quizQuestions.length}
          </span>
          <span className="text-xs font-medium text-orange-500">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 mb-6"
        >
          <div className="flex items-start gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {currentQ + 1}
            </span>
            <h4 className="text-lg font-semibold text-gray-900 leading-snug">
              {quizQuestions[currentQ].question}
            </h4>
          </div>

          <div className="space-y-3">
            {quizQuestions[currentQ].options.map((opt, idx) => {
              const isSelected = answers[currentQ] === idx;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 text-gray-900'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-white'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'border-orange-500' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 rounded-full bg-orange-500"
                      />
                    )}
                  </span>
                  <span className="text-sm font-medium">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentQ === 0}
          className={`flex items-center gap-1 text-sm font-medium transition-colors ${
            currentQ === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {currentQ < quizQuestions.length - 1 ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={answers[currentQ] === -1}
            className="py-2.5 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-full hover:from-orange-600 hover:to-orange-700 transition-all shadow-orange inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSubmit(answers)}
            disabled={!allAnswered || isLoading}
            className="py-2.5 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-full hover:from-orange-600 hover:to-orange-700 transition-all shadow-orange inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {isLoading ? 'Submitting...' : 'Submit Quiz'}
          </motion.button>
        )}
      </div>
    </div>
  );
}
