# Neo4j Schema Guide

## Overview

The Inquiry Framework uses Neo4j as its knowledge graph database. This guide covers schema design, node and relationship types, queries, and best practices.

---

## Core Schema

### The Inquiry Graph Model

```
┌─────────────┐         ┌─────────────┐
│   Content   │────────▶│    Claim    │
│  (Brief,    │ CONTAINS│  (Factual,  │
│ Deliverable)│ _CLAIM  │   Stats,    │
└─────────────┘         │Comparative) │
                        └──────┬──────┘
                               │
                    SUPPORTED_ │ _BY
                               ▼
                        ┌─────────────┐
                        │   Source    │
                        │ (Document,  │
                        │   Study,    │
                        │   Website)  │
                        └──────┬──────┘
                               │
                        CONTAINS
                               │
                               ▼
                        ┌─────────────┐
                        │  Evidence   │
                        │  (Quote,    │
                        │   Statistic,│
                        │   Finding)  │
                        └─────────────┘
```

---

## Node Types

### Content

Represents briefs, deliverables, and other content being verified.

```cypher
// Schema
(:Content {
  id: String!,           // Unique identifier
  type: String!,         // 'brief' | 'deliverable' | 'article' | 'webpage'
  title: String,
  content: String,       // Full text content
  contentHash: String,   // SHA-256 of content for deduplication
  status: String,        // 'draft' | 'verified' | 'approved' | 'rejected'
  
  // Metadata
  clientId: String,
  projectId: String,
  createdBy: String,
  createdAt: DateTime!,
  updatedAt: DateTime!,
  
  // Verification summary
  claimCount: Integer,
  verifiedCount: Integer,
  riskScore: Float
})

// Indexes
CREATE INDEX content_id FOR (c:Content) ON (c.id);
CREATE INDEX content_type FOR (c:Content) ON (c.type);
CREATE INDEX content_status FOR (c:Content) ON (c.status);
CREATE INDEX content_client FOR (c:Content) ON (c.clientId);

// Constraints
CREATE CONSTRAINT content_id_unique FOR (c:Content) REQUIRE c.id IS UNIQUE;
```

**TypeScript Interface:**

```typescript
interface Content {
  id: string;
  type: 'brief' | 'deliverable' | 'article' | 'webpage';
  title?: string;
  content: string;
  contentHash: string;
  status: 'draft' | 'verified' | 'approved' | 'rejected';
  
  clientId?: string;
  projectId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  claimCount?: number;
  verifiedCount?: number;
  riskScore?: number;
}
```

### Claim

Represents a verifiable claim extracted from content.

```cypher
// Schema
(:Claim {
  id: String!,
  text: String!,         // The claim text
  normalizedText: String, // Lowercased, trimmed for matching
  
  category: String!,     // Claim category
  subcategory: String,
  
  // Location in source content
  startOffset: Integer,
  endOffset: Integer,
  context: String,       // Surrounding text
  
  // Verification status
  status: String!,       // 'unverified' | 'verified' | 'disputed' | 'rejected'
  confidence: Float,     // 0.0 - 1.0
  
  // Risk assessment
  riskLevel: String,     // 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  riskScore: Float,
  riskFactors: [String],
  
  // Metadata
  extractedBy: String,   // Agent that extracted
  extractedAt: DateTime!,
  verifiedAt: DateTime,
  
  // Expiration
  expiresAt: DateTime,   // When claim needs re-verification
  sourceDate: Date       // Date of underlying data
})

// Indexes
CREATE INDEX claim_id FOR (c:Claim) ON (c.id);
CREATE INDEX claim_status FOR (c:Claim) ON (c.status);
CREATE INDEX claim_category FOR (c:Claim) ON (c.category);
CREATE INDEX claim_risk FOR (c:Claim) ON (c.riskLevel);
CREATE FULLTEXT INDEX claim_text FOR (c:Claim) ON EACH [c.text, c.normalizedText];

// Constraints
CREATE CONSTRAINT claim_id_unique FOR (c:Claim) REQUIRE c.id IS UNIQUE;
```

**TypeScript Interface:**

```typescript
interface Claim {
  id: string;
  text: string;
  normalizedText: string;
  
  category: ClaimCategory;
  subcategory?: string;
  
  startOffset?: number;
  endOffset?: number;
  context?: string;
  
  status: 'unverified' | 'verified' | 'disputed' | 'rejected';
  confidence?: number;
  
  riskLevel?: 'minimal' | 'low' | 'medium' | 'high' | 'critical';
  riskScore?: number;
  riskFactors?: string[];
  
  extractedBy: string;
  extractedAt: Date;
  verifiedAt?: Date;
  
  expiresAt?: Date;
  sourceDate?: Date;
}

type ClaimCategory = 
  | 'factual'
  | 'statistical'
  | 'comparative'
  | 'testimonial'
  | 'performance'
  | 'health'
  | 'financial'
  | 'environmental'
  | 'safety';
```

### Source

Represents a source document that can substantiate claims.

```cypher
// Schema
(:Source {
  id: String!,
  type: String!,         // 'document' | 'study' | 'website' | 'database' | 'testimony'
  
  title: String!,
  description: String,
  url: String,
  content: String,       // Full text (if available)
  
  // Credibility
  credibilityScore: Float!,  // 0.0 - 1.0
  credibilityFactors: [String],
  
  // Source metadata
  author: String,
  publisher: String,
  publishedAt: Date,
  accessedAt: DateTime,
  
  // For studies/research
  studyType: String,     // 'rct' | 'meta-analysis' | 'observational' | 'case-study'
  sampleSize: Integer,
  peerReviewed: Boolean,
  
  // Status
  status: String!,       // 'active' | 'archived' | 'expired' | 'unreachable'
  lastVerified: DateTime,
  
  createdAt: DateTime!,
  updatedAt: DateTime!
})

// Indexes
CREATE INDEX source_id FOR (s:Source) ON (s.id);
CREATE INDEX source_type FOR (s:Source) ON (s.type);
CREATE INDEX source_credibility FOR (s:Source) ON (s.credibilityScore);
CREATE FULLTEXT INDEX source_text FOR (s:Source) ON EACH [s.title, s.content];

// Constraints
CREATE CONSTRAINT source_id_unique FOR (s:Source) REQUIRE s.id IS UNIQUE;
```

**TypeScript Interface:**

```typescript
interface Source {
  id: string;
  type: 'document' | 'study' | 'website' | 'database' | 'testimony';
  
  title: string;
  description?: string;
  url?: string;
  content?: string;
  
  credibilityScore: number;
  credibilityFactors?: string[];
  
  author?: string;
  publisher?: string;
  publishedAt?: Date;
  accessedAt?: Date;
  
  studyType?: 'rct' | 'meta-analysis' | 'observational' | 'case-study';
  sampleSize?: number;
  peerReviewed?: boolean;
  
  status: 'active' | 'archived' | 'expired' | 'unreachable';
  lastVerified?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Evidence

Represents specific evidence within a source that supports a claim.

```cypher
// Schema
(:Evidence {
  id: String!,
  type: String!,         // 'quote' | 'statistic' | 'finding' | 'conclusion'
  
  content: String!,      // The evidence text/data
  location: String,      // Page, section, URL fragment
  
  // Relevance to claim
  relevanceScore: Float, // How well it supports the claim
  supportType: String,   // 'direct' | 'indirect' | 'contextual'
  
  // For statistics
  value: String,
  unit: String,
  methodology: String,
  
  extractedAt: DateTime!,
  extractedBy: String
})

// Indexes
CREATE INDEX evidence_id FOR (e:Evidence) ON (e.id);
CREATE INDEX evidence_type FOR (e:Evidence) ON (e.type);

// Constraints
CREATE CONSTRAINT evidence_id_unique FOR (e:Evidence) REQUIRE e.id IS UNIQUE;
```

### Verification

Represents a verification event linking a claim to evidence.

```cypher
// Schema
(:Verification {
  id: String!,
  
  status: String!,       // 'verified' | 'disputed' | 'unverifiable'
  confidence: Float!,    // 0.0 - 1.0
  
  reasoning: String,     // Explanation
  method: String,        // 'automatic' | 'manual' | 'hybrid'
  
  verifiedBy: String!,   // Agent or user ID
  verifiedAt: DateTime!,
  
  // Audit
  workflowId: String,
  executionId: String
})

// Indexes
CREATE INDEX verification_id FOR (v:Verification) ON (v.id);
CREATE INDEX verification_status FOR (v:Verification) ON (v.status);
```

---

## Relationships

### CONTAINS_CLAIM

Links content to claims extracted from it.

```cypher
// Schema
(c:Content)-[:CONTAINS_CLAIM {
  extractedAt: DateTime!,
  extractedBy: String!,   // Agent ID
  confidence: Float,
  location: String        // Position in content
}]->(cl:Claim)

// Example
MATCH (c:Content {id: 'brief-123'})
CREATE (c)-[:CONTAINS_CLAIM {
  extractedAt: datetime(),
  extractedBy: 'claim-extraction-agent',
  confidence: 0.95,
  location: 'paragraph-3'
}]->(cl:Claim {
  id: 'claim-456',
  text: 'Our product reduces costs by 40%',
  category: 'performance'
})
```

### SUPPORTED_BY

Links claims to sources that support them.

```cypher
// Schema
(cl:Claim)-[:SUPPORTED_BY {
  confidence: Float!,
  relevance: Float,
  supportType: String,    // 'direct' | 'indirect' | 'partial'
  verifiedAt: DateTime,
  verifiedBy: String
}]->(s:Source)

// Example
MATCH (cl:Claim {id: 'claim-456'})
MATCH (s:Source {id: 'source-789'})
CREATE (cl)-[:SUPPORTED_BY {
  confidence: 0.85,
  relevance: 0.9,
  supportType: 'direct',
  verifiedAt: datetime(),
  verifiedBy: 'source-verification-agent'
}]->(s)
```

### CONTAINS (Source to Evidence)

Links sources to specific evidence within them.

```cypher
// Schema
(s:Source)-[:CONTAINS {
  location: String,
  pageNumber: Integer,
  section: String
}]->(e:Evidence)
```

### CITES

Links evidence to the claim it supports.

```cypher
// Schema
(e:Evidence)-[:CITES {
  relevanceScore: Float,
  reasoning: String
}]->(cl:Claim)
```

### DERIVED_FROM

Tracks provenance - what was derived from what.

```cypher
// Schema
(a)-[:DERIVED_FROM {
  derivationType: String,  // 'extracted' | 'synthesized' | 'inferred'
  confidence: Float,
  agentId: String,
  timestamp: DateTime
}]->(b)

// Example: Claim derived from content
(cl:Claim)-[:DERIVED_FROM {
  derivationType: 'extracted',
  agentId: 'claim-extraction-agent'
}]->(c:Content)
```

### VERIFIED_BY

Links claims to their verification records.

```cypher
// Schema
(cl:Claim)-[:VERIFIED_BY {
  timestamp: DateTime!
}]->(v:Verification)
```

### SUPERSEDES

Tracks when one version replaces another.

```cypher
// Schema
(new:Claim)-[:SUPERSEDES {
  reason: String,
  supersededAt: DateTime
}]->(old:Claim)
```

---

## Query Patterns

### Finding Claims by Content

```cypher
// Get all claims from a brief
MATCH (c:Content {id: $contentId})-[:CONTAINS_CLAIM]->(cl:Claim)
RETURN cl
ORDER BY cl.riskScore DESC

// Get unverified high-risk claims
MATCH (c:Content {id: $contentId})-[:CONTAINS_CLAIM]->(cl:Claim)
WHERE cl.status = 'unverified' AND cl.riskLevel IN ['high', 'critical']
RETURN cl
```

### Finding Sources for a Claim

```cypher
// Get all supporting sources
MATCH (cl:Claim {id: $claimId})-[r:SUPPORTED_BY]->(s:Source)
RETURN s, r.confidence AS confidence, r.supportType AS supportType
ORDER BY r.confidence DESC

// Get sources with evidence
MATCH (cl:Claim {id: $claimId})-[:SUPPORTED_BY]->(s:Source)-[:CONTAINS]->(e:Evidence)-[:CITES]->(cl)
RETURN s, COLLECT(e) AS evidence
```

### Verification Status

```cypher
// Get verification summary for content
MATCH (c:Content {id: $contentId})-[:CONTAINS_CLAIM]->(cl:Claim)
WITH c,
     COUNT(cl) AS totalClaims,
     COUNT(CASE WHEN cl.status = 'verified' THEN 1 END) AS verified,
     COUNT(CASE WHEN cl.status = 'unverified' THEN 1 END) AS unverified,
     COUNT(CASE WHEN cl.status = 'disputed' THEN 1 END) AS disputed
RETURN c.id, totalClaims, verified, unverified, disputed,
       toFloat(verified) / totalClaims AS verificationRate
```

### Provenance Trail

```cypher
// Get full provenance chain for a claim
MATCH path = (cl:Claim {id: $claimId})-[:DERIVED_FROM|SUPPORTED_BY|VERIFIED_BY*]->(origin)
RETURN path

// Get audit trail
MATCH (cl:Claim {id: $claimId})-[:VERIFIED_BY]->(v:Verification)
OPTIONAL MATCH (v)<-[:PERFORMED]-(a:Agent)
RETURN v, a
ORDER BY v.verifiedAt DESC
```

### Full-Text Search

```cypher
// Search claims by text
CALL db.index.fulltext.queryNodes('claim_text', $searchTerm)
YIELD node, score
WHERE score > 0.5
RETURN node AS claim, score
ORDER BY score DESC
LIMIT 20

// Search sources
CALL db.index.fulltext.queryNodes('source_text', $searchTerm)
YIELD node, score
RETURN node AS source, score
ORDER BY score DESC
```

### Similar Claims

```cypher
// Find similar claims (potential duplicates)
MATCH (cl:Claim {id: $claimId})
MATCH (other:Claim)
WHERE other.id <> cl.id
  AND other.category = cl.category
  AND apoc.text.jaroWinklerDistance(cl.normalizedText, other.normalizedText) > 0.85
RETURN other, apoc.text.jaroWinklerDistance(cl.normalizedText, other.normalizedText) AS similarity
ORDER BY similarity DESC
LIMIT 10
```

### Expiring Verifications

```cypher
// Find claims needing re-verification
MATCH (cl:Claim)
WHERE cl.expiresAt IS NOT NULL
  AND cl.expiresAt < datetime() + duration('P30D')
  AND cl.status = 'verified'
RETURN cl
ORDER BY cl.expiresAt ASC
```

---

## Migrations

### Creating Migrations

```bash
inquiry migrate --create add-expiration-to-claims
```

Creates: `infrastructure/neo4j/migrations/002-add-expiration-to-claims.cypher`

### Migration File Format

```cypher
// infrastructure/neo4j/migrations/002-add-expiration-to-claims.cypher

// UP
// Add expiresAt property to existing claims
MATCH (cl:Claim)
WHERE cl.expiresAt IS NULL AND cl.verifiedAt IS NOT NULL
SET cl.expiresAt = cl.verifiedAt + duration('P1Y')
RETURN COUNT(cl) AS updatedClaims;

// Create index
CREATE INDEX claim_expires FOR (c:Claim) ON (c.expiresAt);

// DOWN
// Remove index
DROP INDEX claim_expires IF EXISTS;

// Remove property
MATCH (cl:Claim)
REMOVE cl.expiresAt;
```

### Running Migrations

```bash
# Check status
inquiry migrate --status

# Run pending migrations
inquiry migrate --up

# Rollback last migration
inquiry migrate --down

# Rollback to specific version
inquiry migrate --down --to 001
```

---

## Neo4j Client

### Configuration

```typescript
// inquiry.config.ts
export default {
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    username: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD,
    database: 'inquiry',
    
    // Connection pool
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 30000,
    
    // Query settings
    queryTimeout: 30000,
    maxRetries: 3,
  },
};
```

### Using the Client

```typescript
import { Neo4jClient } from '@inquiry/core';

const client = new Neo4jClient(config.neo4j);

// Simple query
const claims = await client.query<Claim>(
  'MATCH (c:Claim) WHERE c.status = $status RETURN c',
  { status: 'unverified' }
);

// With transaction
await client.withTransaction(async (tx) => {
  await tx.run('CREATE (c:Claim $props)', { props: claim1 });
  await tx.run('CREATE (c:Claim $props)', { props: claim2 });
  // Auto-commits if no error
});

// Read vs Write sessions
const readResult = await client.read(
  'MATCH (c:Claim) RETURN c LIMIT 10'
);

const writeResult = await client.write(
  'CREATE (c:Claim $props) RETURN c',
  { props: newClaim }
);
```

---

## Best Practices

### 1. Use Parameterized Queries

```typescript
// ✅ Good: Parameterized
await client.query(
  'MATCH (c:Claim {id: $id}) RETURN c',
  { id: claimId }
);

// ❌ Bad: String interpolation (SQL injection risk)
await client.query(
  `MATCH (c:Claim {id: '${claimId}'}) RETURN c`
);
```

### 2. Create Indexes for Query Patterns

```cypher
// Index properties used in WHERE clauses
CREATE INDEX claim_status FOR (c:Claim) ON (c.status);

// Composite index for common query patterns
CREATE INDEX claim_content_status FOR (c:Claim) ON (c.contentId, c.status);

// Full-text index for search
CREATE FULLTEXT INDEX claim_search FOR (c:Claim) ON EACH [c.text];
```

### 3. Use Constraints for Data Integrity

```cypher
// Unique IDs
CREATE CONSTRAINT claim_id_unique FOR (c:Claim) REQUIRE c.id IS UNIQUE;

// Required properties
CREATE CONSTRAINT claim_text_exists FOR (c:Claim) REQUIRE c.text IS NOT NULL;
```

### 4. Batch Large Operations

```typescript
// ✅ Good: Batch with UNWIND
await client.write(`
  UNWIND $claims AS claim
  CREATE (c:Claim)
  SET c = claim
`, { claims: claimsArray });

// ❌ Bad: Individual creates
for (const claim of claims) {
  await client.write('CREATE (c:Claim) SET c = $claim', { claim });
}
```

### 5. Use APOC for Complex Operations

```cypher
// Batch operations with APOC
CALL apoc.periodic.iterate(
  'MATCH (c:Claim) WHERE c.status = "pending" RETURN c',
  'SET c.status = "unverified"',
  {batchSize: 1000, parallel: true}
)
```

### 6. Profile Your Queries

```cypher
// Use PROFILE to analyze query performance
PROFILE
MATCH (c:Content)-[:CONTAINS_CLAIM]->(cl:Claim)-[:SUPPORTED_BY]->(s:Source)
WHERE c.id = 'brief-123'
RETURN cl, s
```

---

## Docker Setup

### docker-compose.yml

```yaml
version: '3.8'

services:
  neo4j:
    image: neo4j:5.15.0-enterprise
    container_name: inquiry-neo4j
    ports:
      - "7474:7474"  # Browser
      - "7687:7687"  # Bolt
    environment:
      - NEO4J_AUTH=neo4j/${NEO4J_PASSWORD:-password}
      - NEO4J_ACCEPT_LICENSE_AGREEMENT=yes
      - NEO4J_PLUGINS=["apoc"]
      - NEO4J_dbms_memory_heap_initial__size=512m
      - NEO4J_dbms_memory_heap_max__size=2G
      - NEO4J_dbms_memory_pagecache_size=512m
    volumes:
      - neo4j-data:/data
      - neo4j-logs:/logs
      - ./migrations:/migrations
    healthcheck:
      test: ["CMD", "neo4j", "status"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  neo4j-data:
  neo4j-logs:
```

### Starting Neo4j

```bash
# Start
docker-compose up -d neo4j

# Check logs
docker-compose logs -f neo4j

# Access browser
open http://localhost:7474

# Stop
docker-compose down
```

---

## Next Steps

- [Agent Development Guide](./agents.md) — Agents that interact with the graph
- [Workflow Patterns](./workflows.md) — Orchestrating graph operations
- [User Guide](./USER-GUIDE.md) — CLI commands for graph management
