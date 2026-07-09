import React from 'react';

const principles = [
  {
    title: 'Least Privilege',
    content: 'Identities start with zero permissions. Access must be explicitly granted through carefully scoped policies.'
  },
  {
    title: 'Explicit Deny',
    content: 'A single Deny statement overrides any number of Allows, guaranteeing absolute restriction when needed.'
  },
  {
    title: 'Permission Boundaries',
    content: 'Administrators can enforce immutable permission ceilings on identities, preventing unauthorized privilege escalation.'
  },
  {
    title: 'Immutable Audit Logs',
    content: 'Every evaluation, modification, and access decision is permanently recorded for compliance and forensics.'
  }
];

const SecurityPrinciples: React.FC = () => {
  return (
    <section className="w-full bg-white dark:bg-black py-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
            Security Principles
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Citadel's architecture is rooted in zero-trust fundamentals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((principle, i) => (
            <div key={i} className="flex flex-col border-t-2 border-zinc-900 dark:border-zinc-100 pt-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">{principle.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {principle.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecurityPrinciples;
