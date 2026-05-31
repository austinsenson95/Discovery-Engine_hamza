/**
 * ============================================================================
 * DISCOVERY ENGINE — Credits Dashboard
 * ============================================================================
 * Dedicated page for credit management:
 *   - Balance display
 *   - Transaction history
 *   - AI step cost breakdown
 *   - Credit purchase packages
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  Zap,
  Users,
  Lightbulb,
  Target,
  BookOpen,
  Map,
  HelpCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { fetchCreditHistory } from '@/lib/api';
import CreditPurchaseModal from '@/components/CreditPurchaseModal';

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

// ------------------------------------------------------------------
// Credit cost breakdown data
// ------------------------------------------------------------------
const costBreakdown = [
  { icon: Zap, label: 'Niche Discovery', cost: 10, desc: 'AI-powered niche recommendations' },
  { icon: Users, label: 'Audience Mapping', cost: 10, desc: 'Detailed persona generation' },
  { icon: Target, label: 'Problem Selection', cost: 5, desc: 'Contextual problem generation' },
  { icon: Lightbulb, label: 'Program Naming', cost: 5, desc: 'AI program name suggestions' },
  { icon: BookOpen, label: 'Pricing Strategy', cost: 5, desc: 'Market-aware pricing' },
  { icon: Map, label: '12-Week Roadmap', cost: 15, desc: 'Full launch roadmap + PDF' },
  { icon: HelpCircle, label: 'Readiness Quiz', cost: 5, desc: 'Personalized readiness score' },
];

// ------------------------------------------------------------------
// Transaction type
// ------------------------------------------------------------------
interface CreditTransaction {
  date: string;
  action: string;
  credits: string;
  balance: string;
}

function formatTxDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTxTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ------------------------------------------------------------------
// MAIN: Credits Dashboard
// ------------------------------------------------------------------
export default function Credits() {
  const { credits, refreshCredits } = useUser();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const history = await fetchCreditHistory();
      setTransactions(
        history.transactions.map((t) => ({
          date: `${formatTxDate(t.createdAt)} at ${formatTxTime(t.createdAt)}`,
          action: t.action,
          credits: t.amount > 0 ? `+${t.amount}` : String(t.amount),
          balance: String(t.balanceAfter),
        }))
      );
      refreshCredits();
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [refreshCredits]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      {/* ========== PAGE HEADER ========== */}
      <motion.section
        className="pt-8 pb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <p className="text-sm text-[#6B7280] mb-2">Dashboard / Credits</p>
        <h1 className="font-serif text-[44px] text-[#0A0A0A] leading-tight mb-2">
          Credit{' '}
          <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>
            Dashboard
          </em>
        </h1>
        <p className="text-lg text-[#4A4A4A]">
          Manage your credits, view usage history, and purchase more.
        </p>
      </motion.section>

      {/* ========== BALANCE HERO ========== */}
      <motion.section
        className="mb-8"
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Balance */}
            <div className="flex-1 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] flex items-center justify-center">
                <Coins className="w-8 h-8 text-[#059669]" />
              </div>
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Current Balance</p>
                <p className="font-serif text-[48px] text-[#059669] leading-none">{credits}</p>
                <p className="text-sm text-[#4A4A4A] mt-1">credits remaining</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setPurchaseModalOpen(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                Buy More Credits
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ========== COST BREAKDOWN ========== */}
      <motion.section
        className="mb-8"
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8">
          <p className="label-badge text-[#6B7280] mb-4">COST BREAKDOWN</p>
          <h2 className="font-serif text-2xl text-[#0A0A0A] mb-6">
            AI Step <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>Costs</em>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {costBreakdown.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-3 p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5]"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-[#F05A28]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#0A0A0A]">{item.label}</p>
                    <span className="text-sm font-bold text-[#F05A28]">{item.cost}</span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ========== TRANSACTION HISTORY ========== */}
      <motion.section
        className="mb-8"
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8">
          <p className="label-badge text-[#6B7280] mb-4">HISTORY</p>
          <h2 className="font-serif text-2xl text-[#0A0A0A] mb-6">
            Transaction <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>History</em>
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#F05A28] animate-spin" />
              <span className="ml-2 text-sm text-[#4A4A4A]">Loading history...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10">
              <Coins className="w-10 h-10 text-[#D4D4D4] mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">No transactions yet.</p>
            </div>
          ) : (
            <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F5F5F5]">
                    <th className="text-left text-xs font-semibold text-[#6B7280] uppercase tracking-[0.12em] px-4 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-[#6B7280] uppercase tracking-[0.12em] px-4 py-3">
                      Action
                    </th>
                    <th className="text-right text-xs font-semibold text-[#6B7280] uppercase tracking-[0.12em] px-4 py-3">
                      Credits
                    </th>
                    <th className="text-right text-xs font-semibold text-[#6B7280] uppercase tracking-[0.12em] px-4 py-3">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <motion.tr
                      key={index}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.3 + index * 0.04,
                        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                      }}
                    >
                      <td className="text-sm text-[#0A0A0A] px-4 py-3 whitespace-nowrap">{tx.date}</td>
                      <td className="text-sm text-[#4A4A4A] px-4 py-3">{tx.action}</td>
                      <td
                        className={`text-sm font-semibold text-right px-4 py-3 ${
                          tx.credits.startsWith('+') ? 'text-[#059669]' : 'text-[#DC2626]'
                        }`}
                      >
                        {tx.credits}
                      </td>
                      <td className="text-sm text-[#0A0A0A] text-right px-4 py-3">{tx.balance}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.section>

      {/* Purchase Modal */}
      <CreditPurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        onSuccess={() => {
          setPurchaseModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
