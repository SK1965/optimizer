import { SubmissionStatus } from "@/lib/api";

interface ResultPanelProps {
  result: SubmissionStatus | null;
  error: string | null;
  isSubmitting: boolean;
}

export default function ResultPanel({ result, error, isSubmitting }: ResultPanelProps) {
  const formatExecutionTime = (time: number | null) => {
    if (time === null) return null;
    if (time < 1) return "< 1ms";
    return `${time.toFixed(0)}ms`;
  };

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
            <p className="text-sm">Executing code...</p>
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">Status</h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium border ${
                  result.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  result.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                    result.status === 'completed' ? 'bg-emerald-500' :
                    result.status === 'failed' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}></span>
                  {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                </span>
                {result.execution_time !== null && (
                  <span className="text-xs text-foreground/50">
                    Time: {formatExecutionTime(result.execution_time)}
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
                <div>{result.estimated_complexity}</div>
              </div>
            )}

            {result.ai_explanation && (
              <div className="rounded-md border border-panel-border bg-panel flex flex-col max-h-[400px]">
                <div className="shrink-0 border-b border-panel-border px-4 py-3 bg-background/50">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-foreground/50">AI Analysis & Insights</h3>
                </div>
                <div className="overflow-y-auto p-4 text-sm leading-relaxed text-foreground/80 custom-scrollbar prose prose-invert prose-p:my-2 prose-pre:my-2 max-w-none prose-pre:bg-background/80 prose-pre:border prose-pre:border-panel-border">
                  <div className="whitespace-pre-wrap font-sans">{result.ai_explanation}</div>
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
