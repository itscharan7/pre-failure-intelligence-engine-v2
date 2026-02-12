import pandas as pd
import numpy as np
import pickle
import json
import shap
from pathlib import Path
from typing import Dict, List, Optional
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from utils import (
    load_data, engineer_features, calculate_risk_score,
    validate_engine_cycle, get_engine_cycle_data
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Pre-Failure Intelligence System API",
    description="AI-powered predictive maintenance system for NASA C-MAPSS dataset",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and data
model = None
scaler = None
feature_cols = None
df = None

class FeatureImportance(BaseModel):
    feature: str
    impact: float

class PredictionResponse(BaseModel):
    risk: float
    status: str
    top_features: List[FeatureImportance]

class HealthResponse(BaseModel):
    status: str
    message: str

class EnginesResponse(BaseModel):
    engines: List[int]

def load_model_artifacts():
    """Load trained model artifacts."""
    global model, scaler, feature_cols
    
    models_dir = Path("models")
    
    try:
        # Load model
        model_path = models_dir / "isolation_forest_model.pkl"
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        # Load scaler
        scaler_path = models_dir / "scaler.pkl"
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
        
        # Load feature columns
        features_path = models_dir / "features.json"
        with open(features_path, 'r') as f:
            feature_cols = json.load(f)
        
        logger.info("Model artifacts loaded successfully")
        
    except FileNotFoundError as e:
        logger.error(f"Model artifacts not found: {e}")
        raise HTTPException(
            status_code=500,
            detail="Model artifacts not found. Please run training.py first."
        )

def load_dataset():
    """Load and prepare the dataset."""
    global df
    
    try:
        data_path = Path("../data/train_FD001.txt")
        df = load_data(str(data_path))
        df, _ = engineer_features(df)
        logger.info(f"Dataset loaded and engineered. Shape: {df.shape}")
        
    except FileNotFoundError:
        logger.error("Dataset not found")
        raise HTTPException(
            status_code=500,
            detail="Dataset not found. Please ensure train_FD001.txt is in the data folder."
        )

# Initialize data and models on import
try:
    load_model_artifacts()
    load_dataset()
    logger.info("API initialization completed successfully")
except Exception as e:
    logger.warning(f"API initialization failed: {e}")

def get_shap_explanation(features_scaled: np.ndarray, feature_names: List[str]) -> List[FeatureImportance]:
    """
    Get SHAP explanation for the prediction.
    Returns top 3 contributing features.
    """
    try:
        # Use TreeExplainer for Isolation Forest
        explainer = shap.TreeExplainer(model)
        
        # Calculate SHAP values
        shap_values = explainer.shap_values(features_scaled)
        
        # Handle case where shap_values is a list (multi-output)
        if isinstance(shap_values, list):
            shap_values = shap_values[0]
        
        # Get absolute SHAP values for feature importance
        abs_shap_values = np.abs(shap_values[0])
        
        # Get top 3 feature indices
        top_indices = np.argsort(abs_shap_values)[-3:][::-1]
        
        # Create feature importance list
        top_features = []
        for idx in top_indices:
            feature_name = feature_names[idx]
            impact = float(abs_shap_values[idx])
            top_features.append(FeatureImportance(
                feature=feature_name,
                impact=impact
            ))
        
        return top_features
        
    except Exception as e:
        logger.warning(f"SHAP explanation failed: {e}")
        # Return empty list if SHAP fails
        return []

@app.on_event("startup")
async def startup_event():
    """Initialize the API on startup."""
    logger.info("Starting Pre-Failure Intelligence System API...")
    load_model_artifacts()
    load_dataset()
    logger.info("API startup completed successfully")

@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "message": "Pre-Failure Intelligence System API",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        message="Pre-Failure Intelligence System API is running"
    )

@app.get("/engines", response_model=EnginesResponse)
async def get_engines():
    """Get list of available engine IDs."""
    if df is None:
        raise HTTPException(status_code=500, detail="Dataset not loaded")
    
    engines = sorted(df['engine_id'].unique().tolist())
    return EnginesResponse(engines=engines)

@app.get("/predict/{engine_id}/{cycle_index}", response_model=PredictionResponse)
async def predict(engine_id: int, cycle_index: int):
    """
    Predict failure risk for a specific engine and cycle.
    
    Args:
        engine_id: Engine identifier
        cycle_index: Cycle index (0-based)
    
    Returns:
        Risk score (0-100), status, and SHAP explanation
    """
    if model is None or scaler is None or feature_cols is None or df is None:
        raise HTTPException(
            status_code=500,
            detail="Model or data not loaded. Please check server status."
        )
    
    # Validate inputs
    if not validate_engine_cycle(df, engine_id, cycle_index):
        raise HTTPException(
            status_code=404,
            detail=f"Engine {engine_id} or cycle {cycle_index} not found"
        )
    
    try:
        # Get data for specific engine and cycle
        cycle_data = get_engine_cycle_data(df, engine_id, cycle_index)
        
        # Extract features
        features = cycle_data[feature_cols].values
        
        # Handle NaN values
        features = np.nan_to_num(features, nan=0.0)
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Get anomaly score
        anomaly_score = model.decision_function(features_scaled)[0]
        
        # Calculate risk score and status
        risk, status = calculate_risk_score(anomaly_score)
        
        # Get SHAP explanation
        top_features = get_shap_explanation(features_scaled, feature_cols)
        
        return PredictionResponse(
            risk=round(risk, 2),
            status=status,
            top_features=top_features
        )
        
    except Exception as e:
        logger.error(f"Prediction failed for engine {engine_id}, cycle {cycle_index}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Handle 404 errors."""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "status_code": 404
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: HTTPException):
    """Handle 500 errors."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
