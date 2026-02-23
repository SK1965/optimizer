"use client";

import { useState } from "react";
import EditorPanel from "@/components/EditorPanel";
import ResultPanel from "@/components/ResultPanel";
import Header from "@/components/Header";
import { DEFAULT_CODE } from "@/lib/constants";

export default function Home() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_CODE[language]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(DEFAULT_CODE[newLanguage]);
  };

  return (
    <>
      <Header language={language} onLanguageChange={handleLanguageChange} />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Editor Panel (65%) */}
          <div className="flex-none lg:w-[65%] w-full h-[50vh] lg:h-full shrink-0">
            <EditorPanel language={language} code={code} onChange={setCode} />
          </div>
          
          {/* Results Panel (35%) */}
          <div className="flex-1 w-full lg:w-auto h-[50vh] lg:h-full">
            <ResultPanel />
          </div>
        </div>
      </main>
    </>
  );
}
