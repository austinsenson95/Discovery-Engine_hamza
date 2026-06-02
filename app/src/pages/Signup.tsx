import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, User, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain uppercase, lowercase, and a number';
    }
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFAFA]">
      {/* Left Brand Panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center justify-center bg-[#0A0A0A] px-8 py-12 lg:w-[45%] xl:w-[42%] overflow-hidden"
      >
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-[#F05A28]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 rounded-full bg-[#F05A28]/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            src="/logo-hamza.png"
            alt="Hamza Chitalwalla"
            className="w-40 h-auto mb-8 drop-shadow-2xl"
          />

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-3xl lg:text-4xl font-bold text-white leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Start Your{' '}
            <span className="italic text-[#F05A28]">Journey</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-4 text-gray-400 text-sm lg:text-base leading-relaxed"
          >
            Join thousands of coaches using AI to discover their niche, build their program, and launch with clarity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-[0.15em]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F05A28]" />
            100 credits to get started
          </motion.div>
        </div>
      </motion.div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 lg:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] border border-gray-100 p-8 sm:p-10">
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#F05A28] mb-2">
                Get Started
              </p>
              <h1
                className="text-3xl font-bold text-[#0A0A0A] leading-tight"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Create Your{' '}
                <span className="italic text-[#F05A28]">Account</span>
              </h1>
              <p className="mt-2 text-[#4A4A4A] text-sm">
                Begin building your coaching blueprint in minutes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded-r-lg"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#0A0A0A] mb-2">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F05A28] transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F05A28]/20 focus:border-[#F05A28] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A0A0A] mb-2">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F05A28] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F05A28]/20 focus:border-[#F05A28] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A0A0A] mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F05A28] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F05A28]/20 focus:border-[#F05A28] focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">Min 8 chars with uppercase, lowercase, and number</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A0A0A] mb-2">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F05A28] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F05A28]/20 focus:border-[#F05A28] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full py-3.5 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#F05A28]/20',
                  isLoading
                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                    : 'bg-[#F05A28] hover:bg-[#d94e22] hover:shadow-xl hover:shadow-[#F05A28]/25 active:scale-[0.98]'
                )}
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-[#4A4A4A]">Already have an account?</p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border-2 border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all"
                >
                  Log in
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400 lg:hidden">
            Hamza Chitalwalla &middot; Discovery Engine
          </p>
        </motion.div>
      </div>
    </div>
  );
}
