import puppeteer, { Browser } from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR || './output/screenshots';

let browser: Browser | null = null;

// Initialize browser
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browser;
}

// Take screenshots of the demo site
export async function takeScreenshots(
  htmlContent: string,
  sessionId: string
): Promise<string[]> {
  const screenshots: string[] = [];
  const outputDir = join(SCREENSHOTS_DIR, sessionId);

  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Screenshot configurations
    const configs = [
      {
        name: 'desktop-full',
        viewport: { width: 1920, height: 1080 },
        fullPage: true,
      },
      {
        name: 'desktop-hero',
        viewport: { width: 1920, height: 1080 },
        fullPage: false,
      },
      {
        name: 'tablet',
        viewport: { width: 768, height: 1024 },
        fullPage: true,
      },
      {
        name: 'mobile',
        viewport: { width: 375, height: 812 },
        fullPage: true,
      },
    ];

    for (const config of configs) {
      await page.setViewport(config.viewport);

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Take screenshot
      const filename = `${config.name}.png`;
      const filepath = join(outputDir, filename);

      await page.screenshot({
        path: filepath,
        fullPage: config.fullPage,
        type: 'png',
      });

      screenshots.push(filepath);
      console.log(`[Screenshots] Captured: ${filename}`);
    }

    return screenshots;

  } catch (error) {
    console.error('[Screenshots] Error:', error);
    throw error;
  } finally {
    await page.close();
  }
}

// Take a single screenshot
export async function takeScreenshot(
  htmlContent: string,
  outputPath: string,
  options: {
    width?: number;
    height?: number;
    fullPage?: boolean;
  } = {}
): Promise<string> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({
      width: options.width || 1920,
      height: options.height || 1080,
    });

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await page.screenshot({
      path: outputPath,
      fullPage: options.fullPage ?? true,
      type: 'png',
    });

    return outputPath;

  } finally {
    await page.close();
  }
}

// Close browser
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// Cleanup on process exit
process.on('exit', () => {
  if (browser) {
    browser.close();
  }
});
