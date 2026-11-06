import React, { useState } from 'react';
import { Cpu, Sparkles, Send, ChevronDown } from 'lucide-react';

const LLMProcessorPanel = ({ 
  results, 
  isLoading, 
  isLLMLoading,
  customPrompt, 
  setCustomPrompt, 
  handleReset,
  handlePostProcess
}) => {
  const [showPromptConfig, setShowPromptConfig] = useState(false);
  const isPending = !results;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between space-y-6 min-h-[500px] relative overflow-hidden">
      {isLLMLoading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
            <Cpu className="w-4 h-4 text-blue-600 absolute animate-pulse" />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">Groq LLM Call</h4>
          <p className="text-xs text-gray-500 max-w-xs mt-1">
            Refining the extracted text...
          </p>
        </div>
      )}

      <div className="space-y-6 flex-1 flex flex-col min-h-0">
        {/* Header with Title and Custom Prompt Toggle Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-base">Groq LLM Post-Processing</h2>
            <p className="text-xs text-gray-500 mt-1">Refine and correct layout transcriptions using the configured Groq model</p>
          </div>
          <button
            onClick={() => setShowPromptConfig(!showPromptConfig)}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold transition-all cursor-pointer text-gray-700 flex-shrink-0"
          >
            <span>Custom Prompt</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showPromptConfig ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Custom Prompt Input - Collapsible block */}
        {showPromptConfig && (
          <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-fade-in">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Custom LLM Instructions</span>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter custom instructions for the model..."
              rows={4}
              className="w-full text-xs font-mono p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-gray-700 leading-normal"
            />
            <button
              onClick={handlePostProcess}
              disabled={isPending || isLoading || isLLMLoading || !customPrompt.trim()}
              className={`w-full flex items-center justify-center gap-2 font-medium p-2.5 rounded-lg transition-all duration-150 text-xs ${
                !isPending && !isLoading && !isLLMLoading && customPrompt.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit to Groq</span>
            </button>
          </div>
        )}

        {/* LLM Output Result */}
        <div className="flex-1 flex flex-col justify-start min-h-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 block">{results?.json.llm_post_process?.model || 'Model'} Output</span>
          {!results ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-500">
                Extract an image to see corrections. Use a custom prompt to refine the result.
              </p>
            </div>
          ) : (
            /* Active Output display */
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              {/* Error display if any */}
              {results.json.llm_post_process?.error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-800 rounded-lg text-xs font-mono">
                  {results.json.llm_post_process.error}
                </div>
              )}

              {/* Structured ingredients block */}
              {!results.json.llm_post_process?.error && results.json.llm_post_process?.structured && (
                <div className="flex-1 flex flex-col min-h-0 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between items-center font-semibold text-gray-450 text-[10px]">
                    <span>Identified Box: #{results.json.llm_post_process.structured.box_number || 'N/A'}</span>
                    {results.json.llm_post_process.structured.bbox && (
                      <span>BBox: [{
                        Array.isArray(results.json.llm_post_process.structured.bbox)
                          ? results.json.llm_post_process.structured.bbox.join(', ')
                          : String(results.json.llm_post_process.structured.bbox)
                      }]</span>
                    )}
                  </div>
                  <div className="flex-1 overflow-auto bg-white p-3 rounded-md border border-gray-200 min-h-[80px]">
                    <p className="font-mono text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {results.json.llm_post_process.structured.postprocessed_corrected_text || results.json.llm_post_process.structured.text || JSON.stringify(results.json.llm_post_process.structured, null, 2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Raw response */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Raw JSON Response</span>
                <div className="bg-gray-900 text-green-400 p-2.5 rounded-lg font-mono text-[9px] max-h-[100px] overflow-auto whitespace-pre leading-normal border border-gray-800">
                  {results.json.llm_post_process?.raw_response || '{}'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {results && (
        <button
          onClick={handleReset}
          className="w-full text-center text-xs font-semibold text-red-500 hover:bg-red-50 border border-red-100 py-2 rounded-lg transition-all cursor-pointer"
        >
          Clear All Panels
        </button>
      )}
    </div>
  );
};

export default LLMProcessorPanel;
