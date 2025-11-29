import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/utils/templates.ts',
    'src/utils/helpers.ts',
    'src/utils/prompts.ts',
    'src/utils/files.ts',
    'src/utils/logger.ts',
    'src/config/loader.ts',
    'src/config/schema.ts',
    'src/config/defaults.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
});
