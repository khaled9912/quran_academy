export type PolicyClause = {
  id: string;
  title: string;
  body: string;
};

export type PolicyDocument = {
  key: string;
  version: number;
  language: string;
  title: string;
  summary: string;
  clauses: PolicyClause[];
};

export type PolicyState = {
  required: boolean;
  accepted: boolean;
  document: PolicyDocument | null;
  acceptedAt: string | null;
};

export type PolicyAcceptance = {
  policyKey: string;
  version: number;
  acceptedAt: string;
  clauseIds: string[];
};
