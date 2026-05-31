import { useLocation } from 'react-router-dom';
import { Menu, Zap, Globe, Bell } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/blueprint': 'Coach Blueprint',
  '/journey': 'My Journey',
  '/profile': 'Profile',
};

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';
  const { credits, isLoading } = useUser();

  return (
    <header className="sticky top-0 z-20 h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-8">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Credit badge */}
        <div className="hidden sm:flex items-center gap-2 bg-orange-500/[0.12] border border-orange-500/20 rounded-full px-4 py-1.5">
          <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="text-sm font-semibold text-orange-500 font-mono">
            {isLoading ? '...' : `${credits} credits`}
          </span>
        </div>

        {/* Globe icon */}
        <button className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
          <Globe className="w-5 h-5" />
        </button>

        {/* Bell icon */}
        <button className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>
    </header>
  );
}
