"""
Public Kaggle Datasets Downloader & Manager
Project: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)

This utility helps download popular Kaggle datasets used as research benchmarks.
Requirements:
1. Place your 'kaggle.json' API key in:
   - Windows: C:\\Users\\<YourUser>\\.kaggle\\kaggle.json
2. Run this script:
   python backend/app/data/public_benchmarks/download_kaggle_datasets.py --dataset <dataset_key>

Available Dataset Keys:
- fruits_fresh_rotten: "sriramr/fruits-fresh-and-rotten-for-classification" (~2.1 GB)
- fruits_veg_fresh_rotten: "raghavrbi/fresh-and-rotten-fruits-and-vegetables" (~1.8 GB)
- waste_classification: "techsash/waste-classification-data" (~215 MB)
- recruit_demand: "c/recruit-restaurant-visitor-forecasting"
"""

import os
import sys
import argparse
import subprocess

DATASETS = {
    "fruits_fresh_rotten": {
        "id": "sriramr/fruits-fresh-and-rotten-for-classification",
        "description": "Kaggle Fruits Fresh and Rotten (~13,500 images of apples, bananas, oranges)",
        "type": "dataset"
    },
    "fruits_veg_fresh_rotten": {
        "id": "raghavrbi/fresh-and-rotten-fruits-and-vegetables",
        "description": "Kaggle Fresh and Rotten Fruits & Vegetables (multi-class produce)",
        "type": "dataset"
    },
    "waste_classification": {
        "id": "techsash/waste-classification-data",
        "description": "Kaggle Waste Classification (~25,000 images: Organic vs Recyclable)",
        "type": "dataset"
    },
    "recruit_demand": {
        "id": "recruit-restaurant-visitor-forecasting",
        "description": "Kaggle Recruit Restaurant Visitor Forecasting (POS reservations & covers)",
        "type": "competition"
    }
}

def check_kaggle_creds():
    home_dir = os.path.expanduser("~")
    kaggle_json = os.path.join(home_dir, ".kaggle", "kaggle.json")
    if not os.path.exists(kaggle_json):
        print("\n" + "!" * 70)
        print("  NOTICE: 'kaggle.json' was not found at:")
        print(f"  {kaggle_json}")
        print("\n  To download directly from Kaggle:")
        print("  1. Log in to https://www.kaggle.com")
        print("  2. Go to 'Account' -> 'API' -> click 'Create New Token'")
        print(f"  3. Move the downloaded 'kaggle.json' into '{os.path.join(home_dir, '.kaggle')}'")
        print("!" * 70 + "\n")
        return False
    return True

def download_dataset(dataset_key):
    if dataset_key not in DATASETS:
        print(f"Unknown dataset key: '{dataset_key}'. Choose from: {list(DATASETS.keys())}")
        return

    info = DATASETS[dataset_key]
    out_dir = os.path.join(os.path.dirname(__file__), dataset_key)
    os.makedirs(out_dir, exist_ok=True)

    print(f"Target: {info['description']}")
    print(f"Destination: {out_dir}")

    if not check_kaggle_creds():
        print("Aborting Kaggle download until 'kaggle.json' is placed.")
        return

    if info["type"] == "dataset":
        cmd = [sys.executable, "-m", "kaggle", "datasets", "download", "-d", info["id"], "-p", out_dir, "--unzip"]
    else:
        cmd = [sys.executable, "-m", "kaggle", "competitions", "download", "-c", info["id"], "-p", out_dir]

    print(f"Executing: {' '.join(cmd)}")
    subprocess.run(cmd)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Kaggle Dataset Downloader for J26-IT-333")
    parser.add_argument("--dataset", choices=list(DATASETS.keys()), default="fruits_fresh_rotten",
                        help="Choose which dataset to download")
    parser.add_argument("--list", action="store_true", help="List all available benchmark datasets")
    args = parser.parse_args()

    if args.list:
        print("Available datasets:")
        for k, v in DATASETS.items():
            print(f"  --dataset {k:<25} : {v['description']}")
    else:
        download_dataset(args.dataset)
