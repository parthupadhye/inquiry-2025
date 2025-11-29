import ejs from 'ejs';
import { readFile } from 'fs/promises';
import { templateHelpers } from './helpers.js';

/**
 * Options for template rendering.
 */
export interface RenderOptions {
  /** Additional data to pass to the template */
  data?: Record<string, unknown>;
  /** Custom EJS options */
  ejsOptions?: ejs.Options;
}

/**
 * Renders an EJS template string with the provided variables.
 * Automatically includes all template helpers (classify, dasherize, camelize, etc.).
 *
 * @param template - The EJS template string to render
 * @param variables - Variables to make available in the template
 * @param options - Additional rendering options
 * @returns The rendered string
 *
 * @example
 * const result = renderTemplateString(
 *   'class <%= classify(name) %> {}',
 *   { name: 'user-service' }
 * );
 * // result: 'class UserService {}'
 */
export function renderTemplateString(
  template: string,
  variables: Record<string, unknown> = {},
  options: RenderOptions = {}
): string {
  const data = {
    ...templateHelpers,
    ...variables,
    ...options.data,
  };

  const ejsOptions: ejs.Options = {
    async: false,
    ...options.ejsOptions,
  };

  return ejs.render(template, data, ejsOptions) as string;
}

/**
 * Renders an EJS template file with the provided variables.
 * Automatically includes all template helpers (classify, dasherize, camelize, etc.).
 *
 * @param templatePath - Path to the .ejs template file
 * @param variables - Variables to make available in the template
 * @param options - Additional rendering options
 * @returns The rendered string
 *
 * @example
 * const result = await renderTemplate(
 *   './templates/agent.ts.ejs',
 *   { name: 'extraction-agent', type: 'extraction' }
 * );
 */
export async function renderTemplate(
  templatePath: string,
  variables: Record<string, unknown> = {},
  options: RenderOptions = {}
): Promise<string> {
  const templateContent = await readFile(templatePath, 'utf-8');

  const data = {
    ...templateHelpers,
    ...variables,
    ...options.data,
  };

  const ejsOptions: ejs.Options = {
    filename: templatePath, // Enables includes relative to the template
    async: false,
    ...options.ejsOptions,
  };

  return ejs.render(templateContent, data, ejsOptions) as string;
}

/**
 * Compiles an EJS template string into a reusable function.
 * Useful for rendering the same template multiple times with different variables.
 *
 * @param template - The EJS template string to compile
 * @param options - Additional EJS options
 * @returns A function that accepts variables and returns the rendered string
 *
 * @example
 * const renderAgent = compileTemplate('class <%= classify(name) %>Agent {}');
 * renderAgent({ name: 'extraction' }); // 'class ExtractionAgent {}'
 * renderAgent({ name: 'validation' }); // 'class ValidationAgent {}'
 */
export function compileTemplate(
  template: string,
  options: ejs.Options = {}
): (variables?: Record<string, unknown>) => string {
  const ejsOptions: ejs.Options = {
    async: false,
    ...options,
  };

  const compiledFn = ejs.compile(template, ejsOptions);

  return (variables: Record<string, unknown> = {}) => {
    const data = {
      ...templateHelpers,
      ...variables,
    };
    return compiledFn(data) as string;
  };
}

// Re-export helpers for convenience
export { templateHelpers } from './helpers.js';
export {
  classify,
  dasherize,
  camelize,
  underscore,
  constantCase,
  capitalize,
  decapitalize,
} from './helpers.js';
