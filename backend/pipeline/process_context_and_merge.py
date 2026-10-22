"""
Script: process_context_and_merge.py
Description:
1. Loads raw weather data (Open-Meteo).
2. Generates comprehensive calendar features (Day of week, Month, Weekend, Payday period).
3. Adds Sri Lankan holiday flags (Public Holidays, Full Moon Poya days).
4. Saves enriched weather + calendar + holiday table: 'weather_and_calendar_context.csv'.
5. Cleans and fixes sales data date anomalies (e.g. 2036-03-05 -> 2026-03-05).
6. Merges daily sales with contextual features: 'sales_with_context_master.csv'.
"""

import sys
import os
import holidays  # type: ignore
import pandas as pd
import numpy as np

# Dictionary of Sri Lankan holidays (English translations for 2026)
LK_HOLIDAYS_EN = {
    '2026-01-03': 'Duruthu Full Moon Poya Day',
    '2026-01-15': 'Tamil Thai Pongal Day',
    '2026-02-01': 'Navam Full Moon Poya Day',
    '2026-02-04': 'National Independence Day',
    '2026-02-15': 'Maha Sivarathri Day',
    '2026-03-02': 'Medin Full Moon Poya Day',
    '2026-03-21': 'Id-Ul-Fitr (Ramazan)',
    '2026-04-01': 'Bak Full Moon Poya Day',
    '2026-04-03': 'Good Friday',
    '2026-04-13': 'Day prior to Sinhala and Tamil New Year Day',
    '2026-04-14': 'Sinhala and Tamil New Year Day',
    '2026-05-01': 'May Day / Vesak Full Moon Poya Day',
    '2026-05-02': 'Day following Vesak Full Moon Poya Day',
    '2026-05-28': 'Id-Ul-Alha (Hadji Festival Day)',
    '2026-05-30': 'Adhi Poson Full Moon Poya Day',
    '2026-06-29': 'Poson Full Moon Poya Day',
    '2026-07-29': 'Esala Full Moon Poya Day',
    '2026-08-26': 'Milad-Un-Nabi (Holy Prophet Birthday)',
    '2026-08-27': 'Nikini Full Moon Poya Day',
    '2026-09-26': 'Binara Full Moon Poya Day',
    '2026-10-25': 'Vap Full Moon Poya Day',
    '2026-11-08': 'Deepavali Festival Day',
    '2026-11-24': 'Il Full Moon Poya Day',
    '2026-12-23': 'Unduvap Full Moon Poya Day',
    '2026-12-25': 'Christmas Day',
}

def load_and_process_weather(weather_path="weather data.csv"):
    print(f"[+] Loading weather data from {weather_path}...")
    # Skip metadata rows at the beginning
    df = pd.read_csv(weather_path, skiprows=3)
    df = df.dropna(how='all', axis=1)
    df.columns = [c.strip() for c in df.columns]

    # Standardize column names
    col_mapping = {
        'time': 'date',
        'weather_code (wmo code)': 'weather_code',
        'rain_sum (mm)': 'rain_sum_mm',
        'precipitation_sum (mm)': 'precipitation_sum_mm',
    }
    # Look for temperature column (which might contain degree symbol)
    for c in df.columns:
        if 'temperature' in c.lower():
            col_mapping[c] = 'temperature_mean_c'
        elif 'weather_code' in c.lower():
            col_mapping[c] = 'weather_code'
        elif 'rain_sum' in c.lower():
            col_mapping[c] = 'rain_sum_mm'
        elif 'precipitation_sum' in c.lower():
            col_mapping[c] = 'precipitation_sum_mm'
        elif c.lower() == 'time':
            col_mapping[c] = 'date'

    df = df.rename(columns=col_mapping)
    df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
    
    # Fill numeric columns properly
    num_cols = ['weather_code', 'temperature_mean_c', 'rain_sum_mm', 'precipitation_sum_mm']
    for c in num_cols:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors='coerce')

    # Rainfall indicator feature
    df['is_rainy'] = (df['rain_sum_mm'] > 1.0).astype(int)
    
    return df

def add_calendar_and_holiday_features(df, date_col='date'):
    print("[+] Generating calendar and holiday features...")
    dates = pd.to_datetime(df[date_col])
    
    # 1. Calendar features
    df['year'] = dates.dt.year
    df['month'] = dates.dt.month
    df['day'] = dates.dt.day
    df['day_of_week'] = dates.dt.dayofweek  # 0=Monday, 6=Sunday
    df['day_name'] = dates.dt.day_name()
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    df['week_of_year'] = dates.dt.isocalendar().week.astype(int)
    df['is_month_start'] = dates.dt.is_month_start.astype(int)
    df['is_month_end'] = dates.dt.is_month_end.astype(int)
    
    # Payday / Salary surge period in Sri Lanka (25th to end of month, plus 1st-2nd)
    df['is_salary_period'] = df['day'].apply(lambda d: 1 if (25 <= d <= 31 or 1 <= d <= 2) else 0)

    # 2. Sri Lankan Holiday features
    years = dates.dt.year.unique().tolist()
    sl_holidays_pkg = holidays.country_holidays('LK', years=years)

    def get_holiday_info(d_str):
        # Check explicit English map first
        if d_str in LK_HOLIDAYS_EN:
            name_en = LK_HOLIDAYS_EN[d_str]
            is_hol = 1
            is_poya = 1 if 'Poya' in name_en else 0
            return is_hol, name_en, is_poya
        
        # Check holidays package
        d_obj = pd.to_datetime(d_str).date()
        if d_obj in sl_holidays_pkg:
            raw_name = str(sl_holidays_pkg.get(d_obj))
            is_poya = 1 if ('පෝය' in raw_name or 'poya' in raw_name.lower()) else 0
            return 1, raw_name, is_poya

        return 0, 'None', 0

    holiday_results = [get_holiday_info(d) for d in df[date_col]]
    df['is_holiday'] = [h[0] for h in holiday_results]
    df['holiday_name'] = [h[1] for h in holiday_results]
    df['is_poya'] = [h[2] for h in holiday_results]

    return df

def merge_with_sales_summary(context_df, sales_summary_path="sales_summary_by_date.csv"):
    if not os.path.exists(sales_summary_path):
        print(f"[-] Warning: {sales_summary_path} not found. Skipping merge.")
        return None

    print(f"[+] Loading and cleaning sales summary from {sales_summary_path}...")
    sales_df = pd.read_csv(sales_summary_path)

    # Clean date strings and fix typo '2036-03-05' -> '2026-03-05'
    def parse_and_fix_date(date_val):
        d_str = str(date_val).strip()
        if '2036' in d_str:
            d_str = d_str.replace('2036', '2026')
        return pd.to_datetime(d_str).strftime('%Y-%m-%d')

    sales_df['date'] = sales_df['Date'].apply(parse_and_fix_date)
    sales_df = sales_df.drop(columns=['Date'])

    # Standardize column names
    sales_df.columns = [c.lower() for c in sales_df.columns]

    print("[+] Merging sales with contextual data...")
    merged_df = pd.merge(sales_df, context_df, on='date', how='left')
    return merged_df

def main():
    # 1. Process Weather & Calendar
    weather_df = load_and_process_weather('weather data.csv')
    context_df = add_calendar_and_holiday_features(weather_df, date_col='date')

    # Save standalone context file
    context_output = 'weather_and_calendar_context.csv'
    context_df.to_csv(context_output, index=False)
    print(f"[✓] Saved enriched context data to: {context_output} ({len(context_df)} days)")

    # 2. Merge with Sales Data
    merged_df = merge_with_sales_summary(context_df, 'sales_summary_by_date.csv')
    if merged_df is not None:
        merged_output = 'sales_with_context_master.csv'
        merged_df.to_csv(merged_output, index=False)
        print(f"[✓] Saved master dataset to: {merged_output} ({len(merged_df)} rows)")

    # Print summary of holidays detected
    print("\n--- Detected Sri Lankan Holidays in the Date Range ---")
    holidays_found = context_df[context_df['is_holiday'] == 1][['date', 'holiday_name', 'day_name', 'is_poya']]
    print(holidays_found.to_string(index=False))  # type: ignore

if __name__ == '__main__':
    main()
