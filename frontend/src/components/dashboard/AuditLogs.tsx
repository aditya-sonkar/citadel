import React from 'react';
import { useAuditLogs } from '../../hooks/useAudit';
import { AccessDeniedState } from '../ui/AccessDeniedState';

interface AuditLogsProps {
  isRoot?: boolean;
}

const AuditLogs: React.FC<AuditLogsProps> = ({ isRoot }) => {
  const { data: logs, isLoading, isError } = useAuditLogs();

  const getBadgeStyle = (decision: string) => {
    switch (decision) {
      case 'ALLOW_MATCH':
      case 'ROOT_BYPASS':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900';
      case 'EXPLICIT_DENY':
      case 'BOUNDARY_DENY':
      case 'DELEGATION_DENY':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900';
      case 'NO_MATCH':
      default:
        return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  if (isError) {
    return <AccessDeniedState />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-white rounded-full animate-spin"></div>
          <p className="text-[13px] text-zinc-500 font-medium">{isRoot ? 'Fetching data...' : 'Verifying access...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in p-6 md:p-10">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Audit Logs
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Review detailed access records and policy evaluation decisions across your Citadel tenant.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Filter by action, user, or decision..."
          className="w-full max-w-[400px] h-[32px] px-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
        />
        <button className="h-[32px] px-3 border border-zinc-200 dark:border-zinc-800 rounded-md text-[12px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-white dark:bg-[#0a0a0a] transition-colors">
          Export CSV
        </button>
      </div>

      {/* Dense Table */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Timestamp</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Actor</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 w-[220px]">Action</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">Resource</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">Decision</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {isLoading && (
                <tr><td colSpan={6} className="py-4 text-center text-[12px] text-zinc-500">Loading audit logs...</td></tr>
              )}
              {isError && (
                <tr><td colSpan={6} className="py-4 text-center text-[12px] text-red-500">Error loading audit logs</td></tr>
              )}
              {logs && logs.length === 0 && (
                <tr><td colSpan={6} className="py-4 text-center text-[12px] text-zinc-500">No logs found.</td></tr>
              )}
              {logs && logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                  <td className="py-2.5 px-4 text-[12px] text-zinc-500 dark:text-zinc-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-[13px] font-medium text-blue-600 dark:text-blue-400 cursor-pointer">
                    {log.userEmail || log.userId || 'System'}
                  </td>
                  <td className="py-2.5 px-4 text-[12px] font-mono text-zinc-900 dark:text-zinc-300 max-w-[220px] truncate">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-4 text-[12px] font-mono text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate text-center">
                    {log.targetResource}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${getBadgeStyle(log.decision)}`}>
                      {log.decision}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-[12px] font-mono text-zinc-500 dark:text-zinc-500">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AuditLogs;
