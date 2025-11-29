/**
 * Validation utilities for Inquiry Framework contracts.
 * Provides runtime validation with helpful error messages.
 */

import { z, ZodError, ZodSchema } from 'zod';

// Re-export all schemas
export * from './schemas.js';

// Re-export Zod for convenience
export { z, ZodError };
export type { ZodSchema };

/**
 * Validation result type.
 */
export interface ValidationResult<T> {
  /** Whether validation succeeded */
  readonly success: boolean;
  /** Validated data (if success) */
  readonly data: T | null;
  /** Validation errors (if failed) */
  readonly errors: readonly ValidationError[];
}

/**
 * Individual validation error.
 */
export interface ValidationError {
  /** Path to the invalid field */
  readonly path: string;
  /** Error message */
  readonly message: string;
  /** Error code */
  readonly code: string;
}

/**
 * Validates data against a Zod schema.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with data or errors
 *
 * @example
 * const result = validate(ClaimSchema, claimData);
 * if (result.success) {
 *   console.log('Valid claim:', result.data);
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: [],
    };
  }

  return {
    success: false,
    data: null,
    errors: formatZodErrors(result.error),
  };
}

/**
 * Validates data and throws if invalid.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws ValidationError if validation fails
 *
 * @example
 * try {
 *   const claim = validateOrThrow(ClaimSchema, claimData);
 * } catch (error) {
 *   console.error('Invalid data:', error);
 * }
 */
export function validateOrThrow<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  return schema.parse(data);
}

/**
 * Validates data and returns undefined if invalid.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or undefined
 *
 * @example
 * const claim = validateOrUndefined(ClaimSchema, claimData);
 * if (claim) {
 *   // Use valid claim
 * }
 */
export function validateOrUndefined<T>(
  schema: ZodSchema<T>,
  data: unknown
): T | undefined {
  const result = schema.safeParse(data);
  return result.success ? result.data : undefined;
}

/**
 * Validates partial data (all fields optional).
 *
 * @param schema - Zod schema to validate against
 * @param data - Partial data to validate
 * @returns Validation result
 */
export function validatePartial<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
): ValidationResult<Partial<z.infer<z.ZodObject<T>>>> {
  const partialSchema = schema.partial();
  const result = partialSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data as Partial<z.infer<z.ZodObject<T>>>,
      errors: [],
    };
  }

  return {
    success: false,
    data: null,
    errors: formatZodErrors(result.error),
  };
}

/**
 * Validates an array of items.
 *
 * @param schema - Zod schema for array items
 * @param data - Array to validate
 * @returns Validation result with array of valid items and errors
 */
export function validateArray<T>(
  schema: ZodSchema<T>,
  data: unknown[]
): {
  valid: T[];
  invalid: Array<{ index: number; errors: ValidationError[] }>;
} {
  const valid: T[] = [];
  const invalid: Array<{ index: number; errors: ValidationError[] }> = [];

  data.forEach((item, index) => {
    const result = validate(schema, item);
    if (result.success && result.data !== null) {
      valid.push(result.data);
    } else {
      invalid.push({ index, errors: [...result.errors] });
    }
  });

  return { valid, invalid };
}

/**
 * Creates a validator function for a schema.
 *
 * @param schema - Zod schema to create validator for
 * @returns Validator function
 *
 * @example
 * const validateClaim = createValidator(ClaimSchema);
 * const result = validateClaim(claimData);
 */
export function createValidator<T>(
  schema: ZodSchema<T>
): (data: unknown) => ValidationResult<T> {
  return (data: unknown) => validate(schema, data);
}

/**
 * Formats Zod errors into ValidationError array.
 */
function formatZodErrors(error: ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Formats validation errors as a human-readable string.
 */
export function formatValidationErrors(errors: readonly ValidationError[]): string {
  if (errors.length === 0) {
    return 'No errors';
  }

  return errors
    .map((err) => {
      const path = err.path || '(root)';
      return `  - ${path}: ${err.message}`;
    })
    .join('\n');
}

/**
 * Type guard to check if a value is a validation error.
 */
export function isValidationError(value: unknown): value is ValidationError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'path' in value &&
    'message' in value &&
    'code' in value
  );
}
