import React, { useState } from 'react';
import {
  Play,
  Square,
  Save,
  Download,
  Copy,
  Check,
  Trash2,
  Settings,
  BookOpen,
  Sparkles,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  Code2,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { AppLanguage, AppTheme, ExecutionState, TerminalPosition } from '../types';
import { getLocale } from '../locales';
import { PanelBottom, PanelRight, PanelLeft } from 'lucide-react';

interface HeaderProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  theme: AppTheme;
  onThemeToggle: () => void;
  executionState: ExecutionState;
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  lastSavedTime: string | null;
  onDownload: () => void;
  onCopy: () => void;
  isCopied: boolean;
  onClear: () => void;
  onOpenSettings: () => void;
  onOpenExamples: () => void;
  isAiOpen: boolean;
  onToggleAi: () => void;
  onOpenLanding?: () => void;
  currentFilename: string;
  terminalPosition?: TerminalPosition;
  onChangeTerminalPosition?: (pos: TerminalPosition) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  executionState,
  onRun,
  onStop,
  onSave,
  lastSavedTime,
  onDownload,
  onCopy,
  isCopied,
  onClear,
  onOpenSettings,
  onOpenExamples,
  isAiOpen,
  onToggleAi,
  onOpenLanding,
  currentFilename,
  terminalPosition = 'bottom',
  onChangeTerminalPosition,
}) => {
  const t = getLocale(language);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const isRunning = executionState === 'running';

  const languages: Array<{ code: AppLanguage; label: string; flag: string }> = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'uz', label: 'O‘zbekcha', flag: 'UZ' },
    { code: 'ru', label: 'Русский', flag: 'RU' },
    { code: 'uz-cyrl', label: 'Ўзбекча', flag: 'ЎЗ' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <header
      id="ilmhub-header"
      className="sticky top-0 z-40 w-full border-b border-[#1E3A5F]/60 bg-[#071A2F] text-white shadow-md select-none transition-colors"
    >
      <div className="flex h-14 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left Section: Logo & Breadcrumbs */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div
            id="ilmhub-logo-btn"
            onClick={onOpenLanding}
            className="flex cursor-pointer items-center space-x-2 rounded-lg py-1 px-1.5 transition hover:opacity-90"
            title="ILMHUB Home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B2747] border border-[#FFD43B]/40 shadow-inner">
              <Code2 className="h-5 w-5 text-[#FFD43B]" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-black tracking-tight text-white font-mono">ILM</span>
              <span className="text-xl font-black tracking-tight text-[#FFD43B] font-mono">HUB</span>
            </div>
          </div>

          {/* Active File indicator (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 border-l border-[#1E3A5F] pl-3">
            <span className="rounded bg-[#0B2747] px-2 py-0.5 font-mono text-slate-300 border border-[#1E3A5F]">
              {currentFilename}
            </span>
            {lastSavedTime && (
              <span className="text-[11px] text-emerald-400/90 flex items-center gap-1">
                <Check className="h-3 w-3" />
                {t.saved} {lastSavedTime}
              </span>
            )}
          </div>
        </div>

        {/* Center / Action Section: Run, Stop, Save, Download, Copy */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Main Run Button */}
          {!isRunning ? (
            <button
              id="ilmhub-run-button"
              onClick={onRun}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-bold shadow-lg transition-all active:scale-95 ${
                executionState === 'error'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-[#FFD43B] hover:bg-[#ffe066] text-[#071A2F]'
              }`}
              title="Run Python Code (Ctrl+Enter)"
            >
              <Play className="h-4 w-4 fill-current" />
              <span className="tracking-wide">
                {executionState === 'error' ? t.statusError : t.run}
              </span>
            </button>
          ) : (
            <button
              id="ilmhub-stop-button"
              onClick={onStop}
              className="flex items-center space-x-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-rose-500 active:scale-95 animate-pulse"
              title="Stop Python Execution"
            >
              <Square className="h-4 w-4 fill-current" />
              <span>{t.stop}</span>
            </button>
          )}

          {/* Examples Modal Button */}
          <button
            id="ilmhub-examples-btn"
            onClick={onOpenExamples}
            className="hidden sm:flex items-center space-x-1.5 rounded-lg border border-[#1E3A5F] bg-[#0B2747] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#133863] hover:text-white transition"
            title="Load Python Example Code"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#FFD43B]" />
            <span>{t.examples}</span>
          </button>

          {/* Quick File Actions (Desktop) */}
          <div className="hidden md:flex items-center space-x-1 border-l border-r border-[#1E3A5F] px-1.5 mx-1">
            <button
              id="ilmhub-save-btn"
              onClick={onSave}
              className="flex items-center space-x-1 rounded-md px-2.5 py-1.5 text-xs text-slate-300 hover:bg-[#0B2747] hover:text-white transition"
              title="Save (Ctrl+S)"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{t.save}</span>
            </button>

            <button
              id="ilmhub-copy-btn"
              onClick={onCopy}
              className="flex items-center space-x-1 rounded-md px-2.5 py-1.5 text-xs text-slate-300 hover:bg-[#0B2747] hover:text-white transition"
              title="Copy Code to Clipboard"
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{t.copy}</span>
                </>
              )}
            </button>

            <button
              id="ilmhub-download-btn"
              onClick={onDownload}
              className="flex items-center space-x-1 rounded-md px-2.5 py-1.5 text-xs text-slate-300 hover:bg-[#0B2747] hover:text-white transition"
              title="Download .py file"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{t.download}</span>
            </button>

            <button
              id="ilmhub-clear-btn"
              onClick={onClear}
              className="flex items-center space-x-1 rounded-md px-2.5 py-1.5 text-xs text-slate-300 hover:bg-rose-950/40 hover:text-rose-300 transition"
              title="Clear Editor"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{t.clear}</span>
            </button>
          </div>

          {/* Terminal Layout Selector (Desktop) */}
          {onChangeTerminalPosition && (
            <div className="hidden xl:flex items-center space-x-0.5 bg-[#051120] p-1 rounded-lg border border-[#1E3A5F]">
              <span className="text-[10px] text-slate-400 font-mono px-1.5 uppercase tracking-wider select-none font-bold">
                {t.layout || 'Layout'}
              </span>
              <button
                onClick={() => onChangeTerminalPosition('left')}
                className={`flex items-center space-x-1 rounded px-2 py-1 text-xs transition ${
                  terminalPosition === 'left'
                    ? 'bg-[#1E3A5F] text-[#FFD43B] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#0B2747]'
                }`}
                title={t.layoutLeft}
              >
                <PanelLeft className="h-3.5 w-3.5" />
                <span className="text-[11px]">{t.layoutLeftShort || 'Left'}</span>
              </button>
              <button
                onClick={() => onChangeTerminalPosition('bottom')}
                className={`flex items-center space-x-1 rounded px-2 py-1 text-xs transition ${
                  terminalPosition === 'bottom'
                    ? 'bg-[#1E3A5F] text-[#FFD43B] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#0B2747]'
                }`}
                title={t.layoutBottom}
              >
                <PanelBottom className="h-3.5 w-3.5" />
                <span className="text-[11px]">{t.layoutBottomShort || 'Down'}</span>
              </button>
              <button
                onClick={() => onChangeTerminalPosition('right')}
                className={`flex items-center space-x-1 rounded px-2 py-1 text-xs transition ${
                  terminalPosition === 'right'
                    ? 'bg-[#1E3A5F] text-[#FFD43B] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#0B2747]'
                }`}
                title={t.layoutRight}
              >
                <PanelRight className="h-3.5 w-3.5" />
                <span className="text-[11px]">{t.layoutRightShort || 'Right'}</span>
              </button>
            </div>
          )}

          {/* AI Toggle Button */}
          <button
            id="ilmhub-ai-toggle-btn"
            onClick={onToggleAi}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition shadow-sm ${
              isAiOpen
                ? 'bg-gradient-to-r from-amber-400 to-[#FFD43B] text-[#071A2F] ring-2 ring-[#FFD43B]/40'
                : 'border border-[#FFD43B]/40 bg-[#0B2747] text-[#FFD43B] hover:bg-[#133863]'
            }`}
            title="Toggle Gemini AI Assistant"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI {t.aiAssistant}</span>
            <span className="sm:hidden">AI</span>
          </button>
        </div>

        {/* Right Section: Language, Theme, Settings, Mobile Menu */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              id="ilmhub-lang-selector"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center space-x-1 rounded-lg border border-[#1E3A5F] bg-[#0B2747] px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-[#133863] transition"
              title="Change Language"
            >
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentLangObj.flag}</span>
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 rounded-lg border border-[#1E3A5F] bg-[#0B2747] py-1 shadow-xl z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onLanguageChange(l.code);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-xs text-left transition ${
                      language === l.code
                        ? 'bg-[#133863] text-[#FFD43B] font-bold'
                        : 'text-slate-300 hover:bg-[#1E3A5F] hover:text-white'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-[10px] font-mono opacity-70">{l.flag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            id="ilmhub-theme-toggle"
            onClick={onThemeToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E3A5F] bg-[#0B2747] text-slate-300 hover:bg-[#133863] hover:text-white transition"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-[#FFD43B]" />
            ) : (
              <Moon className="h-4 w-4 text-slate-200" />
            )}
          </button>

          {/* Settings Modal Button */}
          <button
            id="ilmhub-settings-btn"
            onClick={onOpenSettings}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E3A5F] bg-[#0B2747] text-slate-300 hover:bg-[#133863] hover:text-white transition"
            title={t.settings}
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Mobile Menu Button */}
          <button
            id="ilmhub-mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg border border-[#1E3A5F] bg-[#0B2747] text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#1E3A5F] bg-[#071A2F] px-4 py-3 space-y-3">
          {onChangeTerminalPosition && (
            <div className="rounded-lg border border-[#1E3A5F] bg-[#0B2747] p-2">
              <span className="text-[11px] font-semibold text-slate-300 block mb-1.5 font-mono">
                {t.layout || 'Terminal Layout'}:
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => {
                    onChangeTerminalPosition('left');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center space-x-1 rounded p-2 text-xs ${
                    terminalPosition === 'left'
                      ? 'bg-[#FFD43B] text-[#071A2F] font-bold'
                      : 'bg-[#071A2F] text-slate-300'
                  }`}
                >
                  <PanelLeft className="h-3.5 w-3.5" />
                  <span>{t.layoutLeftShort || 'Left'}</span>
                </button>
                <button
                  onClick={() => {
                    onChangeTerminalPosition('bottom');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center space-x-1 rounded p-2 text-xs ${
                    terminalPosition === 'bottom'
                      ? 'bg-[#FFD43B] text-[#071A2F] font-bold'
                      : 'bg-[#071A2F] text-slate-300'
                  }`}
                >
                  <PanelBottom className="h-3.5 w-3.5" />
                  <span>{t.layoutBottomShort || 'Down'}</span>
                </button>
                <button
                  onClick={() => {
                    onChangeTerminalPosition('right');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center space-x-1 rounded p-2 text-xs ${
                    terminalPosition === 'right'
                      ? 'bg-[#FFD43B] text-[#071A2F] font-bold'
                      : 'bg-[#071A2F] text-slate-300'
                  }`}
                >
                  <PanelRight className="h-3.5 w-3.5" />
                  <span>{t.layoutRightShort || 'Right'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenExamples();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 rounded-lg border border-[#1E3A5F] bg-[#0B2747] p-2.5 text-xs text-slate-200"
            >
              <BookOpen className="h-4 w-4 text-[#FFD43B]" />
              <span>{t.examples}</span>
            </button>

            <button
              onClick={() => {
                onSave();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 rounded-lg border border-[#1E3A5F] bg-[#0B2747] p-2.5 text-xs text-slate-200"
            >
              <Save className="h-4 w-4 text-emerald-400" />
              <span>{t.save}</span>
            </button>

            <button
              onClick={() => {
                onDownload();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 rounded-lg border border-[#1E3A5F] bg-[#0B2747] p-2.5 text-xs text-slate-200"
            >
              <Download className="h-4 w-4 text-sky-400" />
              <span>{t.download}</span>
            </button>

            <button
              onClick={() => {
                onCopy();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 rounded-lg border border-[#1E3A5F] bg-[#0B2747] p-2.5 text-xs text-slate-200"
            >
              <Copy className="h-4 w-4 text-purple-400" />
              <span>{t.copy}</span>
            </button>

            <button
              onClick={() => {
                onClear();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 rounded-lg border border-rose-900/50 bg-rose-950/30 p-2.5 text-xs text-rose-300"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t.clear}</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 rounded-lg border border-[#1E3A5F] bg-[#0B2747] p-2.5 text-xs text-slate-200"
            >
              <Settings className="h-4 w-4 text-slate-300" />
              <span>{t.settings}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
