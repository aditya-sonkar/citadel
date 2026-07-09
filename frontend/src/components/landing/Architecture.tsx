import React from 'react';

const Architecture: React.FC = () => {
  return (
    <section id="architecture" className="w-full bg-zinc-900 dark:bg-[#0a0a0a] py-24 text-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Architecture
          </h2>
          <p className="text-zinc-400">
            Citadel is built on a scalable, enterprise-grade technology stack.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Platform Card */}
          <div className="bg-zinc-800/50 dark:bg-[#111] border border-zinc-700 dark:border-zinc-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
              Platform Stack
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm text-blue-300">React & Tailwind</span>
                <span className="text-xs text-zinc-400">Single-page application providing a high-performance administration dashboard.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm text-blue-300">Express.js API</span>
                <span className="text-xs text-zinc-400">Stateless, RESTful backend orchestrating identity and policy management.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm text-emerald-400 font-bold">Permission Engine</span>
                <span className="text-xs text-zinc-400">Evaluates identity policies, group policies, explicit deny precedence, and permission boundaries before producing a deterministic authorization decision.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm text-blue-300">Prisma ORM</span>
                <span className="text-xs text-zinc-400">Type-safe database access layer managing relational identity data.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm text-blue-300">PostgreSQL</span>
                <span className="text-xs text-zinc-400">Highly available relational database storing policies, users, and audit logs.</span>
              </div>
            </div>
          </div>

          {/* Runtime Card */}
          <div className="bg-zinc-800/50 dark:bg-[#111] border border-zinc-700 dark:border-zinc-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Runtime Lifecycle
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm text-emerald-300">1. Request</span>
                <span className="text-xs text-zinc-400">Incoming API call containing user session token and requested action/resource.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm text-emerald-300">2. Authentication</span>
                <span className="text-xs text-zinc-400">Cryptographically verifies the JWT to establish the identity.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm text-emerald-400 font-bold">3. Authorization</span>
                <span className="text-xs text-zinc-400">Engine evaluates the identity against all assigned constraints and explicit boundaries.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm text-emerald-300">4. Audit Logging</span>
                <span className="text-xs text-zinc-400">Permanently records the evaluation context, decision outcome, and timestamp.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm text-emerald-300">5. Response</span>
                <span className="text-xs text-zinc-400">Yields a 200 OK or 403 Forbidden based entirely on the deterministic evaluation.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Architecture;
