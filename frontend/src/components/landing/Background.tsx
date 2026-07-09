import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#fafafa] dark:bg-[#0A0E17] transition-colors duration-500">
      
      {/* Global Noise Overlay (using str8fire's premium repeating grain) */}
      <div 
        className="absolute inset-0 opacity-[0.25] mix-blend-overlay" 
        style={{ 
          backgroundImage: 'url("https://cdn.prod.website-files.com/6614ea976ddd1f3bb9f1e470/661633e747b261749def2fad_grain-repeat-v2.jpg")',
          backgroundRepeat: 'repeat',
        }}
      ></div>

      {/* Subtle Vertical Grid Lines (5 Columns matching modern design systems) */}
      <div className="absolute inset-0 grid grid-cols-5 max-w-[1400px] mx-auto px-6 lg:px-10 border-l border-r border-white/[0.02]">
        <div className="border-r border-white/[0.02] h-full"></div>
        <div className="border-r border-white/[0.02] h-full"></div>
        <div className="border-r border-white/[0.02] h-full"></div>
        <div className="border-r border-white/[0.02] h-full"></div>
        <div className="h-full"></div>
      </div>

    </div>
  );
};

export default Background;
