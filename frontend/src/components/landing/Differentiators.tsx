import React from 'react';

const Differentiators: React.FC = () => {
  return (
    <section className="w-full bg-white dark:bg-[#050505] py-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
            What Makes Citadel Different
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Moving beyond simple Role-Based Access Control (RBAC), Citadel implements enterprise IAM patterns that protect the system from the administrators themselves.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0a0a0a]">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Self-Administration</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Citadel's dashboard is governed by the engine itself. Every API call made by an administrator to manage users, policies, or groups must explicitly be allowed by an IAM policy attached to that administrator.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0a0a0a]">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Delegation Prevention</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Without boundaries, an admin could create a user with more privileges than themselves. Citadel prevents this by strictly ensuring permissions can only be delegated within authorized constraints.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0a0a0a]">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Permission Boundaries</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              A hard mathematical limit on what a user can do. It overrides all explicit allows, ensuring that even if a full-access policy is mistakenly attached, the boundary enforces safety.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0a0a0a]">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Decision Auditing</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Citadel doesn't just log API requests; it logs the exact engine evaluation. You can trace back exactly which policy permitted or denied a specific action at any given time.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Differentiators;
