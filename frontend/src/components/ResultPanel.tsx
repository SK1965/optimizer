import { SubmissionStatus } from "@/lib/api";

interface ResultPanelProps {
  result: SubmissionStatus | null;
  error: string | null;
  isSubmitting: boolean;
}

export default function ResultPanel({ result, error, isSubmitting }: ResultPanelProps) {
  return (
    <div className="flex h-full w-full flex-col bg-background border-l border-panel-border">
      <div className="flex h-10 items-center border-b border-panel-border px-4">
        <h2 className="text-sm font-medium text-foreground/90">Results</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {error ? (
          <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            <h3 className="mb-2 font-semibold">Error</h3>
            <pre className="whitespace-pre-wrap font-mono uppercase text-xs">{error}</pre>
          </div>
        ) : isSubmitting ? (
          <div className="flex h-full flex-col items-center justify-center text-foreground/50 space-y-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent"></div>
            <p className="text-sm">Executing code...</p>
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">Status</h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  result.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                  result.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                  'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {result.status}
                </span>
                {result.execution_time && (
                  <span className="text-xs text-foreground/50">
                    {result.execution_time}ms
                  </span>
                )}
              </div>
            </div>

            {result.error_message && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-500/70">Execution Error</h3>
                <pre className="rounded bg-panel p-3 text-xs font-mono text-red-400 overflow-x-auto border border-panel-border">
                  {result.error_message}
                </pre>
              </div>
            )}

            {result.estimated_complexity && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">Time Complexity</h3>
                <div className="rounded bg-panel p-3 text-sm font-mono text-brand border border-panel-border">
                  {result.estimated_complexity}
                </div>
              </div>
            )}

            {result.ai_explanation && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">AI Analysis</h3>
                <div className="prose prose-invert max-w-none text-sm leading-relaxed text-foreground/80">
                  <p className="whitespace-pre-wrap">{result.ai_explanation}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-foreground/50">
            Click &quot;Run Code&quot; to see results
          </div>
        )}
      </div>
    </div>
  );
}
