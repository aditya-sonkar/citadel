import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  { 
    q: "What makes Citadel's policy engine different?", 
    a: "Citadel uses a native, AWS-style JSON policy evaluator. Instead of hardcoding basic roles, you write declarative policies with Effect, Action, and Resource fields—giving you fine-grained zero-trust authorization out of the box." 
  },
  { 
    q: "How does Citadel evaluate my effective permissions?", 
    a: "It resolves permissions in real-time. Citadel aggregates your individual policies, group policies, and permission boundaries. Explicit Deny statements always override everything, followed by explicit Allows. If neither is found, access is implicitly denied." 
  },
  { 
    q: "Can I test my JSON policies before deploying them?", 
    a: "Yes! Citadel includes an in-memory Policy Simulator. You can mock any request (user, action, and target resource) to see instantly if it will be Allowed or Denied and find the exact statement responsible." 
  },
  { 
    q: "What happens if I attach a wildcard Deny (*) policy to my admin user?", 
    a: "You will immediately lock yourself out of the dashboard, the logs, the settings, and even the logout button. It's the security equivalent of concrete boots. Please don't try this in production!" 
  },
];

const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="w-full relative px-6 lg:px-10 py-32 max-w-[1400px] mx-auto">
      
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
        
        {/* Left Side: Sticky Header */}
        <div className="lg:w-1/3 flex flex-col lg:sticky lg:top-32 h-fit">
          <h2 className="text-[10px] font-mono tracking-[0.2em] text-black/50 dark:text-white/50 uppercase mb-4">KNOWLEDGE BASE</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-black dark:text-white leading-[1] mb-6">
            Frequently <br className="hidden lg:block" /> Asked <br className="hidden lg:block" /> Questions
          </h3>
          <p className="text-black/60 dark:text-white/60 text-lg">
            Everything you need to know about integrating and scaling with Citadel's identity engine.
          </p>
        </div>

        {/* Right Side: Accordion */}
        <div className="lg:w-2/3 flex flex-col border-t border-black/10 dark:border-white/10">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="border-b border-black/10 dark:border-white/10">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full py-8 flex items-center justify-between group text-left focus:outline-none"
                >
                  <span className={`text-xl md:text-2xl font-bold tracking-tight transition-colors duration-300 ${isOpen ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white'}`}>
                    {faq.q}
                  </span>
                  
                  <span className={`text-3xl font-light transition-transform duration-300 text-black/50 dark:text-white/50 group-hover:text-black dark:group-hover:text-white shrink-0 ml-6 ${isOpen ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-8 text-[16px] md:text-[18px] text-black/60 dark:text-white/60 font-medium leading-relaxed max-w-2xl">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQ;
