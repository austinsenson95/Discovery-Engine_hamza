import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const contentMargin = sidebarCollapsed
    ? 'lg:ml-[72px]'
    : 'lg:ml-[260px]';

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      <div className={`flex-1 flex flex-col ml-0 ${contentMargin} transition-all duration-300 ease-out`}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
