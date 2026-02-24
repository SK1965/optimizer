import Editor from "@monaco-editor/react";

interface EditorPanelProps {
  language: string;
  code: string;
  onChange: (value: string) => void;
}

export default function EditorPanel({ language, code, onChange }: EditorPanelProps) {
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-panel">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-panel-border px-4">
        <h2 className="text-sm font-medium text-foreground/90">Editor</h2>
        <div className="flex gap-2">
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            scrollbar: {
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
          loading={
            <div className="flex h-full items-center justify-center text-sm text-foreground/50">
              Loading editor...
            </div>
          }
        />
      </div>
    </div>
  );
}
