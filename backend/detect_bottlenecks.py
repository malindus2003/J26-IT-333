import csv
import math
from collections import defaultdict

print("=== SPRINT 3: KITCHEN BOTTLENECK & ANOMALY DETECTION ===")

input_file = 'kitchen_workload_processed.csv'
output_file = 'kitchen_bottlenecks_detected.csv'

daily_station_load = defaultdict(lambda: defaultdict(int))
all_dates = set()

# 1. Read processed sales dataset
with open(input_file, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        date_str = row['Date'].split(' ')[0] if ' ' in row['Date'] else row['Date']
        station = row['Station']
        qty = int(row['Quantity'])
        
        daily_station_load[date_str][station] += qty
        all_dates.add(date_str)

sorted_dates = sorted(list(all_dates))
stations = ['Hot Kitchen / Saute', 'Grill Station', 'Cold & Salad Station', 'Pizza Station', 'Fryer Station']

# 2. Calculate Statistical Thresholds per Station (Mean + 1.5 * StdDev)
station_stats = {}
for st in stations:
    values = [daily_station_load[d][st] for d in sorted_dates]
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    std_dev = math.sqrt(variance)
    
    threshold = round(mean + 1.5 * std_dev, 1)
    station_stats[st] = {
        'mean': round(mean, 1),
        'std_dev': round(std_dev, 1),
        'threshold': threshold
    }

print("\n--- STATION BOTTLENECK THRESHOLDS ---")
for st, s in station_stats.items():
    print(f" • {st:<22}: Average = {s['mean']:<5} | Threshold Limit = {s['threshold']:<5} items")

# 3. Detect Overloads and Tag Bottlenecks
results = []
bottleneck_counts = defaultdict(int)

for d in sorted_dates:
    day_bottlenecks = []
    station_loads = {}
    
    for st in stations:
        load = daily_station_load[d][st]
        station_loads[st] = load
        
        # If workload exceeds threshold, mark as a bottleneck
        if load > station_stats[st]['threshold']:
            day_bottlenecks.append(st)
            bottleneck_counts[st] += 1
            
    is_anomaly = 1 if len(day_bottlenecks) >= 2 else 0
    primary_bottleneck = day_bottlenecks[0] if day_bottlenecks else "None"
    
    results.append({
        'Date': d,
        'Hot_Kitchen_Load': station_loads['Hot Kitchen / Saute'],
        'Grill_Load': station_loads['Grill Station'],
        'Cold_Salad_Load': station_loads['Cold & Salad Station'],
        'Pizza_Load': station_loads['Pizza Station'],
        'Fryer_Load': station_loads['Fryer Station'],
        'Bottleneck_Stations': ", ".join(day_bottlenecks) if day_bottlenecks else "None",
        'Primary_Bottleneck': primary_bottleneck,
        'Is_Severe_Anomaly': is_anomaly
    })

# 4. Export findings to CSV
with open(output_file, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=results[0].keys())
    writer.writeheader()
    writer.writerows(results)

print(f"\n--- SUCCESS! ---")
print(f"Bottleneck detection file created: '{output_file}' ({len(results)} days analyzed).")
print("\nBottleneck Frequency Breakdown:")
for st, cnt in bottleneck_counts.items():
    print(f" - {st}: {cnt} peak overload days detected")