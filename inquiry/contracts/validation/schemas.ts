/**
 * Zod validation schemas for Inquiry Framework contracts.
 * Provides runtime validation with helpful error messages.
 */

import { z } from 'zod';

// =============================================================================
// Base Types
// =============================================================================

/**
 * Timestamp value - string (ISO) or number (epoch ms).
 */
export const TimestampValueSchema = z.union([z.string(), z.number()]);

/**
 * Confidence value between 0 and 1.
 */
export const ConfidenceSchema = z.number().min(0).max(1);

/**
 * Credibility score between 0 and 1.
 */
export const CredibilityScoreSchema = z.number().min(0).max(1);

/**
 * Agent identifier.
 */
export const AgentIdentifierSchema = z.object({
  id: z.string().min(1, 'Agent ID is required'),
  type: z.string().min(1, 'Agent type is required'),
  version: z.string().min(1, 'Agent version is required'),
  name: z.string().nullable(),
});

/**
 * Message provenance.
 */
export const ProvenanceSchema = z.object({
  sourceAgentId: z.string().min(1, 'Source agent ID is required'),
  originRequestId: z.string().min(1, 'Origin request ID is required'),
  processingChain: z.array(z.string()),
  createdAt: TimestampValueSchema,
  parentMessageId: z.string().nullable(),
});

/**
 * Message metadata.
 */
export const MessageMetadataSchema = z.object({
  messageId: z.string().min(1, 'Message ID is required'),
  correlationId: z.string().min(1, 'Correlation ID is required'),
  timestamp: TimestampValueSchema,
  ttlMs: z.number().int().min(0),
  priority: z.number().int(),
  traceId: z.string().nullable(),
  spanId: z.string().nullable(),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

/**
 * Message status.
 */
export const MessageStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'timeout',
]);

/**
 * Message error.
 */
export const MessageErrorSchema = z.object({
  code: z.string().min(1, 'Error code is required'),
  message: z.string().min(1, 'Error message is required'),
  details: z.string().nullable(),
  retryable: z.boolean(),
  occurredAt: TimestampValueSchema,
});

/**
 * Generic inquiry message envelope.
 */
export const InquiryMessageSchema = <T extends z.ZodTypeAny>(payloadSchema: T) =>
  z.object({
    metadata: MessageMetadataSchema,
    provenance: ProvenanceSchema,
    payload: payloadSchema,
    status: MessageStatusSchema,
    error: MessageErrorSchema.nullable(),
  });

// =============================================================================
// Agent Types
// =============================================================================

/**
 * Agent type.
 */
export const AgentTypeSchema = z.enum([
  'extraction',
  'validation',
  'transformation',
  'analysis',
  'orchestration',
  'notification',
  'custom',
]);

/**
 * Agent status.
 */
export const AgentStatusSchema = z.enum([
  'idle',
  'initializing',
  'ready',
  'running',
  'paused',
  'stopping',
  'stopped',
  'error',
]);

/**
 * Agent health.
 */
export const AgentHealthSchema = z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']);

/**
 * Retry configuration.
 */
export const RetryConfigSchema = z.object({
  maxAttempts: z.number().int().min(0),
  initialDelayMs: z.number().int().min(0),
  maxDelayMs: z.number().int().min(0),
  backoffMultiplier: z.number().min(1),
  jitter: z.boolean(),
});

/**
 * Timeout configuration.
 */
export const TimeoutConfigSchema = z.object({
  initializationMs: z.number().int().min(0),
  executionMs: z.number().int().min(0),
  shutdownMs: z.number().int().min(0),
});

/**
 * Agent configuration.
 */
export const AgentConfigSchema = z.object({
  id: z.string().min(1, 'Agent config ID is required'),
  type: AgentTypeSchema,
  name: z.string().min(1, 'Agent name is required'),
  description: z.string(),
  version: z.string().min(1, 'Version is required'),
  enabled: z.boolean(),
  retry: RetryConfigSchema,
  timeout: TimeoutConfigSchema,
  maxConcurrency: z.number().int().min(0),
  options: z.record(z.string(), z.unknown()),
  tags: z.array(z.string()),
});

/**
 * Agent state.
 */
export const AgentStateSchema = z.object({
  status: AgentStatusSchema,
  health: AgentHealthSchema,
  activeTasks: z.number().int().min(0),
  totalProcessed: z.number().int().min(0),
  totalFailed: z.number().int().min(0),
  startedAt: TimestampValueSchema.nullable(),
  lastActivityAt: TimestampValueSchema.nullable(),
  error: MessageErrorSchema.nullable(),
});

// =============================================================================
// Claim Types
// =============================================================================

/**
 * Claim category.
 */
export const ClaimCategorySchema = z.enum([
  'factual',
  'opinion',
  'prediction',
  'statistical',
  'causal',
  'comparative',
  'definitional',
  'procedural',
  'temporal',
  'spatial',
  'attribution',
  'conditional',
  'other',
]);

/**
 * Claim status.
 */
export const ClaimStatusSchema = z.enum([
  'unverified',
  'pending_verification',
  'verified',
  'disputed',
  'refuted',
  'partially_verified',
  'inconclusive',
]);

/**
 * Claim sentiment.
 */
export const ClaimSentimentSchema = z.enum(['positive', 'negative', 'neutral', 'mixed']);

/**
 * Text span.
 */
export const TextSpanSchema = z.object({
  start: z.number().int().min(0),
  end: z.number().int().min(0),
  text: z.string(),
});

/**
 * Claim entity.
 */
export const ClaimEntitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  confidence: ConfidenceSchema,
});

/**
 * Claim.
 */
export const ClaimSchema = z.object({
  id: z.string().min(1, 'Claim ID is required'),
  text: z.string().min(1, 'Claim text is required'),
  normalizedText: z.string(),
  category: ClaimCategorySchema,
  status: ClaimStatusSchema,
  extractionConfidence: ConfidenceSchema,
  verificationConfidence: ConfidenceSchema.nullable(),
  sentiment: ClaimSentimentSchema,
  entities: z.array(ClaimEntitySchema),
  sourceSpan: TextSpanSchema.nullable(),
  sourceId: z.string().min(1, 'Source ID is required'),
  extractedAt: TimestampValueSchema,
  updatedAt: TimestampValueSchema,
  metadata: z.record(z.string(), z.unknown()),
  tags: z.array(z.string()),
});

// =============================================================================
// Source Types
// =============================================================================

/**
 * Source type.
 */
export const SourceTypeSchema = z.enum([
  'document',
  'webpage',
  'api',
  'database',
  'news_article',
  'academic_paper',
  'social_media',
  'official_record',
  'press_release',
  'interview',
  'report',
  'user_input',
  'other',
]);

/**
 * Content format.
 */
export const ContentFormatSchema = z.enum([
  'text',
  'html',
  'markdown',
  'pdf',
  'json',
  'xml',
  'csv',
  'image',
  'audio',
  'video',
  'other',
]);

/**
 * Source availability.
 */
export const SourceAvailabilitySchema = z.enum([
  'available',
  'unavailable',
  'restricted',
  'archived',
  'deleted',
]);

/**
 * Credibility factors.
 */
export const CredibilityFactorsSchema = z.object({
  reputation: CredibilityScoreSchema,
  recency: CredibilityScoreSchema,
  consistency: CredibilityScoreSchema,
  expertise: CredibilityScoreSchema,
  transparency: CredibilityScoreSchema,
  bias: CredibilityScoreSchema,
});

/**
 * Source author.
 */
export const SourceAuthorSchema = z.object({
  id: z.string().nullable(),
  name: z.string().min(1, 'Author name is required'),
  type: z.enum(['person', 'organization', 'unknown']),
  url: z.string().url().nullable().or(z.null()),
  credibility: CredibilityScoreSchema.nullable(),
});

/**
 * Source.
 */
export const SourceSchema = z.object({
  id: z.string().min(1, 'Source ID is required'),
  type: SourceTypeSchema,
  title: z.string().min(1, 'Source title is required'),
  description: z.string(),
  url: z.string().url().nullable().or(z.null()),
  format: ContentFormatSchema,
  content: z.string().nullable(),
  contentHash: z.string().nullable(),
  author: SourceAuthorSchema.nullable(),
  credibility: CredibilityScoreSchema,
  credibilityFactors: CredibilityFactorsSchema.nullable(),
  availability: SourceAvailabilitySchema,
  publishedAt: TimestampValueSchema.nullable(),
  accessedAt: TimestampValueSchema,
  createdAt: TimestampValueSchema,
  updatedAt: TimestampValueSchema,
  language: z.string().length(2).nullable().or(z.null()),
  metadata: z.record(z.string(), z.unknown()),
  tags: z.array(z.string()),
});

// =============================================================================
// Evidence Types
// =============================================================================

/**
 * Evidence type.
 */
export const EvidenceTypeSchema = z.enum([
  'supports',
  'refutes',
  'partially_supports',
  'partially_refutes',
  'neutral',
  'unrelated',
]);

/**
 * Evidence strength.
 */
export const EvidenceStrengthSchema = z.enum(['strong', 'moderate', 'weak', 'inconclusive']);

/**
 * Extraction method.
 */
export const ExtractionMethodSchema = z.enum([
  'manual',
  'automated',
  'hybrid',
  'llm',
  'rule_based',
  'ml_classifier',
]);

/**
 * Evidence.
 */
export const EvidenceSchema = z.object({
  id: z.string().min(1, 'Evidence ID is required'),
  claimId: z.string().min(1, 'Claim ID is required'),
  sourceId: z.string().min(1, 'Source ID is required'),
  type: EvidenceTypeSchema,
  strength: EvidenceStrengthSchema,
  text: z.string().min(1, 'Evidence text is required'),
  sourceSpan: TextSpanSchema.nullable(),
  extractionConfidence: ConfidenceSchema,
  relevanceConfidence: ConfidenceSchema,
  credibility: CredibilityScoreSchema,
  extractionMethod: ExtractionMethodSchema,
  extractedBy: z.string().min(1, 'Extractor ID is required'),
  extractedAt: TimestampValueSchema,
  updatedAt: TimestampValueSchema,
  reasoning: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  tags: z.array(z.string()),
});

/**
 * Evidence summary.
 */
export const EvidenceSummarySchema = z.object({
  claimId: z.string().min(1),
  totalCount: z.number().int().min(0),
  supportingCount: z.number().int().min(0),
  refutingCount: z.number().int().min(0),
  neutralCount: z.number().int().min(0),
  averageCredibility: CredibilityScoreSchema,
  overallStrength: EvidenceStrengthSchema,
  netSupportScore: z.number().min(-1).max(1),
  calculatedAt: TimestampValueSchema,
});

// =============================================================================
// Verification Types
// =============================================================================

/**
 * Verification status.
 */
export const VerificationStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'completed',
  'failed',
  'timeout',
  'cancelled',
  'requires_review',
]);

/**
 * Verification outcome.
 */
export const VerificationOutcomeSchema = z.enum([
  'verified',
  'refuted',
  'partially_verified',
  'inconclusive',
  'insufficient_evidence',
  'contradictory_evidence',
]);

/**
 * Confidence factor.
 */
export const ConfidenceFactorSchema = z.object({
  name: z.string().min(1),
  weight: z.number().min(0).max(1),
  score: z.number().min(0).max(1),
  impact: z.number(),
});

/**
 * Confidence score.
 */
export const ConfidenceScoreObjSchema = z.object({
  value: ConfidenceSchema,
  lowerBound: ConfidenceSchema,
  upperBound: ConfidenceSchema,
  explanation: z.string().nullable(),
  factors: z.array(ConfidenceFactorSchema),
});

/**
 * Verification method.
 */
export const VerificationMethodSchema = z.enum([
  'automated',
  'manual',
  'hybrid',
  'llm_analysis',
  'cross_reference',
  'expert_review',
  'consensus',
]);

/**
 * Verification result.
 */
export const VerificationResultSchema = z.object({
  id: z.string().min(1, 'Verification ID is required'),
  claimId: z.string().min(1, 'Claim ID is required'),
  status: VerificationStatusSchema,
  outcome: VerificationOutcomeSchema.nullable(),
  confidence: ConfidenceScoreObjSchema,
  method: VerificationMethodSchema,
  verifierAgentIds: z.array(z.string()),
  evidenceSummary: EvidenceSummarySchema.nullable(),
  evidenceIds: z.array(z.string()),
  sourcesConsulted: z.number().int().min(0),
  reasoning: z.string(),
  recommendations: z.array(z.string()),
  startedAt: TimestampValueSchema,
  completedAt: TimestampValueSchema.nullable(),
  durationMs: z.number().int().min(0).nullable(),
  error: MessageErrorSchema.nullable(),
  metadata: z.record(z.string(), z.unknown()),
});

/**
 * Verification request.
 */
export const VerificationRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  claimId: z.string().min(1, 'Claim ID is required'),
  method: VerificationMethodSchema.nullable(),
  minConfidence: ConfidenceSchema,
  timeoutMs: z.number().int().min(0),
  priority: z.number().int(),
  requestedAt: TimestampValueSchema,
  requestedBy: z.string().min(1, 'Requester ID is required'),
  instructions: z.string().nullable(),
});

// =============================================================================
// Certification Types
// =============================================================================

/**
 * Certification status.
 */
export const CertificationStatusSchema = z.enum([
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'revoked',
  'expired',
]);

/**
 * Certification level.
 */
export const CertificationLevelSchema = z.enum([
  'preliminary',
  'standard',
  'enhanced',
  'comprehensive',
]);

/**
 * Audit action.
 */
export const AuditActionSchema = z.enum([
  'created',
  'updated',
  'verified',
  'approved',
  'rejected',
  'revoked',
  'exported',
  'accessed',
  'shared',
  'commented',
  'escalated',
]);

/**
 * Audit entry.
 */
export const AuditEntrySchema = z.object({
  id: z.string().min(1, 'Audit entry ID is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  entityType: z.string().min(1, 'Entity type is required'),
  action: AuditActionSchema,
  actorId: z.string().min(1, 'Actor ID is required'),
  actorType: z.enum(['agent', 'user', 'system']),
  timestamp: TimestampValueSchema,
  previousState: z.record(z.string(), z.unknown()).nullable(),
  newState: z.record(z.string(), z.unknown()).nullable(),
  reason: z.string().nullable(),
  sourceIdentifier: z.string().nullable(),
  context: z.record(z.string(), z.unknown()),
});

/**
 * Certification stats.
 */
export const CertificationStatsSchema = z.object({
  totalClaims: z.number().int().min(0),
  verifiedClaims: z.number().int().min(0),
  refutedClaims: z.number().int().min(0),
  inconclusiveClaims: z.number().int().min(0),
  totalSources: z.number().int().min(0),
  totalEvidence: z.number().int().min(0),
  averageConfidence: ConfidenceSchema,
  verificationRate: z.number().min(0).max(1),
});

/**
 * Certification signer.
 */
export const CertificationSignerSchema = z.object({
  id: z.string().min(1, 'Signer ID is required'),
  name: z.string().min(1, 'Signer name is required'),
  role: z.string().min(1, 'Signer role is required'),
  signedAt: TimestampValueSchema,
  signature: z.string().nullable(),
  comments: z.string().nullable(),
});

/**
 * Certification package.
 */
export const CertificationPackageSchema = z.object({
  id: z.string().min(1, 'Certification ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  level: CertificationLevelSchema,
  status: CertificationStatusSchema,
  overallConfidence: ConfidenceScoreObjSchema,
  stats: CertificationStatsSchema,
  claimIds: z.array(z.string()),
  verificationIds: z.array(z.string()),
  sourceIds: z.array(z.string()),
  evidenceIds: z.array(z.string()),
  auditTrail: z.array(AuditEntrySchema),
  signers: z.array(CertificationSignerSchema),
  createdBy: z.string().min(1, 'Creator ID is required'),
  createdAt: TimestampValueSchema,
  updatedAt: TimestampValueSchema,
  expiresAt: TimestampValueSchema.nullable(),
  version: z.string().min(1),
  contentHash: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  tags: z.array(z.string()),
});

// =============================================================================
// Type Inference
// =============================================================================

export type AgentIdentifierInput = z.input<typeof AgentIdentifierSchema>;
export type ProvenanceInput = z.input<typeof ProvenanceSchema>;
export type MessageMetadataInput = z.input<typeof MessageMetadataSchema>;
export type MessageErrorInput = z.input<typeof MessageErrorSchema>;
export type AgentConfigInput = z.input<typeof AgentConfigSchema>;
export type AgentStateInput = z.input<typeof AgentStateSchema>;
export type ClaimInput = z.input<typeof ClaimSchema>;
export type SourceInput = z.input<typeof SourceSchema>;
export type EvidenceInput = z.input<typeof EvidenceSchema>;
export type EvidenceSummaryInput = z.input<typeof EvidenceSummarySchema>;
export type VerificationResultInput = z.input<typeof VerificationResultSchema>;
export type VerificationRequestInput = z.input<typeof VerificationRequestSchema>;
export type AuditEntryInput = z.input<typeof AuditEntrySchema>;
export type CertificationPackageInput = z.input<typeof CertificationPackageSchema>;
