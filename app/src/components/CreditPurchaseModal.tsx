/**
 * ============================================================================
 * DISCOVERY ENGINE - Credit Purchase Modal
 * ============================================================================
 * Reusable modal for purchasing credits via Razorpay Checkout.
 * Used in: Profile page, Credits Dashboard, Blueprint wizard (on 402).
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { fetchCreditPackages, createPaymentOrder, verifyPayment, recordPaymentFailure } from '@/lib/api';
import type { CreditPackage } from '@/types';
import { useUser } from '@/hooks/useUser';

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// Load Razorpay Checkout.js dynamically
// ---------------------------------------------------------------------------
const loadRazorpay = (): Promise<any> =>
  new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve((window as any).Razorpay);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve((window as any).Razorpay);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CreditPurchaseModal({ isOpen, onClose, onSuccess }: CreditPurchaseModalProps) {
  const { refreshCredits } = useUser();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingPackages, setFetchingPackages] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch packages when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setFetchingPackages(true);
    setError(null);
    setSuccess(false);
    setSelectedPackage(null);
    fetchCreditPackages()
      .then((pkgs) => setPackages(pkgs))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load packages'))
      .finally(() => setFetchingPackages(false));
  }, [isOpen]);

  const handlePurchase = useCallback(
    async (pkg: CreditPackage) => {
      setLoading(true);
      setError(null);
      setSelectedPackage(pkg);

      try {
        const Razorpay = await loadRazorpay();
        if (!Razorpay) {
          throw new Error('Failed to load Razorpay checkout. Please refresh and try again.');
        }

        const { order, package: pkgData, key } = await createPaymentOrder(pkg.id);

        const rzp = new Razorpay({
          key,
          amount: order.amount,
          currency: order.currency,
          name: 'Discovery Engine',
          description: `${pkgData.name} — ${pkgData.credits} credits`,
          order_id: order.id,
          image: '/logo-hamza.png',
          handler: async (response: any) => {
            try {
              await verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              await refreshCredits();
              setSuccess(true);
              setLoading(false);
              setTimeout(() => {
                onSuccess();
                setSuccess(false);
              }, 1500);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Payment verification failed');
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setSelectedPackage(null);
              if (order?.id) {
                recordPaymentFailure({
                  orderId: order.id,
                  paymentId: '',
                  reason: 'User dismissed checkout modal',
                }).catch(() => {
                  // Silently fail — this is best-effort tracking
                });
              }
            },
            escape: true,
            backdropclose: false,
          },
          retry: {
            enabled: true,
            max_count: 3,
          },
          theme: {
            color: '#F05A28',
          },
        });

        rzp.on('payment.failed', (response: any) => {
          setLoading(false);
          setSelectedPackage(null);
          setError(`Payment failed: ${response.error?.description || 'Unknown error'}. Please try again.`);
          if (order?.id && response.error?.metadata?.payment_id) {
            recordPaymentFailure({
              orderId: order.id,
              paymentId: response.error.metadata.payment_id,
              reason: response.error.description || 'Payment failed',
            }).catch(() => {
              // Silently fail — best-effort tracking
            });
          }
        });

        rzp.open();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setLoading(false);
        setSelectedPackage(null);
      }
    },
    [refreshCredits, onSuccess]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#0A0A0A] px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl text-white">
                  Buy <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>Credits</em>
                </h2>
                <p className="text-xs text-gray-400 mt-1">Secure checkout powered by Razorpay</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {fetchingPackages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-[#F05A28] animate-spin" />
                  <span className="ml-2 text-sm text-[#4A4A4A]">Loading packages...</span>
                </div>
              ) : success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10"
                >
                  <CheckCircle className="w-12 h-12 text-[#059669] mb-3" />
                  <p className="font-serif text-xl text-[#0A0A0A]">Credits Added!</p>
                  <p className="text-sm text-[#4A4A4A] mt-1">Your balance has been updated.</p>
                </motion.div>
              ) : (
                <>
                  <p className="text-sm text-[#4A4A4A] mb-5">
                    Choose a credit package to power your Blueprint wizard steps.
                  </p>

                  {/* Package Cards */}
                  <div className="space-y-3 mb-5">
                    {packages.map((pkg) => (
                      <motion.button
                        key={pkg.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handlePurchase(pkg)}
                        disabled={loading}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                          selectedPackage?.id === pkg.id
                            ? 'border-[#F05A28] bg-[#FFF7ED]'
                            : 'border-[#E5E5E5] hover:border-[#F05A28]/50 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center">
                            <Coins className="w-5 h-5 text-[#F05A28]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0A0A0A]">{pkg.name}</p>
                            <p className="text-xs text-[#4A4A4A]">{pkg.credits} credits</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-serif text-[#0A0A0A]">{pkg.priceDisplay}</p>
                          <p className="text-[10px] text-[#6B7280]">
                            ₹{Math.round(pkg.priceInPaise / pkg.credits)}/credit
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Best value badge */}
                  <div className="flex items-center justify-center gap-2 text-xs text-[#6B7280]">
                    <Sparkles className="w-3.5 h-3.5 text-[#F05A28]" />
                    <span>Pro Pack gives you the best value</span>
                  </div>
                </>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-sm text-[#DC2626] text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
