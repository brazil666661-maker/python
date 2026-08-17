import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Code,
  FileQuestion,
  Wrench,
  Zap,
  MessageSquare,
  Copy,
  Check,
  CornerDownLeft,
  X,
  ExternalLink,
  BrainCircuit,
  Globe,
  Trash2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { AIMessage, AppLanguage, AppSettings } from '../types';
import { getLocale } from '../locales';
import { ApiService } from '../services/api';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  currentError: string | null;
  onInsertCode: (code: string) => void;
  onRunCode: () => void;
  language: AppLanguage;
  settings: AppSettings;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onClose,
  currentCode,
  currentError,
  onInsertCode,
  onRunCode,
  language,
  settings,
}) => {
  const t = getLocale(language);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        language === 'uz'
          ? "Assalomu alaykum! Men ILMHUB AI yordamchisiman. Python kodingizni tushuntirish, xatolarni tuzatish yoki yangi dasturlar yaratishda yordam berishga tayyorman."
          : language === 'ru'
          ? "Привет! Я ассистент ILMHUB AI. Готов помочь вам написать, оптимизировать, объяснить или исправить ваш код на Python."
          : language === 'uz-cyrl'
          ? "Ассалому алайкум! Мен ILMHUB AI ёрдамчисиман. Python кодингизни тушунтириш, хатоларни тузатиш ёки янги дастурлар яратишда ёрдам беришга тайёрман."
          : "Hello! I am ILMHUB AI. I can help you explain Python code, fix runtime errors, optimize performance, or generate new algorithms.",
      timestamp: Date.now(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const userMsg: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await ApiService.sendChatMessage(
        chatHistory,
        currentCode,
        currentError || undefined,
        language,
        settings.aiModel,
        settings.aiThinking,
        settings.aiSearchGrounding
      );

      const aiMsg: AIMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: res.content,
        timestamp: Date.now(),
        modelUsed: res.modelUsed,
        groundingUrls: res.groundingUrls,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${err?.message || 'Could not connect to Gemini AI'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action: Explain Code
  const handleExplainCode = async () => {
    setIsLoading(true);
    const userMsg: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: `${t.explainCode}:`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const data = await ApiService.explainCode(currentCode, undefined, language);
      let content = `### 📘 ${t.explainCode}\n\n**${data.overview}**\n\n`;

      if (data.lineByLine && data.lineByLine.length > 0) {
        content += `#### 🔍 Line-by-Line Analysis:\n`;
        data.lineByLine.forEach((l) => {
          content += `- **Line ${l.line}**: ${l.explanation}\n`;
        });
      }

      if (data.potentialIssues && data.potentialIssues.length > 0) {
        content += `\n#### ⚠️ Potential Issues & Edge Cases:\n`;
        data.potentialIssues.forEach((issue) => {
          content += `- ${issue}\n`;
        });
      }

      if (data.improvements && data.improvements.length > 0) {
        content += `\n#### 💡 Suggestions for Improvement:\n`;
        data.improvements.forEach((imp) => {
          content += `- ${imp}\n`;
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `Failed to explain code: ${err?.message}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action: Code Review
  const handleCodeReview = async () => {
    setIsLoading(true);
    const userMsg: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: `${t.codeReview}:`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const data = await ApiService.reviewCode(currentCode, language);
      let content = `### 📋 ${t.codeReview}\n\n`;
      content += `**Quality Score:** \`${data.score}/100\`\n\n`;
      content += `${data.summary}\n\n`;

      if (data.suggestions && data.suggestions.length > 0) {
        content += `#### Recommended Improvements:\n`;
        data.suggestions.forEach((s) => {
          content += `- **${s.severity.toUpperCase()}** ${s.line ? `(Line ${s.line})` : ''}: ${s.issue}\n  _Fix: ${s.fix}_\n`;
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `Code review failed: ${err?.message}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action: Generate Code
  const handleGeneratePrompt = (topic: string) => {
    handleSendMessage(`Generate Python code for: ${topic}`);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Extract Python code blocks from text
  const extractCodeBlocks = (text: string) => {
    const regex = /```(?:python)?([\s\S]*?)```/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    return matches;
  };

  return (
    <div
      id="ilmhub-ai-assistant-panel"
      className="flex flex-col h-full w-full lg:w-96 border-l border-[#1E3A5F] bg-[#071A2F] text-slate-100 shadow-2xl z-30 transition-all select-text"
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-[#1E3A5F] bg-[#0B2747] px-4 select-none">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFD43B] text-[#071A2F]">
            <Sparkles className="h-4 w-4 fill-current" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <span>ILMHUB AI</span>
              {settings.aiThinking && (
                <span className="rounded bg-indigo-500/30 px-1 py-0.2 text-[9px] text-indigo-300 flex items-center gap-0.5">
                  <BrainCircuit className="h-2.5 w-2.5" /> High Thinking
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400">Gemini Python Intelligence</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setMessages([messages[0]])}
            className="rounded p-1 text-slate-400 hover:text-white hover:bg-[#1E3A5F] transition"
            title="Clear Chat History"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-white hover:bg-[#1E3A5F] transition"
            title="Close AI Assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-2.5 bg-[#071424] border-b border-[#1E3A5F]/60 no-scrollbar select-none">
        <button
          onClick={handleExplainCode}
          disabled={isLoading}
          className="flex items-center space-x-1 whitespace-nowrap rounded-md border border-[#1E3A5F] bg-[#0B2747] px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-[#133863] hover:text-[#FFD43B] transition disabled:opacity-50"
        >
          <FileQuestion className="h-3 w-3 text-sky-400" />
          <span>{t.explainCode}</span>
        </button>

        <button
          onClick={handleCodeReview}
          disabled={isLoading}
          className="flex items-center space-x-1 whitespace-nowrap rounded-md border border-[#1E3A5F] bg-[#0B2747] px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-[#133863] hover:text-[#FFD43B] transition disabled:opacity-50"
        >
          <Wrench className="h-3 w-3 text-amber-400" />
          <span>{t.codeReview}</span>
        </button>

        <button
          onClick={() => handleGeneratePrompt('Fast sorting algorithms in Python')}
          disabled={isLoading}
          className="flex items-center space-x-1 whitespace-nowrap rounded-md border border-[#1E3A5F] bg-[#0B2747] px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-[#133863] hover:text-[#FFD43B] transition disabled:opacity-50"
        >
          <Zap className="h-3 w-3 text-emerald-400" />
          <span>{t.generateCode}</span>
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const codeBlocks = !isUser ? extractCodeBlocks(msg.content) : [];

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[92%] rounded-xl p-3 shadow-md leading-relaxed ${
                  isUser
                    ? 'bg-[#1E3A5F] text-white rounded-br-none'
                    : 'bg-[#0B1E33] text-slate-200 border border-[#1E3A5F] rounded-bl-none'
                }`}
              >
                {/* Message Header */}
                {!isUser && (
                  <div className="flex items-center justify-between border-b border-[#1E3A5F]/60 pb-1 mb-2 text-[10px] text-slate-400">
                    <span className="font-bold text-[#FFD43B]">ILMHUB AI</span>
                    <button
                      onClick={() => handleCopyText(msg.content, msg.id)}
                      className="hover:text-white transition flex items-center gap-0.5"
                    >
                      {copiedIndex === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Grounding URLs from Google Search */}
                {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#1E3A5F]/60 text-[10px] space-y-1">
                    <span className="font-semibold text-slate-400 flex items-center gap-1">
                      <Globe className="h-3 w-3 text-sky-400" /> Grounded Sources:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.groundingUrls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 rounded bg-[#071424] px-1.5 py-0.5 text-sky-300 hover:text-white border border-[#1E3A5F]"
                        >
                          <span className="truncate max-w-[120px]">{url.title || url.uri}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Insert Code button for AI code blocks */}
                {codeBlocks.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#1E3A5F]/60 flex items-center space-x-2">
                    <button
                      onClick={() => onInsertCode(codeBlocks[0])}
                      className="flex items-center space-x-1 rounded-md bg-[#FFD43B] hover:bg-amber-300 px-2.5 py-1 text-[11px] font-bold text-[#071A2F] transition shadow"
                      title="Insert code into active editor file"
                    >
                      <Code className="h-3 w-3" />
                      <span>{t.insertCode}</span>
                    </button>

                    <button
                      onClick={() => {
                        onInsertCode(codeBlocks[0]);
                        setTimeout(onRunCode, 150);
                      }}
                      className="flex items-center space-x-1 rounded-md bg-emerald-500 hover:bg-emerald-400 px-2.5 py-1 text-[11px] font-bold text-slate-950 transition shadow"
                      title="Insert and Run"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Insert & Run</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 bg-[#0B1E33] p-2.5 rounded-lg border border-[#1E3A5F] animate-pulse">
            <Sparkles className="h-4 w-4 text-[#FFD43B] animate-spin" />
            <span>Analyzing and reasoning with Gemini...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-[#1E3A5F] bg-[#0B2747]"
      >
        <div className="relative flex items-center">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={t.aiPlaceholder}
            rows={2}
            className="w-full resize-none rounded-xl border border-[#1E3A5F] bg-[#07111F] p-2.5 pr-10 text-xs text-white placeholder:text-slate-500 focus:border-[#FFD43B] focus:outline-none scrollbar-none"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="absolute right-2.5 bottom-3 rounded-lg bg-[#FFD43B] p-1.5 text-[#071A2F] hover:bg-amber-300 transition disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
