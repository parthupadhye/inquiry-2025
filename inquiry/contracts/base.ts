/**
 * Base message types for Inquiry Framework agent communication.
 * All types are Firestore-compatible (no undefined values).
 */

/**
 * Unique identifier for an agent instance.
 */
export interface AgentIdentifier {
  /** Unique agent instance ID */
  readonly id: string;
  /** Agent type name (e.g., 'extraction', 'validation') */
  readonly type: string;
  /** Agent version */
  readonly version: string;
  /** Optional human-readable name */
  readonly name: string | null;
}

/**
 * Timestamp representation compatible with Firestore.
 * Can be a Firestore Timestamp, Date ISO string, or epoch milliseconds.
 */
export type TimestampValue = string | number;

/**
 * Provenance information tracking message origin and history.
 */
export interface Provenance {
  /** ID of the agent that created this message */
  readonly sourceAgentId: string;
  /** ID of the original request that initiated this chain */
  readonly originRequestId: string;
  /** Chain of agent IDs that processed this message */
  readonly processingChain: readonly string[];
  /** Timestamp when the message was created */
  readonly createdAt: TimestampValue;
  /** Optional parent message ID for tracing */
  readonly parentMessageId: string | null;
}

/**
 * Metadata attached to every message.
 */
export interface MessageMetadata {
  /** Unique message identifier */
  readonly messageId: string;
  /** Message correlation ID for request/response matching */
  readonly correlationId: string;
  /** Timestamp when the message was created */
  readonly timestamp: TimestampValue;
  /** Message time-to-live in milliseconds (0 = no expiry) */
  readonly ttlMs: number;
  /** Message priority (higher = more urgent) */
  readonly priority: number;
  /** Optional trace ID for distributed tracing */
  readonly traceId: string | null;
  /** Optional span ID for distributed tracing */
  readonly spanId: string | null;
  /** Custom key-value attributes */
  readonly attributes: Readonly<Record<string, string | number | boolean>>;
}

/**
 * Message status for tracking processing state.
 */
export type MessageStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout';

/**
 * Error information for failed messages.
 */
export interface MessageError {
  /** Error code for categorization */
  readonly code: string;
  /** Human-readable error message */
  readonly message: string;
  /** Optional detailed error information */
  readonly details: string | null;
  /** Whether the error is retryable */
  readonly retryable: boolean;
  /** Timestamp when the error occurred */
  readonly occurredAt: TimestampValue;
}

/**
 * Base message envelope for all agent communication.
 * Generic type T represents the payload type.
 *
 * @example
 * interface MyPayload {
 *   data: string;
 *   count: number;
 * }
 *
 * const message: InquiryMessage<MyPayload> = {
 *   metadata: { ... },
 *   provenance: { ... },
 *   payload: { data: 'hello', count: 42 },
 *   status: 'pending',
 *   error: null,
 * };
 */
export interface InquiryMessage<T> {
  /** Message metadata */
  readonly metadata: MessageMetadata;
  /** Message provenance/origin information */
  readonly provenance: Provenance;
  /** Message payload of type T */
  readonly payload: T;
  /** Current message status */
  readonly status: MessageStatus;
  /** Error information if status is 'failed' */
  readonly error: MessageError | null;
}

/**
 * Type guard to check if a message is in a failed state.
 */
export function isFailedMessage<T>(
  message: InquiryMessage<T>
): message is InquiryMessage<T> & { error: MessageError } {
  return message.status === 'failed' && message.error !== null;
}

/**
 * Type guard to check if a message is in a completed state.
 */
export function isCompletedMessage<T>(
  message: InquiryMessage<T>
): boolean {
  return message.status === 'completed';
}

/**
 * Type guard to check if a message is still pending or processing.
 */
export function isPendingMessage<T>(
  message: InquiryMessage<T>
): boolean {
  return message.status === 'pending' || message.status === 'processing';
}

/**
 * Creates default message metadata with required fields.
 */
export function createMessageMetadata(
  overrides: Partial<MessageMetadata> = {}
): MessageMetadata {
  const now = Date.now();
  return {
    messageId: overrides.messageId ?? generateId(),
    correlationId: overrides.correlationId ?? generateId(),
    timestamp: overrides.timestamp ?? now,
    ttlMs: overrides.ttlMs ?? 0,
    priority: overrides.priority ?? 0,
    traceId: overrides.traceId ?? null,
    spanId: overrides.spanId ?? null,
    attributes: overrides.attributes ?? {},
  };
}

/**
 * Creates default provenance with required fields.
 */
export function createProvenance(
  sourceAgentId: string,
  overrides: Partial<Provenance> = {}
): Provenance {
  const now = Date.now();
  return {
    sourceAgentId,
    originRequestId: overrides.originRequestId ?? generateId(),
    processingChain: overrides.processingChain ?? [sourceAgentId],
    createdAt: overrides.createdAt ?? now,
    parentMessageId: overrides.parentMessageId ?? null,
  };
}

/**
 * Creates a new InquiryMessage with the given payload.
 */
export function createMessage<T>(
  payload: T,
  sourceAgentId: string,
  options: {
    metadata?: Partial<MessageMetadata>;
    provenance?: Partial<Provenance>;
    status?: MessageStatus;
  } = {}
): InquiryMessage<T> {
  return {
    metadata: createMessageMetadata(options.metadata),
    provenance: createProvenance(sourceAgentId, options.provenance),
    payload,
    status: options.status ?? 'pending',
    error: null,
  };
}

/**
 * Creates a failed message from an existing message.
 */
export function createFailedMessage<T>(
  message: InquiryMessage<T>,
  error: Omit<MessageError, 'occurredAt'>
): InquiryMessage<T> {
  return {
    ...message,
    status: 'failed',
    error: {
      ...error,
      occurredAt: Date.now(),
    },
  };
}

/**
 * Creates a completed message from an existing message.
 */
export function createCompletedMessage<T>(
  message: InquiryMessage<T>,
  newPayload?: T
): InquiryMessage<T> {
  return {
    ...message,
    payload: newPayload ?? message.payload,
    status: 'completed',
    error: null,
  };
}

/**
 * Generates a unique identifier.
 * Uses crypto.randomUUID if available, falls back to timestamp-based ID.
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}
