/**
 * Workflow Type Definitions for the Inquiry Framework.
 *
 * Exports all types for workflow definition and execution.
 */

// =============================================================================
// Definition Types
// =============================================================================

export {
  // Step types
  type StepType,
  type StepPriority,

  // Condition types
  type ConditionOperator,
  type TransitionCondition,
  type ConditionGroup,
  type Transition,

  // Configuration types
  type RetryConfig,
  type TimeoutConfig,
  type InputMapping,
  type OutputMapping,

  // Step base
  type BaseStepProperties,

  // Step variants
  type AgentStep,
  type SequentialStep,
  type ParallelStep,
  type ConditionalStep,
  type LoopStep,
  type SubworkflowStep,
  type WaitStep,
  type TransformStep,
  type GateStep,
  type WorkflowStep,

  // Workflow definition
  type TriggerType,
  type WorkflowTrigger,
  type WorkflowParameter,
  type WorkflowOutput,
  type ErrorHandler,
  type WorkflowDefinition,
  type WorkflowDefinitionSummary,

  // Type guards
  isAgentStep,
  isSequentialStep,
  isParallelStep,
  isConditionalStep,
  isLoopStep,
  hasNestedSteps,
  getAllNestedSteps,
} from './definition.js';

// =============================================================================
// Execution Types
// =============================================================================

export {
  // Status types
  type WorkflowExecutionStatus,
  type StepExecutionStatus,

  // Context types
  type WorkflowContext,
  type StepContext,
  type StepLogger,
  type CancellationToken,

  // Result types
  type StepResult,
  type StepMetrics,
  type ExecutionError,
  type WorkflowResult,
  type WorkflowMetrics,

  // Execution state
  type WorkflowExecution,
  type StepExecution,
  type ExecutionEvent,

  // Control types
  type StartWorkflowOptions,
  type ResumeWorkflowOptions,
  type CancelWorkflowOptions,
  type ApprovalDecision,

  // Query types
  type WorkflowExecutionSummary,
  type ExecutionFilter,
  type ExecutionPagination,

  // Type guards
  isTerminalStatus,
  isStepTerminalStatus,
  canResume,
  canCancel,
} from './execution.js';
