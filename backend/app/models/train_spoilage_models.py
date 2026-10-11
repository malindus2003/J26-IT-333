"""
Model Training & Benchmarking Pipeline for Food Spoilage & Remaining Shelf-Life Prediction
Project: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
Author: Maddumage M. S. (IT23348820)

Compares and trains:
- Random Forest Regressor vs XGBoost Regressor for Remaining Shelf-Life (RSL) and Spoilage Probability (%)
- Random Forest Classifier vs XGBoost Classifier for Risk Level (Low/Medium/High/Critical)
"""

import os
import csv
import json
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error, accuracy_score, f1_score, classification_report, confusion_matrix
import xgboost as xgb

def load_dataset(csv_path):
    features = []
    rsl_targets = []
    prob_targets = []
    risk_targets = []
    grade_targets = []
    produce_names = []

    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            produce_names.append(row["produce_name"])
            feat = [
                float(row["temperature_celsius"]),
                float(row["humidity_percentage"]),
                float(row["ammonia_nh3_ppm"]),
                float(row["co2_ppm"]),
                float(row["voc_ethylene_ppm"]),
                float(row["storage_duration_hours"]),
                float(row["current_weight_kg"]),
                float(row["weight_loss_percentage"]),
            ]
            features.append(feat)
            rsl_targets.append(float(row["remaining_shelf_life_hours"]))
            prob_targets.append(float(row["spoilage_probability_pct"]))
            risk_targets.append(row["risk_level"])
            grade_targets.append(row["quality_grade"])

    return produce_names, np.array(features), np.array(rsl_targets), np.array(prob_targets), np.array(risk_targets), np.array(grade_targets)

def train_and_benchmark():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, "data", "sri_lanka_fruits_veg_iot_dataset.csv")
    models_dir = os.path.join(base_dir, "models", "saved_models")
    os.makedirs(models_dir, exist_ok=True)

    print(f"Loading dataset from: {data_path}")
    produce_names, num_features, rsl_targets, prob_targets, risk_targets, grade_targets = load_dataset(data_path)
    
    # One-hot encode produce names
    produce_names_arr = np.array(produce_names).reshape(-1, 1)
    encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
    cat_encoded = encoder.fit_transform(produce_names_arr)
    
    # Combined Feature Matrix: Numeric Features + Categorical Features
    X = np.hstack([num_features, cat_encoded])
    
    # Risk Level mapping
    risk_label_map = {"Low": 0, "Medium": 1, "High": 2, "Critical": 3}
    inv_risk_label_map = {v: k for k, v in risk_label_map.items()}
    y_risk = np.array([risk_label_map[r] for r in risk_targets])

    # Train / Test split (80% Train, 20% Test)
    X_train, X_test, y_rsl_train, y_rsl_test, y_prob_train, y_prob_test, y_risk_train, y_risk_test = train_test_split(
        X, rsl_targets, prob_targets, y_risk, test_size=0.20, random_state=42, stratify=y_risk
    )

    print(f"Total Records: {len(X)} | Training: {len(X_train)} | Testing: {len(X_test)}")
    print(f"Feature Vector Dimension: {X.shape[1]}")

    results_report = {
        "dataset_summary": {
            "total_samples": len(X),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "num_features": X.shape[1],
            "numeric_feature_count": num_features.shape[1],
            "produce_categories_count": len(encoder.categories_[0])
        },
        "regression_benchmarks": {},
        "classification_benchmarks": {}
    }

    # ==========================================
    # 1. REMAINING SHELF-LIFE (RSL) REGRESSION
    # ==========================================
    print("\n" + "="*60)
    print(" 1. BENCHMARKING: REMAINING SHELF-LIFE (RSL) REGRESSORS ")
    print("="*60)

    regressors = {
        "RandomForestRegressor": RandomForestRegressor(n_estimators=120, max_depth=12, random_state=42),
        "XGBoostRegressor": xgb.XGBRegressor(n_estimators=120, max_depth=6, learning_rate=0.08, random_state=42),
        "GradientBoostingRegressor": GradientBoostingRegressor(n_estimators=120, max_depth=5, learning_rate=0.08, random_state=42)
    }

    best_rsl_model = None
    best_rsl_r2 = -1.0
    best_rsl_name = ""

    for name, model in regressors.items():
        model.fit(X_train, y_rsl_train)
        preds = model.predict(X_test)
        r2 = r2_score(y_rsl_test, preds)
        rmse = np.sqrt(mean_squared_error(y_rsl_test, preds))
        mae = mean_absolute_error(y_rsl_test, preds)

        print(f"[{name}] -> R2 Score: {r2:.4f} | RMSE: {rmse:.3f} hrs | MAE: {mae:.3f} hrs")
        results_report["regression_benchmarks"][f"RSL_{name}"] = {
            "r2_score": round(float(r2), 4),
            "rmse_hours": round(float(rmse), 3),
            "mae_hours": round(float(mae), 3)
        }

        if r2 > best_rsl_r2:
            best_rsl_r2 = r2
            best_rsl_model = model
            best_rsl_name = name

    print(f">> Best RSL Model Selected: {best_rsl_name} (R2: {best_rsl_r2:.4f})")

    # ==========================================
    # 2. SPOILAGE PROBABILITY (%) REGRESSION
    # ==========================================
    print("\n" + "="*60)
    print(" 2. BENCHMARKING: SPOILAGE PROBABILITY (%) REGRESSORS ")
    print("="*60)

    prob_regressors = {
        "RandomForestRegressor": RandomForestRegressor(n_estimators=120, max_depth=12, random_state=42),
        "XGBoostRegressor": xgb.XGBRegressor(n_estimators=120, max_depth=6, learning_rate=0.08, random_state=42),
        "GradientBoostingRegressor": GradientBoostingRegressor(n_estimators=120, max_depth=5, learning_rate=0.08, random_state=42)
    }

    best_prob_model = None
    best_prob_r2 = -1.0
    best_prob_name = ""

    for name, model in prob_regressors.items():
        model.fit(X_train, y_prob_train)
        preds = model.predict(X_test)
        r2 = r2_score(y_prob_test, preds)
        rmse = np.sqrt(mean_squared_error(y_prob_test, preds))
        mae = mean_absolute_error(y_prob_test, preds)

        print(f"[{name}] -> R2 Score: {r2:.4f} | RMSE: {rmse:.3f}% | MAE: {mae:.3f}%")
        results_report["regression_benchmarks"][f"Prob_{name}"] = {
            "r2_score": round(float(r2), 4),
            "rmse_pct": round(float(rmse), 3),
            "mae_pct": round(float(mae), 3)
        }

        if r2 > best_prob_r2:
            best_prob_r2 = r2
            best_prob_model = model
            best_prob_name = name

    print(f">> Best Spoilage Probability Model: {best_prob_name} (R2: {best_prob_r2:.4f})")

    # ==========================================
    # 3. 4-TIER RISK LEVEL CLASSIFICATION
    # ==========================================
    print("\n" + "="*60)
    print(" 3. BENCHMARKING: 4-TIER RISK LEVEL CLASSIFIERS ")
    print("="*60)

    classifiers = {
        "RandomForestClassifier": RandomForestClassifier(n_estimators=120, max_depth=12, random_state=42),
        "XGBoostClassifier": xgb.XGBClassifier(n_estimators=120, max_depth=6, learning_rate=0.08, random_state=42),
        "GradientBoostingClassifier": GradientBoostingClassifier(n_estimators=120, max_depth=5, learning_rate=0.08, random_state=42)
    }

    best_risk_model = None
    best_risk_f1 = -1.0
    best_risk_name = ""

    target_names = ["Low", "Medium", "High", "Critical"]

    for name, model in classifiers.items():
        model.fit(X_train, y_risk_train)
        preds = model.predict(X_test)
        acc = accuracy_score(y_risk_test, preds)
        f1_macro = f1_score(y_risk_test, preds, average="macro")
        f1_weighted = f1_score(y_risk_test, preds, average="weighted")
        cm = confusion_matrix(y_risk_test, preds).tolist()

        print(f"[{name}] -> Accuracy: {acc*100:.2f}% | F1-Macro: {f1_macro:.4f} | F1-Weighted: {f1_weighted:.4f}")
        results_report["classification_benchmarks"][f"Risk_{name}"] = {
            "accuracy": round(float(acc), 4),
            "f1_macro": round(float(f1_macro), 4),
            "f1_weighted": round(float(f1_weighted), 4),
            "confusion_matrix": cm
        }

        if f1_weighted > best_risk_f1:
            best_risk_f1 = f1_weighted
            best_risk_model = model
            best_risk_name = name

    print(f">> Best Risk Level Model: {best_risk_name} (F1-Weighted: {best_risk_f1:.4f})")

    # ==========================================
    # 4. SAVE BEST TRAINED MODELS & ARTIFACTS
    # ==========================================
    joblib.dump(best_rsl_model, os.path.join(models_dir, "spoilage_rsl_model.joblib"))
    joblib.dump(best_prob_model, os.path.join(models_dir, "spoilage_prob_model.joblib"))
    joblib.dump(best_risk_model, os.path.join(models_dir, "spoilage_risk_model.joblib"))
    joblib.dump(encoder, os.path.join(models_dir, "produce_encoder.joblib"))

    # Save meta information
    meta_info = {
        "best_rsl_model": best_rsl_name,
        "best_prob_model": best_prob_name,
        "best_risk_model": best_risk_name,
        "produce_categories": list(encoder.categories_[0]),
        "risk_label_map": risk_label_map,
        "inv_risk_label_map": inv_risk_label_map,
        "numeric_features": [
            "temperature_celsius", "humidity_percentage", "ammonia_nh3_ppm",
            "co2_ppm", "voc_ethylene_ppm", "storage_duration_hours",
            "current_weight_kg", "weight_loss_percentage"
        ]
    }
    with open(os.path.join(models_dir, "model_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(meta_info, f, indent=2)

    with open(os.path.join(models_dir, "benchmark_metrics_report.json"), "w", encoding="utf-8") as f:
        json.dump(results_report, f, indent=2)

    print("\n" + "="*60)
    print(" ALL MODELS & EVALUATION METRICS SUCCESSFULLY SAVED! ")
    print(f" Directory: {models_dir}")
    print("="*60)
    return results_report

if __name__ == "__main__":
    train_and_benchmark()
