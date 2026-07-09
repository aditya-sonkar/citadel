import React, { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { AccessDeniedState } from '../ui/AccessDeniedState';

interface SettingsViewProps {
  userEmail?: string;
  isRoot?: boolean;
}

const SettingsView: React.FC<SettingsViewProps> = ({ userEmail, isRoot }) => {
  const [isDenied, setIsDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const testAccess = async () => {
      try {
        await api.get('/settings');
      } catch (err: any) {
        if (err.response?.status === 403) {
          setIsDenied(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    testAccess();
  }, []);

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

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in p-6 md:p-10 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
          Configure account alias, password policies, and security preferences.
        </p>
      </div>

      {/* Account Details */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-white">
            Account Details
          </h3>
          <button className="text-[12px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Edit
          </button>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400 w-[200px]">Account ID</td>
                <td className="py-3 px-6 text-[13px] text-zinc-900 dark:text-zinc-100 font-mono">1234-5678-9012</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Account Alias</td>
                <td className="py-3 px-6 text-[13px] text-zinc-900 dark:text-zinc-100 font-mono">citadel-prod-global</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Root Email</td>
                <td className="py-3 px-6 text-[13px] text-zinc-900 dark:text-zinc-100 font-mono">{userEmail || 'root@org.local'}</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Canonical User ID</td>
                <td className="py-3 px-6 text-[12px] text-zinc-500 dark:text-zinc-400 font-mono truncate max-w-xs">
                  a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Policy */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm flex flex-col mt-2">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <div>
            <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-white">
              Password Policy
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Rules applied when IAM users change their own passwords</p>
          </div>
          <button className="text-[12px] font-medium px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Edit Policy
          </button>
        </div>
        
        <div className="p-0">
           <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400 w-2/3">Minimum password length</td>
                <td className="py-3 px-6 text-[13px] text-zinc-900 dark:text-zinc-100 font-semibold">12 characters</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Require at least one uppercase letter</td>
                <td className="py-3 px-6 text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Require at least one lowercase letter</td>
                <td className="py-3 px-6 text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Require at least one number</td>
                <td className="py-3 px-6 text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Require at least one non-alphanumeric character (!@#$%^&*)</td>
                <td className="py-3 px-6 text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
              </tr>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Enable password expiration</td>
                <td className="py-3 px-6 text-[13px] text-zinc-500 dark:text-zinc-400">No (Passwords do not expire)</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Prevent password reuse</td>
                <td className="py-3 px-6 text-[13px] text-zinc-900 dark:text-zinc-100 font-semibold">Remember last 5 passwords</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Preferences */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm flex flex-col mt-2">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-white">
            Security Preferences
          </h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                <td className="py-4 px-6 text-[13px] font-medium text-zinc-900 dark:text-white">
                  Console Session Timeout
                  <p className="text-[11px] text-zinc-500 mt-0.5 font-normal">Automatically log out users after a period of inactivity</p>
                </td>
                <td className="py-4 px-6 text-right">
                  <select className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-[12px] rounded px-3 py-1.5 focus:outline-none">
                    <option>1 Hour</option>
                    <option>4 Hours</option>
                    <option>12 Hours</option>
                    <option>24 Hours</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-[13px] font-medium text-zinc-900 dark:text-white">
                  STS Global Endpoint Session Tokens
                  <p className="text-[11px] text-zinc-500 mt-0.5 font-normal">Valid in all regions worldwide by default</p>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default SettingsView;
