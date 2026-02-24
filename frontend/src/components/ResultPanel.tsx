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

  const getTimeColor = (time: number) => {
    if (time < 50) return "text-emerald-400";
    if (time < 500) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="flex h-full w-full flex-col bg-background border-l border-panel-border overflow-hidden">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-panel-border px-4 bg-panel/50">
        <h2 className="text-xs font-semibold tracking-wider text-foreground/70 uppercase">Execution Results</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0c10]">
        {error ? (
          <div className="animate-in fade-in duration-300 rounded-md border border-red-500/20 bg-red-500/10 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-500">System Error</h3>
            <pre className="whitespace-pre-wrap font-mono text-xs text-red-400/90">{error}</pre>
          </div>
        ) : isSubmitting ? (
          <div className="flex h-full flex-col items-center justify-center text-foreground/40 space-y-4 animate-in fade-in duration-500">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute h-full w-full animate-spin rounded-full border-2 border-brand/20 border-t-brand"></div>
            </div>
            <p className="text-xs font-medium tracking-wide uppercase">Analyzing Code...</p>
          </div>
        ) : result ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Status Card */}
            <div className="rounded-md border border-panel-border bg-panel p-4">
              <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">Execution Status</h3>
              <div className="flex flex-wrap items-center gap-4">
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
                  <div className="flex items-center gap-1.5 rounded bg-background/50 px-2.5 py-0.5 text-xs border border-panel-border">
                    <span className="text-foreground/40">Time:</span>
                    <span className={`font-mono font-medium ${getTimeColor(result.execution_time)}`}>
                      {formatExecutionTime(result.execution_time)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message Card */}
            {result.error_message && (
              <div className="rounded-md border border-red-500/20 bg-[#1a0f14] p-4">
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-red-500/60">Runtime Output</h3>
                <div className="max-h-48 overflow-y-auto rounded bg-black/40 p-3 border border-red-500/10 custom-scrollbar">
                  <pre className="text-xs font-mono text-red-400 whitespace-pre-wrap leading-relaxed">
                    {result.error_message}
                  </pre>
                </div>
              </div>
            )}

            {/* Time Complexity Card */}
            {result.estimated_complexity && (
              <div className="rounded-md border border-panel-border bg-panel p-4">
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">Estimated Complexity</h3>
                <div className="inline-flex rounded bg-brand/10 px-3 py-1.5 text-sm font-mono text-brand border border-brand/20">
                  {result.estimated_complexity}
                </div>
              </div>
            )}

            {/* AI Analysis Card */}
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
          <div className="flex h-full flex-col items-center justify-center text-center text-foreground/30 animate-in fade-in duration-500">
            <svg className="mb-4 h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-sm font-medium">Ready for execution</p>
            <p className="text-xs mt-1">Write your code and click Run</p>
          </div>
        )}
      </div>
    </div>
  );
}
