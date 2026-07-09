import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../api/audit.api';

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: fetchAuditLogs,
  });
};
