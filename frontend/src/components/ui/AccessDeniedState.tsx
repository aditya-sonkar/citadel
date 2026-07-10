import React from 'react';

export const AccessDeniedState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full animate-fade-in p-6">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50 dark:ring-red-900/10">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 22-8-4.5v-6.6a10 10 0 0 1 8-9.4 10 10 0 0 1 8 9.4v6.6Z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2 text-center">
        Access Denied
      </h2>
      <p className="text-[14px] text-zinc-500 dark:text-zinc-400 text-center max-w-[400px]">
        You do not have the required permissions to view this resource.
        Please contact your Citadel administrator if you believe this is a mistake.
      </p>
    </div>
  );
};
