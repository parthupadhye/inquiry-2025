/**
 * Source types for Inquiry Framework.
 * Defines sources of information with credibility scoring.
 */

import type { TimestampValue } from './base.js';

/**
 * Types of information sources.
 */
export type SourceType =
  | 'document'
  | 'webpage'
  | 'api'
  | 'database'
  | 'news_article'
  | 'academic_paper'
  | 'social_media'
  | 'official_record'
  | 'press_release'
  | 'interview'
  | 'report'
  | 'user_input'
  | 'other';

/**
 * Content format of the source.
 */
export type ContentFormat =
  | 'text'
  | 'html'
  | 'markdown'
  | 'pdf'
  | 'json'
  | 'xml'
  | 'csv'
  | 'image'
  | 'audio'
  | 'video'
  | 'other';

/**
 * Availability status of a source.
 */
export type SourceAvailability =
  | 'available'
  | 'unavailable'
  | 'restricted'
  | 'archived'
  | 'deleted';

/**
 * Credibility score between 0 and 1.
 */
export type CredibilityScore = number;

/**
 * Factors contributing to credibility assessment.
 */
export interface CredibilityFactors {
  /** Reputation of the source/author */
  readonly reputation: CredibilityScore;
  /** Recency of the information */
  readonly recency: CredibilityScore;
  /** Consistency with other sources */
  readonly consistency: CredibilityScore;
  /** Expertise level of the source */
  readonly expertise: CredibilityScore;
  /** Transparency of the source */
  readonly transparency: CredibilityScore;
  /** Bias assessment (1 = no bias, 0 = highly biased) */
  readonly bias: CredibilityScore;
}

/**
 * Author or publisher information.
 */
export interface SourceAuthor {
  /** Author/publisher identifier */
  readonly id: string | null;
  /** Author/publisher name */
  readonly name: string;
  /** Author type */
  readonly type: 'person' | 'organization' | 'unknown';
  /** URL to author profile or page */
  readonly url: string | null;
  /** Known credibility of this author */
  readonly credibility: CredibilityScore | null;
}

/**
 * An information source.
 */
export interface Source {
  /** Unique source identifier */
  readonly id: string;
  /** Source type */
  readonly type: SourceType;
  /** Source title or name */
  readonly title: string;
  /** Source description */
  readonly description: string;
  /** URL to the source (if applicable) */
  readonly url: string | null;
  /** Content format */
  readonly format: ContentFormat;
  /** Raw content (may be truncated) */
  readonly content: string | null;
  /** Content hash for deduplication */
  readonly contentHash: string | null;
  /** Author information */
  readonly author: SourceAuthor | null;
  /** Overall credibility score */
  readonly credibility: CredibilityScore;
  /** Detailed credibility factors */
  readonly credibilityFactors: CredibilityFactors | null;
  /** Current availability */
  readonly availability: SourceAvailability;
  /** When the source was published/created */
  readonly publishedAt: TimestampValue | null;
  /** When the source was accessed/fetched */
  readonly accessedAt: TimestampValue;
  /** When this record was created */
  readonly createdAt: TimestampValue;
  /** When this record was last updated */
  readonly updatedAt: TimestampValue;
  /** Language of the content (ISO 639-1) */
  readonly language: string | null;
  /** Custom metadata */
  readonly metadata: Readonly<Record<string, unknown>>;
  /** Tags for categorization */
  readonly tags: readonly string[];
}

/**
 * Partial source for creation/updates.
 */
export type PartialSource = Partial<Omit<Source, 'id'>> & Pick<Source, 'id'>;

/**
 * Default credibility factors.
 */
export const defaultCredibilityFactors: CredibilityFactors = {
  reputation: 0.5,
  recency: 0.5,
  consistency: 0.5,
  expertise: 0.5,
  transparency: 0.5,
  bias: 0.5,
};

/**
 * Creates a new source with default values.
 */
export function createSource(
  overrides: Partial<Source> & Pick<Source, 'id' | 'title' | 'type'>
): Source {
  const now = Date.now();
  return {
    id: overrides.id,
    type: overrides.type,
    title: overrides.title,
    description: overrides.description ?? '',
    url: overrides.url ?? null,
    format: overrides.format ?? 'text',
    content: overrides.content ?? null,
    contentHash: overrides.contentHash ?? null,
    author: overrides.author ?? null,
    credibility: overrides.credibility ?? 0.5,
    credibilityFactors: overrides.credibilityFactors ?? null,
    availability: overrides.availability ?? 'available',
    publishedAt: overrides.publishedAt ?? null,
    accessedAt: overrides.accessedAt ?? now,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    language: overrides.language ?? null,
    metadata: overrides.metadata ?? {},
    tags: overrides.tags ?? [],
  };
}

/**
 * Calculates overall credibility from factors.
 */
export function calculateCredibility(factors: CredibilityFactors): CredibilityScore {
  const weights = {
    reputation: 0.25,
    recency: 0.15,
    consistency: 0.2,
    expertise: 0.2,
    transparency: 0.1,
    bias: 0.1,
  };

  return (
    factors.reputation * weights.reputation +
    factors.recency * weights.recency +
    factors.consistency * weights.consistency +
    factors.expertise * weights.expertise +
    factors.transparency * weights.transparency +
    factors.bias * weights.bias
  );
}

/**
 * Checks if a source is considered credible (score >= 0.6).
 */
export function isCredibleSource(source: Source): boolean {
  return source.credibility >= 0.6;
}

/**
 * Checks if a source is considered highly credible (score >= 0.8).
 */
export function isHighlyCredibleSource(source: Source): boolean {
  return source.credibility >= 0.8;
}

/**
 * Checks if a source is available for access.
 */
export function isSourceAvailable(source: Source): boolean {
  return source.availability === 'available';
}
