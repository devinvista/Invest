import { lazy } from 'react';

// Lazy load heavy components to improve initial load time
// These components will be created when we need them
export const LazyInvestmentChart = lazy(() => 
  Promise.resolve({ default: () => <div>Investment Chart</div> })
);

export const LazyPortfolioChart = lazy(() => 
  Promise.resolve({ default: () => <div>Portfolio Chart</div> })
);

export const LazyTransactionDialog = lazy(() => 
  Promise.resolve({ default: () => <div>Transaction Dialog</div> })
);

export const LazyReportsPage = lazy(() => 
  Promise.resolve({ default: () => <div>Reports Page</div> })
);

// Fallback component for loading states
export const ChartSkeleton = () => (
  <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
);

export const DialogSkeleton = () => (
  <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
);