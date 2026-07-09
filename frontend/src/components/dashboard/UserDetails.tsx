import React, { useState, useEffect } from 'react';
import { useUser, useAttachPolicy, useDetachPolicy, usePutBoundary, useDeleteBoundary, usePutUserPolicy, useDeleteUserPolicy } from '../../hooks/useUsers';
import { usePolicies } from '../../hooks/usePolicies';
import { useGroups } from '../../hooks/useGroups';
import { Modal } from '../ui/Modal';
import { SearchableSelect } from '../ui/SearchableSelect';
import { SearchableMultiSelect } from '../ui/SearchableMultiSelect';
import type { IAMTab } from './Sidebar';
import { api } from '../../lib/axios';

interface UserDetailsProps {
  setActiveTab: (tab: IAMTab) => void;
  userId?: string;
}

// All 34 official actions from the spec — grouped by namespace for the Effective Permissions Summary
const ACTION_GROUPS = [
  {
    namespace: 'Reports',
    actions: ['reports:List', 'reports:Read', 'reports:Create', 'reports:Update', 'reports:Delete']
  },
  {
    namespace: 'Alerts',
    actions: ['alerts:List', 'alerts:Read', 'alerts:Create', 'alerts:Acknowledge', 'alerts:Delete']
  },
  {
    namespace: 'Settings',
    actions: ['settings:Read', 'settings:Update']
  },
  {
    namespace: 'Audit',
    actions: ['audit:List', 'audit:Read']
  },
  {
    namespace: 'IAM - Policies',
    actions: ['iam:ListPolicies', 'iam:GetPolicy', 'iam:CreatePolicy', 'iam:UpdatePolicy', 'iam:DeletePolicy']
  },
  {
    namespace: 'IAM - Groups',
    actions: [
      'iam:ListGroups', 'iam:GetGroup', 'iam:CreateGroup', 'iam:UpdateGroup', 'iam:DeleteGroup',
      'iam:AddUserToGroup', 'iam:RemoveUserFromGroup', 'iam:AttachGroupPolicy', 'iam:DetachGroupPolicy',
      'iam:PutGroupPolicy', 'iam:DeleteGroupPolicy'
    ]
  },
  {
    namespace: 'IAM - Users',
    actions: [
      'iam:ListUsers', 'iam:GetUser', 'iam:DeleteUser', 'iam:AttachUserPolicy', 'iam:DetachUserPolicy',
      'iam:PutUserPolicy', 'iam:DeleteUserPolicy', 'iam:PutUserBoundary', 'iam:DeleteUserBoundary',
      'iam:GetCredentialReport', 'iam:GetAuditLog'
    ]
  },
  {
    namespace: 'IAM - Evaluate',
    actions: ['iam:EvaluatePolicy']
  }
];

const ALL_AVAILABLE_ACTIONS = ACTION_GROUPS.flatMap(g => g.actions);


const UserDetails: React.FC<UserDetailsProps> = ({ setActiveTab, userId }) => {
  const { data: user, isLoading, isError, refetch } = useUser(userId || '');
  const { data: policies } = usePolicies();

  const attachPolicyMutation = useAttachPolicy();
  const detachPolicyMutation = useDetachPolicy();
  const putBoundaryMutation = usePutBoundary();
  const deleteBoundaryMutation = useDeleteBoundary();
  const putUserPolicyMutation = usePutUserPolicy();
  const deleteUserPolicyMutation = useDeleteUserPolicy();

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
  const [actionSearch, setActionSearch] = useState('');
  const [policySearchTerm, setPolicySearchTerm] = useState('');
  const [boundarySearchTerm, setBoundarySearchTerm] = useState('');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');

  const { data: allGroups } = useGroups();
  const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);
  const [selectedGroupIdsToAdd, setSelectedGroupIdsToAdd] = useState<string[]>([]);
  const [isGroupSubmitting, setIsGroupSubmitting] = useState(false);

  // Boundary selector states
  const [isBoundaryDrawerOpen, setIsBoundaryDrawerOpen] = useState(false);
  const [selectedBoundaryId, setSelectedBoundaryId] = useState('');

  // Effective permissions resolved states
  const [resolvedPermissions, setResolvedPermissions] = useState<Record<string, { allowed: boolean; reason: string; source?: string }>>({});
  const [evaluatingPermissions, setEvaluatingPermissions] = useState(false);

  // Check if current logged in user is Root
  const [isCurrentUserRoot, setIsCurrentUserRoot] = useState(false);

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

  const [callerPermissions, setCallerPermissions] = useState<Record<string, { allowed: boolean }>>({});

  useEffect(() => {
    const userStr = localStorage.getItem('citadel_user');
    if (!userStr) return;
    try {
      const u = JSON.parse(userStr);
      if (u.isRoot) return;

      api.post('/iam/evaluate/batch', {
        actions: [
          'iam:AttachUserPolicy',
          'iam:DetachUserPolicy',
          'iam:PutUserPolicy',
          'iam:DeleteUserPolicy',
          'iam:PutUserBoundary',
          'iam:DeleteUserBoundary',
          'iam:AddUserToGroup',
          'iam:RemoveUserFromGroup'
        ],
        resource: '*',
        userId: u.id
      }).then(({ data }) => {
        setCallerPermissions(data.data || {});
      }).catch(err => {
        console.error('Failed to fetch caller permissions', err);
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const canSetBoundary = isCurrentUserRoot || !!callerPermissions['iam:PutUserBoundary']?.allowed;
  const canDeleteBoundary = isCurrentUserRoot || !!callerPermissions['iam:DeleteUserBoundary']?.allowed;
  const canAttachPolicy = isCurrentUserRoot || !!callerPermissions['iam:AttachUserPolicy']?.allowed;
  const canDetachPolicy = isCurrentUserRoot || !!callerPermissions['iam:DetachUserPolicy']?.allowed;
  const canPutUserPolicy = isCurrentUserRoot || !!callerPermissions['iam:PutUserPolicy']?.allowed;
  const canAddGroup = isCurrentUserRoot || !!callerPermissions['iam:AddUserToGroup']?.allowed;
  const canRemoveGroup = isCurrentUserRoot || !!callerPermissions['iam:RemoveUserFromGroup']?.allowed;

  // Compute effective permissions by calling evaluate endpoints for each action
  useEffect(() => {
    if (!userId || !user) return;

    const evaluateAll = async () => {
      setEvaluatingPermissions(true);

      const allActionsList = ACTION_GROUPS.flatMap(g => g.actions);

      // Evaluate permissions via batch endpoint
      try {
        const { data } = await api.post('/iam/evaluate/batch', {
          actions: allActionsList,
          resource: '*',
          userId
        });

        // data.data contains Record<string, { allowed, reason, source }>
        setResolvedPermissions(data.data);
      } catch (e) {
        console.error('Batch evaluation failed', e);
        // Fallback or handle error
        const fallbackResults: Record<string, any> = {};
        for (const action of allActionsList) {
          fallbackResults[action] = { allowed: false, reason: 'Evaluation Error' };
        }
        setResolvedPermissions(fallbackResults);
      }
      setEvaluatingPermissions(false);
    };

    evaluateAll();
  }, [userId, user, attachPolicyMutation.isSuccess, detachPolicyMutation.isSuccess, putBoundaryMutation.isSuccess, deleteBoundaryMutation.isSuccess, putUserPolicyMutation.isSuccess, deleteUserPolicyMutation.isSuccess]);

  if (!userId) {
    return (
      <div className="p-6 md:p-10 flex flex-col gap-4 items-start">
        <button onClick={() => setActiveTab('users')} className="text-sm text-blue-600 hover:underline">&larr; Back to Users</button>
        <p className="text-zinc-500">No user selected.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-10 text-sm text-zinc-500">Loading user details...</div>;
  }

  if (isError || !user) {
    return <div className="p-10 text-sm text-red-500">Error loading user details.</div>;
  }

  const handleAttachPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPolicyIdsToAttach.length === 0) return;
    try {
      await Promise.all(
        selectedPolicyIdsToAttach.map(policyId =>
          attachPolicyMutation.mutateAsync({ userId: userId || '', policyId })
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
      await detachPolicyMutation.mutateAsync({ userId, policyId });
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to detach policy');
    }
  };


  const handleOpenCreateInlineModal = () => {
    setInlinePolicyName('');
    setIsEditingInline(false);
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
      await putUserPolicyMutation.mutateAsync({
        userId,
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

  const handlePutBoundary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoundaryId) return;
    try {
      await putBoundaryMutation.mutateAsync({ userId, policyId: selectedBoundaryId });
      setIsBoundaryDrawerOpen(false);
      setSelectedBoundaryId('');
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to set permissions boundary');
    }
  };

  const handleDeleteBoundary = async () => {
    try {
      await deleteBoundaryMutation.mutateAsync(userId);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove permissions boundary');
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroupIdsToAdd.length === 0 || !userId) return;
    setIsGroupSubmitting(true);
    try {
      await Promise.all(
        selectedGroupIdsToAdd.map(groupId =>
          api.post(`/iam/groups/${groupId}/members`, { userId })
        )
      );
      setIsGroupDrawerOpen(false);
      setSelectedGroupIdsToAdd([]);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add user to one or more groups');
      refetch();
    } finally {
      setIsGroupSubmitting(false);
    }
  };

  const handleRemoveGroup = async (groupId: string) => {
    try {
      await api.delete(`/iam/groups/${groupId}/members/${userId}`);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove user from group');
    }
  };

  const attachedPolicies = (user as any).policies || [];
  const groups = (user as any).groups || [];
  const permissionBoundary = (user as any).boundary || null;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in p-6 md:p-10 pb-24">

      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className="text-[12px] font-medium text-blue-600 dark:text-blue-400 hover:underline self-start"
        >
          &larr; Back to Users
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            {user.name || user.email}
          </h1>
          {user.name && <p className="text-[13px] font-mono text-zinc-500 dark:text-zinc-400 mt-1">{user.email}</p>}
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
            User details, group memberships, policies, and permissions boundary configuration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Attached Policies */}
        <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Attached Policies</h2>
            <div className="flex gap-2">
              {canPutUserPolicy && (
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
            <p className="text-xs text-zinc-500">No identity policies attached directly.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 rounded-md overflow-hidden">
              {attachedPolicies.map((p: any) => (
                <li key={p?.id || p?.policyId || Math.random()} className="p-3 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/20">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100 font-mono">{p?.name || p?.policy?.name || 'Unknown Policy'}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                      p?.type === 'INLINE'
                        ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800/50'
                        : 'bg-zinc-100 text-zinc-650 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                    }`}>
                      {p?.type || 'MANAGED'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {p?.type === 'INLINE' && canPutUserPolicy && (
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

        {/* Group Memberships */}
        <div className="p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Group Memberships</h2>
            {canAddGroup && (
              <button
                onClick={() => setIsGroupDrawerOpen(true)}
                className="text-[11px] font-medium px-2.5 py-1 bg-zinc-150 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Add to Group
              </button>
            )}
          </div>
          {groups.length === 0 ? (
            <p className="text-xs text-zinc-500 font-medium">Not a member of any user groups.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {groups.map((g: any) => (
                <li key={g?.id || Math.random()} className="text-[12px] px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md font-medium border border-blue-100 dark:border-blue-800/50 flex items-center gap-2">
                  {g?.name || 'Unknown Group'}
                  {canRemoveGroup && (
                    <button
                      onClick={() => handleRemoveGroup(g?.id)}
                      className="text-blue-700/60 hover:text-blue-900 dark:text-blue-400/60 dark:hover:text-blue-300 ml-1"
                      title="Remove from group"
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Boundary Section */}
        {isCurrentUserRoot && (
          <div className="lg:col-span-2 p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>

            <div className="flex justify-between items-start pl-2">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Permissions Boundary</h2>
                <p className="text-xs text-zinc-500 mt-1 max-w-xl">
                  A permissions boundary sets the maximum permissions that identity policies can grant.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {permissionBoundary ? (
                  <>
                    {canDeleteBoundary && (
                      <button
                        onClick={handleDeleteBoundary}
                        className="text-[11px] font-semibold px-2.5 py-1 border border-red-200 dark:border-red-900/50 text-red-655 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        Delete Boundary
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {canSetBoundary && (
                      <button
                        onClick={() => setIsBoundaryDrawerOpen(true)}
                        className="text-[11px] font-semibold px-2.5 py-1 bg-zinc-150 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      >
                        Set Boundary
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="ml-2 mt-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Visual Formula block */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-850 flex flex-col justify-center items-center text-center font-mono text-[11px] text-zinc-550">
                <span className="font-semibold text-zinc-800 dark:text-zinc-350">Effective Permissions Model</span>
                <div className="flex items-center gap-2 mt-3 select-none">
                  <span className="px-2 py-1 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded">Identity Policies</span>
                  <span className="font-bold text-base">∩</span>
                  <span className={`px-2 py-1 border border-zinc-200 dark:border-zinc-800 rounded ${permissionBoundary ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-600 border-amber-300' : 'bg-white dark:bg-black text-zinc-400'}`}>Boundary</span>
                  <span className="font-bold text-base">=</span>
                  <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-300 rounded font-bold">Effective Model</span>
                </div>
              </div>

              <div className="p-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md">
                {permissionBoundary ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-mono text-amber-600 dark:text-amber-400 font-bold">{permissionBoundary.name}</span>
                    <p className="text-[11px] text-zinc-500">
                      A permissions boundary cap is active on this user.
                    </p>
                  </div>
                ) : (
                  <p className="text-[12px] text-zinc-500 italic">No permissions boundary is set. The user can perform all allowed identity actions.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Effective Permissions Summary with reasons */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Effective Permissions Summary</h2>
            <p className="text-xs text-zinc-500 mt-1">
              List of resolved explicit allowed and denied states across namespaces.
            </p>
          </div>

          {evaluatingPermissions ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-medium">Resolving authorization matrix...</div>
          ) : (
            <div className="flex flex-col gap-6">
              {ACTION_GROUPS.map((group) => (
                <div key={group.namespace} className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">{group.namespace}</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.actions.map(action => {
                      const res = resolvedPermissions[action] || { allowed: false, reason: 'Implicitly Denied' };
                      return (
                        <div key={action} className="p-3 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-850 rounded flex flex-col gap-1 text-left font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">{action}</span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${res.allowed
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border border-emerald-200'
                                : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-450 border border-red-200'
                              }`}>
                              {res.allowed ? 'Allow' : 'Deny'}
                            </span>
                          </div>
                          <span className="text-[9px] text-zinc-500 dark:text-zinc-400">
                            Reason: {res.reason} {res.source && `(${res.source.replace(/^inline-user-[0-9a-f-]+-/i, '')})`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Attach Policy Modal */}
      <Modal isOpen={isAttachDrawerOpen} onClose={() => setIsAttachDrawerOpen(false)} title="Attach Policy">
        <form onSubmit={handleAttachPolicy} className="flex flex-col h-full">
          <div className="flex-grow flex flex-col gap-3 pb-[160px]">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Select Identity Policies</label>
              <SearchableMultiSelect
                options={policies?.filter((p: any) => p.type === 'MANAGED').map((p: any) => ({ id: p.id, name: p.name })) || []}
                value={selectedPolicyIdsToAttach}
                onChange={setSelectedPolicyIdsToAttach}
                placeholder="-- Choose policies --"
                searchPlaceholder="Search policies..."
              />
            </div>
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

      {/* Set Boundary Modal */}
      <Modal isOpen={isBoundaryDrawerOpen} onClose={() => setIsBoundaryDrawerOpen(false)} title="Set Permissions Boundary">
        <form onSubmit={handlePutBoundary} className="flex flex-col h-full">
          <div className="flex-grow flex flex-col gap-1.5 pb-[160px]">
            <label className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Select Boundary Policy</label>
            <SearchableSelect
              options={policies?.filter((p: any) => p.type === 'MANAGED').map((p: any) => ({ id: p.id, name: p.name })) || []}
              value={selectedBoundaryId}
              onChange={setSelectedBoundaryId}
              placeholder="-- Choose boundary policy --"
              searchPlaceholder="Search boundary policies..."
            />
            <p className="text-[11px] text-zinc-505 mt-1.5">Boundaries limit the user's maximum permissions. Standard identity policies cannot exceed this cap.</p>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsBoundaryDrawerOpen(false)}
              className="px-4 py-2 text-[12px] font-medium text-zinc-655"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={putBoundaryMutation.isPending || !selectedBoundaryId}
              className="px-4 py-2 text-[12px] font-semibold bg-amber-500 hover:bg-amber-600 text-black rounded-md disabled:opacity-50"
            >
              {putBoundaryMutation.isPending ? 'Setting...' : 'Set Boundary'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add to Group Modal */}
      <Modal isOpen={isGroupDrawerOpen} onClose={() => setIsGroupDrawerOpen(false)} title="Add User to Group">
        <form onSubmit={handleAddGroup} className="flex flex-col h-full">
          <div className="flex-grow flex flex-col gap-1.5 pb-[160px]">
            <label className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Select User Groups</label>
            <SearchableMultiSelect
              options={allGroups?.map((g: any) => ({ id: g.id, name: g.name })) || []}
              value={selectedGroupIdsToAdd}
              onChange={setSelectedGroupIdsToAdd}
              placeholder="-- Choose user groups --"
              searchPlaceholder="Search groups..."
            />
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsGroupDrawerOpen(false)}
              className="px-4 py-2 text-[12px] font-medium text-zinc-655"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGroupSubmitting || selectedGroupIdsToAdd.length === 0}
              className="px-4 py-2 text-[12px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50"
            >
              {isGroupSubmitting ? 'Adding...' : 'Add to groups'}
            </button>
          </div>
        </form>
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
                              className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer w-3 h-3 text-blue-650"
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
                        className="w-full h-[32px] px-3 text-[12px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-850 rounded-md text-zinc-500 placeholder-zinc-400 focus:outline-none transition-all font-mono"
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

export default UserDetails;
