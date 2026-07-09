import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, fetchUsersMeta, fetchUser, createUser, attachPolicy, detachPolicy, putBoundary, deleteBoundary, deleteUser, putUserPolicy, deleteUserPolicy } from '../api/users.api';

// Returns the users array — same as before
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};

// Returns { items, total } — used by DashboardHome for real total count
export const useUsersMeta = () => {
  return useQuery({
    queryKey: ['users-meta'],
    queryFn: fetchUsersMeta,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useAttachPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, policyId }: { userId: string, policyId: string }) => attachPolicy(userId, policyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
    },
  });
};

export const useDetachPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, policyId }: { userId: string, policyId: string }) => detachPolicy(userId, policyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
    },
  });
};

export const usePutBoundary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, policyId }: { userId: string, policyId: string }) => putBoundary(userId, policyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
    },
  });
};

export const useDeleteBoundary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteBoundary(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const usePutUserPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, policyName, statements }: { userId: string, policyName: string, statements: any }) => putUserPolicy(userId, policyName, statements),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
    },
  });
};

export const useDeleteUserPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, policyName }: { userId: string, policyName: string }) => deleteUserPolicy(userId, policyName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
    },
  });
};
