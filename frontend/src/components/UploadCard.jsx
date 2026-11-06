import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Trash2,
  FileImage
} from 'lucide-react';

const UploadCard = ({ onImageSelected, selectedImage, onError }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      onError('Please select a PNG or JPEG image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onError('Image must be 10 MB or smaller.');
      return;
    }
    const reader = new FileReader();
      reader.onload = (event) => {
        onImageSelected(event.target.result);
      };
      reader.onerror = () => onError('Could not read the selected image.');
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };


  const clearImage = () => {
    onImageSelected(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-100/50 hover:shadow-md hover:shadow-slate-100/80 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 tracking-tight text-base">Source Image</h3>
          <p className="text-xs text-slate-400 mt-0.5">Upload a product or ingredient label image</p>
        </div>
        {selectedImage && (
          <button
            onClick={clearImage}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors border border-rose-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Image</span>
          </button>
        )}
      </div>

      {!selectedImage ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[220px] transition-all duration-200 cursor-pointer ${
            isDragActive
              ? 'border-brand-500 bg-brand-50/20'
              : 'border-slate-200 hover:border-brand-400 bg-slate-50/40 hover:bg-slate-50/70'
          }`}
          onClick={onButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg"
            onChange={handleChange}
          />

          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mb-4 shadow-sm shadow-brand-100">
            <UploadCloud className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>

          <p className="text-sm font-semibold text-slate-700">
            Drag & drop your image here, or <span className="text-brand-600 hover:underline">browse</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG (Max 10MB)</p>
        </div>
      ) : (
        <div className="relative group rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-2 min-h-[220px]">
          <img
            src={selectedImage}
            alt="Source preview"
            className="max-h-[300px] w-auto object-contain rounded-lg shadow-sm animate-fade-in transition-all duration-300"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <button
              onClick={onButtonClick}
              className="flex items-center gap-1.5 bg-white text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-lg"
            >
              <FileImage className="w-3.5 h-3.5 text-brand-600" />
              <span>Replace Image</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg"
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
};

export default UploadCard;
