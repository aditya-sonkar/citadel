import React from 'react';

const Metrics: React.FC = () => {
  return (
    <section className="w-full border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-8">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
          <div className="flex flex-col items-center text-center px-4">
            <span className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Self-Administered</span>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">IAM Platform</span>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <span className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Permission</span>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Boundaries</span>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <span className="text-xl font-bold text-zinc-900 dark:text-white mb-1">14</span>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Protected Actions</span>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <span className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Immutable</span>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Audit Logs</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Metrics;
