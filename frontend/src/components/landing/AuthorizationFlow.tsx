import React from 'react';

const AuthorizationFlow: React.FC = () => {
  return (
    <section id="engine" className="w-full bg-zinc-50 dark:bg-black py-24 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
            How Authorization Works
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Every request follows the exact same evaluation model to reach a deterministic decision.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 font-mono text-[11px] sm:text-[13px]">
          
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 z-0"></div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center group">
            <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-[#0a0a0a] border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-4 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <div className="text-center font-bold text-zinc-900 dark:text-white">Authenticate</div>
          </div>

          <div className="md:hidden h-6 w-[2px] bg-zinc-200 dark:bg-zinc-800"></div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center group">
            <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-[#0a0a0a] border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-4 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="text-center font-bold text-zinc-900 dark:text-white whitespace-nowrap">Collect Policies</div>
          </div>

          <div className="md:hidden h-6 w-[2px] bg-zinc-200 dark:bg-zinc-800"></div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center group">
            <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-[#0a0a0a] border-2 border-red-300 dark:border-red-900 flex items-center justify-center text-red-500 dark:text-red-500 mb-4 group-hover:border-red-500 transition-colors shadow-sm shadow-red-500/10">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="text-center font-bold text-red-600 dark:text-red-400 whitespace-nowrap">Check Explicit Deny</div>
          </div>

          <div className="md:hidden h-6 w-[2px] bg-zinc-200 dark:bg-zinc-800"></div>

          {/* Step 4 */}
          <div className="relative z-10 flex flex-col items-center group">
            <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-[#0a0a0a] border-2 border-orange-300 dark:border-orange-900 flex items-center justify-center text-orange-500 dark:text-orange-500 mb-4 group-hover:border-orange-500 transition-colors shadow-sm shadow-orange-500/10">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </div>
            <div className="text-center font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">Apply Boundary</div>
          </div>

          <div className="md:hidden h-6 w-[2px] bg-zinc-200 dark:bg-zinc-800"></div>

          {/* Step 5 */}
          <div className="relative z-10 flex flex-col items-center group">
            <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-emerald-600 dark:bg-emerald-600 border-2 border-emerald-600 flex items-center justify-center text-white mb-4 shadow-md shadow-emerald-500/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="text-center font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Return Decision</div>
          </div>

          <div className="md:hidden h-6 w-[2px] bg-zinc-200 dark:bg-zinc-800"></div>

          {/* Step 6 */}
          <div className="relative z-10 flex flex-col items-center group">
            <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-[#0a0a0a] border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-4 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="text-center font-bold text-zinc-900 dark:text-white whitespace-nowrap">Record Audit Log</div>
          </div>

        </div>

        <div className="mt-16 flex justify-center">
          <a href="#architecture" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            Learn about the evaluation engine
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default AuthorizationFlow;
