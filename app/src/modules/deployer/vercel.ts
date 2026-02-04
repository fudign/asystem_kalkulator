// Vercel deployment functionality

import { exec } from 'child_process';
import { promisify } from 'util';
import type { DeploymentResult } from '@/shared/types';

const execAsync = promisify(exec);

interface DeployOptions {
  projectPath: string;
  projectName: string;
}

// Deploy to Vercel using CLI
export async function deployToVercel(options: DeployOptions): Promise<DeploymentResult> {
  const { projectPath, projectName } = options;

  try {
    // Install dependencies first
    console.log(`[DEPLOYER] Installing dependencies for ${projectName}...`);
    await execAsync('npm install', { cwd: projectPath, timeout: 120000 });

    // Build the project
    console.log(`[DEPLOYER] Building ${projectName}...`);
    await execAsync('npm run build', { cwd: projectPath, timeout: 180000 });

    // Deploy to Vercel
    console.log(`[DEPLOYER] Deploying ${projectName} to Vercel...`);

    const vercelToken = process.env.VERCEL_TOKEN;

    // Build deploy command - works with or without token (if logged in via CLI)
    let deployCmd = 'vercel --yes --prod';
    if (vercelToken) {
      deployCmd = `vercel --token=${vercelToken} --yes --prod`;
    }

    const { stdout } = await execAsync(deployCmd, {
      cwd: projectPath,
      timeout: 300000, // 5 min timeout for deployment
    });

    // Extract deployment URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+\.vercel\.app/);
    const deploymentUrl = urlMatch ? urlMatch[0] : '';

    // Get preview URL (without prod flag)
    let previewCmd = 'vercel --yes';
    if (vercelToken) {
      previewCmd = `vercel --token=${vercelToken} --yes`;
    }

    const { stdout: previewOut } = await execAsync(previewCmd, {
      cwd: projectPath,
      timeout: 300000,
    });

    const previewMatch = previewOut.match(/https:\/\/[^\s]+\.vercel\.app/);
    const previewUrl = previewMatch ? previewMatch[0] : deploymentUrl;

    console.log(`[DEPLOYER] Deployed to: ${deploymentUrl}`);

    return {
      url: deploymentUrl,
      previewUrl,
      deploymentId: extractDeploymentId(deploymentUrl),
      status: 'success',
    };

  } catch (error) {
    console.error('[DEPLOYER] Deployment error:', error);

    return {
      url: '',
      previewUrl: '',
      deploymentId: '',
      status: 'failed',
    };
  }
}

// Alternative: Deploy using Vercel API
export async function deployToVercelApi(options: DeployOptions): Promise<DeploymentResult> {
  const { projectPath, projectName } = options;

  const vercelToken = process.env.VERCEL_TOKEN;

  if (!vercelToken) {
    throw new Error('VERCEL_TOKEN not configured');
  }

  try {
    // Create deployment using Vercel API
    // This is a simplified version - full implementation would need file upload

    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        target: 'preview',
        // Files would need to be uploaded separately
      }),
    });

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      url: `https://${data.url}`,
      previewUrl: `https://${data.url}`,
      deploymentId: data.id,
      status: 'success',
    };

  } catch (error) {
    console.error('[DEPLOYER] API deployment error:', error);

    return {
      url: '',
      previewUrl: '',
      deploymentId: '',
      status: 'failed',
    };
  }
}

// Extract deployment ID from URL
function extractDeploymentId(url: string): string {
  // URL format: https://project-xxxxx.vercel.app
  const match = url.match(/https:\/\/([^.]+)\.vercel\.app/);
  return match ? match[1] : '';
}

// Check if Vercel CLI is installed
export async function checkVercelCli(): Promise<boolean> {
  try {
    await execAsync('npx vercel --version');
    return true;
  } catch {
    return false;
  }
}
