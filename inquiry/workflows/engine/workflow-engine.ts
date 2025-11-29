/**
 * Workflow Engine for the Inquiry Framework.
 * Orchestrates workflow execution, state management, and event handling.
 */

import type { TimestampValue } from '../../contracts/base.js';
import type {
  WorkflowDefinition,
  WorkflowStep,
  Transition,
} from '../types/definition.js';
import type {
  WorkflowExecution,
  WorkflowExecutionStatus,
  WorkflowContext,
  WorkflowResult,
  StepResult,
  ExecutionError,
  ExecutionEvent,
  StartWorkflowOptions,
  ResumeWorkflowOptions,
  CancelWorkflowOptions,
  WorkflowMetrics,
} from '../types/execution.js';
import {
  StepExecutor,
  createCancellationToken,
  type StepExecutorConfig,
} from './step-executor.js';

// =============================================================================
// Engine Configuration
// =============================================================================

/**
 * Configuration for the workflow engine.
 */
export interface WorkflowEngineConfig {
  /** Step executor configuration */
  stepExecutor: Partial<StepExecutorConfig>;
  /** Maximum execution time for workflows in milliseconds */
  defaultTimeoutMs: number;
  /** Whether to persist execution state */
  persistState: boolean;
  /** Enable detailed execution logging */
  verboseLogging: boolean;
  /** Maximum concurrent workflow executions */
  maxConcurrentExecutions: number;
}

/**
 * Default workflow engine configuration.
 */
export const DEFAULT_WORKFLOW_ENGINE_CONFIG: WorkflowEngineConfig = {
  stepExecutor: {},
  defaultTimeoutMs: 300000, // 5 minutes
  persistState: false,
  verboseLogging: false,
  maxConcurrentExecutions: 10,
};

// =============================================================================
// Engine Events
// =============================================================================

/**
 * Event types emitted by the workflow engine.
 */
export type WorkflowEngineEventType =
  | 'execution:started'
  | 'execution:completed'
  | 'execution:failed'
  | 'execution:cancelled'
  | 'execution:paused'
  | 'execution:resumed'
  | 'step:started'
  | 'step:completed'
  | 'step:failed'
  | 'step:skipped';

/**
 * Event data for workflow engine events.
 */
export interface WorkflowEngineEvent {
  type: WorkflowEngineEventType;
  executionId: string;
  workflowId: string;
  stepId?: string;
  timestamp: TimestampValue;
  data?: Record<string, unknown>;
}

/**
 * Listener for workflow engine events.
 */
export type WorkflowEngineEventListener = (event: WorkflowEngineEvent) => void;

// =============================================================================
// Execution State Store
// =============================================================================

/**
 * Interface for persisting workflow execution state.
 */
export interface ExecutionStateStore {
  save(execution: WorkflowExecution): Promise<void>;
  load(executionId: string): Promise<WorkflowExecution | null>;
  delete(executionId: string): Promise<void>;
  list(filter?: { workflowId?: string; status?: WorkflowExecutionStatus }): Promise<WorkflowExecution[]>;
}

/**
 * In-memory execution state store.
 */
export class InMemoryExecutionStore implements ExecutionStateStore {
  private readonly executions = new Map<string, WorkflowExecution>();

  async save(execution: WorkflowExecution): Promise<void> {
    this.executions.set(execution.id, { ...execution });
  }

  async load(executionId: string): Promise<WorkflowExecution | null> {
    const execution = this.executions.get(executionId);
    return execution ? { ...execution } : null;
  }

  async delete(executionId: string): Promise<void> {
    this.executions.delete(executionId);
  }

  async list(filter?: {
    workflowId?: string;
    status?: WorkflowExecutionStatus;
  }): Promise<WorkflowExecution[]> {
    let executions = Array.from(this.executions.values());

    if (filter?.workflowId) {
      executions = executions.filter((e) => e.workflowId === filter.workflowId);
    }

    if (filter?.status) {
      executions = executions.filter((e) => e.status === filter.status);
    }

    return executions.map((e) => ({ ...e }));
  }
}

// =============================================================================
// Workflow Engine
// =============================================================================

/**
 * Workflow Engine for orchestrating workflow execution.
 */
export class WorkflowEngine {
  private readonly config: WorkflowEngineConfig;
  private readonly stepExecutor: StepExecutor;
  private readonly store: ExecutionStateStore;
  private readonly listeners = new Set<WorkflowEngineEventListener>();
  private readonly activeExecutions = new Map<
    string,
    {
      execution: WorkflowExecution;
      cancellationToken: ReturnType<typeof createCancellationToken>;
    }
  >();

  constructor(
    config: Partial<WorkflowEngineConfig> = {},
    store?: ExecutionStateStore
  ) {
    this.config = { ...DEFAULT_WORKFLOW_ENGINE_CONFIG, ...config };
    this.stepExecutor = new StepExecutor(this.config.stepExecutor);
    this.store = store ?? new InMemoryExecutionStore();
  }

  /**
   * Executes a workflow with the given input.
   */
  async execute(
    workflow: WorkflowDefinition,
    options: StartWorkflowOptions = {}
  ): Promise<WorkflowResult> {
    // Check concurrent execution limit
    if (this.activeExecutions.size >= this.config.maxConcurrentExecutions) {
      throw new Error(
        `Maximum concurrent executions (${this.config.maxConcurrentExecutions}) reached`
      );
    }

    // Create execution state
    const execution = this.createExecution(workflow, options);
    const cancellationToken = createCancellationToken();

    // Track active execution
    this.activeExecutions.set(execution.id, { execution, cancellationToken });

    // Set up timeout
    const timeoutMs = options.timeoutMs ?? workflow.timeoutMs ?? this.config.defaultTimeoutMs;
    const timeoutHandle = setTimeout(() => {
      cancellationToken.cancel('Workflow execution timed out');
    }, timeoutMs);

    try {
      // Start execution
      execution.status = 'running';
      execution.startedAt = Date.now();
      this.addEvent(execution, 'workflow_started', { input: execution.input });
      this.emitEvent('execution:started', execution);

      if (this.config.persistState) {
        await this.store.save(execution);
      }

      // Execute workflow
      await this.executeWorkflow(workflow, execution, cancellationToken);

      // Mark as completed
      execution.status = 'completed';
      execution.endedAt = Date.now();
      this.addEvent(execution, 'workflow_completed', { output: execution.output });
      this.emitEvent('execution:completed', execution);

      return this.buildResult(execution);
    } catch (error) {
      // Handle failure
      const executionError = this.createError(error);

      if (cancellationToken.isCancelled) {
        execution.status = cancellationToken.reason?.includes('timed out')
          ? 'timedOut'
          : 'cancelled';
        this.emitEvent('execution:cancelled', execution);
      } else {
        execution.status = 'failed';
        this.emitEvent('execution:failed', execution);
      }

      execution.error = executionError;
      execution.endedAt = Date.now();
      this.addEvent(execution, 'workflow_failed', { error: executionError });

      return this.buildResult(execution);
    } finally {
      clearTimeout(timeoutHandle);
      this.activeExecutions.delete(execution.id);

      if (this.config.persistState) {
        await this.store.save(execution);
      }

      // Cleanup step executor
      await this.stepExecutor.cleanup();
    }
  }

  /**
   * Resumes a paused workflow execution.
   */
  async resume(
    executionId: string,
    options: ResumeWorkflowOptions = {}
  ): Promise<WorkflowResult> {
    const execution = await this.store.load(executionId);

    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    if (execution.status !== 'paused' && execution.status !== 'waiting') {
      throw new Error(`Cannot resume execution in status: ${execution.status}`);
    }

    // Apply context updates
    if (options.contextUpdates) {
      Object.assign(execution.context.variables, options.contextUpdates);
    }

    // Determine starting step
    const startStepId = options.resumeAtStepId ?? execution.currentStepId;

    if (!startStepId) {
      throw new Error('No step to resume from');
    }

    // Resume execution (similar to execute, but starting from a specific step)
    // This would require workflow definition to be stored/retrieved
    throw new Error('Resume not yet fully implemented');
  }

  /**
   * Cancels a running workflow execution.
   */
  async cancel(executionId: string, options: CancelWorkflowOptions): Promise<void> {
    const active = this.activeExecutions.get(executionId);

    if (!active) {
      throw new Error(`No active execution found: ${executionId}`);
    }

    active.cancellationToken.cancel(options.reason);
    this.log(`Cancelling execution: ${executionId}`, { reason: options.reason });
  }

  /**
   * Gets the status of an execution.
   */
  async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    // Check active executions first
    const active = this.activeExecutions.get(executionId);
    if (active) {
      return active.execution;
    }

    // Check store
    return this.store.load(executionId);
  }

  /**
   * Lists executions.
   */
  async listExecutions(filter?: {
    workflowId?: string;
    status?: WorkflowExecutionStatus;
  }): Promise<WorkflowExecution[]> {
    return this.store.list(filter);
  }

  /**
   * Adds an event listener.
   */
  addEventListener(listener: WorkflowEngineEventListener): void {
    this.listeners.add(listener);
  }

  /**
   * Removes an event listener.
   */
  removeEventListener(listener: WorkflowEngineEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Gets the number of active executions.
   */
  get activeExecutionCount(): number {
    return this.activeExecutions.size;
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * Executes the workflow steps.
   */
  private async executeWorkflow(
    workflow: WorkflowDefinition,
    execution: WorkflowExecution,
    cancellationToken: ReturnType<typeof createCancellationToken>
  ): Promise<void> {
    const context = execution.context;

    // Build step map for quick lookup
    const stepMap = new Map<string, WorkflowStep>();
    for (const step of workflow.steps) {
      stepMap.set(step.id, step);
    }

    // Start from entry step
    let currentStepId: string | null = workflow.entryStepId;

    while (currentStepId) {
      cancellationToken.throwIfCancelled();

      const step = stepMap.get(currentStepId);
      if (!step) {
        throw new Error(`Step not found: ${currentStepId}`);
      }

      // Update execution state
      execution.currentStepId = currentStepId;
      execution.runningStepIds = [currentStepId];
      execution.updatedAt = Date.now();

      this.addEvent(execution, 'step_started', { stepId: step.id, stepName: step.name });
      this.emitEvent('step:started', execution, step.id);

      // Execute step
      const result = await this.stepExecutor.execute(step, context, cancellationToken);

      // Store result
      context.stepResults[step.id] = result;
      execution.stepExecutions[step.id] = {
        id: this.generateId(),
        stepId: step.id,
        stepName: step.name,
        stepType: step.type,
        status: result.status,
        input: {},
        output: result.output,
        error: result.error,
        retryAttempt: result.retryCount,
        createdAt: result.startedAt,
        startedAt: result.startedAt,
        endedAt: result.endedAt,
        durationMs: result.durationMs,
      };

      // Update execution status
      execution.runningStepIds = [];
      execution.completedStepIds.push(step.id);
      execution.updatedAt = Date.now();

      // Apply output mappings to workflow output
      if (step.outputMappings) {
        for (const mapping of step.outputMappings) {
          const value = this.getNestedValue(result.output, mapping.source);
          this.setNestedValue(context.output, mapping.target.replace('output.', ''), value);
        }
      }

      // Emit step event
      if (result.status === 'completed') {
        this.addEvent(execution, 'step_completed', {
          stepId: step.id,
          duration: result.durationMs,
        });
        this.emitEvent('step:completed', execution, step.id);
      } else if (result.status === 'failed') {
        this.addEvent(execution, 'step_failed', {
          stepId: step.id,
          error: result.error,
        });
        this.emitEvent('step:failed', execution, step.id);
        throw new Error(result.error?.message ?? 'Step failed');
      } else if (result.status === 'skipped') {
        this.addEvent(execution, 'step_skipped', { stepId: step.id });
        this.emitEvent('step:skipped', execution, step.id);
      }

      if (this.config.persistState) {
        await this.store.save(execution);
      }

      // Determine next step
      currentStepId = this.determineNextStep(step, workflow, context);
    }

    // Copy final output
    execution.output = { ...context.output };
  }

  /**
   * Determines the next step to execute based on transitions.
   */
  private determineNextStep(
    currentStep: WorkflowStep,
    workflow: WorkflowDefinition,
    context: WorkflowContext
  ): string | null {
    // If no transitions defined, execute steps sequentially
    if (!workflow.transitions || workflow.transitions.length === 0) {
      const currentIndex = workflow.steps.findIndex((s) => s.id === currentStep.id);
      if (currentIndex >= 0 && currentIndex < workflow.steps.length - 1) {
        return workflow.steps[currentIndex + 1].id;
      }
      return null;
    }

    // Find applicable transitions
    const transitions = workflow.transitions
      .filter((t) => t.from === currentStep.id)
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    // Evaluate conditions
    for (const transition of transitions) {
      if (transition.isDefault) continue; // Check default last

      if (!transition.condition) {
        return transition.to;
      }

      if (this.evaluateCondition(transition.condition, context)) {
        return transition.to;
      }
    }

    // Check default transition
    const defaultTransition = transitions.find((t) => t.isDefault);
    if (defaultTransition) {
      return defaultTransition.to;
    }

    return null;
  }

  /**
   * Evaluates a transition condition.
   */
  private evaluateCondition(
    condition: Transition['condition'],
    context: WorkflowContext
  ): boolean {
    if (!condition) return true;

    // Handle condition group
    if ('logic' in condition) {
      if (condition.logic === 'and') {
        return condition.conditions.every((c) => this.evaluateCondition(c, context));
      } else {
        return condition.conditions.some((c) => this.evaluateCondition(c, context));
      }
    }

    // Handle single condition
    const fieldValue = this.getContextValue(condition.field, context);
    let result: boolean;

    switch (condition.operator) {
      case 'eq':
        result = fieldValue === condition.value;
        break;
      case 'neq':
        result = fieldValue !== condition.value;
        break;
      case 'gt':
        result = Number(fieldValue) > Number(condition.value);
        break;
      case 'gte':
        result = Number(fieldValue) >= Number(condition.value);
        break;
      case 'lt':
        result = Number(fieldValue) < Number(condition.value);
        break;
      case 'lte':
        result = Number(fieldValue) <= Number(condition.value);
        break;
      case 'exists':
        result = fieldValue !== undefined && fieldValue !== null;
        break;
      case 'isEmpty':
        result =
          fieldValue === null ||
          fieldValue === undefined ||
          fieldValue === '' ||
          (Array.isArray(fieldValue) && fieldValue.length === 0);
        break;
      case 'isTrue':
        result = fieldValue === true;
        break;
      case 'isFalse':
        result = fieldValue === false;
        break;
      default:
        result = Boolean(fieldValue);
    }

    return condition.negate ? !result : result;
  }

  /**
   * Creates a new execution state.
   */
  private createExecution(
    workflow: WorkflowDefinition,
    options: StartWorkflowOptions
  ): WorkflowExecution {
    const executionId = this.generateId();
    const now = Date.now();
    const input = options.input ?? {};

    const context: WorkflowContext = {
      input,
      output: {},
      variables: options.initialContext?.variables ?? {},
      system: {
        executionId,
        workflowId: workflow.id,
        workflowVersion: workflow.version,
        startedAt: now,
        currentStepId: null,
      },
      stepResults: {},
    };

    return {
      id: executionId,
      workflowId: workflow.id,
      workflowVersion: workflow.version,
      status: 'pending',
      trigger: {
        type: 'api',
        source: options.metadata?.source as string,
      },
      input,
      output: {},
      context,
      currentStepId: null,
      completedStepIds: [],
      runningStepIds: [],
      stepExecutions: {},
      error: null,
      history: [],
      createdAt: now,
      startedAt: null,
      endedAt: null,
      updatedAt: now,
      childExecutionIds: [],
      priority: options.priority ?? 1,
      tags: options.tags,
      metadata: options.metadata,
    };
  }

  /**
   * Builds the workflow result.
   */
  private buildResult(execution: WorkflowExecution): WorkflowResult {
    const endedAt = execution.endedAt ?? Date.now();
    const startedAt = execution.startedAt ?? execution.createdAt;

    const metrics: WorkflowMetrics = {
      stepsExecuted: Object.keys(execution.context.stepResults).length,
      stepsCompleted: execution.completedStepIds.length,
      stepsFailed: Object.values(execution.context.stepResults).filter(
        (r) => r.status === 'failed'
      ).length,
      stepsSkipped: Object.values(execution.context.stepResults).filter(
        (r) => r.status === 'skipped'
      ).length,
      totalRetries: Object.values(execution.context.stepResults).reduce(
        (sum, r) => sum + r.retryCount,
        0
      ),
      totalApiCalls: 0,
      totalTokensUsed: 0,
    };

    return {
      executionId: execution.id,
      status: execution.status,
      output: execution.output,
      error: execution.error,
      stepResults: execution.context.stepResults,
      startedAt,
      endedAt,
      durationMs: Number(endedAt) - Number(startedAt),
      metrics,
    };
  }

  /**
   * Adds an event to execution history.
   */
  private addEvent(
    execution: WorkflowExecution,
    type: ExecutionEvent['type'],
    data: Record<string, unknown>
  ): void {
    execution.history.push({
      id: this.generateId(),
      timestamp: Date.now(),
      type,
      data,
      severity: type.includes('failed') || type.includes('error') ? 'error' : 'info',
    });
    execution.updatedAt = Date.now();
  }

  /**
   * Emits an event to listeners.
   */
  private emitEvent(
    type: WorkflowEngineEventType,
    execution: WorkflowExecution,
    stepId?: string
  ): void {
    const event: WorkflowEngineEvent = {
      type,
      executionId: execution.id,
      workflowId: execution.workflowId,
      stepId,
      timestamp: Date.now(),
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Ignore listener errors
      }
    }
  }

  /**
   * Creates an execution error.
   */
  private createError(error: unknown): ExecutionError {
    if (error instanceof Error) {
      return {
        code: 'WORKFLOW_EXECUTION_ERROR',
        message: error.message,
        type: 'system',
        stack: error.stack,
        retryable: false,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      type: 'system',
      retryable: false,
    };
  }

  /**
   * Gets a value from workflow context.
   */
  private getContextValue(path: string, context: WorkflowContext): unknown {
    if (path === 'input') return context.input;
    if (path === 'output') return context.output;
    if (path.startsWith('input.')) return this.getNestedValue(context.input, path.slice(6));
    if (path.startsWith('output.')) return this.getNestedValue(context.output, path.slice(7));
    if (path.startsWith('variables.'))
      return this.getNestedValue(context.variables, path.slice(10));
    if (path.startsWith('steps.'))
      return this.getNestedValue(context.stepResults as Record<string, unknown>, path.slice(6));

    return this.getNestedValue(context.variables, path);
  }

  /**
   * Gets a nested value from an object.
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  /**
   * Sets a nested value in an object.
   */
  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    if (!lastKey) return;

    let current = obj;
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[lastKey] = value;
  }

  /**
   * Generates a unique ID.
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Logs a message if verbose logging is enabled.
   */
  private log(message: string, data?: Record<string, unknown>): void {
    if (this.config.verboseLogging) {
      console.log(`[WorkflowEngine] ${message}`, data ?? '');
    }
  }
}

/**
 * Creates a new workflow engine instance.
 */
export function createWorkflowEngine(
  config?: Partial<WorkflowEngineConfig>,
  store?: ExecutionStateStore
): WorkflowEngine {
  return new WorkflowEngine(config, store);
}
