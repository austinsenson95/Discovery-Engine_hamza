import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import type { Persona } from '@/types';

interface PersonaCardProps {
  persona: Persona;
  onConfirm: () => void;
}

export default function PersonaCard({ persona, onConfirm }: PersonaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden"
    >
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600" />

      <div className="p-8">
        {/* Header */}
        <div className="flex items-start gap-5 mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-serif text-gray-900">{persona.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{persona.ageRange} years old</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{persona.role}</p>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span>{persona.location}</span>
            </div>
          </div>
          <div className="flex-shrink-0 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
            <span className="text-sm font-semibold text-emerald-700">{persona.payingCapacity}</span>
          </div>
        </div>

        {/* Current Situation */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Situation</p>
          <p className="text-sm text-gray-600 leading-relaxed">{persona.currentSituation}</p>
        </div>

        {/* Biggest Desire */}
        <div className="mb-6 bg-orange-50 border border-orange-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-wider mb-2">Biggest Desire</p>
          <p className="text-sm text-gray-800 leading-relaxed italic">"{persona.biggestDesire}"</p>
        </div>

        {/* Quote */}
        <div className="mb-6 text-center">
          <p className="font-serif text-lg text-gray-400 italic">"{persona.quote}"</p>
        </div>

        {/* Pain Points */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Pain Points</p>
          <div className="flex flex-wrap gap-2">
            {persona.painPoints.map(point => (
              <span
                key={point}
                className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5"
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Goals</p>
          <div className="flex flex-wrap gap-2">
            {persona.goals.map(goal => (
              <span
                key={goal}
                className="text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>

        {/* Online Platforms */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Where to Find Them</p>
          <div className="flex flex-wrap gap-2">
            {persona.onlinePlatforms.map(platform => (
              <span
                key={platform}
                className="text-xs font-medium text-gray-500 border border-gray-300 rounded-full px-3 py-1.5"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-full hover:from-orange-600 hover:to-orange-700 transition-all shadow-orange flex items-center justify-center gap-2"
        >
          Yes, This Is My Student!
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
