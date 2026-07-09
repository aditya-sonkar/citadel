import React from 'react';
import { ThemeProvider } from '../components/ThemeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};
