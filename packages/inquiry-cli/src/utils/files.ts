import fs from 'fs-extra';
import path from 'path';

/**
 * Options for file operations.
 */
export interface FileOptions {
  /** If true, don't actually write files (preview mode) */
  dryRun?: boolean;
  /** If true, overwrite existing files */
  overwrite?: boolean;
}

/**
 * Result of a file operation.
 */
export interface FileResult {
  /** Whether the operation was successful */
  success: boolean;
  /** The file path that was operated on */
  filePath: string;
  /** The action taken */
  action: 'created' | 'updated' | 'skipped' | 'error';
  /** Error message if operation failed */
  error?: string;
  /** Whether this was a dry run */
  dryRun: boolean;
}

/**
 * Checks if a file exists.
 *
 * @param filePath - Path to the file
 * @returns True if the file exists
 *
 * @example
 * if (await fileExists('./inquiry.config.ts')) {
 *   console.log('Config file found');
 * }
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a directory exists.
 *
 * @param dirPath - Path to the directory
 * @returns True if the directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Creates a file with the given content.
 * Automatically creates parent directories if they don't exist.
 *
 * @param filePath - Path to the file to create
 * @param content - Content to write to the file
 * @param options - File operation options
 * @returns Result of the operation
 *
 * @example
 * const result = await createFile(
 *   './inquiry/agents/my-agent.ts',
 *   'export class MyAgent {}',
 *   { dryRun: false }
 * );
 */
export async function createFile(
  filePath: string,
  content: string,
  options: FileOptions = {}
): Promise<FileResult> {
  const { dryRun = false, overwrite = false } = options;
  const absolutePath = path.resolve(filePath);

  try {
    // Check if file already exists
    const exists = await fileExists(absolutePath);

    if (exists && !overwrite) {
      return {
        success: false,
        filePath: absolutePath,
        action: 'skipped',
        error: 'File already exists',
        dryRun,
      };
    }

    if (dryRun) {
      return {
        success: true,
        filePath: absolutePath,
        action: exists ? 'updated' : 'created',
        dryRun: true,
      };
    }

    // Ensure directory exists
    await fs.ensureDir(path.dirname(absolutePath));

    // Write the file
    await fs.writeFile(absolutePath, content, 'utf-8');

    return {
      success: true,
      filePath: absolutePath,
      action: exists ? 'updated' : 'created',
      dryRun: false,
    };
  } catch (error) {
    return {
      success: false,
      filePath: absolutePath,
      action: 'error',
      error: error instanceof Error ? error.message : String(error),
      dryRun,
    };
  }
}

/**
 * Updates an existing file with new content.
 * Fails if the file doesn't exist.
 *
 * @param filePath - Path to the file to update
 * @param content - New content for the file
 * @param options - File operation options
 * @returns Result of the operation
 */
export async function updateFile(
  filePath: string,
  content: string,
  options: FileOptions = {}
): Promise<FileResult> {
  const { dryRun = false } = options;
  const absolutePath = path.resolve(filePath);

  try {
    const exists = await fileExists(absolutePath);

    if (!exists) {
      return {
        success: false,
        filePath: absolutePath,
        action: 'error',
        error: 'File does not exist',
        dryRun,
      };
    }

    if (dryRun) {
      return {
        success: true,
        filePath: absolutePath,
        action: 'updated',
        dryRun: true,
      };
    }

    await fs.writeFile(absolutePath, content, 'utf-8');

    return {
      success: true,
      filePath: absolutePath,
      action: 'updated',
      dryRun: false,
    };
  } catch (error) {
    return {
      success: false,
      filePath: absolutePath,
      action: 'error',
      error: error instanceof Error ? error.message : String(error),
      dryRun,
    };
  }
}

/**
 * Reads the content of a file.
 *
 * @param filePath - Path to the file to read
 * @returns The file content, or null if the file doesn't exist
 */
export async function readFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Creates a directory if it doesn't exist.
 *
 * @param dirPath - Path to the directory
 * @param options - File operation options
 * @returns Result of the operation
 */
export async function ensureDirectory(
  dirPath: string,
  options: FileOptions = {}
): Promise<FileResult> {
  const { dryRun = false } = options;
  const absolutePath = path.resolve(dirPath);

  try {
    const exists = await directoryExists(absolutePath);

    if (dryRun) {
      return {
        success: true,
        filePath: absolutePath,
        action: exists ? 'skipped' : 'created',
        dryRun: true,
      };
    }

    await fs.ensureDir(absolutePath);

    return {
      success: true,
      filePath: absolutePath,
      action: exists ? 'skipped' : 'created',
      dryRun: false,
    };
  } catch (error) {
    return {
      success: false,
      filePath: absolutePath,
      action: 'error',
      error: error instanceof Error ? error.message : String(error),
      dryRun,
    };
  }
}

/**
 * Deletes a file if it exists.
 *
 * @param filePath - Path to the file
 * @param options - File operation options
 * @returns Result of the operation
 */
export async function deleteFile(
  filePath: string,
  options: FileOptions = {}
): Promise<FileResult> {
  const { dryRun = false } = options;
  const absolutePath = path.resolve(filePath);

  try {
    const exists = await fileExists(absolutePath);

    if (!exists) {
      return {
        success: true,
        filePath: absolutePath,
        action: 'skipped',
        dryRun,
      };
    }

    if (dryRun) {
      return {
        success: true,
        filePath: absolutePath,
        action: 'updated',
        dryRun: true,
      };
    }

    await fs.remove(absolutePath);

    return {
      success: true,
      filePath: absolutePath,
      action: 'updated',
      dryRun: false,
    };
  } catch (error) {
    return {
      success: false,
      filePath: absolutePath,
      action: 'error',
      error: error instanceof Error ? error.message : String(error),
      dryRun,
    };
  }
}

/**
 * Copies a file from source to destination.
 *
 * @param srcPath - Source file path
 * @param destPath - Destination file path
 * @param options - File operation options
 * @returns Result of the operation
 */
export async function copyFile(
  srcPath: string,
  destPath: string,
  options: FileOptions = {}
): Promise<FileResult> {
  const { dryRun = false, overwrite = false } = options;
  const absoluteDest = path.resolve(destPath);

  try {
    const srcExists = await fileExists(srcPath);
    if (!srcExists) {
      return {
        success: false,
        filePath: absoluteDest,
        action: 'error',
        error: 'Source file does not exist',
        dryRun,
      };
    }

    const destExists = await fileExists(absoluteDest);
    if (destExists && !overwrite) {
      return {
        success: false,
        filePath: absoluteDest,
        action: 'skipped',
        error: 'Destination file already exists',
        dryRun,
      };
    }

    if (dryRun) {
      return {
        success: true,
        filePath: absoluteDest,
        action: destExists ? 'updated' : 'created',
        dryRun: true,
      };
    }

    await fs.ensureDir(path.dirname(absoluteDest));
    await fs.copy(srcPath, absoluteDest, { overwrite });

    return {
      success: true,
      filePath: absoluteDest,
      action: destExists ? 'updated' : 'created',
      dryRun: false,
    };
  } catch (error) {
    return {
      success: false,
      filePath: absoluteDest,
      action: 'error',
      error: error instanceof Error ? error.message : String(error),
      dryRun,
    };
  }
}

/**
 * Gets the relative path from the current working directory.
 *
 * @param filePath - Absolute or relative file path
 * @returns Relative path from cwd
 */
export function getRelativePath(filePath: string): string {
  return path.relative(process.cwd(), path.resolve(filePath));
}
