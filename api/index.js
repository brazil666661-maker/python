import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { GoogleGenAI } from '@google/genai';

const getLanguageInstruction = (lang = 'en') => {
  switch (lang) {
    case 'uz':
      return 'Barcha tushuntirish va matnlarni sof, tushunarli o‘zbek tilida (lotin alifbosida) taqdim eting.';
    case 'uz-cyrl':
      return 'Барча тушунтириш ва матнларни соф, тушунарли ўзбек тилида (кирилл алифбосида) тақдим этинг.';
    case 'ru':
      return 'Предоставляйте все объяснения и тексты на чистом, понятном русском языке.';
    default:
      return 'Provide all explanations and guidance in clear, beginner-friendly English.';
  }
};

const getRequestBody = async (req) => {
  if (req.body) return req.body;

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) return {};

  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw.trim()) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
};

const normalizeError = (stderr, stdout, filename, lang = 'en') => {
  const source = (stderr || stdout || '').trim();
  const lines = source.split(/\r?\n/).filter(Boolean);
  const message = lines[lines.length - 1] || 'Unknown runtime error';

  return {
    type: 'RuntimeError',
    message,
    file: filename || 'main.py',
    line: 1,
    traceback: source || message,
    simpleExplanation: 'The Python code failed while running.',
    suggestedFix: 'Review the traceback and fix the offending line in your code.',
    lang,
  };
};

async function runPythonCode({
  code,
  filename = 'main.py',
  files = [],
  stdin,
  timeout = 10,
  maxOutputSize = 1024 * 1024,
  processId,
  lang = 'en',
}) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ilmhub-run-'));
  const maxBytes = Math.min(maxOutputSize || 1024 * 1024, 5 * 1024 * 1024);
  const timeoutMs = Math.min(Math.max((timeout || 10) * 1000, 1000), 30000);
  const mainFilePath = path.join(tempDir, filename);

  try {
    fs.writeFileSync(mainFilePath, code || '', 'utf-8');

    for (const file of files) {
      if (!file?.name || file.name === filename) continue;
      const safeName = path.basename(file.name);
      fs.writeFileSync(path.join(tempDir, safeName), file.content || '', 'utf-8');
    }

    const safeEnv = {
      PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
      PYTHONIOENCODING: 'utf-8',
      PYTHONUNBUFFERED: '1',
      PYTHONDONTWRITEBYTECODE: '1',
      HOME: tempDir,
      TMPDIR: tempDir,
      LANG: 'en_US.UTF-8',
      LC_ALL: 'en_US.UTF-8',
    };

    const startTime = Date.now();
    let stdoutData = '';
    let stderrData = '';
    let totalBytes = 0;
    let isTruncated = false;
    let timedOut = false;

    const pyProcess = spawn('python3', ['-u', filename], {
      cwd: tempDir,
      env: safeEnv,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (stdin && pyProcess.stdin) {
      pyProcess.stdin.write(stdin);
      pyProcess.stdin.end();
    } else if (pyProcess.stdin) {
      pyProcess.stdin.end();
    }

    const timer = setTimeout(() => {
      timedOut = true;
      pyProcess.kill('SIGTERM');
    }, timeoutMs);

    pyProcess.stdout.on('data', (chunk) => {
      if (totalBytes < maxBytes) {
        const available = maxBytes - totalBytes;
        if (chunk.length > available) {
          stdoutData += chunk.subarray(0, available).toString('utf-8');
          totalBytes += available;
          isTruncated = true;
        } else {
          stdoutData += chunk.toString('utf-8');
          totalBytes += chunk.length;
        }
      }
    });

    pyProcess.stderr.on('data', (chunk) => {
      if (totalBytes < maxBytes) {
        const available = maxBytes - totalBytes;
        if (chunk.length > available) {
          stderrData += chunk.subarray(0, available).toString('utf-8');
          totalBytes += available;
          isTruncated = true;
        } else {
          stderrData += chunk.toString('utf-8');
          totalBytes += chunk.length;
        }
      }
    });

    const exitCode = await new Promise((resolve) => {
      pyProcess.on('close', (code) => resolve(code));
    });

    clearTimeout(timer);

    if (isTruncated) {
      stderrData += `\n[ILMHUB]: Output limit of ${(maxBytes / 1024).toFixed(0)}KB reached. Additional output was truncated.`;
    }

    if (timedOut) {
      stderrData += `\n[ILMHUB]: Execution timed out after ${(timeoutMs / 1000).toFixed(0)} seconds.`;
    }

    const executionTime = Number(((Date.now() - startTime) / 1000).toFixed(3));
    const codeFailed = exitCode !== 0 || timedOut;
    const parsedError = codeFailed ? normalizeError(stderrData, stdoutData, filename, lang) : null;

    return {
      success: !codeFailed && !parsedError,
      stdout: stdoutData,
      stderr: stderrData,
      exit_code: timedOut ? 124 : exitCode ?? 1,
      execution_time: executionTime,
      error: parsedError,
      timed_out: timedOut,
      cancelled: false,
      output_truncated: isTruncated,
      processId: processId || `proc_${Date.now()}`,
    };
  } catch (error) {
    return {
      success: false,
      stdout: '',
      stderr: `Execution failed: ${error?.message || String(error)}`,
      exit_code: 1,
      execution_time: 0,
      error: {
        type: 'ExecutionError',
        message: error?.message || String(error),
        file: filename,
        line: 1,
        traceback: String(error),
        simpleExplanation: 'The Python runtime could not start.',
        suggestedFix: 'Check that Python is available on the server and try again.',
        lang,
      },
      processId: processId || `proc_${Date.now()}`,
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}

async function callGemini(prompt, systemText = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      fallback: true,
      text: 'GEMINI_API_KEY is not configured. Please add a valid API key in your Vercel environment settings.',
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${systemText}\n\n${prompt}`,
    config: { responseMimeType: 'application/json' },
  });

  const text = response?.text || '{}';
  return { fallback: false, text };
}

async function handleRun(req, res) {
  const body = await getRequestBody(req);
  const result = await runPythonCode({
    code: typeof body.code === 'string' ? body.code : '',
    filename: typeof body.filename === 'string' ? body.filename : 'main.py',
    files: Array.isArray(body.files) ? body.files : [],
    stdin: typeof body.stdin === 'string' ? body.stdin : undefined,
    timeout: typeof body.timeout === 'number' ? body.timeout : 10,
    maxOutputSize: typeof body.maxOutputSize === 'number' ? body.maxOutputSize : 1024 * 1024,
    processId: typeof body.processId === 'string' ? body.processId : undefined,
    lang: body.lang || 'en',
  });

  return res.status(200).json(result);
}

async function handleStop(req, res) {
  return res.status(200).json({ success: true, stopped: false });
}

async function handleHealth(req, res) {
  return res.status(200).json({
    status: 'ok',
    service: 'ILMHUB Python Engine',
    timestamp: new Date().toISOString(),
    deployment: 'vercel-serverless',
  });
}

async function handleExplain(req, res) {
  const body = await getRequestBody(req);
  const lang = body.language || 'en';
  const code = body.selectedCode || body.code || '';
  const prompt = `You are ILMHUB's expert Python Coding Assistant.\n${getLanguageInstruction(lang)}\nExplain this Python code clearly and beginner-friendly:\n\n\`\`\`python\n${code}\n\`\`\``;

  const result = await callGemini(prompt, 'Return valid JSON with keys: overview, lineByLine, potentialIssues, improvements.');
  if (result.fallback) {
    return res.status(200).json({ success: true, data: { overview: result.text, lineByLine: [], potentialIssues: [], improvements: [] } });
  }

  try {
    const data = JSON.parse(result.text || '{}');
    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(200).json({ success: true, data: { overview: result.text, lineByLine: [], potentialIssues: [], improvements: [] } });
  }
}

async function handleFix(req, res) {
  const body = await getRequestBody(req);
  const lang = body.language || 'en';
  const prompt = `You are ILMHUB's smart Python debugger.\n${getLanguageInstruction(lang)}\nFix the bug in this Python code. Respond with JSON: { "fixedCode": "...", "summary": "...", "whyItFailed": "..." }\n\nOriginal code:\n\n\`\`\`python\n${body.code || ''}\n\`\`\`\n\nError:\n${JSON.stringify(body.error || {}, null, 2)}`;

  const result = await callGemini(prompt);
  if (result.fallback) {
    return res.status(200).json({ success: true, data: { fixedCode: body.code || '', summary: result.text, whyItFailed: 'API key is missing.' } });
  }

  try {
    const data = JSON.parse(result.text || '{}');
    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(200).json({ success: true, data: { fixedCode: body.code || '', summary: result.text, whyItFailed: 'Could not parse AI fix result.' } });
  }
}

async function handleGenerate(req, res) {
  const body = await getRequestBody(req);
  const lang = body.language || 'en';
  const prompt = `You are ILMHUB code generator.\n${getLanguageInstruction(lang)}\nGenerate a complete Python example for this request:\n${body.prompt || ''}`;

  const result = await callGemini(prompt);
  if (result.fallback) {
    return res.status(200).json({ success: true, data: { code: 'print("Hello, ILMHUB!")', explanation: result.text } });
  }

  try {
    const data = JSON.parse(result.text || '{}');
    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(200).json({ success: true, data: { code: result.text || 'print("Hello, ILMHUB!")', explanation: 'Generated code sample.' } });
  }
}

async function handleReview(req, res) {
  const body = await getRequestBody(req);
  const lang = body.language || 'en';
  const prompt = `You are ILMHUB Python reviewer.\n${getLanguageInstruction(lang)}\nReview this code and return valid JSON with keys: summary, strengths, issues, improvements.\n\n\`\`\`python\n${body.code || ''}\n\`\`\``;

  const result = await callGemini(prompt);
  if (result.fallback) {
    return res.status(200).json({ success: true, data: { summary: result.text, strengths: [], issues: [], improvements: [] } });
  }

  try {
    const data = JSON.parse(result.text || '{}');
    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(200).json({ success: true, data: { summary: result.text, strengths: [], issues: [], improvements: [] } });
  }
}

async function handleChat(req, res) {
  const body = await getRequestBody(req);
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lang = body.language || 'en';
  const joined = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
  const prompt = `You are ILMHUB AI assistant.\n${getLanguageInstruction(lang)}\nCurrent code:\n\`\`\`python\n${body.currentCode || ''}\n\`\`\`\n\nCurrent error:\n${body.currentError || 'None'}\n\nConversation:\n${joined}`;

  const result = await callGemini(prompt);
  if (result.fallback) {
    return res.status(200).json({ success: true, data: { content: result.text, modelUsed: 'gemini-2.5-flash', groundingUrls: [] } });
  }

  return res.status(200).json({ success: true, data: { content: result.text, modelUsed: 'gemini-2.5-flash', groundingUrls: [] } });
}

export default async function handler(req, res) {
  const pathname = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`).pathname;

  if (req.method === 'GET' && pathname === '/api/health') {
    return handleHealth(req, res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  switch (pathname) {
    case '/api/run':
      return handleRun(req, res);
    case '/api/stop':
      return handleStop(req, res);
    case '/api/ai/explain':
      return handleExplain(req, res);
    case '/api/ai/fix':
      return handleFix(req, res);
    case '/api/ai/generate':
      return handleGenerate(req, res);
    case '/api/ai/review':
      return handleReview(req, res);
    case '/api/ai/chat':
      return handleChat(req, res);
    default:
      return res.status(404).json({ success: false, error: `Route not found: ${pathname}` });
  }
}
