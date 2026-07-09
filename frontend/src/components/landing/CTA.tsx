import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CTA: React.FC = () => {
  return (
    <section className="w-full px-6 lg:px-10 pt-16 pb-32 md:pt-20 md:pb-44">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">

        {/* Left: Image land1.png */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative rounded-sm overflow-hidden border border-black/10 dark:border-white/10"
        >
          <img
            src="/land1.png"
            alt="Citadel Architecture"
            className="w-full h-auto object-cover opacity-90 dark:opacity-80"
          />
        </motion.div>

        {/* Right: Headline + Description + Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-12"
        >
          {/* Headline */}
          <h2
            className="font-extrabold uppercase tracking-[-0.04em] leading-[0.9] text-black dark:text-white"
            style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
          >
            SHIELD<br />
            YOUR CORE.
          </h2>

          {/* Label + Description + Buttons */}
          <div className="flex flex-col gap-8">
            <span className="text-[10px] font-mono tracking-[0.2em] text-black/50 dark:text-white/30 uppercase">
              GET STARTED
            </span>

            <p className="text-black/70 dark:text-white/60 text-lg md:text-xl font-sans leading-relaxed max-w-lg">
              Feel free to explore the console and deploy your first auth layer.
              We'll make it bulletproof.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group flex items-center gap-2 px-6 py-3.5 border border-black/20 dark:border-white/[0.15] text-[10px] font-mono tracking-[0.18em] text-black/80 dark:text-white/70 uppercase hover:text-black dark:hover:text-white hover:border-black/50 dark:hover:border-white/40 transition-all"
              >
                LAUNCH CONSOLE
                <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </Link>
              <a
                href="#faq"
                className="group flex items-center gap-2 px-6 py-3.5 border border-black/20 dark:border-white/[0.15] text-[10px] font-mono tracking-[0.18em] text-black/80 dark:text-white/70 uppercase hover:text-black dark:hover:text-white hover:border-black/50 dark:hover:border-white/40 transition-all"
              >
                EXPLORE FEATURES
                <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default CTA;
