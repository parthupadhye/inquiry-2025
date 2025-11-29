import { input, select, confirm } from '@inquirer/prompts';

/**
 * Configuration for a prompt field.
 */
export interface PromptField {
  /** The key name for this field */
  name: string;
  /** The prompt message to display */
  message: string;
  /** The type of prompt */
  type: 'input' | 'select' | 'confirm';
  /** Default value if not provided */
  default?: string | boolean;
  /** Choices for select prompts */
  choices?: Array<{ name: string; value: string }>;
  /** Whether this field is required */
  required?: boolean;
  /** Validation function */
  validate?: (value: string) => boolean | string;
}

/**
 * Options for the promptForMissing function.
 */
export interface PromptForMissingOptions {
  /** Fields to potentially prompt for */
  fields: PromptField[];
  /** Already provided values (will skip prompting for these) */
  provided?: Record<string, unknown>;
  /** Skip all prompts and use defaults (for --yes or CI mode) */
  skipPrompts?: boolean;
}

/**
 * Result type that includes all field values.
 */
export type PromptResult<T extends string = string> = Record<T, string | boolean>;

/**
 * Prompts for any missing required values.
 * If a value is already provided, it won't prompt for it.
 * In non-interactive mode (skipPrompts), uses defaults.
 *
 * @param options - Configuration for which fields to prompt
 * @returns Object with all field values
 *
 * @example
 * const result = await promptForMissing({
 *   fields: [
 *     { name: 'name', message: 'Agent name:', type: 'input', required: true },
 *     { name: 'type', message: 'Agent type:', type: 'select', choices: [...] }
 *   ],
 *   provided: { name: options.name } // from CLI args
 * });
 */
export async function promptForMissing(
  options: PromptForMissingOptions
): Promise<PromptResult> {
  const { fields, provided = {}, skipPrompts = false } = options;
  const result: PromptResult = { ...provided } as PromptResult;

  for (const field of fields) {
    // Skip if already provided
    if (result[field.name] !== undefined && result[field.name] !== '') {
      continue;
    }

    // In skip mode, use defaults
    if (skipPrompts) {
      if (field.default !== undefined) {
        result[field.name] = field.default;
      } else if (field.required) {
        throw new Error(`Missing required field: ${field.name}`);
      }
      continue;
    }

    // Prompt based on type
    switch (field.type) {
      case 'input':
        result[field.name] = await promptInput(field);
        break;
      case 'select':
        result[field.name] = await promptSelect(field);
        break;
      case 'confirm':
        result[field.name] = await promptConfirm(field);
        break;
    }
  }

  return result;
}

/**
 * Prompts for a text input.
 */
async function promptInput(field: PromptField): Promise<string> {
  return input({
    message: field.message,
    default: field.default as string | undefined,
    required: field.required,
    validate: field.validate,
  });
}

/**
 * Prompts for a selection from a list.
 */
async function promptSelect(field: PromptField): Promise<string> {
  if (!field.choices || field.choices.length === 0) {
    throw new Error(`Select field "${field.name}" requires choices`);
  }

  return select({
    message: field.message,
    choices: field.choices,
    default: field.default as string | undefined,
  });
}

/**
 * Prompts for a yes/no confirmation.
 */
async function promptConfirm(field: PromptField): Promise<boolean> {
  return confirm({
    message: field.message,
    default: field.default as boolean | undefined,
  });
}

/**
 * Common prompt patterns for reuse.
 */
export const commonPrompts = {
  /**
   * Prompt for a component name.
   */
  name: (componentType: string): PromptField => ({
    name: 'name',
    message: `${componentType} name:`,
    type: 'input',
    required: true,
    validate: (value: string) => {
      if (!value.trim()) {
        return 'Name is required';
      }
      if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(value)) {
        return 'Name must start with a letter and contain only letters, numbers, dashes, and underscores';
      }
      return true;
    },
  }),

  /**
   * Prompt for agent type selection.
   */
  agentType: (): PromptField => ({
    name: 'type',
    message: 'Agent type:',
    type: 'select',
    choices: [
      { name: 'Extraction - Extract data from sources', value: 'extraction' },
      { name: 'Validation - Validate and verify data', value: 'validation' },
      { name: 'Transformation - Transform data formats', value: 'transformation' },
      { name: 'Analysis - Analyze and process data', value: 'analysis' },
      { name: 'Custom - Start from scratch', value: 'custom' },
    ],
    default: 'custom',
  }),

  /**
   * Prompt for confirmation to proceed.
   */
  proceed: (action: string): PromptField => ({
    name: 'proceed',
    message: `Proceed with ${action}?`,
    type: 'confirm',
    default: true,
  }),

  /**
   * Prompt for overwrite confirmation.
   */
  overwrite: (filename: string): PromptField => ({
    name: 'overwrite',
    message: `File "${filename}" already exists. Overwrite?`,
    type: 'confirm',
    default: false,
  }),
};

// Re-export inquirer prompts for direct use
export { input, select, confirm } from '@inquirer/prompts';
