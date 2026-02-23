export default function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-panel-border bg-panel px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight text-white">
          Optimizer
        </h1>
        <div className="rounded bg-background px-2 py-1 text-xs text-foreground/80 border border-panel-border">
          Language: TypeScript
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-sm text-foreground/80">Ready</span>
        </div>
      </div>
    </header>
  );
}
