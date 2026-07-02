from pathlib import Path

# Base Directory (root of backend directory)
BASE_DIR = Path(__file__).resolve().parent.parent

# YOLO Model weights path
MODEL_PATH = BASE_DIR / "app" / "models" / "best.pt"