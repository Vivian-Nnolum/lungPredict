from __future__ import annotations

import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle
from typing import Optional


sys.path.append(os.path.dirname(__file__))

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

app = FastAPI(title="LungPredict API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:5173","*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PatientInput(BaseModel):
    fullName: Optional[str] = None
    age: int
    gender: str                   # "Male" or "Female"
    smoking: str                  # "Yes" or "No"
    yellowFingers: str            # "Yes" or "No"
    anxiety: str                  # "Yes" or "No"
    peerPressure: str             # "Yes" or "No"
    chronicDisease: str           # "Yes" or "No"
    fatigue: str                  # "Yes" or "No"
    allergy: str                  # "Yes" or "No"
    wheezing: str                 # "Yes" or "No"
    alcoholConsuming: str         # "Yes" or "No"
    coughing: str                 # "Yes" or "No"
    shortnessOfBreath: str        # "Yes" or "No"
    swallowingDifficulty: str     # "Yes" or "No"
    chestPain: str                # "Yes" or "No"

class PredictionResponse(BaseModel):
    risk_level: str
    probability: float

# def preprocess_patient_input(patient: PatientInput) -> pd.DataFrame:
#     """
#     Cleans and encodes the incoming API request data into the exact format,
#     column names (including trailing spaces), and data types expected by your ML model.
#     """
    
#     binary_map = {"Yes": 1, "No": 0}
    
#     gender_map = {"M": 1, "F": 0}
    
#     cleaned_data = {
#         'GENDER': gender_map.get(patient.gender, 1),
#         'AGE': int(patient.age),
#         'SMOKING': binary_map.get(patient.smoking, 1),
#         'YELLOW_FINGERS': binary_map.get(patient.yellowFingers, 1),
#         'ANXIETY': binary_map.get(patient.anxiety, 1),
#         'PEER_PRESSURE': binary_map.get(patient.peerPressure, 1),
#         'CHRONIC DISEASE': binary_map.get(patient.chronicDisease, 1),
        
#         'FATIGUE ': binary_map.get(patient.fatigue, 1),
#         'ALLERGY ': binary_map.get(patient.allergy, 1),
        
#         'WHEEZING': binary_map.get(patient.wheezing, 1),
#         'ALCOHOL CONSUMING': binary_map.get(patient.alcoholConsuming, 1),
#         'COUGHING': binary_map.get(patient.coughing, 1),
#         'SHORTNESS OF BREATH': binary_map.get(patient.shortnessOfBreath, 1),
#         'SWALLOWING DIFFICULTY': binary_map.get(patient.swallowingDifficulty, 1),
#         'CHEST PAIN': binary_map.get(patient.chestPain, 1)
#     }
    
 
#     feature_order = [
#         'GENDER', 'AGE', 'SMOKING', 'YELLOW_FINGERS', 'ANXIETY', 
#         'PEER_PRESSURE', 'CHRONIC DISEASE', 'FATIGUE ', 'ALLERGY ', 'WHEEZING', 
#         'ALCOHOL CONSUMING', 'COUGHING', 'SHORTNESS OF BREATH', 
#         'SWALLOWING DIFFICULTY', 'CHEST PAIN'
#     ]
    
#     df = pd.DataFrame([cleaned_data], columns=feature_order)
#     return df

def preprocess_patient_input(patient: PatientInput) -> pd.DataFrame:
    """
    Cleans and encodes the incoming API request data into the exact 16-feature 
    format, column names, and order expected by your trained XGBoost model.
    """
    # Map "Yes" -> 1, "No" -> 0 — MUST match main.py's training-time encoding,
    # not the raw 1/2 Kaggle scale. Sending the raw scale here was the bug:
    # it made every "No" answer look like a trained "Yes" to the model.
    binary_map = {"Yes": 1, "No": 0}

    # Map Gender
    gender_map = {"M": 1, "F": 0}

    # Build dictionary matching the model's expected features (no duplicate
    # allergy column — main.py now drops the raw 'ALLERGY ' column after encoding)
    cleaned_data = {
        'GENDER': gender_map.get(patient.gender, 1),
        'AGE': int(patient.age),
        'SMOKING': binary_map.get(patient.smoking, 0),
        'YELLOW_FINGERS': binary_map.get(patient.yellowFingers, 0),
        'ANXIETY': binary_map.get(patient.anxiety, 0),
        'PEER_PRESSURE': binary_map.get(patient.peerPressure, 0),
        'CHRONIC DISEASE': binary_map.get(patient.chronicDisease, 0),
        'FATIGUE ': binary_map.get(patient.fatigue, 0),             # trailing space
        'WHEEZING': binary_map.get(patient.wheezing, 0),
        'ALCOHOL CONSUMING': binary_map.get(patient.alcoholConsuming, 0),
        'COUGHING': binary_map.get(patient.coughing, 0),
        'SHORTNESS OF BREATH': binary_map.get(patient.shortnessOfBreath, 0),
        'SWALLOWING DIFFICULTY': binary_map.get(patient.swallowingDifficulty, 0),
        'CHEST PAIN': binary_map.get(patient.chestPain, 0),
        'ALLERGY': binary_map.get(patient.allergy, 0),
    }

    # Order columns exactly as the retrained model expects them
    feature_order = [
        'GENDER', 'AGE', 'SMOKING', 'YELLOW_FINGERS', 'ANXIETY',
        'PEER_PRESSURE', 'CHRONIC DISEASE', 'FATIGUE ', 'WHEEZING',
        'ALCOHOL CONSUMING', 'COUGHING', 'SHORTNESS OF BREATH',
        'SWALLOWING DIFFICULTY', 'CHEST PAIN', 'ALLERGY'
    ]
    
    # Convert into a 1-row Pandas DataFrame with exact column definitions
    df = pd.DataFrame([cleaned_data], columns=feature_order)
    return df
    

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict",response_model=PredictionResponse)
async def predict(patient: PatientInput):
    # 1. Run the cleaner/preprocessor
    input_df = preprocess_patient_input(patient)
    
    with open(MODEL_PATH,"rb") as f:
        model = pickle.load(f) 
    
    # 2. Run prediction
    prediction = model.predict(input_df)[0]        
    
    # Get probability if your model supports it (e.g., predict_proba)
    try:
        probabilities = model.predict_proba(input_df)[0]
        # Map the probability of cancer class (index 1) into a percentage scale (0-100)
        probability = float(probabilities[1]) * 100
    except AttributeError:
        # Fallback if model doesn't support probability
        probability = 90.0 if prediction == 1 else 15.0

    # 3. Determine Risk Level Category
    if probability >= 60.0:
        risk_level = "High"
    elif probability >= 30.0:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # 4. Return exact JSON shape the static web app expects
    return {
        "risk_level": risk_level,
        "probability": round(probability, 1)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)