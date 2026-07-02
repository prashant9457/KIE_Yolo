import React from 'react';
import { Eye, FileCode, Cpu, Download } from 'lucide-react';
import JSONViewer from './JSONViewer';

const VisualPanel = ({ 
  results, 
  isLoading, 
  activeTab, 
  setActiveTab, 
  handleDownloadImage 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col min-h-[500px] relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
            <Cpu className="w-4 h-4 text-blue-600 absolute animate-pulse" />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">Processing Pipeline</h4>
          <p className="text-xs text-gray-500 max-w-xs mt-1">
            YOLO boundary detection & PaddleOCR recognition running...
          </p>
        </div>
      )}
      <h3>See outputs in json format  </h3>
      <div className="space-y-6 flex-1 flex flex-col min-h-0">
        {/* Header with Title and Tab Toggle */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-150 pb-3">
          
          {results && (
            <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('annotated')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'annotated'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Annotated</span>
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'json'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>
          )}
        </div>

        {!results ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-gray-800">Detections & JSON</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-[220px]">
              Detections and raw OCR transcripts will appear here once processed.
            </p>
          </div>
        ) : (
          /* Active Result Panel (Tabbed Toggle) */
          <div className="flex-1 flex flex-col min-h-0">
            {activeTab === 'annotated' ? (
              <div className="flex-1 flex flex-col justify-between space-y-3 min-h-[300px]">
                <div className="flex-1 flex items-center justify-center p-3 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={results.annotatedImage} 
                    alt="Annotated labels preview" 
                    className="max-h-full max-w-full object-contain rounded-md shadow-xs"
                  />
                </div>
                <button
                  onClick={handleDownloadImage}
                  className="w-full flex items-center justify-center gap-2 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100/50 py-2.5 rounded-lg transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-auto border border-gray-200 rounded-lg min-h-[300px] bg-gray-50/50">
                <JSONViewer jsonData={results.json} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualPanel;
