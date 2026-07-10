import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCredentialReport } from '../../api/users.api';
import { AccessDeniedState } from '../ui/AccessDeniedState';

interface CredentialRow {
  email: string;
  mfaEnabled: boolean;
  passwordLastChanged: string;
  activeKeys: number;
  lastActive: string;
}

interface CredentialReportViewProps {
  isRoot?: boolean;
}

const CredentialReportView: React.FC<CredentialReportViewProps> = ({ isRoot }) => {
  const [downloading, setDownloading] = useState(false);

  const { data: reportData, isLoading, error } = useQuery<CredentialRow[]>({
    queryKey: ['credentialReport'],
    queryFn: fetchCredentialReport,
    retry: false,
  });

  const isDenied = (error as any)?.response?.status === 403;

  if (isDenied) {
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

  const rows = reportData || [];

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      // Simulate CSV download
      const headers = 'User,MFA Enabled,Password Last Changed,Active Access Keys,Last Active\n';
      const csvRows = rows.map(r => `"${r.email}",${r.mfaEnabled},"${r.passwordLastChanged}",${r.activeKeys},"${r.lastActive}"`).join('\n');
      const blob = new Blob([headers + csvRows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `citadel-credential-report-${new Date().toISOString().split('T')[0]}.csv`);
      a.click();
      setDownloading(false);
    }, 500);
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'Never') return 'Never';
    return new Date(dateString).toLocaleString('en-IN');
  };

  const formatDateShort = (dateString: string) => {
    if (dateString === 'Never') return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in p-6 md:p-10 min-h-full">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Credential Report
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">Info</span>
          </h1>
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1">
            Generate and download a credential report that lists all users in your account and the status of their various credentials.
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading || rows.length === 0}
          className="px-3 py-1.5 text-[12px] font-medium bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-black rounded-md transition-colors shadow-sm font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          {downloading ? (
            <>
              <svg className="animate-spin h-3 w-3 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </>
          ) : (
            'Download report'
          )}
        </button>
      </div>

      {/* Info Warning Banner */}
      <div className="p-4 bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg text-[12px] text-zinc-600 dark:text-zinc-400 flex flex-col gap-1">
        <span className="font-semibold text-zinc-950 dark:text-white">About credential reports</span>
        <p>A credential report contains status information for all security credentials associated with Citadel IAM users. Use reports to audit the security credentials of your users for security compliance audits.</p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">User</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">MFA</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">Password Last Changed</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">Active Keys</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-[13px]">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-medium text-zinc-900 dark:text-white">{row.email}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${row.mfaEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                      }`}>
                      {row.mfaEnabled ? 'Active' : 'Not configured'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-zinc-500 dark:text-zinc-400 text-center">{formatDateShort(row.passwordLastChanged)}</td>
                  <td className="py-2.5 px-4 text-zinc-500 dark:text-zinc-400 text-center">{row.activeKeys}</td>
                  <td className="py-2.5 px-4 text-center text-zinc-500 dark:text-zinc-400">{formatDate(row.lastActive)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 text-[13px]">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CredentialReportView;
