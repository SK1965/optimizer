export default function EditorPanel() {
  return (
    <div className="flex h-full w-full flex-col bg-panel">
      <div className="flex h-10 items-center justify-between border-b border-panel-border px-4">
        <h2 className="text-sm font-medium text-foreground/90">Editor</h2>
        <div className="flex gap-2">
          {/* Action buttons placeholder */}
          <button className="rounded px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/10">
            Format
          </button>
          <button className="rounded bg-brand px-4 py-1 text-xs font-medium text-white transition-colors hover:bg-brand/90">
            Run
          </button>
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="h-full w-full rounded border border-dashed border-panel-border flex items-center justify-center text-foreground/50">
          Monaco Editor Placeholder
        </div>
      </div>
    </div>
  );
}
