import { useEffect, useRef, useState } from 'react';
import { useImageUpload } from '../../../hooks/useImageUpload';
import { ImagePlus, Upload } from 'lucide-react';

export default function ImageUpload({ image, file, onSelect, onError }) {
  const input = useRef(null);
  const { selectFile, cancel } = useImageUpload(onSelect, onError);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    cancel();
  }, [image, cancel]);

  return (
    <div
      className={`image-workspace ${dragging ? 'dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        selectFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        ref={input}
        className="visually-hidden"
        type="file"
        accept="image/png,image/jpeg"
        aria-label="Upload product image"
        onChange={(event) => {
          selectFile(event.target.files[0]);
          event.target.value = '';
        }}
      />
      {image ? (
        <>
          <div className="source-preview">
            <img src={image} alt="Uploaded product label" />
          </div>
          <div className="source-file">
            <span title={file?.name}>{file?.name || 'Product label'}</span>
            <small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}</small>
          </div>
        </>
      ) : (
        <div className="upload-empty">
          <ImagePlus size={32} strokeWidth={1.4} />
          <h2>Upload a product label</h2>
          <p>Drop an image here or choose a file.</p>
          <span>JPG or PNG / Up to 10 MB</span>
        </div>
      )}
      <button className="secondary-button choose-button" onClick={() => input.current.click()}>
        <Upload size={14} />
        {image ? 'Replace image' : 'Choose image'}
      </button>
      {dragging && (
        <div className="drop-overlay">
          <Upload size={28} />
          <strong>Drop your image here</strong>
        </div>
      )}
    </div>
  );
}
