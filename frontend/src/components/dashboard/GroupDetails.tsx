import React, { useState, useEffect } from 'react';
import { useGroup, useAttachGroupPolicy, useDetachGroupPolicy, useAddGroupMember, useRemoveGroupMember, useDeleteGroup, usePutGroupPolicy, useDeleteGroupPolicy, useUpdateGroup } from '../../hooks/useGroups';
import { usePolicies } from '../../hooks/usePolicies';
import { useUsers } from '../../hooks/useUsers';
import { Modal } from '../ui/Modal';
import { SearchableSelect } from '../ui/SearchableSelect';
import { SearchableMultiSelect } from '../ui/SearchableMultiSelect';
import type { IAMTab } from './Sidebar';
import { api } from '../../lib/axios';

const ALL_AVAILABLE_ACTIONS = [
  // Reports
  'reports:List', 'reports:Read', 'reports:Create', 'reports:Update', 'reports:Delete',
  // Alerts
  'alerts:List', 'alerts:Read', 'alerts:Create', 'alerts:Acknowledge', 'alerts:Delete',
  // Settings
  'settings:Read', 'settings:Update',
  // Audit
  'audit:List', 'audit:Read',
  // IAM - Policies
  'iam:ListPolicies', 'iam:GetPolicy', 'iam:CreatePolicy', 'iam:UpdatePolicy', 'iam:DeletePolicy',
  // IAM - Groups
  'iam:ListGroups', 'iam:GetGroup', 'iam:CreateGroup', 'iam:UpdateGroup', 'iam:DeleteGroup',
  'iam:AddUserToGroup', 'iam:RemoveUserFromGroup', 'iam:AttachGroupPolicy', 'iam:DetachGroupPolicy',
  'iam:PutGroupPolicy', 'iam:DeleteGroupPolicy',
  // IAM - Users
  'iam:ListUsers', 'iam:GetUser', 'iam:DeleteUser', 'iam:AttachUserPolicy', 'iam:DetachUserPolicy',
  'iam:PutUserPolicy', 'iam:DeleteUserPolicy',
  'iam:PutUserBoundary', 'iam:DeleteUserBoundary',
  'iam:GetCredentialReport', 'iam:GetAuditLog',
  // IAM - Evaluate
  'iam:EvaluatePolicy',
];

interface GroupDetailsProps {
  setActiveTab: (tab: IAMTab) => void;
  groupId?: string;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({ setActiveTab, groupId }) => {
  const { data: group, isLoading, isError, refetch } = useGroup(groupId || '');
  const { data: policies } = usePolicies();
  const { data: allUsers } = useUsers();

  const attachPolicyMutation = useAttachGroupPolicy();
  const detachPolicyMutation = useDetachGroupPolicy();
  const addMemberMutation = useAddGroupMember();
  const removeMemberMutation = useRemoveGroupMember();
  const deleteGroupMutation = useDeleteGroup();
  const putGroupPolicyMutation = usePutGroupPolicy();
  const deleteGroupPolicyMutation = useDeleteGroupPolicy();
  const updateGroupMutation = useUpdateGroup();

  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');

  const [isAttachDrawerOpen, setIsAttachDrawerOpen] = useState(false);
  const [selectedPolicyIdsToAttach, setSelectedPolicyIdsToAttach] = useState<string[]>([]);

  // Inline Policy States
  const [isInlineModalOpen, setIsInlineModalOpen] = useState(false);
  const [inlinePolicyName, setInlinePolicyName] = useState('');
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [inlineStatements, setInlineStatements] = useState<any[]>([
    { effect: 'Allow', actions: [], resource: '*' }
  ]);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isInlineSubmitting, setIsInlineSubmitting] = useState(false);
  const [inlinePolicyIdToEdit, setInlinePolicyIdToEdit] = useState<string | null>(null);
  const [actionSearch, setActionSearch] = useState('');
  const [policySearchTerm, setPolicySearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [selectedUserIdsToAdd, setSelectedUserIdsToAdd] = useState<string[]>([]);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Check if current logged in user is Root
  const [isCurrentUserRoot, setIsCurrentUserRoot] = useState(false);
  const [callerPermissions, setCallerPermissions] = useState<Record<string, { allowed: boolean }>>({});

  useEffect(() => {
    const userStr = localStorage.getItem('citadel_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setIsCurrentUserRoot(!!u.isRoot);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('citadel_user');
    if (!userStr) return;
    try {
      const u = JSON.parse(userStr);
      if (u.isRoot) return;

      api.post('/iam/evaluate/batch', {
        actions: [
          'iam:UpdateGroup',
          'iam:DeleteGroup',
          'iam:AddUserToGroup',
          'iam:RemoveUserFromGroup',
          'iam:AttachGroupPolicy',
          'iam:DetachGroupPolicy',
          'iam:PutGroupPolicy',
          'iam:DeleteGroupPolicy'
        ],
        resource: '*',
        userId: u.id
      }).then(({ data }) => {
        setCallerPermissions(data.data || {});
      }).catch(err => {
        console.error('Failed to fetch caller permissions in GroupDetails', err);
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const canUpdateGroup = isCurrentUserRoot || !!callerPermissions['iam:UpdateGroup']?.allowed;
  const canDeleteGroup = isCurrentUserRoot || !!callerPermissions['iam:DeleteGroup']?.allowed;
  const canAddMember = isCurrentUserRoot || !!callerPermissions['iam:AddUserToGroup']?.allowed;
  const canRemoveMember = isCurrentUserRoot || !!callerPermissions['iam:RemoveUserFromGroup']?.allowed;
  const canAttachPolicy = isCurrentUserRoot || !!callerPermissions['iam:AttachGroupPolicy']?.allowed;
  const canDetachPolicy = isCurrentUserRoot || !!callerPermissions['iam:DetachGroupPolicy']?.allowed;
  const canPutGroupPolicy = isCurrentUserRoot || !!callerPermissions['iam:PutGroupPolicy']?.allowed;

  if (!groupId) {
    return (
      <div className="p-6 md:p-10 flex flex-col gap-4 items-start">
        <button onClick={() => setActiveTab('groups')} className="text-sm text-blue-600 hover:underline">&larr; Back to Groups</button>
        <p className="text-zinc-500">No group selected.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-10 text-sm text-zinc-500">Loading group details...</div>;
  }

  if (isError || !group) {
    return <div className="p-10 text-sm text-red-500">Error loading group details.</div>;
  }

  const handleAttachPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPolicyIdsToAttach.length === 0) return;
    try {
      await Promise.all(
        selectedPolicyIdsToAttach.map(policyId =>
          attachPolicyMutation.mutateAsync({ groupId, policyId })
        )
      );
      setIsAttachDrawerOpen(false);
      setSelectedPolicyIdsToAttach([]);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to attach one or more policies');
      refetch();
    }
  };

  const handleDetachPolicy = async (policyId: string) => {
    try {
      await detachPolicyMutation.mutateAsync({ groupId, policyId });
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to detach policy');
    }
  };

  const handleOpenCreateInlineModal = () => {
    setInlinePolicyName('');
    setIsEditingInline(false);
    setInlinePolicyIdToEdit(null);
    setInlineStatements([{ effect: 'Allow', actions: [], resource: '*' }]);
    setInlineError(null);
    setIsInlineModalOpen(true);
  };

  const handleOpenEditInlineModal = async (p: any) => {
    try {
      const { data } = await api.get(`/iam/policies/${p.id}`);
      const policyDetails = data.data;
      
      setInlinePolicyName(p.name);
      setIsEditingInline(true);
      setInlinePolicyIdToEdit(p.id);
      
      const stmtList = policyDetails.statements?.statements || [];
      const mapped = stmtList.map((s: any) => ({
        effect: s.Effect,
        actions: s.Action,
        resource: s.Resource[0] || '*',
      }));
      
      setInlineStatements(mapped.length > 0 ? mapped : [{ effect: 'Allow', actions: [], resource: '*' }]);
      setInlineError(null);
      setIsInlineModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch policy details');
    }
  };

  const handleInlinePolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlinePolicyName.trim()) {
      setInlineError('Policy name is required.');
      return;
    }
    
    const hasEmptyActions = inlineStatements.some(s => s.actions.length === 0);
    if (hasEmptyActions) {
      setInlineError('Each statement must select at least one action.');
      return;
    }

    const payload = {
      statements: inlineStatements.map(s => ({
        Effect: s.effect,
        Action: s.actions,
        Resource: [s.resource],
      }))
    };

    setIsInlineSubmitting(true);
    setInlineError(null);
    try {
      await putGroupPolicyMutation.mutateAsync({
        groupId,
        policyName: inlinePolicyName.trim(),
        statements: payload
      });
      setIsInlineModalOpen(false);
      refetch();
    } catch (err: any) {
      setInlineError(err.response?.data?.message || 'Failed to save inline policy');
    } finally {
      setIsInlineSubmitting(false);
    }
  };

  const addInlineStatement = () => {
    setInlineStatements(prev => [...prev, { effect: 'Allow', actions: [], resource: '*' }]);
  };

  const removeInlineStatement = (idx: number) => {
    setInlineStatements(prev => prev.filter((_, i) => i !== idx));
  };

  const updateInlineStatement = (idx: number, field: 'effect' | 'resource', value: string) => {
    setInlineStatements(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      return { ...s, [field]: value };
    }));
  };

  const toggleActionInInlineStatement = (idx: number, actionName: string) => {
    setInlineStatements(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      const exists = s.actions.includes(actionName);
      const updatedActions = exists
        ? s.actions.filter((a: string) => a !== actionName)
        : [...s.actions, actionName];
      return { ...s, actions: updatedActions };
    }));
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIdsToAdd.length === 0) return;
    try {
      await Promise.all(
        selectedUserIdsToAdd.map(userId =>
          addMemberMutation.mutateAsync({ groupId, userId })
        )
      );
      setIsMemberDrawerOpen(false);
      setSelectedUserIdsToAdd([]);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add one or more users to group');
      refetch();
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMemberMutation.mutateAsync({ groupId, userId });
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove user from group');
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteGroupMutation.mutateAsync(groupId);
      setActiveTab('groups');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGroupName.trim()) return;
    try {
      await updateGroupMutation.mutateAsync({
        id: groupId,
        groupData: {
          name: editGroupName.trim(),
          description: editGroupDesc.trim() || undefined
        }
      });
      setIsEditingHeader(false);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update group');
    }
  };

  const attachedPolicies = (group as any).policies || [];
  const members = (group as any).members || [];

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in p-6 md:p-10 pb-24">

      {/* Breadcrumb & Header */}
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          {isEditingHeader ? (
            <form onSubmit={handleSaveHeader} className="flex flex-col gap-3 max-w-md mt-2 bg-white dark:bg-[#0a0a0a] p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-550">Edit Group Details</label>
              <input
                type="text"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans font-medium text-zinc-900 dark:text-white"
                placeholder="Group name"
                required
              />
              <textarea
                value={editGroupDesc}
                onChange={(e) => setEditGroupDesc(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 h-20 resize-none font-sans text-zinc-700 dark:text-zinc-350"
                placeholder="Group description (optional)"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updateGroupMutation.isPending}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingHeader(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('groups')}
                className="text-[12px] font-medium text-blue-600 dark:text-blue-400 hover:underline self-start"
              >
                &larr; Back to Groups
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  {group.name}
                </h1>
                {canUpdateGroup && (
                  <button
                    onClick={() => {
                      setEditGroupName(group.name);
                      setEditGroupDesc(group.description || '');
                      setIsEditingHeader(true);
                    }}
                    className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200"
                    title="Edit name & description"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
              {group.description && <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">{group.description}</p>}
            </div>
          )}
        </div>
        {canDeleteGroup && (
          <button
            onClick={() => setIsConfirmDeleteOpen(true)}
            className="px-4 py-2 text-[12px] font-semibold bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-md hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
          >
            Delete Group
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Attached Policies */}
        <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Attached Policies</h2>
            <div className="flex gap-2">
              {canPutGroupPolicy && (
                <button
                  onClick={handleOpenCreateInlineModal}
                  className="text-[11px] font-medium px-2.5 py-1 bg-purple-55 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors border border-purple-200 dark:border-purple-800/50"
                >
                  + Create Inline Policy
                </button>
              )}
              {canAttachPolicy && (
                <button
                  onClick={() => setIsAttachDrawerOpen(true)}
                  className="text-[11px] font-medium px-2.5 py-1 bg-zinc-150 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Attach Policy
                </button>
              )}
            </div>
          </div>

          {attachedPolicies.length === 0 ? (
            <p className="text-xs text-zinc-500">No identity policies attached to this group.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 rounded-md overflow-hidden">
              {attachedPolicies.map((p: any) => (
                <li key={p?.id || p?.policyId || Math.random()} className="p-3 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/20">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100 font-mono">{p?.name || p?.policy?.name || 'Unknown Policy'}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                      p?.type === 'INLINE'
                        ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800/50'
                        : 'bg-zinc-100 text-zinc-650 border-zinc-200 dark:bg-zinc-850 dark:text-zinc-400 dark:border-zinc-700'
                    }`}>
                      {p?.type || 'MANAGED'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {p?.type === 'INLINE' && canPutGroupPolicy && (
                      <button
                        onClick={() => handleOpenEditInlineModal(p)}
                        className="text-[11px] text-blue-655 hover:underline font-semibold"
                      >
                        Edit
                      </button>
                    )}
                    {canDetachPolicy && (
                      <button
                        onClick={() => handleDetachPolicy(p?.id || p?.policyId)}
                        className="text-[11px] text-red-655 hover:underline font-semibold"
                      >
                        Detach
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Group Members */}
        <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Group Members</h2>
            {canAddMember && (
              <button
                onClick={() => setIsMemberDrawerOpen(true)}
                className="text-[11px] font-medium px-2.5 py-1 bg-zinc-150 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Add Member
              </button>
            )}
          </div>

          {members.length === 0 ? (
            <p className="text-xs text-zinc-500">No users in this group.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 rounded-md overflow-hidden">
              {members.map((m: any) => (
                <li key={m?.id} className="p-3 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/20">
                  <span className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100">{m?.name || m?.email}</span>
                  {canRemoveMember && (
                    <button
                      onClick={() => handleRemoveMember(m?.id)}
                      className="text-[11px] text-red-655 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Attach Policy Modal */}
      <Modal isOpen={isAttachDrawerOpen} onClose={() => setIsAttachDrawerOpen(false)} title="Attach Policy to Group">
        <form onSubmit={handleAttachPolicy} className="flex flex-col h-full">
          <div className="flex-grow flex flex-col gap-1.5 min-h-[240px]">
            <label className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Select Identity Policies</label>
            <SearchableMultiSelect
              options={policies?.map((p: any) => ({ id: p.id, name: p.name })) || []}
              value={selectedPolicyIdsToAttach}
              onChange={setSelectedPolicyIdsToAttach}
              placeholder="-- Choose policies --"
              searchPlaceholder="Search policies..."
            />
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 shrink-0">
            <button 
              type="button" 
              onClick={() => setIsAttachDrawerOpen(false)}
              className="px-4 py-2 text-[12px] font-medium text-zinc-655"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={attachPolicyMutation.isPending || selectedPolicyIdsToAttach.length === 0}
              className="px-4 py-2 text-[12px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50"
            >
              {attachPolicyMutation.isPending ? 'Attaching...' : 'Attach policies'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={isMemberDrawerOpen} onClose={() => setIsMemberDrawerOpen(false)} title="Add Users to Group">
        <form onSubmit={handleAddMember} className="flex flex-col h-full">
          <div className="flex-grow flex flex-col gap-1.5 min-h-[240px]">
            <label className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Select Users</label>
            <SearchableMultiSelect
              options={allUsers?.map((u: any) => ({ id: u.id, name: u.name || u.email })) || []}
              value={selectedUserIdsToAdd}
              onChange={setSelectedUserIdsToAdd}
              placeholder="-- Choose users --"
              searchPlaceholder="Search users..."
            />
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 shrink-0">
            <button 
              type="button" 
              onClick={() => setIsMemberDrawerOpen(false)}
              className="px-4 py-2 text-[12px] font-medium text-zinc-655"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={addMemberMutation.isPending || selectedUserIdsToAdd.length === 0}
              className="px-4 py-2 text-[12px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50"
            >
              {addMemberMutation.isPending ? 'Adding...' : 'Add users'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Group Modal */}
      <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Delete Group">
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
            Are you sure you want to permanently delete the group <strong>{group.name}</strong>? This action cannot be undone.
          </p>
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 shrink-0">
            <button 
              type="button" 
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="px-4 py-2 text-[12px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleDeleteGroup}
              disabled={deleteGroupMutation.isPending}
              className="px-4 py-2 text-[12px] font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50 transition-colors"
            >
              {deleteGroupMutation.isPending ? 'Deleting...' : 'Yes, delete group'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Inline Policy Editor Modal */}
      <Modal isOpen={isInlineModalOpen} onClose={() => setIsInlineModalOpen(false)} title={isEditingInline ? `Edit Inline Policy: ${inlinePolicyName}` : "Create Inline Policy"}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          
          {/* Left Column: Form Builder */}
          <form onSubmit={handleInlinePolicySubmit} className="lg:col-span-7 flex flex-col max-h-[68vh]">
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 pb-2">
              {inlineError && (
                <p className="text-[12px] text-red-655 bg-red-500/10 border border-red-500/20 p-2.5 rounded-md font-medium leading-relaxed">
                  {inlineError}
                </p>
              )}
              <div className="flex flex-col gap-1.5 shrink-0">
                <label className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-350">Policy Name</label>
                <input
                  type="text"
                  required
                  disabled={isEditingInline}
                  value={inlinePolicyName}
                  onChange={(e) => setInlinePolicyName(e.target.value)}
                  placeholder="e.g. MyInlinePolicy"
                  className="w-full h-[36px] px-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all disabled:opacity-55"
                />
              </div>

              <div className="flex flex-col gap-3.5 mt-2">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-355">Policy Statements</span>
                  <button
                    type="button"
                    onClick={addInlineStatement}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700/50"
                  >
                    + Add Statement
                  </button>
                </div>

                {inlineStatements.map((s, idx) => (
                  <div 
                    key={idx} 
                    className="bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-md border border-zinc-200 dark:border-zinc-800 flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">Statement #{idx + 1}</span>
                      {inlineStatements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInlineStatement(idx)}
                          className="text-[10px] font-semibold text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Effect Toggle */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">Effect</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateInlineStatement(idx, 'effect', 'Allow')}
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded transition-colors ${
                            s.effect === 'Allow'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-755'
                          }`}
                        >
                          ALLOW
                        </button>
                        <button
                          type="button"
                          onClick={() => updateInlineStatement(idx, 'effect', 'Deny')}
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded transition-colors ${
                            s.effect === 'Deny'
                              ? 'bg-rose-600 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-655 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-755'
                          }`}
                        >
                          DENY
                        </button>
                      </div>
                    </div>

                    {/* Actions Tag Selector */}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">Actions</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white select-none">
                            <input
                              type="checkbox"
                              checked={s.actions.length === ALL_AVAILABLE_ACTIONS.length}
                              onChange={(e) => {
                                const shouldSelectAll = e.target.checked;
                                setInlineStatements(prev => prev.map((stmt, i) => {
                                  if (i !== idx) return stmt;
                                  return { ...stmt, actions: shouldSelectAll ? ALL_AVAILABLE_ACTIONS : [] };
                                }));
                              }}
                              className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer w-3 h-3 text-blue-655"
                            />
                            Select All
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Filter actions..."
                          value={actionSearch}
                          onChange={(e) => setActionSearch(e.target.value)}
                          className="w-full h-[28px] px-2 text-[11px] bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 transition-colors"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto p-2 bg-zinc-100 dark:bg-[#050505] border border-zinc-200 dark:border-zinc-800 rounded">
                        {ALL_AVAILABLE_ACTIONS.filter(act => act.toLowerCase().includes(actionSearch.toLowerCase())).map(act => {
                          const isSelected = s.actions.includes(act);
                          return (
                            <button
                              key={act}
                              type="button"
                              onClick={() => toggleActionInInlineStatement(idx, act)}
                              className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                                isSelected
                                  ? 'bg-blue-500/10 border-blue-500 text-blue-655 dark:text-blue-400'
                                  : 'bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                              }`}
                            >
                              {act}
                            </button>
                          );
                        })}
                        {ALL_AVAILABLE_ACTIONS.filter(act => act.toLowerCase().includes(actionSearch.toLowerCase())).length === 0 && (
                          <span className="text-[11px] text-zinc-500 p-1">No actions match search filter</span>
                        )}
                      </div>
                    </div>

                    {/* Resource Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">Resource</label>
                      <input
                        type="text"
                        required
                        disabled
                        value={s.resource}
                        onChange={(e) => updateInlineStatement(idx, 'resource', e.target.value)}
                        placeholder="*"
                        className="w-full h-[32px] px-3 text-[12px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-855 rounded-md text-zinc-500 placeholder-zinc-400 focus:outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2 shrink-0 bg-white dark:bg-[#050505]">
              <button 
                type="button"
                onClick={() => setIsInlineModalOpen(false)}
                className="px-4 py-2 text-[12px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isInlineSubmitting}
                className="px-4 py-2 text-[12px] font-medium bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm disabled:opacity-40"
              >
                {isInlineSubmitting ? 'Saving...' : 'Save Policy'}
              </button>
            </div>
          </form>

          {/* Right Column: Live JSON Preview */}
          <div className="lg:col-span-5 flex flex-col gap-3 max-h-[68vh] min-w-0">
            <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-350">Live JSON Preview</span>
            <div className="flex-1 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-emerald-400 p-4 rounded-md border border-zinc-200 dark:border-zinc-800 overflow-y-auto overflow-x-auto text-[11px] font-mono leading-relaxed h-full min-h-[300px]">
              <pre>{JSON.stringify({
                statements: inlineStatements.map(s => ({
                  Effect: s.effect,
                  Action: s.actions,
                  Resource: [s.resource.trim() || '*']
                }))
              }, null, 2)}</pre>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal select-none">
              This document dynamically matches the statements you build on the left.
            </span>
          </div>

        </div>
      </Modal>

    </div>
  );
};

export default GroupDetails;
