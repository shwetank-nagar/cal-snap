from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import date
from typing import Optional, Dict

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./meals.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
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
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_food(file: UploadFile = File(...)):
    # Simple mock analysis - returns sample data
    # In production, this would use AI/ML model to analyze the image
    image_bytes = await file.read()
    
    # Extract meal name from filename (remove extension)
    meal_name = file.filename.rsplit('.', 1)[0] if file.filename else "Sample Meal"
    
    # Return mock nutrition data with the filename as the meal name
    return {
        "food": meal_name,
        "calories": 520,
        "protein": 32,
        "carbs": 45,
        "fat": 18,
        "confidence": 0.72
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
