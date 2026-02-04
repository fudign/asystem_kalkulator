// Main Worker Bootstrap
// Starts all ASYSTEM pipeline workers

// Load environment variables
import 'dotenv/config';

import { startIntakeWorker, stopIntakeWorker } from '@/modules/intake/worker';
import { startResearcherWorker, stopResearcherWorker } from '@/modules/researcher/worker';
import { startPlannerWorker, stopPlannerWorker } from '@/modules/planner/worker';
import { startGeneratorWorker, stopGeneratorWorker } from '@/modules/generator/worker';
import { startDeployerWorker, stopDeployerWorker } from '@/modules/deployer/worker';
import { startDocumentsWorker, stopDocumentsWorker } from '@/modules/documents/worker';

// Store worker instances
const workers = {
  intake: null as ReturnType<typeof startIntakeWorker> | null,
  researcher: null as ReturnType<typeof startResearcherWorker> | null,
  planner: null as ReturnType<typeof startPlannerWorker> | null,
  generator: null as ReturnType<typeof startGeneratorWorker> | null,
  deployer: null as ReturnType<typeof startDeployerWorker> | null,
  documents: null as ReturnType<typeof startDocumentsWorker> | null,
};

// Start all workers
export function startAllWorkers(): void {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     ASYSTEM.KG Pipeline Workers Starting   ║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    workers.intake = startIntakeWorker();
    console.log('✓ Module 1: INTAKE worker started');
  } catch (error) {
    console.error('✗ Module 1: INTAKE worker failed to start:', error);
  }

  try {
    workers.researcher = startResearcherWorker();
    console.log('✓ Module 2: RESEARCHER worker started');
  } catch (error) {
    console.error('✗ Module 2: RESEARCHER worker failed to start:', error);
  }

  try {
    workers.planner = startPlannerWorker();
    console.log('✓ Module 3: PLANNER worker started');
  } catch (error) {
    console.error('✗ Module 3: PLANNER worker failed to start:', error);
  }

  try {
    workers.generator = startGeneratorWorker();
    console.log('✓ Module 4: GENERATOR worker started');
  } catch (error) {
    console.error('✗ Module 4: GENERATOR worker failed to start:', error);
  }

  try {
    workers.deployer = startDeployerWorker();
    console.log('✓ Module 5: DEPLOYER worker started');
  } catch (error) {
    console.error('✗ Module 5: DEPLOYER worker failed to start:', error);
  }

  try {
    workers.documents = startDocumentsWorker();
    console.log('✓ Module 6: DOCUMENTS worker started');
  } catch (error) {
    console.error('✗ Module 6: DOCUMENTS worker failed to start:', error);
  }

  console.log('');
  console.log('Pipeline ready! Flow:');
  console.log('INTAKE → RESEARCHER → PLANNER → GENERATOR → DEPLOYER → DOCUMENTS');
  console.log('');
}

// Stop all workers
export function stopAllWorkers(): void {
  console.log('Stopping all workers...');

  stopIntakeWorker();
  stopResearcherWorker();
  stopPlannerWorker();
  stopGeneratorWorker();
  stopDeployerWorker();
  stopDocumentsWorker();

  console.log('All workers stopped.');
}

// Graceful shutdown
function setupGracefulShutdown(): void {
  const shutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    stopAllWorkers();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Main entry point when run directly
if (require.main === module) {
  console.log('Starting ASYSTEM.KG Pipeline Workers...');
  console.log('');

  // Check required environment variables
  const requiredEnvVars = ['ANTHROPIC_API_KEY'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:');
    missingVars.forEach(v => console.error(`  - ${v}`));
    console.error('');
    console.error('Please set these variables before starting workers.');
    process.exit(1);
  }

  setupGracefulShutdown();
  startAllWorkers();
}

export { workers };
