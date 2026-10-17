"""
Step 2: Feature Engineering
Calculates:
- Item-level lag features (t-1, t-2, t-3, t-7, t-14)
- Item-level rolling statistics (7-day mean, 7-day std, 14-day mean, 7-day max)
- Category-level demand lags (t-1, t-7)
- Restaurant-level total footfall/sales lags (t-1, t-7)
- Encodes item and category IDs
Output: 'engineered_features_master.csv'
"""

import pandas as pd
import numpy as np

print("[+] Step 2: Loading grid dataset...")
df = pd.read_csv('daily_item_demand_grid.csv')
df['date'] = pd.to_datetime(df['date'])

# Ensure sorting by item and date for accurate lag calculations
df = df.sort_values(by=['item', 'date']).reset_index(drop=True)

# 1. Item-Level Demand Lags
print("[+] Generating item-level lag features...")
# Using shift(k) within each item group
df['lag_1'] = df.groupby('item')['quantity_demanded'].shift(1)
df['lag_2'] = df.groupby('item')['quantity_demanded'].shift(2)
df['lag_3'] = df.groupby('item')['quantity_demanded'].shift(3)
df['lag_7'] = df.groupby('item')['quantity_demanded'].shift(7)
df['lag_14'] = df.groupby('item')['quantity_demanded'].shift(14)

# 2. Item-Level Rolling Statistics (using shifted series to prevent data leakage)
print("[+] Generating item-level rolling window statistics (past 7 & 14 days)...")
shifted_qty = df.groupby('item')['quantity_demanded'].shift(1)

# Groupby rolling requires grouping on item
df['rolling_mean_7'] = shifted_qty.groupby(df['item']).transform(lambda x: x.rolling(7, min_periods=1).mean())
df['rolling_std_7'] = shifted_qty.groupby(df['item']).transform(lambda x: x.rolling(7, min_periods=1).std()).fillna(0)
df['rolling_max_7'] = shifted_qty.groupby(df['item']).transform(lambda x: x.rolling(7, min_periods=1).max())
df['rolling_mean_14'] = shifted_qty.groupby(df['item']).transform(lambda x: x.rolling(14, min_periods=1).mean())

# 3. Category-Level Total Demand Dynamics
print("[+] Generating category-level demand aggregations & lags...")
cat_daily = df.groupby(['item_category', 'date'])['quantity_demanded'].sum().reset_index()
cat_daily = cat_daily.sort_values(by=['item_category', 'date']).reset_index(drop=True)
cat_daily['cat_demand_lag_1'] = cat_daily.groupby('item_category')['quantity_demanded'].shift(1)
cat_daily['cat_demand_lag_7'] = cat_daily.groupby('item_category')['quantity_demanded'].shift(7)
cat_daily = cat_daily.drop(columns=['quantity_demanded'])

# Merge category lags back into main df
df = pd.merge(df, cat_daily, on=['item_category', 'date'], how='left')

# 4. Total Restaurant Daily Demand Lags (Proxy for general restaurant busyness / footfall)
print("[+] Generating restaurant total footfall/demand lags...")
rest_daily = df.groupby('date')['quantity_demanded'].sum().reset_index()
rest_daily = rest_daily.sort_values(by='date').reset_index(drop=True)
rest_daily['rest_total_lag_1'] = rest_daily['quantity_demanded'].shift(1)
rest_daily['rest_total_lag_7'] = rest_daily['quantity_demanded'].shift(7)
rest_daily = rest_daily.drop(columns=['quantity_demanded'])

# Merge restaurant lags back
df = pd.merge(df, rest_daily, on='date', how='left')

# 5. Label Encoding for Item and Category
print("[+] Assigning numerical identifiers for Machine Learning models...")
df['item_id'] = df['item'].astype('category').cat.codes
df['category_id'] = df['item_category'].astype('category').cat.codes

# 6. Filter Warm-Up Period
# The first 14 days (Jan 1 - Jan 14) are used to populate lag_14 and rolling_mean_14
print("[+] Filtering out warm-up period (first 14 days)...")
pre_filter_len = len(df)
df_clean = df.dropna(subset=['lag_14']).copy()
post_filter_len = len(df_clean)

# Format date string back to YYYY-MM-DD
df_clean['date'] = df_clean['date'].dt.strftime('%Y-%m-%d')

output_file = 'engineered_features_master.csv'
df_clean.to_csv(output_file, index=False)
print(f"[✓] Feature Engineering Complete!")
print(f"    Saved to: {output_file}")
print(f"    Original rows: {pre_filter_len} -> Filtered clean rows: {post_filter_len}")
print(f"    Effective operational date range: {df_clean['date'].min()} to {df_clean['date'].max()} ({df_clean['date'].nunique()} days)")
print(f"    Total features engineered: {df_clean.shape[1]} columns")

print("\n--- Feature Columns List ---")
print(list(df_clean.columns))
