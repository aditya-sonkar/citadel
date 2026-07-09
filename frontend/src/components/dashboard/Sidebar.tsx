import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeProvider';

export type IAMTab = 'dashboard' | 'resource-access' | 'users' | 'groups' | 'policies' | 'boundaries' | 'simulator' | 'audit' | 'settings' | 'user-details' | 'providers' | 'credentials' | 'create-user' | 'group-details';

interface SidebarProps {
  activeTab: IAMTab;
  setActiveTab: (tab: IAMTab) => void;
  isAdmin: boolean;
  isRoot: boolean;
  userEmail: string;
  onLogout: () => void;
  isMobileOpen: boolean;
  onClose: () => void;
}

const sectionTabs: Record<string, IAMTab[]> = {
  'Identities': ['users', 'groups', 'user-details', 'group-details', 'create-user'],
  'Access Control': ['policies', 'simulator'],
  'Observability': ['audit', 'credentials'],
  'Settings': ['settings']
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isAdmin, isRoot, userEmail, onLogout, isMobileOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();

  // Ref for the container holding all nav items so we can measure positions
  const navContainerRef = useRef<HTMLDivElement>(null);

  // State for the floating pill's geometry
  const [pillStyle, setPillStyle] = useState({ top: 0, height: 0, opacity: 0 });

  // State for collapsible sections, synced with localStorage
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('citadel_sidebar_sections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      'Identities': false,
      'Access Control': false,
      'Observability': false,
      'Settings': false,
    };
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const updated = { ...prev, [title]: !prev[title] };
      localStorage.setItem('citadel_sidebar_sections', JSON.stringify(updated));
      return updated;
    });
  };

  const prevActiveTab = useRef<IAMTab | null>(null);

  // Auto-expand section containing the activeTab if it is collapsed (only on mount or when the tab actually changes)
  useEffect(() => {
    if (prevActiveTab.current !== activeTab) {
      const activeSection = Object.entries(sectionTabs).find(([_, tabs]) => tabs.includes(activeTab));
      if (activeSection) {
        const sectionName = activeSection[0];
        if (!expandedSections[sectionName]) {
          setExpandedSections(prev => {
            const updated = { ...prev, [sectionName]: true };
            localStorage.setItem('citadel_sidebar_sections', JSON.stringify(updated));
            return updated;
          });
        }
      }
      prevActiveTab.current = activeTab;
    }
  }, [activeTab]);

  // Update pill position when activeTab or expandedSections changes
  useEffect(() => {
    const updatePill = () => {
      if (!navContainerRef.current) return;

      // Find if the section containing the active tab is expanded
      const activeSection = Object.entries(sectionTabs).find(([_, tabs]) => tabs.includes(activeTab));
      const isSectionExpanded = activeSection ? (expandedSections[activeSection[0]] ?? true) : true;

      const activeEl = navContainerRef.current.querySelector('[data-active="true"]') as HTMLElement;
      
      if (isSectionExpanded && activeEl && activeEl.offsetHeight > 0) {
        setPillStyle({
          top: activeEl.offsetTop,
          height: activeEl.offsetHeight,
          opacity: 1
        });
      } else {
        setPillStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    // Run immediately
    updatePill();
    
    // Run again after transition duration to capture final layout position
    const timer = setTimeout(updatePill, 210);

    window.addEventListener('resize', updatePill);
    return () => {
      window.removeEventListener('resize', updatePill);
      clearTimeout(timer);
    };
  }, [activeTab, expandedSections]);

  const NavItem = ({ tab, label }: { tab: IAMTab; label: string }) => {
    // Only highlight if activeTab exactly matches, EXCEPT user-details/create-user which highlight 'users' and group-details which highlights 'groups'
    const isActive = activeTab === tab || ((activeTab === 'user-details' || activeTab === 'create-user') && tab === 'users') || (activeTab === 'group-details' && tab === 'groups');

    return (
      <button
        data-active={isActive}
        onClick={() => setActiveTab(tab)}
        className={`relative z-10 w-full flex items-center gap-3 pl-[22px] pr-2 py-2 text-[13px] font-medium rounded-md transition-colors duration-200 text-left ${isActive
            ? 'text-zinc-900 dark:text-white'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
      >
        {label}
      </button>
    );
  };

  const NavSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const isExpanded = expandedSections[title] ?? true;

    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => toggleSection(title)}
          className="flex items-center gap-1 w-full text-[13px] font-bold text-zinc-900 dark:text-zinc-100 mb-1 pl-[6px] pr-2 mt-4 first:mt-0 text-left hover:text-zinc-950 dark:hover:text-white transition-colors group cursor-pointer select-none"
        >
          <svg 
            viewBox="0 0 24 24" 
            className={`w-3 h-3 fill-current text-zinc-900 dark:text-zinc-100 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>{title}</span>
        </button>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key={title}
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1 pb-1">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-[240px] border-r flex flex-col justify-between shrink-0 transition-all duration-300 bg-zinc-50 dark:bg-[#050505] border-zinc-200 dark:border-zinc-800 md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0 ml-0' : '-translate-x-full md:-ml-[240px]'}`}>

      {/* Top Section */}
      <div className="flex flex-col flex-1 overflow-y-auto">

        {/* Brand / Logo & Close Button */}
        <div className="h-[60px] flex shrink-0 items-center justify-between pl-[14px] pr-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link to="/" className="flex items-center gap-2 font-medium text-[15px] text-zinc-900 dark:text-zinc-100 select-none">
            <svg className="w-4 h-4 text-zinc-900 dark:text-white shrink-0" viewBox="0 0 100 100" fill="currentColor">
              <polygon points="50,10 65,25 50,40 35,25" />
              <polygon points="50,60 65,75 50,90 35,75" />
              <polygon points="25,35 40,50 25,65 10,50" />
              <polygon points="75,35 90,50 75,65 60,50" />
            </svg>
            <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase pt-0.5">CITADEL</span>
          </Link>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="Close sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="relative flex flex-col gap-2 px-2 py-4" ref={navContainerRef}>

          {/* Floating Pill Background */}
          <div
            className="absolute left-2 right-2 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-md transition-all duration-200 ease-in-out pointer-events-none"
            style={{
              top: `${pillStyle.top}px`,
              height: `${pillStyle.height}px`,
              opacity: pillStyle.opacity
            }}
          />

          <div className="flex flex-col gap-1 mb-2">
            <NavItem tab="dashboard" label="IAM Console" />
            <NavItem tab="resource-access" label="Resource Access" />
          </div>

          <NavSection title="Identities">
            <NavItem tab="users" label="Users" />
            <NavItem tab="groups" label="Groups" />

          </NavSection>

          <NavSection title="Access Control">
            <NavItem tab="policies" label="Policies" />
            <NavItem tab="simulator" label="Policy Simulator" />
          </NavSection>

          <NavSection title="Observability">
            <NavItem tab="audit" label="Audit Logs" />
            <NavItem tab="credentials" label="Credential report" />
          </NavSection>

          <NavSection title="Settings">
            <NavItem tab="settings" label="Account Settings" />
          </NavSection>

        </div>
      </div>

      {/* Bottom Section: User Profile */}
      <div className="p-5 border-t shrink-0 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] flex flex-col gap-4">
        
        {/* User Identity Details */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-zinc-400 dark:text-zinc-500">Active Session</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 truncate pr-2">{userEmail}</span>
            <span className="text-[10px] font-semibold uppercase bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              {isRoot ? 'Root' : 'User'}
            </span>
          </div>
        </div>

        {/* Sign Out Action Button */}
        <button
          onClick={onLogout}
          className="w-full text-center py-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          Sign Out
        </button>

      </div>

    </aside>
    </>
  );
};

export default Sidebar;
