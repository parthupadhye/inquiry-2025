/**
 * Verification types for Inquiry Framework.
 * Defines verification results, status, and confidence scoring.
 */

import type { TimestampValue, MessageError } from './base.js';
import type { Confidence } from './claim.js';
import type { EvidenceSummary } from './evidence.js';

/**
 * Status of a verification attempt.
 */
export type VerificationStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'timeout'
  | 'cancelled'
  | 'requires_review';

/**
 * Outcome of a verification.
 */
export type VerificationOutcome =
  | 'verified'
  | 'refuted'
  | 'partially_verified'
  | 'inconclusive'
  | 'insufficient_evidence'
  | 'contradictory_evidence';

/**
 * Confidence score with explicit bounds [0, 1].
 * Includes explanation for the confidence level.
 */
export interface ConfidenceScore {
  /** The confidence value between 0 and 1 */
  readonly value: Confidence;
  /** Lower bound of confidence interval */
  readonly lowerBound: Confidence;
  /** Upper bound of confidence interval */
  readonly upperBound: Confidence;
  /** Explanation for this confidence level */
  readonly explanation: string | null;
  /** Factors that contributed to this score */
  readonly factors: readonly ConfidenceFactor[];
}

/**
 * A factor contributing to a confidence score.
 */
export interface ConfidenceFactor {
  /** Factor name */
  readonly name: string;
  /** Factor weight (0-1) */
  readonly weight: number;
  /** Factor score (0-1) */
  readonly score: number;
  /** Impact on final score (weight * score) */
  readonly impact: number;
}

/**
 * Method used for verification.
 */
export type VerificationMethod =
  | 'automated'
  | 'manual'
  | 'hybrid'
  | 'llm_analysis'
  | 'cross_reference'
  | 'expert_review'
  | 'consensus';

/**
 * Result of a verification process.
 */
export interface VerificationResult {
  /** Unique result identifier */
  readonly id: string;
  /** ID of the claim being verified */
  readonly claimId: string;
  /** Current verification status */
  readonly status: VerificationStatus;
  /** Verification outcome (if completed) */
  readonly outcome: VerificationOutcome | null;
  /** Confidence in the verification result */
  readonly confidence: ConfidenceScore;
  /** Method used for verification */
  readonly method: VerificationMethod;
  /** IDs of agents involved in verification */
  readonly verifierAgentIds: readonly string[];
  /** Summary of evidence used */
  readonly evidenceSummary: EvidenceSummary | null;
  /** IDs of evidence pieces used */
  readonly evidenceIds: readonly string[];
  /** Number of sources consulted */
  readonly sourcesConsulted: number;
  /** Detailed reasoning for the outcome */
  readonly reasoning: string;
  /** Recommendations for further verification */
  readonly recommendations: readonly string[];
  /** When verification started */
  readonly startedAt: TimestampValue;
  /** When verification completed */
  readonly completedAt: TimestampValue | null;
  /** Duration in milliseconds */
  readonly durationMs: number | null;
  /** Error if verification failed */
  readonly error: MessageError | null;
  /** Custom metadata */
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Partial verification result for creation/updates.
 */
export type PartialVerificationResult = Partial<Omit<VerificationResult, 'id'>> &
  Pick<VerificationResult, 'id'>;

/**
 * Request to verify a claim.
 */
export interface VerificationRequest {
  /** Request identifier */
  readonly requestId: string;
  /** ID of the claim to verify */
  readonly claimId: string;
  /** Requested verification method */
  readonly method: VerificationMethod | null;
  /** Minimum confidence threshold required */
  readonly minConfidence: Confidence;
  /** Maximum time allowed for verification (ms) */
  readonly timeoutMs: number;
  /** Priority of this verification (higher = more urgent) */
  readonly priority: number;
  /** When the request was created */
  readonly requestedAt: TimestampValue;
  /** Who requested the verification */
  readonly requestedBy: string;
  /** Additional instructions */
  readonly instructions: string | null;
}

/**
 * Creates a default confidence score.
 */
export function createConfidenceScore(
  value: Confidence,
  overrides: Partial<Omit<ConfidenceScore, 'value'>> = {}
): ConfidenceScore {
  // Ensure value is bounded
  const boundedValue = Math.max(0, Math.min(1, value));
  const margin = 0.1;

  return {
    value: boundedValue,
    lowerBound: overrides.lowerBound ?? Math.max(0, boundedValue - margin),
    upperBound: overrides.upperBound ?? Math.min(1, boundedValue + margin),
    explanation: overrides.explanation ?? null,
    factors: overrides.factors ?? [],
  };
}

/**
 * Creates a verification result with default values.
 */
export function createVerificationResult(
  overrides: Partial<VerificationResult> & Pick<VerificationResult, 'id' | 'claimId'>
): VerificationResult {
  const now = Date.now();
  return {
    id: overrides.id,
    claimId: overrides.claimId,
    status: overrides.status ?? 'not_started',
    outcome: overrides.outcome ?? null,
    confidence: overrides.confidence ?? createConfidenceScore(0),
    method: overrides.method ?? 'automated',
    verifierAgentIds: overrides.verifierAgentIds ?? [],
    evidenceSummary: overrides.evidenceSummary ?? null,
    evidenceIds: overrides.evidenceIds ?? [],
    sourcesConsulted: overrides.sourcesConsulted ?? 0,
    reasoning: overrides.reasoning ?? '',
    recommendations: overrides.recommendations ?? [],
    startedAt: overrides.startedAt ?? now,
    completedAt: overrides.completedAt ?? null,
    durationMs: overrides.durationMs ?? null,
    error: overrides.error ?? null,
    metadata: overrides.metadata ?? {},
  };
}

/**
 * Creates a verification request.
 */
export function createVerificationRequest(
  overrides: Partial<VerificationRequest> & Pick<VerificationRequest, 'requestId' | 'claimId' | 'requestedBy'>
): VerificationRequest {
  return {
    requestId: overrides.requestId,
    claimId: overrides.claimId,
    method: overrides.method ?? null,
    minConfidence: overrides.minConfidence ?? 0.7,
    timeoutMs: overrides.timeoutMs ?? 60000,
    priority: overrides.priority ?? 0,
    requestedAt: overrides.requestedAt ?? Date.now(),
    requestedBy: overrides.requestedBy,
    instructions: overrides.instructions ?? null,
  };
}

/**
 * Checks if verification is complete.
 */
export function isVerificationComplete(result: VerificationResult): boolean {
  return result.status === 'completed' || result.status === 'failed';
}

/**
 * Checks if verification was successful.
 */
export function isVerificationSuccessful(result: VerificationResult): boolean {
  return (
    result.status === 'completed' &&
    result.outcome !== null &&
    result.outcome !== 'inconclusive' &&
    result.outcome !== 'insufficient_evidence'
  );
}

/**
 * Checks if confidence meets a threshold.
 */
export function meetsConfidenceThreshold(
  score: ConfidenceScore,
  threshold: Confidence
): boolean {
  return score.value >= threshold;
}

/**
 * Calculates confidence score from factors.
 */
export function calculateConfidenceFromFactors(
  factors: readonly ConfidenceFactor[]
): ConfidenceScore {
  if (factors.length === 0) {
    return createConfidenceScore(0, { explanation: 'No factors provided' });
  }

  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const weightedSum = factors.reduce((sum, f) => sum + f.weight * f.score, 0);
  const value = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Calculate bounds based on factor variance
  const scores = factors.map((f) => f.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  return createConfidenceScore(value, {
    lowerBound: Math.max(0, minScore - 0.05),
    upperBound: Math.min(1, maxScore + 0.05),
    factors,
    explanation: `Calculated from ${factors.length} factors`,
  });
}
