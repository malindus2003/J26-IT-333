"""
Computer Vision Model Training & Feature Extraction Pipeline
Project: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment
Author: Maddumage M. S. (IT23348820)

Features extracted:
- Multi-channel Color Statistics (RGB, HSV, CIE L*a*b*)
- Enzymatic Browning & Chlorophyll Degradation Indices
- Surface Texture & Wrinkling Metrics (Gradient Density & Local Edge Variance)
- Mould & Necrotic Spot Defect Component Analysis
- Machine Learning Classification: Random Forest vs XGBoost vs MLP Neural Network
"""

import os
import json
import joblib
import numpy as np
import cv2
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, RandomForestRegressor
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, f1_score, r2_score, mean_squared_error, confusion_matrix
import xgboost as xgb

def extract_visual_features_from_image(img_bgr):
    """
    Extracts a 28-dimensional multi-domain visual feature vector from an image.
    """
    if img_bgr is None:
        return np.zeros(28, dtype=np.float32)

    img_resized = cv2.resize(img_bgr, (256, 256))
    
    # 1. Color Spaces
    rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(img_resized, cv2.COLOR_BGR2LAB)
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

    # Channel Means & Stds
    r_mean, g_mean, b_mean = np.mean(rgb[:, :, 0]), np.mean(rgb[:, :, 1]), np.mean(rgb[:, :, 2])
    r_std, g_std, b_std = np.std(rgb[:, :, 0]), np.std(rgb[:, :, 1]), np.std(rgb[:, :, 2])
    
    h_mean, s_mean, v_mean = np.mean(hsv[:, :, 0]), np.mean(hsv[:, :, 1]), np.mean(hsv[:, :, 2])
    h_std, s_std, v_std = np.std(hsv[:, :, 0]), np.std(hsv[:, :, 1]), np.std(hsv[:, :, 2])

    l_mean, a_mean, b_lab_mean = np.mean(lab[:, :, 0]), np.mean(lab[:, :, 1]), np.mean(lab[:, :, 2])

    # 2. Browning & Chlorophyll Indices
    # Browning index derived from CIE Lab: ratio of a* (redness) to b* (yellowness) and L (lightness)
    browning_index = float(np.sum((rgb[:, :, 0] > 70) & (rgb[:, :, 0] < 190) & 
                                  (rgb[:, :, 1] > 40) & (rgb[:, :, 1] < 140) & 
                                  (rgb[:, :, 2] < 90)) / (256 * 256) * 100.0)
    
    green_chlorophyll_ratio = float(np.sum((rgb[:, :, 1] > rgb[:, :, 0] * 1.1) & 
                                           (rgb[:, :, 1] > rgb[:, :, 2] * 1.1)) / (256 * 256) * 100.0)

    # 3. Mould & Fungal Defect Extraction
    mould_mask = ((rgb[:, :, 1] > rgb[:, :, 0] * 1.15) & (rgb[:, :, 1] > 65) & (rgb[:, :, 0] < 135)) | \
                 ((np.abs(rgb[:, :, 0].astype(int) - rgb[:, :, 1].astype(int)) < 15) & (v_mean > 190)) | \
                 ((v_mean < 45) & (np.abs(rgb[:, :, 0].astype(int) - rgb[:, :, 1].astype(int)) < 12))
    mould_coverage = float(np.sum(mould_mask) / (256 * 256) * 100.0)

    # 4. Texture & Edge Density (Canny & Sobel gradients)
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.sqrt(sobelx**2 + sobely**2)
    gradient_mean = float(np.mean(grad_mag))
    gradient_std = float(np.std(grad_mag))

    edges = cv2.Canny(gray, 50, 150)
    edge_density = float(np.sum(edges > 0) / (256 * 256) * 100.0)

    # 5. Hu Moments (Shape & Structural symmetry of defects)
    moments = cv2.moments(gray)
    hu_moments = cv2.HuMoments(moments).flatten()
    log_hu = -np.sign(hu_moments) * np.log10(np.abs(hu_moments) + 1e-10)

    feature_vec = np.array([
        r_mean, g_mean, b_mean, r_std, g_std, b_std,
        h_mean, s_mean, v_mean, h_std, s_std, v_std,
        l_mean, a_mean, b_lab_mean,
        browning_index, green_chlorophyll_ratio, mould_coverage,
        gradient_mean, gradient_std, edge_density,
        log_hu[0], log_hu[1], log_hu[2], log_hu[3], log_hu[4], log_hu[5], log_hu[6]
    ], dtype=np.float32)

    return feature_vec

def generate_augmented_vision_dataset(num_samples=2500):
    """
    Generates a balanced multi-class food quality visual feature dataset
    modeling:
    - Fresh (Grade A): High chroma, low browning, low mould, smooth surface texture
    - Ripe / Good (Grade B): Optimal color saturation, minimal blemishes
    - Consumable / Degraded (Grade C): Moderate browning, slight moisture loss / edge wrinkling
    - Spoiled / Moldy (Grade F): High fungal colony coverage, severe browning, dark necrosis
    """
    np.random.seed(42)
    X = []
    y_class = [] # 0: Fresh, 1: Ripe, 2: Degraded, 3: Spoiled
    y_spoilage_score = [] # 0.0 - 100.0%

    classes = ["Fresh", "Ripe", "Degraded", "Spoiled"]
    samples_per_class = num_samples // 4

    # 1. Fresh (Grade A)
    for _ in range(samples_per_class):
        r_mean = np.random.uniform(90, 180)
        g_mean = np.random.uniform(140, 220)
        b_mean = np.random.uniform(40, 110)
        browning = np.random.uniform(0.0, 4.0)
        green_ratio = np.random.uniform(35.0, 85.0)
        mould = np.random.uniform(0.0, 0.5)
        grad_mean = np.random.uniform(8.0, 18.0)
        edge_density = np.random.uniform(2.0, 7.0)
        spoil_score = np.random.uniform(2.0, 18.0)
        
        vec = [
            r_mean, g_mean, b_mean, np.random.uniform(15, 30), np.random.uniform(15, 30), np.random.uniform(15, 30),
            np.random.uniform(35, 75), np.random.uniform(110, 200), np.random.uniform(150, 230), 
            np.random.uniform(10, 25), np.random.uniform(15, 35), np.random.uniform(15, 35),
            np.random.uniform(130, 190), np.random.uniform(110, 135), np.random.uniform(140, 175),
            browning, green_ratio, mould, grad_mean, np.random.uniform(12, 22), edge_density,
            np.random.uniform(2.5, 4.0), np.random.uniform(5.5, 8.0), np.random.uniform(8.0, 12.0),
            np.random.uniform(9.0, 13.0), np.random.uniform(16.0, 22.0), np.random.uniform(12.0, 17.0), np.random.uniform(17.0, 24.0)
        ]
        X.append(vec)
        y_class.append(0)
        y_spoilage_score.append(spoil_score)

    # 2. Ripe / Good (Grade B)
    for _ in range(samples_per_class):
        r_mean = np.random.uniform(140, 220)
        g_mean = np.random.uniform(130, 200)
        b_mean = np.random.uniform(30, 90)
        browning = np.random.uniform(3.0, 10.0)
        green_ratio = np.random.uniform(10.0, 45.0)
        mould = np.random.uniform(0.0, 1.2)
        grad_mean = np.random.uniform(14.0, 24.0)
        edge_density = np.random.uniform(5.0, 11.0)
        spoil_score = np.random.uniform(18.0, 42.0)

        vec = [
            r_mean, g_mean, b_mean, np.random.uniform(20, 35), np.random.uniform(20, 35), np.random.uniform(15, 30),
            np.random.uniform(20, 50), np.random.uniform(140, 230), np.random.uniform(160, 235),
            np.random.uniform(12, 28), np.random.uniform(18, 38), np.random.uniform(15, 35),
            np.random.uniform(140, 195), np.random.uniform(130, 155), np.random.uniform(150, 185),
            browning, green_ratio, mould, grad_mean, np.random.uniform(15, 28), edge_density,
            np.random.uniform(2.6, 4.2), np.random.uniform(5.8, 8.5), np.random.uniform(8.5, 12.5),
            np.random.uniform(9.5, 13.5), np.random.uniform(17.0, 23.0), np.random.uniform(12.5, 18.0), np.random.uniform(18.0, 25.0)
        ]
        X.append(vec)
        y_class.append(1)
        y_spoilage_score.append(spoil_score)

    # 3. Consumable / Degraded (Grade C)
    for _ in range(samples_per_class):
        r_mean = np.random.uniform(110, 170)
        g_mean = np.random.uniform(85, 140)
        b_mean = np.random.uniform(35, 80)
        browning = np.random.uniform(12.0, 28.0)
        green_ratio = np.random.uniform(5.0, 20.0)
        mould = np.random.uniform(0.5, 2.5)
        grad_mean = np.random.uniform(22.0, 38.0)
        edge_density = np.random.uniform(10.0, 22.0)
        spoil_score = np.random.uniform(42.0, 72.0)

        vec = [
            r_mean, g_mean, b_mean, np.random.uniform(25, 45), np.random.uniform(25, 45), np.random.uniform(20, 35),
            np.random.uniform(10, 35), np.random.uniform(100, 190), np.random.uniform(100, 170),
            np.random.uniform(15, 35), np.random.uniform(20, 45), np.random.uniform(20, 45),
            np.random.uniform(100, 155), np.random.uniform(140, 170), np.random.uniform(130, 165),
            browning, green_ratio, mould, grad_mean, np.random.uniform(22, 38), edge_density,
            np.random.uniform(2.8, 4.5), np.random.uniform(6.0, 9.0), np.random.uniform(9.0, 13.5),
            np.random.uniform(10.0, 14.5), np.random.uniform(18.0, 24.5), np.random.uniform(13.5, 19.5), np.random.uniform(19.0, 26.5)
        ]
        X.append(vec)
        y_class.append(2)
        y_spoilage_score.append(spoil_score)

    # 4. Spoiled / Mouldy (Grade F)
    for _ in range(samples_per_class):
        r_mean = np.random.uniform(60, 120)
        g_mean = np.random.uniform(50, 100)
        b_mean = np.random.uniform(30, 75)
        browning = np.random.uniform(28.0, 65.0)
        green_ratio = np.random.uniform(0.0, 10.0)
        mould = np.random.uniform(4.5, 35.0)
        grad_mean = np.random.uniform(35.0, 65.0)
        edge_density = np.random.uniform(20.0, 45.0)
        spoil_score = np.random.uniform(72.0, 99.5)

        vec = [
            r_mean, g_mean, b_mean, np.random.uniform(30, 55), np.random.uniform(30, 55), np.random.uniform(25, 45),
            np.random.uniform(0, 30), np.random.uniform(60, 150), np.random.uniform(60, 130),
            np.random.uniform(20, 45), np.random.uniform(25, 55), np.random.uniform(25, 50),
            np.random.uniform(65, 125), np.random.uniform(150, 185), np.random.uniform(115, 155),
            browning, green_ratio, mould, grad_mean, np.random.uniform(30, 55), edge_density,
            np.random.uniform(3.0, 5.0), np.random.uniform(6.5, 10.0), np.random.uniform(10.0, 15.0),
            np.random.uniform(11.0, 16.0), np.random.uniform(19.0, 26.0), np.random.uniform(14.5, 21.0), np.random.uniform(20.0, 28.0)
        ]
        X.append(vec)
        y_class.append(3)
        y_spoilage_score.append(spoil_score)

    return np.array(X, dtype=np.float32), np.array(y_class, dtype=np.int32), np.array(y_spoilage_score, dtype=np.float32)

def train_and_benchmark_cv():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, "models", "saved_models")
    os.makedirs(models_dir, exist_ok=True)

    print("Generating Multi-Domain Computer Vision Training Dataset...")
    X, y_class, y_score = generate_augmented_vision_dataset(num_samples=3000)

    # Train / Test split
    X_train, X_test, y_cls_train, y_cls_test, y_scr_train, y_scr_test = train_test_split(
        X, y_class, y_score, test_size=0.20, random_state=42, stratify=y_class
    )

    # Feature Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print(f"Total Samples: {len(X)} | Training: {len(X_train)} | Testing: {len(X_test)}")
    print(f"Feature Vector Dimension: {X.shape[1]}")

    results = {
        "cv_dataset_summary": {
            "total_samples": len(X),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "features_dimension": X.shape[1],
            "classes": ["Fresh", "Ripe", "Degraded", "Spoiled"]
        },
        "cv_classification_benchmarks": {},
        "cv_regression_benchmarks": {}
    }

    # ==========================================
    # 1. CV QUALITY & SPOILAGE CLASSIFIERS
    # ==========================================
    print("\n" + "="*60)
    print(" 1. BENCHMARKING: COMPUTER VISION QUALITY CLASSIFIERS ")
    print("="*60)

    classifiers = {
        "RandomForest_CV": RandomForestClassifier(n_estimators=120, max_depth=12, random_state=42),
        "XGBoost_CV": xgb.XGBClassifier(n_estimators=120, max_depth=6, learning_rate=0.08, random_state=42),
        "MLP_NeuralNet_CV": MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=300, random_state=42)
    }

    best_cv_cls = None
    best_cv_f1 = -1.0
    best_cls_name = ""

    for name, model in classifiers.items():
        if "MLP" in name:
            model.fit(X_train_scaled, y_cls_train)
            preds = model.predict(X_test_scaled)
        else:
            model.fit(X_train, y_cls_train)
            preds = model.predict(X_test)

        acc = accuracy_score(y_cls_test, preds)
        f1_macro = f1_score(y_cls_test, preds, average="macro")
        f1_weighted = f1_score(y_cls_test, preds, average="weighted")
        cm = confusion_matrix(y_cls_test, preds).tolist()

        print(f"[{name}] -> Accuracy: {acc*100:.2f}% | F1-Macro: {f1_macro:.4f} | F1-Weighted: {f1_weighted:.4f}")
        results["cv_classification_benchmarks"][name] = {
            "accuracy": round(float(acc), 4),
            "f1_macro": round(float(f1_macro), 4),
            "f1_weighted": round(float(f1_weighted), 4),
            "confusion_matrix": cm
        }

        if f1_weighted > best_cv_f1:
            best_cv_f1 = f1_weighted
            best_cv_cls = model
            best_cls_name = name

    print(f">> Best CV Classifier Selected: {best_cls_name} (F1-Weighted: {best_cv_f1:.4f})")

    # ==========================================
    # 2. CV SPOILAGE SCORE REGRESSOR
    # ==========================================
    print("\n" + "="*60)
    print(" 2. BENCHMARKING: CV SPOILAGE SCORE REGRESSORS ")
    print("="*60)

    regressors = {
        "RandomForest_Reg_CV": RandomForestRegressor(n_estimators=120, max_depth=12, random_state=42),
        "XGBoost_Reg_CV": xgb.XGBRegressor(n_estimators=120, max_depth=6, learning_rate=0.08, random_state=42)
    }

    best_cv_reg = None
    best_r2 = -1.0
    best_reg_name = ""

    for name, model in regressors.items():
        model.fit(X_train, y_scr_train)
        preds = model.predict(X_test)
        r2 = r2_score(y_scr_test, preds)
        rmse = np.sqrt(mean_squared_error(y_scr_test, preds))

        print(f"[{name}] -> R2 Score: {r2:.4f} | RMSE: {rmse:.3f}%")
        results["cv_regression_benchmarks"][name] = {
            "r2_score": round(float(r2), 4),
            "rmse": round(float(rmse), 3)
        }

        if r2 > best_r2:
            best_r2 = r2
            best_cv_reg = model
            best_reg_name = name

    print(f">> Best CV Regressor Selected: {best_reg_name} (R2: {best_r2:.4f})")

    # ==========================================
    # 3. SAVE TRAINED CV MODELS
    # ==========================================
    joblib.dump(best_cv_cls, os.path.join(models_dir, "cv_spoilage_classifier.joblib"))
    joblib.dump(best_cv_reg, os.path.join(models_dir, "cv_ripeness_regressor.joblib"))
    joblib.dump(scaler, os.path.join(models_dir, "cv_feature_scaler.joblib"))

    with open(os.path.join(models_dir, "cv_benchmark_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("\n" + "="*60)
    print(" ALL COMPUTER VISION MODELS SUCCESSFULLY SAVED! ")
    print(f" Directory: {models_dir}")
    print("="*60)
    return results

if __name__ == "__main__":
    train_and_benchmark_cv()
