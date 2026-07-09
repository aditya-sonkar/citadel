import { useMutation } from '@tanstack/react-query';
import { evaluateAccess } from '../api/evaluate.api';
import type { EvaluationRequest } from '../api/evaluate.api';

export const useEvaluate = () => {
  return useMutation({
    mutationFn: (request: EvaluationRequest) => evaluateAccess(request),
  });
};
