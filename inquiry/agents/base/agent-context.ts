/**
 * Agent execution context for the Inquiry Framework.
 * Provides runtime context, logging, and utilities to agents during execution.
 */

import type {
  AgentIdentifier,
  Provenance,
  TimestampValue,
} from '../../contracts/base.js';
import type { AgentConfig } from '../../contracts/agent.js';

/**
 * Log levels for agent logging.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log entry structure.
 */
export interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: TimestampValue;
  readonly agentId: string;
  readonly data: Record<string, unknown> | null;
}

/**
 * Logger interface for agents.
 */
export interface AgentLogger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

/**
 * Execution context provided to agents during task execution.
 */
export interface AgentContext {
  /** Unique execution ID for this task */
  readonly executionId: string;
  /** Agent's identifier */
  readonly agentId: AgentIdentifier;
  /** Agent configuration */
  readonly config: AgentConfig;
  /** Provenance from incoming message */
  readonly provenance: Provenance;
  /** Correlation ID for request tracking */
  readonly correlationId: string;
  /** Logger instance for this execution */
  readonly logger: AgentLogger;
  /** When execution started */
  readonly startedAt: TimestampValue;
  /** Signal for cancellation */
  readonly signal: AbortSignal;
  /** Custom metadata for this execution */
  readonly metadata: Record<string, unknown>;
}

/**
 * Options for creating an agent context.
 */
export interface AgentContextOptions {
  executionId?: string;
  correlationId?: string;
  provenance?: Partial<Provenance>;
  metadata?: Record<string, unknown>;
  signal?: AbortSignal;
  logger?: AgentLogger;
}

/**
 * Default console-based logger.
 */
export function createConsoleLogger(agentId: string): AgentLogger {
  const log = (
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>
  ): void => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${agentId}]`;
    const logFn = level === 'error' ? console.error :
                  level === 'warn' ? console.warn :
                  level === 'debug' ? console.debug :
                  console.log;

    if (data) {
      logFn(`${prefix} ${message}`, data);
    } else {
      logFn(`${prefix} ${message}`);
    }
  };

  return {
    debug: (message, data) => log('debug', message, data),
    info: (message, data) => log('info', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data),
  };
}

/**
 * No-op logger for testing or silent execution.
 */
export function createNoOpLogger(): AgentLogger {
  const noop = (): void => {};
  return {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
  };
}

/**
 * Buffered logger that stores log entries for later retrieval.
 */
export function createBufferedLogger(agentId: string): AgentLogger & {
  getEntries(): readonly LogEntry[];
  clear(): void;
} {
  const entries: LogEntry[] = [];

  const log = (
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>
  ): void => {
    entries.push({
      level,
      message,
      timestamp: Date.now(),
      agentId,
      data: data ?? null,
    });
  };

  return {
    debug: (message, data) => log('debug', message, data),
    info: (message, data) => log('info', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data),
    getEntries: () => [...entries],
    clear: () => { entries.length = 0; },
  };
}

/**
 * Generates a unique ID.
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Creates an agent context for execution.
 */
export function createAgentContext(
  agentId: AgentIdentifier,
  config: AgentConfig,
  options: AgentContextOptions = {}
): AgentContext {
  const executionId = options.executionId ?? generateId();
  const now = Date.now();

  const provenance: Provenance = {
    sourceAgentId: agentId.id,
    originRequestId: options.provenance?.originRequestId ?? executionId,
    processingChain: options.provenance?.processingChain ?? [agentId.id],
    createdAt: options.provenance?.createdAt ?? now,
    parentMessageId: options.provenance?.parentMessageId ?? null,
  };

  return {
    executionId,
    agentId,
    config,
    provenance,
    correlationId: options.correlationId ?? generateId(),
    logger: options.logger ?? createConsoleLogger(agentId.id),
    startedAt: now,
    signal: options.signal ?? new AbortController().signal,
    metadata: options.metadata ?? {},
  };
}

/**
 * Creates a child context for sub-agent execution.
 */
export function createChildContext(
  parent: AgentContext,
  childAgentId: AgentIdentifier,
  childConfig: AgentConfig,
  options: Partial<AgentContextOptions> = {}
): AgentContext {
  const executionId = options.executionId ?? generateId();

  return {
    executionId,
    agentId: childAgentId,
    config: childConfig,
    provenance: {
      sourceAgentId: childAgentId.id,
      originRequestId: parent.provenance.originRequestId,
      processingChain: [...parent.provenance.processingChain, childAgentId.id],
      createdAt: Date.now(),
      parentMessageId: parent.executionId,
    },
    correlationId: parent.correlationId,
    logger: options.logger ?? createConsoleLogger(childAgentId.id),
    startedAt: Date.now(),
    signal: options.signal ?? parent.signal,
    metadata: { ...parent.metadata, ...options.metadata },
  };
}
