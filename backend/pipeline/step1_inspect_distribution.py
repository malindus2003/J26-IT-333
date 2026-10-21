import pandas as pd

df = pd.read_csv('sales_with_context_master.csv')
df['date'] = pd.to_datetime(df['date'])

# 1. Date analysis
all_dates = pd.date_range(df['date'].min(), df['date'].max())
unique_dates = pd.to_datetime(df['date'].unique())
missing_dates = sorted(list(set(all_dates) - set(unique_dates)))
print(f"Total calendar days: {len(all_dates)}")
print(f"Days with sales: {len(unique_dates)}")
print(f"Days with zero sales (possible closed days): {len(missing_dates)}")
for d in missing_dates:
    print(f"  Closed / No sales day: {d.strftime('%Y-%m-%d (%a)')}")

# 2. Item frequency and volume analysis
item_stats = df.groupby('item').agg(
    total_qty=('total_quantity', 'sum'),
    days_present=('date', 'nunique'),
    avg_qty_when_ordered=('total_quantity', 'mean')
).sort_values(by='total_qty', ascending=False)  # type: ignore

print(f"\nTotal unique items: {len(item_stats)}")
print("\n--- Top 20 Most Ordered Items ---")
print(item_stats.head(20).to_string())

print("\n--- Item Activity Breakdown ---")
print(f"Items ordered on >= 60 days: {(item_stats['days_present'] >= 60).sum()}")
print(f"Items ordered on >= 30 days: {(item_stats['days_present'] >= 30).sum()}")
print(f"Items ordered on >= 15 days: {(item_stats['days_present'] >= 15).sum()}")
print(f"Items ordered on <= 5 days:  {(item_stats['days_present'] <= 5).sum()}")

# 3. Share of total demand
total_restaurant_qty = item_stats['total_qty'].sum()
top_20_qty = item_stats.head(20)['total_qty'].sum()
top_40_qty = item_stats.head(40)['total_qty'].sum()
top_60_qty = item_stats.head(60)['total_qty'].sum()

print("\n--- Demand Concentration ---")
print(f"Total quantities sold across all items: {total_restaurant_qty}")
print(f"Top 20 items share of total sales: {top_20_qty / total_restaurant_qty * 100:.2f}%")
print(f"Top 40 items share of total sales: {top_40_qty / total_restaurant_qty * 100:.2f}%")
print(f"Top 60 items share of total sales: {top_60_qty / total_restaurant_qty * 100:.2f}%")
