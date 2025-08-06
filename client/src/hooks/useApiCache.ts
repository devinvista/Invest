import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface CacheOptions {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
}

export function useApiCache() {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback((queryKeys: string[]) => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  }, [queryClient]);

  const prefetchQuery = useCallback(async (queryKey: string, queryFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: [queryKey],
      queryFn
    });
  }, [queryClient]);

  const getCachedData = useCallback((queryKey: string) => {
    return queryClient.getQueryData([queryKey]);
  }, [queryClient]);

  const setCachedData = useCallback((queryKey: string, data: any) => {
    queryClient.setQueryData([queryKey], data);
  }, [queryClient]);

  return {
    invalidateQueries,
    prefetchQuery,
    getCachedData,
    setCachedData
  };
}

export function useOptimizedQuery<T>(
  queryKey: string,
  options: CacheOptions = {}
) {
  const defaultOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    ...options
  };

  return useQuery<T>({
    queryKey: [queryKey],
    ...defaultOptions
  });
}