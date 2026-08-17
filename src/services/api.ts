import {
  ExecutionRequest,
  ExecutionResponse,
  AIFixResponse,
  AIExplainResponse,
  AIGenerateResponse,
  AIReviewResponse,
  AppLanguage,
} from '../types';

const apiUrl = (path: string) => {
  if (typeof window === 'undefined') return path;
  const origin = window.location?.origin || '';
  return origin ? `${origin}${path}` : path;
};

export class ApiService {
  static async runCode(req: ExecutionRequest, lang: AppLanguage = 'en'): Promise<ExecutionResponse> {
    try {
      const response = await fetch(apiUrl('/api/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, lang }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Run API Error:', error);
      return {
        success: false,
        stdout: '',
        stderr: `Network or Server Error: ${error?.message || 'Could not connect to ILMHUB server'}`,
        exit_code: 1,
        execution_time: 0,
        error: {
          type: 'ConnectionError',
          message: error?.message || 'Failed to reach backend server',
          file: req.filename || 'main.py',
          line: 1,
          traceback: error?.stack || '',
          simpleExplanation: 'Unable to communicate with the ILMHUB execution server.',
          suggestedFix: 'Check your internet connection and verify the backend is running.',
        },
      };
    }
  }

  static async stopExecution(processId: string): Promise<boolean> {
    try {
      const response = await fetch(apiUrl('/api/stop'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processId }),
      });
      const data = await response.json();
      return data.success;
    } catch (err) {
      console.error('Stop error:', err);
      return false;
    }
  }

  static async explainCode(
    code: string,
    selectedCode?: string,
    language: AppLanguage = 'en'
  ): Promise<AIExplainResponse> {
    const response = await fetch(apiUrl('/api/ai/explain'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, selectedCode, language }),
    });

    const json = await response.json();
    if (!json.success) throw new Error(json.error || 'Failed to explain code');
    return json.data;
  }

  static async fixError(
    code: string,
    error: any,
    language: AppLanguage = 'en'
  ): Promise<AIFixResponse> {
    const response = await fetch(apiUrl('/api/ai/fix'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, error, language }),
    });

    const json = await response.json();
    if (!json.success) throw new Error(json.error || 'Failed to fix code');
    return json.data;
  }

  static async generateCode(
    prompt: string,
    language: AppLanguage = 'en'
  ): Promise<AIGenerateResponse> {
    const response = await fetch(apiUrl('/api/ai/generate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, language }),
    });

    const json = await response.json();
    if (!json.success) throw new Error(json.error || 'Failed to generate code');
    return json.data;
  }

  static async reviewCode(
    code: string,
    language: AppLanguage = 'en'
  ): Promise<AIReviewResponse> {
    const response = await fetch(apiUrl('/api/ai/review'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });

    const json = await response.json();
    if (!json.success) throw new Error(json.error || 'Failed to review code');
    return json.data;
  }

  static async sendChatMessage(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    currentCode: string,
    currentError?: string,
    language: AppLanguage = 'en',
    model = 'gemini-3.5-flash',
    thinking = false,
    searchGrounding = false
  ): Promise<{ content: string; modelUsed: string; groundingUrls: Array<{ title?: string; uri: string }> }> {
    const response = await fetch(apiUrl('/api/ai/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        currentCode,
        currentError,
        language,
        model,
        thinking,
        searchGrounding,
      }),
    });

    const json = await response.json();
    if (!json.success) throw new Error(json.error || 'Chat request failed');
    return json.data;
  }
}
