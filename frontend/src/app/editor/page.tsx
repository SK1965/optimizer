"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EditorPanel from "@/components/EditorPanel";
import ResultPanel from "@/components/ResultPanel";
import Header from "@/components/Header";
import { DEFAULT_CODE } from "@/lib/constants";
import { submitCode, getSubmissionStatus, SubmissionStatus } from "@/lib/api";
import { saveSubmissionHistory } from "@/lib/storage";

function EditorContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_CODE[language]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

  // Load existing submission if ID is present in URL
  useEffect(() => {
    if (idParam && !hasInitialized.current) {
      hasInitialized.current = true;
      const loadPastSubmission = async () => {
        try {
          setIsSubmitting(true);
          const status = await getSubmissionStatus(idParam);
          setLanguage(status.language);
          setCode(status.code);
          setResult(status);
        } catch (err: any) {
          setError(`Failed to load submission: ${err.message}`);
        } finally {
          setIsSubmitting(false);
        }
      };
      loadPastSubmission();
    }
  }, [idParam]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(DEFAULT_CODE[newLanguage]);
  };

  const clearPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  };

  const handleRun = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setResult(null);
      clearPolling();

      const response = await submitCode({ code, language });
      const { submissionId } = response;

      // Persist to local storage for Homepage history
      saveSubmissionHistory(submissionId);

      pollInterval.current = setInterval(async () => {
        try {
          const status = await getSubmissionStatus(submissionId);
          setResult(status);

          if (status.status === 'completed' || status.status === 'failed') {
            clearPolling();
            setIsSubmitting(false);
          }
        } catch (pollError: any) {
          clearPolling();
          setError(`Failed to retrieve submission status: ${pollError.message}`);
          setIsSubmitting(false);
        }
      }, 5000);

    } catch (submitError: any) {
      setError(`Failed to submit code: ${submitError.message}`);
      setIsSubmitting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearPolling();
  }, []);

  return (
    <>
      <Header 
        language={language} 
        isSubmitting={isSubmitting}
        onLanguageChange={handleLanguageChange} 
        onRun={handleRun}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Editor Panel (65%) */}
          <div className="flex-none lg:w-[65%] w-full h-[50vh] lg:h-full shrink-0">
            <EditorPanel language={language} code={code} onChange={setCode} />
          </div>
          
          {/* Results Panel (35%) */}
          <div className="flex-1 w-full lg:w-auto h-[50vh] lg:h-full">
            <ResultPanel result={result} error={error} isSubmitting={isSubmitting} />
          </div>
        </div>
      </main>
    </>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-500">Loading IDE...</div>}>
      <EditorContent />
    </Suspense>
  );
}
