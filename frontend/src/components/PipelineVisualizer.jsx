import React from 'react';
import {
  Upload,
  Image,
  Scan,
  FileText,
  Sparkles,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

const PipelineVisualizer = () => {
  const steps = [
    {
      icon: Upload,
      label: 'Upload Image',
      desc: 'Select source label file'
    },
    {
      icon: Image,
      label: 'Preprocessing',
      desc: 'Load and decode image in-memory'
    },
    {
      icon: Scan,
      label: 'YOLO Text Detection',
      desc: 'Locate text boundary coordinates'
    },
    {
      icon: FileText,
      label: 'Text Extraction',
      desc: 'Transcribe crops using PaddleOCR'
    },
    {
      icon: Sparkles,
      label: 'Postprocessing using LLM',
      desc: 'Refine text with the configured model'
    },
    {
      icon: HelpCircle,
      label: 'Prompt to get information',
      desc: 'Structure fields by instructions'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 w-full flex items-center justify-between overflow-x-auto shadow-xs">
      <div className="flex items-center w-full justify-between min-w-[1060px] px-4">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={idx}>
              {/* Step indicator block */}
              <div className="flex items-center gap-3 max-w-[185px]">
                {/* Icon box */}
                <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 bg-gray-50 flex-shrink-0">
                  <StepIcon className="w-4 h-4" />
                </div>
                {/* Label and description */}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-gray-800 leading-tight">
                    {step.label}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5 leading-normal truncate">
                    {step.desc}
                  </span>
                </div>
              </div>

              {/* Connecting arrow */}
              {!isLast && (
                <div className="flex-1 max-w-[20px] flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineVisualizer;
