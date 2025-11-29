/**
 * Agent types for Inquiry Framework.
 * Defines agent configuration, lifecycle, and result types.
 */

import type { TimestampValue, MessageError } from './base.js';

/**
 * Built-in agent types in the Inquiry Framework.
 */
export type AgentType =
  | 'extraction'
  | 'validation'
  | 'transformation'
  | 'analysis'
  | 'orchestration'
  | 'notification'
  | 'custom';

/**
 * Agent execution status.
 */
export type AgentStatus =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'running'
  | 'paused'
  | 'stopping'
  | 'stopped'
  | 'error';

/**
 * Agent health status for monitoring.
 */
export type AgentHealth = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Configuration for retry behavior.
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  readonly maxAttempts: number;
  /** Initial delay between retries in milliseconds */
  readonly initialDelayMs: number;
  /** Maximum delay between retries in milliseconds */
  readonly maxDelayMs: number;
  /** Multiplier for exponential backoff */
  readonly backoffMultiplier: number;
  /** Whether to add jitter to delay */
  readonly jitter: boolean;
}

/**
 * Configuration for agent timeouts.
 */
export interface TimeoutConfig {
  /** Timeout for agent initialization in milliseconds */
  readonly initializationMs: number;
  /** Timeout for single task execution in milliseconds */
  readonly executionMs: number;
  /** Timeout for graceful shutdown in milliseconds */
  readonly shutdownMs: number;
}

/**
 * Configuration for an agent instance.
 */
export interface AgentConfig {
  /** Unique identifier for this agent configuration */
  readonly id: string;
  /** Agent type */
  readonly type: AgentType;
  /** Human-readable name */
  readonly name: string;
  /** Agent description */
  readonly description: string;
  /** Agent version */
  readonly version: string;
  /** Whether the agent is enabled */
  readonly enabled: boolean;
  /** Retry configuration */
  readonly retry: RetryConfig;
  /** Timeout configuration */
  readonly timeout: TimeoutConfig;
  /** Maximum concurrent executions (0 = unlimited) */
  readonly maxConcurrency: number;
  /** Custom configuration options */
  readonly options: Readonly<Record<string, unknown>>;
  /** Tags for categorization and filtering */
  readonly tags: readonly string[];
}

/**
 * Runtime state of an agent.
 */
export interface AgentState {
  /** Current agent status */
  readonly status: AgentStatus;
  /** Current health */
  readonly health: AgentHealth;
  /** Number of currently running tasks */
  readonly activeTasks: number;
  /** Total tasks processed since start */
  readonly totalProcessed: number;
  /** Total tasks that failed */
  readonly totalFailed: number;
  /** Timestamp when agent was started */
  readonly startedAt: TimestampValue | null;
  /** Timestamp of last activity */
  readonly lastActivityAt: TimestampValue | null;
  /** Current error if status is 'error' */
  readonly error: MessageError | null;
}

/**
 * Successful agent result.
 */
export interface AgentSuccess<T> {
  readonly success: true;
  readonly data: T;
  readonly durationMs: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Failed agent result.
 */
export interface AgentFailure {
  readonly success: false;
  readonly error: MessageError;
  readonly durationMs: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Result of an agent execution.
 * Either success with data or failure with error.
 */
export type AgentResult<T> = AgentSuccess<T> | AgentFailure;

/**
 * Type guard for successful agent results.
 */
export function isAgentSuccess<T>(result: AgentResult<T>): result is AgentSuccess<T> {
  return result.success === true;
}

/**
 * Type guard for failed agent results.
 */
export function isAgentFailure<T>(result: AgentResult<T>): result is AgentFailure {
  return result.success === false;
}

/**
 * Creates a successful agent result.
 */
export function createAgentSuccess<T>(
  data: T,
  durationMs: number,
  metadata: Record<string, unknown> = {}
): AgentSuccess<T> {
  return {
    success: true,
    data,
    durationMs,
    metadata,
  };
}

/**
 * Creates a failed agent result.
 */
export function createAgentFailure(
  error: Omit<MessageError, 'occurredAt'>,
  durationMs: number,
  metadata: Record<string, unknown> = {}
): AgentFailure {
  return {
    success: false,
    error: {
      ...error,
      occurredAt: Date.now(),
    },
    durationMs,
    metadata,
  };
}

/**
 * Default retry configuration.
 */
export const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Default timeout configuration.
 */
export const defaultTimeoutConfig: TimeoutConfig = {
  initializationMs: 30000,
  executionMs: 60000,
  shutdownMs: 10000,
};

/**
 * Creates a default agent configuration.
 */
export function createAgentConfig(
  overrides: Partial<AgentConfig> & Pick<AgentConfig, 'id' | 'name'>
): AgentConfig {
  return {
    id: overrides.id,
    type: overrides.type ?? 'custom',
    name: overrides.name,
    description: overrides.description ?? '',
    version: overrides.version ?? '1.0.0',
    enabled: overrides.enabled ?? true,
    retry: overrides.retry ?? defaultRetryConfig,
    timeout: overrides.timeout ?? defaultTimeoutConfig,
    maxConcurrency: overrides.maxConcurrency ?? 0,
    options: overrides.options ?? {},
    tags: overrides.tags ?? [],
  };
}

/**
 * Creates an initial agent state.
 */
export function createAgentState(
  overrides: Partial<AgentState> = {}
): AgentState {
  return {
    status: overrides.status ?? 'idle',
    health: overrides.health ?? 'unknown',
    activeTasks: overrides.activeTasks ?? 0,
    totalProcessed: overrides.totalProcessed ?? 0,
    totalFailed: overrides.totalFailed ?? 0,
    startedAt: overrides.startedAt ?? null,
    lastActivityAt: overrides.lastActivityAt ?? null,
    error: overrides.error ?? null,
  };
}

/**
 * Agent capability descriptor.
 */
export interface AgentCapability {
  /** Capability name */
  readonly name: string;
  /** Capability description */
  readonly description: string;
  /** Input types this capability accepts */
  readonly inputTypes: readonly string[];
  /** Output types this capability produces */
  readonly outputTypes: readonly string[];
}

/**
 * Agent metadata for registration and discovery.
 */
export interface AgentMetadata {
  /** Agent configuration */
  readonly config: AgentConfig;
  /** Agent capabilities */
  readonly capabilities: readonly AgentCapability[];
  /** Dependencies on other agents */
  readonly dependencies: readonly string[];
  /** When the agent was registered */
  readonly registeredAt: TimestampValue;
  /** Last time the agent was updated */
  readonly updatedAt: TimestampValue;
}
