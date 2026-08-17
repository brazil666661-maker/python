import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  AlertTriangle,
  Copy,
  Trash2,
  Maximize2,
  Minimize2,
  Check,
  CornerDownLeft,
  XCircle,
  Sparkles,
  PanelBottom,
  PanelRight,
  PanelLeft,
  Columns,
  Rows,
} from 'lucide-react';
import {
  TerminalEntry,
  ExecutionResponse,
  ExecutionState,
  ParsedPythonError,
  AppSettings,
  AppLanguage,
  TerminalPosition,
} from '../types';
import { getLocale } from '../locales';

interface TerminalProps {
  entries: TerminalEntry[];
  lastResult: ExecutionResponse | null;
  executionState: ExecutionState;
  onClear: () => void;
  onCopy: () => void;
  isCopied: boolean;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  error: ParsedPythonError | null;
  onSelectErrorLine?: (line: number) => void;
  onFixWithAi?: () => void;
  onSendStdin?: (input: string) => void;
  settings: AppSettings;
  language: AppLanguage;
  position?: TerminalPosition;
  onChangePosition?: (pos: TerminalPosition) => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  entries,
  lastResult,
  executionState,
  onClear,
  onCopy,
  isCopied,
  isMaximized,
  onToggleMaximize,
  isMinimized,
  onToggleMinimize,
  error,
  onSelectErrorLine,
  onFixWithAi,
  onSendStdin,
  settings,
  language,
  position = 'bottom',
  onChangePosition,
}) => {
  const t = getLocale(language);
  const [activeTab, setActiveTab] = useState<'terminal' | 'problems'>('terminal');
  const [stdinInput, setStdinInput] = useState('');
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current && !isMinimized) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries, lastResult, executionState, isMinimized]);

  const handleStdinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stdinInput.trim()) return;
    if (onSendStdin) {
      onSendStdin(stdinInput);
    }
    setStdinInput('');
  };

  const isRunning = executionState === 'running';
  const problemCount = error ? 1 : 0;

  // Minimized state when in Bottom mode
  if (isMinimized && position === 'bottom') {
    return (
      <div
        id="ilmhub-terminal-minimized-bottom"
        onClick={onToggleMinimize}
        className="flex h-8 w-full cursor-pointer items-center justify-between border-t border-[#1E3A5F] bg-[#050B14] px-4 text-xs font-mono text-slate-400 hover:text-white transition select-none z-20 shrink-0"
      >
        <div className="flex items-center space-x-2">
          <TerminalIcon className="h-3.5 w-3.5 text-[#FFD43B]" />
          <span className="font-semibold text-slate-300">{t.terminal}</span>
          {problemCount > 0 && (
            <span className="flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-400 font-sans">
              <AlertTriangle className="h-3 w-3" />
              {problemCount} {t.problems}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-slate-400 hover:text-[#FFD43B]">
          <span>{t.restore}</span>
          <Maximize2 className="h-3 w-3" />
        </div>
      </div>
    );
  }

  // Minimized state when in Left or Right split mode
  if (isMinimized && (position === 'left' || position === 'right')) {
    return (
      <div
        id={`ilmhub-terminal-minimized-${position}`}
        onClick={onToggleMinimize}
        className={`flex h-full w-9 cursor-pointer flex-col items-center justify-between bg-[#050B14] py-3 text-xs font-mono text-slate-400 hover:text-white transition select-none z-20 shrink-0 ${
          position === 'left' ? 'border-r border-[#1E3A5F]' : 'border-l border-[#1E3A5F]'
        }`}
        title={`${t.restore} ${t.terminal}`}
      >
        <div className="flex flex-col items-center space-y-3">
          <TerminalIcon className="h-4 w-4 text-[#FFD43B]" />
          {problemCount > 0 && (
            <span className="rounded-full bg-rose-500/30 p-1 text-[9px] font-bold text-rose-400" title={`${problemCount} ${t.problems}`}>
              !
            </span>
          )}
          <span className="rotate-90 tracking-wider font-semibold text-slate-300 text-[11px] whitespace-nowrap mt-4">
            {t.terminal}
          </span>
        </div>
        <div className="flex flex-col items-center space-y-2 text-slate-500 hover:text-[#FFD43B]">
          <Maximize2 className="h-3.5 w-3.5" />
        </div>
      </div>
    );
  }

  const borderClass =
    position === 'bottom'
      ? 'border-t border-[#1E3A5F]'
      : position === 'left'
      ? 'border-r border-[#1E3A5F]'
      : 'border-l border-[#1E3A5F]';

  return (
    <div
      id="ilmhub-terminal-container"
      className={`flex flex-col bg-[#050B14] text-slate-200 select-text font-mono overflow-hidden ${borderClass} ${
        isMaximized
          ? 'absolute inset-0 z-40 w-full h-full'
          : position === 'bottom'
          ? 'w-full'
          : 'h-full shrink-0'
      }`}
    >
      {/* Terminal Tab Header */}
      <div className="flex h-9 items-center justify-between border-b border-[#1E3A5F]/80 bg-[#071424] px-3 select-none shrink-0">
        {/* Left Tabs */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center space-x-1.5 rounded-t-md px-2.5 sm:px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'terminal'
                ? 'bg-[#050B14] text-[#FFD43B] border-t-2 border-[#FFD43B] font-semibold'
                : 'text-slate-400 hover:bg-[#0B2747] hover:text-slate-200'
            }`}
          >
            <TerminalIcon className="h-3.5 w-3.5" />
            <span>{t.terminal}</span>
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center space-x-1.5 rounded-t-md px-2.5 sm:px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'problems'
                ? 'bg-[#050B14] text-[#FFD43B] border-t-2 border-[#FFD43B] font-semibold'
                : 'text-slate-400 hover:bg-[#0B2747] hover:text-slate-200'
            }`}
          >
            <AlertTriangle className={`h-3.5 w-3.5 ${problemCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
            <span>{t.problems}</span>
            {problemCount > 0 && (
              <span className="rounded-full bg-rose-500/30 px-1.5 py-0.2 text-[10px] font-bold text-rose-400">
                {problemCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Actions & Layout Switcher */}
        <div className="flex items-center space-x-1 text-slate-400">
          {/* Layout Quick Selector */}
          {onChangePosition && (
            <div className="flex items-center bg-[#050B14] p-0.5 rounded border border-[#1E3A5F] mr-1 space-x-0.5">
              <button
                onClick={() => onChangePosition('left')}
                className={`p-1 rounded transition text-xs flex items-center ${
                  position === 'left'
                    ? 'bg-[#1E3A5F] text-[#FFD43B] font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-[#0B2747]'
                }`}
                title={t.layoutLeft || 'Split Left'}
              >
                <PanelLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onChangePosition('bottom')}
                className={`p-1 rounded transition text-xs flex items-center ${
                  position === 'bottom'
                    ? 'bg-[#1E3A5F] text-[#FFD43B] font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-[#0B2747]'
                }`}
                title={t.layoutBottom || 'Bottom Terminal'}
              >
                <PanelBottom className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onChangePosition('right')}
                className={`p-1 rounded transition text-xs flex items-center ${
                  position === 'right'
                    ? 'bg-[#1E3A5F] text-[#FFD43B] font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-[#0B2747]'
                }`}
                title={t.layoutRight || 'Split Right'}
              >
                <PanelRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Copy Output Button */}
          <button
            onClick={onCopy}
            className="flex items-center space-x-1 rounded p-1 text-xs hover:bg-[#0B2747] hover:text-slate-200 transition"
            title={t.copyOutput}
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          {/* Clear Terminal Button */}
          <button
            onClick={onClear}
            className="flex items-center space-x-1 rounded p-1 text-xs hover:bg-[#0B2747] hover:text-slate-200 transition"
            title={t.clearTerminal}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          {/* Maximize / Restore Button */}
          <button
            onClick={onToggleMaximize}
            className="flex items-center rounded p-1 text-xs hover:bg-[#0B2747] hover:text-slate-200 transition"
            title={isMaximized ? t.restore : t.maximize}
          >
            {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Minimize Button */}
          <button
            onClick={onToggleMinimize}
            className="flex items-center rounded p-1 text-xs hover:bg-[#0B2747] hover:text-slate-200 transition"
            title={t.minimize}
          >
            <Minimize2 className="h-3.5 w-3.5 rotate-90" />
          </button>
        </div>
      </div>

      {/* Terminal Tab Body */}
      {activeTab === 'terminal' ? (
        <div
          className="flex-1 overflow-y-auto p-3 text-xs leading-relaxed font-mono space-y-1 select-text scrollbar-thin min-h-0"
          style={{ fontSize: `${settings.terminalFontSize || 13}px` }}
        >
          {entries.length === 0 && !isRunning && !lastResult ? (
            <div className="text-slate-500 whitespace-pre-wrap py-2 font-mono">
              {t.emptyTerminal}
            </div>
          ) : (
            <>
              {entries.map((entry) => {
                let colorClass = 'text-slate-200';
                if (entry.type === 'command') colorClass = 'text-[#FFD43B] font-semibold';
                if (entry.type === 'stderr' || entry.type === 'error') colorClass = 'text-rose-400 font-mono';
                if (entry.type === 'success') colorClass = 'text-emerald-400 font-semibold';
                if (entry.type === 'system') colorClass = 'text-sky-400/90';

                return (
                  <div key={entry.id} className="flex items-start space-x-2">
                    {settings.showTimestamps && entry.timestamp && (
                      <span className="text-[10px] text-slate-600 select-none shrink-0 font-sans">
                        [{entry.timestamp}]
                      </span>
                    )}
                    <div className={`whitespace-pre-wrap break-all ${colorClass}`}>
                      {entry.text}
                    </div>
                  </div>
                );
              })}

              {/* Running indicator */}
              {isRunning && (
                <div className="flex items-center space-x-2 text-amber-300 py-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="font-sans text-xs">{t.statusRunning}</span>
                </div>
              )}
            </>
          )}
          <div ref={terminalEndRef} />
        </div>
      ) : (
        /* Problems Tab Body */
        <div className="flex-1 overflow-y-auto p-4 text-xs min-h-0">
          {error ? (
            <div className="space-y-3 font-sans">
              <div
                onClick={() => onSelectErrorLine && onSelectErrorLine(error.line)}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 hover:bg-rose-950/30 transition cursor-pointer"
              >
                <div className="flex items-start space-x-2.5">
                  <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-rose-400 font-mono">{error.type}</span>
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-300 font-mono">
                        {error.file}:{error.line}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-300 text-xs">{error.message}</p>
                    <p className="mt-1.5 text-slate-400 text-[11px] italic">
                      💡 {error.simpleExplanation}
                    </p>
                  </div>
                </div>

                {onFixWithAi && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFixWithAi();
                    }}
                    className="flex items-center space-x-1 rounded-md bg-[#FFD43B] px-2.5 py-1 text-xs font-bold text-[#071A2F] hover:bg-amber-300 transition shadow shrink-0"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{t.fixWithAi}</span>
                  </button>
                )}
              </div>

              {/* Source Line preview */}
              {error.source && (
                <div className="rounded-md bg-[#07111F] p-2 font-mono text-[11px] border border-[#1E3A5F]">
                  <span className="text-slate-500 mr-2">{error.line} |</span>
                  <span className="text-rose-300 underline decoration-rose-500 decoration-wavy">
                    {error.source}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-1.5 py-8">
              <Check className="h-6 w-6 text-emerald-400/70" />
              <p>{t.noProblems}</p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Stdin Row */}
      {activeTab === 'terminal' && (
        <form
          onSubmit={handleStdinSubmit}
          className="flex items-center border-t border-[#1E3A5F]/60 bg-[#071424] px-3 py-1.5 shrink-0"
        >
          <span className="text-[#FFD43B] mr-2 font-bold font-mono">$</span>
          <input
            type="text"
            value={stdinInput}
            onChange={(e) => setStdinInput(e.target.value)}
            placeholder="Type standard input (stdin) and press Enter..."
            className="flex-1 bg-transparent text-xs font-mono text-slate-200 outline-none placeholder:text-slate-600"
          />
          <button
            type="submit"
            className="text-slate-400 hover:text-[#FFD43B] transition p-1"
            title="Send Input"
          >
            <CornerDownLeft className="h-3.5 w-3.5" />
          </button>
        </form>
      )}
    </div>
  );
};
