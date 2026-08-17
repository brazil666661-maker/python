import React, { useRef, useEffect } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import {
  FileCode,
  Plus,
  X,
  Edit2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { FileItem, ParsedPythonError, AppSettings, AppTheme } from '../types';

interface CodeEditorProps {
  files: FileItem[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onCodeChange: (newCode: string) => void;
  onNewFile: () => void;
  onRenameFile: (id: string) => void;
  onDeleteFile: (id: string) => void;
  error: ParsedPythonError | null;
  settings: AppSettings;
  theme: AppTheme;
  onCursorChange?: (line: number, column: number) => void;
  onRunShortcut?: () => void;
  onSaveShortcut?: () => void;
  onExplainSelection?: (selectedText: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCodeChange,
  onNewFile,
  onRenameFile,
  onDeleteFile,
  error,
  settings,
  theme,
  onCursorChange,
  onRunShortcut,
  onSaveShortcut,
  onExplainSelection,
}) => {
  const activeFile = files.find((f) => f.id === activeFileId) || files[0];
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  // Configure custom themes in Monaco
  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('ilmhub-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'FFD43B', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'E2E8F0' },
        { token: 'string', foreground: '6EE7B7' },
        { token: 'number', foreground: '93C5FD' },
        { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
        { token: 'type', foreground: '38BDF8' },
        { token: 'function', foreground: 'FDE047' },
      ],
      colors: {
        'editor.background': '#07111F',
        'editor.foreground': '#F8FAFC',
        'editorLineNumber.foreground': '#334155',
        'editorLineNumber.activeForeground': '#FFD43B',
        'editor.selectionBackground': '#1E3A5F80',
        'editor.lineHighlightBackground': '#0B274740',
        'editorCursor.foreground': '#FFD43B',
        'editorWhitespace.foreground': '#1E293B',
      },
    });

    monaco.editor.defineTheme('ilmhub-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'B45309', fontStyle: 'bold' },
        { token: 'identifier', foreground: '1E293B' },
        { token: 'string', foreground: '047857' },
        { token: 'number', foreground: '1D4ED8' },
        { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
        { token: 'function', foreground: '0284C7' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#0F172A',
        'editorLineNumber.foreground': '#94A3B8',
        'editorLineNumber.activeForeground': '#D97706',
        'editor.selectionBackground': '#E2E8F0',
        'editor.lineHighlightBackground': '#F1F5F9',
        'editorCursor.foreground': '#0284C7',
      },
    });
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor movement
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange(e.position.lineNumber, e.position.column);
      }
    });

    // Keyboard Shortcuts inside Monaco
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunShortcut) onRunShortcut();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSaveShortcut) onSaveShortcut();
    });

    // Context menu action: Explain with ILMHUB AI
    editor.addAction({
      id: 'ilmhub-explain-selection',
      label: '✨ Explain with ILMHUB AI',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyE],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: (ed) => {
        const selection = ed.getSelection();
        if (selection && !selection.isEmpty()) {
          const selectedText = ed.getModel()?.getValueInRange(selection);
          if (selectedText && onExplainSelection) {
            onExplainSelection(selectedText);
          }
        }
      },
    });
  };

  // Update Error Markers on Monaco Editor
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();
    if (!model) return;

    if (error && error.line > 0 && error.file === activeFile.name) {
      const lineNum = Math.min(Math.max(error.line, 1), model.getLineCount());
      const maxCol = model.getLineMaxColumn(lineNum);

      // Add Monaco Markers (squiggles)
      monaco.editor.setModelMarkers(model, 'ilmhub-error', [
        {
          startLineNumber: lineNum,
          startColumn: 1,
          endLineNumber: lineNum,
          endColumn: maxCol,
          message: `${error.type}: ${error.message}`,
          severity: monaco.MarkerSeverity.Error,
        },
      ]);

      // Add gutter decoration
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
        {
          range: new monaco.Range(lineNum, 1, lineNum, 1),
          options: {
            isWholeLine: true,
            className: 'bg-rose-500/15 border-l-2 border-rose-500',
            glyphMarginClassName: 'text-rose-400 font-bold',
            hoverMessage: { value: `**${error.type}**: ${error.message}\n\n_${error.simpleExplanation}_` },
          },
        },
      ]);

      // Gently reveal error line if not in view
      editor.revealLineInCenter(lineNum);
    } else {
      monaco.editor.setModelMarkers(model, 'ilmhub-error', []);
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  }, [error, activeFile]);

  const currentTheme = theme === 'dark' ? 'ilmhub-dark' : 'ilmhub-light';

  return (
    <div
      id="ilmhub-code-editor-container"
      className="flex flex-col h-full w-full bg-[#07111F] text-slate-100 overflow-hidden select-none"
    >
      {/* File Tabs Bar */}
      <div
        id="ilmhub-file-tabs"
        className="flex items-center justify-between border-b border-[#1E3A5F]/50 bg-[#071A2F]/90 px-2 h-10 overflow-x-auto no-scrollbar"
      >
        <div className="flex items-center space-x-1">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const hasFileError = error && error.file === file.name;

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center space-x-1.5 rounded-t-md px-3 py-1.5 text-xs font-mono transition cursor-pointer ${
                  isActive
                    ? 'bg-[#07111F] text-[#FFD43B] border-t-2 border-[#FFD43B] font-semibold'
                    : 'text-slate-400 hover:bg-[#0B2747] hover:text-slate-200'
                }`}
              >
                <FileCode className={`h-3.5 w-3.5 ${isActive ? 'text-[#FFD43B]' : 'text-slate-400'}`} />
                <span>{file.name}</span>

                {hasFileError && (
                  <AlertCircle className="h-3 w-3 text-rose-400 animate-bounce" title="Error in this file" />
                )}

                {/* File Action Icons */}
                <div className="flex items-center ml-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameFile(file.id);
                    }}
                    className="p-0.5 text-slate-400 hover:text-white rounded"
                    title="Rename"
                  >
                    <Edit2 className="h-2.5 w-2.5" />
                  </button>

                  {!file.isMain && files.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.id);
                      }}
                      className="p-0.5 text-slate-400 hover:text-rose-400 rounded"
                      title="Delete"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add New File Tab */}
          <button
            id="ilmhub-new-file-btn"
            onClick={onNewFile}
            className="flex items-center space-x-1 rounded-md p-1 text-slate-400 hover:bg-[#0B2747] hover:text-white transition"
            title="Create New File"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quick Context Hint */}
        <div className="hidden sm:flex items-center text-[11px] text-slate-400 space-x-3 pr-2 font-sans">
          <span className="flex items-center gap-1 text-amber-400/80">
            <Sparkles className="h-3 w-3" />
            <span>Right-click selection to Ask AI</span>
          </span>
          <span className="opacity-70 font-mono">Ctrl+Enter to Run</span>
        </div>
      </div>

      {/* Main Monaco Editor Body */}
      <div className="flex-1 w-full relative overflow-hidden">
        <Editor
          height="100%"
          width="100%"
          language="python"
          path={activeFile.name}
          value={activeFile.content}
          theme={currentTheme}
          beforeMount={handleBeforeMount}
          onMount={handleEditorMount}
          onChange={(value) => onCodeChange(value || '')}
          options={{
            fontSize: settings.fontSize || 14,
            fontFamily: settings.editorFont || "'Fira Code', 'JetBrains Mono', monospace",
            fontLigatures: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: settings.wordWrap ? 'on' : 'off',
            minimap: { enabled: settings.minimap },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            bracketPairColorization: { enabled: true },
            matchBrackets: 'always',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            glyphMargin: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
};
