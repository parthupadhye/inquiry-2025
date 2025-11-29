/**
 * String transformation helpers for template rendering.
 * These are commonly used when generating code from templates.
 */

/**
 * Converts a string to PascalCase (UpperCamelCase).
 * Used for class names and type names.
 *
 * @example
 * classify('user-profile') // 'UserProfile'
 * classify('user_profile') // 'UserProfile'
 * classify('userProfile') // 'UserProfile'
 */
export function classify(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toUpperCase());
}

/**
 * Converts a string to kebab-case (dash-case).
 * Used for file names and URL slugs.
 *
 * @example
 * dasherize('UserProfile') // 'user-profile'
 * dasherize('user_profile') // 'user-profile'
 * dasherize('userProfile') // 'user-profile'
 */
export function dasherize(str: string): string {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to camelCase.
 * Used for variable names and function names.
 *
 * @example
 * camelize('user-profile') // 'userProfile'
 * camelize('user_profile') // 'userProfile'
 * camelize('UserProfile') // 'userProfile'
 */
export function camelize(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toLowerCase());
}

/**
 * Converts a string to snake_case.
 * Used for database columns and some programming conventions.
 *
 * @example
 * underscore('UserProfile') // 'user_profile'
 * underscore('user-profile') // 'user_profile'
 * underscore('userProfile') // 'user_profile'
 */
export function underscore(str: string): string {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

/**
 * Converts a string to CONSTANT_CASE (SCREAMING_SNAKE_CASE).
 * Used for constants and environment variables.
 *
 * @example
 * constantCase('userProfile') // 'USER_PROFILE'
 * constantCase('user-profile') // 'USER_PROFILE'
 */
export function constantCase(str: string): string {
  return underscore(str).toUpperCase();
}

/**
 * Capitalizes the first letter of a string.
 *
 * @example
 * capitalize('hello') // 'Hello'
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts the first letter of a string to lowercase.
 *
 * @example
 * decapitalize('Hello') // 'hello'
 */
export function decapitalize(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * All template helpers bundled together for easy use in templates.
 */
export const templateHelpers = {
  classify,
  dasherize,
  camelize,
  underscore,
  constantCase,
  capitalize,
  decapitalize,
};
