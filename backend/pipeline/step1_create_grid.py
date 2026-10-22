"""
Step 1: Create Full Time-Series Grid (Zero-Filling) for ALL 286 Menu Items across all 97 days.
Output: 'daily_item_demand_grid.csv'
"""

import pandas as pd
import numpy as np

print("[+] Step 1: Loading raw data sources...")
sales_master = pd.read_csv('sales_with_context_master.csv')
context_df = pd.read_csv('weather_and_calendar_context.csv')

# Ensure date format is standard YYYY-MM-DD string
sales_master['date'] = pd.to_datetime(sales_master['date']).dt.strftime('%Y-%m-%d')
context_df['date'] = pd.to_datetime(context_df['date']).dt.strftime('%Y-%m-%d')

# 1. Determine unique date range from POS start to POS end
start_date = sales_master['date'].min()
end_date = sales_master['date'].max()
print(f"    Date range: {start_date} to {end_date}")

# Get all unique calendar dates in this period
calendar_dates = pd.date_range(start_date, end_date).strftime('%Y-%m-%d').tolist()
print(f"    Total calendar days: {len(calendar_dates)}")

# 2. Get all unique items from the dataset (all 286 items)
unique_items = sorted(sales_master['item'].unique().tolist())
print(f"    Total menu items: {len(unique_items)}")

# Get typical unit price for each item to retain item pricing metadata
item_price_map = sales_master.groupby('item')['unit_price'].median().to_dict()

# 3. Identify closed days (dates with 0 receipts in the restaurant)
dates_with_sales = set(sales_master['date'].unique())
closed_dates = set(calendar_dates) - dates_with_sales
print(f"    Closed / non-operating dates: {sorted(list(closed_dates))}")

# 4. Generate complete Cartesian product grid: (Dates x Items)
print("[+] Generating complete Cartesian grid (All Dates x All Items)...")
index = pd.MultiIndex.from_product([calendar_dates, unique_items], names=['date', 'item'])
grid_df = pd.DataFrame(index=index).reset_index()

# Total rows expected: len(calendar_dates) * len(unique_items)
print(f"    Grid rows: {len(grid_df)} ({len(calendar_dates)} days x {len(unique_items)} items)")

# 5. Merge actual sales quantities into the grid
actual_sales = sales_master[['date', 'item', 'total_quantity', 'total_sales']].copy()
grid_df = pd.merge(grid_df, actual_sales, on=['date', 'item'], how='left')

# Fill missing quantities and sales with 0
grid_df['quantity_demanded'] = grid_df['total_quantity'].fillna(0).astype(int)
grid_df['total_sales'] = grid_df['total_sales'].fillna(0)
grid_df = grid_df.drop(columns=['total_quantity'])

# Add unit price
grid_df['unit_price'] = grid_df['item'].map(item_price_map)  # type: ignore

# Add restaurant operating status flag
grid_df['is_closed'] = grid_df['date'].apply(lambda d: 1 if d in closed_dates else 0)

# 6. Merge with weather, calendar, and Sri Lankan holiday context
print("[+] Merging weather, calendar, and Sri Lankan holiday context...")
grid_df = pd.merge(grid_df, context_df, on='date', how='left')

# 7. Add item category / menu section feature based on item name naming convention
def extract_category(item_name):
    # Items with leading number (e.g. '01 Hot Butter...', '117 Margherita...')
    parts = item_name.strip().split(' ', 1)
    if parts[0].isdigit():
        code = int(parts[0])
        if code < 10:
            return 'Appetizer / Starter'
        elif code < 20:
            return 'Salad & Soup'
        elif code < 40:
            return 'Soup & Asian Main'
        elif code < 60:
            return 'Grill & Seafood'
        elif code < 100:
            return 'Sides & Bites'
        elif code < 110:
            return 'Dessert'
        elif code < 150:
            return 'Pizza'
        else:
            return 'Main Course'
    
    # Beverage / Cocktail categorization
    item_lower = item_name.lower()
    if any(k in item_lower for k in ['beer', 'wine', 'cocktail', 'mojito', 'colada', 'gin', 'vodka', 'rum', 'whisky', 'shot']):
        return 'Alcoholic Beverage'
    elif any(k in item_lower for k in ['smoothie', 'juice', 'shake', 'water', 'coca', 'cola', 'soda', 'tea', 'coffee', 'cappuccino', 'latte', 'espresso']):
        return 'Non-Alcoholic Beverage'
    else:
        return 'Other'

grid_df['item_category'] = grid_df['item'].apply(extract_category)

# 8. Sort chronologically by item and date for clean time-series structure
grid_df = grid_df.sort_values(by=['item', 'date']).reset_index(drop=True)

# Save output
output_file = 'daily_item_demand_grid.csv'
grid_df.to_csv(output_file, index=False)
print(f"[✓] Successfully saved completed grid to: {output_file}")
print(f"    Final shape: {grid_df.shape}")
print(f"\n--- Preview of Category Breakdown ---")
print(grid_df.groupby('item_category')['quantity_demanded'].sum().sort_values(ascending=False))  # type: ignore
