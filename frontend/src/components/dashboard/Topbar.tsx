import React from 'react';
import type { IAMTab } from './Sidebar';
import { useTheme } from '../ThemeProvider';

interface TopbarProps {
  activeTab: IAMTab;
  userEmail?: string;
  userName?: string;
  isRoot?: boolean;
  onLogout?: () => void;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ activeTab, userEmail, userName, isRoot, onLogout, onMenuClick, isSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();

  // Simple breadcrumb formatter
  const tabName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  const breadcrumbs = ['Citadel IAM', tabName];

  return (
    <header className="h-[60px] flex items-center justify-between px-6 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 shrink-0 z-10 transition-colors duration-300">
      
      {/* Left: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-zinc-500 dark:text-zinc-400 select-none">
        {!isSidebarOpen && (
          <button 
            onClick={onMenuClick}
            className="flex items-center justify-center w-8 h-8 -ml-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        )}
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            <span className={idx === breadcrumbs.length - 1 ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : ''}>
              {crumb}
            </span>
            {idx < breadcrumbs.length - 1 && (
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Right: Actions / Mock Search */}
      <div className="flex items-center gap-4">
        {/* Mock Global Search */}
        <div className="relative hidden md:block">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="w-[200px] h-[32px] pl-9 pr-3 text-[12px] bg-zinc-100 dark:bg-zinc-900 border-none rounded-md text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 transition-shadow"
          />
        </div>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/40 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 select-none">
            {/* User Profile Icon */}
            <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">{userName || userEmail}</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.0" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
            ) : (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.0" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>

          {/* Notifications */}
          <button className="w-[32px] h-[32px] flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.0" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
        </div>
      </div>

    </header>
  );
};

export default Topbar;
