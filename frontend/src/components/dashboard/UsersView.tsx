import React, { useState } from 'react';
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import type { IAMTab } from './Sidebar';
import { AccessDeniedState } from '../ui/AccessDeniedState';
import { Modal } from '../ui/Modal';

interface UsersViewProps {
  setActiveTab?: (tab: IAMTab) => void;
  onUserClick?: (userId: string) => void;
  isRoot?: boolean;
}

const UsersView: React.FC<UsersViewProps> = ({ setActiveTab, onUserClick, isRoot }) => {
  const { data: users, isLoading, isError } = useUsers();
  const deleteUserMutation = useDeleteUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTargets, setDeleteTargets] = useState<{ id: string; name: string; isMfaEnabled?: boolean; createdAt?: string }[] | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const filteredUsers = users?.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectUser = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(userId => userId !== id));
    }
  };

  const handleUserClick = (userId: string) => {
    if (onUserClick) {
      onUserClick(userId);
    } else if (setActiveTab) {
      setActiveTab('user-details');
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
            Users
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
            Create and administer individual security credentials.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            disabled={selectedIds.length === 0}
            onClick={() => {
              const targets = filteredUsers
                .filter(u => selectedIds.includes(u.id))
                .map(u => ({ id: u.id, name: u.name || u.email, isMfaEnabled: u.isMfaEnabled, createdAt: u.createdAt }));
              setDeleteTargets(targets);
            }}
            className="px-3 py-1.5 text-[12px] font-medium bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Delete
          </button>
          <button
            onClick={() => setActiveTab && setActiveTab('create-user')}
            className="px-3 py-1.5 text-[12px] font-medium bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
          >
            Create user
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-[300px] h-[32px] px-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
        />
      </div>

      {/* Dense Table */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <th className="py-2.5 px-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredUsers.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">User name</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">Groups</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">Policies</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">Boundary</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">MFA Status</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-right">Creation time</th>
                <th className="py-2.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {isLoading && (
                <tr><td colSpan={8} className="py-4 text-center text-[12px] text-zinc-500">Loading users...</td></tr>
              )}
              {isError && (
                <tr><td colSpan={8} className="py-4 text-center text-[12px] text-red-500">Error loading users</td></tr>
              )}
              {filteredUsers.length === 0 && !isLoading && !isError && (
                <tr><td colSpan={8} className="py-4 text-center text-[12px] text-zinc-500">No users found.</td></tr>
              )}
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                  <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      disabled={u.isRoot}
                      title={u.isRoot ? "Root user cannot be deleted" : undefined}
                      className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      checked={selectedIds.includes(u.id)}
                      onChange={(e) => handleSelectUser(u.id, e.target.checked)}
                    />
                  </td>
                  <td
                    onClick={() => handleUserClick(u.id)}
                    className="py-2.5 px-4 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:underline">{u.name || u.email}</span>
                      {u.name && <span className="text-[11px] text-zinc-500">{u.email}</span>}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-[12px] text-zinc-500 dark:text-zinc-400 text-center">
                    {u.groupCount || 0}
                  </td>
                  <td className="py-2.5 px-4 text-[12px] text-zinc-500 dark:text-zinc-400 text-center">
                    <div className="flex flex-col gap-0.5 items-center">
                      {u.managedPoliciesCount > 0 && <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded w-fit">{u.managedPoliciesCount} Managed</span>}
                      {u.inlinePoliciesCount > 0 && <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded w-fit">{u.inlinePoliciesCount} Inline</span>}
                      {(!u.managedPoliciesCount && !u.inlinePoliciesCount) && <span>0</span>}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-[12px] text-zinc-500 dark:text-zinc-400 text-center">
                    {u.hasBoundary ? 'Configured' : 'None'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${u.isMfaEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                      }`}>
                      {u.isMfaEnabled ? 'Virtual MFA' : 'Not configured'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-[12px] text-zinc-500 dark:text-zinc-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUserClick(u.id); }}
                      disabled={u.isRoot && !isRoot}
                      title={u.isRoot && !isRoot ? "Root user cannot be managed by other users" : undefined}
                      className="text-[11px] font-semibold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTargets} onClose={() => { setDeleteTargets(null); setConfirmText(''); }} title={deleteTargets?.length === 1 ? "Delete User" : "Delete Users"}>
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
            {deleteTargets?.length === 1 ? (
              <>Delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deleteTargets[0].name}</span> permanently? This will also delete all their policies, group memberships, and credentials.</>
            ) : (
              <>Delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deleteTargets?.length} users</span> permanently? This will also delete all their policies, group memberships, and credentials.</>
            )}
          </p>

          {/* User info table */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden text-[12px] max-h-[200px] overflow-y-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 sticky top-0">
                  <th className="px-3 py-2 font-semibold text-zinc-500 dark:text-zinc-400">User name</th>
                  <th className="px-3 py-2 font-semibold text-zinc-500 dark:text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {deleteTargets?.map(target => (
                  <tr key={target.id}>
                    <td className="px-3 py-2 text-zinc-800 dark:text-zinc-200 font-medium">{target.name}</td>
                    <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">Active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Confirm input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300">
              To confirm, type <span className="font-mono text-red-600">&quot;confirm&quot;</span> below.
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="confirm"
              className="w-full h-[36px] px-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-red-400 dark:focus:border-red-600 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <button 
              onClick={() => { setDeleteTargets(null); setConfirmText(''); }}
              className="px-4 py-2 text-[12px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={async () => {
                if (!deleteTargets) return;
                try {
                  await Promise.all(deleteTargets.map(t => deleteUserMutation.mutateAsync(t.id)));
                  setSelectedIds([]);
                  setDeleteTargets(null);
                  setConfirmText('');
                } catch (err: any) {
                  alert(err.response?.data?.message || 'Failed to delete user(s). Some might not have been deleted.');
                }
              }}
              disabled={confirmText !== 'confirm' || deleteUserMutation.isPending}
              className="px-4 py-2 text-[12px] font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersView;
