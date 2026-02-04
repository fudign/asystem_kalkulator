// Module 4: GENERATOR
// Generates actual site code using Claude API

export { generatorWorker, startGeneratorWorker, stopGeneratorWorker } from './worker';
export { generateSiteCode } from './claude-agent';
export * from './template';
