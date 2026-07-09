import { api } from '../lib/axios';

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  memberCount?: number;
  attachedPolicyCount?: number;
  _count?: {
    users: number;
    policies: number;
  }
}

export const fetchGroups = async (): Promise<Group[]> => {
  try {
    const { data } = await api.get('/iam/groups');
    return Array.isArray(data?.data?.items) ? data.data.items : [];
  } catch (e) {
    throw e;
  }
};

export const fetchGroup = async (id: string) => {
  const { data } = await api.get(`/iam/groups/${id}`);
  return data.data;
};

export const createGroup = async (groupData: { name: string; description?: string }): Promise<Group> => {
  const { data } = await api.post('/iam/groups', groupData);
  return data.data;
};

export const deleteGroup = async (id: string) => {
  const { data } = await api.delete(`/iam/groups/${id}`);
  return data.data;
};

export const attachGroupPolicy = async (groupId: string, policyId: string) => {
  const { data } = await api.post(`/iam/groups/${groupId}/policies`, { policyId });
  return data.data;
};

export const detachGroupPolicy = async (groupId: string, policyId: string) => {
  const { data } = await api.delete(`/iam/groups/${groupId}/policies/${policyId}`);
  return data.data;
};

export const addGroupMember = async (groupId: string, userId: string) => {
  const { data } = await api.post(`/iam/groups/${groupId}/members`, { userId });
  return data.data;
};

export const removeGroupMember = async (groupId: string, userId: string) => {
  const { data } = await api.delete(`/iam/groups/${groupId}/members/${userId}`);
  return data.data;
};

export const putGroupPolicy = async (groupId: string, policyName: string, statements: any) => {
  const { data } = await api.put(`/iam/groups/${groupId}/inline-policies/${policyName}`, statements);
  return data.data;
};

export const deleteGroupPolicy = async (groupId: string, policyName: string) => {
  const { data } = await api.delete(`/iam/groups/${groupId}/inline-policies/${policyName}`);
  return data.data;
};

export const updateGroup = async (id: string, groupData: { name: string; description?: string }) => {
  const { data } = await api.patch(`/iam/groups/${id}`, groupData);
  return data.data;
};
