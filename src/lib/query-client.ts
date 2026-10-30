import { QueryClient } from "@tanstack/react-query";

/**
 * Shared defaults: API data is session-scoped, so window refetches are noisy.
 * A short stale window keeps navigation instant while still refreshing data
 * after mutations via explicit invalidation.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: { retry: 0 },
    },
  });
