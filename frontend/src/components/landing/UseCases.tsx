import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const scenarios = [
  {
    q: 'Apply fine-grained permissions and scale with attribute-based access control (ABAC)',
    desc: 'Create granular permissions based on user and resource attributes—such as department, job role, and environment name—using Citadel\'s attribute-based policy matching.',
    code: {
      Effect: "Allow",
      Action: "db:WriteRecord",
      Resource: "arn:citadel:prod:db/users/*",
      Condition: { StringEquals: { "user:Department": "Engineering" } }
    }
  },
  {
    q: 'Manage tenant access and scale securely across client organizations',
    desc: 'Establish multi-account structures and securely partition workspace environments, assigning dedicated developer access boundaries across multiple external client organizations.',
    code: {
      Effect: "Allow",
      Action: "tenant:ManageAssets",
      Resource: "arn:citadel:org:org_a3f9/assets/*"
    }
  },
  {
    q: 'Establish organization-wide preventative guardrails and least privilege',
    desc: 'Scale permissions management safely. Enforce preventative service control policies and global permission boundaries to ensure developers only interact with authorized APIs.',
    code: {
      Effect: "Deny",
      Action: "console:*",
      Resource: "*",
      Condition: { Bool: { "aws:MultiFactorAuthPresent": "false" } }
    }
  },
  {
    q: 'Intelligent session tracking and real-time audit logging',
    desc: 'Keep complete visibility over active sessions. Securely log every single token handshake, policy evaluation result, and administrative change to satisfy compliance audits.',
    code: {
      Effect: "Allow",
      Action: "audit:ReadLogs",
      Resource: "arn:citadel:compliance:logs/soc2"
    }
  }
];

const UseCases: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="w-full relative px-6 lg:px-10 py-32 max-w-[1400px] mx-auto border-t border-black/[0.06] dark:border-white/[0.06]">
      
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
        
        {/* Left Side: Sticky Header */}
        <div className="lg:w-1/3 flex flex-col lg:sticky lg:top-32 h-fit">
          <span className="text-[10px] font-mono tracking-[0.2em] text-black/50 dark:text-white/40 uppercase mb-4 block">
            USE CASES
          </span>
          <h3 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-black dark:text-white leading-[1] mb-6">
            Architectural <br className="hidden lg:block" /> Scenarios
          </h3>
          <p className="text-black/60 dark:text-white/60 text-lg">
            Deploy Citadel access boundaries to isolate, govern, and audit developer operations at scale.
          </p>
        </div>

        {/* Right Side: Accordion */}
        <div className="lg:w-2/3 flex flex-col border-t border-black/10 dark:border-white/10">
          {scenarios.map((scene, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="border-b border-black/10 dark:border-white/10">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full py-8 flex items-center justify-between group text-left focus:outline-none"
                >
                  <span className={`text-xl md:text-2xl font-bold tracking-tight transition-colors duration-300 ${isOpen ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/50 group-hover:text-black dark:group-hover:text-white'}`}>
                    {scene.q}
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
                      <div className="pb-8 flex flex-col gap-6">
                        <p className="text-[16px] md:text-[18px] text-black/60 dark:text-white/60 font-medium leading-relaxed max-w-2xl font-sans">
                          {scene.desc}
                        </p>
                        
                        {/* Compact JSON code display */}
                        <div className="p-4 rounded bg-[#07090e] border border-white/5 text-[11px] font-mono text-[#a8b1c2] leading-normal max-w-xl overflow-x-auto">
                          <pre>{JSON.stringify(scene.code, null, 2)}</pre>
                        </div>
                      </div>
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

export default UseCases;
