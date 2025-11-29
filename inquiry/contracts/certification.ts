/**
 * Certification types for Inquiry Framework.
 * Defines certification packages and audit trails.
 */

import type { TimestampValue } from './base.js';
import type { Confidence } from './claim.js';
import type { VerificationResult, ConfidenceScore } from './verification.js';

/**
 * Status of a certification.
 */
export type CertificationStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'revoked'
  | 'expired';

/**
 * Level of certification.
 */
export type CertificationLevel =
  | 'preliminary'
  | 'standard'
  | 'enhanced'
  | 'comprehensive';

/**
 * Type of audit action.
 */
export type AuditAction =
  | 'created'
  | 'updated'
  | 'verified'
  | 'approved'
  | 'rejected'
  | 'revoked'
  | 'exported'
  | 'accessed'
  | 'shared'
  | 'commented'
  | 'escalated';

/**
 * An entry in the audit trail.
 */
export interface AuditEntry {
  /** Unique entry identifier */
  readonly id: string;
  /** ID of the entity being audited */
  readonly entityId: string;
  /** Type of entity (claim, source, verification, certification) */
  readonly entityType: string;
  /** Action performed */
  readonly action: AuditAction;
  /** ID of the actor (agent or user) */
  readonly actorId: string;
  /** Type of actor */
  readonly actorType: 'agent' | 'user' | 'system';
  /** When the action occurred */
  readonly timestamp: TimestampValue;
  /** Previous state (for updates) */
  readonly previousState: Readonly<Record<string, unknown>> | null;
  /** New state (for updates) */
  readonly newState: Readonly<Record<string, unknown>> | null;
  /** Reason for the action */
  readonly reason: string | null;
  /** IP address or system identifier */
  readonly sourceIdentifier: string | null;
  /** Additional context */
  readonly context: Readonly<Record<string, unknown>>;
}

/**
 * Summary statistics for a certification.
 */
export interface CertificationStats {
  /** Total claims in the package */
  readonly totalClaims: number;
  /** Number of verified claims */
  readonly verifiedClaims: number;
  /** Number of refuted claims */
  readonly refutedClaims: number;
  /** Number of inconclusive claims */
  readonly inconclusiveClaims: number;
  /** Total sources referenced */
  readonly totalSources: number;
  /** Total evidence pieces */
  readonly totalEvidence: number;
  /** Average confidence across verifications */
  readonly averageConfidence: Confidence;
  /** Overall verification rate */
  readonly verificationRate: number;
}

/**
 * Signer information for certification.
 */
export interface CertificationSigner {
  /** Signer identifier */
  readonly id: string;
  /** Signer name */
  readonly name: string;
  /** Signer role */
  readonly role: string;
  /** When signed */
  readonly signedAt: TimestampValue;
  /** Digital signature (hash) */
  readonly signature: string | null;
  /** Comments from signer */
  readonly comments: string | null;
}

/**
 * A certification package bundling verification results.
 */
export interface CertificationPackage {
  /** Unique package identifier */
  readonly id: string;
  /** Package title */
  readonly title: string;
  /** Package description */
  readonly description: string;
  /** Certification level */
  readonly level: CertificationLevel;
  /** Current status */
  readonly status: CertificationStatus;
  /** Overall confidence score */
  readonly overallConfidence: ConfidenceScore;
  /** Statistics summary */
  readonly stats: CertificationStats;
  /** IDs of claims included */
  readonly claimIds: readonly string[];
  /** IDs of verification results included */
  readonly verificationIds: readonly string[];
  /** IDs of sources referenced */
  readonly sourceIds: readonly string[];
  /** IDs of evidence pieces included */
  readonly evidenceIds: readonly string[];
  /** Audit trail entries */
  readonly auditTrail: readonly AuditEntry[];
  /** Signers who approved */
  readonly signers: readonly CertificationSigner[];
  /** ID of the agent/user who created this */
  readonly createdBy: string;
  /** When the package was created */
  readonly createdAt: TimestampValue;
  /** When the package was last updated */
  readonly updatedAt: TimestampValue;
  /** When the certification expires */
  readonly expiresAt: TimestampValue | null;
  /** Version of the certification package format */
  readonly version: string;
  /** Hash of the package contents for integrity */
  readonly contentHash: string | null;
  /** Custom metadata */
  readonly metadata: Readonly<Record<string, unknown>>;
  /** Tags for categorization */
  readonly tags: readonly string[];
}

/**
 * Partial certification package for creation/updates.
 */
export type PartialCertificationPackage = Partial<Omit<CertificationPackage, 'id'>> &
  Pick<CertificationPackage, 'id'>;

/**
 * Creates an audit entry.
 */
export function createAuditEntry(
  overrides: Partial<AuditEntry> &
    Pick<AuditEntry, 'id' | 'entityId' | 'entityType' | 'action' | 'actorId'>
): AuditEntry {
  return {
    id: overrides.id,
    entityId: overrides.entityId,
    entityType: overrides.entityType,
    action: overrides.action,
    actorId: overrides.actorId,
    actorType: overrides.actorType ?? 'system',
    timestamp: overrides.timestamp ?? Date.now(),
    previousState: overrides.previousState ?? null,
    newState: overrides.newState ?? null,
    reason: overrides.reason ?? null,
    sourceIdentifier: overrides.sourceIdentifier ?? null,
    context: overrides.context ?? {},
  };
}

/**
 * Creates default certification stats.
 */
export function createCertificationStats(
  overrides: Partial<CertificationStats> = {}
): CertificationStats {
  return {
    totalClaims: overrides.totalClaims ?? 0,
    verifiedClaims: overrides.verifiedClaims ?? 0,
    refutedClaims: overrides.refutedClaims ?? 0,
    inconclusiveClaims: overrides.inconclusiveClaims ?? 0,
    totalSources: overrides.totalSources ?? 0,
    totalEvidence: overrides.totalEvidence ?? 0,
    averageConfidence: overrides.averageConfidence ?? 0,
    verificationRate: overrides.verificationRate ?? 0,
  };
}

/**
 * Creates a certification package with default values.
 */
export function createCertificationPackage(
  overrides: Partial<CertificationPackage> &
    Pick<CertificationPackage, 'id' | 'title' | 'createdBy'>
): CertificationPackage {
  const now = Date.now();
  return {
    id: overrides.id,
    title: overrides.title,
    description: overrides.description ?? '',
    level: overrides.level ?? 'standard',
    status: overrides.status ?? 'draft',
    overallConfidence: overrides.overallConfidence ?? {
      value: 0,
      lowerBound: 0,
      upperBound: 0,
      explanation: null,
      factors: [],
    },
    stats: overrides.stats ?? createCertificationStats(),
    claimIds: overrides.claimIds ?? [],
    verificationIds: overrides.verificationIds ?? [],
    sourceIds: overrides.sourceIds ?? [],
    evidenceIds: overrides.evidenceIds ?? [],
    auditTrail: overrides.auditTrail ?? [],
    signers: overrides.signers ?? [],
    createdBy: overrides.createdBy,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    expiresAt: overrides.expiresAt ?? null,
    version: overrides.version ?? '1.0.0',
    contentHash: overrides.contentHash ?? null,
    metadata: overrides.metadata ?? {},
    tags: overrides.tags ?? [],
  };
}

/**
 * Checks if a certification is valid (approved and not expired/revoked).
 */
export function isCertificationValid(pkg: CertificationPackage): boolean {
  if (pkg.status !== 'approved') {
    return false;
  }
  if (pkg.expiresAt !== null) {
    const expiresAtMs = typeof pkg.expiresAt === 'string'
      ? new Date(pkg.expiresAt).getTime()
      : pkg.expiresAt;
    if (expiresAtMs < Date.now()) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if a certification needs review.
 */
export function needsReview(pkg: CertificationPackage): boolean {
  return pkg.status === 'draft' || pkg.status === 'pending_review';
}

/**
 * Calculates certification stats from verification results.
 */
export function calculateCertificationStats(
  verificationResults: readonly VerificationResult[],
  sourceCount: number,
  evidenceCount: number
): CertificationStats {
  const totalClaims = verificationResults.length;
  const verifiedClaims = verificationResults.filter(
    (r) => r.outcome === 'verified' || r.outcome === 'partially_verified'
  ).length;
  const refutedClaims = verificationResults.filter(
    (r) => r.outcome === 'refuted'
  ).length;
  const inconclusiveClaims = verificationResults.filter(
    (r) =>
      r.outcome === 'inconclusive' ||
      r.outcome === 'insufficient_evidence' ||
      r.outcome === 'contradictory_evidence'
  ).length;

  const confidenceSum = verificationResults.reduce(
    (sum, r) => sum + r.confidence.value,
    0
  );
  const averageConfidence =
    totalClaims > 0 ? confidenceSum / totalClaims : 0;
  const verificationRate = totalClaims > 0 ? verifiedClaims / totalClaims : 0;

  return {
    totalClaims,
    verifiedClaims,
    refutedClaims,
    inconclusiveClaims,
    totalSources: sourceCount,
    totalEvidence: evidenceCount,
    averageConfidence,
    verificationRate,
  };
}

/**
 * Adds an audit entry to a certification package.
 */
export function addAuditEntry(
  pkg: CertificationPackage,
  entry: AuditEntry
): CertificationPackage {
  return {
    ...pkg,
    auditTrail: [...pkg.auditTrail, entry],
    updatedAt: Date.now(),
  };
}

/**
 * Determines certification level based on stats.
 */
export function determineCertificationLevel(
  stats: CertificationStats
): CertificationLevel {
  const { verificationRate, averageConfidence, totalSources, totalEvidence } = stats;

  if (
    verificationRate >= 0.95 &&
    averageConfidence >= 0.9 &&
    totalSources >= 10 &&
    totalEvidence >= 20
  ) {
    return 'comprehensive';
  }

  if (
    verificationRate >= 0.8 &&
    averageConfidence >= 0.8 &&
    totalSources >= 5 &&
    totalEvidence >= 10
  ) {
    return 'enhanced';
  }

  if (verificationRate >= 0.6 && averageConfidence >= 0.6) {
    return 'standard';
  }

  return 'preliminary';
}
