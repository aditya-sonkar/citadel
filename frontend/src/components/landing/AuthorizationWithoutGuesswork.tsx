import React from 'react';

const AuthorizationWithoutGuesswork: React.FC = () => {
  return (
    <section className="w-full bg-white dark:bg-[#050505] py-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Authorization Without Guesswork
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Citadel provides a deterministic authorization engine that strictly enforces enterprise security policies. By explicitly calculating the intersection of identity policies, group inheritance, and permission boundaries, the engine guarantees that no user can bypass their delegated access constraints.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="text-zinc-700 dark:text-zinc-300">Evaluate policies attached directly to the user identity.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="text-zinc-700 dark:text-zinc-300">Inherit permissions from multiple group memberships.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="text-zinc-700 dark:text-zinc-300">Apply an absolute ceiling using Permission Boundaries.</span>
              </li>
            </ul>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm flex flex-col items-center gap-2 font-mono text-[13px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent pointer-events-none"></div>
              
              <div className="w-full max-w-[280px] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded-md p-3 text-center text-zinc-900 dark:text-white shadow-sm z-10 relative">
                Identity Policies
              </div>
              <div className="h-6 w-[2px] bg-zinc-300 dark:bg-zinc-700"></div>
              
              <div className="w-full max-w-[280px] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded-md p-3 text-center text-zinc-900 dark:text-white shadow-sm z-10 relative">
                Group Policies
              </div>
              <div className="h-6 w-[2px] bg-zinc-300 dark:bg-zinc-700"></div>
              
              <div className="w-full max-w-[280px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md p-3 text-center text-red-700 dark:text-red-400 font-bold shadow-sm z-10 relative">
                Check Explicit Deny
              </div>
              <div className="h-6 w-[2px] bg-zinc-300 dark:bg-zinc-700"></div>

              <div className="w-full max-w-[280px] bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-md p-3 text-center text-orange-700 dark:text-orange-400 font-bold shadow-sm z-10 relative">
                Apply Permission Boundary
              </div>
              <div className="h-6 w-[2px] bg-zinc-300 dark:bg-zinc-700"></div>
              
              <div className="w-full max-w-[280px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-md p-3 text-center text-emerald-700 dark:text-emerald-400 font-bold shadow-sm z-10 relative">
                Final Decision: ALLOW or DENY
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AuthorizationWithoutGuesswork;
