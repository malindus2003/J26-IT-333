# Open-Source Dataset Directory & Acquisition Guide
## SLIIT IT4010 Research Project J26-IT-333
### Component 4: Smart Waste Bin AI Food Recognition Subsystem

This document catalogs openly licensed, scientifically verifiable image repositories for the 7 canonical food waste classes:
1. `rice` (ID: 0)
2. `kottu` (ID: 1)
3. `noodles` (ID: 2)
4. `chicken` (ID: 3)
5. `bread` (ID: 4)
6. `whole_mango` (ID: 5)
7. `mango_peel` (ID: 6)

---

## 📜 Ethical & Academic Licensing Principles

In compliance with SLIIT IT4010 research guidelines and IEEE academic standards:
- All external image sources must use permissive licenses: **CC0 (Public Domain)**, **CC-BY 4.0**, **CC-BY-SA 4.0**, or **MIT**.
- Every image uploaded to Roboflow or included in training splits must have a verifiable origin.
- Commercial or copyrighted images without explicit reuse licenses are strictly prohibited.

---

## 🌐 Openly Licensed Dataset Repositories

### 1. Voxel51 Food Waste Dataset (Hugging Face)
- **License**: MIT License (Permissive Open-Source)
- **URL**: `https://huggingface.co/datasets/Voxel51/food-waste-dataset`
- **Relevance**: High. Collected from real-world university dining canteens specifically for post-consumer food waste tracking.
- **Classes Covered**:
  - `rice`: Cooked white rice, seasoned rice scraps.
  - `bread`: Bread slices, crusts, rolls, buns.
  - `chicken`: Poultry bones, cooked chicken breast/drumstick portions.
  - `noodles`: Stir-fried noodles, pasta scraps.

### 2. Roboflow Universe Food Waste Projects (Open Access)
- **License**: CC BY 4.0 (Creative Commons Attribution)
- **URLs**:
  - `https://universe.roboflow.com/search?q=food+waste+detection`
  - `https://universe.roboflow.com/search?q=canteen+food+waste`
- **Relevance**: Pre-annotated bounding boxes in YOLO format matching canteen trays and waste bins.
- **Classes Covered**:
  - `rice`, `noodles`, `chicken`, `bread`, `whole_mango`.

### 3. Open Images Dataset V7 (Google AI)
- **License**: CC BY 4.0 / CC BY 2.0
- **URL**: `https://storage.googleapis.com/openimages/web/index.html`
- **Classes & Entity IDs**:
  - Bread: `/m/09728`
  - Chicken (Food): `/m/09b5t`
  - Mango: `/m/0f9_l`

### 4. Regional Sri Lankan & Specialized Waste Sources (Kottu & Mango Peel)
- **Kottu (ID: 1)**:
  - Sri Lankan specialty dish consisting of chopped godamba roti, vegetables, eggs, and curry/chicken.
  - **Source 1**: Wikimedia Commons (`Category:Kottu`, licensed under CC BY-SA 4.0 / CC BY 3.0).
  - **Source 2 (Recommended for SLIIT Research)**: Primary photographic dataset captured on the actual restaurant weighing tray using the research hardware test-rig.
- **Mango Peel (ID: 6)**:
  - Kitchen preparation trimming and organic peeling waste.
  - **Source 1**: Zenodo Fruit & Peel Waste Repository (Open Access CC BY 4.0).
  - **Source 2**: Wikimedia Commons (`Category:Mango peel`, CC BY-SA 4.0).

---

## 📥 How to Import Images into Roboflow

### Option A: Using the Automated Roboflow Manager Script
Once you set your `ROBOFLOW_API_KEY`:

```powershell
# Upload a directory of collected images to your project:
python ai/scripts/roboflow_dataset_manager.py `
    --upload-dir "path/to/downloaded_images" `
    --batch-name "open-food-waste-batch-1" `
    --split "train"
```

### Option B: Web UI Drag & Drop
1. Log in to your Roboflow dashboard:
   `https://app.roboflow.com/runeths-workspace/smart-waste-bin-food-recogniti`
2. Click **Upload Data**.
3. Drag and drop your image batches or Roboflow Universe export files.
4. Select the target batch name and proceed to Annotation / AutoLabel.

---

## 🎯 Target Split Distribution

The dataset version must be generated with:
- **70% Training** (`train`)
- **15% Validation** (`val`)
- **15% Testing** (`test` - strictly held-out)

Ensure that images from the same photo burst or session remain in the same split to prevent spatial data leakage across splits.
