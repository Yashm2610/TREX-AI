import sys
import os

# Add the current directory to sys.path
sys.path.append(os.path.abspath('backend'))

try:
    from app.api.routes import career
    print("Career route imported successfully.")
    from app.services import career_matcher
    print("Career matcher service imported successfully.")
    from app.schemas import career as career_schema
    print("Career schema imported successfully.")
except Exception as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)
