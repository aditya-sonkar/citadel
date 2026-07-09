import React from 'react';
import { useTheme } from './ThemeProvider';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`px-3 py-1.5 rounded text-[11px] font-bold border transition-all ${
        theme === 'dark'
          ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-850'
          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
      }`}
    >
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
};

export default ThemeToggle;
