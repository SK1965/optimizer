export default function ResultPanel() {
  return (
    <div className="flex h-full w-full flex-col bg-background border-l border-panel-border">
      <div className="flex h-10 items-center border-b border-panel-border px-4">
        <h2 className="text-sm font-medium text-foreground/90">Results</h2>
      </div>
      <div className="flex-1 p-4">
        <div className="h-full w-full rounded border border-dashed border-panel-border flex items-center justify-center text-foreground/50">
          Results & Output Placeholder
        </div>
      </div>
    </div>
  );
}
