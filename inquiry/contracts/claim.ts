/**
 * Claim types for Inquiry Framework.
 * Defines claims extracted from sources with categorization and confidence.
 */

import type { TimestampValue } from './base.js';

/**
 * Categories of claims that can be extracted.
 */
export type ClaimCategory =
  | 'factual'
  | 'opinion'
  | 'prediction'
  | 'statistical'
  | 'causal'
  | 'comparative'
  | 'definitional'
  | 'procedural'
  | 'temporal'
  | 'spatial'
  | 'attribution'
  | 'conditional'
  | 'other';

/**
 * Verification status of a claim.
 */
export type ClaimStatus =
  | 'unverified'
  | 'pending_verification'
  | 'verified'
  | 'disputed'
  | 'refuted'
  | 'partially_verified'
  | 'inconclusive';

/**
 * Confidence level for claim extraction or verification.
 * Value between 0 and 1.
 */
export type Confidence = number;

/**
 * Sentiment associated with a claim.
 */
export type ClaimSentiment = 'positive' | 'negative' | 'neutral' | 'mixed';

/**
 * Span indicating where a claim was found in source text.
 */
export interface TextSpan {
  /** Start character index (inclusive) */
  readonly start: number;
  /** End character index (exclusive) */
  readonly end: number;
  /** The actual text content */
  readonly text: string;
}

/**
 * Entity mentioned in a claim.
 */
export interface ClaimEntity {
  /** Entity identifier */
  readonly id: string;
  /** Entity name */
  readonly name: string;
  /** Entity type (person, organization, location, etc.) */
  readonly type: string;
  /** Confidence of entity extraction */
  readonly confidence: Confidence;
}

/**
 * A claim extracted from a source.
 */
export interface Claim {
  /** Unique claim identifier */
  readonly id: string;
  /** The claim text/statement */
  readonly text: string;
  /** Normalized/canonical form of the claim */
  readonly normalizedText: string;
  /** Category of the claim */
  readonly category: ClaimCategory;
  /** Current verification status */
  readonly status: ClaimStatus;
  /** Confidence in the claim extraction */
  readonly extractionConfidence: Confidence;
  /** Confidence in the claim verification (if verified) */
  readonly verificationConfidence: Confidence | null;
  /** Sentiment of the claim */
  readonly sentiment: ClaimSentiment;
  /** Entities mentioned in the claim */
  readonly entities: readonly ClaimEntity[];
  /** Location in source text where claim was found */
  readonly sourceSpan: TextSpan | null;
  /** ID of the source this claim was extracted from */
  readonly sourceId: string;
  /** When the claim was extracted */
  readonly extractedAt: TimestampValue;
  /** When the claim was last updated */
  readonly updatedAt: TimestampValue;
  /** Custom metadata */
  readonly metadata: Readonly<Record<string, unknown>>;
  /** Tags for categorization */
  readonly tags: readonly string[];
}

/**
 * Partial claim for creation/updates.
 */
export type PartialClaim = Partial<Omit<Claim, 'id'>> & Pick<Claim, 'id'>;

/**
 * Creates a new claim with default values.
 */
export function createClaim(
  overrides: Partial<Claim> & Pick<Claim, 'id' | 'text' | 'sourceId'>
): Claim {
  const now = Date.now();
  return {
    id: overrides.id,
    text: overrides.text,
    normalizedText: overrides.normalizedText ?? overrides.text.toLowerCase().trim(),
    category: overrides.category ?? 'other',
    status: overrides.status ?? 'unverified',
    extractionConfidence: overrides.extractionConfidence ?? 0,
    verificationConfidence: overrides.verificationConfidence ?? null,
    sentiment: overrides.sentiment ?? 'neutral',
    entities: overrides.entities ?? [],
    sourceSpan: overrides.sourceSpan ?? null,
    sourceId: overrides.sourceId,
    extractedAt: overrides.extractedAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    metadata: overrides.metadata ?? {},
    tags: overrides.tags ?? [],
  };
}

/**
 * Checks if a claim has been verified (verified or partially_verified).
 */
export function isClaimVerified(claim: Claim): boolean {
  return claim.status === 'verified' || claim.status === 'partially_verified';
}

/**
 * Checks if a claim verification is conclusive.
 */
export function isClaimConclusive(claim: Claim): boolean {
  return (
    claim.status === 'verified' ||
    claim.status === 'refuted' ||
    claim.status === 'disputed'
  );
}

/**
 * Checks if a claim needs verification.
 */
export function needsVerification(claim: Claim): boolean {
  return claim.status === 'unverified' || claim.status === 'pending_verification';
}
