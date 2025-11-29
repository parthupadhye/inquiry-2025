import { Command } from 'commander';
import { createRequire } from 'module';
import { initCommand } from './commands/init.js';
import { generateCommand } from './commands/generate.js';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

const program = new Command();

program
  .name('inquiry')
  .description('Inquiry Framework CLI - Generate agents, workflows, and more')
  .version(packageJson.version)
  .option('--dry-run', 'Preview changes without writing files')
  .option('--verbose', 'Show detailed output');

program
  .command('init')
  .description('Initialize Inquiry workspace')
  .action(async () => {
    const options = program.opts();
    await initCommand(options);
  });

program
  .command('generate')
  .alias('g')
  .description('Generate components (agent, workflow, node, contract)')
  .argument('<schematic>', 'Type of component to generate (agent, workflow, node, contract)')
  .argument('[name]', 'Name of the component')
  .option('-t, --type <type>', 'Component subtype (e.g., extraction, validation)')
  .option('-d, --description <desc>', 'Description of the component')
  .option('--directory <dir>', 'Base directory for generated files')
  .option('-f, --force', 'Overwrite existing files')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('--skip-test', 'Skip test file generation')
  .option('--skip-prompt', 'Skip prompt file generation')
  .option('--skip-schema', 'Skip schema file generation')
  .option('--skip-registry', 'Skip registry update')
  .action(async (schematic, name, cmdOptions) => {
    const globalOptions = program.opts();
    await generateCommand(schematic, name, { ...globalOptions, ...cmdOptions });
  });

program.parse();
