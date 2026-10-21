import os
import glob
import re
import csv
import email
from email import policy
from datetime import datetime
from collections import defaultdict


def parse_order_date(body_text, fallback_date_str=None):
    """
    Extracts the Order Date from the receipt (e.g. 'Order: 01.01.2026').
    Handles potential manual typos like '3036' -> '2026'.
    Returns (iso_date_str 'YYYY-MM-DD', raw_date_str 'DD.MM.YYYY').
    """
    m_order = re.search(r'Order:\s*([0-9]{2}\.[0-9]{2}\.[0-9]{4})', body_text)
    if m_order:
        raw_date = m_order.group(1).strip()
        # Correct known single-digit typos in year if any (e.g., 3036 -> 2026)
        parts = raw_date.split('.')
        day, month, year = parts[0], parts[1], parts[2]
        if year.startswith('30'):
            year = '20' + year[2:]
        fixed_raw_date = f"{day}.{month}.{year}"
        try:
            dt = datetime.strptime(fixed_raw_date, "%d.%m.%Y")
            return dt.strftime("%Y-%m-%d"), fixed_raw_date
        except ValueError:
            pass

    # Fallback to footer date (DD/MM/YYYY) if Order date is missing
    m_footer = re.search(r'(\d{2})/(\d{2})/(\d{4})\s+\d{2}:\d{2}', body_text)
    if m_footer:
        day, month, year = m_footer.group(1), m_footer.group(2), m_footer.group(3)
        if year.startswith('30'):
            year = '20' + year[2:]
        try:
            dt = datetime.strptime(f"{day}.{month}.{year}", "%d.%m.%Y")
            return dt.strftime("%Y-%m-%d"), f"{day}.{month}.{year}"
        except ValueError:
            pass

    return "Unknown", "Unknown"


def extract_receipt_number(body_text):
    """Extracts receipt number (e.g., '№ 4-0001') if present."""
    m_num = re.search(r'№\s*([0-9A-Za-z-]+)', body_text)
    return m_num.group(1).strip() if m_num else ""


def parse_items(body_text):
    """
    Extracts menu item, line total, quantity, and unit price from receipt HTML.
    Matches pattern:
    <td><p>Item Name</p></td><td></td><td><p>RsPrice</p></td>...<td><p>Qty × RsUnitPrice</p></td>
    """
    pattern = re.compile(
        r'<td[^>]*>\s*<p[^>]*>\s*([^<]+?)\s*</p>\s*</td>\s*'
        r'<td[^>]*></td>\s*'
        r'<td[^>]*>\s*<p[^>]*>\s*Rs([\d,]+(?:\.\d+)?)\s*</p>\s*</td>\s*'
        r'</tr>\s*<tr>\s*'
        r'<td[^>]*>\s*<p[^>]*>\s*([\d.]+)\s*[×\xd7]\s*Rs([\d,]+(?:\.\d+)?)\s*</p>',
        re.DOTALL
    )

    items = []
    for match in pattern.finditer(body_text):
        item_name = match.group(1).strip()
        line_total_str = match.group(2).replace(',', '').strip()
        qty_str = match.group(3).strip()
        unit_price_str = match.group(4).replace(',', '').strip()

        # Parse quantity
        qty = float(qty_str) if '.' in qty_str else int(qty_str)

        # Parse prices
        unit_price = float(unit_price_str)
        line_total = float(line_total_str)

        # Clean integer prices if no decimal component
        if unit_price.is_integer():
            unit_price = int(unit_price)
        if line_total.is_integer():
            line_total = int(line_total)

        items.append({
            'item_name': item_name,
            'quantity': qty,
            'unit_price': unit_price,
            'line_total': line_total
        })

    return items


def process_folder(folder_path=".", 
                   output_detailed_csv="sales_data.csv", 
                   output_summary_csv="sales_summary_by_date.csv"):
    """
    Processes all .eml files in folder_path, extracts receipt items,
    combines all data by date, and saves both detailed and daily aggregated CSV files.
    """
    search_path = os.path.join(folder_path, "*.eml")
    eml_files = glob.glob(search_path)
    if not eml_files:
        print(f"No .eml files found in {os.path.abspath(folder_path)}")
        return

    print(f"Found {len(eml_files)} .eml receipt files in {os.path.abspath(folder_path)}")

    detailed_records = []
    # Daily aggregation: (date, item_name) -> {'qty': 0, 'total': 0.0, 'prices': set()}
    daily_aggregated = defaultdict(lambda: {'qty': 0, 'total': 0.0, 'prices': set()})

    for fpath in eml_files:
        fname = os.path.basename(fpath)
        with open(fpath, 'rb') as fp:
            msg = email.message_from_binary_file(fp, policy=policy.default)

        body = msg.get_body(preferencelist=('html', 'plain'))
        if not body:
            print(f"Warning: Could not read body for {fname}")
            continue

        body_content = body.get_content()
        date_iso, date_raw = parse_order_date(body_content)
        receipt_num = extract_receipt_number(body_content)
        items = parse_items(body_content)

        if not items:
            print(f"Warning: No items found in {fname}")

        for it in items:
            record = {
                'Date': date_iso,
                'Receipt_Date_Raw': date_raw,
                'Receipt_Number': receipt_num,
                'Item': it['item_name'],
                'Quantity': it['quantity'],
                'Unit_Price': it['unit_price'],
                'Total_Price': it['line_total'],
                'Source_File': fname
            }
            detailed_records.append(record)

            # Daily item aggregate
            agg_key = (date_iso, it['item_name'])
            daily_aggregated[agg_key]['qty'] += it['quantity']
            daily_aggregated[agg_key]['total'] += it['line_total']
            daily_aggregated[agg_key]['prices'].add(it['unit_price'])

    # 1. Sort detailed records chronologically by Date, then Item name
    detailed_records.sort(key=lambda r: (r['Date'], r['Item'], r['Receipt_Number']))

    # Write sales_data.csv (detailed transactions combined by date)
    detailed_csv_path = os.path.join(folder_path, output_detailed_csv)
    with open(detailed_csv_path, 'w', newline='', encoding='utf-8') as f:
        fieldnames = [
            'Date',
            'Receipt_Date_Raw',
            'Receipt_Number',
            'Item',
            'Quantity',
            'Unit_Price',
            'Total_Price',
            'Source_File'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(detailed_records)

    # 2. Daily item-wise summary
    summary_records = []
    for (date_iso, item_name), data in daily_aggregated.items():
        # Representative unit price (if consistent, otherwise average)
        avg_unit_price = data['total'] / data['qty'] if data['qty'] else 0
        if avg_unit_price.is_integer():
            avg_unit_price = int(avg_unit_price)
        else:
            avg_unit_price = round(avg_unit_price, 2)

        tot_sales = data['total']
        if isinstance(tot_sales, float) and tot_sales.is_integer():
            tot_sales = int(tot_sales)

        summary_records.append({
            'Date': date_iso,
            'Item': item_name,
            'Total_Quantity': data['qty'],
            'Unit_Price': avg_unit_price,
            'Total_Sales': tot_sales
        })

    summary_records.sort(key=lambda r: (r['Date'], r['Item']))

    # Write sales_summary_by_date.csv (clean item-wise daily summary)
    summary_csv_path = os.path.join(folder_path, output_summary_csv)
    with open(summary_csv_path, 'w', newline='', encoding='utf-8') as f:
        fieldnames = [
            'Date',
            'Item',
            'Total_Quantity',
            'Unit_Price',
            'Total_Sales'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(summary_records)

    # Output stats
    total_sales_sum = sum(r['Total_Price'] for r in detailed_records)
    print("\n" + "=" * 55)
    print("EXTRACTION COMPLETE")
    print("=" * 55)
    print(f"Total .eml receipts processed : {len(eml_files)}")
    print(f"Total line items extracted    : {len(detailed_records):,}")
    print(f"Unique dates processed        : {len(set(r['Date'] for r in detailed_records))}")
    print(f"Total Sales across receipts   : Rs {total_sales_sum:,.2f}")
    print(f"\nGenerated files:")
    print(f" 1. Detailed transactions     : {output_detailed_csv} ({len(detailed_records):,} rows)")
    print(f" 2. Item-wise daily totals    : {output_summary_csv} ({len(summary_records):,} rows)")
    print("=" * 55 + "\n")


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description="Extract receipt data from .eml files into CSV.")
    parser.add_argument('-d', '--folder', default='.', help="Folder containing .eml files (default: current directory)")
    parser.add_argument('-o', '--output', default='sales_data.csv', help="Output CSV for detailed items (default: sales_data.csv)")
    parser.add_argument('-s', '--summary', default='sales_summary_by_date.csv', help="Output CSV for daily item-wise summary (default: sales_summary_by_date.csv)")
    args = parser.parse_args()

    process_folder(
        folder_path=args.folder,
        output_detailed_csv=args.output,
        output_summary_csv=args.summary
    )
