import { api } from '../lib/axios';

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource?: string;
  targetResource?: string;
  decision: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  try {
    const { data } = await api.get('/iam/audit-logs');
    return Array.isArray(data?.data?.items) ? data.data.items : [];
  } catch (e) {
    throw e;
  }
};
