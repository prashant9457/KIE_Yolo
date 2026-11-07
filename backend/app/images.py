"""Image decoding and limits, independent of HTTP and model inference."""
from io import BytesIO

import cv2
import numpy as np
from PIL import Image, UnidentifiedImageError
from app.config import MAX_IMAGE_PIXELS


class InvalidImage(ValueError):
    pass


class ImageTooLarge(ValueError):
    pass


def decode_image(contents: bytes) -> np.ndarray:
    # Check dimensions before allocating the full decoded pixel array.
    try:
        with Image.open(BytesIO(contents)) as header:
            if header.format not in {'PNG', 'JPEG'}:
                raise InvalidImage('Upload a PNG or JPEG image.')
            if header.width * header.height > MAX_IMAGE_PIXELS:
                raise ImageTooLarge('Image must contain at most 25 million pixels.')
    except Image.DecompressionBombError as exc:
        raise ImageTooLarge('Image exceeds the supported pixel limit.') from exc
    except (UnidentifiedImageError, OSError) as exc:
        raise InvalidImage('Invalid image. Upload a PNG or JPEG image.') from exc
    try:
        image = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
    except cv2.error as exc:
        raise InvalidImage('Invalid image data.') from exc
    if image is None:
        raise InvalidImage('Could not decode the image.')
    return image
