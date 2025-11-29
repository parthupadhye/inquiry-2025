/**
 * Neo4j Node Type Definitions for the Inquiry Framework.
 *
 * Core node types for claim verification:
 * - Claim: A statement or assertion to be verified
 * - Source: An information source with credibility metrics
 * - Evidence: Supporting or refuting information for claims
 * - Content: Briefs, reports, and deliverables
 */

// =============================================================================
// Common Types
// =============================================================================

/**
 * Base properties shared by all nodes.
 */
export interface BaseNodeProperties {
  /** Unique identifier (UUID) */
  id: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Soft delete timestamp (null if not deleted) */
  deletedAt: string | null;
}

/**
 * Verification status for claims.
 */
export type VerificationStatus =
  | 'unverified'
  | 'verified_true'
  | 'verified_false'
  | 'partially_true'
  | 'unverifiable'
  | 'in_progress';

/**
 * Confidence level for assessments.
 */
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very_high';

/**
 * Source type classification.
 */
export type SourceType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'official'
  | 'academic'
  | 'news'
  | 'social_media'
  | 'expert'
  | 'eyewitness'
  | 'document'
  | 'database'
  | 'other';

/**
 * Evidence type classification.
 */
export type EvidenceType =
  | 'supporting'
  | 'refuting'
  | 'neutral'
  | 'contextual'
  | 'corroborating';

/**
 * Content type classification.
 */
export type ContentType =
  | 'brief'
  | 'report'
  | 'summary'
  | 'analysis'
  | 'timeline'
  | 'fact_check'
  | 'raw_notes';

// =============================================================================
// Claim Node
// =============================================================================

/**
 * Properties for a Claim node.
 * A claim is a statement or assertion that can be verified.
 */
export interface ClaimProperties extends BaseNodeProperties {
  /** The claim text/statement */
  text: string;
  /** Normalized/canonical form of the claim */
  normalizedText: string | null;
  /** Current verification status */
  status: VerificationStatus;
  /** Confidence in the verification */
  confidence: ConfidenceLevel | null;
  /** Confidence score (0-1) */
  confidenceScore: number | null;
  /** Category/topic of the claim */
  category: string | null;
  /** Tags for classification */
  tags: string[];
  /** Original source where claim was found */
  originalSource: string | null;
  /** Date the claim was made (if known) */
  claimDate: string | null;
  /** Who made the claim (if known) */
  claimant: string | null;
  /** Priority for verification (1-5) */
  priority: number;
  /** Agent that created this claim */
  createdBy: string | null;
  /** Additional metadata */
  metadata: string | null;
}

/**
 * Input for creating a new Claim.
 */
export interface CreateClaimInput {
  text: string;
  normalizedText?: string | null;
  status?: VerificationStatus;
  category?: string | null;
  tags?: string[];
  originalSource?: string | null;
  claimDate?: string | null;
  claimant?: string | null;
  priority?: number;
  createdBy?: string | null;
  metadata?: string | null;
}

/**
 * Input for updating a Claim.
 */
export interface UpdateClaimInput {
  text?: string;
  normalizedText?: string | null;
  status?: VerificationStatus;
  confidence?: ConfidenceLevel | null;
  confidenceScore?: number | null;
  category?: string | null;
  tags?: string[];
  priority?: number;
  metadata?: string | null;
}

/**
 * Filter criteria for querying Claims.
 */
export interface ClaimFilter {
  id?: string;
  status?: VerificationStatus;
  confidence?: ConfidenceLevel;
  category?: string;
  tags?: string[];
  priority?: number;
  createdBy?: string;
  createdAfter?: string;
  createdBefore?: string;
}

// =============================================================================
// Source Node
// =============================================================================

/**
 * Properties for a Source node.
 * A source is an information provider with credibility metrics.
 */
export interface SourceProperties extends BaseNodeProperties {
  /** Source name/title */
  name: string;
  /** Source type classification */
  type: SourceType;
  /** URL if applicable */
  url: string | null;
  /** Description of the source */
  description: string | null;
  /** Credibility score (0-1) */
  credibilityScore: number;
  /** Reliability rating */
  reliability: ConfidenceLevel;
  /** Bias assessment (-1 to 1, 0 is neutral) */
  biasScore: number | null;
  /** Bias direction description */
  biasDirection: string | null;
  /** Number of times cited */
  citationCount: number;
  /** Number of verified claims from this source */
  verifiedCount: number;
  /** Number of false claims from this source */
  falseCount: number;
  /** Last verification date */
  lastVerified: string | null;
  /** Domain/field of expertise */
  domain: string | null;
  /** Geographic region/country */
  region: string | null;
  /** Language */
  language: string;
  /** Whether the source is active */
  isActive: boolean;
  /** Additional metadata */
  metadata: string | null;
}

/**
 * Input for creating a new Source.
 */
export interface CreateSourceInput {
  name: string;
  type: SourceType;
  url?: string | null;
  description?: string | null;
  credibilityScore?: number;
  reliability?: ConfidenceLevel;
  biasScore?: number | null;
  biasDirection?: string | null;
  domain?: string | null;
  region?: string | null;
  language?: string;
  metadata?: string | null;
}

/**
 * Input for updating a Source.
 */
export interface UpdateSourceInput {
  name?: string;
  type?: SourceType;
  url?: string | null;
  description?: string | null;
  credibilityScore?: number;
  reliability?: ConfidenceLevel;
  biasScore?: number | null;
  biasDirection?: string | null;
  domain?: string | null;
  region?: string | null;
  isActive?: boolean;
  metadata?: string | null;
}

/**
 * Filter criteria for querying Sources.
 */
export interface SourceFilter {
  id?: string;
  name?: string;
  type?: SourceType;
  minCredibility?: number;
  reliability?: ConfidenceLevel;
  domain?: string;
  region?: string;
  isActive?: boolean;
}

// =============================================================================
// Evidence Node
// =============================================================================

/**
 * Properties for an Evidence node.
 * Evidence supports or refutes a claim.
 */
export interface EvidenceProperties extends BaseNodeProperties {
  /** Evidence content/description */
  content: string;
  /** Summary of the evidence */
  summary: string | null;
  /** Type of evidence */
  type: EvidenceType;
  /** Strength of the evidence (0-1) */
  strength: number;
  /** Relevance to the claim (0-1) */
  relevance: number;
  /** Quality assessment (0-1) */
  quality: number;
  /** Date the evidence was collected */
  collectedAt: string;
  /** URL or reference to original */
  sourceUrl: string | null;
  /** Page number or location reference */
  sourceLocation: string | null;
  /** Quote or excerpt */
  excerpt: string | null;
  /** Whether evidence has been verified */
  isVerified: boolean;
  /** Agent that collected this evidence */
  collectedBy: string | null;
  /** Method of collection */
  collectionMethod: string | null;
  /** Additional metadata */
  metadata: string | null;
}

/**
 * Input for creating new Evidence.
 */
export interface CreateEvidenceInput {
  content: string;
  summary?: string | null;
  type: EvidenceType;
  strength?: number;
  relevance?: number;
  quality?: number;
  sourceUrl?: string | null;
  sourceLocation?: string | null;
  excerpt?: string | null;
  collectedBy?: string | null;
  collectionMethod?: string | null;
  metadata?: string | null;
}

/**
 * Input for updating Evidence.
 */
export interface UpdateEvidenceInput {
  content?: string;
  summary?: string | null;
  type?: EvidenceType;
  strength?: number;
  relevance?: number;
  quality?: number;
  isVerified?: boolean;
  metadata?: string | null;
}

/**
 * Filter criteria for querying Evidence.
 */
export interface EvidenceFilter {
  id?: string;
  type?: EvidenceType;
  minStrength?: number;
  minRelevance?: number;
  isVerified?: boolean;
  collectedBy?: string;
  collectedAfter?: string;
}

// =============================================================================
// Content Node
// =============================================================================

/**
 * Properties for a Content node.
 * Content represents briefs, reports, and deliverables.
 */
export interface ContentProperties extends BaseNodeProperties {
  /** Content title */
  title: string;
  /** Content body/text */
  body: string;
  /** Content type */
  type: ContentType;
  /** Brief summary */
  summary: string | null;
  /** Current status */
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  /** Version number */
  version: number;
  /** Word count */
  wordCount: number;
  /** Author/creator */
  author: string | null;
  /** Reviewer if applicable */
  reviewer: string | null;
  /** Publication date */
  publishedAt: string | null;
  /** Target audience */
  audience: string | null;
  /** Classification level */
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  /** Tags for categorization */
  tags: string[];
  /** Additional metadata */
  metadata: string | null;
}

/**
 * Input for creating new Content.
 */
export interface CreateContentInput {
  title: string;
  body: string;
  type: ContentType;
  summary?: string | null;
  status?: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  author?: string | null;
  audience?: string | null;
  classification?: 'public' | 'internal' | 'confidential' | 'restricted';
  tags?: string[];
  metadata?: string | null;
}

/**
 * Input for updating Content.
 */
export interface UpdateContentInput {
  title?: string;
  body?: string;
  summary?: string | null;
  status?: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  reviewer?: string | null;
  audience?: string | null;
  classification?: 'public' | 'internal' | 'confidential' | 'restricted';
  tags?: string[];
  metadata?: string | null;
}

/**
 * Filter criteria for querying Content.
 */
export interface ContentFilter {
  id?: string;
  title?: string;
  type?: ContentType;
  status?: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  author?: string;
  classification?: 'public' | 'internal' | 'confidential' | 'restricted';
  tags?: string[];
  publishedAfter?: string;
}

// =============================================================================
// Node Labels
// =============================================================================

/**
 * All node labels in the graph.
 */
export const NodeLabels = {
  Claim: 'Claim',
  Source: 'Source',
  Evidence: 'Evidence',
  Content: 'Content',
} as const;

export type NodeLabel = (typeof NodeLabels)[keyof typeof NodeLabels];

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Checks if a value is a valid VerificationStatus.
 */
export function isVerificationStatus(value: unknown): value is VerificationStatus {
  return (
    typeof value === 'string' &&
    ['unverified', 'verified_true', 'verified_false', 'partially_true', 'unverifiable', 'in_progress'].includes(value)
  );
}

/**
 * Checks if a value is a valid ConfidenceLevel.
 */
export function isConfidenceLevel(value: unknown): value is ConfidenceLevel {
  return (
    typeof value === 'string' &&
    ['low', 'medium', 'high', 'very_high'].includes(value)
  );
}

/**
 * Checks if a value is a valid SourceType.
 */
export function isSourceType(value: unknown): value is SourceType {
  return (
    typeof value === 'string' &&
    ['primary', 'secondary', 'tertiary', 'official', 'academic', 'news', 'social_media', 'expert', 'eyewitness', 'document', 'database', 'other'].includes(value)
  );
}

/**
 * Checks if a value is a valid EvidenceType.
 */
export function isEvidenceType(value: unknown): value is EvidenceType {
  return (
    typeof value === 'string' &&
    ['supporting', 'refuting', 'neutral', 'contextual', 'corroborating'].includes(value)
  );
}
