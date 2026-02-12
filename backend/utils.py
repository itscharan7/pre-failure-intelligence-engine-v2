import pandas as pd
import numpy as np
from typing import List, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_data(file_path: str) -> pd.DataFrame:
    """Load NASA C-MAPSS FD001 dataset with proper column names."""
    columns = [
        'engine_id', 'cycle',
        'op_setting_1', 'op_setting_2', 'op_setting_3',
        'sensor_1', 'sensor_2', 'sensor_3', 'sensor_4', 'sensor_5',
        'sensor_6', 'sensor_7', 'sensor_8', 'sensor_9', 'sensor_10',
        'sensor_11', 'sensor_12', 'sensor_13', 'sensor_14', 'sensor_15',
        'sensor_16', 'sensor_17', 'sensor_18', 'sensor_19', 'sensor_20',
        'sensor_21'
    ]
    
    df = pd.read_csv(file_path, sep='\s+', header=None, names=columns)
    logger.info(f"Loaded dataset with shape: {df.shape}")
    return df

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply feature engineering using only sensors 2, 7, and 12.
    Includes rolling mean, rolling std, and first difference.
    """
    df = df.copy()
    
    # Select only required sensors
    sensor_cols = ['sensor_2', 'sensor_7', 'sensor_12']
    
    # Sort by engine_id and cycle to ensure proper rolling windows
    df = df.sort_values(['engine_id', 'cycle']).reset_index(drop=True)
    
    # Apply rolling features for each engine separately
    for engine_id in df['engine_id'].unique():
        engine_mask = df['engine_id'] == engine_id
        
        for sensor in sensor_cols:
            # Rolling mean (window=10)
            df.loc[engine_mask, f'{sensor}_rolling_mean'] = (
                df.loc[engine_mask, sensor]
                .rolling(window=10, min_periods=1)
                .mean()
            )
            
            # Rolling std (window=10)
            df.loc[engine_mask, f'{sensor}_rolling_std'] = (
                df.loc[engine_mask, sensor]
                .rolling(window=10, min_periods=1)
                .std()
                .fillna(0)  # Fill NaN with 0 for std
            )
            
            # First difference
            df.loc[engine_mask, f'{sensor}_diff'] = (
                df.loc[engine_mask, sensor]
                .diff()
                .fillna(0)  # Fill NaN with 0 for first difference
            )
    
    # Define feature columns
    feature_cols = []
    for sensor in sensor_cols:
        feature_cols.extend([
            f'{sensor}_rolling_mean',
            f'{sensor}_rolling_std', 
            f'{sensor}_diff'
        ])
    
    # Add original sensor values as features
    feature_cols.extend(sensor_cols)
    
    # Drop rows with NaN values in feature columns
    df_clean = df.dropna(subset=feature_cols)
    
    logger.info(f"Feature engineering completed. Shape: {df_clean.shape}")
    logger.info(f"Feature columns: {feature_cols}")
    
    return df_clean, feature_cols

def get_healthy_data(df: pd.DataFrame, healthy_ratio: float = 0.3) -> pd.DataFrame:
    """
    Extract healthy data (first 30% of cycles) for training.
    """
    healthy_data = []
    
    for engine_id in df['engine_id'].unique():
        engine_data = df[df['engine_id'] == engine_id].copy()
        max_cycle = engine_data['cycle'].max()
        healthy_cycle_threshold = int(max_cycle * healthy_ratio)
        
        healthy_engine_data = engine_data[engine_data['cycle'] <= healthy_cycle_threshold]
        healthy_data.append(healthy_engine_data)
    
    healthy_df = pd.concat(healthy_data, ignore_index=True)
    logger.info(f"Healthy training data shape: {healthy_df.shape}")
    
    return healthy_df

def calculate_risk_score(anomaly_score: float) -> Tuple[float, str]:
    """
    Convert anomaly score to normalized risk score (0-100).
    """
    # Prevent division by zero and handle edge cases
    if np.isnan(anomaly_score) or np.isinf(anomaly_score):
        return 0.0, "HEALTHY"
    
    # Normalize to 0-100 scale (Isolation Forest decision_function returns negative values for anomalies)
    # More negative = more anomalous
    min_score = -0.5  # Typical minimum for Isolation Forest
    max_score = 0.1   # Typical maximum for Isolation Forest
    
    # Clamp the anomaly score
    clamped_score = max(min(anomaly_score, max_score), min_score)
    
    # Convert to 0-100 scale (reverse because more negative = higher risk)
    risk_score = ((max_score - clamped_score) / (max_score - min_score)) * 100
    
    # Clamp between 0 and 100
    risk_score = max(0, min(100, risk_score))
    
    # Determine status
    if risk_score < 40:
        status = "HEALTHY"
    elif risk_score <= 70:
        status = "WARNING"
    else:
        status = "CRITICAL"
    
    return risk_score, status

def validate_engine_cycle(df: pd.DataFrame, engine_id: int, cycle_index: int) -> bool:
    """
    Validate if engine_id and cycle_index exist in the dataset.
    """
    engine_data = df[df['engine_id'] == engine_id]
    
    if engine_data.empty:
        return False
    
    # Check if cycle_index is within valid range
    if cycle_index < 0 or cycle_index >= len(engine_data):
        return False
    
    return True

def get_engine_cycle_data(df: pd.DataFrame, engine_id: int, cycle_index: int) -> pd.DataFrame:
    """
    Get specific engine cycle data for prediction.
    """
    engine_data = df[df['engine_id'] == engine_id].sort_values('cycle').reset_index(drop=True)
    
    if cycle_index >= len(engine_data):
        raise ValueError(f"Cycle index {cycle_index} out of range for engine {engine_id}")
    
    return engine_data.iloc[cycle_index:cycle_index+1]
