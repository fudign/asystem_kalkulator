import { writeFile, mkdir, readFile } from 'fs/promises';
import { join, basename } from 'path';
import type { BmadArtifacts } from './types.js';

const OUTPUT_DIR = process.env.OUTPUT_DIR || './output';
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3001/files';

// Save all BMAD artifacts
export async function saveArtifacts(
  sessionId: string,
  artifacts: BmadArtifacts
): Promise<void> {
  const artifactsDir = join(OUTPUT_DIR, 'artifacts', sessionId);
  await mkdir(artifactsDir, { recursive: true });

  // Save each artifact
  const files = [
    { name: 'brief.md', content: artifacts.brief },
    { name: 'prd.md', content: artifacts.prd },
    { name: 'architecture.md', content: artifacts.architecture },
    { name: 'demo.html', content: artifacts.demoCode },
  ];

  for (const file of files) {
    const filePath = join(artifactsDir, file.name);
    await writeFile(filePath, file.content, 'utf-8');
    console.log(`[Storage] Saved: ${file.name}`);
  }

  // Save metadata
  const metadata = {
    sessionId,
    createdAt: new Date().toISOString(),
    files: files.map(f => f.name),
  };

  await writeFile(
    join(artifactsDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf-8'
  );
}

// Load artifacts
export async function loadArtifacts(
  sessionId: string
): Promise<BmadArtifacts | null> {
  const artifactsDir = join(OUTPUT_DIR, 'artifacts', sessionId);

  try {
    const brief = await readFile(join(artifactsDir, 'brief.md'), 'utf-8');
    const prd = await readFile(join(artifactsDir, 'prd.md'), 'utf-8');
    const architecture = await readFile(join(artifactsDir, 'architecture.md'), 'utf-8');
    const demoCode = await readFile(join(artifactsDir, 'demo.html'), 'utf-8');

    return { brief, prd, architecture, demoCode };
  } catch (error) {
    console.error(`[Storage] Error loading artifacts for ${sessionId}:`, error);
    return null;
  }
}

// Get public URL for a file
export function getArtifactUrl(filePath: string): string {
  const filename = basename(filePath);
  const parts = filePath.split('/');

  // Extract type from path (screenshots, pdf, artifacts)
  const typeIndex = parts.findIndex(p => p === 'screenshots' || p === 'pdf' || p === 'artifacts');
  if (typeIndex >= 0) {
    const type = parts[typeIndex];
    // For PDF files directly in pdf/ folder
    if (type === 'pdf' && parts[typeIndex + 1] === filename) {
      return `${PUBLIC_URL}/${type}/${filename}`;
    }
    // For screenshots/artifacts in sessionId subfolder
    if (parts[typeIndex + 1] && parts[typeIndex + 1] !== filename) {
      const sessionId = parts[typeIndex + 1];
      return `${PUBLIC_URL}/${type}/${sessionId}/${filename}`;
    }
  }

  return `${PUBLIC_URL}/${filename}`;
}

// Save a single file
export async function saveFile(
  sessionId: string,
  filename: string,
  content: string | Buffer
): Promise<string> {
  const fileDir = join(OUTPUT_DIR, 'files', sessionId);
  await mkdir(fileDir, { recursive: true });

  const filePath = join(fileDir, filename);
  await writeFile(filePath, content);

  return filePath;
}

// Get file content
export async function getFile(
  sessionId: string,
  filename: string
): Promise<Buffer | null> {
  const filePath = join(OUTPUT_DIR, 'files', sessionId, filename);

  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
}

// Clean up old artifacts (call periodically)
export async function cleanupOldArtifacts(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  // TODO: Implement cleanup of artifacts older than maxAgeMs
  console.log('[Storage] Cleanup not implemented yet');
}
