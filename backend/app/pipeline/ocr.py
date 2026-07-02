import cv2
import numpy as np
import paddleocr
import paddle
from paddleocr import PaddleOCR


class IngredientOCR:
    """
    Handles OCR on detected ingredient regions.
    """

    def __init__(self):
        print("📦 Loading PaddleOCR...")
        self.ocr = PaddleOCR(
            lang="en",
            use_angle_cls=True,
            show_log=False
        )
        print("📦 PaddleOCR Loaded!")

    def extract_text(self, image_input, boxes):
        # Support both image paths and direct in-memory NumPy arrays
        if isinstance(image_input, np.ndarray):
            img = image_input
        else:
            img = cv2.imread(str(image_input))

        if img is None:
            return []

        h, w = img.shape[:2]
        output = []

        for i, box in enumerate(boxes):
            x1, y1, x2, y2 = map(int, box)

            # Clamp coordinates to image boundaries
            x1 = max(0, min(x1, w - 1))
            y1 = max(0, min(y1, h - 1))
            x2 = max(0, min(x2, w))
            y2 = max(0, min(y2, h))

            # Skip empty or invalid crops
            if (x2 <= x1) or (y2 <= y1):
                continue

            crop = img[y1:y2, x1:x2]
            
            # Double check crop size
            if crop.size == 0:
                continue

            ocr_result = self.ocr.ocr(crop)

            text = ""
            if ocr_result and ocr_result[0]:
                text = " ".join(
                    line[1][0]
                    for line in ocr_result[0]
                )

            output.append({
                "box_id": i,
                "bbox": [x1, y1, x2, y2],
                "text": text
            })

        return output