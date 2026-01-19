from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import date
from typing import Optional, Dict
import base64
import json
from config import settings

# Database setup
engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database model
class MealDB(Base):
    __tablename__ = "meals"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    meal_type = Column(String, nullable=False)
    food = Column(String, nullable=False)
    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, nullable=False)
    fat = Column(Float, nullable=False)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class MealCreate(BaseModel):
    date: date
    meal_type: str
    food: str
    calories: float
    protein: float
    carbs: float
    fat: float

class MealResponse(BaseModel):
    id: int
    date: date
    meal_type: str
    food: str
    calories: float
    protein: float
    carbs: float
    fat: float
    
    class Config:
        from_attributes = True

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def classify_food_with_openai(image_bytes: bytes) -> Dict[str, float | str]:
    if not settings.use_openai_analysis:
        return {"label": "Sample Meal", "confidence": 0.72}

    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError("openai package not installed. Run: pip install openai") from exc

    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    client = OpenAI(api_key=settings.openai_api_key)
    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    response = client.responses.create(
        model=settings.openai_model,
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": (
                            "Identify the primary food in the image. "
                            "Return JSON only with keys: label (string), confidence (0-1)."
                        ),
                    },
                    {"type": "input_image", "image_base64": encoded_image},
                ],
            }
        ],
        temperature=0.2,
    )

    raw_text = response.output_text.strip()
    try:
        data = json.loads(raw_text)
        return {
            "label": str(data.get("label", "Unknown")),
            "confidence": float(data.get("confidence", 0.5)),
        }
    except json.JSONDecodeError:
        return {"label": "Unknown", "confidence": 0.5}


def lookup_nutrition(food_label: str) -> Dict[str, float]:
    normalized = food_label.strip().lower()
    sample_table = {
        "sample meal": {"calories": 520, "protein": 32, "carbs": 45, "fat": 18},
        "chicken salad": {"calories": 350, "protein": 30, "carbs": 18, "fat": 16},
        "avocado toast": {"calories": 290, "protein": 8, "carbs": 28, "fat": 17},
    }
    return sample_table.get(normalized, {"calories": 400, "protein": 20, "carbs": 40, "fat": 15})


@app.post("/api/analyze")
async def analyze_food(file: UploadFile = File(...)):
    image_bytes = await file.read()
    classification = classify_food_with_openai(image_bytes)
    nutrition = lookup_nutrition(classification["label"])

    return {
        "food": classification["label"],
        "calories": nutrition["calories"],
        "protein": nutrition["protein"],
        "carbs": nutrition["carbs"],
        "fat": nutrition["fat"],
        "confidence": classification["confidence"],
    }

@app.post("/api/meals", response_model=MealResponse)
async def create_meal(meal: MealCreate):
    db = SessionLocal()
    try:
        db_meal = MealDB(
            date=meal.date,
            meal_type=meal.meal_type,
            food=meal.food,
            calories=meal.calories,
            protein=meal.protein,
            carbs=meal.carbs,
            fat=meal.fat
        )
        db.add(db_meal)
        db.commit()
        db.refresh(db_meal)
        return db_meal
    finally:
        db.close()

@app.get("/api/meals")
async def get_meals(date: Optional[str] = Query(None)):
    db = SessionLocal()
    try:
        query = db.query(MealDB)
        if date:
            query = query.filter(MealDB.date == date)
        meals = query.all()
        return meals
    finally:
        db.close()

@app.get("/api/summary")
async def get_summary(date: Optional[str] = Query(None)):
    db = SessionLocal()
    try:
        query = db.query(MealDB)
        if date:
            query = query.filter(MealDB.date == date)
        meals = query.all()
        
        total_calories = sum(meal.calories for meal in meals)
        total_protein = sum(meal.protein for meal in meals)
        total_carbs = sum(meal.carbs for meal in meals)
        total_fat = sum(meal.fat for meal in meals)
        
        return {
            "date": date,
            "total_calories": total_calories,
            "total_protein": total_protein,
            "total_carbs": total_carbs,
            "total_fat": total_fat,
            "meal_count": len(meals)
        }
    finally:
        db.close()
