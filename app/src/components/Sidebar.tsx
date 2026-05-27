import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  Route,
  User,
  LogOut,
  X,
} from 'lucide-react';

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
      { to: '/journey', icon: Route, label: 'Journey' },
      { to: '/profile', icon: User, label: 'Profile' },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="flex-shrink-0">
          <rect x="2" y="2" width="24" height="24" rx="4" fill="#F97316" />
          <path d="M8 14L12 10L16 14L12 18L8 14Z" fill="white" opacity="0.9" />
          <path d="M12 14L16 10L20 14L16 18L12 14Z" fill="white" opacity="0.6" />
        </svg>
        <div>
          <span className="font-serif text-base tracking-tight text-white" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>
            DISCOVERY ENGINE
          </span>
          <p className="text-[10px] text-gray-500 -mt-0.5">Build your blueprint</p>
        </div>
      </div>

      {/* Close button on mobile */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navSections.map(section => (
          <div key={section.label}>
            <p className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.1em] mb-2">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(item => {
                const isActive =
                  item.to === '/'
                    ? location.pathname === '/' || location.pathname === '/dashboard'
                    : location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose()}
                    className={`flex items-center gap-3 px-3 h-11 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-orange-500/15 text-orange-400 border-l-[3px] border-orange-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Card */}
      <div className="px-3 pb-4">
        <div className="bg-white/[0.04] rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">John Doe</p>
              <p className="text-xs text-gray-400 truncate">john.doe@example.com</p>
            </div>
            <button className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
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
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0A0A0A] z-50 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-[260px] bg-[#0A0A0A] border-r border-white/[0.06] z-30">
        {sidebarContent}
      </aside>
    </>
  );
}
