import React, { useState } from 'react';
import './App.css';

// Import modular components
import PipelineVisualizer from './components/PipelineVisualizer';
import ControlPanel from './components/ControlPanel';
import VisualPanel from './components/VisualPanel';
import LLMProcessorPanel from './components/LLMProcessorPanel';

// Import API services
import { runOneClickExtraction, runLLMPostProcess } from './services/api';

function App() {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLLMLoading, setIsLLMLoading] = useState(false);
  const [confidence, setConfidence] = useState(0.45);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('annotated'); // 'annotated' | 'json'
  const [customPrompt, setCustomPrompt] = useState(
    "Find the OCR region that contains the ingredients list.\n\nReturn json format only that contains the box number, bbox and the postprocessed corrected text"
  );

  const handleImageSelected = (imageDataUrl) => {
    setImage(imageDataUrl);
    setResults(null);
  };

  const handleExtract = async () => {
    if (!image) return;
    
    setIsLoading(true);
    try {
      const data = await runOneClickExtraction(image, confidence, customPrompt);
      setResults(data);
      setActiveTab('annotated');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostProcess = async () => {
    if (!results || !results.json || !results.json.detected_regions) return;

    setIsLLMLoading(true);
    try {
      const llmResults = await runLLMPostProcess(results.json.detected_regions, customPrompt);
      
      // Update results state with refined Groq outputs
      setResults(prev => ({
        ...prev,
        json: {
          ...prev.json,
          llm_post_process: llmResults
        }
      }));
    } catch (err) {
      console.error("Failed to run LLM post-processing:", err);
    } finally {
      setIsLLMLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResults(null);
  };

  const handleDownloadImage = () => {
    if (!results || !results.annotatedImage) return;
    const link = document.createElement('a');
    link.href = results.annotatedImage;
    link.download = 'annotated_label.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        
        {/* Horizontal Pipeline Steps Visualizer */}
        <PipelineVisualizer />

        {/* 3-Column Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Column 1 (Left) - Inputs & Control Panel */}
          <div className="xl:col-span-4">
            <ControlPanel 
              image={image}
              onImageSelected={handleImageSelected}
              confidence={confidence}
              setConfidence={setConfidence}
              handleExtract={handleExtract}
              isLoading={isLoading}
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
