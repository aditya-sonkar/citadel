import React, { useState } from 'react';

const capabilities = [
  {
    title: 'Users & Identity',
    content: 'Manage individual user identities, authentication states, and lifecycle. Enable multi-factor authentication and role-based access assignments out of the box.'
  },
  {
    title: 'Groups & Memberships',
    content: 'Organize users into logical groups. Attach policies to a group to automatically propagate permissions to all members, drastically reducing administrative overhead.'
  },
  {
    title: 'Policy Engine',
    content: 'Write JSON-based authorization policies defining Effect, Action, and Resource. The strict evaluation engine ensures permissions are accurately computed across all identity associations.'
  },
  {
    title: 'Permissions Boundaries',
    content: 'Set the maximum allowed permissions for an identity. Even if an explicit allow policy grants full access, the boundary acts as an absolute ceiling, preventing privilege escalation.'
  },
  {
    title: 'Session Management',
    content: 'Securely manage user sessions, JSON Web Tokens (JWTs), and authentication cookies. Instantly revoke access and audit active sessions across the enterprise.'
  },
  {
    title: 'Immutable Audit Trail',
    content: 'Every action—from creating a user to attaching a policy—is permanently recorded. Monitor who performed what action, when, and from where, ensuring complete compliance.'
  }
];

const CoreCapabilities: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full bg-zinc-50 dark:bg-black py-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-16">
          
          <div className="md:w-1/3">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
              Core Capabilities
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Citadel provides a complete suite of enterprise-grade tools for defining, enforcing, and auditing access across your organization.
            </p>
          </div>

          <div className="md:w-2/3">
            <div className="border-t border-zinc-200 dark:border-zinc-800">
              {capabilities.map((cap, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={i} className="border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="w-full py-5 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className={`text-base font-semibold ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-white'}`}>
                        {cap.title}
                      </span>
                      <span className="text-zinc-400">
                        {isOpen ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        )}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="pb-6 pr-8 animate-fade-in">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {cap.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CoreCapabilities;
