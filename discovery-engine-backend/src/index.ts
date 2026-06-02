/**
 * ============================================================================
 * DISCOVERY ENGINE - Backend API Server
 * ============================================================================
 */

const express = require('express');
const serverless = require('serverless-http');

let app: any;
let initError: Error | null = null;

try {
  app = require('./bootstrap').default;
} catch (err) {
  initError = err instanceof Error ? err : new Error(String(err));
  console.error('[INIT] Failed to load app:', initError.message, initError.stack);
  app = express();
  app.all('*', (_req: any, res: any) => {
    res.status(500).json({
      success: false,
      message: 'Backend initialization failed',
      error: initError?.message,
      stack: initError?.stack?.split('\n').slice(0, 10),
    });
  });
}

export default serverless(app);
