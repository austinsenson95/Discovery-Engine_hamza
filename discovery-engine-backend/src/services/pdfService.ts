/**
 * ============================================================================
 * DISCOVERY ENGINE - PDF Service
 * ============================================================================
 * Generates professional PDF blueprint documents using Puppeteer.
 * Renders compiled HTML templates to PDF with brand styling.
 * Caches generated PDFs in memory for 1 hour to avoid re-rendering.
 * ============================================================================
 */

import type { Browser, LaunchOptions } from 'puppeteer-core';
import type { Blueprint } from '../types';
import { compileBlueprintTemplate, validateBlueprintForPDF } from './templateEngine';

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------
interface CachedPDF {
  buffer: Buffer;
  timestamp: number;
}

const pdfCache = new Map<string, CachedPDF>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ---------------------------------------------------------------------------
// Chromium Resolution
// ---------------------------------------------------------------------------
async function resolveExecutablePath(): Promise<string> {
  // 1. Environment variable override
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envPath) {
    console.log(`[PDF] Using Chromium from PUPPETEER_EXECUTABLE_PATH: ${envPath}`);
    return envPath;
  }

  // 2. Vercel / serverless: use @sparticuz/chromium
  if (process.env.VERCEL) {
    try {
      const chromium = require('@sparticuz/chromium');
      const path = await chromium.executablePath();
      console.log(`[PDF] Using @sparticuz/chromium at: ${path}`);
      return path;
    } catch (err) {
      console.warn('[PDF] @sparticuz/chromium not available:', err);
    }
  }

  // 3. Platform-specific common paths
  const platformPaths: Record<string, string[]> = {
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ],
    linux: [
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/usr/bin/microsoft-edge',
      '/snap/bin/chromium',
    ],
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ],
  };

  const paths = platformPaths[process.platform] || [];
  for (const p of paths) {
    try {
      const fs = require('fs');
      if (fs.existsSync(p)) {
        console.log(`[PDF] Found Chromium at: ${p}`);
        return p;
      }
    } catch {
      // ignore
    }
  }

  // 4. Fallback: try puppeteer's default (may throw at launch if not found)
  console.warn('[PDF] No Chromium found in common paths. Will attempt puppeteer default.');
  return '';
}

// ---------------------------------------------------------------------------
// Browser Instance Management
// ---------------------------------------------------------------------------
let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserInstance) {
    try {
      // Verify browser is still connected
      if (browserInstance.connected) {
        return browserInstance;
      }
    } catch {
      // Browser disconnected, create new
    }
  }

  const executablePath = await resolveExecutablePath();

  // Build args: start with our defaults, then merge serverless args on Vercel
  const args = new Set([
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--font-render-hinting=none',
  ]);

  if (process.env.VERCEL) {
    try {
      const chromium = require('@sparticuz/chromium');
      chromium.args.forEach((a: string) => args.add(a));
    } catch {
      // ignore
    }
  }

  const launchOptions: LaunchOptions = {
    headless: true,
    args: Array.from(args),
  };

  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }

  console.log('[PDF] Launching Puppeteer browser...');
  // True dynamic ESM import that bypasses TypeScript CommonJS compilation
  const puppeteer = await new Function('return import("puppeteer-core")')();
  browserInstance = await puppeteer.default.launch(launchOptions);
  console.log('[PDF] Puppeteer browser launched');

  return browserInstance as Browser;
}

// ---------------------------------------------------------------------------
// Cache Operations
// ---------------------------------------------------------------------------
function getCachedPDF(blueprintId: string): Buffer | null {
  const cached = pdfCache.get(blueprintId);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL_MS) {
    console.log(`[PDF] Cache expired for blueprint: ${blueprintId}`);
    pdfCache.delete(blueprintId);
    return null;
  }

  console.log(`[PDF] Cache hit for blueprint: ${blueprintId}`);
  return cached.buffer;
}

function setCachedPDF(blueprintId: string, buffer: Buffer): void {
  pdfCache.set(blueprintId, { buffer, timestamp: Date.now() });
  console.log(`[PDF] Cached PDF for blueprint: ${blueprintId}`);
}

/**
 * Invalidate cached PDF for a blueprint (e.g., when blueprint is updated).
 */
export function invalidatePDFCache(blueprintId: string): void {
  if (pdfCache.has(blueprintId)) {
    pdfCache.delete(blueprintId);
    console.log(`[PDF] Cache invalidated for blueprint: ${blueprintId}`);
  }
}

/**
 * Clean up expired cache entries.
 */
function cleanupExpiredCache(): void {
  const now = Date.now();
  let cleaned = 0;
  for (const [id, entry] of pdfCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      pdfCache.delete(id);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`[PDF] Cleaned up ${cleaned} expired cache entries`);
  }
}

// ---------------------------------------------------------------------------
// PDF Generation
// ---------------------------------------------------------------------------

class PDFService {
  private static instance: PDFService;

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  /**
   * Generate a professional PDF blueprint document.
   * Returns the filename that should be used for the download.
   */
  async generateBlueprintPDF(blueprint: Blueprint): Promise<string> {
    console.log(`[PDF] Starting PDF generation for blueprint: ${blueprint.id}`);
    const { filename } = compileBlueprintTemplate(blueprint);
    console.log(`[PDF] Generated blueprint PDF metadata: ${filename}`);
    return filename;
  }

  /**
   * Generate and return a PDF buffer for the given blueprint.
   * Uses cache to avoid re-rendering within the TTL window.
   */
  async renderPDF(blueprint: Blueprint): Promise<{ buffer: Buffer; filename: string }> {
    const startTime = Date.now();
    console.log(`[PDF] Rendering PDF for blueprint: ${blueprint.id}`);

    // Check cache
    cleanupExpiredCache();
    const cached = getCachedPDF(blueprint.id);
    if (cached) {
      const { filename } = compileBlueprintTemplate(blueprint);
      return { buffer: cached, filename };
    }

    // Validate blueprint completeness
    const missing = validateBlueprintForPDF(blueprint);
    if (missing.length > 0) {
      throw new Error(`Blueprint is incomplete. Missing: ${missing.join(', ')}`);
    }

    // Compile template
    const { html, filename: pdfFilename } = compileBlueprintTemplate(blueprint);

    // Vercel serverless: return HTML fallback (Chromium binary exceeds 50MB function limit)
    if (process.env.VERCEL) {
      console.log('[PDF] Running on Vercel — returning HTML blueprint (print to PDF from your browser)');
      const htmlFilename = pdfFilename.replace(/\.pdf$/i, '.html');
      const htmlBuffer = Buffer.from(html, 'utf-8');
      setCachedPDF(blueprint.id, htmlBuffer);
      return { buffer: htmlBuffer, filename: htmlFilename };
    }

    // Render with Puppeteer (local dev / self-hosted only)
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'load', timeout: 30000 });

      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');

      const pdfArray = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      const pdfBuffer = Buffer.from(pdfArray);

      // Cache the result
      setCachedPDF(blueprint.id, pdfBuffer);

      const processingTime = Date.now() - startTime;
      console.log(`[PDF] PDF rendered in ${processingTime}ms (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

      return { buffer: pdfBuffer, filename: pdfFilename };
    } finally {
      await page.close();
    }
  }

  /**
   * Stream a PDF directly for download.
   * Legacy method name preserved for controller compatibility.
   */
  async streamPDF(blueprintId: string, blueprint: Blueprint): Promise<Buffer> {
    const { buffer } = await this.renderPDF(blueprint);
    return buffer;
  }
}

export const pdfService = PDFService.getInstance();
