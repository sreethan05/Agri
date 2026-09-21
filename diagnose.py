# diagnose.py — run this BEFORE anything else
import tensorflow as tf
import numpy as np
from PIL import Image
import os

# ── 1. Check what classes your dataset actually has ──────────────────
dataset_path = "./PlantVillage"
actual_classes = sorted(os.listdir(dataset_path))
print(f"\n✅ Dataset has {len(actual_classes)} folders:")
for i, c in enumerate(actual_classes):
    count = len(os.listdir(os.path.join(dataset_path, c)))
    print(f"  [{i:2d}] {c}  ({count} images)")

# ── 2. Check your saved model ────────────────────────────────────────
print("\n🔍 Loading cropmodel.h5...")
try:
    model = tf.keras.models.load_model("cropmodel.h5")
    print(f"✅ Model loaded. Output classes: {model.output_shape[-1]}")
    print(f"   Input shape expected: {model.input_shape}")
    model.summary(print_fn=lambda x: print("  " + x) if "output" in x.lower() or "input" in x.lower() else None)
except Exception as e:
    print(f"❌ Model load failed: {e}")

# ── 3. Test prediction on one real image ────────────────────────────
print("\n🧪 Testing prediction on first image found...")
for folder in actual_classes:
    folder_path = os.path.join(dataset_path, folder)
    images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg','.png','.jpeg'))]
    if images:
        img_path = os.path.join(folder_path, images[0])
        img = Image.open(img_path).convert('RGB').resize((224, 224))
        arr = np.array(img, dtype=np.float32)
        
        # Test both preprocessing methods
        arr_255 = np.expand_dims(arr / 255.0, axis=0)
        arr_effnet = np.expand_dims(
            tf.keras.applications.efficientnet.preprocess_input(arr.copy()), axis=0
        )
        
        try:
            pred_255 = model.predict(arr_255, verbose=0)[0]
            pred_eff = model.predict(arr_effnet, verbose=0)[0]
            print(f"\n  Real image: {folder}/{images[0]}")
            print(f"  /255 preprocessing → top class idx: {np.argmax(pred_255)}, confidence: {pred_255.max()*100:.1f}%")
            print(f"  EfficientNet prep  → top class idx: {np.argmax(pred_eff)}, confidence: {pred_eff.max()*100:.1f}%")
            print(f"  Correct class should be idx: {actual_classes.index(folder)}")
        except Exception as e:
            print(f"  Prediction error: {e}")
        break

print("\n" + "="*60)
print("COPY THE OUTPUT ABOVE AND USE IT TO FIX YOUR CLASSES LIST")
print("="*60)