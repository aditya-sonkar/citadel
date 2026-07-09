import { api } from '../lib/axios';

export interface EvaluationRequest {
  action: string;
  resource: string;
  userId: string;
}

export interface EvaluationResult {
  decision: 'ALLOW_MATCH' | 'EXPLICIT_DENY' | 'BOUNDARY_DENY' | 'DELEGATION_DENY' | 'NO_MATCH' | 'ROOT_BYPASS';
  matchedPolicy?: string;
  evaluationPath?: string[];
  reason?: string;
}

export const evaluateAccess = async (request: EvaluationRequest): Promise<EvaluationResult> => {
  const { data } = await api.post('/iam/evaluate', request);
  return data.data; 
};
