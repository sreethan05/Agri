import os
import sys
import io
import json
import time
from datetime import datetime
from dotenv import load_dotenv
from typing import Optional

# Force UTF-8 encoding for Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

if getattr(sys, 'frozen', False):
    # If running as an EXE (packaged)
    basedir = os.path.dirname(sys.executable)
else:
    # If running as a script (dev)
    basedir = os.path.dirname(os.path.abspath(__file__))

env_path = os.path.join(basedir, '.env')
load_dotenv(env_path)

# Check Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
is_supabase_configured = bool(
    SUPABASE_URL and SUPABASE_KEY and
    "your-project-id" not in SUPABASE_URL and
    "your-service-role-key" not in SUPABASE_KEY
)

if not is_supabase_configured:
    print(f"ℹ️  Supabase credentials not configured at {env_path}. Running with demo/fallback auth mode.")

# 2. Path resolution function for PyInstaller
def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = basedir
    return os.path.join(base_path, relative_path)

# 3. Environment
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import tensorflow as tf
import numpy as np
from PIL import Image, UnidentifiedImageError
from gtts import gTTS
import requests
import uvicorn

# ── Auth imports ──────────────────────────────────────────────────────
from auth import (
    RegisterRequest, LoginRequest, UpdateProfileRequest,
    register_user, login_user, refresh_token,
    get_optional_user, get_current_user,
    bearer_scheme,
)
from database import get_db, is_configured as SUPABASE_CONFIGURED
AUTH_ENABLED = True
_LOCAL_PREDICTIONS = []

# ── FastAPI app ───────────────────────────────────────────────────────
app = FastAPI(title="Agri AI API", version="2.0")
# Add this after app = FastAPI(...) in main.py

@app.on_event("startup")
async def startup_checks():
    if SUPABASE_CONFIGURED:
        try:
            from auth import get_jwks
            jwks = get_jwks()
            key_count = len(jwks.get("keys", []))
            print(f"✅ JWKS loaded successfully — {key_count} key(s)")
        except Exception as e:
            print(f"⚠️  JWKS fetch failed on startup: {e}")
            print("    Check SUPABASE_JWKS_URL in your .env file")
    else:
        print("ℹ️  Running in Local Demo Mode. Log in using test@agri.ai / test123456.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # necessary for file:// Electron origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# ── Load classes ──────────────────────────────────────────────────────
try:
    json_path = resource_path('class_indices.json')
    with open(json_path, 'r') as f:
        data = json.load(f)

    if any(isinstance(v, int) for v in data.values()):
        lookup = {str(v): k for k, v in data.items()}
    else:
        lookup = {str(k): v for k, v in data.items()}

    CLASSES     = [lookup[str(i)] for i in range(len(lookup))]
    NUM_CLASSES = len(CLASSES)
    print(f"✅ Loaded {NUM_CLASSES} classes successfully.")

except Exception as e:
    print(f"❌ Error loading JSON: {e}")
    sys.exit(1)

# ── Load model ────────────────────────────────────────────────────────
print("Loading model...")
MODEL = None
for name in ["cropmodel_v2.h5", "cropmodel.h5"]:
    path = resource_path(name)
    if os.path.exists(path):
        MODEL = tf.keras.models.load_model(path)
        print(f"✅ Model loaded: {path} | Classes: {MODEL.output_shape[-1]}")
        break

if MODEL is None:
    print("❌ No model found!")
    sys.exit(1)

# ── Treatment database ────────────────────────────────────────────────
TREATMENTS = {
    "bacterial_spot": {
        "severity": "medium", "emoji": "🔬",
        "pesticide": "Copper Oxychloride 0.2% + Streptomycin 100ppm. Spray every 7 days.",
        "fertilizer": "Reduce nitrogen. Apply K₂SO₄ 2g/L.",
        "action": "Remove heavily infected leaves. Avoid overhead irrigation.",
        "tips": ["Use certified disease-free seeds","Disinfect tools with 1% bleach",
                 "Avoid working in wet field","Improve plant spacing"],
        "telugu": "బ్యాక్టీరియల్ స్పాట్ వ్యాధి. రాగి ఆక్సీక్లోరైడ్ పిచికారీ చేయండి.",
    },
    "early_blight": {
        "severity": "medium", "emoji": "🟡",
        "pesticide": "Mancozeb 0.2% or Chlorothalonil 2g/L. Spray every 10 days.",
        "fertilizer": "Balanced NPK 19:19:19. Add calcium nitrate 1g/L.",
        "action": "Remove lower infected leaves. Stake plants for airflow.",
        "tips": ["Water at base only","Apply straw mulch",
                 "Rotate crops yearly","Remove plant debris after harvest"],
        "telugu": "ఎర్లీ బ్లైట్ వ్యాధి. మాంకోజెబ్ మందు పిచికారీ చేయండి.",
    },
    "late_blight": {
        "severity": "critical", "emoji": "🚨",
        "pesticide": "RIDOMIL GOLD 0.2% IMMEDIATELY. Repeat in 5 days.",
        "fertilizer": "Stop nitrogen! Potassium + phosphorus only.",
        "action": "URGENT: Remove and BURN infected plants. Do NOT compost.",
        "tips": ["Spreads in 3 days if untreated","Spray entire field",
                 "Improve drainage","No evening irrigation"],
        "telugu": "లేట్ బ్లైట్ - అత్యంత ప్రమాదకరం! రిడోమిల్ గోల్డ్ వెంటనే పిచికారీ చేయండి.",
    },
    "leaf_mold": {
        "severity": "medium", "emoji": "🟤",
        "pesticide": "Chlorothalonil 0.2% or Copper hydroxide. Every 7-10 days.",
        "fertilizer": "Ensure adequate potassium. Reduce greenhouse humidity.",
        "action": "Improve ventilation. Remove affected leaves.",
        "tips": ["Open greenhouse vents","Never wet foliage",
                 "Space plants 45cm apart","Use resistant varieties"],
        "telugu": "లీఫ్ మోల్డ్ వ్యాధి. క్లోరోతలోనిల్ పిచికారీ చేయండి.",
    },
    "septoria": {
        "severity": "medium", "emoji": "🔴",
        "pesticide": "Chlorothalonil 0.2%. Spray every 7-14 days.",
        "fertilizer": "Balanced fertilization. Avoid excess nitrogen.",
        "action": "Remove infected leaves from base upwards.",
        "tips": ["Starts from lower leaves","Don't work in wet field",
                 "Stake plants","2-year crop rotation"],
        "telugu": "సెప్టోరియా లీఫ్ స్పాట్. రాగి ఆధారిత మందు పిచికారీ చేయండి.",
    },
    "spider_mites": {
        "severity": "medium", "emoji": "🕷️",
        "pesticide": "Abamectin 1ml/L or Neem oil 5ml/L + soap 2ml/L. Every 5 days × 3.",
        "fertilizer": "Maintain soil moisture. Silicon fertilizer helps.",
        "action": "Spray UNDER leaves where mites live.",
        "tips": ["Check underside of leaves","Increase humidity",
                 "Avoid killing natural predators","Yellow sticky traps help"],
        "telugu": "స్పైడర్ మైట్స్. అబమెక్టిన్ ఆకు కింద పిచికారీ చేయండి.",
    },
    "target_spot": {
        "severity": "medium", "emoji": "🎯",
        "pesticide": "Azoxystrobin 0.1% or Boscalid 0.15%. Every 10-14 days.",
        "fertilizer": "Reduce nitrogen. Increase calcium and potassium.",
        "action": "Remove infected leaves. Improve air circulation.",
        "tips": ["Common in warm humid weather","Remove fallen leaves",
                 "Adequate plant spacing","Avoid late evening irrigation"],
        "telugu": "టార్గెట్ స్పాట్ వ్యాధి. అజాక్సీస్ట్రోబిన్ పిచికారీ చేయండి.",
    },
    "ylcv": {
        "severity": "critical", "emoji": "🚨",
        "pesticide": "Control whitefly: Imidacloprid 0.3ml/L. Every 5 days.",
        "fertilizer": "Zinc sulfate 0.5g/L + Boron 0.2g/L foliar spray.",
        "action": "Remove and BURN infected plants. Kill all whiteflies.",
        "tips": ["Whiteflies spread this virus","Yellow sticky traps",
                 "Silver mulch repels whiteflies","Use resistant varieties"],
        "telugu": "పసుపు ఆకు మురి వైరస్! తెల్ల దోమలను నిర్మూలించండి.",
    },
    "mosaic_virus": {
        "severity": "critical", "emoji": "🦠",
        "pesticide": "Control aphids: Dimethoate 0.05% or Imidacloprid 0.3ml/L.",
        "fertilizer": "Balanced nutrition. Avoid excess nitrogen.",
        "action": "Remove infected plants. Disinfect hands and tools immediately.",
        "tips": ["Spreads by touch","Wash hands between plants",
                 "Use certified seeds","10% bleach disinfects tools"],
        "telugu": "మొజాయిక్ వైరస్. సోకిన మొక్కలను తక్షణమే తొలగించండి.",
    },
    "healthy": {
        "severity": "none", "emoji": "✅",
        "pesticide": "No treatment needed.",
        "fertilizer": "Continue NPK 19:19:19 every 15 days.",
        "action": "Plant is healthy! Monitor every 7 days.",
        "tips": ["Regular monitoring","Proper irrigation",
                 "Good air circulation","Keep field weed-free"],
        "telugu": "మొక్క ఆరోగ్యంగా ఉంది! నిత్య పర్యవేక్షణ కొనసాగించండి.",
    },
}

def get_treatment(class_name: str) -> dict:
    n = class_name.lower()
    if "healthy"   in n: return {**TREATMENTS["healthy"],       "title": "Healthy Plant ✅"}
    if "late"      in n: return {**TREATMENTS["late_blight"],   "title": "Late Blight 🚨"}
    if "early"     in n: return {**TREATMENTS["early_blight"],  "title": "Early Blight"}
    if "bacterial" in n: return {**TREATMENTS["bacterial_spot"],"title": "Bacterial Spot"}
    if "mold"      in n: return {**TREATMENTS["leaf_mold"],     "title": "Leaf Mold"}
    if "septoria"  in n: return {**TREATMENTS["septoria"],      "title": "Septoria Leaf Spot"}
    if "spider"    in n: return {**TREATMENTS["spider_mites"],  "title": "Spider Mites"}
    if "target"    in n: return {**TREATMENTS["target_spot"],   "title": "Target Spot"}
    if "yellow" in n or "curl" in n:
                         return {**TREATMENTS["ylcv"],          "title": "Yellow Leaf Curl Virus 🚨"}
    if "mosaic"    in n: return {**TREATMENTS["mosaic_virus"],  "title": "Mosaic Virus 🦠"}
    return {
        "severity": "unknown", "emoji": "❓",
        "title":     class_name.replace("_", " ").title(),
        "pesticide": "Consult agriculture officer",
        "fertilizer":"Get soil test done",
        "action":    "Visit nearest Krishi Vigyan Kendra",
        "tips":      ["Monitor closely", "Photograph symptoms daily"],
        "telugu":    "వ్యవసాయ అధికారిని సంప్రదించండి.",
    }

# ═══════════════════════════════════════════════════════════════════════
#  EXISTING ROUTES — UNCHANGED
# ═══════════════════════════════════════════════════════════════════════

@app.get("/")
def root():
    return {"status": "Agri AI running", "classes": NUM_CLASSES}

@app.get("/health")
def health():
    return {
        "status":       "ok",
        "model_loaded": MODEL is not None,
        "num_classes":  NUM_CLASSES,
        "auth_enabled": AUTH_ENABLED,
    }

@app.get("/classes")
def get_classes():
    return {"classes": CLASSES, "count": NUM_CLASSES}

# ── Weather ───────────────────────────────────────────────────────────
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "60e1c8df454931f0ce73026aa1165489")

FALLBACK_WEATHER = {
    "coord": {"lon": 78.4867, "lat": 17.385},
    "weather": [{"id": 801, "main": "Clouds", "description": "Partly cloudy with good sun", "icon": "02d"}],
    "base": "stations",
    "main": {
        "temp": 29.5,
        "feels_like": 31.0,
        "temp_min": 24.0,
        "temp_max": 33.0,
        "pressure": 1012,
        "humidity": 58
    },
    "visibility": 10000,
    "wind": {"speed": 2.8, "deg": 180},
    "clouds": {"all": 25},
    "dt": int(time.time()),
    "sys": {
        "country": "IN",
        "sunrise": int(time.time()) - 21600,
        "sunset": int(time.time()) + 21600
    },
    "timezone": 19800,
    "id": 1269843,
    "name": "Hyderabad / Telangana",
    "cod": 200,
    "source": "fallback"
}

@app.get("/weather")
def get_weather(lat: float, lon: float):
    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"
    )
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"⚠️  Live weather API failed: {e}")

    # Fallback with user coordinates
    fallback = FALLBACK_WEATHER.copy()
    fallback["coord"] = {"lat": lat, "lon": lon}
    fallback["dt"] = int(time.time())
    return fallback

# ── Market prices ─────────────────────────────────────────────────────
MARKET_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
MARKET_API_KEY     = os.getenv(
    "MARKET_API_KEY",
    "579b464db66ec23bdd000001c67bccb742b442ca7791f3db9f440548"
)

# ── In-memory cache ───────────────────────────────────────────────────
_market_cache      = {}
_market_cache_time = {}
CACHE_SECONDS      = 3600   # 1 hour

# ── Fallback data ─────────────────────────────────────────────────────
FALLBACK_MARKET_DATA = [
    {"commodity":"Tomato",   "market":"Warangal APMC",   "state":"Telangana",
     "min_price":"800",  "max_price":"2400", "modal_price":"1600", "variety":"Desi"},
    {"commodity":"Potato",   "market":"Nizamabad APMC",  "state":"Telangana",
     "min_price":"700",  "max_price":"1500", "modal_price":"1100", "variety":"Local"},
    {"commodity":"Onion",    "market":"Karimnagar APMC", "state":"Telangana",
     "min_price":"600",  "max_price":"2000", "modal_price":"1200", "variety":"Red"},
    {"commodity":"Rice",     "market":"Warangal APMC",   "state":"Telangana",
     "min_price":"1820", "max_price":"2180", "modal_price":"2050", "variety":"Sona"},
    {"commodity":"Maize",    "market":"Khammam APMC",    "state":"Telangana",
     "min_price":"1540", "max_price":"1880", "modal_price":"1720", "variety":"Hybrid"},
    {"commodity":"Cotton",   "market":"Warangal APMC",   "state":"Telangana",
     "min_price":"5900", "max_price":"6400", "modal_price":"6150", "variety":"Medium"},
    {"commodity":"Chilli",   "market":"Khammam APMC",    "state":"Telangana",
     "min_price":"9000", "max_price":"14500","modal_price":"11200","variety":"Teja"},
    {"commodity":"Turmeric", "market":"Nizamabad APMC",  "state":"Telangana",
     "min_price":"7000", "max_price":"12000","modal_price":"9500", "variety":"Finger"},
    {"commodity":"Soybean",  "market":"Adilabad APMC",   "state":"Telangana",
     "min_price":"3900", "max_price":"4450", "modal_price":"4200", "variety":"JS-335"},
    {"commodity":"Groundnut","market":"Nalgonda APMC",   "state":"Telangana",
     "min_price":"4500", "max_price":"5500", "modal_price":"5100", "variety":"TMV-2"},
    {"commodity":"Wheat",    "market":"Hyderabad APMC",  "state":"Telangana",
     "min_price":"2000", "max_price":"2400", "modal_price":"2200", "variety":"Lokwan"},
    {"commodity":"Brinjal",  "market":"Warangal APMC",   "state":"Telangana",
     "min_price":"400",  "max_price":"1200", "modal_price":"800",  "variety":"Local"},
    {"commodity":"Capsicum", "market":"Hyderabad APMC",  "state":"Telangana",
     "min_price":"1200", "max_price":"3500", "modal_price":"2200", "variety":"Green"},
    {"commodity":"Cabbage",  "market":"Karimnagar APMC", "state":"Telangana",
     "min_price":"300",  "max_price":"900",  "modal_price":"600",  "variety":"Local"},
    {"commodity":"Banana",   "market":"Khammam APMC",    "state":"Telangana",
     "min_price":"800",  "max_price":"1800", "modal_price":"1300", "variety":"Robusta"},
]

@app.get("/market-prices")
def get_market_prices(
    commodity: Optional[str] = None,
    state:     Optional[str] = None,
    limit:     int           = Query(default=100, ge=1, le=500),
):
    global _market_cache, _market_cache_time

    now = time.time()
    cache_key = (commodity or "").casefold(), (state or "").casefold(), limit

    # ── 1. Serve from cache if still fresh ────────────────────────────
    if (
        cache_key in _market_cache
        and (now - _market_cache_time[cache_key]) < CACHE_SECONDS
    ):
        records = _market_cache[cache_key]
        return {"records": records, "source": "cache", "count": len(records)}

    # ── 2. Try live government API ────────────────────────────────────
    url = f"https://api.data.gov.in/resource/{MARKET_RESOURCE_ID}"
    params = {"api-key": MARKET_API_KEY, "format": "json", "limit": limit}
    if commodity:
        params["filters[commodity]"] = commodity
    if state:
        params["filters[state]"] = state

    try:
        response = requests.get(url, params=params, timeout=8)
        response.raise_for_status()   # raises on 4xx/5xx

        data    = response.json()
        records = data.get("records", [])

        if records:
            # Update cache
            _market_cache[cache_key]      = records
            _market_cache_time[cache_key] = now
            print(f"✅ Market live: {len(records)} records")
            return {"records": records, "source": "live", "count": len(records)}

        # API returned 200 but empty records — use fallback
        raise ValueError("Empty records from API")

    except Exception as e:
        print(f"⚠️  Market API failed: {type(e).__name__}: {e}")
        print("    Using fallback data")

        # ── 3. Fallback ───────────────────────────────────────────────
        records = FALLBACK_MARKET_DATA.copy()
        if commodity:
            records = [r for r in records
                       if commodity.lower() in r.get("commodity","").lower()]
        if state:
            records = [r for r in records
                       if state.lower() in r.get("state","").lower()]

        return {
            "records": records,
            "source":  "fallback",
            "count":   len(records),
            "note":    "Government API unavailable. Showing reference prices.",
        }
# ── Predict ───────────────────────────────────────────────────────────
@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    current_user: Optional[dict] = Depends(get_optional_user),
):
    if MODEL is None:
        raise HTTPException(503, "Model not loaded")
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(400, "Image too large (max 15MB)")

    try:
        img = Image.open(io.BytesIO(contents)).convert('RGB').resize((224, 224))
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(400, "Uploaded file is not a valid image")
    arr   = np.array(img, dtype=np.float32)
    arr   = tf.keras.applications.efficientnet.preprocess_input(arr)
    arr   = np.expand_dims(arr, axis=0)
    probs = MODEL.predict(arr, verbose=0)[0]

    idx        = int(np.argmax(probs))
    confidence = float(probs[idx]) * 100
    class_name = CLASSES[idx]
    treatment  = get_treatment(class_name)

    top5 = [
        {
            "class":      CLASSES[i],
            "label":      CLASSES[i].replace("___"," ").replace("__"," ").replace("_"," ").title(),
            "confidence": round(float(probs[i]) * 100, 2),
        }
        for i in np.argsort(probs)[::-1][:5]
        if i < len(CLASSES)
    ]

    response = {
        "class_name":   class_name,
        "display_name": treatment["title"],
        "confidence":   round(confidence, 2),
        "severity":     treatment["severity"],
        "emoji":        treatment["emoji"],
        "pesticide":    treatment["pesticide"],
        "fertilizer":   treatment["fertilizer"],
        "action":       treatment["action"],
        "tips":         treatment["tips"],
        "telugu":       treatment["telugu"],
        "top5":         top5,
        "saved_to_history": False,
    }

    # ── Save to DB or in-memory history if user is logged in ──────────
    if current_user:
        try:
            db   = get_db()
            crop = (
                "Tomato" if "tomato" in class_name.lower() else
                "Potato" if "potato" in class_name.lower() else
                "Pepper" if "pepper" in class_name.lower() else
                "Unknown"
            )
            user_id = current_user.get("sub") or current_user.get("id")
            record = {
                "id":               str(int(time.time() * 1000)),
                "user_id":          user_id,
                "disease_name":     class_name,
                "display_name":     treatment["title"],
                "confidence":       round(confidence, 2),
                "severity":         treatment["severity"],
                "crop_type":        crop,
                "pesticide":        treatment["pesticide"],
                "fertilizer":       treatment["fertilizer"],
                "location_village": current_user.get("village") or "Warangal",
                "created_at":       datetime.utcnow().isoformat(),
            }
            if db:
                db.table("predictions").insert({
                    "user_id":          record["user_id"],
                    "disease_name":     record["disease_name"],
                    "display_name":     record["display_name"],
                    "confidence":       record["confidence"],
                    "severity":         record["severity"],
                    "crop_type":        record["crop_type"],
                    "pesticide":        record["pesticide"],
                    "fertilizer":       record["fertilizer"],
                    "location_village": record["location_village"],
                }).execute()
            else:
                _LOCAL_PREDICTIONS.append(record)
            response["saved_to_history"] = True
        except Exception as e:
            print(f"⚠️  DB save warning: {e}")

    return response

# ── TTS ───────────────────────────────────────────────────────────────
@app.get("/speak")
def speak(text: str, lang: str = "te"):
    valid_langs = {"te": "te", "hi": "hi", "en": "en"}
    lang = valid_langs.get(lang, "te")
    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)
        return StreamingResponse(buf, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(500, f"TTS error: {e}")

# ═══════════════════════════════════════════════════════════════════════
#  NEW AUTH ROUTES — only active when AUTH_ENABLED = True
# ═══════════════════════════════════════════════════════════════════════

if AUTH_ENABLED:

    class RefreshRequest(BaseModel):
        refresh_token: str

    @app.post("/register")
    async def register(data: RegisterRequest):
        """Register new farmer — Supabase Auth sends confirmation email (or demo)."""
        return await register_user(data)

    @app.post("/login")
    async def login(data: LoginRequest):
        """Login — returns JWT token."""
        return await login_user(data)

    @app.post("/refresh")
    async def refresh(data: RefreshRequest):
        """Refresh expired access token."""
        return await refresh_token(data.refresh_token)

    @app.get("/me")
    async def get_me(current_user: dict = Depends(get_current_user)):
        """Get current user profile."""
        db = get_db()
        profile_data = {}
        if db:
            user_id = current_user.get("id") or current_user.get("sub")
            profile = db.table("farmer_profiles") \
                        .select("*") \
                        .eq("user_id", user_id) \
                        .execute()
            if profile.data:
                profile_data = profile.data[0]
        else:
            profile_data = {
                "full_name": current_user.get("full_name", "Farmer Ramesh"),
                "village": current_user.get("village", "Warangal"),
                "district": current_user.get("district", "Warangal"),
                "state": current_user.get("state", "Telangana"),
            }
        return {
            "user":    {k: v for k, v in current_user.items()
                        if k != "token_payload"},
            "profile": profile_data,
        }

    @app.put("/me")
    async def update_profile(
        data:         UpdateProfileRequest,
        current_user: dict = Depends(get_current_user)
    ):
        """Update profile fields."""
        db      = get_db()
        updates = {k: v for k, v in data.dict().items() if v is not None}
        if updates and db:
            user_id = current_user.get("id") or current_user.get("sub")
            db.table("profiles") \
              .update(updates) \
              .eq("id", user_id) \
              .execute()
        return {"message": "Profile updated.", "updated": updates}

    @app.get("/history")
    async def get_history(
        limit:        int  = 20,
        current_user: dict = Depends(get_current_user)
    ):
        """Get prediction history for logged-in user."""
        db = get_db()
        user_id = current_user.get("sub") or current_user.get("id")
        if db:
            result = db.table("predictions") \
                       .select("*") \
                       .eq("user_id", user_id) \
                       .order("created_at", desc=True) \
                       .limit(limit) \
                       .execute()
            return {"predictions": result.data, "count": len(result.data)}
        else:
            user_preds = [p for p in reversed(_LOCAL_PREDICTIONS) if p.get("user_id") == user_id][:limit]
            return {"predictions": user_preds, "count": len(user_preds)}

    @app.delete("/history/{prediction_id}")
    async def delete_prediction(
        prediction_id: str,
        current_user:  dict = Depends(get_current_user)
    ):
        """Delete a specific prediction."""
        db = get_db()
        user_id = current_user.get("id") or current_user.get("sub")
        if db:
            db.table("predictions") \
              .delete() \
              .eq("id",      prediction_id) \
              .eq("user_id", user_id) \
              .execute()
        else:
            global _LOCAL_PREDICTIONS
            _LOCAL_PREDICTIONS = [
                p for p in _LOCAL_PREDICTIONS
                if p.get("id") != prediction_id or p.get("user_id") != user_id
            ]
        return {"message": "Deleted."}
    @app.get("/debug-token")
    async def debug_token(credentials = Depends(bearer_scheme)):
        if not credentials:
            return {"error": "No token"}
        try:
            # Decode WITHOUT verification to see what's inside
            import jwt as pyjwt
            unverified = pyjwt.decode(
                credentials.credentials,
                options={"verify_signature": False}
                )
            return {
                "payload": unverified,
                "header":  pyjwt.get_unverified_header(credentials.credentials)
                }
        except Exception as e:
            return {"error": str(e)}
    @app.get("/jwks-test")
    async def test_jwks():
        """Verify JWKS is reachable — dev diagnostic endpoint."""
        from auth import get_jwks
        jwks = get_jwks()
        return {
            "status":   "ok",
            "jwks_url": os.getenv("SUPABASE_JWKS_URL"),
            "num_keys": len(jwks.get("keys", [])),
            "key_ids":  [k.get("kid") for k in jwks.get("keys", [])],
        }

# ═══════════════════════════════════════════════════════════════════════
#  ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=False,
        workers=1,
        log_level="info",
        use_colors=False,
    )
