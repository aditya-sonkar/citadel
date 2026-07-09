import React from 'react';

const outcomes = [
  {
    icon: '🟢',
    title: 'ALLOW_MATCH',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    desc: 'A matching Allow statement grants access.'
  },
  {
    icon: '🔴',
    title: 'EXPLICIT_DENY',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
    desc: 'A matching Deny statement overrides all Allows.'
  },
  {
    icon: '🟠',
    title: 'BOUNDARY_DENY',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    border: 'border-orange-200 dark:border-orange-500/20',
    desc: 'Permission boundary blocks the request.'
  },
  {
    icon: '🟣',
    title: 'DELEGATION_DENY',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-200 dark:border-purple-500/20',
    desc: 'Policy author attempted to grant permissions they do not possess.'
  },
  {
    icon: '⚪',
    title: 'NO_MATCH',
    color: 'text-zinc-600 dark:text-zinc-400',
    bg: 'bg-zinc-100 dark:bg-zinc-500/10',
    border: 'border-zinc-200 dark:border-zinc-500/20',
    desc: 'No matching Allow statement was found.'
  },
  {
    icon: '⭐',
    title: 'ROOT_BYPASS',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    desc: 'Root user bypasses authorization evaluation.'
  }
];

const AuthorizationOutcomes: React.FC = () => {
  return (
    <section className="w-full bg-zinc-50 dark:bg-[#050505] py-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
            Authorization Outcomes
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Citadel doesn't just grant or deny access—it explains exactly why a decision was reached.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outcomes.map((outcome, i) => (
            <div key={i} className={`p-6 rounded-2xl border ${outcome.border} ${outcome.bg} flex flex-col items-start`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">{outcome.icon}</span>
                <h3 className={`text-sm font-bold tracking-widest ${outcome.color}`}>{outcome.title}</h3>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                {outcome.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AuthorizationOutcomes;
