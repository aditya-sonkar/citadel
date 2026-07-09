import React, { useState } from 'react';
import { usePolicies, useDeletePolicy, useCreatePolicy, useUpdatePolicy } from '../../hooks/usePolicies';
import { AccessDeniedState } from '../ui/AccessDeniedState';
import { Modal } from '../ui/Modal';
import { api } from '../../lib/axios';

// Exact 34 official action strings per the assessment spec
const ALL_AVAILABLE_ACTIONS = [
  // Reports (5)
  'reports:List', 'reports:Read', 'reports:Create', 'reports:Update', 'reports:Delete',
  // Alerts (5)
  'alerts:List', 'alerts:Read', 'alerts:Create', 'alerts:Acknowledge', 'alerts:Delete',
  // Settings (2)
  'settings:Read', 'settings:Update',
  // Audit (2)
  'audit:List', 'audit:Read',
  // IAM - Policies (5)
  'iam:ListPolicies', 'iam:GetPolicy', 'iam:CreatePolicy', 'iam:UpdatePolicy', 'iam:DeletePolicy',
  // IAM - Groups (11)
  'iam:ListGroups', 'iam:GetGroup', 'iam:CreateGroup', 'iam:UpdateGroup', 'iam:DeleteGroup',
  'iam:AddUserToGroup', 'iam:RemoveUserFromGroup', 'iam:AttachGroupPolicy', 'iam:DetachGroupPolicy',
  'iam:PutGroupPolicy', 'iam:DeleteGroupPolicy',
  // IAM - Users (10)
  'iam:ListUsers', 'iam:GetUser', 'iam:DeleteUser', 'iam:AttachUserPolicy', 'iam:DetachUserPolicy',
  'iam:PutUserPolicy', 'iam:DeleteUserPolicy', 'iam:PutUserBoundary', 'iam:DeleteUserBoundary',
  'iam:GetCredentialReport', 'iam:GetAuditLog',
  // IAM - Evaluate (1)
  'iam:EvaluatePolicy',
];

interface StatementInput {
  effect: 'Allow' | 'Deny';
  actions: string[];
  resource: string;
}

interface PoliciesViewProps {
  isRoot?: boolean;
}

const PoliciesView: React.FC<PoliciesViewProps> = ({ isRoot }) => {
  const { data: policies, isLoading, isError } = usePolicies();
  const deletePolicyMutation = useDeletePolicy();
  const createPolicyMutation = useCreatePolicy();
  const updatePolicyMutation = useUpdatePolicy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTargets, setDeleteTargets] = useState<{ id: string; name: string }[] | null>(null);
  const [confirmText, setConfirmText] = useState('');

  // Create Policy state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPolicyDesc, setNewPolicyDesc] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Structured Statement Builder state (Create)
  const [statements, setStatements] = useState<StatementInput[]>([
    { effect: 'Allow', actions: [], resource: '*' }
  ]);

  // Manage / Edit Policy state
  const [editingPolicy, setEditingPolicy] = useState<{ id: string; name: string; description?: string; statements: any; type: string } | null>(null);
  const [editPolicyName, setEditPolicyName] = useState('');
  const [editPolicyDesc, setEditPolicyDesc] = useState('');
  const [editStatements, setEditStatements] = useState<StatementInput[]>([]);
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSearch, setActionSearch] = useState('');
  const [editActionSearch, setEditActionSearch] = useState('');

  const addStatement = () => {
    setStatements(prev => [...prev, { effect: 'Allow', actions: [], resource: '*' }]);
  };

  const removeStatement = (idx: number) => {
    setStatements(prev => prev.filter((_, i) => i !== idx));
  };

  const updateStatement = (idx: number, field: 'effect' | 'resource', value: string) => {
    setStatements(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      return { ...s, [field]: value };
    }));
  };

  const toggleActionInStatement = (idx: number, actionName: string) => {
    setStatements(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      const exists = s.actions.includes(actionName);
      const updatedActions = exists
        ? s.actions.filter(a => a !== actionName)
        : [...s.actions, actionName];
      return { ...s, actions: updatedActions };
    }));
  };

  const selectAllActionsInStatement = (idx: number) => {
    setStatements(prev => prev.map((s, i) =>
      i === idx ? { ...s, actions: [...ALL_AVAILABLE_ACTIONS] } : s
    ));
  };

  const deselectAllActionsInStatement = (idx: number) => {
    setStatements(prev => prev.map((s, i) =>
      i === idx ? { ...s, actions: [] } : s
    ));
  };

  // Edit statements handlers
  const addEditStatement = () => {
    setEditStatements(prev => [...prev, { effect: 'Allow', actions: [], resource: '*' }]);
  };

  const removeEditStatement = (idx: number) => {
    setEditStatements(prev => prev.filter((_, i) => i !== idx));
  };

  const updateEditStatement = (idx: number, field: 'effect' | 'resource', value: string) => {
    setEditStatements(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      return { ...s, [field]: value };
    }));
  };

  const toggleActionInEditStatement = (idx: number, actionName: string) => {
    setEditStatements(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      const exists = s.actions.includes(actionName);
      const updatedActions = exists
        ? s.actions.filter(a => a !== actionName)
        : [...s.actions, actionName];
      return { ...s, actions: updatedActions };
    }));
  };

  const selectAllActionsInEditStatement = (idx: number) => {
    setEditStatements(prev => prev.map((s, i) =>
      i === idx ? { ...s, actions: [...ALL_AVAILABLE_ACTIONS] } : s
    ));
  };

  const deselectAllActionsInEditStatement = (idx: number) => {
    setEditStatements(prev => prev.map((s, i) =>
      i === idx ? { ...s, actions: [] } : s
    ));
  };

  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const handleOpenEditModal = async (p: any) => {
    try {
      setIsFetchingDetails(true);
      const { data } = await api.get(`/iam/policies/${p.id}`);
      const fullPolicy = data.data;

      setEditingPolicy(fullPolicy);
      setEditPolicyName(fullPolicy.name);
      setEditPolicyDesc(fullPolicy.description || '');
      
      const parsed = fullPolicy.statements?.statements?.map((s: any) => ({
        effect: s.Effect || 'Allow',
        actions: s.Action || [],
        resource: Array.isArray(s.Resource) ? s.Resource[0] : s.Resource || '*'
      })) || [{ effect: 'Allow', actions: [], resource: '*' }];
      
      setEditStatements(parsed);
      setEditError(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch policy details. Make sure you have the iam:GetPolicy permission.');
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const filteredPolicies = policies?.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredPolicies.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectPolicy = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(policyId => policyId !== id));
    }
  };

  const handleCreatePolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyName.trim()) return;

    const invalidStatement = statements.find(s => s.actions.length === 0);
    if (invalidStatement) {
      setCreateError('Please select at least one Action for every statement.');
      return;
    }

    setCreateError(null);
    setIsCreating(true);

    try {
      const formattedStatements = statements.map(s => ({
        Effect: s.effect,
        Action: s.actions,
        Resource: [s.resource.trim() || '*']
      }));

      await createPolicyMutation.mutateAsync({
        name: newPolicyName.trim(),
        description: newPolicyDesc.trim() || undefined,
        type: 'MANAGED',
        statements: {
          statements: formattedStatements
        },
      });

      setIsCreateModalOpen(false);
      setNewPolicyName('');
      setNewPolicyDesc('');
      setStatements([{ effect: 'Allow', actions: [], resource: '*' }]);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create policy.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy || !editPolicyName.trim()) return;

    const invalidStatement = editStatements.find(s => s.actions.length === 0);
    if (invalidStatement) {
      setEditError('Please select at least one Action for every statement.');
      return;
    }

    setEditError(null);
    setIsUpdating(true);

    try {
      const formattedStatements = editStatements.map(s => ({
        Effect: s.effect,
        Action: s.actions,
        Resource: [s.resource.trim() || '*']
      }));

      await updatePolicyMutation.mutateAsync({
        id: editingPolicy.id,
        policyData: {
          name: editPolicyName.trim(),
          description: editPolicyDesc.trim() || undefined,
          statements: {
            statements: formattedStatements
          }
        }
      });

      setEditingPolicy(null);
    } catch (err: any) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update policy.');
    } finally {
      setIsUpdating(false);
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
            Policies
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
            Define system authorization using JSON documents outlining effects, actions, and resources.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            disabled={selectedIds.length === 0}
            onClick={() => {
              const targets = filteredPolicies
                .filter(p => selectedIds.includes(p.id))
                .map(p => ({ id: p.id, name: p.name }));
              setDeleteTargets(targets);
            }}
            className="px-3 py-1.5 text-[12px] font-medium bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 text-red-650 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Delete
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 text-[12px] font-medium bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
          >
            Create policy
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Search policies..."
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
                    checked={selectedIds.length > 0 && selectedIds.length === filteredPolicies.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Policy name</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Description</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center">Type</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-right">Creation time</th>
                <th className="py-2.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {filteredPolicies.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-[12px] text-zinc-500">
                    No policies found.
                  </td>
                </tr>
              )}
              {filteredPolicies.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                  <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer"
                      checked={selectedIds.includes(p.id)}
                      onChange={(e) => handleSelectPolicy(p.id, e.target.checked)}
                    />
                  </td>
                  <td
                    onClick={() => handleOpenEditModal(p)}
                    className="py-2.5 px-4 cursor-pointer"
                  >
                    <span className="text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      {p.name}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[12px] text-zinc-500 dark:text-zinc-400 max-w-[340px] truncate">
                    {p.description || <span className="text-zinc-400 dark:text-zinc-600">No description</span>}
                  </td>
                  <td className="py-2.5 px-4 text-[12px] text-zinc-500 dark:text-zinc-400 text-center">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      p.type === 'MANAGED'
                        ? 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-450 border-zinc-200 dark:border-zinc-700'
                    }`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-[12px] text-zinc-500 dark:text-zinc-400">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(p); }}
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

      {/* Create Policy Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setCreateError(null); }} title="Create Policy">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          
          {/* Left Column: Form Builder */}
          {/* Left Column: Form Builder */}
          <form onSubmit={handleCreatePolicySubmit} className="lg:col-span-7 flex flex-col max-h-[68vh]">
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 pb-2">
              {createError && (
                <p className="text-[12px] text-red-650 bg-red-500/10 border border-red-500/20 p-2.5 rounded-md font-medium leading-relaxed">
                  {createError}
                </p>
              )}
              <div className="flex flex-col gap-1.5 shrink-0">
                <label className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-355">Policy Name</label>
                <input
                  type="text"
                  required
                  value={newPolicyName}
                  onChange={(e) => setNewPolicyName(e.target.value)}
                  placeholder="e.g. ReadOnlyAccess"
                  className="w-full h-[36px] px-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <label className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-355">Description</label>
                <input
                  type="text"
                  value={newPolicyDesc}
                  onChange={(e) => setNewPolicyDesc(e.target.value)}
                  placeholder="Provide a description for this policy..."
                  className="w-full h-[36px] px-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-3.5 mt-2">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-[12px] font-semibold text-zinc-705 dark:text-zinc-355">Policy Statements</span>
                  <button
                    type="button"
                    onClick={addStatement}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700/50"
                  >
                    + Add Statement
                  </button>
                </div>

                {statements.map((s, idx) => (
                  <div 
                    key={idx} 
                    className="bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-md border border-zinc-200 dark:border-zinc-800 flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">Statement #{idx + 1}</span>
                      {statements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStatement(idx)}
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
                          onClick={() => updateStatement(idx, 'effect', 'Allow')}
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded transition-colors ${
                            s.effect === 'Allow'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-750'
                          }`}
                        >
                          ALLOW
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatement(idx, 'effect', 'Deny')}
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded transition-colors ${
                            s.effect === 'Deny'
                              ? 'bg-rose-600 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-750'
                          }`}
                        >
                          DENY
                        </button>
                      </div>
                    </div>

                    {/* Actions Tag Selector */}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">Actions</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white select-none">
                            <input
                              type="checkbox"
                              checked={s.actions.length === ALL_AVAILABLE_ACTIONS.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  selectAllActionsInStatement(idx);
                                } else {
                                  deselectAllActionsInStatement(idx);
                                }
                              }}
                              className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer w-3 h-3 text-blue-600"
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
                              onClick={() => toggleActionInStatement(idx, act)}
                              className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                                isSelected
                                  ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
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
                        value={s.resource}
                        onChange={(e) => updateStatement(idx, 'resource', e.target.value)}
                        placeholder="*"
                        className="w-full h-[32px] px-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2 shrink-0 bg-white dark:bg-[#050505]">
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

          {/* Right Column: Live JSON Preview */}
          <div className="lg:col-span-5 flex flex-col gap-3 max-h-[68vh] min-w-0">
            <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-350">Live JSON Preview</span>
            <div className="flex-1 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-emerald-400 p-4 rounded-md border border-zinc-200 dark:border-zinc-800 overflow-y-auto overflow-x-auto text-[11px] font-mono leading-relaxed h-full min-h-[300px]">
              <pre>{JSON.stringify({
                statements: statements.map(s => ({
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

      {/* Manage Policy Modal */}
      <Modal isOpen={!!editingPolicy} onClose={() => setEditingPolicy(null)} title={`Manage Policy: ${editingPolicy?.name}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          
          {/* Left Column: Form Builder */}
          {/* Left Column: Form Builder */}
          <form onSubmit={handleUpdatePolicySubmit} className="lg:col-span-7 flex flex-col max-h-[68vh]">
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 pb-2">
              {editError && (
                <p className="text-[12px] text-red-650 bg-red-500/10 border border-red-500/20 p-2.5 rounded-md font-medium leading-relaxed">
                  {editError}
                </p>
              )}
              
              {editingPolicy?.type === 'AWS_MANAGE' && (
                <p className="text-[11px] text-yellow-600 bg-yellow-500/10 border border-yellow-500/20 p-2 rounded-md font-medium shrink-0">
                  Warning: This is a system policy. Editing may impact core system permissions.
                </p>
              )}

              <div className="flex flex-col gap-1.5 shrink-0">
                <label className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-355">Policy Name</label>
                <input
                  type="text"
                  required
                  value={editPolicyName}
                  onChange={(e) => setEditPolicyName(e.target.value)}
                  className="w-full h-[36px] px-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <label className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-355">Description</label>
                <input
                  type="text"
                  value={editPolicyDesc}
                  onChange={(e) => setEditPolicyDesc(e.target.value)}
                  className="w-full h-[36px] px-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-3.5 mt-2">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-[12px] font-semibold text-zinc-705 dark:text-zinc-355">Policy Statements</span>
                  <button
                    type="button"
                    onClick={addEditStatement}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded hover:bg-zinc-200 dark:hover:bg-zinc-750 transition-colors border border-zinc-200 dark:border-zinc-700/50"
                  >
                    + Add Statement
                  </button>
                </div>

                {editStatements.map((s, idx) => (
                  <div 
                    key={idx} 
                    className="bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-md border border-zinc-200 dark:border-zinc-800 flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">Statement #{idx + 1}</span>
                      {editStatements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEditStatement(idx)}
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
                          onClick={() => updateEditStatement(idx, 'effect', 'Allow')}
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded transition-colors ${
                            s.effect === 'Allow'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-750'
                          }`}
                        >
                          ALLOW
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEditStatement(idx, 'effect', 'Deny')}
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded transition-colors ${
                            s.effect === 'Deny'
                              ? 'bg-rose-600 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-750'
                          }`}
                        >
                          DENY
                        </button>
                      </div>
                    </div>

                    {/* Actions Tag Selector */}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">Actions</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white select-none">
                            <input
                              type="checkbox"
                              checked={s.actions.length === ALL_AVAILABLE_ACTIONS.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  selectAllActionsInEditStatement(idx);
                                } else {
                                  deselectAllActionsInEditStatement(idx);
                                }
                              }}
                              className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer w-3 h-3 text-blue-600"
                            />
                            Select All
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Filter actions..."
                          value={editActionSearch}
                          onChange={(e) => setEditActionSearch(e.target.value)}
                          className="w-full h-[28px] px-2 text-[11px] bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 transition-colors"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto p-2 bg-zinc-100 dark:bg-[#050505] border border-zinc-200 dark:border-zinc-800 rounded">
                        {ALL_AVAILABLE_ACTIONS.filter(act => act.toLowerCase().includes(editActionSearch.toLowerCase())).map(act => {
                          const isSelected = s.actions.includes(act);
                          return (
                            <button
                              key={act}
                              type="button"
                              onClick={() => toggleActionInEditStatement(idx, act)}
                              className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                                isSelected
                                  ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                                  : 'bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                              }`}
                            >
                              {act}
                            </button>
                          );
                        })}
                        {ALL_AVAILABLE_ACTIONS.filter(act => act.toLowerCase().includes(editActionSearch.toLowerCase())).length === 0 && (
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
                        value={s.resource}
                        onChange={(e) => updateEditStatement(idx, 'resource', e.target.value)}
                        placeholder="*"
                        className="w-full h-[32px] px-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2 shrink-0 bg-white dark:bg-[#050505]">
              <button 
                type="button"
                onClick={() => setEditingPolicy(null)}
                className="px-4 py-2 text-[12px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 text-[12px] font-medium bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm disabled:opacity-40"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Right Column: Live JSON Preview */}
          <div className="lg:col-span-5 flex flex-col gap-3 max-h-[68vh] min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-355">Live JSON Preview</span>
              <button
                type="button"
                onClick={() => {
                  const payload = {
                    statements: editStatements.map(s => ({
                      Effect: s.effect,
                      Action: s.actions,
                      Resource: [s.resource.trim() || '*']
                    }))
                  };
                  navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                  alert('JSON statement copied to clipboard!');
                }}
                className="text-[10px] font-semibold text-blue-600 hover:underline"
              >
                Copy JSON
              </button>
            </div>
            <div className="flex-1 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-emerald-400 p-4 rounded-md border border-zinc-200 dark:border-zinc-800 overflow-y-auto overflow-x-auto text-[11px] font-mono leading-relaxed h-full min-h-[300px]">
              <pre>{JSON.stringify({
                statements: editStatements.map(s => ({
                  Effect: s.effect,
                  Action: s.actions,
                  Resource: [s.resource.trim() || '*']
                }))
              }, null, 2)}</pre>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal select-none">
              This document dynamically matches the statements you edit on the left.
            </span>
          </div>

        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTargets} onClose={() => { setDeleteTargets(null); setConfirmText(''); }} title={deleteTargets?.length === 1 ? "Delete Policy" : "Delete Policies"}>
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-zinc-650 dark:text-zinc-400">
            {deleteTargets?.length === 1 ? (
              <>Delete policy <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deleteTargets[0].name}</span> permanently? This action cannot be undone and will detach it from all users and groups.</>
            ) : (
              <>Delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deleteTargets?.length} policies</span> permanently? This action cannot be undone and will detach them from all users and groups.</>
            )}
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300">
              To confirm, type <span className="font-mono text-red-650">&quot;confirm&quot;</span> below.
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="confirm"
              className="w-full h-[36px] px-3 text-[12px] bg-white dark:bg-[#0a0a0a] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white placeholder-zinc-450 focus:outline-none focus:border-red-450 dark:focus:border-red-655 transition-colors"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <button 
              type="button"
              onClick={() => { setDeleteTargets(null); setConfirmText(''); }}
              className="px-4 py-2 text-[12px] font-medium text-zinc-650 dark:text-zinc-455 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={async () => {
                if (!deleteTargets) return;
                try {
                  await Promise.all(deleteTargets.map(t => deletePolicyMutation.mutateAsync(t.id)));
                  setSelectedIds([]);
                  setDeleteTargets(null);
                  setConfirmText('');
                } catch (err: any) {
                  alert(err.response?.data?.message || 'Failed to delete policy(ies).');
                }
              }}
              disabled={confirmText !== 'confirm' || deletePolicyMutation.isPending}
              className="px-4 py-2 text-[12px] font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm disabled:opacity-40"
            >
              {deletePolicyMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PoliciesView;
