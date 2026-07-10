import React from 'react';
import type { IAMTab } from './Sidebar';
import { useUsersMeta } from '../../hooks/useUsers';
import { useGroups } from '../../hooks/useGroups';
import { usePolicies } from '../../hooks/usePolicies';
import { useAuditLogs } from '../../hooks/useAudit';

interface DashboardHomeProps {
  isAdmin: boolean;
  setActiveTab: (tab: IAMTab) => void;
  userEmail?: string;
}

const securityRecommendations = [
  { status: 'ok', title: 'Root user has MFA', desc: 'Having multi-factor authentication (MFA) for the root user improves security for this account.' },
  { status: 'ok', title: 'Root user has no active access keys', desc: 'Using access keys attached to an IAM user instead of the root user improves security.' },
  { status: 'warn', title: 'MFA not configured for some IAM users', desc: 'Enable MFA for all active IAM users to reduce risk of credential compromise.' },
];

const DashboardHome: React.FC<DashboardHomeProps> = ({ isAdmin, setActiveTab }) => {
  const { data: usersMeta } = useUsersMeta();
  const { data: groups } = useGroups();
  const { data: policies } = usePolicies();
  const { data: logs } = useAuditLogs();

  const warnings = securityRecommendations.filter(r => r.status === 'warn').length;

  // Active metrics counts
  const metrics = [
    { label: 'Identities (Users)', count: usersMeta?.total ?? 0, tab: 'users' as const },
    { label: 'User groups', count: groups?.length ?? 0, tab: 'groups' as const },
    { label: 'Customer Policies', count: policies?.length ?? 0, tab: 'policies' as const },
    { label: 'Audit Log Entries', count: logs?.length ?? 0, tab: 'audit' as const },
  ];

  // Pick last 5 events to display
  const recentEvents = logs?.slice(0, 5) || [];

  return (
    <div className="min-h-full p-6 md:p-8 bg-zinc-50 dark:bg-[#050505]">
      
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">
          IAM Dashboard
        </h1>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <button
            key={m.label}
            onClick={() => setActiveTab(m.tab)}
            className="flex flex-col items-start justify-between p-5 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg text-left hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group min-h-[110px] w-full"
          >
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider pr-2 leading-snug">{m.label}</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white mt-3">{m.count}</span>
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* Left column */}
        <div className="flex flex-col gap-6">

          {/* Recent Audit Events */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-zinc-900 dark:text-white">Recent Audit Events</h2>
              <button onClick={() => setActiveTab('audit')} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline">View all</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px] whitespace-nowrap">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <th className="py-2.5 px-4 font-semibold text-zinc-500">Decision</th>
                    <th className="py-2.5 px-4 font-semibold text-zinc-500">Actor</th>
                    <th className="py-2.5 px-4 font-semibold text-zinc-500">Action</th>
                    <th className="py-2.5 px-4 font-semibold text-zinc-500 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 font-mono">
                  {recentEvents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-zinc-500">No events logged yet.</td>
                    </tr>
                  ) : (
                    recentEvents.map((event: any) => {
                      const isAllowed = event.effect === 'Allow';
                      return (
                        <tr key={event.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors">
                          <td className="py-2.5 px-4">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isAllowed 
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200' 
                                : 'bg-red-50 dark:bg-red-950/20 text-red-650 border border-red-200'
                            }`}>
                              {event.decision || (isAllowed ? 'ALLOW' : 'DENY')}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-zinc-900 dark:text-zinc-200">{event.userEmail || 'system'}</td>
                          <td className="py-2.5 px-4 text-zinc-500 dark:text-zinc-400">{event.action}</td>
                          <td className="py-2.5 px-4 text-right text-zinc-500">{new Date(event.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-semibold text-zinc-900 dark:text-white">Security recommendations</h2>
                {warnings > 0 ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-amber-500 text-white rounded-full">{warnings}</span>
                ) : (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-emerald-500 text-white rounded-full">0</span>
                )}
              </div>
            </div>
            <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {securityRecommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-4">
                  {rec.status === 'ok' ? (
                    <span className="flex shrink-0 w-5 h-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </span>
                  ) : (
                    <span className="flex shrink-0 w-5 h-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mt-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </span>
                  )}
                  <div>
                    <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{rec.title}</p>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">{rec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">

          {/* Account Info */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <h2 className="text-[14px] font-semibold text-zinc-900 dark:text-white">Account</h2>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Account ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-mono text-zinc-900 dark:text-zinc-100">citadel-iam</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Sign-in URL</span>
                <a href="/login" className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline break-all font-mono">
                  {window.location.origin}/login
                </a>
              </div>
            </div>
          </div>

          {/* Tools */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1">
              <h2 className="text-[14px] font-semibold text-zinc-900 dark:text-white">Tools</h2>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <button onClick={() => setActiveTab('simulator')} className="text-[13px] text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Policy simulator
                </button>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1">The simulator evaluates the policies that you choose and determines the effective permissions for each action that you specify.</p>
              </div>
              <div>
                <button onClick={() => setActiveTab('audit')} className="text-[13px] text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Audit logs
                </button>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1">Track all IAM actions and decisions made within your account for compliance and security review.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
