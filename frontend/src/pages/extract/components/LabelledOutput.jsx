import { useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  DownloadSimpleIcon,
  ArrowsOutSimpleIcon,
  ArrowCounterClockwiseIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from '@phosphor-icons/react';
import Surface from '../../../components/ui/Surface';
import Button from '../../../components/ui/Button';
import { getValidRegions } from '../../../services/detections';
import { useDetectionScene } from '../../../hooks/useDetectionScene';
import DrawingRegion from './DrawingRegion';
import './DetectionScene.css';

export default function LabelledOutput({ results, image, onDownload, file, active = true }) {
  const scene = useDetectionScene(active);
  const regions = useMemo(() => getValidRegions(results), [results]);
  return (
    <Surface
      className="detection-scene"
      as="figure"
      aria-label="Zoomable product image with animated text detections"
    >
      <header className="scene-caption">
        <div>
          <h2 title={file?.name}>{file?.name || 'Product image'}</h2>
          <span>{regions.length} text regions detected</span>
        </div>
        <div className="scene-actions">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={scene.play}
            disabled={!scene.dimensions || !regions.length || scene.reduced}
            aria-label="Replay box drawing"
            title="Replay box drawing"
          >
            <ArrowCounterClockwiseIcon size={17} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={onDownload}
            aria-label="Download annotated image"
            title="Save annotated image"
          >
            <DownloadSimpleIcon size={17} />
          </Button>
        </div>
      </header>
      <TransformWrapper
        ref={scene.transformRef}
        minScale={1}
        maxScale={6}
        initialScale={1}
        wheel={{ activationKeys: ['Control'] }}
        panning={{ disabled: !scene.canPan }}
        onPanningStart={scene.inspect}
        onZoomStart={scene.inspect}
        onPinchStart={scene.inspect}
        onTransform={scene.onTransform}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="scene-stage">
              <TransformComponent
                wrapperClass="scene-zoom-viewport"
                contentClass="scene-zoom-content"
              >
                <div
                  ref={scene.imageRef}
                  className="detection-image"
                  style={
                    scene.dimensions
                      ? { '--image-ratio': scene.dimensions.width / scene.dimensions.height }
                      : undefined
                  }
                >
                  <img
                    src={image}
                    alt="Original product label with animated text detection boxes"
                    draggable={false}
                    onLoad={scene.onImageLoad}
                  />
                  {scene.dimensions && scene.bounds && (
                    <div key={scene.replay} className="detection-overlay">
                      {regions.map((region, index) => (
                        <DrawingRegion
                          key={`${region.box_id}-${index}`}
                          region={region}
                          index={index}
                          dimensions={scene.dimensions}
                          bounds={scene.bounds}
                          settled={scene.settled}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TransformComponent>
            </div>
            <div className="scene-tools">
              <span>Ctrl + scroll to zoom. Drag when zoomed.</span>
              <div className="scene-zoom-toolbar" role="group" aria-label="Image zoom controls">
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={() => {
                    scene.inspect();
                    zoomOut();
                  }}
                  aria-label="Zoom out"
                >
                  <MagnifyingGlassMinusIcon size={17} />
                </Button>
                <output ref={scene.zoomLabel} aria-label="Image zoom">
                  100%
                </output>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={() => {
                    scene.inspect();
                    zoomIn();
                  }}
                  aria-label="Zoom in"
                >
                  <MagnifyingGlassPlusIcon size={17} />
                </Button>
                <span className="scene-zoom-separator" />
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={() => {
                    scene.inspect();
                    resetTransform();
                  }}
                  aria-label="Fit image"
                  title="Fit image"
                >
                  <ArrowsOutSimpleIcon size={17} />
                </Button>
              </div>
            </div>
          </>
        )}
      </TransformWrapper>
      {!regions.length && (
        <p className="scene-empty">
          No text regions found. Try a clearer image or a lower detection confidence.
        </p>
      )}
      <span className="visually-hidden">
        {regions.length} text regions. Cursors drag from each region's top-left to bottom-right
        corner. Boxes stay aligned when the image is zoomed.
      </span>
    </Surface>
  );
}
