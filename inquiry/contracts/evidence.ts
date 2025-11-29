/**
 * Evidence types for Inquiry Framework.
 * Links claims to sources with supporting or refuting evidence.
 */

import type { TimestampValue } from './base.js';
import type { Confidence, TextSpan } from './claim.js';
import type { CredibilityScore } from './source.js';

/**
 * Type of evidence relationship.
 */
export type EvidenceType =
  | 'supports'
  | 'refutes'
  | 'partially_supports'
  | 'partially_refutes'
  | 'neutral'
  | 'unrelated';

/**
 * Strength of the evidence.
 */
export type EvidenceStrength =
  | 'strong'
  | 'moderate'
  | 'weak'
  | 'inconclusive';

/**
 * Method used to extract/identify evidence.
 */
export type ExtractionMethod =
  | 'manual'
  | 'automated'
  | 'hybrid'
  | 'llm'
  | 'rule_based'
  | 'ml_classifier';

/**
 * Evidence linking a claim to a source.
 */
export interface Evidence {
  /** Unique evidence identifier */
  readonly id: string;
  /** ID of the claim this evidence relates to */
  readonly claimId: string;
  /** ID of the source providing this evidence */
  readonly sourceId: string;
  /** Type of evidence (supports, refutes, etc.) */
  readonly type: EvidenceType;
  /** Strength of the evidence */
  readonly strength: EvidenceStrength;
  /** The evidence text/excerpt */
  readonly text: string;
  /** Location in source where evidence was found */
  readonly sourceSpan: TextSpan | null;
  /** Confidence in the evidence extraction */
  readonly extractionConfidence: Confidence;
  /** Confidence in the evidence relevance */
  readonly relevanceConfidence: Confidence;
  /** Credibility of the evidence (derived from source) */
  readonly credibility: CredibilityScore;
  /** Method used to extract this evidence */
  readonly extractionMethod: ExtractionMethod;
  /** ID of the agent that extracted this evidence */
  readonly extractedBy: string;
  /** When the evidence was extracted */
  readonly extractedAt: TimestampValue;
  /** When the evidence was last updated */
  readonly updatedAt: TimestampValue;
  /** Reasoning for the evidence classification */
  readonly reasoning: string | null;
  /** Custom metadata */
  readonly metadata: Readonly<Record<string, unknown>>;
  /** Tags for categorization */
  readonly tags: readonly string[];
}

/**
 * Partial evidence for creation/updates.
 */
export type PartialEvidence = Partial<Omit<Evidence, 'id'>> & Pick<Evidence, 'id'>;

/**
 * Summary of evidence for a claim.
 */
export interface EvidenceSummary {
  /** Claim ID this summary is for */
  readonly claimId: string;
  /** Total number of evidence pieces */
  readonly totalCount: number;
  /** Number of supporting evidence pieces */
  readonly supportingCount: number;
  /** Number of refuting evidence pieces */
  readonly refutingCount: number;
  /** Number of neutral evidence pieces */
  readonly neutralCount: number;
  /** Average credibility of all evidence */
  readonly averageCredibility: CredibilityScore;
  /** Overall evidence strength */
  readonly overallStrength: EvidenceStrength;
  /** Net support score (-1 to 1) */
  readonly netSupportScore: number;
  /** When this summary was calculated */
  readonly calculatedAt: TimestampValue;
}

/**
 * Creates new evidence with default values.
 */
export function createEvidence(
  overrides: Partial<Evidence> & Pick<Evidence, 'id' | 'claimId' | 'sourceId' | 'text' | 'extractedBy'>
): Evidence {
  const now = Date.now();
  return {
    id: overrides.id,
    claimId: overrides.claimId,
    sourceId: overrides.sourceId,
    type: overrides.type ?? 'neutral',
    strength: overrides.strength ?? 'inconclusive',
    text: overrides.text,
    sourceSpan: overrides.sourceSpan ?? null,
    extractionConfidence: overrides.extractionConfidence ?? 0,
    relevanceConfidence: overrides.relevanceConfidence ?? 0,
    credibility: overrides.credibility ?? 0.5,
    extractionMethod: overrides.extractionMethod ?? 'automated',
    extractedBy: overrides.extractedBy,
    extractedAt: overrides.extractedAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    reasoning: overrides.reasoning ?? null,
    metadata: overrides.metadata ?? {},
    tags: overrides.tags ?? [],
  };
}

/**
 * Checks if evidence supports the claim.
 */
export function isSupporting(evidence: Evidence): boolean {
  return evidence.type === 'supports' || evidence.type === 'partially_supports';
}

/**
 * Checks if evidence refutes the claim.
 */
export function isRefuting(evidence: Evidence): boolean {
  return evidence.type === 'refutes' || evidence.type === 'partially_refutes';
}

/**
 * Checks if evidence is strong.
 */
export function isStrongEvidence(evidence: Evidence): boolean {
  return evidence.strength === 'strong';
}

/**
 * Checks if evidence is credible (credibility >= 0.6).
 */
export function isCredibleEvidence(evidence: Evidence): boolean {
  return evidence.credibility >= 0.6;
}

/**
 * Calculates evidence score based on type, strength, and credibility.
 * Returns value between -1 (strongly refutes) and 1 (strongly supports).
 */
export function calculateEvidenceScore(evidence: Evidence): number {
  const strengthMultiplier = {
    strong: 1.0,
    moderate: 0.7,
    weak: 0.4,
    inconclusive: 0.1,
  };

  const typeMultiplier = {
    supports: 1.0,
    partially_supports: 0.5,
    neutral: 0,
    unrelated: 0,
    partially_refutes: -0.5,
    refutes: -1.0,
  };

  return (
    typeMultiplier[evidence.type] *
    strengthMultiplier[evidence.strength] *
    evidence.credibility
  );
}

/**
 * Creates an evidence summary from a list of evidence.
 */
export function createEvidenceSummary(
  claimId: string,
  evidenceList: readonly Evidence[]
): EvidenceSummary {
  const supportingCount = evidenceList.filter(isSupporting).length;
  const refutingCount = evidenceList.filter(isRefuting).length;
  const neutralCount = evidenceList.filter(
    (e) => e.type === 'neutral' || e.type === 'unrelated'
  ).length;

  const totalCredibility = evidenceList.reduce((sum, e) => sum + e.credibility, 0);
  const averageCredibility =
    evidenceList.length > 0 ? totalCredibility / evidenceList.length : 0;

  const totalScore = evidenceList.reduce(
    (sum, e) => sum + calculateEvidenceScore(e),
    0
  );
  const netSupportScore =
    evidenceList.length > 0
      ? Math.max(-1, Math.min(1, totalScore / evidenceList.length))
      : 0;

  // Determine overall strength based on evidence count and scores
  let overallStrength: EvidenceStrength = 'inconclusive';
  if (evidenceList.length >= 3) {
    const absScore = Math.abs(netSupportScore);
    if (absScore >= 0.7) {
      overallStrength = 'strong';
    } else if (absScore >= 0.4) {
      overallStrength = 'moderate';
    } else if (absScore >= 0.2) {
      overallStrength = 'weak';
    }
  }

  return {
    claimId,
    totalCount: evidenceList.length,
    supportingCount,
    refutingCount,
    neutralCount,
    averageCredibility,
    overallStrength,
    netSupportScore,
    calculatedAt: Date.now(),
  };
}
