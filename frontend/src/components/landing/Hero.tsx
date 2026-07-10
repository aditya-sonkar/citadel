import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const tickerText = "POLICY ENGINE • RBAC • AUDIT LOGGING • PERMISSION BOUNDARIES • USER MANAGEMENT • GROUP MANAGEMENT • POLICY SIMULATOR • ";

  return (
    <section className="w-full relative flex flex-col justify-center text-black dark:text-white min-h-[90vh] lg:min-h-screen pb-8 pt-24 px-6 lg:px-10 overflow-hidden bg-transparent">


      <div className="relative z-10 w-full flex flex-col h-full justify-center">
        {/* Main Content Row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between w-full mb-10 mt-12 lg:mt-16">

          <div className="flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-6 lg:mb-8"
            >
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-black/60 dark:text-white/60">
                CITADEL IAM CONSOLE
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-extrabold uppercase tracking-[-0.03em] leading-[0.9] text-black dark:text-white"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5.5rem)' }}
            >
              SECURE IDENTITY<br />
              AND ACCESS<br />
              MANAGEMENT<br />
              BUILT FOR MODERN<br />
              ENTERPRISES.
            </motion.h1>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex w-full sm:w-auto gap-2 sm:gap-4 mt-8"
            >
              <Link
                to="/login"
                className="group flex items-center justify-center flex-1 gap-1 sm:gap-2 px-2 sm:px-6 py-3.5 border border-black/20 dark:border-white/[0.15] text-[8px] sm:text-[10px] font-mono tracking-[0.1em] sm:tracking-[0.18em] text-black dark:text-white uppercase hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black transition-all text-center"
              >
                LAUNCH CONSOLE <span className="hidden sm:inline">↗</span>
              </Link>
              <a
                href="#faq"
                className="group flex items-center justify-center flex-1 gap-1 sm:gap-2 px-2 sm:px-6 py-3.5 border border-black/20 dark:border-white/[0.15] text-[8px] sm:text-[10px] font-mono tracking-[0.1em] sm:tracking-[0.18em] text-black dark:text-white uppercase hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black transition-all text-center"
              >
                EXPLORE FEATURES <span className="hidden sm:inline">↗</span>
              </a>
            </motion.div>
          </div>

          {/* Right side floating card - Lama Lama "THIS IS US" style */}
          <div className="flex flex-col gap-4 w-full lg:w-[540px] mt-12 lg:mt-0 shrink-0 z-20" style={{ perspective: 1000 }}>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              whileHover={{ rotateX: 5, rotateY: -5, scale: 1.02 }}
              className="bg-white/80 dark:bg-[#1a1a1a]/40 backdrop-blur-md p-4 rounded-sm border border-black dark:border-white/[0.05] group cursor-pointer transition-transform duration-300"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex justify-between items-center mb-4" style={{ transform: 'translateZ(20px)' }}>
                <span className="text-[9px] font-mono tracking-widest uppercase text-black/50 dark:text-white/50 group-hover:text-black dark:group-hover:text-white transition-colors">PLATFORM CORE</span>
                <span className="text-[9px] font-mono tracking-widest uppercase text-black/30 dark:text-white/30">( - )</span>
              </div>
              <div className="w-full h-[280px] rounded-sm border border-black dark:border-white/[0.02] flex items-end p-4 relative overflow-hidden" style={{ transform: 'translateZ(30px)' }}>
                {/* Background Video */}
                <video
                  src="/IAM_hero.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
                />
                <span className="relative z-10 text-[10px] font-mono uppercase tracking-[0.2em] text-white/90 drop-shadow-md">SYSTEM ONLINE</span>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Slow-moving Enterprise Ticker (Full Width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full overflow-hidden border-t border-b border-black/10 dark:border-white/[0.08] py-4.5 mt-10 bg-black/[0.01] dark:bg-white/[0.01]"
        >
          <div className="relative w-full flex overflow-x-hidden">
            <div
              className="animate-marquee whitespace-nowrap flex text-[11px] font-mono tracking-[0.22em] text-black/70 dark:text-white/60 uppercase"
              style={{ animationDuration: '70s' }}
            >
              <span className="pr-4">
                {tickerText}{tickerText}{tickerText}
              </span>
              <span>
                {tickerText}{tickerText}{tickerText}
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
