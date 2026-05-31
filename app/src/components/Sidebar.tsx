import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  Route,
  User,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Coins,
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';

const CALL_BOOKING_URL =
  import.meta.env.VITE_CALL_BOOKING_URL ||
  'https://hamzaccoaching.com/1hfbpvsl';

const navSections = [
  {
    label: 'PROGRAM',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/blueprint', icon: Compass, label: 'Blueprint' },
    ],
  },
  {
    label: 'MY STUFF',
    items: [
      { to: '/journey', icon: Route, label: 'My Journey' },
      { to: '/credits', icon: Coins, label: 'Credits' },
      { to: '/profile', icon: User, label: 'Profile' },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();
  const { user, isLoading } = useUser();

  const handleBookCall = () => {
    console.log('[Sidebar] Call booking clicked');
    window.open(CALL_BOOKING_URL, '_blank', 'noopener,noreferrer');
  };

  const mobileWidth = 'w-[280px]';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-4 h-16 flex-shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          {!isCollapsed && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <img
                src="/logo-hamza.png"
                alt="Discovery Engine"
                className="h-8 w-auto flex-shrink-0"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isCollapsed ? (
              <motion.div
                key="chevron-right"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div
                key="chevron-left"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Close button on mobile */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto overflow-x-hidden">
        {navSections.map((section) => (
          <div key={section.label}>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.1em] mb-2 overflow-hidden"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.to === '/'
                    ? location.pathname === '/' ||
                      location.pathname === '/dashboard'
                    : location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose()}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${
                      isCollapsed
                        ? 'justify-center px-2 h-11'
                        : 'gap-3 px-3 h-11'
                    } ${
                      isActive
                        ? 'bg-orange-500/15 text-orange-400 border-l-[3px] border-orange-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Book a Call card */}
      <div className="px-3 pb-3">
        <AnimatePresence mode="wait" initial={false}>
          {isCollapsed ? (
            <motion.button
              key="book-call-collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={handleBookCall}
              title="Book Your Free Call"
              className="w-full flex items-center justify-center h-11 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-105 transition-all duration-200"
            >
              <Calendar className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.div
              key="book-call-expanded"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 rounded-xl p-4 shadow-lg shadow-orange-500/10"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">
                    Book Your Free Call
                  </p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Get clarity on your coaching business in 20 minutes.
                  </p>
                </div>
              </div>
              <button
                onClick={handleBookCall}
                className="mt-3 w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white text-sm font-semibold py-2 rounded-full shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200"
              >
                Book Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Card */}
      <div className="px-3 pb-4">
        <div className="bg-white/[0.04] rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-sm font-semibold text-white truncate">
                    {isLoading ? 'Loading...' : user?.name || 'Guest'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {isLoading ? '' : user?.email || ''}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.button
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors overflow-hidden"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`fixed top-0 left-0 bottom-0 ${mobileWidth} bg-[#0A0A0A] z-50 lg:hidden`}
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`hidden lg:block fixed top-0 left-0 bottom-0 bg-[#0A0A0A] border-r border-white/[0.06] z-30 overflow-hidden`}
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
