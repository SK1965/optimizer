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
              <div className="rounded-md border border-panel-border bg-panel flex flex-col mt-6">
                <div className="shrink-0 border-b border-panel-border px-4 py-3 bg-background/50 flex items-center justify-between">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">AI Analysis & Insights</h3>
                  <div className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                </div>
                <div className="p-5 overflow-y-auto max-h-[600px] custom-scrollbar space-y-6 text-sm">
                  {(() => {
                    try {
                      const data = JSON.parse(result.ai_explanation);
                      return (
                        <div className="space-y-6 animate-in fade-in duration-500">
                          {/* Complexities */}
                          <div className="grid gap-4">
                            <div className="rounded-md bg-[#0a0c10] border border-panel-border/60 p-4">
                              <h4 className="text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wide">Time Complexity</h4>
                              <div className="text-lg font-mono text-cyan-400 mb-2">{data.time_complexity}</div>
                              <p className="text-xs text-foreground/70 leading-relaxed">{data.time_complexity_explanation}</p>
                            </div>
                            <div className="rounded-md bg-[#0a0c10] border border-panel-border/60 p-4">
                              <h4 className="text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wide">Space Complexity</h4>
                              <div className="text-lg font-mono text-purple-400 mb-2">{data.space_complexity}</div>
                              <p className="text-xs text-foreground/70 leading-relaxed">{data.space_complexity_explanation}</p>
                            </div>
                          </div>

                          {/* Analysis */}
                          <div className="rounded-md bg-[#0a0c10] border border-panel-border/60 p-4 space-y-4">
                            <div>
                              <h4 className="flex items-center gap-2 text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wide">
                                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                Growth Ratio Analysis
                              </h4>
                              <p className="text-xs text-foreground/80 leading-relaxed">{data.growth_ratio_analysis}</p>
                            </div>
                            <div className="pt-4 border-t border-panel-border/30">
                              <h4 className="flex items-center gap-2 text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wide">
                                <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Current Bottleneck
                              </h4>
                              <p className="text-xs text-foreground/80 leading-relaxed">{data.optimization_stage}</p>
                            </div>
                          </div>

                          {/* Suggested Optimizations */}
                          {data.optimization_suggestions && data.optimization_suggestions.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-foreground/50 mb-3 uppercase tracking-wide pl-1">Optimization Strategies</h4>
                              <div className="space-y-3">
                                {data.optimization_suggestions.map((opt: any, i: number) => (
                                  <div key={i} className="rounded-md bg-[#0a0c10] border border-emerald-500/20 p-4 hover:border-emerald-500/40 transition-colors">
                                    <h5 className="text-emerald-400 font-medium text-sm mb-1.5 flex items-center gap-2">
                                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-[10px]">{i + 1}</span>
                                      {opt.technique}
                                    </h5>
                                    <p className="text-xs text-foreground/70 leading-relaxed mb-3 pl-7">{opt.reason}</p>
                                    <div className="ml-7 rounded bg-emerald-500/5 px-3 py-2 border border-emerald-500/10 border-l-2 border-l-emerald-500">
                                      <p className="text-[11px] font-medium text-emerald-400/90 leading-relaxed">{opt.expected_improvement}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Risk Analysis */}
                          {data.risk_analysis && data.risk_analysis.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-foreground/50 mb-3 uppercase tracking-wide pl-1">Risk Profile</h4>
                              <ul className="space-y-2 rounded-md bg-[#0a0c10] border border-red-500/10 p-4">
                                {data.risk_analysis.map((risk: string, i: number) => (
                                  <li key={i} className="flex gap-3 text-xs text-foreground/70 leading-relaxed">
                                    <span className="shrink-0 mt-0.5 text-red-500/60">•</span>
                                    <span>{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    } catch (e) {
                      // Fallback if not valid JSON
                      return <div className="whitespace-pre-wrap font-sans text-foreground/80">{result.ai_explanation}</div>;
                    }
                  })()}
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
