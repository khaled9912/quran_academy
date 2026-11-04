import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { reportUnexpectedError } from "@/lib/sentry";

/**
 * Class and request screens re-fetch on this cadence while the tab is focused,
 * so an approval or status change made by another role appears without a manual
 * refresh. True push updates would need a server-side channel.
 */
export const LIVE_SYNC_INTERVAL = 15_000;

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
