/**
 * Base agent class for the Inquiry Framework.
 * All agents extend this abstract class.
 */

import type {
  AgentIdentifier,
  MessageError,
  Provenance,
} from '../../contracts/base.js';
import type {
  AgentConfig,
  AgentState,
  AgentResult,
  AgentSuccess,
  AgentFailure,
  AgentCapability,
} from '../../contracts/agent.js';
import {
  createAgentConfig,
  createAgentState,
  createAgentSuccess,
  createAgentFailure,
} from '../../contracts/agent.js';
import type { AgentContext, AgentContextOptions, AgentLogger } from './agent-context.js';
import { createAgentContext, createConsoleLogger } from './agent-context.js';

/**
 * Lifecycle event types for agents.
 */
export type AgentLifecycleEvent =
  | 'init'
  | 'beforeExecute'
  | 'afterExecute'
  | 'error'
  | 'shutdown';

/**
 * Options for agent construction.
 */
export interface BaseAgentOptions {
  /** Partial configuration overrides */
  config?: Partial<AgentConfig>;
  /** Custom logger */
  logger?: AgentLogger;
  /** Initial metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Abstract base class for all agents in the Inquiry Framework.
 *
 * @typeParam TInput - Type of input data the agent accepts
 * @typeParam TOutput - Type of output data the agent produces
 *
 * @example
 * class MyAgent extends BaseAgent<string, number> {
 *   protected async process(input: string, context: AgentContext): Promise<number> {
 *     return input.length;
 *   }
 * }
 */
export abstract class BaseAgent<TInput, TOutput> {
  /** Agent identifier */
  public readonly agentId: AgentIdentifier;

  /** Agent configuration */
  protected readonly config: AgentConfig;

  /** Agent runtime state */
  protected state: AgentState;

  /** Agent logger */
  protected readonly logger: AgentLogger;

  /** Agent capabilities */
  protected readonly capabilities: AgentCapability[];

  /** Agent metadata */
  protected metadata: Record<string, unknown>;

  /** Whether the agent has been initialized */
  private initialized = false;

  /** Whether the agent is shutting down */
  private shuttingDown = false;

  /**
   * Creates a new agent instance.
   *
   * @param id - Unique agent ID
   * @param name - Human-readable agent name
   * @param options - Optional configuration
   */
  constructor(
    id: string,
    name: string,
    options: BaseAgentOptions = {}
  ) {
    this.config = createAgentConfig({
      id,
      name,
      ...options.config,
    });

    this.agentId = {
      id: this.config.id,
      type: this.config.type,
      version: this.config.version,
      name: this.config.name,
    };

    this.state = createAgentState({ status: 'idle' });
    this.logger = options.logger ?? createConsoleLogger(id);
    this.capabilities = [];
    this.metadata = options.metadata ?? {};
  }

  /**
   * Gets the current agent state.
   */
  public getState(): AgentState {
    return this.state;
  }

  /**
   * Gets the agent configuration.
   */
  public getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * Gets the agent capabilities.
   */
  public getCapabilities(): readonly AgentCapability[] {
    return this.capabilities;
  }

  /**
   * Initializes the agent. Must be called before execute().
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Agent already initialized');
      return;
    }

    this.updateState({ status: 'initializing' });
    this.logger.info('Initializing agent');

    try {
      await this.onInit();
      this.initialized = true;
      this.updateState({
        status: 'ready',
        health: 'healthy',
        startedAt: Date.now(),
      });
      this.logger.info('Agent initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.updateState({
        status: 'error',
        health: 'unhealthy',
        error: {
          code: 'INIT_ERROR',
          message: `Initialization failed: ${errorMessage}`,
          details: null,
          retryable: true,
          occurredAt: Date.now(),
        },
      });
      this.logger.error('Agent initialization failed', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Executes the agent with the given input.
   *
   * @param input - Input data to process
   * @param options - Execution context options
   * @returns Agent result (success or failure)
   */
  public async execute(
    input: TInput,
    options: AgentContextOptions = {}
  ): Promise<AgentResult<TOutput>> {
    if (!this.initialized) {
      return this.failure({
        code: 'NOT_INITIALIZED',
        message: 'Agent must be initialized before execution',
        retryable: true,
      });
    }

    if (this.shuttingDown) {
      return this.failure({
        code: 'SHUTTING_DOWN',
        message: 'Agent is shutting down',
        retryable: false,
      });
    }

    if (!this.config.enabled) {
      return this.failure({
        code: 'AGENT_DISABLED',
        message: 'Agent is disabled',
        retryable: false,
      });
    }

    // Check concurrency limits
    if (
      this.config.maxConcurrency > 0 &&
      this.state.activeTasks >= this.config.maxConcurrency
    ) {
      return this.failure({
        code: 'CONCURRENCY_LIMIT',
        message: `Maximum concurrent executions (${this.config.maxConcurrency}) reached`,
        retryable: true,
      });
    }

    const context = createAgentContext(this.agentId, this.config, options);
    const startTime = Date.now();

    this.updateState({
      status: 'running',
      activeTasks: this.state.activeTasks + 1,
      lastActivityAt: startTime,
    });

    this.logger.info('Starting execution', { executionId: context.executionId });

    try {
      // Before execute hook
      await this.beforeExecute(input, context);

      // Check for cancellation
      if (context.signal.aborted) {
        throw new Error('Execution cancelled');
      }

      // Execute with timeout
      const result = await this.executeWithTimeout(input, context);

      // After execute hook
      await this.afterExecute(input, result, context);

      const durationMs = Date.now() - startTime;
      this.updateState({
        status: 'ready',
        activeTasks: this.state.activeTasks - 1,
        totalProcessed: this.state.totalProcessed + 1,
        lastActivityAt: Date.now(),
      });

      this.logger.info('Execution completed', {
        executionId: context.executionId,
        durationMs,
      });

      return this.success(result, durationMs, {
        executionId: context.executionId,
        correlationId: context.correlationId,
      });
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Error hook
      await this.onError(error, input, context);

      this.updateState({
        status: 'ready',
        activeTasks: this.state.activeTasks - 1,
        totalFailed: this.state.totalFailed + 1,
        lastActivityAt: Date.now(),
      });

      this.logger.error('Execution failed', {
        executionId: context.executionId,
        error: errorMessage,
        durationMs,
      });

      return this.failure(
        {
          code: this.getErrorCode(error),
          message: errorMessage,
          retryable: this.isRetryable(error),
        },
        durationMs,
        {
          executionId: context.executionId,
          correlationId: context.correlationId,
        }
      );
    }
  }

  /**
   * Shuts down the agent gracefully.
   */
  public async shutdown(): Promise<void> {
    if (this.shuttingDown) {
      this.logger.warn('Agent already shutting down');
      return;
    }

    this.shuttingDown = true;
    this.updateState({ status: 'stopping' });
    this.logger.info('Shutting down agent');

    try {
      // Wait for active tasks to complete (with timeout)
      const shutdownTimeout = this.config.timeout.shutdownMs;
      const startTime = Date.now();

      while (this.state.activeTasks > 0) {
        if (Date.now() - startTime > shutdownTimeout) {
          this.logger.warn('Shutdown timeout reached, forcing shutdown', {
            activeTasks: this.state.activeTasks,
          });
          break;
        }
        await this.sleep(100);
      }

      await this.onShutdown();
      this.updateState({ status: 'stopped' });
      this.initialized = false;
      this.logger.info('Agent shutdown complete');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Shutdown error', { error: errorMessage });
      this.updateState({ status: 'error' });
      throw error;
    }
  }

  /**
   * Abstract method that subclasses must implement to process input.
   *
   * @param input - Input data to process
   * @param context - Execution context
   * @returns Promise resolving to output data
   */
  protected abstract process(input: TInput, context: AgentContext): Promise<TOutput>;

  /**
   * Lifecycle hook called during initialization.
   * Override to perform custom initialization.
   */
  protected async onInit(): Promise<void> {
    // Default: no-op
  }

  /**
   * Lifecycle hook called before each execution.
   * Override to perform pre-processing.
   */
  protected async beforeExecute(
    _input: TInput,
    _context: AgentContext
  ): Promise<void> {
    // Default: no-op
  }

  /**
   * Lifecycle hook called after successful execution.
   * Override to perform post-processing.
   */
  protected async afterExecute(
    _input: TInput,
    _output: TOutput,
    _context: AgentContext
  ): Promise<void> {
    // Default: no-op
  }

  /**
   * Lifecycle hook called when an error occurs.
   * Override to perform error handling.
   */
  protected async onError(
    _error: unknown,
    _input: TInput,
    _context: AgentContext
  ): Promise<void> {
    // Default: no-op
  }

  /**
   * Lifecycle hook called during shutdown.
   * Override to perform cleanup.
   */
  protected async onShutdown(): Promise<void> {
    // Default: no-op
  }

  /**
   * Creates a successful agent result.
   */
  protected success(
    data: TOutput,
    durationMs: number = 0,
    metadata: Record<string, unknown> = {}
  ): AgentSuccess<TOutput> {
    return createAgentSuccess(data, durationMs, {
      agentId: this.agentId.id,
      ...metadata,
    });
  }

  /**
   * Creates a failed agent result.
   */
  protected failure(
    error: Omit<MessageError, 'occurredAt' | 'details'> & { details?: string | null },
    durationMs: number = 0,
    metadata: Record<string, unknown> = {}
  ): AgentFailure {
    return createAgentFailure(
      {
        ...error,
        details: error.details ?? null,
      },
      durationMs,
      {
        agentId: this.agentId.id,
        ...metadata,
      }
    );
  }

  /**
   * Updates the agent state.
   */
  protected updateState(updates: Partial<AgentState>): void {
    this.state = {
      ...this.state,
      ...updates,
    };
  }

  /**
   * Adds a capability to the agent.
   */
  protected addCapability(capability: AgentCapability): void {
    this.capabilities.push(capability);
  }

  /**
   * Creates provenance for outgoing messages.
   */
  protected createProvenance(context: AgentContext): Provenance {
    return {
      sourceAgentId: this.agentId.id,
      originRequestId: context.provenance.originRequestId,
      processingChain: [...context.provenance.processingChain, this.agentId.id],
      createdAt: Date.now(),
      parentMessageId: context.executionId,
    };
  }

  /**
   * Executes the process method with timeout.
   */
  private async executeWithTimeout(
    input: TInput,
    context: AgentContext
  ): Promise<TOutput> {
    const timeoutMs = this.config.timeout.executionMs;

    if (timeoutMs <= 0) {
      return this.process(input, context);
    }

    return new Promise<TOutput>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      this.process(input, context)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Determines the error code from an error.
   */
  private getErrorCode(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('timeout')) return 'TIMEOUT';
      if (error.message.includes('cancelled')) return 'CANCELLED';
      if (error.message.includes('abort')) return 'ABORTED';
    }
    return 'EXECUTION_ERROR';
  }

  /**
   * Determines if an error is retryable.
   */
  private isRetryable(error: unknown): boolean {
    if (error instanceof Error) {
      // Timeouts and transient errors are retryable
      if (error.message.includes('timeout')) return true;
      if (error.message.includes('ECONNRESET')) return true;
      if (error.message.includes('ETIMEDOUT')) return true;
      // Cancelled/aborted operations are not retryable
      if (error.message.includes('cancelled')) return false;
      if (error.message.includes('abort')) return false;
    }
    return false;
  }

  /**
   * Sleep utility for async delays.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
