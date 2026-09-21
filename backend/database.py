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
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

is_configured = bool(
    SUPABASE_URL and (SUPABASE_KEY or SUPABASE_ANON_KEY) and
    "your-project-id" not in SUPABASE_URL and
    "your-service-role-key" not in (SUPABASE_KEY or "")
)

supabase: Client = None

if not is_configured:
    print("⚠️  Warning: Supabase credentials not configured in .env (running in local fallback mode)")
else:
    # Try service_role key first if provided, then fallback to anon key
    keys_to_try = []
    if SUPABASE_KEY and SUPABASE_KEY.startswith("eyJ"):
        keys_to_try.append(SUPABASE_KEY)
    if SUPABASE_ANON_KEY and SUPABASE_ANON_KEY.startswith("eyJ"):
        keys_to_try.append(SUPABASE_ANON_KEY)
    if SUPABASE_KEY and SUPABASE_KEY not in keys_to_try:
        keys_to_try.append(SUPABASE_KEY)

    for k in keys_to_try:
        try:
            supabase = create_client(SUPABASE_URL, k)
            # Test query to verify connection
            supabase.table("profiles").select("id").limit(1).execute()
            print("✅ Supabase connected successfully to PostgreSQL database")
            break
        except Exception as e:
            supabase = None

    if not supabase:
        print("⚠️  Supabase connection could not be established with provided keys (running in demo mode)")

def get_db() -> Client:
    return supabase