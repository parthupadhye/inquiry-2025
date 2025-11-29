/**
 * Agent Registry module for the Inquiry Framework.
 */

export type {
  AgentConstructor,
  AgentRegistration,
  RegisterAgentOptions,
  AgentQuery,
  RegistryEventType,
  RegistryEventListener,
  AgentManifest,
  AgentManifestEntry,
} from './agent-registry.js';

export {
  AgentRegistry,
  getAgentRegistry,
  RegisterAgent,
  registerFromManifest,
} from './agent-registry.js';
