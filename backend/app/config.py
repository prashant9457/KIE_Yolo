"""Application configuration loaded from backend/.env and the environment."""
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')
MODEL_PATH = BASE_DIR / 'app' / 'models' / 'best.pt'
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_IMAGE_PIXELS = 25_000_000
GROQ_MODEL = os.getenv('GROQ_MODEL', 'openai/gpt-oss-20b')
MONGODB_URI = os.getenv('MONGODB_URI', '').strip()
MONGODB_DATABASE = os.getenv('MONGODB_DATABASE', 'ingredient_extraction').strip()
_DEFAULT_CORS_ORIGINS = (
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://kie-yolo.onrender.com',
)
_configured_cors_origins = os.getenv('CORS_ORIGINS', '')
CORS_ORIGINS = list(dict.fromkeys(
    normalized
    for origin in (*_DEFAULT_CORS_ORIGINS, *_configured_cors_origins.split(','))
    if (normalized := origin.strip().strip('"').strip("'").rstrip('/'))
))
