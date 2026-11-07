import { ArrowUp, Image, Leaf } from 'lucide-react';

export default function PipelineUploadGraphic() {
  return (
    <figure className="upload-step-graphic">
      <div
        className="upload-illustration"
        role="img"
        aria-label="A photo of a product ingredient label being uploaded"
      >
        <div className="graphic-photo" aria-hidden="true">
          <div className="photo-corner">
            <Image size={14} />
            <span>label.jpg</span>
          </div>
          <div className="graphic-package">
            <div className="package-seal" />
            <Leaf size={29} strokeWidth={1.4} />
            <strong>OAT BLEND</strong>
            <span className="package-rule" />
            <small>INGREDIENTS</small>
            <p>
              Oats, sugar,
              <br />
              almonds, salt.
            </p>
            <div className="package-barcode">|||| ||| || ||||</div>
          </div>
        </div>
        <div className="graphic-upload-arrow" aria-hidden="true">
          <ArrowUp size={27} strokeWidth={2} />
        </div>
        <span className="graphic-file-tag" aria-hidden="true">
          JPG / PNG
        </span>
      </div>
      <figcaption>Upload an image to find its ingredients.</figcaption>
    </figure>
  );
}
