"""Application configuration loaded from backend/.env and the environment."""
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')
MODEL_PATH = BASE_DIR / 'app' / 'models' / 'best.pt'
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_IMAGE_PIXELS = 25_000_000
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.1-8b-instant')
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
