import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { AppLanguage } from '../types';
import { getLocale } from '../locales';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  language: AppLanguage;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  onConfirm,
  onCancel,
  language,
}) => {
  const t = getLocale(language);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
      <div
        id="ilmhub-confirm-dialog"
        className="w-full max-w-md rounded-2xl border border-[#1E3A5F] bg-[#071A2F] text-slate-100 p-5 shadow-2xl space-y-4"
      >
        <div className="flex items-start space-x-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isDestructive ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{message}</p>
          </div>

          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:bg-[#1E3A5F] hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1E3A5F]/60">
          <button
            onClick={onCancel}
            className="rounded-lg border border-[#1E3A5F] px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#1E3A5F] transition"
          >
            {cancelLabel || t.cancel}
          </button>

          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-xs font-bold shadow transition active:scale-95 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-[#FFD43B] hover:bg-amber-300 text-[#071A2F]'
            }`}
          >
            {confirmLabel || t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
