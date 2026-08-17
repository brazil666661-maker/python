import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';

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

function buildPythonAssistantFallback(code = '', promptType = 'explain') {
  const trimmed = (code || '').trim();
  const lines = trimmed ? trimmed.split(/\r?\n/) : ['print("Hello, ILMHUB!")'];

  const overview =
    promptType === 'fix'
      ? 'Python-only assistant mode is active. This code is being analyzed without an external AI key, so the fix is based on the runtime logic and standard Python behavior.'
      : 'Python-only assistant mode is active. This code is being reviewed without any external AI service, so the guidance is based on Python syntax and common execution patterns.';

  return {
    fallback: true,
    text: JSON.stringify({
      overview,
      lineByLine: lines.map((line, index) => ({
        line: String(index + 1),
        explanation: `This line runs as Python code. Review it carefully for syntax and logic: ${line || 'blank line'}`,
      })),
      potentialIssues: [
        'Make sure the code is valid Python syntax.',
        'Check indentation and block structure when using loops or functions.',
        'Verify names and values before indexing or calling methods.',
      ],
      improvements: [
        'Keep code simple and readable.',
        'Use descriptive variable names.',
        'Add comments for logic that is not obvious.',
      ],
      summary: 'Python-only mode is enabled. No Gemini API key is required to run Python code in the editor.',
      strengths: ['Focused on Python execution.', 'Works without external service keys.'],
      issues: ['AI answers are local guidance only.'],
      improvementsList: ['Use clear Python structure.', 'Test code in the terminal after each change.'],
      fixedCode: trimmed || 'print("Hello, ILMHUB!")',
      whyItFailed: 'This is local Python-only assistance. No API key is required for execution.',
    }),
  };
}

async function handleRun(req, res) {
  const body = await getRequestBody(req);

  if (!body || typeof body.code !== 'string' || body.code.trim() === '') {
    return res.status(400).json({
      success: false,
      stdout: '',
      stderr: 'Python code is required before execution.',
      exit_code: 1,
      execution_time: 0,
      error: {
        type: 'ValidationError',
        message: 'Code is required and must be a non-empty string.',
        file: 'main.py',
        line: 1,
        traceback: '',
        simpleExplanation: 'The editor did not contain Python code to execute.',
        suggestedFix: 'Paste Python code into the editor and click Run again.',
      },
    });
  }

  const pythonExecPath = process.env.PYTHON_EXECUTION_URL || '';
  if (pythonExecPath) {
    try {
      const upstreamResponse = await fetch(`${pythonExecPath.replace(/\/$/, '')}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: body.code,
          filename: typeof body.filename === 'string' ? body.filename : 'main.py',
          files: Array.isArray(body.files) ? body.files : [],
          stdin: typeof body.stdin === 'string' ? body.stdin : undefined,
          timeout: typeof body.timeout === 'number' ? body.timeout : 10,
          maxOutputSize: typeof body.maxOutputSize === 'number' ? body.maxOutputSize : 1024 * 1024,
          processId: typeof body.processId === 'string' ? body.processId : undefined,
          lang: body.lang || 'en',
        }),
      });

      const json = await upstreamResponse.json().catch(() => ({ success: false, stderr: 'Execution backend returned an invalid response.' }));
      return res.status(upstreamResponse.ok ? 200 : 502).json(json);
    } catch (error) {
      console.error('Python execution backend proxy error:', error);
      return res.status(502).json({
        success: false,
        stdout: '',
        stderr: `Python execution backend is unreachable: ${error?.message || 'Unknown error'}`,
        exit_code: 1,
        execution_time: 0,
        error: {
          type: 'ExecutionServiceError',
          message: 'Python execution backend is not configured or is unreachable.',
          file: 'main.py',
          line: 1,
          traceback: '',
          simpleExplanation: 'The application is configured to proxy execution to an external backend, but no valid backend is responding.',
          suggestedFix: 'Set PYTHON_EXECUTION_URL to a real secure Python execution service and redeploy.',
        },
      });
    }
  }

  if (!process.env.PYTHON_EXECUTION_URL && typeof process === 'object' && !!process && typeof process.env?.PATH === 'string') {
    const commandCheck = spawn('python3', ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
    commandCheck.on('error', () => {
      // do nothing - handled below
    });

    commandCheck.on('exit', (code) => {
      if (code !== 0 && !commandCheck.killed) {
        // handled in the fallback below via local result
      }
    });
  }

  const result = await runPythonCode({
    code: body.code,
    filename: typeof body.filename === 'string' ? body.filename : 'main.py',
    files: Array.isArray(body.files) ? body.files : [],
    stdin: typeof body.stdin === 'string' ? body.stdin : undefined,
    timeout: typeof body.timeout === 'number' ? body.timeout : 10,
    maxOutputSize: typeof body.maxOutputSize === 'number' ? body.maxOutputSize : 1024 * 1024,
    processId: typeof body.processId === 'string' ? body.processId : undefined,
    lang: body.lang || 'en',
  });

  if (!result.success && result.stderr && /Could not spawn Python process|Execution failed: spawn python3 ENOENT|No such file or directory/i.test(result.stderr)) {
    return res.status(503).json({
      ...result,
      success: false,
      stderr: 'Python runtime is not available in this deployment. Configure a secure external Python execution backend in Vercel.',
      error: {
        type: 'ExecutionServiceError',
        message: 'Python runtime is not available in this deployment.',
        file: 'main.py',
        line: 1,
        traceback: '',
        simpleExplanation: 'The Vercel environment does not contain a Python interpreter, so this app cannot execute user code locally.',
        suggestedFix: 'Set PYTHON_EXECUTION_URL to a real external Python execution service and redeploy.',
      },
    });
  }

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

  const result = buildPythonAssistantFallback(code, 'explain');
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

  const result = buildPythonAssistantFallback(body.code || '', 'fix');
  try {
    const data = JSON.parse(result.text || '{}');
    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(200).json({ success: true, data: { fixedCode: body.code || '', summary: result.text, whyItFailed: 'Python-only assistant is active.' } });
  }
}

async function handleGenerate(req, res) {
  const body = await getRequestBody(req);
  const lang = body.language || 'en';
  const prompt = `You are ILMHUB code generator.\n${getLanguageInstruction(lang)}\nGenerate a complete Python example for this request:\n${body.prompt || ''}`;

  const result = buildPythonAssistantFallback(body.prompt || 'print("Hello, ILMHUB!")', 'generate');
  try {
    const data = JSON.parse(result.text || '{}');
    return res.status(200).json({ success: true, data: { code: data.fixedCode || 'print("Hello, ILMHUB!")', explanation: data.overview || 'Python-only mode is active.' } });
  } catch {
    return res.status(200).json({ success: true, data: { code: 'print("Hello, ILMHUB!")', explanation: 'Python-only mode is active.' } });
  }
}

async function handleReview(req, res) {
  const body = await getRequestBody(req);
  const lang = body.language || 'en';
  const prompt = `You are ILMHUB Python reviewer.\n${getLanguageInstruction(lang)}\nReview this code and return valid JSON with keys: summary, strengths, issues, improvements.\n\n\`\`\`python\n${body.code || ''}\n\`\`\``;

  const result = buildPythonAssistantFallback(body.code || '', 'review');
  try {
    const data = JSON.parse(result.text || '{}');
    return res.status(200).json({ success: true, data: { summary: data.summary || 'Python-only review mode is active.', strengths: data.strengths || [], issues: data.issues || [], improvements: data.improvementsList || [] } });
  } catch {
    return res.status(200).json({ success: true, data: { summary: 'Python-only review mode is active.', strengths: [], issues: [], improvements: [] } });
  }
}

async function handleChat(req, res) {
  const body = await getRequestBody(req);
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lang = body.language || 'en';
  const joined = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
  const prompt = `You are ILMHUB AI assistant.\n${getLanguageInstruction(lang)}\nCurrent code:\n\`\`\`python\n${body.currentCode || ''}\n\`\`\`\n\nCurrent error:\n${body.currentError || 'None'}\n\nConversation:\n${joined}`;

  const result = buildPythonAssistantFallback(body.currentCode || '', 'chat');
  try {
    const data = JSON.parse(result.text || '{}');
    const content = data.summary || data.overview || 'Python-only mode is active. No Gemini API key is required.';
    return res.status(200).json({ success: true, data: { content, modelUsed: 'python-only', groundingUrls: [] } });
  } catch {
    return res.status(200).json({ success: true, data: { content: 'Python-only mode is active. No Gemini API key is required.', modelUsed: 'python-only', groundingUrls: [] } });
  }
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
