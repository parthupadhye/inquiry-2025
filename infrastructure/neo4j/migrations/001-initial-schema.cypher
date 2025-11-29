// =============================================================================
// Inquiry Framework - Initial Graph Schema Migration
// Version: 001
// Description: Creates core node constraints, indexes, and relationship patterns
// =============================================================================

// -----------------------------------------------------------------------------
// CONSTRAINTS - Unique Identifiers
// -----------------------------------------------------------------------------

// Claim node constraints
CREATE CONSTRAINT claim_id_unique IF NOT EXISTS
FOR (n:Claim)
REQUIRE n.id IS UNIQUE;

// Source node constraints
CREATE CONSTRAINT source_id_unique IF NOT EXISTS
FOR (n:Source)
REQUIRE n.id IS UNIQUE;

// Evidence node constraints
CREATE CONSTRAINT evidence_id_unique IF NOT EXISTS
FOR (n:Evidence)
REQUIRE n.id IS UNIQUE;

// Content node constraints
CREATE CONSTRAINT content_id_unique IF NOT EXISTS
FOR (n:Content)
REQUIRE n.id IS UNIQUE;

// -----------------------------------------------------------------------------
// INDEXES - Claim Node
// -----------------------------------------------------------------------------

// Status index for filtering claims by verification status
CREATE INDEX claim_status_idx IF NOT EXISTS
FOR (n:Claim)
ON (n.status);

// Category index for grouping claims
CREATE INDEX claim_category_idx IF NOT EXISTS
FOR (n:Claim)
ON (n.category);

// Priority index for ordering claims
CREATE INDEX claim_priority_idx IF NOT EXISTS
FOR (n:Claim)
ON (n.priority);

// CreatedAt index for temporal queries
CREATE INDEX claim_createdAt_idx IF NOT EXISTS
FOR (n:Claim)
ON (n.createdAt);

// CreatedBy index for agent tracking
CREATE INDEX claim_createdBy_idx IF NOT EXISTS
FOR (n:Claim)
ON (n.createdBy);

// Composite index for status + priority queries
CREATE INDEX claim_status_priority_idx IF NOT EXISTS
FOR (n:Claim)
ON (n.status, n.priority);

// -----------------------------------------------------------------------------
// INDEXES - Source Node
// -----------------------------------------------------------------------------

// Name index for searching sources
CREATE INDEX source_name_idx IF NOT EXISTS
FOR (n:Source)
ON (n.name);

// Type index for filtering by source type
CREATE INDEX source_type_idx IF NOT EXISTS
FOR (n:Source)
ON (n.type);

// Credibility index for filtering reliable sources
CREATE INDEX source_credibility_idx IF NOT EXISTS
FOR (n:Source)
ON (n.credibilityScore);

// Domain index for expertise filtering
CREATE INDEX source_domain_idx IF NOT EXISTS
FOR (n:Source)
ON (n.domain);

// Active status index
CREATE INDEX source_isActive_idx IF NOT EXISTS
FOR (n:Source)
ON (n.isActive);

// -----------------------------------------------------------------------------
// INDEXES - Evidence Node
// -----------------------------------------------------------------------------

// Type index for evidence classification
CREATE INDEX evidence_type_idx IF NOT EXISTS
FOR (n:Evidence)
ON (n.type);

// Strength index for filtering strong evidence
CREATE INDEX evidence_strength_idx IF NOT EXISTS
FOR (n:Evidence)
ON (n.strength);

// Verified status index
CREATE INDEX evidence_isVerified_idx IF NOT EXISTS
FOR (n:Evidence)
ON (n.isVerified);

// CollectedAt index for temporal queries
CREATE INDEX evidence_collectedAt_idx IF NOT EXISTS
FOR (n:Evidence)
ON (n.collectedAt);

// CollectedBy index for agent tracking
CREATE INDEX evidence_collectedBy_idx IF NOT EXISTS
FOR (n:Evidence)
ON (n.collectedBy);

// -----------------------------------------------------------------------------
// INDEXES - Content Node
// -----------------------------------------------------------------------------

// Title index for searching content
CREATE INDEX content_title_idx IF NOT EXISTS
FOR (n:Content)
ON (n.title);

// Type index for content classification
CREATE INDEX content_type_idx IF NOT EXISTS
FOR (n:Content)
ON (n.type);

// Status index for workflow filtering
CREATE INDEX content_status_idx IF NOT EXISTS
FOR (n:Content)
ON (n.status);

// Author index for attribution
CREATE INDEX content_author_idx IF NOT EXISTS
FOR (n:Content)
ON (n.author);

// Classification index for access control
CREATE INDEX content_classification_idx IF NOT EXISTS
FOR (n:Content)
ON (n.classification);

// PublishedAt index for temporal queries
CREATE INDEX content_publishedAt_idx IF NOT EXISTS
FOR (n:Content)
ON (n.publishedAt);

// -----------------------------------------------------------------------------
// FULL-TEXT INDEXES (for search functionality)
// -----------------------------------------------------------------------------

// Full-text search on Claim text
CREATE FULLTEXT INDEX claim_fulltext IF NOT EXISTS
FOR (n:Claim)
ON EACH [n.text, n.normalizedText];

// Full-text search on Source
CREATE FULLTEXT INDEX source_fulltext IF NOT EXISTS
FOR (n:Source)
ON EACH [n.name, n.description];

// Full-text search on Evidence
CREATE FULLTEXT INDEX evidence_fulltext IF NOT EXISTS
FOR (n:Evidence)
ON EACH [n.content, n.summary, n.excerpt];

// Full-text search on Content
CREATE FULLTEXT INDEX content_fulltext IF NOT EXISTS
FOR (n:Content)
ON EACH [n.title, n.body, n.summary];

// -----------------------------------------------------------------------------
// RELATIONSHIP INDEXES
// -----------------------------------------------------------------------------

// Index on relationship creation time for temporal queries
// Note: Neo4j 5.x+ supports relationship property indexes

// SUPPORTED_BY relationship index on strength
CREATE INDEX supported_by_strength_idx IF NOT EXISTS
FOR ()-[r:SUPPORTED_BY]-()
ON (r.strength);

// REFUTED_BY relationship index on strength
CREATE INDEX refuted_by_strength_idx IF NOT EXISTS
FOR ()-[r:REFUTED_BY]-()
ON (r.strength);

// DERIVED_FROM relationship index on derivedAt
CREATE INDEX derived_from_date_idx IF NOT EXISTS
FOR ()-[r:DERIVED_FROM]-()
ON (r.derivedAt);

// RELATED_TO relationship index on relationType
CREATE INDEX related_to_type_idx IF NOT EXISTS
FOR ()-[r:RELATED_TO]-()
ON (r.relationType);

// -----------------------------------------------------------------------------
// VERIFICATION QUERIES
// -----------------------------------------------------------------------------

// Verify all constraints are created
// SHOW CONSTRAINTS;

// Verify all indexes are created
// SHOW INDEXES;

// Get schema summary
// CALL db.schema.visualization();
