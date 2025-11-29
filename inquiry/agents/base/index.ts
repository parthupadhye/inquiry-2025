/**
 * Base agent module for the Inquiry Framework.
 */

// Agent context types and utilities
export type {
  LogLevel,
  LogEntry,
  AgentLogger,
  AgentContext,
  AgentContextOptions,
} from './agent-context.js';

export {
  createConsoleLogger,
  createNoOpLogger,
  createBufferedLogger,
  createAgentContext,
  createChildContext,
} from './agent-context.js';

// Base agent class
export type {
  AgentLifecycleEvent,
  BaseAgentOptions,
} from './base-agent.js';

export { BaseAgent } from './base-agent.js';
