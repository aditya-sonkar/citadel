import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGroups, fetchGroup, createGroup, deleteGroup, attachGroupPolicy, detachGroupPolicy, addGroupMember, removeGroupMember, putGroupPolicy, deleteGroupPolicy, updateGroup } from '../api/groups.api';

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
  });
};

export const useGroup = (id: string) => {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => fetchGroup(id),
    enabled: !!id,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const useAttachGroupPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, policyId }: { groupId: string, policyId: string }) => attachGroupPolicy(groupId, policyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
    },
  });
};

export const useDetachGroupPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, policyId }: { groupId: string, policyId: string }) => detachGroupPolicy(groupId, policyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
    },
  });
};

export const useAddGroupMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string, userId: string }) => addGroupMember(groupId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
    },
  });
};

export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string, userId: string }) => removeGroupMember(groupId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
    },
  });
};

export const usePutGroupPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, policyName, statements }: { groupId: string, policyName: string, statements: any }) => putGroupPolicy(groupId, policyName, statements),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
    },
  });
};

export const useDeleteGroupPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, policyName }: { groupId: string, policyName: string }) => deleteGroupPolicy(groupId, policyName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, groupData }: { id: string; groupData: { name: string; description?: string } }) => updateGroup(id, groupData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', variables.id] });
    },
  });
};
