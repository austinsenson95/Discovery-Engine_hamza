import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import type { NicheOption } from '@/types';

interface NicheCardProps {
  niche: NicheOption;
  index: number;
  onSelect: (niche: NicheOption) => void;
}

export default function NicheCard({ niche, index, onSelect }: NicheCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-l-[6px] hover:border-l-orange-500 border-l-[3px] border-l-orange-500"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 pr-4">{niche.name}</h3>
          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 flex-shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">{niche.revenuePotential}</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Who You Help</p>
            <p className="text-sm text-gray-600">{niche.whoYouHelp}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Problem Solved</p>
            <p className="text-sm text-gray-600">{niche.problemSolved}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Result Delivered</p>
            <p className="text-sm text-gray-600">{niche.resultDelivered}</p>
          </div>
        </div>

        {/* Market Demand */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500">Market Demand</span>
            <span className="text-xs font-semibold text-orange-500">{niche.marketDemand}/100</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${niche.marketDemand}%` }}
              transition={{ duration: 0.8, delay: index * 0.15 + 0.3, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
            />
          </div>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 mb-4">
          {niche.keywords.map(kw => (
            <span
              key={kw}
              className="text-xs font-medium text-gray-500 border border-gray-300 rounded-full px-3 py-1 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-colors cursor-default"
            >
              {kw}
            </span>
          ))}
        </div>

        {/* AI Explanation */}
        <p className="text-sm text-gray-500 italic mb-5 leading-relaxed">{niche.fitExplanation}</p>

        {/* Competition */}
        <p className="text-xs text-gray-400 mb-5">
          <span className="font-semibold">Competition:</span> {niche.competitionLevel}
        </p>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(niche)}
          className="w-full py-3 px-6 bg-[#0A0A0A] text-white text-sm font-semibold rounded-full hover:bg-[#141414] transition-colors shadow-lg"
        >
          Select This Niche
        </motion.button>
      </div>
    </motion.div>
  );
}
