import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { reportUnexpectedError } from "@/lib/sentry";

/**
 * Shared defaults: API data is session-scoped, so window refetches are noisy.
 * A short stale window keeps navigation instant while still refreshing data
 * after mutations via explicit invalidation.
 */
export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => reportUnexpectedError(error),
    }),
    mutationCache: new MutationCache({
      onError: (error) => reportUnexpectedError(error),
    }),
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
