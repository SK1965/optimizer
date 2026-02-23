import EditorPanel from "@/components/EditorPanel";
import ResultPanel from "@/components/ResultPanel";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
      {/* Editor Panel (65%) */}
      <div className="flex-none lg:w-[65%] w-full h-[50vh] lg:h-full shrink-0">
        <EditorPanel />
      </div>
      
      {/* Results Panel (35%) */}
      <div className="flex-1 w-full lg:w-auto h-[50vh] lg:h-full">
        <ResultPanel />
      </div>
    </div>
  );
}
