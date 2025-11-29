/**
 * Workflow Definition Types for the Inquiry Framework.
 *
 * Defines the structure for workflows, steps, and transitions
 * that orchestrate agent execution for claim verification.
 */

import type { TimestampValue } from '../../contracts/base.js';

// =============================================================================
// Step Types
// =============================================================================

/**
 * Types of workflow steps.
 */
export type StepType =
  | 'sequential'   // Execute steps one after another
  | 'parallel'     // Execute steps concurrently
  | 'conditional'  // Execute based on condition evaluation
  | 'loop'         // Repeat until condition is met
  | 'agent'        // Execute a single agent
  | 'subworkflow'  // Execute another workflow
  | 'wait'         // Wait for external event or time
  | 'transform'    // Transform data between steps
  | 'gate';        // Approval or manual checkpoint

/**
 * Priority levels for step execution.
 */
export type StepPriority = 'low' | 'normal' | 'high' | 'critical';

// =============================================================================
// Transition Types
// =============================================================================

/**
 * Condition operator for evaluating transitions.
 */
export type ConditionOperator =
  | 'eq'        // Equal
  | 'neq'       // Not equal
  | 'gt'        // Greater than
  | 'gte'       // Greater than or equal
  | 'lt'        // Less than
  | 'lte'       // Less than or equal
  | 'in'        // Value in array
  | 'notIn'     // Value not in array
  | 'contains'  // String/array contains
  | 'matches'   // Regex match
  | 'exists'    // Property exists
  | 'isEmpty'   // Value is empty/null
  | 'isTrue'    // Boolean true
  | 'isFalse';  // Boolean false

/**
 * A single condition for transition evaluation.
 */
export interface TransitionCondition {
  /** Field path to evaluate (supports dot notation) */
  field: string;
  /** Comparison operator */
  operator: ConditionOperator;
  /** Value to compare against */
  value?: unknown;
  /** Negate the condition result */
  negate?: boolean;
}

/**
 * Logical grouping of conditions.
 */
export interface ConditionGroup {
  /** Logical operator for combining conditions */
  logic: 'and' | 'or';
  /** Conditions to evaluate */
  conditions: Array<TransitionCondition | ConditionGroup>;
}

/**
 * Transition between workflow steps.
 */
export interface Transition {
  /** Unique transition identifier */
  id: string;
  /** Source step ID */
  from: string;
  /** Target step ID */
  to: string;
  /** Optional condition for taking this transition */
  condition?: TransitionCondition | ConditionGroup;
  /** Priority when multiple transitions are possible (higher = preferred) */
  priority?: number;
  /** Label for visualization */
  label?: string;
  /** Whether this is the default transition when no conditions match */
  isDefault?: boolean;
}

// =============================================================================
// Step Configuration
// =============================================================================

/**
 * Retry configuration for failed steps.
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay between retries in milliseconds */
  initialDelayMs: number;
  /** Maximum delay between retries in milliseconds */
  maxDelayMs: number;
  /** Backoff multiplier for exponential backoff */
  backoffMultiplier: number;
  /** Whether to retry on specific error types only */
  retryOn?: string[];
  /** Error types to never retry */
  noRetryOn?: string[];
}

/**
 * Timeout configuration for steps.
 */
export interface TimeoutConfig {
  /** Maximum execution time in milliseconds */
  executionMs: number;
  /** Grace period for cleanup after timeout */
  gracePeriodMs?: number;
  /** Action to take on timeout */
  onTimeout: 'fail' | 'skip' | 'retry' | 'fallback';
  /** Fallback step ID if onTimeout is 'fallback' */
  fallbackStepId?: string;
}

/**
 * Input mapping for step data.
 */
export interface InputMapping {
  /** Source path in workflow context (supports dot notation) */
  source: string;
  /** Target path in step input */
  target: string;
  /** Optional transformation expression */
  transform?: string;
  /** Default value if source is undefined */
  defaultValue?: unknown;
  /** Whether this mapping is required */
  required?: boolean;
}

/**
 * Output mapping from step to workflow context.
 */
export interface OutputMapping {
  /** Source path in step output */
  source: string;
  /** Target path in workflow context */
  target: string;
  /** Optional transformation expression */
  transform?: string;
  /** Whether to merge with existing value */
  merge?: boolean;
}

// =============================================================================
// Workflow Step
// =============================================================================

/**
 * Base properties for all step types.
 */
export interface BaseStepProperties {
  /** Unique step identifier */
  id: string;
  /** Human-readable step name */
  name: string;
  /** Step description */
  description?: string;
  /** Step type */
  type: StepType;
  /** Execution priority */
  priority?: StepPriority;
  /** Retry configuration */
  retry?: RetryConfig;
  /** Timeout configuration */
  timeout?: TimeoutConfig;
  /** Input mappings from workflow context */
  inputMappings?: InputMapping[];
  /** Output mappings to workflow context */
  outputMappings?: OutputMapping[];
  /** Condition to determine if step should execute */
  when?: TransitionCondition | ConditionGroup;
  /** Tags for categorization */
  tags?: string[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Agent step - executes a single agent.
 */
export interface AgentStep extends BaseStepProperties {
  type: 'agent';
  /** Agent ID or type to execute */
  agentId: string;
  /** Agent configuration overrides */
  agentConfig?: Record<string, unknown>;
  /** Static input to pass to agent */
  staticInput?: Record<string, unknown>;
}

/**
 * Sequential step - executes child steps in order.
 */
export interface SequentialStep extends BaseStepProperties {
  type: 'sequential';
  /** Child steps to execute in order */
  steps: WorkflowStep[];
  /** Whether to stop on first failure */
  stopOnError?: boolean;
}

/**
 * Parallel step - executes child steps concurrently.
 */
export interface ParallelStep extends BaseStepProperties {
  type: 'parallel';
  /** Child steps to execute concurrently */
  steps: WorkflowStep[];
  /** Maximum concurrent executions */
  maxConcurrency?: number;
  /** How to handle failures */
  failureStrategy: 'failFast' | 'waitAll' | 'continueOnError';
  /** Minimum successful steps required */
  minSuccessful?: number;
}

/**
 * Conditional step - branches based on condition.
 */
export interface ConditionalStep extends BaseStepProperties {
  type: 'conditional';
  /** Condition to evaluate */
  condition: TransitionCondition | ConditionGroup;
  /** Step to execute if condition is true */
  thenStep: WorkflowStep;
  /** Step to execute if condition is false */
  elseStep?: WorkflowStep;
}

/**
 * Loop step - repeats until condition is met.
 */
export interface LoopStep extends BaseStepProperties {
  type: 'loop';
  /** Step to repeat */
  step: WorkflowStep;
  /** Condition to continue looping (loop while true) */
  whileCondition?: TransitionCondition | ConditionGroup;
  /** Condition to stop looping (loop until true) */
  untilCondition?: TransitionCondition | ConditionGroup;
  /** Maximum iterations */
  maxIterations: number;
  /** Delay between iterations in milliseconds */
  iterationDelayMs?: number;
  /** Variable name for iteration index */
  indexVariable?: string;
  /** Array to iterate over (for forEach behavior) */
  collection?: string;
  /** Variable name for current item */
  itemVariable?: string;
}

/**
 * Subworkflow step - executes another workflow.
 */
export interface SubworkflowStep extends BaseStepProperties {
  type: 'subworkflow';
  /** Workflow ID to execute */
  workflowId: string;
  /** Workflow version (optional, uses latest if not specified) */
  workflowVersion?: string;
  /** Whether to wait for completion */
  waitForCompletion: boolean;
  /** Input to pass to subworkflow */
  workflowInput?: Record<string, unknown>;
}

/**
 * Wait step - pauses execution.
 */
export interface WaitStep extends BaseStepProperties {
  type: 'wait';
  /** Type of wait */
  waitType: 'duration' | 'event' | 'schedule' | 'approval';
  /** Duration to wait in milliseconds (for 'duration' type) */
  durationMs?: number;
  /** Event name to wait for (for 'event' type) */
  eventName?: string;
  /** Event filter conditions */
  eventFilter?: TransitionCondition | ConditionGroup;
  /** Cron expression (for 'schedule' type) */
  cronExpression?: string;
  /** Approvers for approval wait */
  approvers?: string[];
  /** Minimum approvals required */
  minApprovals?: number;
}

/**
 * Transform step - transforms data.
 */
export interface TransformStep extends BaseStepProperties {
  type: 'transform';
  /** Transformation expression or script */
  expression: string;
  /** Transformation language */
  language: 'jsonpath' | 'jmespath' | 'javascript' | 'template';
  /** Input variable name */
  inputVariable?: string;
  /** Output variable name */
  outputVariable: string;
}

/**
 * Gate step - approval or checkpoint.
 */
export interface GateStep extends BaseStepProperties {
  type: 'gate';
  /** Gate type */
  gateType: 'approval' | 'manual' | 'quality' | 'review';
  /** Required approvers (user IDs or roles) */
  approvers?: string[];
  /** Minimum approvals needed */
  minApprovals?: number;
  /** Quality thresholds to check */
  qualityThresholds?: Record<string, number>;
  /** Instructions for manual gate */
  instructions?: string;
  /** Auto-approve after timeout */
  autoApprove?: boolean;
  /** Auto-approve delay in milliseconds */
  autoApproveDelayMs?: number;
}

/**
 * Union type for all workflow steps.
 */
export type WorkflowStep =
  | AgentStep
  | SequentialStep
  | ParallelStep
  | ConditionalStep
  | LoopStep
  | SubworkflowStep
  | WaitStep
  | TransformStep
  | GateStep;

// =============================================================================
// Workflow Definition
// =============================================================================

/**
 * Trigger types for workflow execution.
 */
export type TriggerType =
  | 'manual'     // Manually triggered
  | 'scheduled'  // Triggered on schedule
  | 'event'      // Triggered by event
  | 'webhook'    // Triggered by HTTP webhook
  | 'api';       // Triggered by API call

/**
 * Workflow trigger configuration.
 */
export interface WorkflowTrigger {
  /** Trigger type */
  type: TriggerType;
  /** Trigger configuration */
  config: {
    /** Cron expression for scheduled triggers */
    schedule?: string;
    /** Event name for event triggers */
    eventName?: string;
    /** Event filter for event triggers */
    eventFilter?: TransitionCondition | ConditionGroup;
    /** Webhook path for webhook triggers */
    webhookPath?: string;
    /** Whether trigger is enabled */
    enabled: boolean;
  };
}

/**
 * Input parameter definition for workflow.
 */
export interface WorkflowParameter {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** Parameter description */
  description?: string;
  /** Whether parameter is required */
  required: boolean;
  /** Default value */
  defaultValue?: unknown;
  /** Validation schema (JSON Schema format) */
  schema?: Record<string, unknown>;
}

/**
 * Output definition for workflow.
 */
export interface WorkflowOutput {
  /** Output name */
  name: string;
  /** Output type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** Output description */
  description?: string;
  /** Source path in workflow context */
  source: string;
}

/**
 * Error handler configuration.
 */
export interface ErrorHandler {
  /** Error types to handle (empty = all errors) */
  errorTypes?: string[];
  /** Action to take on error */
  action: 'retry' | 'skip' | 'fail' | 'fallback' | 'compensate';
  /** Fallback step ID */
  fallbackStepId?: string;
  /** Compensation workflow ID */
  compensationWorkflowId?: string;
  /** Maximum retries for this handler */
  maxRetries?: number;
  /** Notification configuration */
  notify?: {
    channels: string[];
    message?: string;
  };
}

/**
 * Complete workflow definition.
 */
export interface WorkflowDefinition {
  /** Unique workflow identifier */
  id: string;
  /** Human-readable workflow name */
  name: string;
  /** Workflow description */
  description?: string;
  /** Semantic version (e.g., "1.0.0") */
  version: string;
  /** Workflow status */
  status: 'draft' | 'active' | 'deprecated' | 'archived';
  /** Workflow triggers */
  triggers?: WorkflowTrigger[];
  /** Input parameters */
  parameters?: WorkflowParameter[];
  /** Output definitions */
  outputs?: WorkflowOutput[];
  /** Starting step ID */
  entryStepId: string;
  /** All workflow steps (flat list, use transitions for flow) */
  steps: WorkflowStep[];
  /** Transitions between steps (for non-nested workflows) */
  transitions?: Transition[];
  /** Global error handlers */
  errorHandlers?: ErrorHandler[];
  /** Global timeout for entire workflow */
  timeoutMs?: number;
  /** Global retry configuration */
  retryConfig?: RetryConfig;
  /** Required agent types */
  requiredAgents?: string[];
  /** Workflow tags */
  tags?: string[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt: TimestampValue;
  /** Last update timestamp */
  updatedAt: TimestampValue;
  /** Creator user/agent ID */
  createdBy?: string;
  /** Last updater user/agent ID */
  updatedBy?: string;
}

/**
 * Compact workflow definition for storage/transmission.
 */
export interface WorkflowDefinitionSummary {
  id: string;
  name: string;
  version: string;
  status: WorkflowDefinition['status'];
  description?: string;
  tags?: string[];
  stepCount: number;
  createdAt: TimestampValue;
  updatedAt: TimestampValue;
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Checks if a step is an AgentStep.
 */
export function isAgentStep(step: WorkflowStep): step is AgentStep {
  return step.type === 'agent';
}

/**
 * Checks if a step is a SequentialStep.
 */
export function isSequentialStep(step: WorkflowStep): step is SequentialStep {
  return step.type === 'sequential';
}

/**
 * Checks if a step is a ParallelStep.
 */
export function isParallelStep(step: WorkflowStep): step is ParallelStep {
  return step.type === 'parallel';
}

/**
 * Checks if a step is a ConditionalStep.
 */
export function isConditionalStep(step: WorkflowStep): step is ConditionalStep {
  return step.type === 'conditional';
}

/**
 * Checks if a step is a LoopStep.
 */
export function isLoopStep(step: WorkflowStep): step is LoopStep {
  return step.type === 'loop';
}

/**
 * Checks if a step has nested steps.
 */
export function hasNestedSteps(step: WorkflowStep): boolean {
  return (
    step.type === 'sequential' ||
    step.type === 'parallel' ||
    step.type === 'conditional' ||
    step.type === 'loop'
  );
}

/**
 * Gets all nested steps from a step (recursive).
 */
export function getAllNestedSteps(step: WorkflowStep): WorkflowStep[] {
  const nested: WorkflowStep[] = [];

  if (step.type === 'sequential' || step.type === 'parallel') {
    for (const child of step.steps) {
      nested.push(child);
      nested.push(...getAllNestedSteps(child));
    }
  } else if (step.type === 'conditional') {
    nested.push(step.thenStep);
    nested.push(...getAllNestedSteps(step.thenStep));
    if (step.elseStep) {
      nested.push(step.elseStep);
      nested.push(...getAllNestedSteps(step.elseStep));
    }
  } else if (step.type === 'loop') {
    nested.push(step.step);
    nested.push(...getAllNestedSteps(step.step));
  }

  return nested;
}
