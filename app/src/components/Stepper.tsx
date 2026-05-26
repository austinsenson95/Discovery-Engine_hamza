import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 py-6 lg:px-8 lg:py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between relative">
          {/* Connecting lines */}
          <div className="absolute top-[18px] left-[calc(12.5%+18px)] right-[calc(12.5%+18px)] h-[1px] bg-gray-200 -z-0">
            <div
              className="h-full bg-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={stepNum}
                className="flex flex-col items-center gap-2 relative z-10 flex-1"
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_0_4px_rgba(249,115,22,0.2)]'
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    stepNum
                  )}
                </motion.div>
                <span
                  className={`text-xs font-medium transition-colors duration-200 ${
                    isCompleted
                      ? 'text-gray-500'
                      : isCurrent
                      ? 'text-gray-900 font-semibold'
                      : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
