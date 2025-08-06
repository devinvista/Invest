import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useErrorBoundary } from './useErrorBoundary';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  enableErrorBoundary?: boolean;
  retryDelay?: number;
  backgroundRefetch?: boolean;
}

export function useOptimizedQuery<T>(
  queryKey: string[],
  options: OptimizedQueryOptions<T> = {}
) {
  const { handleAsyncError } = useErrorBoundary();
  const {
    enableErrorBoundary = true,
    retryDelay = 1000,
    backgroundRefetch = false,
    ...queryOptions
  } = options;

  return useQuery<T>({
    queryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: backgroundRefetch,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (enableErrorBoundary) {
        handleAsyncError(error as Error, `Query: ${queryKey.join('/')}`);
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(retryDelay * Math.pow(2, attemptIndex), 30000),
    ...queryOptions
  });
}

export function useCachedQuery<T>(queryKey: string[], fallbackData?: T) {
  return useOptimizedQuery<T>(queryKey, {
    placeholderData: fallbackData as any,
    staleTime: 10 * 60 * 1000, // 10 minutes for cached queries
  });
}