// ============================================================
// DISCOVERY ENGINE — My Profile Page
// ============================================================

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LogOut,
  Coins,
  FileText,
  Globe,
  Pencil,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
// Credit transaction type
// ------------------------------------------------------------------
interface CreditTransaction {
  date: string;
  action: string;
  credits: string;
  balance: string;
}

const creditTransactions: CreditTransaction[] = [
  { date: 'May 17', action: 'Program Builder start', credits: '-10', balance: '100' },
  { date: 'May 16', action: 'Audience Mapping', credits: '-10', balance: '110' },
  { date: 'May 15', action: 'Niche Discovery', credits: '-10', balance: '120' },
  { date: 'May 15', action: 'Welcome bonus', credits: '+100', balance: '130' },
];

// ------------------------------------------------------------------
// MAIN: Profile Page
// ------------------------------------------------------------------
export default function Profile() {
  const [language, setLanguage] = useState('english');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleSavePreferences = useCallback(() => {
    const win = window as unknown as Record<string, unknown>;
    if (typeof win.addToast === 'function') {
      (win.addToast as (t: { type: 'success'; message: string; duration: number }) => void)({
        type: 'success',
        message: 'Preferences saved successfully!',
        duration: 3000,
      });
    }
  }, []);

  return (
    <div>
      {/* ========== PAGE HEADER ========== */}
      <motion.section
        className="pt-8 pb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <p className="text-sm text-[#6B7280] mb-2">Dashboard / Profile</p>
        <h1 className="font-serif text-[44px] text-[#0A0A0A] leading-tight mb-2">
          My{' '}
          <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>
            Profile
          </em>
        </h1>
        <p className="text-lg text-[#4A4A0A]">
          Manage your account, preferences, and settings.
        </p>
      </motion.section>

      {/* ========== ACCOUNT SECTION ========== */}
      <motion.section
        className="mb-8"
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Left: Avatar & Identity */}
            <motion.div
              className="flex flex-col items-center text-center flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <button className="text-sm text-[#F05A28] underline mb-4">Change Photo</button>
              <h2 className="font-serif text-2xl text-[#0A0A0A]">John Doe</h2>
              <p className="text-sm text-[#4A4A4A]">john.doe@example.com</p>
              <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] bg-[#F5F5F5] text-[#6B7280]">
                Member since May 2025
              </span>
            </motion.div>

            {/* Right: Quick Info Grid */}
            <motion.div
              className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Credits */}
              <motion.div
                variants={staggerChild}
                className="bg-[#F5F5F5] rounded-xl p-5 text-center"
              >
                <Coins size={20} className="text-[#059669] mx-auto mb-2" />
                <p className="font-serif text-2xl text-[#059669]">100</p>
                <p className="text-xs text-[#6B7280]">credits remaining</p>
              </motion.div>

              {/* Blueprints */}
              <motion.div
                variants={staggerChild}
                className="bg-[#F5F5F5] rounded-xl p-5 text-center"
              >
                <FileText size={20} className="text-[#F05A28] mx-auto mb-2" />
                <p className="font-serif text-2xl text-[#0A0A0A]">1</p>
                <p className="text-xs text-[#6B7280]">blueprint created</p>
              </motion.div>

              {/* Language */}
              <motion.div
                variants={staggerChild}
                className="bg-[#F5F5F5] rounded-xl p-5 text-center"
              >
                <Globe size={20} className="text-[#0A0A0A] mx-auto mb-2" />
                <p className="font-serif text-2xl text-[#0A0A0A]">English</p>
                <p className="text-xs text-[#6B7280]">language</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Edit Profile button */}
          <div className="mt-6 flex justify-end">
            <button className="btn-ghost text-sm py-2 px-4">
              <Pencil size={14} />
              Edit Profile
            </button>
          </div>
        </div>
      </motion.section>

      {/* ========== PREFERENCES SECTION ========== */}
      <motion.section
        className="mb-8"
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8">
          <p className="label-badge text-[#6B7280] mb-4">PREFERENCES</p>
          <h2 className="font-serif text-2xl text-[#0A0A0A] mb-8">
            Your <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>Settings</em>
          </h2>

          <div className="space-y-8 max-w-[560px]">
            {/* Language Selector */}
            <div>
              <label className="label-badge text-[#6B7280] block mb-3">LANGUAGE</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[200px] h-12 border-[#D4D4D4] rounded-lg focus:ring-[#F05A28] focus:border-[#F05A28]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[#6B7280] mt-2">
                This affects AI-generated content language and PDF export language.
              </p>
            </div>

            {/* Notifications */}
            <div>
              <label className="label-badge text-[#6B7280] block mb-4">NOTIFICATIONS</label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#0A0A0A]">Email me when my blueprint is ready</span>
                  <Switch
                    checked={emailNotifs}
                    onCheckedChange={setEmailNotifs}
                    className="data-[state=checked]:bg-[#F05A28]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#0A0A0A]">Email me credit usage summaries</span>
                  <Switch
                    checked={pushNotifs}
                    onCheckedChange={setPushNotifs}
                    className="data-[state=checked]:bg-[#F05A28]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#0A0A0A]">Email me tips and updates</span>
                  <Switch
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                    className="data-[state=checked]:bg-[#F05A28]"
                  />
                </div>
              </div>
            </div>

            {/* Theme Preference */}
            <div>
              <label className="label-badge text-[#6B7280] block mb-3">APPEARANCE</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    theme === 'light'
                      ? 'border-[#F05A28] bg-[#F5F5F5] text-[#0A0A0A]'
                      : 'border-[#D4D4D4] bg-white text-[#6B7280] hover:bg-[#F5F5F5]'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    theme === 'dark'
                      ? 'border-[#F05A28] bg-[#0A0A0A] text-white'
                      : 'border-[#D4D4D4] bg-white text-[#6B7280] hover:bg-[#F5F5F5]'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button onClick={handleSavePreferences} className="btn-primary">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ========== CREDITS & BILLING SECTION ========== */}
      <motion.section
        className="mb-8"
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8">
          <p className="label-badge text-[#6B7280] mb-4">CREDITS & BILLING</p>
          <h2 className="font-serif text-2xl text-[#0A0A0A] mb-8">
            Credit <em className="text-[#F05A28] not-italic" style={{ fontStyle: 'italic' }}>Balance</em>
          </h2>

          {/* Credit Balance Card */}
          <motion.div
            className="bg-[#ECFDF5] rounded-xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <Coins size={32} className="text-[#059669] mb-3" />
            <p className="font-serif text-[32px] text-[#059669]">100 Credits</p>
            <p className="text-sm text-[#4A4A4A] mb-3">You have plenty of credits to keep building!</p>
            {/* Usage bar */}
            <div className="w-full bg-[#FFFFFF] rounded-full overflow-hidden" style={{ height: 4 }}>
              <div
                className="bg-[#059669] rounded-full"
                style={{
                  width: '100%',
                  height: '100%',
                  transition: 'width 800ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </motion.div>

          {/* Credit History Table */}
          <div className="mb-8">
            <label className="label-badge text-[#6B7280] block mb-4">CREDIT HISTORY</label>
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
                  {creditTransactions.map((tx, index) => (
                    <motion.tr
                      key={index}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.5 + index * 0.04,
                        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                      }}
                    >
                      <td className="text-sm text-[#0A0A0A] px-4 py-3">{tx.date}</td>
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
          </div>

          {/* Purchase Credits */}
          <div>
            <label className="label-badge text-[#6B7280] block mb-4">BUY MORE CREDITS</label>
            <button className="btn-primary opacity-50 cursor-not-allowed" disabled>
              Purchase Credits
            </button>
            <span className="ml-3 text-xs text-[#6B7280]">Coming Soon</span>
          </div>
        </div>
      </motion.section>

      {/* ========== DANGER ZONE ========== */}
      <motion.section
        className="mb-16"
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-[#FEF2F2] border border-[#DC2626]/20 rounded-xl p-6">
          <p className="label-badge text-[#DC2626] mb-3">DANGER ZONE</p>
          <h3 className="text-lg font-bold text-[#0A0A0A] mb-2">Account Actions</h3>
          <p className="text-sm text-[#4A4A4A] mb-6">
            These actions are irreversible. Please proceed with caution.
          </p>

          <button
            onClick={() => setLogoutDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#0A0A0A] text-white rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-[#1F1F1F]"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </motion.section>

      {/* ========== LOGOUT CONFIRMATION DIALOG ========== */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="max-w-[420px] bg-white rounded-2xl border border-[#E5E5E5] p-8">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4">
              <LogOut size={48} className="text-[#6B7280] mx-auto" />
            </div>
            <DialogTitle className="font-serif text-2xl text-[#0A0A0A] text-center">
              Log Out?
            </DialogTitle>
            <DialogDescription className="text-sm text-[#4A4A4A] text-center mt-2">
              Are you sure you want to log out? You will need to sign in again to access your
              blueprints.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-6 justify-center">
            <button
              onClick={() => setLogoutDialogOpen(false)}
              className="btn-ghost text-sm py-2.5 px-6"
            >
              Cancel
            </button>
            <button
              onClick={() => setLogoutDialogOpen(false)}
              className="inline-flex items-center justify-center gap-2 bg-[#0A0A0A] text-white rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-[#1F1F1F]"
            >
              <LogOut size={14} />
              Log Out
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
