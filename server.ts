import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { executePythonCode, stopProcess } from './server/executor';
import {
  explainPythonCode,
  fixPythonError,
  generatePythonCode,
  reviewPythonCode,
  chatWithAI,
} from './server/gemini';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ILMHUB Python Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Execute Python Code
  app.post('/api/run', async (req, res) => {
    try {
      const { code, filename, files, stdin, timeout, maxOutputSize, processId, lang } = req.body;

      if (typeof code !== 'string') {
        res.status(400).json({ success: false, error: 'Field "code" must be a string' });
        return;
      }

      const result = await executePythonCode({
        code,
        filename: filename || 'main.py',
        files,
        stdin,
        timeout: typeof timeout === 'number' ? timeout : 10,
        maxOutputSize: typeof maxOutputSize === 'number' ? maxOutputSize : 1024 * 1024,
        processId,
        lang,
      });

      res.json(result);
    } catch (error: any) {
      console.error('API Run error:', error);
      res.status(500).json({
        success: false,
        stdout: '',
        stderr: `Server error while executing Python: ${error?.message || 'Unknown error'}`,
        exit_code: 1,
        execution_time: 0,
        error: {
          type: 'ServerError',
          message: error?.message || 'Internal execution failure',
          file: 'main.py',
          line: 1,
          traceback: error?.stack || '',
          simpleExplanation: 'An internal server error occurred while starting execution.',
          suggestedFix: 'Please check your connection and try again.',
        },
      });
    }
  });

  // Stop running execution
  app.post('/api/stop', (req, res) => {
    try {
      const { processId } = req.body;
      if (!processId) {
        res.status(400).json({ success: false, error: 'processId is required' });
        return;
      }

      const stopped = stopProcess(processId);
      res.json({ success: true, stopped });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // AI Explain
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { code, selectedCode, language } = req.body;
      const explanation = await explainPythonCode({ code, selectedCode, language });
      res.json({ success: true, data: explanation });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // AI Fix
  app.post('/api/ai/fix', async (req, res) => {
    try {
      const { code, error, language } = req.body;
      const fixResult = await fixPythonError({ code, error: error || {}, language });
      res.json({ success: true, data: fixResult });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // AI Generate
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, language } = req.body;
      const genResult = await generatePythonCode({ prompt, language });
      res.json({ success: true, data: genResult });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // AI Review
  app.post('/api/ai/review', async (req, res) => {
    try {
      const { code, language } = req.body;
      const reviewResult = await reviewPythonCode({ code, language });
      res.json({ success: true, data: reviewResult });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // AI Chat
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, currentCode, currentError, language, model, thinking, searchGrounding } = req.body;
      const chatResult = await chatWithAI({
        messages: Array.isArray(messages) ? messages : [],
        currentCode,
        currentError,
        language,
        model,
        thinking,
        searchGrounding,
      });
      res.json({ success: true, data: chatResult });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ILMHUB server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ILMHUB server:', err);
  process.exit(1);
});
