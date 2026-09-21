import os
import sys
import io
from supabase import create_client, Client
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

is_configured = bool(
    SUPABASE_URL and SUPABASE_KEY and
    "your-project-id" not in SUPABASE_URL and
    "your-service-role-key" not in SUPABASE_KEY
)

if not is_configured:
    print("⚠️  Warning: Supabase credentials not configured in .env (running in local fallback mode)")
    supabase: Client = None
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase connected")
    except Exception as e:
        print(f"⚠️  Supabase connection failed: {e}")
        supabase = None

def get_db() -> Client:
    return supabase