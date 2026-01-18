from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_food(file: UploadFile = File(...)):
    return {
        "food": "Sample Meal",
        "calories": 520,
        "protein": 32,
        "carbs": 45,
        "fat": 18,
        "confidence": 0.72
    }
