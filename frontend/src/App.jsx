import { useExtraction } from './hooks/useExtraction';
import './App.css';

// Import modular components
import PipelineVisualizer from './components/PipelineVisualizer';
import ControlPanel from './components/ControlPanel';
import VisualPanel from './components/VisualPanel';
import LLMProcessorPanel from './components/LLMProcessorPanel';

function App() {
  const {
    image, results, confidence, setConfidence, customPrompt, setCustomPrompt,
    activeTab, setActiveTab, error, setError, handleImageSelected, handleExtract,
    handlePostProcess, handleDownloadImage, handleReset, isLoading, isLLMLoading,
  } = useExtraction();

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans antialiased text-[#202124]">
      {/* Google Translate style Top Nav Bar */}
      <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          {/* Logo with Google colored letters */}
          <span className="text-xl font-medium tracking-tight text-gray-800">
            <span className="text-blue-600 font-semibold">I</span>ngredient{' '}
            <span className="text-red-500 font-semibold">E</span>xtraction{' '}
            <span className="text-yellow-500 font-semibold">P</span>ipeline
          </span>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="max-w-[1500px] mx-auto p-6 md:p-8 space-y-6">
        
        {error && <div role="alert" className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-800">{error}</div>}
        {/* Horizontal Pipeline Steps Visualizer */}
        <PipelineVisualizer />

        {/* 3-Column Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Column 1 (Left) - Inputs & Control Panel */}
          <div className="xl:col-span-4">
            <ControlPanel 
              image={image}
              onImageSelected={handleImageSelected}
              onError={setError}
              confidence={confidence}
              setConfidence={setConfidence}
              handleExtract={handleExtract}
              isLoading={isLoading || isLLMLoading}
            />
          </div>

          {/* Column 2 (Middle) - Visual Detection Image & BBox/JSON Tab panels */}
          <div className="xl:col-span-4">
            <VisualPanel 
              results={results}
              isLoading={isLoading}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleDownloadImage={handleDownloadImage}
            />
          </div>

          {/* Column 3 (Right) - LLM Custom Prompt & Correction Results */}
          <div className="xl:col-span-4">
            <LLMProcessorPanel 
              results={results}
              isLoading={isLoading}
              isLLMLoading={isLLMLoading}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              handleReset={handleReset}
              handlePostProcess={handlePostProcess}
            />
          </div>

        </div>

      </main>
    </div>
  );
}

export default App;
