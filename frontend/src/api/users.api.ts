import { api } from '../lib/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  isRoot: boolean;
  isMfaEnabled?: boolean;
  createdAt: string;
  updatedAt?: string;
  groupCount?: number;
  managedPoliciesCount: number;
  inlinePoliciesCount: number;
  hasBoundary?: boolean;
}

export const fetchUsers = async (): Promise<User[]> => {
  const { data } = await api.get('/iam/users');
  return Array.isArray(data?.data?.items) ? data.data.items : [];
};

export const fetchUsersMeta = async () => {
  const { data } = await api.get('/iam/users');
  return {
    items: Array.isArray(data?.data?.items) ? data.data.items : [],
    total: data?.data?.pagination?.total ?? 0,
  };
};

export const fetchUser = async (id: string) => {
  const { data } = await api.get(`/iam/users/${id}`);
  return data.data;
};

export const createUser = async (userData: any) => {
  const { data } = await api.post('/iam/users', userData);
  return data.data;
};

export const attachPolicy = async (userId: string, policyId: string) => {
  const { data } = await api.post(`/iam/users/${userId}/policies`, { policyId });
  return data.data;
};

export const detachPolicy = async (userId: string, policyId: string) => {
  const { data } = await api.delete(`/iam/users/${userId}/policies/${policyId}`);
  return data.data;
};

export const putBoundary = async (userId: string, policyId: string) => {
  const { data } = await api.put(`/iam/users/${userId}/boundary`, { policyId });
  return data.data;
};

export const deleteBoundary = async (userId: string) => {
  const { data } = await api.delete(`/iam/users/${userId}/boundary`);
  return data.data;
};

export const deleteUser = async (userId: string) => {
  const { data } = await api.delete(`/iam/users/${userId}`);
  return data.data;
};

export const fetchCredentialReport = async () => {
  const { data } = await api.get('/iam/users/credential-report');
  return data.data;
};

export const putUserPolicy = async (userId: string, policyName: string, statements: any) => {
  const { data } = await api.put(`/iam/users/${userId}/inline-policies/${policyName}`, statements);
  return data.data;
};

export const deleteUserPolicy = async (userId: string, policyName: string) => {
  const { data } = await api.delete(`/iam/users/${userId}/inline-policies/${policyName}`);
  return data.data;
};
