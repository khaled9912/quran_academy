import { backendFetch } from "@/lib/backend-client";
import type {
  PolicyAcceptance,
  PolicyDocument,
  PolicyState,
} from "@/types/policy";

/** The document a role is asked to sign, with the clause text served by the API. */
export const getPolicyDocument = (key: string) =>
  backendFetch<PolicyDocument>(`/api/policy/${encodeURIComponent(key)}`);

/** Whether the signed-in account still owes an acceptance, plus the text it must tick. */
export const getPolicyState = () => backendFetch<PolicyState>("/api/policy/state");

/**
 * Signs every clause of the current version. The API refuses a partial tick or
 * a version the page never showed, so the caller sends what it rendered.
 */
export const acceptPolicy = (
  policyKey: string,
  version: number,
  clauseIds: string[]
) =>
  backendFetch<PolicyAcceptance>("/api/policy/accept", {
    method: "POST",
    body: JSON.stringify({ policyKey, version, clauseIds }),
  });
