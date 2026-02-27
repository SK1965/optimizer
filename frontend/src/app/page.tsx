"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSubmissionHistory } from "@/lib/storage";
import { getBulkSubmissions, SubmissionStatus } from "@/lib/api";
import SubmissionCard from "@/components/SubmissionCard";

const ITEMS_PER_PAGE = 10;

export default function HomePage() {
  const [submissions, setSubmissions] = useState<SubmissionStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const ids = getSubmissionHistory();
        
        if (ids.length === 0) {
          setIsLoading(false);
          return;
        }

        const data = await getBulkSubmissions(ids);
        
        // Ensure the order matches localStorage (newest first based on insertion array order)
        const sortedData = [...data].sort((a, b) => {
          return ids.indexOf(a.id) - ids.indexOf(b.id);
        });

        setSubmissions(sortedData);
      } catch (err: any) {
        setError("Failed to load submission history.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleSubmissions = submissions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white selection:bg-brand/30">
      
      {/* Navbar/Header */}
      <header className="flex h-16 items-center justify-between border-b border-panel-border bg-panel/50 px-6 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-tight text-white cursor-pointer select-none">
          Optimizer<span className="text-brand">.ai</span>
        </h1>
        <Link href="/editor">
          <button className="flex items-center gap-2 flex-row rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90 hover:shadow-[0_0_15px_rgba(var(--brand-rgb),0.3)]">
            <span>New Submission</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </Link>
      </header>

      <main className="w-full px-4 md:px-8 py-8 flex flex-col flex-1">
        <section className="flex flex-col h-full bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          
          {/* Table Header Controls */}
          <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-6 py-4">
            <h2 className="text-sm font-semibold tracking-wide text-white/90">
              Execution History
            </h2>
            {submissions.length > 0 && (
               <span className="text-[11px] font-medium text-foreground/50 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                 Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, submissions.length)} of {submissions.length}
               </span>
            )}
          </div>

          {/* Table Data Headers */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 bg-black/20 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
            <div className="col-span-2">Submission ID</div>
            <div className="col-span-2">Language</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Est. Complexity</div>
            <div className="col-span-3 text-right">Timestamp</div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
              </div>
            ) : error ? (
              <div className="m-6 rounded border border-red-500/20 bg-red-500/5 p-4 text-center text-sm font-medium text-red-400">
                {error}
              </div>
            ) : submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                 <div>
                   <h3 className="text-sm font-medium text-white/60">No submissions yet</h3>
                   <p className="mt-1 text-xs text-white/40">
                     <Link href="/editor" className="text-brand hover:underline cursor-pointer">Submit code</Link> to see it appear here.
                   </p>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {visibleSubmissions.map((sub) => (
                  <SubmissionCard key={sub.id} submission={sub} />
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && submissions.length > 0 && (
            <div className="flex items-center justify-between border-t border-white/10 bg-black/40 px-6 py-3">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-white/40">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
