/**
 * Workflow Execution Types for the Inquiry Framework.
 *
 * Defines runtime state for workflow and step execution,
 * including execution context, status, and results.
 */

import type { TimestampValue } from '../../contracts/base.js';
import type {
  WorkflowDefinition,
  WorkflowStep,
  StepType,
  RetryConfig,
} from './definition.js';

// =============================================================================
// Execution Status
// =============================================================================

/**
 * Status of a workflow execution.
 */
export type WorkflowExecutionStatus =
  | 'pending'      // Created but not started
  | 'running'      // Currently executing
  | 'paused'       // Paused, can be resumed
  | 'waiting'      // Waiting for external event/approval
  | 'completed'    // Successfully completed
  | 'failed'       // Failed with error
  | 'cancelled'    // Manually cancelled
  | 'timedOut';    // Exceeded timeout

/**
 * Status of a step execution.
 */
export type StepExecutionStatus =
  | 'pending'      // Not yet started
  | 'queued'       // Queued for execution
  | 'running'      // Currently executing
  | 'waiting'      // Waiting (for event, approval, etc.)
  | 'retrying'     // Retrying after failure
  | 'completed'    // Successfully completed
  | 'failed'       // Failed with error
  | 'skipped'      // Skipped (condition not met)
  | 'cancelled'    // Cancelled
  | 'timedOut';    // Exceeded timeout

// =============================================================================
// Execution Context
// =============================================================================

/**
 * Variables and data available during workflow execution.
 */
export interface WorkflowContext {
  /** Input parameters passed to workflow */
  input: Record<string, unknown>;
  /** Accumulated output from steps */
  output: Record<string, unknown>;
  /** Current working variables */
  variables: Record<string, unknown>;
  /** System variables (read-only) */
  system: {
    /** Workflow execution ID */
    executionId: string;
    /** Workflow definition ID */
    workflowId: string;
    /** Workflow version */
    workflowVersion: string;
    /** Execution start time */
    startedAt: TimestampValue;
    /** Current step ID */
    currentStepId: string | null;
    /** Current iteration (for loops) */
    iteration?: number;
    /** Parent execution ID (for subworkflows) */
    parentExecutionId?: string;
    /** Retry attempt number */
    retryAttempt?: number;
  };
  /** Metadata from previous steps */
  stepResults: Record<string, StepResult>;
}

/**
 * Context available to a specific step during execution.
 */
export interface StepContext {
  /** Step execution ID */
  executionId: string;
  /** Step definition ID */
  stepId: string;
  /** Step name */
  stepName: string;
  /** Step type */
  stepType: StepType;
  /** Parent workflow context */
  workflowContext: WorkflowContext;
  /** Step-specific input (after mapping) */
  input: Record<string, unknown>;
  /** Logger for this step */
  logger: StepLogger;
  /** Current retry attempt (0-based) */
  retryAttempt: number;
  /** Start time of this execution */
  startedAt: TimestampValue;
  /** Cancellation token */
  cancellationToken: CancellationToken;
}

/**
 * Logger interface for step execution.
 */
export interface StepLogger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

/**
 * Token for checking/requesting cancellation.
 */
export interface CancellationToken {
  /** Whether cancellation has been requested */
  isCancelled: boolean;
  /** Reason for cancellation */
  reason?: string;
  /** Register callback for cancellation notification */
  onCancelled(callback: () => void): void;
  /** Throws if cancelled */
  throwIfCancelled(): void;
}

// =============================================================================
// Execution Results
// =============================================================================

/**
 * Result of a step execution.
 */
export interface StepResult {
  /** Step ID */
  stepId: string;
  /** Final status */
  status: StepExecutionStatus;
  /** Output data from step */
  output: Record<string, unknown> | null;
  /** Error if failed */
  error: ExecutionError | null;
  /** Start timestamp */
  startedAt: TimestampValue;
  /** End timestamp */
  endedAt: TimestampValue;
  /** Duration in milliseconds */
  durationMs: number;
  /** Number of retry attempts */
  retryCount: number;
  /** Metrics from execution */
  metrics?: StepMetrics;
}

/**
 * Metrics collected during step execution.
 */
export interface StepMetrics {
  /** Time spent in queue before execution */
  queueTimeMs?: number;
  /** Time spent in actual processing */
  processingTimeMs?: number;
  /** Time spent waiting (for I/O, external calls) */
  waitTimeMs?: number;
  /** Memory usage in bytes */
  memoryBytes?: number;
  /** Number of API calls made */
  apiCalls?: number;
  /** Number of tokens used (for LLM agents) */
  tokensUsed?: number;
  /** Custom metrics */
  custom?: Record<string, number>;
}

/**
 * Error information for failed executions.
 */
export interface ExecutionError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Error type/category */
  type: 'validation' | 'timeout' | 'agent' | 'system' | 'external' | 'user';
  /** Stack trace (if available) */
  stack?: string;
  /** Whether error is retryable */
  retryable: boolean;
  /** Original error details */
  details?: Record<string, unknown>;
  /** Nested/cause error */
  cause?: ExecutionError;
}

/**
 * Result of a workflow execution.
 */
export interface WorkflowResult {
  /** Workflow execution ID */
  executionId: string;
  /** Final status */
  status: WorkflowExecutionStatus;
  /** Final output */
  output: Record<string, unknown> | null;
  /** Error if failed */
  error: ExecutionError | null;
  /** All step results */
  stepResults: Record<string, StepResult>;
  /** Start timestamp */
  startedAt: TimestampValue;
  /** End timestamp */
  endedAt: TimestampValue;
  /** Total duration in milliseconds */
  durationMs: number;
  /** Aggregated metrics */
  metrics: WorkflowMetrics;
}

/**
 * Aggregated metrics for workflow execution.
 */
export interface WorkflowMetrics {
  /** Total steps executed */
  stepsExecuted: number;
  /** Steps completed successfully */
  stepsCompleted: number;
  /** Steps failed */
  stepsFailed: number;
  /** Steps skipped */
  stepsSkipped: number;
  /** Total retry attempts across all steps */
  totalRetries: number;
  /** Total API calls made */
  totalApiCalls: number;
  /** Total tokens used */
  totalTokensUsed: number;
  /** Peak memory usage */
  peakMemoryBytes?: number;
}

// =============================================================================
// Workflow Execution
// =============================================================================

/**
 * Complete workflow execution state.
 */
export interface WorkflowExecution {
  /** Unique execution identifier */
  id: string;
  /** Workflow definition ID */
  workflowId: string;
  /** Workflow version */
  workflowVersion: string;
  /** Current execution status */
  status: WorkflowExecutionStatus;
  /** Trigger that started this execution */
  trigger: {
    type: 'manual' | 'scheduled' | 'event' | 'webhook' | 'api' | 'subworkflow';
    source?: string;
    eventId?: string;
  };
  /** Input parameters */
  input: Record<string, unknown>;
  /** Current output (partial during execution) */
  output: Record<string, unknown>;
  /** Current workflow context */
  context: WorkflowContext;
  /** Current step being executed */
  currentStepId: string | null;
  /** Steps that have been executed */
  completedStepIds: string[];
  /** Steps currently running (for parallel execution) */
  runningStepIds: string[];
  /** Step execution states */
  stepExecutions: Record<string, StepExecution>;
  /** Error if workflow failed */
  error: ExecutionError | null;
  /** Execution history/audit log */
  history: ExecutionEvent[];
  /** When execution was created */
  createdAt: TimestampValue;
  /** When execution started */
  startedAt: TimestampValue | null;
  /** When execution ended */
  endedAt: TimestampValue | null;
  /** Last update timestamp */
  updatedAt: TimestampValue;
  /** Who/what initiated the execution */
  initiatedBy?: string;
  /** Parent execution (for subworkflows) */
  parentExecutionId?: string;
  /** Child executions (subworkflows) */
  childExecutionIds: string[];
  /** Retry information */
  retry?: {
    attempt: number;
    maxAttempts: number;
    lastError?: ExecutionError;
  };
  /** Priority for execution */
  priority: number;
  /** Tags for this execution */
  tags?: string[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * State of a single step execution.
 */
export interface StepExecution {
  /** Unique step execution ID */
  id: string;
  /** Step definition ID */
  stepId: string;
  /** Step name */
  stepName: string;
  /** Step type */
  stepType: StepType;
  /** Current status */
  status: StepExecutionStatus;
  /** Input passed to step */
  input: Record<string, unknown>;
  /** Output from step (null if not completed) */
  output: Record<string, unknown> | null;
  /** Error if failed */
  error: ExecutionError | null;
  /** Current retry attempt */
  retryAttempt: number;
  /** Retry configuration */
  retryConfig?: RetryConfig;
  /** When step execution was created */
  createdAt: TimestampValue;
  /** When step started executing */
  startedAt: TimestampValue | null;
  /** When step finished */
  endedAt: TimestampValue | null;
  /** Duration in milliseconds */
  durationMs: number | null;
  /** Metrics from execution */
  metrics?: StepMetrics;
  /** Agent execution ID (for agent steps) */
  agentExecutionId?: string;
  /** Subworkflow execution ID (for subworkflow steps) */
  subworkflowExecutionId?: string;
  /** Child step executions (for sequential/parallel steps) */
  childStepExecutions?: string[];
  /** Waiting information */
  waitingFor?: {
    type: 'event' | 'approval' | 'schedule' | 'duration';
    details: Record<string, unknown>;
    expiresAt?: TimestampValue;
  };
}

/**
 * Event in workflow execution history.
 */
export interface ExecutionEvent {
  /** Event ID */
  id: string;
  /** Event timestamp */
  timestamp: TimestampValue;
  /** Event type */
  type:
    | 'workflow_started'
    | 'workflow_completed'
    | 'workflow_failed'
    | 'workflow_cancelled'
    | 'workflow_paused'
    | 'workflow_resumed'
    | 'step_started'
    | 'step_completed'
    | 'step_failed'
    | 'step_skipped'
    | 'step_retrying'
    | 'transition_taken'
    | 'context_updated'
    | 'error_handled'
    | 'approval_requested'
    | 'approval_received'
    | 'event_received'
    | 'timeout_warning'
    | 'custom';
  /** Related step ID */
  stepId?: string;
  /** Event data */
  data: Record<string, unknown>;
  /** Event message */
  message?: string;
  /** Severity level */
  severity: 'debug' | 'info' | 'warn' | 'error';
}

// =============================================================================
// Execution Control
// =============================================================================

/**
 * Options for starting a workflow execution.
 */
export interface StartWorkflowOptions {
  /** Input parameters */
  input?: Record<string, unknown>;
  /** Execution priority (higher = more urgent) */
  priority?: number;
  /** Timeout override in milliseconds */
  timeoutMs?: number;
  /** Tags for this execution */
  tags?: string[];
  /** Metadata for this execution */
  metadata?: Record<string, unknown>;
  /** Start at specific step (for resume) */
  startAtStepId?: string;
  /** Initial context (for resume) */
  initialContext?: Partial<WorkflowContext>;
  /** Whether to run synchronously */
  synchronous?: boolean;
  /** Callback URL for completion notification */
  callbackUrl?: string;
}

/**
 * Options for resuming a paused workflow.
 */
export interface ResumeWorkflowOptions {
  /** Updated context variables */
  contextUpdates?: Record<string, unknown>;
  /** Resume at specific step */
  resumeAtStepId?: string;
  /** Skip current step */
  skipCurrentStep?: boolean;
}

/**
 * Options for cancelling a workflow.
 */
export interface CancelWorkflowOptions {
  /** Reason for cancellation */
  reason: string;
  /** Whether to run compensation */
  runCompensation?: boolean;
  /** Force immediate cancellation */
  force?: boolean;
}

/**
 * Approval decision for gate steps.
 */
export interface ApprovalDecision {
  /** Approver ID */
  approverId: string;
  /** Decision */
  decision: 'approved' | 'rejected' | 'deferred';
  /** Comments */
  comments?: string;
  /** Timestamp */
  decidedAt: TimestampValue;
  /** Conditions or modifications */
  conditions?: Record<string, unknown>;
}

// =============================================================================
// Execution Summary Types
// =============================================================================

/**
 * Summary of a workflow execution for listing.
 */
export interface WorkflowExecutionSummary {
  id: string;
  workflowId: string;
  workflowName: string;
  workflowVersion: string;
  status: WorkflowExecutionStatus;
  trigger: WorkflowExecution['trigger'];
  startedAt: TimestampValue | null;
  endedAt: TimestampValue | null;
  durationMs: number | null;
  stepsCompleted: number;
  stepsTotal: number;
  hasError: boolean;
  initiatedBy?: string;
  tags?: string[];
}

/**
 * Filter criteria for querying executions.
 */
export interface ExecutionFilter {
  workflowId?: string;
  workflowVersion?: string;
  status?: WorkflowExecutionStatus | WorkflowExecutionStatus[];
  triggerType?: WorkflowExecution['trigger']['type'];
  startedAfter?: TimestampValue;
  startedBefore?: TimestampValue;
  initiatedBy?: string;
  tags?: string[];
  hasError?: boolean;
  parentExecutionId?: string;
}

/**
 * Pagination options for execution queries.
 */
export interface ExecutionPagination {
  offset: number;
  limit: number;
  sortBy: 'startedAt' | 'endedAt' | 'createdAt' | 'status';
  sortOrder: 'asc' | 'desc';
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Checks if workflow execution is in a terminal state.
 */
export function isTerminalStatus(status: WorkflowExecutionStatus): boolean {
  return ['completed', 'failed', 'cancelled', 'timedOut'].includes(status);
}

/**
 * Checks if step execution is in a terminal state.
 */
export function isStepTerminalStatus(status: StepExecutionStatus): boolean {
  return ['completed', 'failed', 'skipped', 'cancelled', 'timedOut'].includes(status);
}

/**
 * Checks if workflow can be resumed.
 */
export function canResume(execution: WorkflowExecution): boolean {
  return execution.status === 'paused' || execution.status === 'waiting';
}

/**
 * Checks if workflow can be cancelled.
 */
export function canCancel(execution: WorkflowExecution): boolean {
  return ['pending', 'running', 'paused', 'waiting'].includes(execution.status);
}
