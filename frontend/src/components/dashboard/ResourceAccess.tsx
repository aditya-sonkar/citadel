import React, { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { AxiosError } from 'axios';

type TestStatus = 'idle' | 'testing' | 'success' | 'denied' | 'unauthorized' | 'error';

interface ActionTest {
  id: string;
  action: string;
  method: string;
  url: string;
  status: TestStatus;
}

const INITIAL_TESTS: ActionTest[] = [
  // Reports
  { id: 'reports:List', action: 'reports:List', method: 'GET', url: '/reports', status: 'idle' },
  { id: 'reports:Read', action: 'reports:Read', method: 'GET', url: '/reports/123', status: 'idle' },
  { id: 'reports:Create', action: 'reports:Create', method: 'POST', url: '/reports', status: 'idle' },
  { id: 'reports:Update', action: 'reports:Update', method: 'PUT', url: '/reports/123', status: 'idle' },
  { id: 'reports:Delete', action: 'reports:Delete', method: 'DELETE', url: '/reports/123', status: 'idle' },
  // Alerts
  { id: 'alerts:List', action: 'alerts:List', method: 'GET', url: '/alerts', status: 'idle' },
  { id: 'alerts:Read', action: 'alerts:Read', method: 'GET', url: '/alerts/123', status: 'idle' },
  { id: 'alerts:Create', action: 'alerts:Create', method: 'POST', url: '/alerts', status: 'idle' },
  { id: 'alerts:Acknowledge', action: 'alerts:Acknowledge', method: 'PATCH', url: '/alerts/123/acknowledge', status: 'idle' },
  { id: 'alerts:Delete', action: 'alerts:Delete', method: 'DELETE', url: '/alerts/123', status: 'idle' },
  // Settings
  { id: 'settings:Read', action: 'settings:Read', method: 'GET', url: '/settings', status: 'idle' },
  { id: 'settings:Update', action: 'settings:Update', method: 'PUT', url: '/settings', status: 'idle' },
  // Audit
  { id: 'audit:List', action: 'audit:List', method: 'GET', url: '/audit', status: 'idle' },
  { id: 'audit:Read', action: 'audit:Read', method: 'GET', url: '/audit/123', status: 'idle' },
];

export default function ResourceAccess() {
  const [tests, setTests] = useState<ActionTest[]>(INITIAL_TESTS);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [userInfo, setUserInfo] = useState<{name: string, groups: string[], boundary: string | null} | null>(null);

  // Load User Info for Evaluator Mode
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await api.get('/users/me');
        if (data.success && data.data) {
          const user = data.data;
          setUserInfo({
            name: user.name,
            groups: user.groups?.map((g: any) => g.name) || [],
            boundary: user.boundary?.name || null
          });
        }
      } catch (err) {
        console.error('Failed to load user info', err);
      }
    };
    fetchMe();
  }, []);

  const runTest = async (id: string) => {
    setTests((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'testing' } : t)));
    const testToRun = tests.find((t) => t.id === id);
    if (!testToRun) return;

    try {
      await api.request({
        method: testToRun.method,
        url: testToRun.url,
      });
      setTests((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'success' } : t)));
    } catch (error) {
      let status: TestStatus = 'error';
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          window.location.href = '/login';
          return;
        }
        else if (error.response?.status === 403) status = 'denied';
      }
      setTests((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    }
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    for (const test of tests) {
      await runTest(test.id);
    }
    setIsRunningAll(false);
  };

  const resetTests = () => {
    setTests(INITIAL_TESTS);
  };

  const renderBadge = (status: TestStatus) => {
    switch (status) {
      case 'idle':
        return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">Idle</span>;
      case 'testing':
        return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse">Testing...</span>;
      case 'success':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">🟢 Success</span>;
      case 'denied':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">🔴 Access Denied</span>;
      case 'unauthorized':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">🟡 Login Required</span>;
      case 'error':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300">⚠️ Error</span>;
    }
  };

  // Group tests by resource prefix
  const testGroups = tests.reduce((acc, test) => {
    const group = test.action.split(':')[0];
    if (!acc[group]) acc[group] = [];
    acc[group].push(test);
    return acc;
  }, {} as Record<string, ActionTest[]>);

  return (
    <div className="p-6 md:p-8 animate-fade-in w-full">
      {/* Evaluator Mode Header */}
      <div className="mb-8 p-5 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg">
        {userInfo ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-zinc-400 dark:text-zinc-500 block mb-1">LOGGED IN AS</span>
              <span className="text-[13px] font-semibold text-zinc-900 dark:text-white">{userInfo.name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-zinc-400 dark:text-zinc-500 block mb-1">GROUPS</span>
              <span className="text-[13px] font-semibold text-zinc-900 dark:text-white">
                {userInfo.groups.length > 0 ? userInfo.groups.join(', ') : 'None'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-zinc-400 dark:text-zinc-500 block mb-1">PERMISSION BOUNDARY</span>
              <span className="text-[13px] font-semibold text-zinc-900 dark:text-white">
                {userInfo.boundary || 'None'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-zinc-400 dark:text-zinc-500 animate-pulse">Loading context...</div>
        )}
      </div>

      {/* Main Header & Controls */}
      <div className="flex items-center justify-between mb-8">
        <div className="-ml-[1px]">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Resource Access</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Test real HTTP endpoints to verify IAM middleware protection.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetTests}
            disabled={isRunningAll}
            className="px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 disabled:opacity-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={runAllTests}
            disabled={isRunningAll}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isRunningAll ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>
      </div>

      {/* Test Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(testGroups).map(([groupName, groupTests]) => (
          <div key={groupName} className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="font-semibold text-sm capitalize text-zinc-900 dark:text-zinc-100">{groupName}</h3>
            </div>
            <div className="p-2">
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {groupTests.map((test) => (
                  <li key={test.id} className="flex items-center justify-between px-3 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors rounded-md">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => runTest(test.id)}
                        disabled={isRunningAll}
                        className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                      >
                        {test.action}
                      </button>
                    </div>
                    <div>
                      {renderBadge(test.status)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
