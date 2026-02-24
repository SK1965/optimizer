"use client";

import { SUPPORTED_LANGUAGES } from "@/lib/constants";

interface HeaderProps {
  language: string;
  isSubmitting: boolean;
  onLanguageChange: (lang: string) => void;
  onRun: () => void;
}

export default function Header({ language, isSubmitting, onLanguageChange, onRun }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-panel-border bg-panel px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight text-white">
          Optimizer
        </h1>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="rounded bg-background px-2 py-1 text-sm text-foreground/80 border border-panel-border outline-none focus:border-brand"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isSubmitting ? (
             <>
               <span className="relative flex h-2 w-2">
                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
                 <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500"></span>
               </span>
               <span className="text-sm text-foreground/80">Running...</span>
             </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-sm text-foreground/80">Ready</span>
            </>
          )}
        </div>
        <button
          onClick={onRun}
          disabled={isSubmitting}
          className="rounded bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? 'Executing...' : 'Run Code'}
        </button>
      </div>
    </header>
  );
}
