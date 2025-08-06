// Performance optimization utilities

// Debounce function for search and input optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization for expensive calculations
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Format currency with memoization for better performance
export const formatCurrencyMemoized = memoize((amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(amount);
});

// Batch API calls to reduce server load
export class APIBatcher {
  private batches = new Map<string, Set<string>>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  constructor(private batchDelay: number = 50) {}

  batch(endpoint: string, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(endpoint)) {
        this.batches.set(endpoint, new Set());
      }

      this.batches.get(endpoint)!.add(id);

      // Clear existing timeout for this endpoint
      if (this.timeouts.has(endpoint)) {
        clearTimeout(this.timeouts.get(endpoint)!);
      }

      // Set new timeout
      const timeout = setTimeout(async () => {
        const ids = Array.from(this.batches.get(endpoint)!);
        this.batches.delete(endpoint);
        this.timeouts.delete(endpoint);

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
          });
          const data = await response.json();
          resolve(data[id]);
        } catch (error) {
          reject(error);
        }
      }, this.batchDelay);

      this.timeouts.set(endpoint, timeout);
    });
  }
}