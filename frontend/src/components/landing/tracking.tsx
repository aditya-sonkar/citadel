import React from 'react';

interface TrackingProps {
  activeSection: number;
}

const Tracking: React.FC<TrackingProps> = ({ activeSection: _activeSection }) => {
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden lg:flex items-center gap-1.5 overflow-hidden rounded-full border border-zinc-400 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md px-2.5 py-1.5 shadow-sm font-mono text-[10px] font-bold select-none text-zinc-700 dark:text-zinc-300 pointer-events-auto">
      <button 
        onClick={() => handleScrollTo('engine')}
        className="p-1 hover:text-black transition-colors"
        title="Scroll to Top"
      >
        ▲
      </button>
      <span className="px-1.5 border-r border-l border-zinc-400/40 uppercase tracking-wider">JUMP SECTIONS</span>
      <button 
        onClick={() => handleScrollTo('capabilities')}
        className="p-1 hover:text-black transition-colors"
        title="Scroll to Bottom"
      >
        ▼
      </button>
    </div>
  );
};

export default Tracking;
