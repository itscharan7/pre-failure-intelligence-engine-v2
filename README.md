# 🚀 Pre-Failure Intelligence System
## Explainable AI-Based Predictive Maintenance Dashboard

## 📌 Project Overview

Pre-Failure Intelligence System is an end-to-end Explainable AI solution designed to predict machine failures before they occur using sensor data.

The system analyzes engine degradation patterns from the NASA C-MAPSS dataset and predicts whether a machine is:

- ✅ Healthy  
- ⚠️ At Risk  
- ❌ Near Failure  

It provides explainable predictions using SHAP and displays results through an interactive Streamlit dashboard.

---

## 🎯 Problem Statement

Industries lose millions due to unexpected equipment failures. Traditional maintenance methods are:

- Reactive (fix after failure)
- Scheduled (may waste resources)
- Not data-driven  

This project implements predictive maintenance using AI to prevent breakdowns before they happen.

---

## 🧠 Technologies Used

- Python  
- Pandas  
- NumPy  
- Scikit-learn  
- Isolation Forest (Anomaly Detection)  
- SHAP (Explainable AI)  
- Feature Engineering (Rolling Mean, Std, Diff)  
- Streamlit (Interactive Dashboard)  

---

## 📊 Dataset

- NASA C-MAPSS FD001 Dataset  
- Multivariate time-series engine degradation data  
- Simulates aircraft engine sensor readings until failure  

---

## ⚙️ System Workflow

### 1️⃣ Data Preprocessing
- Removed irrelevant columns  
- Managed engine cycles  
- Normalized features  

### 2️⃣ Feature Engineering
Created advanced features:
- Rolling Mean  
- Rolling Standard Deviation  
- Sensor Differences  
- Trend Indicators  

### 3️⃣ Model Development
Used Isolation Forest for anomaly detection:
- Detects abnormal degradation behavior  
- Assigns anomaly scores  
- Converts scores into risk levels  

### 4️⃣ Explainability Layer
Integrated SHAP to:
- Show feature importance  
- Explain prediction decisions  
- Improve industrial trust  

### 5️⃣ Streamlit Dashboard
Interactive components:
- Engine selection dropdown  
- Animated health gauge  
- Risk progress bar  
- Restart button  
- Maintenance recommendations  

---

## 🏗️ Project Architecture

Data → Preprocessing → Feature Engineering → Isolation Forest Model  
→ SHAP Explainability → Streamlit Dashboard → User Insights  

