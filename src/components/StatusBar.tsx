import React from 'react';
import { Check, AlertCircle, Clock, Terminal, ShieldCheck, Sparkles } from 'lucide-react';
import { ExecutionState, AppLanguage } from '../types';
import { getLocale } from '../locales';

interface StatusBarProps {
  executionState: ExecutionState;
  executionTime: number | null;
  errorLine: number | null;
  cursorLine: number;
  cursorCol: number;
  language: AppLanguage;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  executionState,
  executionTime,
  errorLine,
  cursorLine,
  cursorCol,
  language,
}) => {
  const t = getLocale(language);

  return (
    <div
      id="ilmhub-status-bar"
      className="flex h-7 w-full items-center justify-between border-t border-[#1E3A5F] bg-[#071424] px-3 text-[11px] font-mono text-slate-400 select-none"
    >
      {/* Left: Execution Status */}
      <div className="flex items-center space-x-3">
        {executionState === 'idle' && (
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            <span>{t.statusReady}</span>
          </div>
        )}

        {executionState === 'running' && (
          <div className="flex items-center space-x-1.5 text-[#FFD43B]">
            <span className="h-2 w-2 rounded-full bg-[#FFD43B] animate-ping" />
            <span>{t.statusRunning}</span>
          </div>
        )}

        {executionState === 'success' && (
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <Check className="h-3 w-3" />
            <span>
              {t.statusSuccess} {executionTime !== null && `(${executionTime}s)`}
            </span>
          </div>
        )}

        {executionState === 'error' && (
          <div className="flex items-center space-x-1.5 text-rose-400">
            <AlertCircle className="h-3 w-3" />
            <span>
              {t.statusError} {errorLine !== null && `(${t.line} ${errorLine})`}
            </span>
          </div>
        )}

        {executionState === 'timeout' && (
          <div className="flex items-center space-x-1.5 text-amber-400">
            <Clock className="h-3 w-3" />
            <span>{t.statusTimeout}</span>
          </div>
        )}

        {executionState === 'cancelled' && (
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>{t.statusCancelled}</span>
          </div>
        )}
      </div>

      {/* Center: System & Security hint (Desktop) */}
      <div className="hidden md:flex items-center space-x-2 text-slate-500 font-sans text-[10px]">
        <ShieldCheck className="h-3 w-3 text-emerald-400/70" />
        <span>Sandboxed Execution Engine</span>
      </div>

      {/* Right: Editor Info */}
      <div className="flex items-center space-x-3">
        <span className="hidden sm:inline">
          {t.line} {cursorLine}, {t.column} {cursorCol}
        </span>
        <span className="hidden sm:inline">{t.spaces}</span>
        <span className="hidden sm:inline">{t.utf8}</span>
        <span className="rounded bg-[#0B2747] px-1.5 py-0.2 text-[10px] text-[#FFD43B] font-semibold">
          {t.pythonVersion}
        </span>
      </div>
    </div>
  );
};
