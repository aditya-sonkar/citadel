import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  isLoggedIn: boolean;
  activeSection?: string;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, activeSection = 'SECURE YOUR PERIMETER' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }
  };

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* ── Top-left brand name (Desktop only) ── */}
      <button
        onClick={() => scrollToSection('hero')}
        className="hidden lg:flex fixed top-5 left-5 z-[100] items-center h-[38px] mix-blend-difference text-white cursor-pointer hover:opacity-80 transition-opacity focus:outline-none bg-transparent border-none p-0"
      >
        <span className="text-[14px] font-extrabold tracking-[0.2em] uppercase">
          CITADEL
        </span>
      </button>
      {/* ── Centered floating nav pill (Highly responsive) ── */}
      <div className="fixed top-5 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4 sm:px-6">
        <nav className="pointer-events-auto flex items-center justify-between gap-4 sm:gap-6 md:gap-10 h-12 px-4 sm:px-6 bg-[#1a1a1a]/90 backdrop-blur-md border border-white/[0.06] rounded-sm w-full max-w-[500px] lg:max-w-[420px]">

          {/* Logo + Brand name (Visible on mobile/tablet inside pill) */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none bg-transparent border-none p-0"
          >
            <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 100 100" fill="currentColor">
              <polygon points="50,10 65,25 50,40 35,25" />
              <polygon points="50,60 65,75 50,90 35,75" />
              <polygon points="25,35 40,50 25,65 10,50" />
              <polygon points="75,35 90,50 75,65 60,50" />
            </svg>
            <span className="lg:hidden text-[10px] font-extrabold tracking-[0.18em] text-white uppercase whitespace-nowrap">
              CITADEL
            </span>
          </button>

          {/* Center section label (Visible on sm and up) */}
          <div className="hidden sm:flex overflow-hidden h-4 items-center flex-1 justify-center">
            <span
              key={activeSection}
              className="animate-smooth-slide text-[9px] font-mono tracking-[0.2em] text-white/50 uppercase whitespace-nowrap"
            >
              {activeSection}
            </span>
          </div>

          {/* Mobile Theme Toggle & Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="lg:hidden flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="text-white/50 hover:text-white transition-colors focus:outline-none shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </div>

      {/* ── Top-right fixed "LAUNCH CONSOLE" & Theme Toggle (Desktop only) ── */}
      <div className="hidden lg:flex fixed top-5 right-5 z-[100] items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center h-[38px] w-[38px] bg-[#1a1a1a]/90 backdrop-blur-md border border-white/[0.06] text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <Link
          to={isLoggedIn ? '/dashboard' : '/login'}
          className="flex items-center h-[38px] px-4 bg-[#1a1a1a]/90 backdrop-blur-md border border-white/[0.06] text-[9px] font-mono tracking-[0.18em] text-white/60 uppercase hover:text-white hover:border-white/20 transition-all"
        >
          LAUNCH CONSOLE
        </Link>
      </div>

      {/* ── Fullscreen overlay menu ── */}
      <div
        className={`fixed inset-0 bg-[#0d0d0d] z-[200] flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Menu Container (centers everything horizontally to match landing container) */}
        <div className="max-w-[1400px] mx-auto w-full flex flex-col h-full px-6 lg:px-10">
          
          {/* Menu top bar */}
          <div className="flex justify-between items-center h-20 border-b border-white/[0.06] w-full">
            <span className="text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase">MENU</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/40 hover:text-white transition-colors focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu links and sidebar info */}
          <div className="flex-grow flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20 w-full py-10">
            
            {/* Main Links (Left) */}
            <nav className="flex-grow flex flex-col justify-center w-full">
              {[
                { label: 'SECURE YOUR PERIMETER', id: 'hero' },
                { label: 'WHAT WE DO',          id: 'what-we-do' },
                { label: 'USE CASES',           id: 'use-cases' },
                { label: 'KNOWLEDGE BASE',      id: 'faq' },
                { label: 'GET STARTED',        id: 'cta' },
              ].map((item, i) => (
                <div key={item.label} className="border-b border-white/[0.06] w-full">
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="group flex items-start gap-4 py-4 sm:py-5 w-full text-left cursor-pointer focus:outline-none"
                  >
                    {/* Number Index */}
                    <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-white/20 pt-2 transition-colors duration-300 group-hover:text-white/60">
                      0{i + 1}
                    </span>
                    
                    {/* Link Text */}
                    <span
                      className="font-sans font-black uppercase text-white/70 group-hover:text-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-4 tracking-[-0.04em] leading-none"
                      style={{ fontSize: 'clamp(1.2rem, 5vw, 4rem)' }}
                    >
                      {item.label}
                    </span>
                  </button>
                </div>
              ))}
              {/* Mobile Account Buttons (visible only on mobile/tablet) */}
              <div className="md:hidden flex gap-4 mt-8 w-full">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 text-center py-3.5 border border-white/10 text-[9px] font-mono tracking-widest text-white hover:bg-white hover:text-black transition-colors"
                    >
                      CONSOLE
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        localStorage.removeItem('citadel_token');
                        localStorage.removeItem('citadel_user');
                        window.location.href = '/';
                      }}
                      className="flex-1 text-center py-3.5 border border-red-500/20 text-[9px] font-mono tracking-widest text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                    >
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 text-center py-3.5 border border-white/10 text-[9px] font-mono tracking-widest text-white hover:bg-white hover:text-black transition-colors"
                    >
                      LOGIN
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 text-center py-3.5 border border-white/10 text-[9px] font-mono tracking-widest text-white hover:bg-white hover:text-black transition-colors"
                    >
                      SIGN UP
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Sidebar metadata (Right - desktop only) */}
            <div className="hidden md:flex flex-col gap-8 w-64 shrink-0 text-left self-center border-l border-white/[0.06] pl-10 h-auto py-2">
              
              {/* Account Actions */}
              <div className="flex flex-col gap-4">
                <span className="text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase">ACCOUNT</span>
                {isLoggedIn ? (
                  <div className="flex gap-3">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex-grow text-center py-2.5 border border-white/10 text-[9px] font-mono tracking-widest text-white hover:bg-white hover:text-black transition-colors"
                    >
                      CONSOLE
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        localStorage.removeItem('citadel_token');
                        localStorage.removeItem('citadel_user');
                        window.location.href = '/';
                      }}
                      className="flex-grow text-center py-2.5 border border-red-500/20 text-[9px] font-mono tracking-widest text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors cursor-pointer"
                    >
                      LOGOUT
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex-grow text-center py-2.5 border border-white/10 text-[9px] font-mono tracking-widest text-white hover:bg-white hover:text-black transition-colors"
                    >
                      LOGIN
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex-grow text-center py-2.5 border border-white/10 text-[9px] font-mono tracking-widest text-white hover:bg-white hover:text-black transition-colors"
                    >
                      SIGN UP
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Resources */}
              <div className="flex flex-col gap-4">
                <span className="text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase">RESOURCES</span>
                <div className="flex flex-col gap-2.5 text-xs text-white/50">
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-between font-sans">GITHUB ↗</a>
                  <a href="#" className="hover:text-white transition-colors flex items-center justify-between font-sans">DISCORD ↗</a>
                  <a href="#" className="hover:text-white transition-colors flex items-center justify-between font-sans">SYSTEM STATUS ↗</a>
                </div>
              </div>

              {/* Secure Handshake Stats */}
              <div className="flex flex-col gap-3">
                <span className="text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase">ACCESS STATUS</span>
                <div className="p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-sm font-mono text-[9px] tracking-wider text-white/40 leading-relaxed">
                  <div className="flex justify-between mb-1.5">
                    <span>PERIMETER:</span>
                    <span className="text-emerald-400 font-bold">SECURE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IDENTITY:</span>
                    <span className="text-white/70 font-bold">{isLoggedIn ? 'ACTIVE USER' : 'ANONYMOUS'}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Footer Info */}
          <div className="py-8 border-t border-white/[0.06] flex justify-between items-center text-[9px] font-mono tracking-[0.18em] text-white/15 uppercase w-full">
            <span>CITADEL IAM © 2026</span>
            <span className="hidden sm:inline">DEVELOPED IN INDIA</span>
          </div>

        </div>
      </div>
    </>
  );
};

export default Navbar;
