import React from 'react';
import { Sliders } from 'lucide-react';
import UploadCard from './UploadCard';

const ControlPanel = ({ 
  image, 
  onImageSelected, 
  confidence, 
  setConfidence, 
  handleExtract, 
  isLoading 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between space-y-6 min-h-[500px]">
      <div className="space-y-6">
        <div>
          <h2 className="font-semibold text-gray-900 text-base">Inference Parameters</h2>
          <p className="text-xs text-gray-500 mt-1">Configure threshold limits and source images</p>
        </div>

        {/* Confidence Threshold Config Card */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Confidence Threshold</span>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {confidence.toFixed(2)}
            </span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="0.9" 
            step="0.05" 
            value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer mt-1"
          />
          <p className="text-[10px] text-gray-400">
            Filters text boxes below this minimum probability rating.
          </p>
        </div>

        {/* Upload Card */}
        <UploadCard 
          onImageSelected={onImageSelected} 
          selectedImage={image} 
        />
      </div>

      {/* Action Button */}
      <button
        onClick={handleExtract}
        disabled={!image || isLoading}
        className={`w-full flex items-center justify-center gap-2 font-medium p-3.5 rounded-lg transition-all duration-150 text-sm ${
          image && !isLoading
            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.98]'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
        }`}
      >
        <span>{isLoading ? 'Processing...' : 'Extract'}</span>
      </button>
    </div>
  );
};

export default ControlPanel;
