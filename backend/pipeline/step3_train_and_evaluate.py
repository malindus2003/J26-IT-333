"""
Step 3 & 4: Model Training, Baseline Comparison, Evaluation, and Model Export.
Models:
- Baseline 1: Naive Forecast (lag_7)
- Baseline 2: 7-Day Moving Average (rolling_mean_7)
- Model 1: Random Forest Regressor
- Model 2: XGBoost Regressor

Metrics:
- MAE (Mean Absolute Error)
- RMSE (Root Mean Squared Error)
- MAPE (Mean Absolute Percentage Error on active items)

Outputs:
- 'best_food_demand_model.joblib'
- 'model_evaluation_results.csv'
- 'test_predictions_comparison.csv'
"""

import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

print("[+] Loading engineered dataset...")
df = pd.read_csv('engineered_features_master.csv')
df['date'] = pd.to_datetime(df['date'])

# Sort chronologically
df = df.sort_values(by=['date', 'item']).reset_index(drop=True)

# 1. Chronological Train / Test Split
# Test horizon: Last 14 days (2 weeks)
dates = sorted(df['date'].unique())
test_cutoff_date = dates[-14]  # 14 days for test

train_df = df[df['date'] < test_cutoff_date].copy()
test_df = df[df['date'] >= test_cutoff_date].copy()

print(f"    Total Operational Days: {len(dates)}")
print(f"    Training Period: {train_df['date'].min().strftime('%Y-%m-%d')} to {train_df['date'].max().strftime('%Y-%m-%d')} ({train_df['date'].nunique()} days, {len(train_df)} rows)")
print(f"    Testing Period:  {test_df['date'].min().strftime('%Y-%m-%d')} to {test_df['date'].max().strftime('%Y-%m-%d')} ({test_df['date'].nunique()} days, {len(test_df)} rows)")

# 2. Select Features for Training
feature_cols = [
    # Item & Category IDs
    'item_id', 'category_id', 'unit_price',
    # Context & Weather
    'weather_code', 'temperature_mean_c', 'rain_sum_mm', 'is_rainy',
    # Calendar & Holidays
    'day_of_week', 'is_weekend', 'month', 'day', 'is_month_start', 'is_month_end',
    'is_salary_period', 'is_holiday', 'is_poya', 'is_closed',
    # Demand Lags
    'lag_1', 'lag_2', 'lag_3', 'lag_7', 'lag_14',
    # Rolling Statistics
    'rolling_mean_7', 'rolling_std_7', 'rolling_max_7', 'rolling_mean_14',
    # Category and Total Footfall Lags
    'cat_demand_lag_1', 'cat_demand_lag_7', 'rest_total_lag_1', 'rest_total_lag_7'
]

target_col = 'quantity_demanded'

X_train = train_df[feature_cols].copy()
y_train = train_df[target_col].copy()

X_test = test_df[feature_cols].copy()
y_test = test_df[target_col].copy()

# Metric calculation functions
def calc_metrics(y_true, y_pred, name="Model"):
    # Avoid negative predictions
    y_pred_clipped = np.clip(y_pred, 0, None)
    
    mae = mean_absolute_error(y_true, y_pred_clipped)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred_clipped))
    
    # MAPE calculated on non-zero actual sales to avoid division by zero
    non_zero_mask = y_true > 0
    if np.sum(non_zero_mask) > 0:
        mape = np.mean(np.abs((y_true[non_zero_mask] - y_pred_clipped[non_zero_mask]) / y_true[non_zero_mask])) * 100
    else:
        mape = np.nan
        
    return {
        'Model': name,
        'MAE (Portions)': round(mae, 4),
        'RMSE': round(rmse, 4),
        'MAPE (%) on Active Orders': round(mape, 2)
    }

results = []

# --- 3. Baselines ---
print("\n[+] Evaluating Baseline 1: Naïve Forecast (lag_7 - same day last week)...")
y_pred_naive = test_df['lag_7'].values
results.append(calc_metrics(y_test, y_pred_naive, "Baseline 1: Naïve (lag_7)"))

print("[+] Evaluating Baseline 2: Moving Average (rolling_mean_7)...")
y_pred_ma = test_df['rolling_mean_7'].values
results.append(calc_metrics(y_test, y_pred_ma, "Baseline 2: 7-Day Moving Average"))

# --- 4. Machine Learning Models ---
print("\n[+] Training Model 1: Random Forest Regressor...")
rf_model = RandomForestRegressor(
    n_estimators=120,
    max_depth=14,
    min_samples_split=5,
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X_train, y_train)
y_pred_rf = rf_model.predict(X_test)
results.append(calc_metrics(y_test, y_pred_rf, "Random Forest Regressor"))

print("[+] Training Model 2: XGBoost Regressor...")
xgb_model = XGBRegressor(
    n_estimators=150,
    max_depth=6,
    learning_rate=0.08,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1
)
xgb_model.fit(X_train, y_train)
y_pred_xgb = xgb_model.predict(X_test)
results.append(calc_metrics(y_test, y_pred_xgb, "XGBoost Regressor"))

# --- 5. Summary Table ---
results_df = pd.DataFrame(results)
print("\n" + "="*60)
print("       RESEARCH EVALUATION RESULTS (TEST SET: 14 DAYS)")
print("="*60)
print(results_df.to_string(index=False))
print("="*60)

results_df.to_csv('model_evaluation_results.csv', index=False)

# --- 6. Feature Importance ---
importances = pd.DataFrame({
    'Feature': feature_cols,
    'XGBoost_Importance': xgb_model.feature_importances_
}).sort_values(by='XGBoost_Importance', ascending=False)

print("\n--- Top 10 Most Influential Demand Factors (Explainability) ---")
print(importances.head(10).to_string(index=False))

# --- 7. Select & Export Best Model ---
# Compare MAE
best_model_name = "XGBoost Regressor" if results[-1]['MAE (Portions)'] <= results[-2]['MAE (Portions)'] else "Random Forest Regressor"
best_model = xgb_model if best_model_name == "XGBoost Regressor" else rf_model

print(f"\n[✓] Best Performing Model: {best_model_name}")

# Save the trained model and feature list for the future backend API
export_bundle = {
    'model': best_model,
    'model_name': best_model_name,
    'feature_cols': feature_cols,
    'test_metrics': results_df.to_dict(orient='records'),
    'feature_importances': importances.to_dict(orient='records')
}
joblib.dump(export_bundle, 'best_food_demand_model.joblib')
print("[✓] Model bundle successfully saved to: best_food_demand_model.joblib")

# --- 8. Generate Sample Test Predictions & Kitchen Prep Recommendations ---
test_results = test_df[['date', 'item', 'item_category', 'quantity_demanded']].copy()
test_results['predicted_demand'] = np.round(np.clip(y_pred_xgb, 0, None), 2)
# Prep recommendation formula: ceil(predicted + safety buffer based on error margin)
# Safety buffer = 15% margin or at least 1 portion if predicted > 0.5
test_results['recommended_prep_qty'] = np.ceil(test_results['predicted_demand'] * 1.15).astype(int)

# Zero out prep if restaurant was closed
test_results.loc[test_df['is_closed'] == 1, ['predicted_demand', 'recommended_prep_qty']] = 0

test_results.to_csv('test_predictions_comparison.csv', index=False)
print("[✓] Saved sample predictions and preparation recommendations to: test_predictions_comparison.csv")
