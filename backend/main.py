from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import ViTFeatureExtractor, ViTForImageClassification
from PIL import Image
import torch
import io

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (frontend can connect)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load violence detection model
MODEL_NAME = "jaranohaal/vit-base-violence-detection"
model = ViTForImageClassification.from_pretrained(MODEL_NAME)
extractor = ViTFeatureExtractor.from_pretrained(MODEL_NAME)
model.eval()

LABELS = ["Non-violence", "Violence"]

def predict(img: Image.Image):
    inputs = extractor(images=img, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_class = torch.argmax(logits, dim=-1).item()
        probs = torch.softmax(logits, dim=-1).squeeze().tolist()
    return predicted_class, probs

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    # Read image
    image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    pred_class, probs = predict(image)
    return {
        "prediction": LABELS[pred_class],
        "probabilities": {LABELS[i]: round(probs[i]*100, 2) for i in range(len(LABELS))}
    }
