#!/usr/bin/env python3
"""
Roboflow Dataset Automation Manager for Component 4: Smart Waste Bin
SLIIT IT4010 Research Project 2026 (Group J26-IT-333)

Automates the complete Roboflow lifecycle for Food Waste Recognition:
1. Workspace & Project Inspection (runeths-workspace / smart-waste-bin-food-recogniti)
2. Class mapping synchronization for 7 canonical classes
3. Batch upload of images and annotations
4. AutoLabel job configuration and human review workflow
5. Dataset version generation (70% Train, 15% Val, 15% Test)
6. Automated download & sync to local datasets/food_waste/
7. Automated dataset validation report generation
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Add backend directory to sys.path
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Load environment variables from backend/.env if present
load_dotenv(BACKEND_DIR / ".env")

from import_roboflow_dataset import import_roboflow_data
from validate_dataset import validate_yolo_dataset, EXPECTED_CLASSES

DEFAULT_WORKSPACE = "runeths-workspace"
DEFAULT_PROJECT = "smart-waste-bin-food-recogniti"


class RoboflowDatasetManager:
    def __init__(
        self,
        api_key: Optional[str] = None,
        workspace_name: str = DEFAULT_WORKSPACE,
        project_name: str = DEFAULT_PROJECT
    ):
        self.api_key = api_key or os.getenv("ROBOFLOW_API_KEY")
        self.workspace_name = workspace_name or os.getenv("ROBOFLOW_WORKSPACE", DEFAULT_WORKSPACE)
        self.project_name = project_name or os.getenv("ROBOFLOW_PROJECT", DEFAULT_PROJECT)
        self.rf = None
        self.workspace = None
        self.project = None

    def _check_api_key(self) -> bool:
        if not self.api_key or self.api_key.strip() in ["", "your_roboflow_private_api_key_here"]:
            print("\n" + "=" * 70)
            print("  [!] ROBOFLOW_API_KEY REQUIRED")
            print("=" * 70)
            print("To interact with your Roboflow workspace, an API key is required.")
            print("\nPlease set your Roboflow Private API Key using one of the following methods:")
            print("\n1. In your PowerShell terminal before running the script:")
            print('   $env:ROBOFLOW_API_KEY="your_private_api_key_here"')
            print("\n2. In the backend/.env file (protected by .gitignore):")
            print('   ROBOFLOW_API_KEY="your_private_api_key_here"')
            print("   ROBOFLOW_WORKSPACE=\"runeths-workspace\"")
            print("   ROBOFLOW_PROJECT=\"smart-waste-bin-food-recogniti\"")
            print("\nHow to obtain your Roboflow API Key:")
            print("  1. Log in to https://app.roboflow.com")
            print("  2. Click your profile icon at top-right -> 'Roboflow API'")
            print("  3. Copy your 'Private API Key'")
            print("=" * 70 + "\n")
            return False
        return True

    def connect(self) -> bool:
        if not self._check_api_key():
            return False

        try:
            from roboflow import Roboflow
            print(f"[*] Authenticating with Roboflow...")
            self.rf = Roboflow(api_key=self.api_key)
            self.workspace = self.rf.workspace(self.workspace_name)
            self.project = self.workspace.project(self.project_name)
            print(f"[+] Successfully connected to:")
            print(f"    • Workspace : {self.workspace_name}")
            print(f"    • Project   : {self.project_name}")
            return True
        except Exception as exc:
            print(f"[!] Connection failed: {exc}")
            return False

    def inspect_project(self) -> Dict[str, Any]:
        """Inspects remote Roboflow project details, classes, and dataset status."""
        print("=" * 70)
        print("  ROBOFLOW PROJECT INSPECTION & CLASS AUDIT")
        print("=" * 70)
        print(f"Target Workspace : {self.workspace_name}")
        print(f"Target Project   : {self.project_name}")

        if not self.connect():
            return {
                "connected": False,
                "error": "ROBOFLOW_API_KEY not configured or invalid",
                "canonical_classes": EXPECTED_CLASSES
            }

        try:
            # Gather versions
            versions = self.project.versions()
            version_numbers = [getattr(v, "version", str(v)) for v in versions] if versions else []

            print(f"[+] Project Type        : {getattr(self.project, 'type', 'object-detection')}")
            print(f"[+] Annotation Type     : {getattr(self.project, 'annotation', 'bounding-box')}")
            print(f"[+] Existing Versions   : {len(version_numbers)} {version_numbers}")
            print("-" * 70)
            print("Canonical 7-Class Alignment:")
            for cid, cname in EXPECTED_CLASSES.items():
                print(f"  • Class {cid}: {cname:12s} (Local YOLO Target)")
            print("=" * 70)

            return {
                "connected": True,
                "workspace": self.workspace_name,
                "project": self.project_name,
                "versions": version_numbers,
                "canonical_classes": EXPECTED_CLASSES
            }
        except Exception as exc:
            print(f"[!] Error inspecting project: {exc}")
            return {"connected": False, "error": str(exc)}

    def upload_dataset_directory(
        self,
        images_dir: Path,
        labels_dir: Optional[Path] = None,
        split: str = "train",
        batch_name: str = "food-waste-initial-batch"
    ) -> Dict[str, Any]:
        """Uploads images (and optional matching YOLO txt annotations) to Roboflow project."""
        if not self.connect():
            return {"success": False, "error": "Authentication required"}

        images_dir = images_dir.resolve()
        if not images_dir.exists():
            return {"success": False, "error": f"Directory not found: {images_dir}"}

        image_files = [
            f for f in images_dir.iterdir()
            if f.is_file() and f.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]
        ]

        print(f"[*] Uploading {len(image_files)} images from '{images_dir.name}' to Roboflow...")
        print(f"    • Split      : {split}")
        print(f"    • Batch Name : {batch_name}")

        uploaded_count = 0
        failed_count = 0

        for idx, img_path in enumerate(image_files, 1):
            annotation_path = None
            if labels_dir and (labels_dir / f"{img_path.stem}.txt").exists():
                annotation_path = str(labels_dir / f"{img_path.stem}.txt")

            try:
                self.project.upload(
                    image_path=str(img_path),
                    annotation_path=annotation_path,
                    split=split,
                    batch_name=batch_name
                )
                uploaded_count += 1
                if idx % 5 == 0 or idx == len(image_files):
                    print(f"    [+] Uploaded [{idx}/{len(image_files)}] {img_path.name}")
            except Exception as exc:
                print(f"    [!] Failed to upload {img_path.name}: {exc}")
                failed_count += 1

        print(f"[*] Upload complete: {uploaded_count} succeeded, {failed_count} failed.")
        return {"success": True, "uploaded": uploaded_count, "failed": failed_count}

    def generate_and_export_dataset(
        self,
        train_pct: int = 70,
        val_pct: int = 15,
        test_pct: int = 15,
        output_dir: Optional[Path] = None
    ) -> Dict[str, Any]:
        """
        Generates a version with 70/15/15 splits in Roboflow, downloads the YOLOv8 export,
        syncs to backend/ai/datasets/food_waste/, and runs validation.
        """
        if not self.connect():
            return {"success": False, "error": "Authentication required"}

        if output_dir is None:
            output_dir = CURRENT_DIR.parent / "datasets" / "food_waste"

        print("=" * 70)
        print("  ROBOFLOW DATASET GENERATION & LOCAL SYNC PIPELINE")
        print("=" * 70)
        print(f"Splits Target : {train_pct}% Train / {val_pct}% Val / {test_pct}% Test")
        print(f"Destination   : {output_dir}")

        try:
            # Check latest version
            versions = self.project.versions()
            if not versions:
                print("\n[!] Notice: No dataset versions currently exist in project.")
                print("If you have uploaded and annotated images in the Roboflow web UI:")
                print("1. Go to https://app.roboflow.com/runeths-workspace/smart-waste-bin-food-recogniti/generate")
                print(f"2. Set Train: {train_pct}%, Valid: {val_pct}%, Test: {test_pct}%")
                print("3. Click 'Generate Version'")
                print("4. Re-run this script with `--download-version <version_number>`")
                return {"success": False, "message": "Version generation required in Roboflow UI"}

            latest_version = versions[-1]
            version_num = getattr(latest_version, "version", 1)
            print(f"[*] Found latest Roboflow dataset version: v{version_num}")

            return self.download_version(version_num, output_dir=output_dir)

        except Exception as exc:
            print(f"[!] Dataset generation error: {exc}")
            return {"success": False, "error": str(exc)}

    def download_version(self, version_num: int, output_dir: Optional[Path] = None) -> Dict[str, Any]:
        """Downloads specific version from Roboflow in YOLOv8 format and syncs locally."""
        if not self.connect():
            return {"success": False, "error": "Authentication required"}

        if output_dir is None:
            output_dir = CURRENT_DIR.parent / "datasets" / "food_waste"

        staging_dir = CURRENT_DIR.parent / "datasets" / "_roboflow_download"
        staging_dir.mkdir(parents=True, exist_ok=True)

        print(f"[*] Downloading Roboflow version {version_num} in YOLOv8 format...")
        try:
            version_obj = self.project.version(version_num)
            version_obj.download("yolov8", location=str(staging_dir))
            print(f"[+] Download completed to staging: {staging_dir}")

            # Run existing canonical import script
            print("[*] Synchronizing into canonical local dataset structure...")
            import_roboflow_data(staging_dir, output_dir)

            # Validate dataset
            print("[*] Running automated dataset validation...")
            val_res = validate_yolo_dataset(output_dir)
            print(f"[+] Validation Result : {val_res['status']}")
            print(f"    • Total Images    : {val_res['total_images']}")
            print(f"    • Total Errors    : {len(val_res['errors'])}")
            print(f"    • Duplicates      : {len(val_res['duplicates'])}")

            return {
                "success": True,
                "version": version_num,
                "validation": val_res
            }
        except Exception as exc:
            print(f"[!] Download failed: {exc}")
            return {"success": False, "error": str(exc)}

    def upload_approved_manifest(
        self,
        manifest_path: Optional[Path] = None,
        split: str = "train",
        record_path: Optional[Path] = None
    ) -> Dict[str, Any]:
        """Uploads only validated, approved images from DATASET_MANIFEST_APPROVED.csv with retry tracking."""
        if not self.connect():
            return {"success": False, "error": "Authentication required"}

        if manifest_path is None:
            manifest_path = CURRENT_DIR.parent / "datasets" / "DATASET_MANIFEST_APPROVED.csv"
        if record_path is None:
            record_path = CURRENT_DIR.parent / "datasets" / "ROBOFLOW_UPLOAD_RECORD.json"

        if not manifest_path.exists():
            print(f"[!] Approved manifest not found: {manifest_path}")
            print("    Please run: python ai/scripts/audit_and_filter_dataset.py first.")
            return {"success": False, "error": f"Manifest not found: {manifest_path}"}

        upload_records = {}
        if record_path.exists():
            try:
                with open(record_path, "r", encoding="utf-8") as rf:
                    upload_records = json.load(rf)
                print(f"[*] Loaded {len(upload_records)} prior upload records from {record_path.name}")
            except Exception as e:
                print(f"[!] Warning reading upload records: {e}")

        import csv
        from datetime import datetime, timezone

        with open(manifest_path, "r", encoding="utf-8") as mf:
            approved_records = list(csv.DictReader(mf))

        print("=" * 75)
        print("  ROBOFLOW VERIFIED BATCH UPLOAD PIPELINE")
        print("=" * 75)
        print(f"Target Workspace : {self.workspace_name}")
        print(f"Target Project   : {self.project_name}")
        print(f"Approved Images  : {len(approved_records)}")
        print(f"Split            : {split}")
        print(f"Tracking File    : {record_path.name}")
        print("-" * 75)

        uploaded_by_class = {cname: 0 for cname in EXPECTED_CLASSES.values()}
        skipped_by_class = {cname: 0 for cname in EXPECTED_CLASSES.values()}
        failed_by_class = {cname: 0 for cname in EXPECTED_CLASSES.values()}

        for cid, cname in EXPECTED_CLASSES.items():
            class_records = [r for r in approved_records if r["class_name"] == cname]
            if not class_records:
                continue

            batch_name = f"pilot-{cname}"
            print(f"\n[*] Processing class: '{cname}' ({len(class_records)} images) -> Batch: {batch_name}")

            for idx, r in enumerate(class_records, 1):
                img_key = r["filename"]
                local_rel = r["local_path"]
                full_img_path = CURRENT_DIR.parent / "datasets" / local_rel

                # Skip if already successfully uploaded (idempotent / retry safe)
                if img_key in upload_records and upload_records[img_key].get("status") == "success":
                    skipped_by_class[cname] += 1
                    continue

                if not full_img_path.exists():
                    print(f"    [!] File missing on disk: {full_img_path}")
                    failed_by_class[cname] += 1
                    continue

                try:
                    self.project.upload(
                        image_path=str(full_img_path),
                        split=split,
                        batch_name=batch_name
                    )
                    uploaded_by_class[cname] += 1
                    upload_records[img_key] = {
                        "image_id": r.get("image_id"),
                        "filename": r["filename"],
                        "class_name": cname,
                        "batch_name": batch_name,
                        "split": split,
                        "status": "success",
                        "uploaded_at": datetime.now(timezone.utc).isoformat()
                    }
                    print(f"    [+] Uploaded [{idx}/{len(class_records)}] {r['filename']}")

                    # Write record incrementally to ensure state preservation on any interruption
                    with open(record_path, "w", encoding="utf-8") as rf:
                        json.dump(upload_records, rf, indent=2)

                except Exception as exc:
                    print(f"    [!] Upload failed for {r['filename']}: {exc}")
                    failed_by_class[cname] += 1
                    upload_records[img_key] = {
                        "image_id": r.get("image_id"),
                        "filename": r["filename"],
                        "class_name": cname,
                        "status": "failed",
                        "error": str(exc),
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }

        print("\n" + "=" * 75)
        print("ROBOFLOW UPLOAD EXECUTION SUMMARY:")
        print("=" * 75)
        print(f"{'Class Name':<15} {'Approved':<12} {'Uploaded':<12} {'Skipped':<12} {'Failed'}")
        print("-" * 75)
        for cname in EXPECTED_CLASSES.values():
            app_count = len([r for r in approved_records if r['class_name'] == cname])
            print(f"{cname:<15} {app_count:<12} {uploaded_by_class[cname]:<12} {skipped_by_class[cname]:<12} {failed_by_class[cname]}")
        print("-" * 75)
        total_up = sum(uploaded_by_class.values())
        total_skip = sum(skipped_by_class.values())
        total_fail = sum(failed_by_class.values())
        print(f"{'TOTAL':<15} {len(approved_records):<12} {total_up:<12} {total_skip:<12} {total_fail}")
        print("=" * 75)

        return {
            "success": True,
            "total_approved": len(approved_records),
            "total_uploaded": total_up,
            "total_skipped": total_skip,
            "total_failed": total_fail,
            "uploaded_by_class": uploaded_by_class,
            "skipped_by_class": skipped_by_class,
            "failed_by_class": failed_by_class
        }

    def upload_all_staging(self, staging_dir: Optional[Path] = None, split: str = "train") -> Dict[str, Any]:
        """Uploads verified images from DATASET_MANIFEST_APPROVED.csv to Roboflow."""
        approved_manifest = CURRENT_DIR.parent / "datasets" / "DATASET_MANIFEST_APPROVED.csv"
        if approved_manifest.exists():
            return self.upload_approved_manifest(manifest_path=approved_manifest, split=split)

    def prepare_autolabel_guide(self) -> None:
        """Outputs Roboflow AutoLabel configuration and ontology guide for human-in-the-loop annotation."""
        print("=" * 70)
        print("  ROBOFLOW AUTOLABEL & HUMAN-IN-THE-LOOP ANNOTATION WORKFLOW")
        print("=" * 70)
        print("1. Target Ontology (Class Name -> Text Prompt):")
        ontology = {
            "rice": "cooked white rice or fried rice on plate or bowl",
            "kottu": "kottu roti dish or chopped flatbread stir fry",
            "noodles": "noodles or chow mein on plate or bowl",
            "chicken": "chicken meat or roast chicken or chicken bone waste",
            "bread": "bread slices or stale bread crusts or bun",
            "whole_mango": "whole mango fruit or ripe mango",
            "mango_peel": "mango peel skin scraps or fruit peel waste"
        }
        for k, v in ontology.items():
            print(f"   • {k:12s} : \"{v}\"")
        print("\n2. How to Trigger AutoLabel in Roboflow Web UI:")
        print("   a. Open https://app.roboflow.com/runeths-workspace/smart-waste-bin-food-recogniti/annotate")
        print("   b. Select an uploaded batch (e.g. 'pilot-kottu', 'pilot-mango_peel', etc.)")
        print("   c. Click 'Auto Label' at top right")
        print("   d. Select Model: Grounding DINO or Florence-2")
        print("   e. Enter the prompt mapping above for each class")
        print("   f. Click 'Run Auto Label'")
        print("\n3. Human Review & Verification (CRITICAL for Academic Integrity):")
        print("   a. Roboflow routes auto-labeled images into the 'Review' queue")
        print("   b. Inspect each image: tighten bounding boxes around food waste boundaries")
        print("   c. Discard false positive detections")
        print("   d. Click 'Approve' to finalize the ground truth annotations")
        print("=" * 70)

    def cleanup_incorrect_images(self, cleanup_plan_path: Optional[Path] = None, dry_run: bool = True) -> Dict[str, Any]:
        """
        Safely deletes confirmed incorrect images from Roboflow based on ROBOFLOW_CLEANUP_LIST.json.
        dry_run=True by default to prevent accidental deletion without explicit confirmation.
        """
        if cleanup_plan_path is None:
            cleanup_plan_path = CURRENT_DIR.parent / "datasets" / "ROBOFLOW_CLEANUP_LIST.json"

        if not cleanup_plan_path.exists():
            print(f"[!] Cleanup plan not found at: {cleanup_plan_path}")
            return {"success": False, "error": "Cleanup plan missing"}

        with open(cleanup_plan_path, "r", encoding="utf-8") as f:
            plan = json.load(f)

        candidates = plan.get("cleanup_candidates", [])
        print("=" * 80)
        print("  ROBOFLOW DATASET CLEANUP: REMOVAL OF CONFIRMED INCORRECT IMAGES")
        print("=" * 80)
        print(f"Target Candidates : {len(candidates)} images")
        print(f"Execution Mode    : {'DRY RUN (Preview only)' if dry_run else 'LIVE DELETION'}")
        print("-" * 80)

        for c in candidates:
            print(f"  • {c['class_name']:12s} | ID: {c['roboflow_id']:20s} | {c['filename']:22s} -> {c['reason']}")

        if dry_run:
            print("\n[!] Dry-run complete. No images were deleted from Roboflow.")
            print("    To execute live deletion, run with: --execute-cleanup --confirm")
            return {"success": True, "mode": "dry_run", "candidates": candidates}

        if not self.connect():
            return {"success": False, "error": "Authentication failed"}

        image_ids = [c["roboflow_id"] for c in candidates if c["roboflow_id"] not in ("UNKNOWN", None)]
        print(f"\n[*] Executing deletion of {len(image_ids)} images in Roboflow project {self.project_name}...")
        try:
            self.project.delete_images(image_ids=image_ids)
            print(f"[+] Successfully deleted {len(image_ids)} images from Roboflow.")

            # Update local upload record
            record_path = CURRENT_DIR.parent / "datasets" / "ROBOFLOW_UPLOAD_RECORD.json"
            if record_path.exists():
                with open(record_path, "r", encoding="utf-8") as rf:
                    upload_records = json.load(rf)
                for c in candidates:
                    fname = c["filename"]
                    if fname in upload_records:
                        del upload_records[fname]
                with open(record_path, "w", encoding="utf-8") as rf:
                    json.dump(upload_records, rf, indent=2)
                print(f"[+] Updated local tracking file: {record_path.name}")

            return {"success": True, "mode": "live", "deleted_count": len(image_ids)}
        except Exception as exc:
            print(f"[!] Roboflow deletion failed: {exc}")
            return {"success": False, "error": str(exc)}


def main():
    parser = argparse.ArgumentParser(description="Roboflow Dataset Automation Tool for Component 4")
    parser.add_argument("--inspect", action="store_true", help="Inspect Roboflow workspace, project, and classes")
    parser.add_argument("--upload-dir", type=str, default=None, help="Directory of images to upload")
    parser.add_argument("--upload-all-staging", action="store_true", help="Upload all staging images across 7 classes")
    parser.add_argument("--upload-approved", action="store_true", help="Upload only verified approved images from DATASET_MANIFEST_APPROVED.csv")
    parser.add_argument("--prepare-autolabel", action="store_true", help="Show Roboflow AutoLabel configuration guide")
    parser.add_argument("--cleanup-preview", action="store_true", help="Preview images flagged for removal in Roboflow (Dry Run)")
    parser.add_argument("--execute-cleanup", action="store_true", help="Execute removal of confirmed incorrect images in Roboflow")
    parser.add_argument("--confirm", action="store_true", help="Mandatory confirmation flag for deletion")
    parser.add_argument("--labels-dir", type=str, default=None, help="Matching directory of YOLO txt labels")
    parser.add_argument("--batch-name", type=str, default="food-waste-batch", help="Batch name for upload")
    parser.add_argument("--split", type=str, default="train", help="Target split (train/val/test)")
    parser.add_argument("--download-version", type=int, default=None, help="Download and sync a specific version")
    parser.add_argument("--api-key", type=str, default=None, help="Optional Roboflow API key override")

    args = parser.parse_args()
    manager = RoboflowDatasetManager(api_key=args.api_key)

    if args.prepare_autolabel:
        manager.prepare_autolabel_guide()
        return

    if args.cleanup_preview:
        manager.cleanup_incorrect_images(dry_run=True)
        return

    if args.execute_cleanup:
        if not args.confirm:
            print("\n[!] SAFETY ERROR: You must specify --confirm along with --execute-cleanup to proceed.")
            print("    Deletion cannot be performed without explicit confirmation.")
            return
        manager.cleanup_incorrect_images(dry_run=False)
        return

    if args.upload_approved:
        manager.upload_approved_manifest(split=args.split)
        return

    if args.upload_all_staging:
        manager.upload_all_staging(split=args.split)
        return

    if args.upload_dir:
        manager.upload_dataset_directory(
            images_dir=Path(args.upload_dir),
            labels_dir=Path(args.labels_dir) if args.labels_dir else None,
            split=args.split,
            batch_name=args.batch_name
        )
        return

    if args.download_version:
        manager.download_version(args.download_version)
        return

    if args.inspect or len(sys.argv) == 1:
        manager.inspect_project()
        return


if __name__ == "__main__":
    main()
