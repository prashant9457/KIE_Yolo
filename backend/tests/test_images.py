import unittest
from io import BytesIO
from unittest.mock import patch
from PIL import Image
from app.images import decode_image, ImageTooLarge, InvalidImage


class ImageTests(unittest.TestCase):
    def image_bytes(self, format='PNG'):
        stream = BytesIO()
        Image.new('RGB', (8, 8)).save(stream, format=format)
        return stream.getvalue()

    def test_checks_dimensions_before_opencv_allocation(self):
        with patch('app.images.MAX_IMAGE_PIXELS', 4), patch('app.images.cv2.imdecode') as decode:
            with self.assertRaises(ImageTooLarge):
                decode_image(self.image_bytes())
        decode.assert_not_called()

    def test_rejects_unsupported_or_corrupt_images(self):
        for data in [b'corrupt', self.image_bytes('GIF')]:
            with self.assertRaises(InvalidImage):
                decode_image(data)

    def test_decodes_supported_image(self):
        self.assertEqual(decode_image(self.image_bytes()).shape, (8, 8, 3))
