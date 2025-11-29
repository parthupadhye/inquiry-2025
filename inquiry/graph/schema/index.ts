/**
 * Neo4j Graph Schema for the Inquiry Framework.
 *
 * Exports all node types, relationship types, and related utilities
 * for the claim verification knowledge graph.
 */

// =============================================================================
// Node Types
// =============================================================================

export {
  // Base types
  type BaseNodeProperties,
  type VerificationStatus,
  type ConfidenceLevel,
  type SourceType,
  type EvidenceType,
  type ContentType,

  // Claim
  type ClaimProperties,
  type CreateClaimInput,
  type UpdateClaimInput,
  type ClaimFilter,

  // Source
  type SourceProperties,
  type CreateSourceInput,
  type UpdateSourceInput,
  type SourceFilter,

  // Evidence
  type EvidenceProperties,
  type CreateEvidenceInput,
  type UpdateEvidenceInput,
  type EvidenceFilter,

  // Content
  type ContentProperties,
  type CreateContentInput,
  type UpdateContentInput,
  type ContentFilter,

  // Labels and type guards
  NodeLabels,
  type NodeLabel,
  isVerificationStatus,
  isConfidenceLevel,
  isSourceType,
  isEvidenceType,
} from './nodes.js';

// =============================================================================
// Relationship Types
// =============================================================================

export {
  // Base types
  type BaseRelationshipProperties,

  // CONTAINS_CLAIM
  type ContainsClaimProperties,
  type CreateContainsClaimInput,

  // SUPPORTED_BY
  type SupportedByProperties,
  type CreateSupportedByInput,

  // REFUTED_BY
  type RefutedByProperties,
  type CreateRefutedByInput,

  // DERIVED_FROM
  type DerivedFromProperties,
  type CreateDerivedFromInput,

  // CITES
  type CitesProperties,
  type CreateCitesInput,

  // RELATED_TO
  type RelatedToProperties,
  type CreateRelatedToInput,

  // CONTRADICTS
  type ContradictProperties,
  type CreateContradictInput,

  // SUPERSEDES
  type SupersedesProperties,
  type CreateSupersedesInput,

  // Relationship constants
  RelationshipTypes,
  type RelationshipType,
  RelationshipPatterns,
  type AnyRelationshipProperties,
} from './relationships.js';

// =============================================================================
// Re-export generated node types
// =============================================================================

// Export any generated node types from the nodes directory
export * from './nodes/index.js';
