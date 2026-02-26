"use client";

import { useState, useRef } from "react";
import EditorPanel from "@/components/EditorPanel";
import ResultPanel from "@/components/ResultPanel";
import Header from "@/components/Header";
import { DEFAULT_CODE } from "@/lib/constants";
import { submitCode, getSubmissionStatus, SubmissionStatus } from "@/lib/api";

export default function Home() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_CODE[language]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollInterval = useRef<NodeJS.Timeout | null>(null);

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
      const { submission_id } = response;

      pollInterval.current = setInterval(async () => {
        try {
          const status = await getSubmissionStatus(submission_id);
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
