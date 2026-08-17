import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  X,
  Check,
  Code,
  Terminal as TerminalIcon,
  Cpu,
  Sparkles,
  Sliders,
  PanelBottom,
  PanelRight,
  PanelLeft,
} from 'lucide-react';
import { AppSettings, AppLanguage, AppTheme } from '../types';
import { getLocale } from '../locales';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  language: AppLanguage;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  language,
}) => {
  const t = getLocale(language);
  const [activeTab, setActiveTab] = useState<'general' | 'editor' | 'terminal' | 'execution' | 'ai'>('general');
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const fontOptions = [
    "'Fira Code', monospace",
    "'JetBrains Mono', monospace",
    "'Source Code Pro', monospace",
    "'Courier New', monospace",
    "monospace",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div
        id="ilmhub-settings-modal"
        className="flex flex-col h-[520px] w-full max-w-2xl rounded-2xl border border-[#1E3A5F] bg-[#071A2F] text-slate-100 shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex h-14 items-center justify-between border-b border-[#1E3A5F] bg-[#0B2747] px-5 select-none">
          <div className="flex items-center space-x-2.5">
            <SettingsIcon className="h-5 w-5 text-[#FFD43B]" />
            <h2 className="text-sm font-bold text-white font-mono">{t.settingsModal.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-[#1E3A5F] hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content with Tabs */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-44 border-r border-[#1E3A5F] bg-[#051120] p-3 space-y-1 select-none">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                activeTab === 'general'
                  ? 'bg-[#1E3A5F] text-[#FFD43B] font-bold'
                  : 'text-slate-400 hover:bg-[#0B2747] hover:text-white'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>{t.settingsModal.generalTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                activeTab === 'editor'
                  ? 'bg-[#1E3A5F] text-[#FFD43B] font-bold'
                  : 'text-slate-400 hover:bg-[#0B2747] hover:text-white'
              }`}
            >
              <Code className="h-4 w-4" />
              <span>{t.settingsModal.editorTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                activeTab === 'terminal'
                  ? 'bg-[#1E3A5F] text-[#FFD43B] font-bold'
                  : 'text-slate-400 hover:bg-[#0B2747] hover:text-white'
              }`}
            >
              <TerminalIcon className="h-4 w-4" />
              <span>{t.settingsModal.terminalTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('execution')}
              className={`flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                activeTab === 'execution'
                  ? 'bg-[#1E3A5F] text-[#FFD43B] font-bold'
                  : 'text-slate-400 hover:bg-[#0B2747] hover:text-white'
              }`}
            >
              <Cpu className="h-4 w-4" />
              <span>{t.settingsModal.executionTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                activeTab === 'ai'
                  ? 'bg-[#1E3A5F] text-[#FFD43B] font-bold'
                  : 'text-slate-400 hover:bg-[#0B2747] hover:text-white'
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{t.settingsModal.aiTab}</span>
            </button>
          </div>

          {/* Tab Form Fields */}
          <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t.settingsModal.language}
                  </label>
                  <select
                    value={localSettings.language}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, language: e.target.value as AppLanguage })
                    }
                    className="w-full rounded-lg border border-[#1E3A5F] bg-[#07111F] p-2 text-slate-200 outline-none focus:border-[#FFD43B]"
                  >
                    <option value="en">English (EN)</option>
                    <option value="uz">O‘zbekcha (Lotin / UZ)</option>
                    <option value="ru">Русский (RU)</option>
                    <option value="uz-cyrl">Ўзбекча (Кирилл / ЎЗ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t.settingsModal.theme}
                  </label>
                  <select
                    value={localSettings.theme}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, theme: e.target.value as AppTheme })
                    }
                    className="w-full rounded-lg border border-[#1E3A5F] bg-[#07111F] p-2 text-slate-200 outline-none focus:border-[#FFD43B]"
                  >
                    <option value="dark">{t.settingsModal.themeDark}</option>
                    <option value="light">{t.settingsModal.themeLight}</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1E3A5F]/50">
                  <div>
                    <span className="font-semibold text-slate-200">{t.settingsModal.autosave}</span>
                    <p className="text-[11px] text-slate-400">Save code state in browser local storage</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.autosave}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, autosave: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-[#FFD43B]"
                  />
                </div>
              </div>
            )}

            {/* Editor Tab */}
            {activeTab === 'editor' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t.settingsModal.fontSize} ({localSettings.fontSize}px)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    step="1"
                    value={localSettings.fontSize}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, fontSize: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-[#FFD43B]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>10px</span>
                    <span>14px (Default)</span>
                    <span>24px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t.settingsModal.editorFont}
                  </label>
                  <select
                    value={localSettings.editorFont}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, editorFont: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#1E3A5F] bg-[#07111F] p-2 text-slate-200 outline-none focus:border-[#FFD43B] font-mono"
                  >
                    {fontOptions.map((f, idx) => (
                      <option key={idx} value={f}>
                        {f.split(',')[0].replace(/'/g, '')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1E3A5F]/50">
                  <div>
                    <span className="font-semibold text-slate-200">{t.settingsModal.wordWrap}</span>
                    <p className="text-[11px] text-slate-400">Wrap long lines to fit editor viewport</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.wordWrap}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, wordWrap: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-[#FFD43B]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1E3A5F]/50">
                  <div>
                    <span className="font-semibold text-slate-200">{t.settingsModal.minimap}</span>
                    <p className="text-[11px] text-slate-400">Display mini code preview on the right</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.minimap}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, minimap: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-[#FFD43B]"
                  />
                </div>
              </div>
            )}

            {/* Terminal Tab */}
            {activeTab === 'terminal' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    {t.settingsModal.terminalPosition || 'Terminal Position & Layout'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Left Split */}
                    <button
                      type="button"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, terminalPosition: 'left' })
                      }
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                        localSettings.terminalPosition === 'left'
                          ? 'border-[#FFD43B] bg-[#FFD43B]/10 text-white'
                          : 'border-[#1E3A5F] bg-[#07111F] text-slate-400 hover:border-slate-500 hover:text-white'
                      }`}
                    >
                      <PanelLeft className={`h-6 w-6 mb-1.5 ${localSettings.terminalPosition === 'left' ? 'text-[#FFD43B]' : 'text-slate-400'}`} />
                      <span className="font-semibold text-xs text-slate-200">{t.layoutLeftShort || 'Left Split'}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Terminal Left, Code Right</span>
                    </button>

                    {/* Bottom Split */}
                    <button
                      type="button"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, terminalPosition: 'bottom' })
                      }
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                        localSettings.terminalPosition === 'bottom'
                          ? 'border-[#FFD43B] bg-[#FFD43B]/10 text-white'
                          : 'border-[#1E3A5F] bg-[#07111F] text-slate-400 hover:border-slate-500 hover:text-white'
                      }`}
                    >
                      <PanelBottom className={`h-6 w-6 mb-1.5 ${localSettings.terminalPosition === 'bottom' ? 'text-[#FFD43B]' : 'text-slate-400'}`} />
                      <span className="font-semibold text-xs text-slate-200">{t.layoutBottomShort || 'Down (Bottom)'}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Code Top, Terminal Below</span>
                    </button>

                    {/* Right Split */}
                    <button
                      type="button"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, terminalPosition: 'right' })
                      }
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                        localSettings.terminalPosition === 'right'
                          ? 'border-[#FFD43B] bg-[#FFD43B]/10 text-white'
                          : 'border-[#1E3A5F] bg-[#07111F] text-slate-400 hover:border-slate-500 hover:text-white'
                      }`}
                    >
                      <PanelRight className={`h-6 w-6 mb-1.5 ${localSettings.terminalPosition === 'right' ? 'text-[#FFD43B]' : 'text-slate-400'}`} />
                      <span className="font-semibold text-xs text-slate-200">{t.layoutRightShort || 'Right Split'}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Code Left, Terminal Right</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E3A5F]/50">
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t.settingsModal.terminalFontSize} ({localSettings.terminalFontSize}px)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="20"
                    step="1"
                    value={localSettings.terminalFontSize}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        terminalFontSize: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-[#FFD43B]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1E3A5F]/50">
                  <div>
                    <span className="font-semibold text-slate-200">{t.settingsModal.clearOnRun}</span>
                    <p className="text-[11px] text-slate-400">Clear previous stdout before each execution</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.clearOnRun}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, clearOnRun: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-[#FFD43B]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1E3A5F]/50">
                  <div>
                    <span className="font-semibold text-slate-200">
                      {t.settingsModal.showTimestamps}
                    </span>
                    <p className="text-[11px] text-slate-400">Display timestamp markers next to logs</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.showTimestamps}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, showTimestamps: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-[#FFD43B]"
                  />
                </div>
              </div>
            )}

            {/* Execution Tab */}
            {activeTab === 'execution' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t.settingsModal.timeoutSeconds} ({localSettings.timeoutSeconds}s)
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    step="1"
                    value={localSettings.timeoutSeconds}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        timeoutSeconds: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-[#FFD43B]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Safeguard against infinite loops (e.g. while True). Max 30 seconds.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t.settingsModal.maxOutputSize} ({localSettings.maxOutputSizeKB} KB)
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2048"
                    step="100"
                    value={localSettings.maxOutputSizeKB}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        maxOutputSizeKB: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-[#FFD43B]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Maximum allowed terminal output buffer size.
                  </p>
                </div>
              </div>
            )}

            {/* AI Intelligence Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t.settingsModal.aiModel}
                  </label>
                  <select
                    value={localSettings.aiModel}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, aiModel: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#1E3A5F] bg-[#07111F] p-2 text-slate-200 outline-none focus:border-[#FFD43B]"
                  >
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Balanced & Smart)</option>
                    <option value="gemini-3.1-pro-preview">
                      gemini-3.1-pro-preview (Complex Tasks & Deep Reasoning)
                    </option>
                    <option value="gemini-3.1-flash-lite">
                      gemini-3.1-flash-lite (Ultra Fast)
                    </option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1E3A5F]/50">
                  <div>
                    <span className="font-semibold text-slate-200">
                      {t.settingsModal.aiThinking}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Enables ThinkingLevel.HIGH on Gemini 3.1 Pro for deeper debugging
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.aiThinking}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, aiThinking: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-[#FFD43B]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1E3A5F]/50">
                  <div>
                    <span className="font-semibold text-slate-200">
                      {t.settingsModal.aiSearchGrounding}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Ground AI with Google Search data for up-to-date Python libraries
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.aiSearchGrounding}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, aiSearchGrounding: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-[#FFD43B]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t.settingsModal.aiResponseLanguage}
                  </label>
                  <select
                    value={localSettings.aiResponseLanguage}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        aiResponseLanguage: e.target.value as AppLanguage,
                      })
                    }
                    className="w-full rounded-lg border border-[#1E3A5F] bg-[#07111F] p-2 text-slate-200 outline-none focus:border-[#FFD43B]"
                  >
                    <option value="en">English</option>
                    <option value="uz">O‘zbekcha</option>
                    <option value="ru">Русский</option>
                    <option value="uz-cyrl">Ўзбекча</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex h-14 items-center justify-end border-t border-[#1E3A5F] bg-[#0B2747] px-5 space-x-3 select-none">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#1E3A5F] px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#1E3A5F] transition"
          >
            {t.cancel}
          </button>

          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 rounded-lg bg-[#FFD43B] hover:bg-amber-300 px-5 py-2 text-xs font-bold text-[#071A2F] shadow transition active:scale-95"
          >
            <Check className="h-4 w-4" />
            <span>{t.settingsModal.saveSettings}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
