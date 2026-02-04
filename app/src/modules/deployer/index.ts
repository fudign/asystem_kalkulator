// Module 5: DEPLOYER
// Deploys generated sites to Vercel with watermark

export { deployerWorker, startDeployerWorker, stopDeployerWorker } from './worker';
export { deployToVercel } from './vercel';
export { WATERMARK_CONFIG, generateWatermarkCSS, generateWatermarkComponent } from './watermark';
