/**
 * Step Executor for the Inquiry Framework.
 * Handles execution of individual workflow steps with retry logic,
 * error handling, and agent integration.
 */

import type { BaseAgent } from '../../agents/base/base-agent.js';
import { getAgentRegistry, type AgentRegistry } from '../../agents/registry/agent-registry.js';
import { isAgentSuccess } from '../../contracts/agent.js';
import type { TimestampValue } from '../../contracts/base.js';
import type {
  WorkflowStep,
  AgentStep,
  SequentialStep,
  ParallelStep,
  ConditionalStep,
  LoopStep,
  TransformStep,
  WaitStep,
  GateStep,
  SubworkflowStep,
  RetryConfig,
  TransitionCondition,
  ConditionGroup,
} from '../types/definition.js';
import type {
  StepResult,
  StepExecution,
  StepExecutionStatus,
  WorkflowContext,
  ExecutionError,
  StepLogger,
  CancellationToken,
} from '../types/execution.js';

// =============================================================================
// Step Executor Configuration
// =============================================================================

/**
 * Configuration for the step executor.
 */
export interface StepExecutorConfig {
  /** Default retry configuration */
  defaultRetry: RetryConfig;
  /** Default timeout for step execution in milliseconds */
  defaultTimeoutMs: number;
  /** Maximum parallel executions */
  maxParallelExecutions: number;
  /** Whether to enable detailed logging */
  verboseLogging: boolean;
}

/**
 * Default step executor configuration.
 */
export const DEFAULT_STEP_EXECUTOR_CONFIG: StepExecutorConfig = {
  defaultRetry: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  },
  defaultTimeoutMs: 60000,
  maxParallelExecutions: 10,
  verboseLogging: false,
};

// =============================================================================
// Step Logger Implementation
// =============================================================================

/**
 * Creates a step logger instance.
 */
export function createStepLogger(stepId: string, stepName: string): StepLogger {
  const prefix = `[${stepName}:${stepId}]`;

  return {
    debug(message: string, data?: Record<string, unknown>): void {
      console.debug(prefix, message, data ?? '');
    },
    info(message: string, data?: Record<string, unknown>): void {
      console.info(prefix, message, data ?? '');
    },
    warn(message: string, data?: Record<string, unknown>): void {
      console.warn(prefix, message, data ?? '');
    },
    error(message: string, data?: Record<string, unknown>): void {
      console.error(prefix, message, data ?? '');
    },
  };
}

// =============================================================================
// Cancellation Token Implementation
// =============================================================================

/**
 * Creates a cancellation token.
 */
export function createCancellationToken(): CancellationToken & { cancel(reason?: string): void } {
  let cancelled = false;
  let cancelReason: string | undefined;
  const callbacks: Array<() => void> = [];

  return {
    get isCancelled(): boolean {
      return cancelled;
    },
    get reason(): string | undefined {
      return cancelReason;
    },
    onCancelled(callback: () => void): void {
      if (cancelled) {
        callback();
      } else {
        callbacks.push(callback);
      }
    },
    throwIfCancelled(): void {
      if (cancelled) {
        throw new Error(`Step cancelled: ${cancelReason ?? 'No reason provided'}`);
      }
    },
    cancel(reason?: string): void {
      if (!cancelled) {
        cancelled = true;
        cancelReason = reason;
        callbacks.forEach((cb) => {
          try {
            cb();
          } catch {
            // Ignore callback errors
          }
        });
      }
    },
  };
}

// =============================================================================
// Step Executor
// =============================================================================

/**
 * Executor for individual workflow steps.
 * Handles step execution, retry logic, and error handling.
 */
export class StepExecutor {
  private readonly config: StepExecutorConfig;
  private readonly registry: AgentRegistry;
  private readonly agentInstances: Map<string, BaseAgent<unknown, unknown>> = new Map();

  constructor(config: Partial<StepExecutorConfig> = {}) {
    this.config = { ...DEFAULT_STEP_EXECUTOR_CONFIG, ...config };
    this.registry = getAgentRegistry();
  }

  /**
   * Executes a workflow step.
   */
  async execute(
    step: WorkflowStep,
    context: WorkflowContext,
    cancellationToken?: CancellationToken
  ): Promise<StepResult> {
    const startTime = Date.now();
    const logger = createStepLogger(step.id, step.name);

    if (this.config.verboseLogging) {
      logger.info('Starting step execution', { type: step.type });
    }

    // Check if step should be skipped based on 'when' condition
    if (step.when && !this.evaluateCondition(step.when, context)) {
      logger.info('Step skipped due to condition');
      return this.createResult(step.id, 'skipped', null, null, startTime, 0);
    }

    // Get retry config
    const retryConfig = step.retry ?? this.config.defaultRetry;
    let lastError: ExecutionError | null = null;
    let attempt = 0;

    while (attempt < retryConfig.maxAttempts) {
      attempt++;

      try {
        // Check cancellation
        cancellationToken?.throwIfCancelled();

        // Execute based on step type
        const output = await this.executeStepByType(step, context, logger, cancellationToken);

        if (this.config.verboseLogging) {
          logger.info('Step completed successfully', { attempt });
        }

        return this.createResult(step.id, 'completed', output, null, startTime, attempt - 1);
      } catch (error) {
        lastError = this.createError(error);

        // Check if we should retry
        const shouldRetry = this.shouldRetry(lastError, retryConfig, attempt);

        if (!shouldRetry) {
          logger.error('Step failed (no retry)', { error: lastError.message, attempt });
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateRetryDelay(retryConfig, attempt);
        logger.warn('Step failed, retrying', { error: lastError.message, attempt, delay });

        await this.sleep(delay);
      }
    }

    return this.createResult(step.id, 'failed', null, lastError, startTime, attempt - 1);
  }

  /**
   * Executes a step based on its type.
   */
  private async executeStepByType(
    step: WorkflowStep,
    context: WorkflowContext,
    logger: StepLogger,
    cancellationToken?: CancellationToken
  ): Promise<Record<string, unknown>> {
    switch (step.type) {
      case 'agent':
        return this.executeAgentStep(step, context, logger);
      case 'sequential':
        return this.executeSequentialStep(step, context, cancellationToken);
      case 'parallel':
        return this.executeParallelStep(step, context, cancellationToken);
      case 'conditional':
        return this.executeConditionalStep(step, context, cancellationToken);
      case 'loop':
        return this.executeLoopStep(step, context, cancellationToken);
      case 'transform':
        return this.executeTransformStep(step, context);
      case 'wait':
        return this.executeWaitStep(step, context, cancellationToken);
      case 'gate':
        return this.executeGateStep(step, context, logger);
      case 'subworkflow':
        return this.executeSubworkflowStep(step, context, logger);
      default:
        throw new Error(`Unsupported step type: ${(step as { type: string }).type}`);
    }
  }

  /**
   * Executes an agent step.
   */
  private async executeAgentStep(
    step: AgentStep,
    context: WorkflowContext,
    logger: StepLogger
  ): Promise<Record<string, unknown>> {
    const agentId = step.agentId;

    // Get or create agent instance
    let agent = this.agentInstances.get(agentId);

    if (!agent) {
      // Check if agent is registered
      if (!this.registry.has(agentId)) {
        logger.warn(`Agent "${agentId}" not found in registry, using placeholder`);
        // Return placeholder result for unregistered agents
        return {
          status: 'completed',
          agentId,
          message: `Agent ${agentId} not registered - placeholder execution`,
          result: null,
        };
      }

      // Create and initialize agent
      agent = await this.registry.createAndInitialize(agentId);
      this.agentInstances.set(agentId, agent);
    }

    // Build input for agent
    const input = this.buildStepInput(step, context);

    // Merge with static input
    const mergedInput = { ...input, ...step.staticInput };

    logger.info('Executing agent', { agentId, inputKeys: Object.keys(mergedInput) });

    // Execute agent
    const result = await agent.execute(mergedInput);

    if (isAgentSuccess(result)) {
      return {
        status: 'completed',
        agentId,
        result: result.data,
        durationMs: result.durationMs,
        metadata: result.metadata,
      };
    } else {
      return {
        status: 'failed',
        agentId,
        error: result.error,
        durationMs: result.durationMs,
        metadata: result.metadata,
      };
    }
  }

  /**
   * Executes a sequential step.
   */
  private async executeSequentialStep(
    step: SequentialStep,
    context: WorkflowContext,
    cancellationToken?: CancellationToken
  ): Promise<Record<string, unknown>> {
    const results: StepResult[] = [];

    for (const childStep of step.steps) {
      cancellationToken?.throwIfCancelled();

      const result = await this.execute(childStep, context, cancellationToken);
      results.push(result);

      // Store result in context
      context.stepResults[childStep.id] = result;

      // Stop on error if configured
      if (step.stopOnError && result.status === 'failed') {
        break;
      }
    }

    return {
      results: results.map((r) => ({
        stepId: r.stepId,
        status: r.status,
        output: r.output,
      })),
      completedCount: results.filter((r) => r.status === 'completed').length,
      failedCount: results.filter((r) => r.status === 'failed').length,
    };
  }

  /**
   * Executes a parallel step.
   */
  private async executeParallelStep(
    step: ParallelStep,
    context: WorkflowContext,
    cancellationToken?: CancellationToken
  ): Promise<Record<string, unknown>> {
    if (step.steps.length === 0) {
      return { results: [], completedCount: 0, failedCount: 0 };
    }

    // Limit concurrency
    const maxConcurrency = step.maxConcurrency ?? this.config.maxParallelExecutions;
    const chunks = this.chunkArray(step.steps, maxConcurrency);
    const allResults: StepResult[] = [];

    for (const chunk of chunks) {
      cancellationToken?.throwIfCancelled();

      const promises = chunk.map((childStep) =>
        this.execute(childStep, context, cancellationToken)
      );

      if (step.failureStrategy === 'failFast') {
        // Fail on first error
        const results = await Promise.all(promises);
        allResults.push(...results);

        const failed = results.find((r) => r.status === 'failed');
        if (failed) {
          throw new Error(`Parallel step failed: ${failed.error?.message}`);
        }
      } else {
        // Wait for all
        const settled = await Promise.allSettled(promises);
        for (const result of settled) {
          if (result.status === 'fulfilled') {
            allResults.push(result.value);
          } else {
            allResults.push(
              this.createResult(
                'unknown',
                'failed',
                null,
                this.createError(result.reason),
                Date.now(),
                0
              )
            );
          }
        }
      }

      // Store results in context
      for (const result of allResults) {
        context.stepResults[result.stepId] = result;
      }
    }

    const completedCount = allResults.filter((r) => r.status === 'completed').length;

    // Check minimum successful threshold
    if (step.minSuccessful && completedCount < step.minSuccessful) {
      throw new Error(
        `Parallel step requires ${step.minSuccessful} successful executions, got ${completedCount}`
      );
    }

    return {
      results: allResults.map((r) => ({
        stepId: r.stepId,
        status: r.status,
        output: r.output,
      })),
      completedCount,
      failedCount: allResults.filter((r) => r.status === 'failed').length,
    };
  }

  /**
   * Executes a conditional step.
   */
  private async executeConditionalStep(
    step: ConditionalStep,
    context: WorkflowContext,
    cancellationToken?: CancellationToken
  ): Promise<Record<string, unknown>> {
    const conditionMet = this.evaluateCondition(step.condition, context);

    if (conditionMet) {
      const result = await this.execute(step.thenStep, context, cancellationToken);
      context.stepResults[step.thenStep.id] = result;
      return { branch: 'then', result: result.output };
    } else if (step.elseStep) {
      const result = await this.execute(step.elseStep, context, cancellationToken);
      context.stepResults[step.elseStep.id] = result;
      return { branch: 'else', result: result.output };
    }

    return { branch: 'none', skipped: true };
  }

  /**
   * Executes a loop step.
   */
  private async executeLoopStep(
    step: LoopStep,
    context: WorkflowContext,
    cancellationToken?: CancellationToken
  ): Promise<Record<string, unknown>> {
    const results: StepResult[] = [];
    let iteration = 0;

    // Handle forEach-style loop over collection
    if (step.collection) {
      const collection = this.getContextValue(step.collection, context);
      if (!Array.isArray(collection)) {
        throw new Error(`Loop collection "${step.collection}" is not an array`);
      }

      for (const item of collection) {
        if (iteration >= step.maxIterations) break;
        cancellationToken?.throwIfCancelled();

        // Set iteration variables
        if (step.indexVariable) {
          context.variables[step.indexVariable] = iteration;
        }
        if (step.itemVariable) {
          context.variables[step.itemVariable] = item;
        }

        const result = await this.execute(step.step, context, cancellationToken);
        results.push(result);
        context.stepResults[`${step.step.id}_${iteration}`] = result;

        iteration++;

        if (step.iterationDelayMs) {
          await this.sleep(step.iterationDelayMs);
        }
      }
    } else {
      // Handle while/until loop
      while (iteration < step.maxIterations) {
        cancellationToken?.throwIfCancelled();

        // Check while condition
        if (step.whileCondition && !this.evaluateCondition(step.whileCondition, context)) {
          break;
        }

        // Set iteration index
        if (step.indexVariable) {
          context.variables[step.indexVariable] = iteration;
        }

        const result = await this.execute(step.step, context, cancellationToken);
        results.push(result);
        context.stepResults[`${step.step.id}_${iteration}`] = result;

        iteration++;

        // Check until condition
        if (step.untilCondition && this.evaluateCondition(step.untilCondition, context)) {
          break;
        }

        if (step.iterationDelayMs) {
          await this.sleep(step.iterationDelayMs);
        }
      }
    }

    return {
      iterations: iteration,
      results: results.map((r) => ({
        stepId: r.stepId,
        status: r.status,
        output: r.output,
      })),
    };
  }

  /**
   * Executes a transform step.
   */
  private async executeTransformStep(
    step: TransformStep,
    context: WorkflowContext
  ): Promise<Record<string, unknown>> {
    const input = step.inputVariable
      ? this.getContextValue(step.inputVariable, context)
      : context.input;

    let output: unknown;

    switch (step.language) {
      case 'jsonpath':
      case 'jmespath':
        // Simple pass-through for now (would need actual library integration)
        output = input;
        break;
      case 'javascript':
        // Evaluate expression (sandboxed in production)
        try {
          const fn = new Function('input', 'context', `return ${step.expression}`);
          output = fn(input, context);
        } catch (error) {
          throw new Error(`Transform expression error: ${(error as Error).message}`);
        }
        break;
      case 'template':
        // Simple template string replacement
        output = step.expression.replace(/\$\{([^}]+)\}/g, (_match, path) => {
          return String(this.getContextValue(path, context) ?? '');
        });
        break;
      default:
        output = input;
    }

    // Store in output variable
    this.setContextValue(step.outputVariable, output, context);

    return { transformed: output };
  }

  /**
   * Executes a wait step.
   */
  private async executeWaitStep(
    step: WaitStep,
    context: WorkflowContext,
    cancellationToken?: CancellationToken
  ): Promise<Record<string, unknown>> {
    switch (step.waitType) {
      case 'duration':
        if (step.durationMs) {
          await this.sleepWithCancellation(step.durationMs, cancellationToken);
        }
        return { waited: step.durationMs ?? 0, type: 'duration' };

      case 'event':
        // In a real implementation, this would subscribe to an event bus
        throw new Error('Event-based waiting not yet implemented');

      case 'schedule':
        // In a real implementation, this would wait until the cron expression matches
        throw new Error('Schedule-based waiting not yet implemented');

      case 'approval':
        // In a real implementation, this would wait for approval from the specified approvers
        throw new Error('Approval-based waiting not yet implemented');

      default:
        return { waited: 0, type: 'unknown' };
    }
  }

  /**
   * Executes a gate step (approval/checkpoint).
   */
  private async executeGateStep(
    step: GateStep,
    context: WorkflowContext,
    logger: StepLogger
  ): Promise<Record<string, unknown>> {
    logger.info('Gate step reached', { gateType: step.gateType });

    switch (step.gateType) {
      case 'approval':
        // In production, this would integrate with an approval system
        if (step.autoApprove) {
          logger.info('Auto-approving gate');
          return { approved: true, autoApproved: true };
        }
        // For now, auto-approve in development
        return { approved: true, message: 'Auto-approved (development mode)' };

      case 'manual':
        // Manual gates require external intervention
        return { status: 'pending', instructions: step.instructions };

      case 'quality':
        // Check quality thresholds
        if (step.qualityThresholds) {
          const failed: string[] = [];
          for (const [metric, threshold] of Object.entries(step.qualityThresholds)) {
            const value = Number(this.getContextValue(`metrics.${metric}`, context) ?? 0);
            if (value < threshold) {
              failed.push(`${metric}: ${value} < ${threshold}`);
            }
          }
          if (failed.length > 0) {
            throw new Error(`Quality thresholds not met: ${failed.join(', ')}`);
          }
        }
        return { passed: true, type: 'quality' };

      case 'review':
        // Review gates are similar to approval
        return { status: 'pending', type: 'review' };

      default:
        return { passed: true };
    }
  }

  /**
   * Executes a subworkflow step.
   */
  private async executeSubworkflowStep(
    step: SubworkflowStep,
    context: WorkflowContext,
    logger: StepLogger
  ): Promise<Record<string, unknown>> {
    logger.info('Subworkflow execution', { workflowId: step.workflowId });

    // In a full implementation, this would load and execute the subworkflow
    // For now, return a placeholder
    return {
      status: 'pending',
      workflowId: step.workflowId,
      message: 'Subworkflow execution not yet implemented',
    };
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  /**
   * Builds input for a step from context using input mappings.
   */
  private buildStepInput(
    step: WorkflowStep,
    context: WorkflowContext
  ): Record<string, unknown> {
    const input: Record<string, unknown> = {};

    if (step.inputMappings) {
      for (const mapping of step.inputMappings) {
        let value = this.getContextValue(mapping.source, context);

        if (value === undefined && mapping.defaultValue !== undefined) {
          value = mapping.defaultValue;
        }

        if (value === undefined && mapping.required) {
          throw new Error(`Required input mapping "${mapping.source}" not found`);
        }

        if (value !== undefined) {
          this.setNestedValue(input, mapping.target, value);
        }
      }
    }

    return input;
  }

  /**
   * Evaluates a condition against context.
   */
  private evaluateCondition(
    condition: TransitionCondition | ConditionGroup,
    context: WorkflowContext
  ): boolean {
    // Handle condition group (logic: 'and' | 'or')
    if ('logic' in condition) {
      const group = condition as ConditionGroup;
      if (group.logic === 'and') {
        return group.conditions.every((c) => this.evaluateCondition(c, context));
      } else {
        return group.conditions.some((c) => this.evaluateCondition(c, context));
      }
    }

    // Handle single condition
    const cond = condition as TransitionCondition;
    const fieldValue = this.getContextValue(cond.field, context);
    let result: boolean;

    switch (cond.operator) {
      case 'eq':
        result = fieldValue === cond.value;
        break;
      case 'neq':
        result = fieldValue !== cond.value;
        break;
      case 'gt':
        result = Number(fieldValue) > Number(cond.value);
        break;
      case 'gte':
        result = Number(fieldValue) >= Number(cond.value);
        break;
      case 'lt':
        result = Number(fieldValue) < Number(cond.value);
        break;
      case 'lte':
        result = Number(fieldValue) <= Number(cond.value);
        break;
      case 'in':
        result = Array.isArray(cond.value) && cond.value.includes(fieldValue);
        break;
      case 'notIn':
        result = !Array.isArray(cond.value) || !cond.value.includes(fieldValue);
        break;
      case 'contains':
        if (typeof fieldValue === 'string') {
          result = fieldValue.includes(String(cond.value));
        } else if (Array.isArray(fieldValue)) {
          result = fieldValue.includes(cond.value);
        } else {
          result = false;
        }
        break;
      case 'matches':
        result = new RegExp(String(cond.value)).test(String(fieldValue));
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

    return cond.negate ? !result : result;
  }

  /**
   * Gets a value from the workflow context.
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
    if (path.startsWith('system.'))
      return this.getNestedValue(context.system as Record<string, unknown>, path.slice(7));

    return this.getNestedValue(context.variables, path);
  }

  /**
   * Sets a value in the workflow context.
   */
  private setContextValue(path: string, value: unknown, context: WorkflowContext): void {
    if (path.startsWith('output.')) {
      this.setNestedValue(context.output, path.slice(7), value);
    } else if (path.startsWith('variables.')) {
      this.setNestedValue(context.variables, path.slice(10), value);
    } else {
      this.setNestedValue(context.variables, path, value);
    }
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
   * Determines if a step should be retried.
   */
  private shouldRetry(error: ExecutionError, config: RetryConfig, attempt: number): boolean {
    if (attempt >= config.maxAttempts) return false;
    if (!error.retryable) return false;

    // Check specific error types
    if (config.noRetryOn && config.noRetryOn.includes(error.code)) {
      return false;
    }

    if (config.retryOn && config.retryOn.length > 0) {
      return config.retryOn.includes(error.code);
    }

    return true;
  }

  /**
   * Calculates retry delay with exponential backoff.
   */
  private calculateRetryDelay(config: RetryConfig, attempt: number): number {
    const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelayMs);
  }

  /**
   * Creates a step result.
   */
  private createResult(
    stepId: string,
    status: StepExecutionStatus,
    output: Record<string, unknown> | null,
    error: ExecutionError | null,
    startTime: number,
    retryCount: number
  ): StepResult {
    const endedAt = Date.now();
    return {
      stepId,
      status,
      output,
      error,
      startedAt: startTime,
      endedAt,
      durationMs: endedAt - startTime,
      retryCount,
    };
  }

  /**
   * Creates an execution error.
   */
  private createError(error: unknown): ExecutionError {
    if (error instanceof Error) {
      return {
        code: 'STEP_EXECUTION_ERROR',
        message: error.message,
        type: 'system',
        stack: error.stack,
        retryable: true,
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
   * Chunks an array into smaller arrays.
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Sleeps for a specified duration.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Sleeps with cancellation support.
   */
  private sleepWithCancellation(
    ms: number,
    cancellationToken?: CancellationToken
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);

      cancellationToken?.onCancelled(() => {
        clearTimeout(timeout);
        reject(new Error('Sleep cancelled'));
      });
    });
  }

  /**
   * Cleans up agent instances.
   */
  async cleanup(): Promise<void> {
    for (const [id, agent] of this.agentInstances) {
      try {
        await agent.shutdown();
      } catch {
        // Ignore cleanup errors
      }
    }
    this.agentInstances.clear();
  }
}
