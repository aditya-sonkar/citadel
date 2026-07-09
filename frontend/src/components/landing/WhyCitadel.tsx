import React from 'react';
import { motion } from 'framer-motion';

const WhyCitadel: React.FC = () => {
  return (
    <section className="w-full relative min-h-[90vh] bg-transparent flex items-center justify-center px-6 lg:px-10 py-32 lg:py-24 overflow-hidden">
      <div className="relative z-10 w-full flex flex-col lg:flex-row justify-between h-full">
        
        {/* Left Side: Headline, Buttons, Text */}
        <div className="flex flex-col justify-between max-w-xl lg:max-w-3xl h-full">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="font-extrabold uppercase tracking-[-0.03em] leading-[0.9] text-black dark:text-white"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5.5rem)' }}
            >
              WHAT WE DO.
            </motion.h2>
          </div>

          <div className="mt-16 lg:mt-72">
            <div className="flex flex-wrap gap-4 mb-8">
              {['AUTHENTICATION ↗', 'AUTHORIZATION ↗', 'COMPLIANCE ↗'].map((tag, idx) => (
                <div key={idx} className="px-3 py-1.5 border border-black/20 dark:border-white/20 text-[9px] font-mono tracking-[0.2em] text-black/70 dark:text-white/60 hover:border-black/40 dark:hover:border-white/40 cursor-pointer transition-colors">
                  {tag}
                </div>
              ))}
            </div>

            <p className="text-black/80 dark:text-white/80 text-[18px] md:text-[22px] leading-[1.3] font-medium font-sans max-w-xl">
              We provide a unified identity platform built to secure your modern enterprise. Citadel takes the complexity out of access management, allowing your teams to seamlessly deploy bulletproof authentication, dynamic policies, and absolute zero-trust security without slowing down your builders.
            </p>
          </div>
        </div>

        {/* Right Side: Stacked Cards */}
        <div className="flex flex-col gap-2 mt-20 lg:mt-0 w-full lg:w-[340px] shrink-0 self-start">
          {/* Card 1: Contact */}
          <div className="bg-[#ebebeb] dark:bg-[#121212] p-4 flex items-center justify-between cursor-pointer hover:bg-[#e0e0e0] dark:hover:bg-[#1a1a1a] transition-colors group border border-black dark:border-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 rounded-sm bg-black dark:bg-white/10 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 dark:bg-white/10 mix-blend-overlay z-10"></div>
                <img src="https://i.pravatar.cc/100?img=11" alt="avatar" className="w-full h-full object-cover grayscale opacity-90" />
              </div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white uppercase">GET IN TOUCH</span>
            </div>
          </div>

          {/* Card 2: Capabilities (Collapsed) */}
          <div className="bg-[#ebebeb] dark:bg-[#121212] p-5 flex items-center justify-between cursor-pointer hover:bg-[#e0e0e0] dark:hover:bg-[#1a1a1a] transition-colors group border border-black dark:border-white/[0.02]">
            <span className="text-[10px] font-mono tracking-[0.2em] text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white uppercase">THIS IS US</span>
            <span className="text-[10px] font-mono text-black/50 dark:text-white/30">( + )</span>
          </div>

          {/* Card 3: Architecture (Expanded) */}
          <div className="bg-[#ebebeb] dark:bg-[#121212] p-4 flex flex-col gap-4 border border-black dark:border-white/[0.02]">
            <div className="flex items-center justify-between cursor-pointer px-1 pt-1">
              <span className="text-[10px] font-mono tracking-[0.2em] text-black/80 dark:text-white/80 uppercase">PITCHDECK</span>
              <span className="text-[10px] font-mono text-black/50 dark:text-white/30">( - )</span>
            </div>
            {/* Inner visual block mimicking the screenshot */}
            <div className="w-full bg-[#f4f4f4] dark:bg-[#dfdcd6] p-5 h-[180px] flex flex-col justify-between shadow-inner">
              <span className="font-extrabold text-[20px] leading-[0.9] text-[#1c1c1c] max-w-[12ch] uppercase tracking-[-0.04em]">
                SMALL TEAM. BIG ENERGY. NO FLUFF.
              </span>
              <div className="flex justify-between items-end">
                <span className="text-[6px] font-mono text-black/40 uppercase tracking-widest w-1/2 leading-relaxed">
                  We are Citadel. A robust identity provider.
                </span>
                <div className="flex gap-1">
                  <div className="w-6 h-9 bg-[#231a31] border border-black/10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-purple-900/40 mix-blend-overlay"></div>
                  </div>
                  <div className="w-6 h-9 bg-[#352516] border border-black/10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-orange-900/40 mix-blend-overlay"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default WhyCitadel;
