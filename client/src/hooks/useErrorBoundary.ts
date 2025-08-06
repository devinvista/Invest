import { useCallback } from 'react';

export function useErrorBoundary() {
  const captureError = useCallback((error: Error, errorInfo?: any) => {
    console.error('Application Error:', error);
    if (errorInfo) {
      console.error('Error Info:', errorInfo);
    }
    
    // In production, you could send this to an error reporting service
    // like Sentry, LogRocket, or Rollbar
  }, []);

  const handleAsyncError = useCallback((error: Error, context?: string) => {
    console.error(`Async Error ${context ? `in ${context}` : ''}:`, error);
    
    // Show user-friendly error message
    // This could trigger a toast notification or modal
  }, []);

  return {
    captureError,
    handleAsyncError
  };
}