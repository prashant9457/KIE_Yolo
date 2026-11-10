import { useEffect, useRef, useState } from 'react';
import { UploadSimpleIcon, ImageSquareIcon } from '@phosphor-icons/react';
import { useImageUpload } from '../../../hooks/useImageUpload';
import Button from '../../../components/ui/Button';
import sampleLabel from '../../../assets/sample-label.png';
import './ImageUpload.css';

export default function ImageUpload({ image, file, onSelect, onError }) {
  const input = useRef(null);
  const sampleRequest = useRef(null);
  const { selectFile, cancel } = useImageUpload(onSelect, onError);
  const [dragging, setDragging] = useState(false);
  const [samplePending, setSamplePending] = useState(false);
  useEffect(() => {
    cancel();
  }, [image, cancel]);
  useEffect(
    () => () => {
      sampleRequest.current?.abort();
      sampleRequest.current = null;
    },
    [],
  );
  const chooseFile = (nextFile) => {
    if (!nextFile) return;
    sampleRequest.current?.abort();
    sampleRequest.current = null;
    setSamplePending(false);
    return selectFile(nextFile);
  };
  const chooseSample = async () => {
    sampleRequest.current?.abort();
    const controller = new AbortController();
    sampleRequest.current = controller;
    setSamplePending(true);
    try {
      const response = await fetch(sampleLabel, { signal: controller.signal });
      if (!response.ok)
        throw new Error('The sample image could not be loaded. Choose your own image instead.');
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      await selectFile(new File([blob], 'sample-granola.png', { type: 'image/png' }));
    } catch (error) {
      if (error.name !== 'AbortError') onError(error.message);
    } finally {
      if (sampleRequest.current === controller) {
        sampleRequest.current = null;
        setSamplePending(false);
      }
    }
  };
  return (
    <div className="upload-source">
      <div className="upload-source__heading">
        <h2>{image ? 'Selected image' : 'Product image'}</h2>
        <span>JPG or PNG, up to 10 MB</span>
      </div>
      <div
        className={`image-workspace ${image ? 'image-workspace--selected' : ''} ${dragging ? 'dragging' : ''}`}
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
          chooseFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          ref={input}
          className="visually-hidden"
          type="file"
          accept="image/png,image/jpeg"
          aria-label="Upload product image"
          onChange={(event) => {
            chooseFile(event.target.files[0]);
            event.target.value = '';
          }}
        />
        {image ? (
          <div className="source-preview">
            <img src={image} alt="Uploaded product label" />
          </div>
        ) : (
          <div className="upload-empty">
            <span className="upload-empty__icon">
              <ImageSquareIcon size={30} weight="light" />
            </span>
            <h3>Drop your image here</h3>
            <p>A clear photo of the ingredient list works best.</p>
            <Button onClick={() => input.current.click()} disabled={samplePending}>
              <UploadSimpleIcon size={16} />
              Choose image
            </Button>
            <button
              type="button"
              className="upload-sample"
              disabled={samplePending}
              onClick={chooseSample}
            >
              {samplePending ? 'Loading sample...' : 'Or try a sample image'}
            </button>
          </div>
        )}
        {dragging && (
          <div className="drop-overlay" aria-hidden="true">
            Drop to select this image
          </div>
        )}
      </div>
      <div className="upload-source__footer">
        <span title={file?.name}>
          {image ? file?.name || 'Product label' : 'Keep the label in focus and well lit.'}
        </span>
        {image && (
          <Button size="sm" onClick={() => input.current.click()}>
            Replace image
          </Button>
        )}
      </div>
    </div>
  );
}
