import React from 'react';

const ProductShowcase: React.FC = () => {
  return (
    <section id="simulator" className="w-full bg-zinc-100 dark:bg-[#0a0a0a] py-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
            See Citadel in Action
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            A fully-featured React console built to mirror the complexities of enterprise IAM dashboards.
          </p>
        </div>

        {/* Simulator Showcase */}
        <div className="mb-24">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm">1</span>
            Policy Simulator
          </h3>
          <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xl overflow-hidden flex flex-col">
            <div className="h-10 bg-zinc-100 dark:bg-[#111] border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="p-8 bg-zinc-50 dark:bg-[#050505] flex-1 min-h-[400px] flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-mono text-sm border-dashed border-2 border-zinc-200 dark:border-zinc-800 m-8 rounded-lg">
              [ Insert Policy Simulator Screenshot Here ]
            </div>
          </div>
        </div>

        {/* Dashboard Modules Showcase */}
        <div className="grid md:grid-cols-2 gap-12">
          
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm">2</span>
              Identity Management
            </h3>
            <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xl overflow-hidden flex flex-col">
              <div className="h-8 bg-zinc-100 dark:bg-[#111] border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
              </div>
              <div className="p-8 bg-zinc-50 dark:bg-[#050505] flex-1 min-h-[250px] flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-mono text-xs border-dashed border-2 border-zinc-200 dark:border-zinc-800 m-6 rounded-lg">
                [ Insert Users & Groups Screenshot Here ]
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm">3</span>
              JSON Policies
            </h3>
            <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xl overflow-hidden flex flex-col">
              <div className="h-8 bg-zinc-100 dark:bg-[#111] border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
              </div>
              <div className="p-8 bg-zinc-50 dark:bg-[#050505] flex-1 min-h-[250px] flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-mono text-xs border-dashed border-2 border-zinc-200 dark:border-zinc-800 m-6 rounded-lg">
                [ Insert Policies Dashboard Screenshot Here ]
              </div>
            </div>
          </div>

          <div className="md:col-span-2 mt-8">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm">4</span>
              Immutable Audit Logs
            </h3>
            <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xl overflow-hidden flex flex-col">
              <div className="h-10 bg-zinc-100 dark:bg-[#111] border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="p-8 bg-zinc-50 dark:bg-[#050505] flex-1 min-h-[300px] flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-mono text-sm border-dashed border-2 border-zinc-200 dark:border-zinc-800 m-8 rounded-lg">
                [ Insert Audit Logs Screenshot Here ]
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ProductShowcase;
