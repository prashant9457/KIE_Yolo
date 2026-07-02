from ultralytics import YOLO
from app.config import MODEL_PATH


class IngredientDetector:
    """
    Handles loading the YOLO model and running inference.
    """

    def __init__(self):
        print("📦 Loading YOLO model...")
        self.model = YOLO(str(MODEL_PATH))
        print("✅ YOLO model loaded successfully!")

    def detect(self, source, conf=0.75, iou=0.20):
        # Run inference directly on the source parameter (supports np.ndarray image arrays)
        results = self.model.predict(
            source=source,
            conf=conf,
            iou=iou,
            verbose=False
        )

        boxes = results[0].boxes

        return {
            "result": results,
            "boxes": boxes,
            "xyxy": boxes.xyxy.cpu().tolist(),
            "confidence": boxes.conf.cpu().tolist(),
            "class_ids": boxes.cls.cpu().tolist()
        }