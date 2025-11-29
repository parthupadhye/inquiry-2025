/**
 * Neo4j Relationship Type Definitions for the Inquiry Framework.
 *
 * Core relationships:
 * - CONTAINS_CLAIM: Content contains a claim
 * - SUPPORTED_BY: Claim is supported by evidence
 * - REFUTED_BY: Claim is refuted by evidence
 * - DERIVED_FROM: Evidence or claim derived from a source
 * - CITES: Content or evidence cites a source
 * - RELATED_TO: Claims are related to each other
 * - CONTRADICTS: Claims contradict each other
 * - SUPERSEDES: Newer claim supersedes an older one
 */

// =============================================================================
// Base Relationship Properties
// =============================================================================

/**
 * Base properties shared by all relationships.
 */
export interface BaseRelationshipProperties {
  /** Relationship creation timestamp */
  createdAt: string;
  /** Agent/user that created the relationship */
  createdBy: string | null;
  /** Additional notes */
  notes: string | null;
}

// =============================================================================
// CONTAINS_CLAIM Relationship
// =============================================================================

/**
 * Properties for CONTAINS_CLAIM relationship.
 * Links Content to Claims extracted from it.
 *
 * Direction: (Content)-[:CONTAINS_CLAIM]->(Claim)
 */
export interface ContainsClaimProperties extends BaseRelationshipProperties {
  /** Position/order of claim in content */
  position: number | null;
  /** Section of content where claim appears */
  section: string | null;
  /** Whether claim is explicitly stated or inferred */
  isExplicit: boolean;
  /** Confidence in extraction (0-1) */
  extractionConfidence: number;
  /** Extraction method used */
  extractionMethod: string | null;
}

/**
 * Input for creating CONTAINS_CLAIM relationship.
 */
export interface CreateContainsClaimInput {
  position?: number | null;
  section?: string | null;
  isExplicit?: boolean;
  extractionConfidence?: number;
  extractionMethod?: string | null;
  createdBy?: string | null;
  notes?: string | null;
}

// =============================================================================
// SUPPORTED_BY / REFUTED_BY Relationships
// =============================================================================

/**
 * Properties for SUPPORTED_BY relationship.
 * Links Claim to supporting Evidence.
 *
 * Direction: (Claim)-[:SUPPORTED_BY]->(Evidence)
 */
export interface SupportedByProperties extends BaseRelationshipProperties {
  /** Strength of support (0-1) */
  strength: number;
  /** Relevance of evidence to claim (0-1) */
  relevance: number;
  /** Specific aspect of claim being supported */
  aspect: string | null;
  /** Whether support is direct or indirect */
  isDirect: boolean;
  /** Explanation of how evidence supports claim */
  reasoning: string | null;
}

/**
 * Input for creating SUPPORTED_BY relationship.
 */
export interface CreateSupportedByInput {
  strength?: number;
  relevance?: number;
  aspect?: string | null;
  isDirect?: boolean;
  reasoning?: string | null;
  createdBy?: string | null;
  notes?: string | null;
}

/**
 * Properties for REFUTED_BY relationship.
 * Links Claim to refuting Evidence.
 *
 * Direction: (Claim)-[:REFUTED_BY]->(Evidence)
 */
export interface RefutedByProperties extends BaseRelationshipProperties {
  /** Strength of refutation (0-1) */
  strength: number;
  /** Relevance of evidence to claim (0-1) */
  relevance: number;
  /** Specific aspect of claim being refuted */
  aspect: string | null;
  /** Whether refutation is direct or indirect */
  isDirect: boolean;
  /** Explanation of how evidence refutes claim */
  reasoning: string | null;
}

/**
 * Input for creating REFUTED_BY relationship.
 */
export interface CreateRefutedByInput {
  strength?: number;
  relevance?: number;
  aspect?: string | null;
  isDirect?: boolean;
  reasoning?: string | null;
  createdBy?: string | null;
  notes?: string | null;
}

// =============================================================================
// DERIVED_FROM Relationship
// =============================================================================

/**
 * Properties for DERIVED_FROM relationship.
 * Links Evidence or Claim to its original Source.
 *
 * Directions:
 * - (Evidence)-[:DERIVED_FROM]->(Source)
 * - (Claim)-[:DERIVED_FROM]->(Source)
 */
export interface DerivedFromProperties extends BaseRelationshipProperties {
  /** Date information was derived */
  derivedAt: string;
  /** Specific location in source (page, section, etc.) */
  sourceLocation: string | null;
  /** Direct quote from source */
  quote: string | null;
  /** Access date for online sources */
  accessedAt: string | null;
  /** Whether the derivation is direct or interpreted */
  isDirect: boolean;
  /** Transformation or interpretation applied */
  transformation: string | null;
}

/**
 * Input for creating DERIVED_FROM relationship.
 */
export interface CreateDerivedFromInput {
  sourceLocation?: string | null;
  quote?: string | null;
  accessedAt?: string | null;
  isDirect?: boolean;
  transformation?: string | null;
  createdBy?: string | null;
  notes?: string | null;
}

// =============================================================================
// CITES Relationship
// =============================================================================

/**
 * Properties for CITES relationship.
 * Links Content or Evidence to Sources it references.
 *
 * Directions:
 * - (Content)-[:CITES]->(Source)
 * - (Evidence)-[:CITES]->(Source)
 */
export interface CitesProperties extends BaseRelationshipProperties {
  /** Citation format/style */
  citationStyle: string | null;
  /** Full citation text */
  citationText: string | null;
  /** Position in reference list */
  referenceNumber: number | null;
  /** Purpose of citation */
  purpose: 'support' | 'context' | 'counter' | 'example' | 'definition' | 'other';
}

/**
 * Input for creating CITES relationship.
 */
export interface CreateCitesInput {
  citationStyle?: string | null;
  citationText?: string | null;
  referenceNumber?: number | null;
  purpose?: 'support' | 'context' | 'counter' | 'example' | 'definition' | 'other';
  createdBy?: string | null;
  notes?: string | null;
}

// =============================================================================
// RELATED_TO Relationship
// =============================================================================

/**
 * Properties for RELATED_TO relationship.
 * Links related Claims to each other.
 *
 * Direction: (Claim)-[:RELATED_TO]->(Claim)
 */
export interface RelatedToProperties extends BaseRelationshipProperties {
  /** Type of relationship */
  relationType: 'similar' | 'broader' | 'narrower' | 'prerequisite' | 'consequence' | 'alternative' | 'other';
  /** Strength of relationship (0-1) */
  strength: number;
  /** Semantic similarity score (0-1) */
  similarity: number | null;
  /** Explanation of relationship */
  explanation: string | null;
}

/**
 * Input for creating RELATED_TO relationship.
 */
export interface CreateRelatedToInput {
  relationType: 'similar' | 'broader' | 'narrower' | 'prerequisite' | 'consequence' | 'alternative' | 'other';
  strength?: number;
  similarity?: number | null;
  explanation?: string | null;
  createdBy?: string | null;
  notes?: string | null;
}

// =============================================================================
// CONTRADICTS Relationship
// =============================================================================

/**
 * Properties for CONTRADICTS relationship.
 * Links Claims that contradict each other.
 *
 * Direction: (Claim)-[:CONTRADICTS]->(Claim)
 */
export interface ContradictProperties extends BaseRelationshipProperties {
  /** Type of contradiction */
  contradictionType: 'direct' | 'partial' | 'contextual' | 'temporal';
  /** Severity of contradiction (0-1) */
  severity: number;
  /** Specific points of contradiction */
  points: string | null;
  /** Possible resolution */
  resolution: string | null;
}

/**
 * Input for creating CONTRADICTS relationship.
 */
export interface CreateContradictInput {
  contradictionType?: 'direct' | 'partial' | 'contextual' | 'temporal';
  severity?: number;
  points?: string | null;
  resolution?: string | null;
  createdBy?: string | null;
  notes?: string | null;
}

// =============================================================================
// SUPERSEDES Relationship
// =============================================================================

/**
 * Properties for SUPERSEDES relationship.
 * Links newer Claims that supersede older ones.
 *
 * Direction: (NewerClaim)-[:SUPERSEDES]->(OlderClaim)
 */
export interface SupersedesProperties extends BaseRelationshipProperties {
  /** Reason for supersession */
  reason: 'correction' | 'update' | 'refinement' | 'retraction' | 'clarification';
  /** Date of supersession */
  supersededAt: string;
  /** Whether the older claim is fully or partially superseded */
  isComplete: boolean;
  /** Explanation of changes */
  changes: string | null;
}

/**
 * Input for creating SUPERSEDES relationship.
 */
export interface CreateSupersedesInput {
  reason: 'correction' | 'update' | 'refinement' | 'retraction' | 'clarification';
  isComplete?: boolean;
  changes?: string | null;
  createdBy?: string | null;
  notes?: string | null;
}

// =============================================================================
// Relationship Types
// =============================================================================

/**
 * All relationship types in the graph.
 */
export const RelationshipTypes = {
  CONTAINS_CLAIM: 'CONTAINS_CLAIM',
  SUPPORTED_BY: 'SUPPORTED_BY',
  REFUTED_BY: 'REFUTED_BY',
  DERIVED_FROM: 'DERIVED_FROM',
  CITES: 'CITES',
  RELATED_TO: 'RELATED_TO',
  CONTRADICTS: 'CONTRADICTS',
  SUPERSEDES: 'SUPERSEDES',
} as const;

export type RelationshipType = (typeof RelationshipTypes)[keyof typeof RelationshipTypes];

// =============================================================================
// Relationship Direction Constraints
// =============================================================================

/**
 * Valid relationship patterns in the graph.
 * Defines which node types can be connected by each relationship.
 */
export const RelationshipPatterns = {
  CONTAINS_CLAIM: { from: 'Content', to: 'Claim' },
  SUPPORTED_BY: { from: 'Claim', to: 'Evidence' },
  REFUTED_BY: { from: 'Claim', to: 'Evidence' },
  DERIVED_FROM: { from: ['Evidence', 'Claim'], to: 'Source' },
  CITES: { from: ['Content', 'Evidence'], to: 'Source' },
  RELATED_TO: { from: 'Claim', to: 'Claim' },
  CONTRADICTS: { from: 'Claim', to: 'Claim' },
  SUPERSEDES: { from: 'Claim', to: 'Claim' },
} as const;

// =============================================================================
// Union Types for All Relationship Properties
// =============================================================================

/**
 * Union of all relationship property types.
 */
export type AnyRelationshipProperties =
  | ContainsClaimProperties
  | SupportedByProperties
  | RefutedByProperties
  | DerivedFromProperties
  | CitesProperties
  | RelatedToProperties
  | ContradictProperties
  | SupersedesProperties;
