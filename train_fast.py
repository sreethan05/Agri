# train_fast.py — FIXED for your exact setup
import os, json
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'   # silence the oneDNN warning

import tensorflow as tf
import numpy as np

print(f"TF: {tf.__version__}")
print(f"GPU: {tf.config.list_physical_devices('GPU')}")

# ── CONFIG ────────────────────────────────────────────────────────────
DATASET_PATH  = "./PlantVillage"
IMG_SIZE      = 224
BATCH_SIZE    = 32      # lower to 16 if you get memory errors
EPOCHS_FROZEN = 10
EPOCHS_FINE   = 5
MODEL_OUT     = "cropmodel_v2.h5"

# ── 1. Detect classes — auto-skip folders with < 50 images ───────────
all_folders = sorted([
    d for d in os.listdir(DATASET_PATH)
    if os.path.isdir(os.path.join(DATASET_PATH, d))
    and not d.startswith('_')        # skip _EXCLUDE folders
])

# Filter: must have at least 50 images to be a real class
classes = []
skipped = []
for folder in all_folders:
    path   = os.path.join(DATASET_PATH, folder)
    count  = len([f for f in os.listdir(path)
                  if f.lower().endswith(('.jpg','.jpeg','.png'))])
    if count >= 50:
        classes.append(folder)
    else:
        skipped.append((folder, count))

NUM_CLASSES = len(classes)
print(f"\n✅ Using {NUM_CLASSES} classes:")
for i, c in enumerate(classes):
    n = len([f for f in os.listdir(os.path.join(DATASET_PATH, c))
             if f.lower().endswith(('.jpg','.jpeg','.png'))])
    print(f"  [{i:2d}] {c}  ({n} images)")

if skipped:
    print(f"\n⚠️  Skipped (too few images):")
    for name, count in skipped:
        print(f"  SKIP: {name}  ({count} images)")

# Save class mapping — main.py reads this
with open("class_indices.json", "w") as f:
    json.dump({str(i): c for i, c in enumerate(classes)}, f, indent=2)
print(f"\n✅ class_indices.json saved  ({NUM_CLASSES} classes)")

# ── 2. Data pipeline ──────────────────────────────────────────────────
# CRITICAL: EfficientNet needs its OWN preprocessing — NOT /255
datagen_train = tf.keras.preprocessing.image.ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input,
    validation_split=0.2,
    rotation_range=25,
    width_shift_range=0.15,
    height_shift_range=0.15,
    horizontal_flip=True,
    zoom_range=0.15,
    brightness_range=[0.8, 1.2],
    fill_mode='nearest',
)

datagen_val = tf.keras.preprocessing.image.ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input,
    validation_split=0.2,
)

train_gen = datagen_train.flow_from_directory(
    DATASET_PATH,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True,
    classes=classes,     # FORCE our exact order
)

val_gen = datagen_val.flow_from_directory(
    DATASET_PATH,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False,
    classes=classes,     # FORCE our exact order
)

print(f"\n📊 Train: {train_gen.samples} images")
print(f"📊 Val:   {val_gen.samples} images")

# Verify class order matches
assert train_gen.class_indices == {c: i for i, c in enumerate(classes)}, \
    "❌ Class order mismatch! Check your dataset folders."
print("✅ Class order verified — matches class_indices.json")

# ── 3. Build model ────────────────────────────────────────────────────
print("\n🏗️  Building model...")
base = tf.keras.applications.EfficientNetB0(
    weights='imagenet',
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)
base.trainable = False  # freeze all — fast Phase 1

inputs  = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x       = base(inputs, training=False)
x       = tf.keras.layers.GlobalAveragePooling2D()(x)
x       = tf.keras.layers.BatchNormalization()(x)
x       = tf.keras.layers.Dense(256, activation='relu')(x)
x       = tf.keras.layers.Dropout(0.4)(x)
outputs = tf.keras.layers.Dense(NUM_CLASSES, activation='softmax')(x)
model   = tf.keras.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

trainable = sum(p.numpy().size for p in model.trainable_variables)
total     = sum(p.numpy().size for p in model.variables)
print(f"✅ Trainable params: {trainable:,} / {total:,} total")

# ── 4. Callbacks ──────────────────────────────────────────────────────
callbacks = [
    tf.keras.callbacks.ModelCheckpoint(
        MODEL_OUT,
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1,
    ),
    tf.keras.callbacks.EarlyStopping(
        monitor='val_accuracy',
        patience=4,
        restore_best_weights=True,
        verbose=1,
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=2,
        min_lr=1e-7,
        verbose=1,
    ),
    # Print per-epoch summary so you can track progress
    tf.keras.callbacks.LambdaCallback(
        on_epoch_end=lambda epoch, logs: print(
            f"\n  Epoch {epoch+1} summary → "
            f"loss: {logs['loss']:.4f} | acc: {logs['accuracy']*100:.1f}% | "
            f"val_loss: {logs['val_loss']:.4f} | val_acc: {logs['val_accuracy']*100:.1f}%"
        )
    ),
]

# ── 5. Phase 1 — Train head only (fast, ~15-25 min on CPU) ───────────
print(f"\n🚀 PHASE 1 — Training classification head ({EPOCHS_FROZEN} epochs max)")
print("   Base model: FROZEN | Only top layers training")
print("   Expected: reaches ~85-92% val accuracy\n")

h1 = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_FROZEN,
    callbacks=callbacks,
    verbose=1,
)

best_p1 = max(h1.history['val_accuracy'])
print(f"\n✅ Phase 1 done. Best val accuracy: {best_p1*100:.1f}%")

# ── 6. Phase 2 — Fine-tune (only if Phase 1 >= 80%) ──────────────────
if best_p1 >= 0.80:
    print(f"\n🔧 PHASE 2 — Fine-tuning last 30 layers ({EPOCHS_FINE} epochs)")
    print("   Unfreezing last 30 layers | Learning rate: 1e-4\n")

    base.trainable = True
    # Freeze everything except last 30 layers
    for layer in base.layers[:-30]:
        layer.trainable = False

    # Lower learning rate — important for fine-tuning
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    h2 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS_FINE,
        callbacks=callbacks,
        verbose=1,
    )

    best_p2 = max(h2.history['val_accuracy'])
    print(f"\n✅ Phase 2 done. Best val accuracy: {best_p2*100:.1f}%")
else:
    print(f"\n⚠️  Phase 1 only reached {best_p1*100:.1f}% — skipping Phase 2")
    print("    Check: Are images loading correctly? Is dataset corrupted?")

# ── 7. Save final model ───────────────────────────────────────────────
model.save(MODEL_OUT)
print(f"\n{'='*55}")
print(f"✅ Model saved:          {MODEL_OUT}")
print(f"✅ Classes saved:        class_indices.json")
print(f"✅ Number of classes:    {NUM_CLASSES}")
print(f"{'='*55}")
print("\n▶️  Next step:  streamlit run main.py")