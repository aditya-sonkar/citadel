import React, { useState } from 'react';
import { useGroups, useDeleteGroup, useCreateGroup } from '../../hooks/useGroups';
import type { IAMTab } from './Sidebar';
import { AccessDeniedState } from '../ui/AccessDeniedState';
import { Modal } from '../ui/Modal';

interface GroupsViewProps {
  setActiveTab?: (tab: IAMTab) => void;
  onGroupClick?: (groupId: string) => void;
  isRoot?: boolean;
}

const GroupsView: React.FC<GroupsViewProps> = ({ setActiveTab, onGroupClick, isRoot }) => {
  const { data: groups, isLoading, isError } = useGroups();
  const deleteGroupMutation = useDeleteGroup();
  const createGroupMutation = useCreateGroup();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTargets, setDeleteTargets] = useState<{ id: string; name: string }[] | null>(null);
  const [confirmText, setConfirmText] = useState('');

  // Create Group states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredGroups = groups?.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredGroups.map(g => g.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectGroup = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(groupId => groupId !== id));
    }
  };

  const handleGroupClick = (groupId: string) => {
    if (onGroupClick) {
      onGroupClick(groupId);
    } else if (setActiveTab) {
      setActiveTab('group-details');
    }
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreateError(null);
    setIsCreating(true);

    try {
      await createGroupMutation.mutateAsync({
        name: newGroupName.trim(),
        description: newGroupDesc.trim() || undefined,
      });
      setIsCreateModalOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
    } catch (err: any) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create group.');
    } finally {
      setIsCreating(false);
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
            Groups
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
            Group multiple user identities together and attach policies to define collective permission sets.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            disabled={selectedIds.length === 0}
            onClick={() => {
              const targets = filteredGroups
                .filter(g => selectedIds.includes(g.id))
                .map(g => ({ id: g.id, name: g.name }));
              setDeleteTargets(targets);
            }}
            className="px-3 py-1.5 text-[12px] font-medium bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Delete
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 text-[12px] font-medium bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
          >
            Create group
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Search groups..."
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
                    checked={selectedIds.length > 0 && selectedIds.length === filteredGroups.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Group name</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Description</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">Users</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">Attached Policies</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-right">Creation time</th>
                <th className="py-2.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-[12px] text-zinc-500">
                    No groups found.
                  </td>
                </tr>
              )}
              {filteredGroups.map((g) => (
                <tr key={g.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                  <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer"
                      checked={selectedIds.includes(g.id)}
                      onChange={(e) => handleSelectGroup(g.id, e.target.checked)}
                    />
                  </td>
                  <td
                    onClick={() => handleGroupClick(g.id)}
                    className="py-2.5 px-4 cursor-pointer"
                  >
                    <span className="text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      {g.name}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[12px] text-zinc-500 dark:text-zinc-400 max-w-[240px] truncate">
                    {g.description || <span className="text-zinc-400 dark:text-zinc-600">No description</span>}
                  </td>
                  <td className="py-2.5 px-4 text-[12px] text-zinc-500 dark:text-zinc-400 text-center">
                    {g.memberCount ?? 0}
                  </td>
                  <td className="py-2.5 px-4 text-[12px] text-zinc-500 dark:text-zinc-400 text-center">
                    {g.attachedPolicyCount ?? 0}
                  </td>
                  <td className="py-2.5 px-4 text-right text-[12px] text-zinc-500 dark:text-zinc-400">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGroupClick(g.id); }}
                      className="text-[11px] font-semibold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/50 transition-colors"
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

      {/* Create Group Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setCreateError(null); }} title="Create Group">
        <form onSubmit={handleCreateGroupSubmit} className="flex flex-col gap-4">
          {createError && (
            <p className="text-[12px] text-red-650 bg-red-500/10 border border-red-500/20 p-2.5 rounded-md font-medium leading-relaxed">
              {createError}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-350">Group Name</label>
            <input
              type="text"
              required
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Administrators"
              className="w-full h-[36px] px-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-350">Description</label>
            <textarea
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              placeholder="Provide a description for this group..."
              rows={3}
              className="w-full p-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2">
            <button
              type="button"
              onClick={() => { setIsCreateModalOpen(false); setCreateError(null); }}
              className="px-4 py-2 text-[12px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 text-[12px] font-medium bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm disabled:opacity-40"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTargets} onClose={() => { setDeleteTargets(null); setConfirmText(''); }} title={deleteTargets?.length === 1 ? "Delete Group" : "Delete Groups"}>
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
            {deleteTargets?.length === 1 ? (
              <>Delete group <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deleteTargets[0].name}</span> permanently? This will remove all memberships and detached attachments.</>
            ) : (
              <>Delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deleteTargets?.length} groups</span> permanently? This will remove all memberships and detached attachments.</>
            )}
          </p>
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
              type="button"
              onClick={() => { setDeleteTargets(null); setConfirmText(''); }}
              className="px-4 py-2 text-[12px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!deleteTargets) return;
                try {
                  await Promise.all(deleteTargets.map(t => deleteGroupMutation.mutateAsync(t.id)));
                  setSelectedIds([]);
                  setDeleteTargets(null);
                  setConfirmText('');
                } catch (err: any) {
                  alert(err.response?.data?.message || 'Failed to delete group(s).');
                }
              }}
              disabled={confirmText !== 'confirm' || deleteGroupMutation.isPending}
              className="px-4 py-2 text-[12px] font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm disabled:opacity-40"
            >
              {deleteGroupMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GroupsView;
