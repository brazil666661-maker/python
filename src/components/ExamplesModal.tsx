import React, { useState } from 'react';
import { BookOpen, X, Play, Code2, AlertTriangle, ArrowRight } from 'lucide-react';
import { PYTHON_EXAMPLES } from '../data/examples';
import { CodeExample, AppLanguage } from '../types';
import { getLocale } from '../locales';

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (example: CodeExample) => void;
  language: AppLanguage;
}

export const ExamplesModal: React.FC<ExamplesModalProps> = ({
  isOpen,
  onClose,
  onSelectExample,
  language,
}) => {
  const t = getLocale(language);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewExample, setPreviewExample] = useState<CodeExample>(PYTHON_EXAMPLES[0]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: t.examplesModal.all },
    { id: 'basics', label: t.examplesModal.basics },
    { id: 'algorithms', label: t.examplesModal.algorithms },
    { id: 'data', label: t.examplesModal.data },
    { id: 'errors', label: t.examplesModal.errors },
  ];

  const filteredExamples =
    selectedCategory === 'all'
      ? PYTHON_EXAMPLES
      : PYTHON_EXAMPLES.filter((ex) => ex.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
      <div
        id="ilmhub-examples-modal"
        className="flex flex-col h-[560px] w-full max-w-4xl rounded-2xl border border-[#1E3A5F] bg-[#071A2F] text-slate-100 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-[#1E3A5F] bg-[#0B2747] px-6 select-none">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="h-5 w-5 text-[#FFD43B]" />
            <div>
              <h2 className="text-sm font-bold text-white font-mono">{t.examplesModal.title}</h2>
              <p className="text-[11px] text-slate-400">{t.examplesModal.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-[#1E3A5F] hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-2 border-b border-[#1E3A5F]/70 bg-[#051120] px-6 py-2 select-none overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-[#FFD43B] text-[#071A2F] shadow'
                  : 'text-slate-400 hover:bg-[#0B2747] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content: List + Code Preview */}
        <div className="grid grid-cols-1 md:grid-cols-5 flex-1 overflow-hidden">
          {/* Example List */}
          <div className="md:col-span-2 border-r border-[#1E3A5F] overflow-y-auto p-3 space-y-2 bg-[#071424]">
            {filteredExamples.map((ex) => {
              const isSelected = previewExample.id === ex.id;
              return (
                <div
                  key={ex.id}
                  onClick={() => setPreviewExample(ex)}
                  className={`rounded-xl p-3 border transition cursor-pointer ${
                    isSelected
                      ? 'border-[#FFD43B] bg-[#0B2747] shadow-md'
                      : 'border-[#1E3A5F]/60 bg-[#071A2F]/80 hover:bg-[#0B2747]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{ex.title}</span>
                    {ex.hasError && (
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] text-rose-300 flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" /> Error Demo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{ex.description}</p>
                </div>
              );
            })}
          </div>

          {/* Code Preview */}
          <div className="md:col-span-3 flex flex-col h-full bg-[#050B14] p-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-2 mb-2 select-none">
              <div>
                <span className="text-xs font-bold text-[#FFD43B] font-mono">{previewExample.title}</span>
                <p className="text-[10px] text-slate-400">{previewExample.description}</p>
              </div>

              <button
                id="ilmhub-load-example-btn"
                onClick={() => {
                  onSelectExample(previewExample);
                  onClose();
                }}
                className="flex items-center space-x-1.5 rounded-lg bg-[#FFD43B] hover:bg-amber-300 px-3.5 py-1.5 text-xs font-bold text-[#071A2F] shadow transition active:scale-95"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{t.examplesModal.loadExample}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-lg bg-[#07111F] p-3 text-xs font-mono text-slate-200 border border-[#1E3A5F] scrollbar-thin">
              <pre className="whitespace-pre-wrap">{previewExample.code}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
