import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPolicies, fetchPolicy, createPolicy, deletePolicy, updatePolicy } from '../api/policies.api';

export const usePolicies = () => {
  return useQuery({
    queryKey: ['policies'],
    queryFn: fetchPolicies,
  });
};

export const usePolicy = (id: string) => {
  return useQuery({
    queryKey: ['policies', id],
    queryFn: () => fetchPolicy(id),
    enabled: !!id,
  });
};

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, policyData }: { id: string; policyData: { name: string; description?: string; statements: any } }) => updatePolicy(id, policyData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policies', variables.id] });
    },
  });
};

