import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { requestPasswordReset } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await requestPasswordReset({ email });
      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <CheckCircle className="w-16 h-16 text-[#059669] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#0A0A0A]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Check your <span className="italic text-[#F05A28]">inbox</span>
          </h1>
          <p className="mt-3 text-[#4A4A4A]">
            If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 text-[#F05A28] font-semibold hover:underline"
          >
            Back to log in
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0A0A0A]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Reset your <span className="italic text-[#F05A28]">password</span>
          </h1>
          <p className="mt-2 text-[#4A4A4A]">Enter your email and we'll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F05A28]/20 focus:border-[#F05A28] transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-3.5 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition-all',
              isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#F05A28] hover:bg-[#d94e22] active:scale-[0.98]'
            )}
          >
            {isLoading ? 'Sending...' : 'Send reset link'}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#4A4A4A]">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-[#F05A28] hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
