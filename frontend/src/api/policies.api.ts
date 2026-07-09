import { api } from '../lib/axios';

export interface Policy {
  id: string;
  name: string;
  description?: string;
  type: string;
  statements: any; // The JSON policy statements
  createdAt: string;
}

export const fetchPolicies = async (): Promise<Policy[]> => {
  try {
    const { data } = await api.get('/iam/policies');
    return Array.isArray(data?.data?.items) ? data.data.items : [];
  } catch (e) {
    throw e;
  }
};

export const fetchPolicy = async (id: string): Promise<any> => {
  const { data } = await api.get(`/iam/policies/${id}`);
  return data.data;
};

export const createPolicy = async (policyData: { name: string; description?: string; type: string; statements: any }): Promise<Policy> => {
  const { data } = await api.post('/iam/policies', policyData);
  return data.data;
};

export const deletePolicy = async (id: string): Promise<void> => {
  await api.delete(`/iam/policies/${id}`);
};

export const updatePolicy = async (id: string, policyData: { name: string; description?: string; statements: any }): Promise<Policy> => {
  const { data } = await api.put(`/iam/policies/${id}`, policyData);
  return data.data;
};
