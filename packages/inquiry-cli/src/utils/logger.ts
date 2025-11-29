import chalk from 'chalk';
import ora, { type Ora } from 'ora';

/**
 * Logger configuration options.
 */
export interface LoggerOptions {
  /** Enable verbose output */
  verbose?: boolean;
  /** Disable all output (silent mode) */
  silent?: boolean;
}

/** Global logger options */
let globalOptions: LoggerOptions = {
  verbose: false,
  silent: false,
};

/**
 * Configures global logger options.
 *
 * @param options - Logger options to set
 *
 * @example
 * configureLogger({ verbose: true });
 */
export function configureLogger(options: LoggerOptions): void {
  globalOptions = { ...globalOptions, ...options };
}

/**
 * Gets the current logger configuration.
 */
export function getLoggerConfig(): LoggerOptions {
  return { ...globalOptions };
}

/**
 * Resets logger configuration to defaults.
 */
export function resetLoggerConfig(): void {
  globalOptions = { verbose: false, silent: false };
}

/**
 * Logger utility for consistent console output.
 */
export const logger = {
  /**
   * Logs an info message in cyan.
   */
  info(message: string, ...args: unknown[]): void {
    if (globalOptions.silent) return;
    console.log(chalk.cyan(message), ...args);
  },

  /**
   * Logs a success message in green with a checkmark.
   */
  success(message: string, ...args: unknown[]): void {
    if (globalOptions.silent) return;
    console.log(chalk.green(`✔ ${message}`), ...args);
  },

  /**
   * Logs a warning message in yellow with a warning symbol.
   */
  warn(message: string, ...args: unknown[]): void {
    if (globalOptions.silent) return;
    console.log(chalk.yellow(`⚠ ${message}`), ...args);
  },

  /**
   * Logs an error message in red with an X symbol.
   */
  error(message: string, ...args: unknown[]): void {
    if (globalOptions.silent) return;
    console.error(chalk.red(`✖ ${message}`), ...args);
  },

  /**
   * Logs a debug message (only shown in verbose mode).
   */
  debug(message: string, ...args: unknown[]): void {
    if (globalOptions.silent || !globalOptions.verbose) return;
    console.log(chalk.gray(`[debug] ${message}`), ...args);
  },

  /**
   * Logs a verbose message (only shown in verbose mode).
   */
  verbose(message: string, ...args: unknown[]): void {
    if (globalOptions.silent || !globalOptions.verbose) return;
    console.log(chalk.dim(message), ...args);
  },

  /**
   * Logs a plain message without formatting.
   */
  log(message: string, ...args: unknown[]): void {
    if (globalOptions.silent) return;
    console.log(message, ...args);
  },

  /**
   * Logs an empty line.
   */
  newline(): void {
    if (globalOptions.silent) return;
    console.log();
  },

  /**
   * Logs a list item with a bullet point.
   */
  listItem(message: string, indent = 0): void {
    if (globalOptions.silent) return;
    const padding = '  '.repeat(indent);
    console.log(chalk.gray(`${padding}• ${message}`));
  },

  /**
   * Logs a header/title in bold.
   */
  title(message: string): void {
    if (globalOptions.silent) return;
    console.log(chalk.bold(message));
  },

  /**
   * Logs a dimmed/subtle message.
   */
  dim(message: string, ...args: unknown[]): void {
    if (globalOptions.silent) return;
    console.log(chalk.dim(message), ...args);
  },

  /**
   * Logs a file path in a highlighted format.
   */
  file(action: string, filePath: string): void {
    if (globalOptions.silent) return;
    console.log(`  ${chalk.gray(action)} ${chalk.cyan(filePath)}`);
  },
};

/**
 * Creates a spinner for async operations.
 *
 * @param text - Initial spinner text
 * @returns Spinner instance with helper methods
 *
 * @example
 * const spin = spinner('Loading...');
 * try {
 *   await someAsyncOperation();
 *   spin.succeed('Loaded successfully');
 * } catch (error) {
 *   spin.fail('Failed to load');
 * }
 */
export function spinner(text: string): Ora {
  if (globalOptions.silent) {
    // Return a no-op spinner in silent mode
    return {
      start: () => spinner(text),
      stop: () => spinner(text),
      succeed: () => spinner(text),
      fail: () => spinner(text),
      warn: () => spinner(text),
      info: () => spinner(text),
      text: '',
      isSpinning: false,
    } as unknown as Ora;
  }

  return ora({
    text,
    color: 'cyan',
  }).start();
}

/**
 * Wraps an async operation with a spinner.
 *
 * @param text - Spinner text
 * @param operation - Async operation to run
 * @param successText - Optional success message
 * @returns Result of the operation
 *
 * @example
 * const result = await withSpinner(
 *   'Processing files...',
 *   async () => processFiles(),
 *   'Files processed'
 * );
 */
export async function withSpinner<T>(
  text: string,
  operation: () => Promise<T>,
  successText?: string
): Promise<T> {
  const spin = spinner(text);

  try {
    const result = await operation();
    spin.succeed(successText || text);
    return result;
  } catch (error) {
    spin.fail(text);
    throw error;
  }
}

/**
 * Formats a duration in milliseconds to a human-readable string.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

/**
 * Logs a summary box for completed operations.
 */
export function logSummary(
  title: string,
  items: Array<{ label: string; value: string | number }>
): void {
  if (globalOptions.silent) return;

  logger.newline();
  logger.title(title);
  logger.newline();

  for (const item of items) {
    console.log(`  ${chalk.gray(item.label + ':')} ${chalk.white(item.value)}`);
  }

  logger.newline();
}

// Re-export chalk for direct use
export { chalk };
