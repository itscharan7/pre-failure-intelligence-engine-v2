import pandas as pd
import numpy as np
import pickle
import json
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report
import logging
from pathlib import Path
import os

from utils import load_data, engineer_features, get_healthy_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Main training function."""
    logger.info("Starting training process...")
    
    # Paths
    data_path = Path("../data/train_FD001.txt")
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    # Load data
    logger.info("Loading data...")
    df = load_data(str(data_path))
    
    # Feature engineering
    logger.info("Applying feature engineering...")
    df_engineered, feature_cols = engineer_features(df)
    
    # Get healthy training data (first 30% of cycles)
    logger.info("Extracting healthy training data...")
    healthy_df = get_healthy_data(df_engineered, healthy_ratio=0.3)
    
    # Prepare training data
    X_train = healthy_df[feature_cols].values
    
    # Check for NaN values
    if np.isnan(X_train).any():
        logger.warning("NaN values found in training data. Filling with 0.")
        X_train = np.nan_to_num(X_train, nan=0.0)
    
    logger.info(f"Training data shape: {X_train.shape}")
    logger.info(f"Feature columns: {feature_cols}")
    
    # Scale features
    logger.info("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    # Train Isolation Forest
    logger.info("Training Isolation Forest...")
    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train_scaled)
    
    # Save model artifacts
    logger.info("Saving model artifacts...")
    
    # Save model
    model_path = models_dir / "isolation_forest_model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    # Save scaler
    scaler_path = models_dir / "scaler.pkl"
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    
    # Save feature columns
    features_path = models_dir / "features.json"
    with open(features_path, 'w') as f:
        json.dump(feature_cols, f, indent=2)
    
    # Evaluate on full dataset (for logging purposes)
    logger.info("Evaluating model...")
    X_full = df_engineered[feature_cols].values
    X_full = np.nan_to_num(X_full, nan=0.0)
    X_full_scaled = scaler.transform(X_full)
    
    predictions = model.predict(X_full_scaled)
    anomaly_scores = model.decision_function(X_full_scaled)
    
    # Calculate statistics
    n_anomalies = np.sum(predictions == -1)
    anomaly_rate = n_anomalies / len(predictions) * 100
    
    logger.info(f"Training completed successfully!")
    logger.info(f"Total samples: {len(predictions)}")
    logger.info(f"Anomalies detected: {n_anomalies} ({anomaly_rate:.2f}%)")
    logger.info(f"Anomaly score range: [{anomaly_scores.min():.4f}, {anomaly_scores.max():.4f}]")
    
    # Save some sample predictions for verification
    sample_results = []
    for i in range(min(10, len(df_engineered))):
        sample_results.append({
            'engine_id': int(df_engineered.iloc[i]['engine_id']),
            'cycle': int(df_engineered.iloc[i]['cycle']),
            'anomaly_score': float(anomaly_scores[i]),
            'prediction': int(predictions[i])
        })
    
    samples_path = models_dir / "training_samples.json"
    with open(samples_path, 'w') as f:
        json.dump(sample_results, f, indent=2)
    
    logger.info(f"Model artifacts saved to {models_dir}")
    logger.info("Training process completed!")

if __name__ == "__main__":
    main()
