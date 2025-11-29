/**
 * Inquiry Framework Contracts
 *
 * Core message types and interfaces for agent communication.
 */

// Base message types
export type {
  AgentIdentifier,
  TimestampValue,
  Provenance,
  MessageMetadata,
  MessageStatus,
  MessageError,
  InquiryMessage,
} from './base.js';

// Base type guards
export {
  isFailedMessage,
  isCompletedMessage,
  isPendingMessage,
} from './base.js';

// Base factory functions
export {
  createMessageMetadata,
  createProvenance,
  createMessage,
  createFailedMessage,
  createCompletedMessage,
} from './base.js';

// Agent types
export type {
  AgentType,
  AgentStatus,
  AgentHealth,
  RetryConfig,
  TimeoutConfig,
  AgentConfig,
  AgentState,
  AgentSuccess,
  AgentFailure,
  AgentResult,
  AgentCapability,
  AgentMetadata,
} from './agent.js';

// Agent type guards
export {
  isAgentSuccess,
  isAgentFailure,
} from './agent.js';

// Agent factory functions
export {
  createAgentSuccess,
  createAgentFailure,
  createAgentConfig,
  createAgentState,
  defaultRetryConfig,
  defaultTimeoutConfig,
} from './agent.js';

// Claim types
export type {
  ClaimCategory,
  ClaimStatus,
  Confidence,
  ClaimSentiment,
  TextSpan,
  ClaimEntity,
  Claim,
  PartialClaim,
} from './claim.js';

// Claim functions
export {
  createClaim,
  isClaimVerified,
  isClaimConclusive,
  needsVerification,
} from './claim.js';

// Source types
export type {
  SourceType,
  ContentFormat,
  SourceAvailability,
  CredibilityScore,
  CredibilityFactors,
  SourceAuthor,
  Source,
  PartialSource,
} from './source.js';

// Source functions
export {
  createSource,
  calculateCredibility,
  isCredibleSource,
  isHighlyCredibleSource,
  isSourceAvailable,
  defaultCredibilityFactors,
} from './source.js';

// Evidence types
export type {
  EvidenceType,
  EvidenceStrength,
  ExtractionMethod,
  Evidence,
  PartialEvidence,
  EvidenceSummary,
} from './evidence.js';

// Evidence functions
export {
  createEvidence,
  isSupporting,
  isRefuting,
  isStrongEvidence,
  isCredibleEvidence,
  calculateEvidenceScore,
  createEvidenceSummary,
} from './evidence.js';

// Verification types
export type {
  VerificationStatus,
  VerificationOutcome,
  ConfidenceScore,
  ConfidenceFactor,
  VerificationMethod,
  VerificationResult,
  PartialVerificationResult,
  VerificationRequest,
} from './verification.js';

// Verification functions
export {
  createConfidenceScore,
  createVerificationResult,
  createVerificationRequest,
  isVerificationComplete,
  isVerificationSuccessful,
  meetsConfidenceThreshold,
  calculateConfidenceFromFactors,
} from './verification.js';

// Certification types
export type {
  CertificationStatus,
  CertificationLevel,
  AuditAction,
  AuditEntry,
  CertificationStats,
  CertificationSigner,
  CertificationPackage,
  PartialCertificationPackage,
} from './certification.js';

// Certification functions
export {
  createAuditEntry,
  createCertificationStats,
  createCertificationPackage,
  isCertificationValid,
  needsReview,
  calculateCertificationStats,
  addAuditEntry,
  determineCertificationLevel,
} from './certification.js';

// Validation schemas and utilities
export * as validation from './validation/index.js';
