import React from 'react';
import CornerMarkers from './CornerMarkers';

const Features: React.FC = () => {
  const layers = [
    { 
      type: 'IDENTITY', 
      title: 'Users & Identity', 
      desc: 'Create and manage user identities with secure password hashing, root-user designation, and unique email constraints.',
      module: 'users/'
    },
    { 
      type: 'ORGANIZATION', 
      title: 'Groups & Memberships', 
      desc: 'Organize users into logical groups with many-to-many UserGroupMembership relations and cascading policy inheritance.',
      module: 'groups/'
    },
    { 
      type: 'POLICY ENGINE', 
      title: 'Policy Evaluation', 
      desc: 'Author MANAGED and INLINE JSON policies with Allow/Deny statements. Attach to users directly or inherit through group membership.',
      module: 'policies/'
    },
    { 
      type: 'ENFORCEMENT', 
      title: 'Permissions Boundaries', 
      desc: 'Set upper-bound permission ceilings that cap delegated access — even when a user\'s policies grant broader permissions. Prevents privilege escalation.',
      module: 'resources/'
    },
    { 
      type: 'SESSIONS', 
      title: 'Session Management', 
      desc: 'JWT access and refresh token lifecycle with secure rotation, refresh token hash storage, user-agent tracking, and IP address logging.',
      module: 'sessions/'
    },
    { 
      type: 'AUDITABILITY', 
      title: 'Audit Trail', 
      desc: 'Immutable, append-only decision logs with 6 typed outcomes: ROOT_BYPASS, ALLOW_MATCH, EXPLICIT_DENY, BOUNDARY_DENY, DELEGATION_DENY, NO_MATCH.',
      module: 'audit/'
    },
  ];

  return (
    <section id="capabilities" aria-label="Capabilities" className="w-full bg-white dark:bg-black py-[100px] md:py-[140px] border-t border-dashed border-zinc-400 dark:border-zinc-800 transition-colors duration-300">
      <div className="mx-auto grid w-full max-w-[1512px] grid-cols-1 items-start gap-12 px-6 md:grid-cols-2 md:gap-16 md:px-[120px]">
        
        {/* Left side: Heading & Stacked dashed card blocks */}
        <div className="flex flex-col gap-10 text-left">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">02 • ENGINE ARCHITECTURE</span>
            <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mt-2 leading-tight">
              One platform.<br />Six layers of security.
            </h2>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 font-semibold leading-relaxed max-w-[480px]">
              Each feature maps directly to a backend module. What you see on this page is what the codebase implements.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {layers.map((layer, idx) => (
              <div key={idx} className="relative border border-dashed border-zinc-400 dark:border-zinc-800 bg-white/20 dark:bg-zinc-900/20 p-6 flex flex-col gap-1 rounded-xl hover:bg-white/30 dark:hover:bg-zinc-900/30 transition-colors group">
                <CornerMarkers />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">{layer.type}</span>
                  <span className="text-[8px] font-mono text-zinc-400/60 dark:text-zinc-600 font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">{layer.module}</span>
                </div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{layer.title}</h4>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 font-semibold leading-relaxed mt-1">
                  {layer.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Developer-focused Code Snippet */}
        <div className="w-full h-[460px] relative border border-dashed border-zinc-400 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-sm sticky top-32 p-6 flex flex-col">
          <CornerMarkers />
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">policy.json</span>
          </div>
          <pre className="text-[11px] font-mono leading-relaxed text-zinc-600 dark:text-zinc-400 overflow-auto">
            <code className="block">
{`{
  "Version": "2024-10-15",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "citadel:CreateUser",
        "citadel:AssignGroup"
      ],
      "Resource": "arn:citadel:iam:::group/*"
    },
    {
      "Effect": "Deny",
      "Action": "citadel:DeleteAuditLogs",
      "Resource": "*"
    }
  ],
  "Boundary": {
    "MaxPrivilege": "arn:citadel:iam::policy/BoundaryLimit"
  }
}`}
            </code>
          </pre>
        </div>

      </div>
    </section>
  );
};

export default Features;
