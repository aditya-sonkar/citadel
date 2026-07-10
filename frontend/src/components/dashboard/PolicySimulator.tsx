import React, { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useEvaluate } from '../../hooks/useEvaluate';
import { AccessDeniedState } from '../ui/AccessDeniedState';

interface PolicySimulatorProps {
  isRoot?: boolean;
}

const PolicySimulator: React.FC<PolicySimulatorProps> = ({ isRoot }) => {
  const { data: users, isError, isLoading } = useUsers();
  const evaluateMutation = useEvaluate();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [action, setAction] = useState('');
  const [resource, setResource] = useState('*');

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !action || !resource) return;

    try {
      await evaluateMutation.mutateAsync({
        userId: selectedUserId,
        action,
        resource
      });
    } catch (err) {
      console.error('Evaluation failed:', err);
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

  // Convert flat evaluation path into structured tree representation
  const renderEvaluationTree = (decision: string, path: string[], matched: string) => {
    const isAllowed = decision === 'ALLOW_MATCH' || decision === 'ROOT_BYPASS';

    // Parse individual path statements to find status
    const isRoot = decision === 'ROOT_BYPASS';
    const isExplicitDeny = decision === 'EXPLICIT_DENY';
    const isBoundaryDeny = decision === 'BOUNDARY_DENY';

    return (
      <div className="font-mono text-[12px] bg-zinc-950 text-zinc-400 p-4 border border-zinc-800 rounded-md leading-relaxed select-none">
        <div>Request</div>
        <div className="pl-4 border-l border-zinc-800 ml-2">
          <div>├─ Identity (User) Policies</div>
          <div className="pl-6 border-l border-zinc-800 ml-2">
            <div>
              └─ {isRoot ? 'Bypass (User is Root)' : matched ? `${matched} (MATCH ALLOW)` : 'No matching statements found (DEFAULT DENY)'}
            </div>
          </div>

          <div>├─ Permission Boundary Constraints</div>
          <div className="pl-6 border-l border-zinc-800 ml-2">
            <div>
              └─ {isBoundaryDeny ? 'Boundary Policy active (MATCH DENY/UNMATCHED)' : 'Boundary passed or not configured'}
            </div>
          </div>

          <div>└─ Final Evaluation Decision</div>
          <div className="pl-6 ml-2">
            <div className={`font-bold ${isAllowed ? 'text-emerald-400' : 'text-red-400'}`}>
              └─ {isAllowed ? 'ALLOWED' : 'DENIED'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in p-6 md:p-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          Policy Simulator
          <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">Console</span>
        </h1>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
          Test and verify Citadel IAM authorization path flows. Select an identity, enter your action context, and run the simulator.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Simulator Form */}
        <form onSubmit={handleEvaluate} className="flex flex-col gap-5 p-6 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg">

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Identity (User)</label>
            <select
              required
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="h-[36px] px-3 text-[13px] bg-zinc-50 dark:bg-[#050505] border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="" disabled>-- Select User --</option>
              {users?.map(u => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Action</label>
            <input
              type="text"
              required
              value={action}
              onChange={e => setAction(e.target.value)}
              className="h-[36px] px-3 text-[13px] bg-zinc-50 dark:bg-[#050505] border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. s3:GetObject or reports:Read"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">Resource ARN</label>
            <input
              type="text"
              required
              value={resource}
              onChange={e => setResource(e.target.value)}
              className="h-[36px] px-3 text-[13px] bg-zinc-50 dark:bg-[#050505] border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. arn:aws:s3:::my-bucket/* or *"
            />
          </div>

          <button
            type="submit"
            disabled={evaluateMutation.isPending || !selectedUserId || !action || !resource}
            className="mt-2 h-[36px] px-4 text-[13px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm disabled:opacity-50 w-full"
          >
            {evaluateMutation.isPending ? 'Evaluating...' : 'Run Simulation'}
          </button>
        </form>

        {/* Results Panel */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Simulation Results</h2>

          {!evaluateMutation.data && !evaluateMutation.isError && !evaluateMutation.isPending && (
            <div className="flex-1 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg flex flex-col items-center justify-center text-center p-6 bg-zinc-50/50 dark:bg-[#050505] min-h-[200px]">
              <p className="text-[12px] text-zinc-500">Run a simulation to see the evaluation tree path and decision model.</p>
            </div>
          )}

          {evaluateMutation.isError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
              <p className="text-[12px] text-red-600 dark:text-red-400">Failed to run evaluation. Please check server connection.</p>
            </div>
          )}

          {evaluateMutation.data && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className={`p-4 border rounded-lg flex items-center justify-between ${evaluateMutation.data.decision === 'ALLOW_MATCH' || evaluateMutation.data.decision === 'ROOT_BYPASS'
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'
                }`}>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Decision</span>
                  <span className={`text-lg font-bold ${evaluateMutation.data.decision === 'ALLOW_MATCH' || evaluateMutation.data.decision === 'ROOT_BYPASS'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-700 dark:text-red-400'
                    }`}>
                    {evaluateMutation.data.decision === 'ALLOW_MATCH' ? 'ALLOWED' :
                      evaluateMutation.data.decision === 'ROOT_BYPASS' ? 'ALLOWED (ROOT)' : 'DENIED'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col gap-4">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Reason Description</span>
                  <p className="text-[13px] text-zinc-900 dark:text-zinc-100">{evaluateMutation.data.reason || 'No specific reason provided.'}</p>
                </div>

                {/* Evaluation Tree component */}
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 block mb-2">Evaluation Decision Tree</span>
                  {renderEvaluationTree(
                    evaluateMutation.data.decision,
                    evaluateMutation.data.evaluationPath || [],
                    evaluateMutation.data.matchedPolicy || ''
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PolicySimulator;
