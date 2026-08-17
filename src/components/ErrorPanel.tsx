import React, { useState } from 'react';
import {
  AlertCircle,
  Sparkles,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  Code2,
  HelpCircle,
} from 'lucide-react';
import { ParsedPythonError, AppLanguage, AIFixResponse } from '../types';
import { getLocale } from '../locales';
import { ApiService } from '../services/api';

interface ErrorPanelProps {
  error: ParsedPythonError | null;
  currentCode: string;
  onApplyFix: (fixedCode: string) => void;
  onClose: () => void;
  onExplainMore?: () => void;
  language: AppLanguage;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({
  error,
  currentCode,
  onApplyFix,
  onClose,
  onExplainMore,
  language,
}) => {
  const t = getLocale(language);
  const [showTraceback, setShowTraceback] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<AIFixResponse | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!error) return null;

  const handleFixWithAI = async () => {
    setIsFixing(true);
    try {
      const res = await ApiService.fixError(currentCode, error, language);
      setFixResult(res);
    } catch (err) {
      console.error('Error fixing code with AI:', err);
    } finally {
      setIsFixing(false);
    }
  };

  const handleCopyFix = () => {
    if (fixResult?.fixed_code) {
      navigator.clipboard.writeText(fixResult.fixed_code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      id="ilmhub-error-panel"
      className="rounded-xl border border-rose-500/40 bg-[#0B1B2D] p-4 text-slate-100 shadow-2xl transition-all select-text mb-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#1E3A5F] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-rose-400 font-mono">{error.type}</span>
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-300 font-mono">
                {t.errorOnLine} {error.line}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">{error.message}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!fixResult && (
            <button
              id="ilmhub-fix-with-ai-btn"
              onClick={handleFixWithAI}
              disabled={isFixing}
              className="flex items-center space-x-1.5 rounded-lg bg-[#FFD43B] hover:bg-amber-300 px-3 py-1.5 text-xs font-bold text-[#071A2F] shadow transition active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isFixing ? 'animate-spin' : ''}`} />
              <span>{isFixing ? t.running : t.fixWithAi}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-white hover:bg-[#1E3A5F] transition"
            title="Close Error Banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Two-Level Error Explanation */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Simple Explanation for Beginners */}
        <div className="rounded-lg bg-[#071424] p-3 border border-[#1E3A5F]">
          <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-1">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{t.simpleExplanation}</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{error.simpleExplanation}</p>
        </div>

        {/* Suggested Quick Fix */}
        <div className="rounded-lg bg-[#071424] p-3 border border-[#1E3A5F]">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold mb-1">
            <Check className="h-3.5 w-3.5" />
            <span>{t.suggestedFix}</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{error.suggestedFix}</p>
        </div>
      </div>

      {/* AI Proposed Fix Diff & Actions */}
      {fixResult && (
        <div className="mt-4 rounded-lg border border-amber-500/40 bg-[#07111F] p-3 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#FFD43B]">
              <Sparkles className="h-4 w-4" />
              <span>ILMHUB AI Solution</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyFix}
                className="flex items-center space-x-1 rounded bg-[#0B2747] px-2.5 py-1 text-xs text-slate-200 hover:bg-[#133863] transition"
              >
                {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{isCopied ? t.copied : t.copyFix}</span>
              </button>

              <button
                id="ilmhub-apply-fix-btn"
                onClick={() => {
                  onApplyFix(fixResult.fixed_code);
                  setFixResult(null);
                }}
                className="flex items-center space-x-1 rounded bg-emerald-500 hover:bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950 shadow transition active:scale-95"
              >
                <Check className="h-3 w-3" />
                <span>{t.applyFix}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#0B1E33] p-2.5 rounded-md border border-[#1E3A5F]">
            {fixResult.explanation}
          </p>

          {fixResult.changes && fixResult.changes.length > 0 && (
            <div className="text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300">Changes Made:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {fixResult.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Fixed Code Preview */}
          <div className="rounded-md bg-[#050B14] p-3 font-mono text-xs text-emerald-300 max-h-40 overflow-y-auto border border-[#1E3A5F]">
            <pre className="whitespace-pre-wrap">{fixResult.fixed_code}</pre>
          </div>
        </div>
      )}

      {/* Full Traceback Dropdown */}
      <div className="mt-3">
        <button
          onClick={() => setShowTraceback(!showTraceback)}
          className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
        >
          <span>{showTraceback ? t.hideTraceback : t.fullTraceback}</span>
          {showTraceback ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {showTraceback && (
          <div className="mt-2 rounded-md bg-[#050B14] p-3 font-mono text-[11px] text-rose-300 max-h-48 overflow-y-auto border border-[#1E3A5F] whitespace-pre-wrap">
            {error.traceback}
          </div>
        )}
      </div>
    </div>
  );
};
