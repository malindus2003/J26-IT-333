import csv
import math
import numpy as np
import pandas as pd
from datetime import datetime
from collections import defaultdict
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

print("=== SPRINT 2: WORKLOAD PREDICTION (RANDOM FOREST) & EVALUATION ===")

input_file = 'kitchen_workload_processed.csv'
output_prediction_file = 'predicted_daily_workload.csv'

daily_data = defaultdict(lambda: defaultdict(int))
all_dates = set()

# 1. දත්ත කියවීම
with open(input_file, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        date_str = row['Date'].split(' ')[0] if ' ' in row['Date'] else row['Date']
        station = row['Station']
        qty = int(row['Quantity'])
        
        if station != 'Bar & Beverage':
            daily_data[date_str]['Total_Kitchen_Food'] += qty
            daily_data[date_str][station] += qty
            
        all_dates.add(date_str)

def parse_date(d_str):
    for fmt in ('%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%d.%m.%Y'):
        try:
            return datetime.strptime(d_str, fmt)
        except ValueError:
            pass
    return datetime.today()

sorted_dates = sorted(list(all_dates), key=parse_date)

# 2. Features සකස් කිරීම (Feature Engineering)
records = []
for i in range(len(sorted_dates)):
    curr_date = sorted_dates[i]
    dt = parse_date(curr_date)
    y = daily_data[curr_date]['Total_Kitchen_Food']
    
    if i >= 3:
        lag_1 = daily_data[sorted_dates[i-1]]['Total_Kitchen_Food']
        lag_2 = daily_data[sorted_dates[i-2]]['Total_Kitchen_Food']
        lag_3 = daily_data[sorted_dates[i-3]]['Total_Kitchen_Food']
        rolling_avg_3 = (lag_1 + lag_2 + lag_3) / 3.0
        day_of_week = dt.weekday()
        is_weekend = 1 if day_of_week in [4, 5, 6] else 0
        
        records.append({
            'date': curr_date,
            'features': [lag_1, lag_2, lag_3, rolling_avg_3, day_of_week, is_weekend],
            'actual': y
        })

# 3. Train / Test Split (80% Train, 20% Test)
split = int(len(records) * 0.8)
train_set = records[:split]
test_set = records[split:]

X_train = [r['features'] for r in train_set]
y_train = [r['actual'] for r in train_set]

X_test = [r['features'] for r in test_set]
y_test = [r['actual'] for r in test_set]

# 4. Random Forest Regressor Model එක Train කිරීම
rf_model = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
rf_model.fit(X_train, y_train)

# 5. Model Evaluation Metrics (MAE, RMSE, MAPE)
y_test_pred = rf_model.predict(X_test)

mae = mean_absolute_error(y_test, y_test_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
mape = np.mean(np.abs((np.array(y_test) - np.array(y_test_pred)) / np.array(y_test))) * 100

print("\n--- MODEL EVALUATION METRICS (TEST SET) ---")
print(f"MAE  (Mean Absolute Error):        {mae:.2f}")
print(f"RMSE (Root Mean Squared Error):    {rmse:.2f}")
print(f"MAPE (Mean Absolute Percentage):   {mape:.2f}%")
print("-------------------------------------------\n")

# 6. සම්පූර්ණ දත්ත සඳහා Predictions ලබා ගැනීම සහ Export කිරීම
all_X = [r['features'] for r in records]
all_preds = rf_model.predict(all_X)

export_rows = []
for r, pred in zip(records, all_preds):
    pred_total = max(5.0, float(pred))
    export_rows.append({
        'Date': r['date'],
        'Actual_Total_Load': r['actual'],
        'Predicted_Total_Load': round(pred_total, 1),
        'Hot_Kitchen_Est_Load': round(pred_total * 0.53, 1),
        'Grill_Est_Load': round(pred_total * 0.15, 1),
        'Cold_Salad_Est_Load': round(pred_total * 0.14, 1),
        'Pizza_Est_Load': round(pred_total * 0.12, 1),
        'Fryer_Est_Load': round(pred_total * 0.06, 1)
    })

with open(output_prediction_file, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=export_rows[0].keys())
    writer.writeheader()
    writer.writerows(export_rows)

print(f"--- SUCCESS! ---")
print(f"Predictions successfully exported to '{output_prediction_file}' ({len(export_rows)} rows)!")