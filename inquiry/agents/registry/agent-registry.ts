/**
 * Agent Registry for the Inquiry Framework.
 * Provides runtime registration, discovery, and instantiation of agents.
 */

import type { AgentType, AgentConfig, AgentMetadata, AgentCapability } from '../../contracts/agent.js';
import type { TimestampValue } from '../../contracts/base.js';
import type { BaseAgent, BaseAgentOptions } from '../base/base-agent.js';

/**
 * Constructor type for agents.
 */
export type AgentConstructor<TInput = unknown, TOutput = unknown> = new (
  id: string,
  name: string,
  options?: BaseAgentOptions
) => BaseAgent<TInput, TOutput>;

/**
 * Agent registration entry.
 */
export interface AgentRegistration<TInput = unknown, TOutput = unknown> {
  /** Unique registration ID */
  readonly id: string;
  /** Agent type category */
  readonly type: AgentType;
  /** Human-readable name */
  readonly name: string;
  /** Agent description */
  readonly description: string;
  /** Agent version */
  readonly version: string;
  /** Agent constructor */
  readonly constructor: AgentConstructor<TInput, TOutput>;
  /** Default configuration */
  readonly defaultConfig: Partial<AgentConfig>;
  /** Agent capabilities */
  readonly capabilities: readonly AgentCapability[];
  /** Tags for filtering */
  readonly tags: readonly string[];
  /** When the agent was registered */
  readonly registeredAt: TimestampValue;
}

/**
 * Options for registering an agent.
 */
export interface RegisterAgentOptions<TInput = unknown, TOutput = unknown> {
  /** Agent type category */
  type?: AgentType;
  /** Human-readable name */
  name?: string;
  /** Agent description */
  description?: string;
  /** Agent version */
  version?: string;
  /** Default configuration */
  defaultConfig?: Partial<AgentConfig>;
  /** Agent capabilities */
  capabilities?: AgentCapability[];
  /** Tags for filtering */
  tags?: string[];
}

/**
 * Query options for finding agents.
 */
export interface AgentQuery {
  /** Filter by type */
  type?: AgentType;
  /** Filter by tags (all must match) */
  tags?: string[];
  /** Filter by capability name */
  capability?: string;
  /** Filter by input type */
  inputType?: string;
  /** Filter by output type */
  outputType?: string;
}

/**
 * Registry event types.
 */
export type RegistryEventType = 'registered' | 'unregistered' | 'cleared';

/**
 * Registry event listener.
 */
export type RegistryEventListener = (
  event: RegistryEventType,
  registration: AgentRegistration | null
) => void;

/**
 * Singleton agent registry for runtime agent management.
 */
export class AgentRegistry {
  private static instance: AgentRegistry | null = null;

  private readonly registrations = new Map<string, AgentRegistration>();
  private readonly listeners = new Set<RegistryEventListener>();

  /**
   * Private constructor for singleton pattern.
   */
  private constructor() {}

  /**
   * Gets the singleton registry instance.
   */
  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  /**
   * Resets the singleton instance (for testing).
   */
  public static resetInstance(): void {
    if (AgentRegistry.instance) {
      AgentRegistry.instance.clear();
      AgentRegistry.instance = null;
    }
  }

  /**
   * Registers an agent with the registry.
   *
   * @param id - Unique agent ID
   * @param constructor - Agent constructor
   * @param options - Registration options
   * @returns The registration entry
   * @throws Error if agent with ID already exists
   *
   * @example
   * registry.register('my-agent', MyAgent, {
   *   type: 'extraction',
   *   description: 'Extracts claims from text',
   * });
   */
  public register<TInput = unknown, TOutput = unknown>(
    id: string,
    constructor: AgentConstructor<TInput, TOutput>,
    options: RegisterAgentOptions<TInput, TOutput> = {}
  ): AgentRegistration<TInput, TOutput> {
    if (this.registrations.has(id)) {
      throw new Error(`Agent with ID "${id}" is already registered`);
    }

    const registration: AgentRegistration<TInput, TOutput> = {
      id,
      type: options.type ?? 'custom',
      name: options.name ?? id,
      description: options.description ?? '',
      version: options.version ?? '1.0.0',
      constructor,
      defaultConfig: options.defaultConfig ?? {},
      capabilities: options.capabilities ?? [],
      tags: options.tags ?? [],
      registeredAt: Date.now(),
    };

    this.registrations.set(id, registration as AgentRegistration);
    this.emit('registered', registration as AgentRegistration);

    return registration;
  }

  /**
   * Unregisters an agent from the registry.
   *
   * @param id - Agent ID to unregister
   * @returns True if agent was unregistered, false if not found
   */
  public unregister(id: string): boolean {
    const registration = this.registrations.get(id);
    if (!registration) {
      return false;
    }

    this.registrations.delete(id);
    this.emit('unregistered', registration);
    return true;
  }

  /**
   * Gets an agent registration by ID.
   *
   * @param id - Agent ID
   * @returns Registration or undefined if not found
   */
  public get<TInput = unknown, TOutput = unknown>(
    id: string
  ): AgentRegistration<TInput, TOutput> | undefined {
    return this.registrations.get(id) as AgentRegistration<TInput, TOutput> | undefined;
  }

  /**
   * Gets an agent registration by ID, throwing if not found.
   *
   * @param id - Agent ID
   * @returns Registration
   * @throws Error if agent not found
   */
  public getOrThrow<TInput = unknown, TOutput = unknown>(
    id: string
  ): AgentRegistration<TInput, TOutput> {
    const registration = this.get<TInput, TOutput>(id);
    if (!registration) {
      throw new Error(`Agent with ID "${id}" not found in registry`);
    }
    return registration;
  }

  /**
   * Checks if an agent is registered.
   *
   * @param id - Agent ID
   * @returns True if registered
   */
  public has(id: string): boolean {
    return this.registrations.has(id);
  }

  /**
   * Lists all registered agents.
   *
   * @returns Array of all registrations
   */
  public list(): readonly AgentRegistration[] {
    return Array.from(this.registrations.values());
  }

  /**
   * Finds agents matching a query.
   *
   * @param query - Query criteria
   * @returns Matching registrations
   */
  public find(query: AgentQuery): readonly AgentRegistration[] {
    return this.list().filter((reg) => {
      // Filter by type
      if (query.type && reg.type !== query.type) {
        return false;
      }

      // Filter by tags (all must match)
      if (query.tags && query.tags.length > 0) {
        const hasAllTags = query.tags.every((tag) => reg.tags.includes(tag));
        if (!hasAllTags) {
          return false;
        }
      }

      // Filter by capability name
      if (query.capability) {
        const hasCapability = reg.capabilities.some(
          (cap) => cap.name === query.capability
        );
        if (!hasCapability) {
          return false;
        }
      }

      // Filter by input type
      if (query.inputType) {
        const acceptsInput = reg.capabilities.some((cap) =>
          cap.inputTypes.includes(query.inputType!)
        );
        if (!acceptsInput) {
          return false;
        }
      }

      // Filter by output type
      if (query.outputType) {
        const producesOutput = reg.capabilities.some((cap) =>
          cap.outputTypes.includes(query.outputType!)
        );
        if (!producesOutput) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Finds agents by type.
   *
   * @param type - Agent type
   * @returns Matching registrations
   */
  public findByType(type: AgentType): readonly AgentRegistration[] {
    return this.find({ type });
  }

  /**
   * Finds agents by tag.
   *
   * @param tags - Tags to match
   * @returns Matching registrations
   */
  public findByTags(...tags: string[]): readonly AgentRegistration[] {
    return this.find({ tags });
  }

  /**
   * Creates an instance of a registered agent.
   *
   * @param id - Registration ID
   * @param instanceId - Optional unique instance ID (defaults to registration ID)
   * @param options - Agent options
   * @returns New agent instance
   * @throws Error if agent not found
   */
  public create<TInput = unknown, TOutput = unknown>(
    id: string,
    instanceId?: string,
    options?: BaseAgentOptions
  ): BaseAgent<TInput, TOutput> {
    const registration = this.getOrThrow<TInput, TOutput>(id);

    const mergedOptions: BaseAgentOptions = {
      ...options,
      config: {
        ...registration.defaultConfig,
        ...options?.config,
      },
    };

    return new registration.constructor(
      instanceId ?? registration.id,
      registration.name,
      mergedOptions
    );
  }

  /**
   * Creates and initializes an agent instance.
   *
   * @param id - Registration ID
   * @param instanceId - Optional unique instance ID
   * @param options - Agent options
   * @returns Initialized agent instance
   */
  public async createAndInitialize<TInput = unknown, TOutput = unknown>(
    id: string,
    instanceId?: string,
    options?: BaseAgentOptions
  ): Promise<BaseAgent<TInput, TOutput>> {
    const agent = this.create<TInput, TOutput>(id, instanceId, options);
    await agent.initialize();
    return agent;
  }

  /**
   * Gets the number of registered agents.
   */
  public get size(): number {
    return this.registrations.size;
  }

  /**
   * Clears all registrations.
   */
  public clear(): void {
    this.registrations.clear();
    this.emit('cleared', null);
  }

  /**
   * Adds an event listener.
   */
  public addEventListener(listener: RegistryEventListener): void {
    this.listeners.add(listener);
  }

  /**
   * Removes an event listener.
   */
  public removeEventListener(listener: RegistryEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Converts registrations to metadata format.
   */
  public toMetadata(): readonly AgentMetadata[] {
    return this.list().map((reg) => ({
      config: {
        id: reg.id,
        type: reg.type,
        name: reg.name,
        description: reg.description,
        version: reg.version,
        enabled: true,
        retry: {
          maxAttempts: 3,
          initialDelayMs: 1000,
          maxDelayMs: 30000,
          backoffMultiplier: 2,
          jitter: true,
        },
        timeout: {
          initializationMs: 30000,
          executionMs: 60000,
          shutdownMs: 10000,
        },
        maxConcurrency: 0,
        options: {},
        tags: [...reg.tags],
        ...reg.defaultConfig,
      },
      capabilities: [...reg.capabilities],
      dependencies: [],
      registeredAt: reg.registeredAt,
      updatedAt: reg.registeredAt,
    }));
  }

  /**
   * Emits an event to all listeners.
   */
  private emit(event: RegistryEventType, registration: AgentRegistration | null): void {
    for (const listener of this.listeners) {
      try {
        listener(event, registration);
      } catch {
        // Ignore listener errors
      }
    }
  }
}

/**
 * Gets the global agent registry instance.
 */
export function getAgentRegistry(): AgentRegistry {
  return AgentRegistry.getInstance();
}

/**
 * Decorator for auto-registering agent classes.
 *
 * @param id - Unique agent ID
 * @param options - Registration options
 *
 * @example
 * @RegisterAgent('my-agent', { type: 'extraction' })
 * class MyAgent extends BaseAgent<string, Claim[]> {
 *   // ...
 * }
 */
export function RegisterAgent<TInput = unknown, TOutput = unknown>(
  id: string,
  options: RegisterAgentOptions<TInput, TOutput> = {}
): <T extends AgentConstructor<TInput, TOutput>>(target: T) => T {
  return function <T extends AgentConstructor<TInput, TOutput>>(target: T): T {
    getAgentRegistry().register(id, target, options);
    return target;
  };
}

/**
 * Agent manifest for bulk registration.
 */
export interface AgentManifest {
  readonly agents: readonly AgentManifestEntry[];
}

/**
 * Single entry in an agent manifest.
 */
export interface AgentManifestEntry {
  readonly id: string;
  readonly module: string;
  readonly exportName?: string;
  readonly options?: RegisterAgentOptions;
}

/**
 * Registers agents from a manifest.
 * Note: This is an async function that dynamically imports modules.
 *
 * @param manifest - Agent manifest
 * @param basePath - Base path for module resolution
 * @returns Number of agents registered
 */
export async function registerFromManifest(
  manifest: AgentManifest,
  basePath: string = ''
): Promise<number> {
  const registry = getAgentRegistry();
  let count = 0;

  for (const entry of manifest.agents) {
    try {
      const modulePath = basePath ? `${basePath}/${entry.module}` : entry.module;
      const module = await import(modulePath);
      const constructor = entry.exportName ? module[entry.exportName] : module.default;

      if (typeof constructor !== 'function') {
        console.warn(`Invalid agent constructor for "${entry.id}" from "${entry.module}"`);
        continue;
      }

      registry.register(entry.id, constructor, entry.options);
      count++;
    } catch (error) {
      console.error(`Failed to register agent "${entry.id}":`, error);
    }
  }

  return count;
}
