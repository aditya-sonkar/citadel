export interface PolicyStatement {
  Sid?: string; // Optional statement ID (AWS-style)
  Effect: 'Allow' | 'Deny';
  Action: string[];
  Resource: string[];
}

export interface PolicyDocument {
  statements: PolicyStatement[];
}

export type EvaluationReason =
  | 'ALLOW_MATCH'
  | 'EXPLICIT_DENY'
  | 'NO_MATCH'
  | 'BOUNDARY_DENY'
  | 'ROOT_BYPASS';

export interface EvaluationResult {
  allowed: boolean;
  reason: EvaluationReason;
  matchedPolicyIds?: string[];   // For audit: which policy IDs triggered decision
  matchedPolicyNames?: string[]; // For audit: human-readable policy names
}

// Internal type used during aggregation
export interface AggregatedPolicy {
  id: string;
  name: string;
  statements: PolicyStatement[];
}
