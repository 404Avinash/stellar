# STELLAR VERIFICATION PROGRAM — FULL PROJECT REPORT
### Team RUSTY
### Avinash Jha | Ayush Belwal | Ayush Kirti Singh
### Innorave Eco-Hackathon 2026 — Sustainability & Environmental Intelligence

---

## TABLE OF CONTENTS

1. [Title & Team Information](#1-title--team-information)
2. [Executive Summary](#2-executive-summary)
3. [Problem Statement](#3-problem-statement)
4. [Assumptions & Constraints](#4-assumptions--constraints)
5. [Dataset Description](#5-dataset-description)
6. [Exploratory Data Analysis](#6-exploratory-data-analysis)
7. [Data Preprocessing & Feature Engineering](#7-data-preprocessing--feature-engineering)
8. [ML Task A — Classification](#8-ml-task-a--classification)
9. [ML Task B — Regression](#9-ml-task-b--regression)
10. [System Architecture](#10-system-architecture)
11. [Frontend Layer](#11-frontend-layer)
12. [Backend & API Layer](#12-backend--api-layer)
13. [Results & Performance](#13-results--performance)
14. [Key Insights & Feature Importance](#14-key-insights--feature-importance)
15. [Bonus Implementations](#15-bonus-implementations)
16. [Deployment & Live Demo](#16-deployment--live-demo)
17. [Sustainability & Environmental Connection](#17-sustainability--environmental-connection)
18. [Limitations & Future Work](#18-limitations--future-work)
19. [References](#19-references)
20. [Appendix](#20-appendix)

---

## 1. TITLE & TEAM INFORMATION

| Field | Detail |
|---|---|
| **Project Title** | Stellar Verification Program |
| **Team Name** | RUSTY |
| **Member 1** | Avinash Jha |
| **Member 2** | Ayush Belwal |
| **Member 3** | Ayush Kirti Singh |
| **Date** | March 2026 |
| **Competition** | Innorave Eco-Hackathon 2026 |
| **Theme** | Sustainability & Environmental Intelligence |
| **Live URL** | https://stellar-w9oz.onrender.com/ |
| **GitHub** | https://github.com/404Avinash/stellar |

---

## 2. EXECUTIVE SUMMARY

The Stellar Verification Program is an end-to-end web-based platform for classifying Kepler Objects of Interest (KOIs) as confirmed exoplanets or false positives, and simultaneously predicting the planetary radius of confirmed planets — all in real-time.

**The Core Problem:** NASA's Kepler telescope detected 9,564 objects of interest, but more than 51% turned out to be false positives. Nearly 1,979 candidates remain unconfirmed. Manual verification takes 40+ astronomer-hours per object, creating a bottleneck that could take 6-10 years to clear at current rates.

**Our Solution:** A deployed web application powered by a stacking ensemble classifier (XGBoost + Random Forest + ExtraTrees, meta-learner: Logistic Regression) achieving **0.97 ROC-AUC** for classification and an XGBoost regressor with quantile uncertainty bounds achieving **R² = 0.96** for radius prediction — delivering results in under 200 milliseconds.

**Key Differentiators:**
- Dual-task unified inference (classification + regression + uncertainty in one call)
- 7 physics-informed engineered features on top of 10 raw inputs
- Interactive mission planning engine assigning 7 specialist science roles per unverified signal
- 100-object batch analysis with animated step-by-step pipeline visualization
- Live transit simulator and habitable zone calculator
- Plain-English interface accessible to non-technical users
- Fully deployed on Render, accessible from any browser

---

## 3. PROBLEM STATEMENT

### 3.1 Background: The Kepler Legacy

The Kepler Space Telescope (2009-2018) was humanity's most successful planet-hunting mission. It stared continuously at a single patch of sky containing approximately 150,000 stars, measuring their brightness every 29.4 minutes for over four years. The mission's strategy was elegantly simple: if a planet passes in front of its host star (a "transit"), the star's brightness dips by a tiny, measurable amount.

Over its operational lifetime, Kepler identified 9,564 Kepler Objects of Interest (KOIs) — signals that exhibited brightness dips consistent with planetary transits.

### 3.2 The False Positive Problem

Not every brightness dip is caused by a planet. Multiple astrophysical and instrumental phenomena can mimic a planetary transit:

- **Eclipsing binary stars**: A pair of stars orbiting each other can produce periodic brightness dips nearly identical to planetary transits
- **Background eclipsing binaries**: A faint binary system aligned behind the target star contaminates the photometric aperture
- **Stellar variability**: Starspots, pulsations, and granulation can create periodic signals
- **Instrumental systematics**: Detector artifacts, pointing jitter, and temperature variations in the spacecraft

The result:

| Disposition | Count | Fraction |
|---|---|---|
| FALSE POSITIVE | 4,882 | 51.0% |
| CONFIRMED | 2,682 | 28.0% |
| CANDIDATE (unresolved) | 2,000 | 20.9% |

More than half of all Kepler detections were eventually identified as false positives — signals that looked like planets but were not.

### 3.3 The Confirmation Bottleneck

Confirming a planetary candidate requires extensive multi-instrument follow-up:

1. **Radial Velocity (RV) observations** — Measuring the star's wobble to independently confirm a planet's gravitational influence. This requires spectrographs on large telescopes (Keck/HIRES, ESO/ESPRESSO) and typically 3-6 months of repeated observations.

2. **Statistical validation** — Software like VESPA and BLENDER computes the probability that all non-planetary false positive scenarios can be ruled out. This requires 2-5 compute hours per KOI.

3. **Centroid analysis** — Pixel-level inspection of Kepler data to determine whether the transit is occurring on the target star or a nearby contaminating source.

4. **Adaptive optics imaging** — High-contrast imaging to search for nearby companion stars that could cause false positive signals.

At current confirmation rates, the 1,979 remaining Kepler candidates would require an estimated 6-10 years of dedicated effort to fully resolve.

### 3.4 Our Mission

Build an intelligent, accessible, deployed system that:

1. **Task A (Classification):** Distinguishes CONFIRMED exoplanets from FALSE POSITIVE signals using transit and stellar parameters
2. **Task B (Regression):** Predicts the planetary radius (in Earth radii) for detected objects, with calibrated uncertainty bounds

---

## 4. ASSUMPTIONS & CONSTRAINTS

### 4.1 Data Assumptions

| Assumption | Rationale |
|---|---|
| KOI dispositions are ground truth | We treat NASA's confirmed/false positive labels as correct for training |
| CANDIDATEs are excluded from training | Unresolved objects could be either class; including them would introduce label noise |
| Features are available at prediction time | All 10 input features are standard Kepler/K2 pipeline outputs |
| No target leakage | We exclude koi_prad from classification features and koi_disposition from regression features |
| Missing values handled by median imputation | Robust to the ~2-5% missingness rate in stellar parameters |

### 4.2 System Design Assumptions

| Assumption | Rationale |
|---|---|
| Predictions are advisory, not definitive | Our system supplements human judgment, not replaces it |
| Users have modern browsers | React.js SPA requires ES6+ support |
| Backend receives valid JSON | Client-side validation catches most errors before API calls |
| SQLite sufficient for storage | Suitable for single-server deployment; no concurrent write contention expected |
| Free-tier hosting adequate | Render free tier provides sufficient resources for demo-scale traffic |

### 4.3 Constraints

- **No GPU required** — All models run on CPU, enabling free-tier deployment
- **Cold start latency** — First request after inactivity may take ~30s on Render's free tier (server spin-up)
- **Batch limit** — Maximum 100 objects per batch request (API-enforced)
- **No real-time telescope data** — We use the Kepler archive, not live observation feeds

---

## 5. DATASET DESCRIPTION

### 5.1 Source

Primary data sourced from the **NASA Exoplanet Archive** (https://exoplanetarchive.ipac.caltech.edu/), specifically:
- KOI Cumulative Table (transit-level features)
- Stellar Properties Table (host star physical parameters)

These were merged into a single dataset containing one row per Kepler Object of Interest.

### 5.2 Dataset Statistics

| Property | Value |
|---|---|
| Total records | **9,564** |
| Records used for training (CONFIRMED + FALSE POSITIVE) | **7,564** |
| Records reserved for Discovery Queue (CANDIDATE) | **2,000** |
| Features per record | **10 raw + 7 engineered = 17 total** |
| Missing value rate | ~2-5% in stellar parameters |
| Class distribution (training set) | 2,682 CONFIRMED / 4,882 FALSE POSITIVE |
| Class imbalance ratio | ~1:1.82 |

### 5.3 Feature Dictionary

#### Transit Parameters (Observable)

| Feature | Description | Unit | Typical Range |
|---|---|---|---|
| `koi_period` | Orbital period of the planet around its star | Days | 0.1 – 100,000 |
| `koi_impact` | Impact parameter: how close to center the planet crosses | Dimensionless | 0.0 – 3.0 |
| `koi_duration` | Duration of the transit event | Hours | 0.01 – 200 |
| `koi_depth` | Fractional drop in stellar brightness during transit | Parts per million (ppm) | 0 – 10,000,000 |
| `koi_model_snr` | Signal-to-noise ratio of the transit model fit | Dimensionless | 0 – 1,000,000 |

#### Host Star Parameters (Derived from Spectroscopy)

| Feature | Description | Unit | Typical Range |
|---|---|---|---|
| `koi_steff` | Effective temperature of the host star | Kelvin (K) | 2,500 – 15,000 |
| `koi_slogg` | Surface gravity (log base 10) | log₁₀(cm/s²) | 0.0 – 6.0 |
| `koi_srad` | Stellar radius | Solar radii (R☉) | 0.01 – 200 |
| `koi_smass` | Stellar mass | Solar masses (M☉) | 0.01 – 100 |
| `koi_smet` | Metallicity ([Fe/H]) | dex | -5.0 – 5.0 |

#### Target Variables

| Variable | Task | Description |
|---|---|---|
| `koi_disposition` | Classification | CONFIRMED or FALSE POSITIVE |
| `koi_prad` | Regression | Planetary radius in Earth radii (R⊕) |

---

## 6. EXPLORATORY DATA ANALYSIS

### 6.1 Class Distribution

The dataset exhibits moderate class imbalance, with false positives outnumbering confirmed planets approximately 1.82:1. This imbalance reflects the real-world difficulty of exoplanet detection — most signals are not planets.

We handled this through StratifiedKFold cross-validation, which ensures each fold maintains the same class ratio as the full dataset.

### 6.2 Key Distributional Insights

1. **Orbital Period (koi_period):** Spans 6+ orders of magnitude (0.18 to 75,000+ days). Confirmed planets cluster at shorter periods (detection bias: closer planets transit more frequently and are easier to detect). Log transformation is essential.

2. **Transit Depth (koi_depth):** Also spans orders of magnitude (10 to 1,000,000+ ppm). Deep transits (large depth) may indicate either large planets or eclipsing binaries. Shallow transits are harder to distinguish from noise.

3. **Impact Parameter (koi_impact):** Values above 1.0 indicate "grazing" transits where the planet barely clips the stellar disk. Grazing transits are more commonly associated with false positives (especially background eclipsing binaries).

4. **Signal-to-Noise (koi_model_snr):** Confirmed planets tend to have higher SNR than false positives, but there is significant overlap in the range 10-50 — the critical ambiguous zone where our model adds the most value.

5. **Stellar Temperature (koi_steff):** The majority of host stars fall in the 4,000-6,500K range (K-type to F-type). Our model must generalize across this range.

### 6.3 Correlation Analysis

Key correlations identified:
- **koi_depth ↔ koi_prad**: Strong positive correlation (r ≈ 0.7) — deeper transits correspond to larger planets (physically meaningful: transit depth ∝ (Rₚ/R★)²)
- **koi_srad ↔ koi_steff**: Moderate positive correlation — hotter stars tend to be larger (main sequence relationship)
- **koi_smass ↔ koi_srad**: Strong positive correlation — mass-radius relationship for main sequence stars
- **koi_period ↔ koi_duration**: Moderate positive correlation — longer-period planets have longer transits (wider stellar chords at larger distances)

These correlations motivated our engineered features: rather than letting the model discover these relationships from raw data, we encoded them explicitly.

---

## 7. DATA PREPROCESSING & FEATURE ENGINEERING

### 7.1 Preprocessing Pipeline

Our preprocessing pipeline is deterministic and reproducible, implemented in `ml_pipeline/preprocessing.py`:

1. **Missing Value Imputation**: Median imputation for all numerical features. Median is chosen over mean because it is robust to the heavy-tailed distributions common in astronomical data.

2. **Outlier Handling**: Input validation enforces physical bounds (e.g., stellar temperature cannot be negative). Values outside prescribed ranges are clipped to boundary values during preprocessing.

3. **Feature Engineering** (7 derived features):

| Engineered Feature | Formula | Physical Motivation |
|---|---|---|
| `log_period` | log₁₀(koi_period) | Compresses 6-decade range; orbital periods are log-normally distributed |
| `log_depth` | log₁₀(koi_depth + 1) | Normalizes transit depth distribution; +1 to handle zeros |
| `log_duration` | log₁₀(koi_duration + 1) | Same motivation as log_period |
| `log_snr` | log₁₀(koi_model_snr + 1) | SNR spans many decades; log is standard in signal processing |
| `period_dur_ratio` | koi_period / (koi_duration + 0.01) | Proxy for orbital eccentricity and transit geometry; physically: circular orbits have predictable duration/period ratios |
| `stellar_density` | koi_smass / (koi_srad³ + 0.001) | Direct astrophysical quantity constraining orbital parameters via Kepler's third law |
| `depth_snr_ratio` | koi_depth / (koi_model_snr + 1) | Normalizes signal strength by detection quality; high depth but low SNR is suspicious |

4. **Feature Scaling**: StandardScaler (zero mean, unit variance) applied to all 17 features. The scaler is fit on training data and applied identically at inference time.

### 7.2 Why These Features Matter

Traditional machine learning approaches for KOI classification use raw features directly. Our physics-informed engineering provides three advantages:

1. **Distribution normalization**: Log transforms convert heavy-tailed, skewed distributions into approximately Gaussian distributions, which improves the performance of the logistic regression meta-learner.

2. **Physical priors**: Features like `stellar_density` and `period_dur_ratio` encode known astrophysical relationships, giving the model "built-in physics knowledge" rather than requiring it to learn these relationships from data alone.

3. **Feature independence**: The ratio features (depth/snr, period/duration) create scale-invariant quantities that capture relative rather than absolute signal properties, making the model more robust to the diversity of stellar systems.

---

## 8. ML TASK A — CLASSIFICATION

### 8.1 Problem Formulation

**Binary Classification:**
- **Positive class (1)**: CONFIRMED — the KOI is a real exoplanet
- **Negative class (0)**: FALSE POSITIVE — the KOI is not a planet

**Training data**: 7,564 records (2,682 CONFIRMED + 4,882 FALSE POSITIVE)

**Excluded from training**: 2,000 CANDIDATE records (used in the Discovery Queue for real-time inference)

### 8.2 Model Architecture: Stacking Ensemble

We use a two-level stacking ensemble, which is the most robust approach for medium-sized tabular datasets:

#### Level 1: Base Learners (3 diverse models)

| Model | Hyperparameters | Strengths |
|---|---|---|
| **XGBoost** | 500 trees, max_depth=6, learning_rate=0.05, eval_metric=logloss | Captures complex nonlinear interactions; handles feature correlations well |
| **Random Forest** | 300 trees, max_depth=15 | Reduces variance through bagging; robust to overfitting |
| **Extra Trees** | 300 trees, max_depth=15 | Introduces additional randomization (random split thresholds); reduces bias |

#### Level 2: Meta-Learner

| Model | Hyperparameters | Purpose |
|---|---|---|
| **Logistic Regression** | C=1.0 (default regularization) | Learns optimal linear combination of base learner predictions; naturally outputs calibrated probabilities |

#### Why Stacking?

Each base learner captures different aspects of the data:
- **XGBoost** is strong at finding complex feature interactions (e.g., the interplay between transit depth, SNR, and impact parameter)
- **Random Forest** reduces variance and is robust to noisy features
- **Extra Trees** adds randomization at the split level, exploring decision boundaries that RF would miss

The meta-learner learns *when to trust which base learner*. For example, it might learn that XGBoost is more reliable for deep transits while Random Forest is better for grazing geometries.

### 8.3 Cross-Validation Strategy

- **StratifiedKFold** with k=5
- Stratification ensures each fold maintains the 2,682:4,882 class ratio
- During stacking, base learner predictions are generated out-of-fold (each sample is predicted by a model that never saw it during training), preventing meta-learner overfitting

### 8.4 Avoiding Target Leakage

We explicitly excluded:
- `koi_prad` (planetary radius) — this is the regression target, and including it would trivially solve classification (only real planets have meaningful radii)
- `koi_disposition` — this is the classification target itself
- Any derived "disposition score" or confidence metrics from the original pipeline

### 8.5 Classification Results

| Metric | Value | Interpretation |
|---|---|---|
| **ROC-AUC** | **0.97** | Probability that a randomly chosen positive is ranked above a randomly chosen negative |
| **F1-Score** | **0.84** | Harmonic mean of precision and recall; balances false positives and false negatives |
| **Accuracy** | **90.6%** | Overall fraction of correct predictions |

The 0.97 ROC-AUC indicates excellent discrimination ability — the model can reliably distinguish real planets from false positives across nearly all confidence thresholds.

---

## 9. ML TASK B — REGRESSION

### 9.1 Problem Formulation

**Regression Target**: `koi_prad` — the planetary radius expressed in Earth radii (R⊕)

**Training data**: Same 7,564 records, using all 17 features (10 raw + 7 engineered)

### 9.2 Point Estimate Model: XGBoost Regressor

| Hyperparameter | Value |
|---|---|
| n_estimators | 500 |
| max_depth | 6 |
| learning_rate | 0.05 |
| objective | reg:squarederror |

XGBoost was chosen over alternatives (Random Forest, LightGBM, Neural Networks) because it provides the best bias-variance tradeoff for our feature space and dataset size.

### 9.3 Uncertainty Quantification: Quantile Regression

A unique feature of our system is that we don't just predict a point estimate of planetary radius — we provide **calibrated uncertainty bounds**.

We train two additional models using `HistGradientBoostingRegressor` with quantile loss:

| Model | Quantile | Purpose |
|---|---|---|
| Lower bound model | α = 0.16 | 16th percentile of the prediction distribution |
| Upper bound model | α = 0.84 | 84th percentile of the prediction distribution |

The interval [16th, 84th percentile] represents a **68% confidence interval** — analogous to "1-sigma" uncertainty in physics.

**Uncertainty = (upper - lower) / 2**

This tells users not just "the planet is 1.42 R⊕" but "the planet is 1.42 ± 0.24 R⊕" — critical information for planning follow-up observations.

### 9.4 Regression Results

| Metric | Value | Interpretation |
|---|---|---|
| **R²** | **0.96** | Model explains 96% of the variance in planetary radius |
| **68% CI Coverage** | **~68%** | Uncertainty bounds are well-calibrated (contain ~68% of true values) |

### 9.5 Planet Classification by Radius

After predicting the radius, we classify planets into astrophysical categories:

| Class | Radius Range | Description |
|---|---|---|
| Sub-Earth | < 0.8 R⊕ | Smallest rocky worlds, like Mercury or Mars |
| Earth-size | 0.8 – 1.25 R⊕ | Rocky planets similar to Earth |
| Super-Earth | 1.25 – 2.0 R⊕ | Larger rocky worlds, may have thick atmospheres |
| Sub-Neptune | 2.0 – 4.0 R⊕ | Mini gas planets with hydrogen/helium envelopes |
| Neptune-size | 4.0 – 6.0 R⊕ | Ice giants comparable to Neptune |
| Gas Giant | > 6.0 R⊕ | Jupiter-class worlds with massive atmospheres |

---

## 10. SYSTEM ARCHITECTURE

### 10.1 Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Check a      │  │ Mission      │  │ Star         │              │
│  │ Planet       │  │ Queue        │  │ Database     │              │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤              │
│  │ 10 inputs    │  │ 1,872        │  │ 9,564 KOIs   │              │
│  │ Transit sim  │  │ unverified   │  │ Browse/sort  │              │
│  │ Hab zone     │  │ signals      │  │ Per-row AI   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│  ┌──────────────┐  ┌──────────────┐                                │
│  │ My History   │  │ Statistics & │                                │
│  ├──────────────┤  │ Batch Engine │                                │
│  │ Past queries │  ├──────────────┤                                │
│  │ Audit trail  │  │ 100-batch    │                                │
│  └──────┬───────┘  │ Model stats  │                                │
│         │          └──────┬───────┘                                │
└─────────┼────────────────┼──────────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FLASK REST API (Backend)                         │
│                                                                     │
│  /api/predict        → Single KOI inference                        │
│  /api/batch-predict  → Batch (up to 100 objects)                   │
│  /api/features       → Feature metadata with ranges                │
│  /api/predictions    → Prediction history (CRUD)                   │
│  /api/explore        → Browse 9,564 KOIs (paginated, filterable)   │
│  /api/explore/classify → Classify any real KOI from dataset        │
│  /api/discovery      → Mission queue (1,872 unverified signals)    │
│  /api/health         → Health check                                │
│                                                                     │
│  ┌────────────────────────┐  ┌─────────────────────────┐           │
│  │ Preprocessing Pipeline │  │ SQLite Database          │           │
│  │ - Imputation           │  │ - predictions.db          │           │
│  │ - Feature engineering  │  │ - Input data + results    │           │
│  │ - StandardScaler       │  │ - Timestamps + latency    │           │
│  └──────────┬─────────────┘  └─────────────────────────┘           │
│             │                                                       │
│  ┌──────────▼─────────────────────────────────────────────┐        │
│  │              ML INFERENCE ENGINE                        │        │
│  │                                                         │        │
│  │  ┌──────────────────┐  ┌──────────────────────────┐    │        │
│  │  │ Stacking Ensemble │  │ Radius Predictor          │    │        │
│  │  │ XGB + RF + ET     │  │ XGBoost + Quantile bounds │    │        │
│  │  │ → Meta-Learner    │  │ → Point + CI estimate     │    │        │
│  │  └──────────────────┘  └──────────────────────────┘    │        │
│  └─────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.2 Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React.js (Create React App) | Component-based SPA; rich ecosystem; fast development |
| Styling | Custom CSS (dark theme) | Full control; no framework overhead; consistent design language |
| Charts | Recharts | React-native charting; lightweight; interactive tooltips |
| HTTP Client | Axios | Promise-based; interceptors for error handling |
| Backend | Flask (Python) | Lightweight; excellent scikit-learn integration; fast prototyping |
| WSGI Server | Gunicorn (2 workers) | Production-ready; handles concurrent requests |
| ML Framework | scikit-learn + XGBoost | Industry standard for tabular ML; no GPU required |
| Database | SQLite | Zero-config; file-based; sufficient for single-server deployment |
| Deployment | Render.com | Free tier; auto-deploy from GitHub; SSL included |

---

## 11. FRONTEND LAYER

### 11.1 Design Philosophy

Every label, tooltip, and description was written in **plain English** — no astronomy jargon. We tested our language against this standard: *"Would a bright 15-year-old understand this without Googling anything?"*

### 11.2 Tab Structure

#### Tab 1: "Check a Planet" 🔭
The primary prediction interface. Users enter 10 stellar/transit parameters through a form with:
- **Tooltips for every field** — e.g., for koi_period: *"How long does the planet take to go around its star? Measured in days. Earth = 365.25 days. A 'hot Jupiter' might orbit in just 1-3 days."*
- **Three quick-fill presets**: Earth-like World, Hot Jupiter, Super-Earth — so users can immediately see how the model works
- **Client-side validation** — every field checked for emptiness, type, and range before API call
- **Results display** — classification badge ("✅ Real Planet" / "❌ Not a Planet"), confidence score, planet size visualization, uncertainty bounds

**Sub-components:**
- **Transit Simulator**: Real-time animated visualization showing the planet crossing its star with a synchronized light curve plot
- **Habitable Zone Calculator**: Automatically computes the star's habitable zone boundaries from stellar luminosity (derived from temperature and radius), plots the planet's orbital distance, and identifies similar known exoplanets from a 20-planet reference database

#### Tab 2: "Mission Queue" 🎯
A mission planning interface for 1,872 unverified star signals. Each signal is classified by the AI and assigned 7 specialist science roles:

1. Radial Velocity Observer — instruments: ESPRESSO, HARPS-N, HIRES
2. Transit Photometrist — instruments: CHEOPS, TESS Extended
3. Centroid Analyst — instruments: Kepler TPF, Gaia DR3
4. Statistical Validator — tools: VESPA, BLENDER
5. Atmospheric Scientist — instruments: JWST NIRSpec, Ariel
6. Stellar Characterizer — techniques: spectroscopy, asteroseismology
7. Dynamical Analyst — tools: TTV analysis, N-body simulations

Each role assignment is conditional on the object's properties (confidence level, radius, habitable zone status, multi-planet system membership).

Features include: urgency score (0-100), sortable/filterable card layout, expandable detail views, pagination.

#### Tab 3: "Star Database" 📊
Browse all 9,564 real NASA KOIs with:
- Pagination (25-30 items per page)
- Column sorting (by any parameter)
- Filter by NASA disposition
- Per-row AI classification (click any row to see what our model predicts)
- Color-coded status badges

#### Tab 4: "My History" 📋
Complete audit trail of all predictions:
- Timestamp, classification result, confidence, predicted radius, response latency
- Expandable detail rows showing all input parameters with friendly labels
- Persistent storage via SQLite backend

#### Tab 5: "Statistics & Batch Analysis" ⚡
- Model performance metrics dashboard (F1, ROC-AUC, R², MAE)
- Feature importance chart (averaged across stacking ensemble base learners)
- **One-click batch analysis engine**: pre-loaded with 100 diverse star systems
  - Animated 6-step pipeline runner
  - Progress bar with step-by-step status indicators
  - Downloadable CSV of all 100 results
  - KPI summary (confirmed count, false positive count, radius distribution)

### 11.3 Validation Layer

Client-side validation enforces:
- **Required fields**: All 10 parameters must be provided
- **Numeric types**: Input must be parseable as floating-point numbers
- **Physical ranges**: Each parameter has bounds (e.g., stellar temperature 2,500-15,000 K)
- **Immediate feedback**: Error messages appear inline before any API call is made

---

## 12. BACKEND & API LAYER

### 12.1 API Endpoints

| Endpoint | Method | Description | Response |
|---|---|---|---|
| `/api/health` | GET | Health check | `{status: "ok", model_loaded: true}` |
| `/api/predict` | POST | Single KOI prediction | Classification label, confidence, radius, uncertainty, planet class |
| `/api/batch-predict` | POST | Batch prediction (≤100) | Per-object results + aggregate statistics |
| `/api/features` | GET | Feature metadata | Feature names, descriptions, ranges, types |
| `/api/predictions` | GET | List all saved predictions | Array of historical predictions |
| `/api/predictions/<id>` | GET | Get specific prediction | Full detail of one prediction |
| `/api/explore` | GET | Browse KOI dataset | Paginated, filterable, sortable records |
| `/api/explore/classify` | POST | Classify existing KOI | Classification + radius for dataset record |
| `/api/discovery` | GET | Mission queue | Batch-classified candidates with role assignments |

### 12.2 Inference Flow

```
Request → Input Validation → Median Imputation → Feature Engineering (7 features) →
StandardScaler → Stacking Classifier → XGBoost Regressor → Quantile Bounds →
Planet Class Assignment → Save to DB → JSON Response
```

### 12.3 Error Handling

- Invalid input: 400 response with field-specific error messages
- Model not loaded: 503 response with explanation
- Server error: 500 response with safe error message (no stack traces)
- Timeout handling: Gunicorn timeout at 120 seconds

### 12.4 Database Schema

Prediction records include:
- Prediction ID (auto-increment)
- Timestamp (ISO format)
- All 10 input features (stored as JSON)
- Classification result and confidence
- Predicted radius and uncertainty
- Planet class
- Inference latency (milliseconds)

---

## 13. RESULTS & PERFORMANCE

### 13.1 Classification Performance

| Metric | Score |
|---|---|
| **ROC-AUC** | **0.97** |
| **F1-Score** | **0.84** |
| **Accuracy** | **90.6%** |

**Interpretation:**
- ROC-AUC of 0.97 means the model has a 97% probability of ranking a randomly selected confirmed planet higher than a randomly selected false positive. This is excellent for an astronomical classification task where even small improvements in false positive rejection save significant telescope resources.
- F1 of 0.84 indicates strong balance between precision (not calling false positives "planets") and recall (not missing real planets).

### 13.2 Regression Performance

| Metric | Score |
|---|---|
| **R²** | **0.96** |
| **68% CI Coverage** | **~68%** |

**Interpretation:**
- R² of 0.96 means the model explains 96% of the variance in observed planetary radii. Residual variance is primarily due to measurement uncertainty in stellar parameters (which propagates directly to radius via the R_p = R_star × sqrt(depth) relationship).
- 68% CI coverage of approximately 68% confirms that our quantile regression bounds are well-calibrated — they are neither overconfident (too narrow) nor too conservative (too wide).

### 13.3 System Performance

| Metric | Value |
|---|---|
| Single prediction latency | <200 ms |
| Batch (100 objects) latency | ~3 seconds |
| Cold start time (Render free tier) | ~30 seconds |
| Concurrent request handling | 2 Gunicorn workers |

---

## 14. KEY INSIGHTS & FEATURE IMPORTANCE

### 14.1 Feature Importance Rankings

Feature importance is computed by averaging the importance scores across all three base learners in the stacking ensemble (XGBoost, Random Forest, ExtraTrees):

Top 5 most important features:
1. **koi_model_snr** (Signal-to-Noise Ratio) — The single most predictive feature for distinguishing planets from false positives
2. **koi_depth** / **log_depth** — Transit depth directly relates to planet-to-star radius ratio
3. **koi_impact** — Impact parameters above 1.0 strongly correlate with false positives
4. **depth_snr_ratio** — Our engineered feature: normalizes depth by detection quality
5. **koi_period** / **log_period** — Orbital period carries information about planet population statistics

### 14.2 Scientific Insights

1. **SNR is king**: High signal-to-noise strongly predicts confirmation. This makes physical sense — real planetary transits produce consistent, repeatable signals, while noise-based false positives have weaker, less coherent signatures.

2. **Impact parameter > 1 ≈ false positive**: Geometrically, an impact parameter above 1.0 means the transiting body crosses only the limb of the stellar disk. While this is physically possible for planets, it is much more common in eclipsing binary false positive scenarios.

3. **Engineered features add real value**: The depth/SNR ratio and stellar density features contributed significantly to model performance, confirming that physics-informed feature engineering outperforms blind feature inclusion.

4. **Period information is subtle**: While orbital period alone is not strongly predictive (planets exist at all periods), it interacts with other features: short-period planets are easier to confirm (more transits observed), creating a detection-bias correlation.

---

## 15. BONUS IMPLEMENTATIONS

### 15.1 Prediction History Database
- All predictions stored with full input/output detail and timestamp
- Enables audit trail, reproducibility, and analytics
- Accessible via `/api/predictions` endpoint and "My History" tab

### 15.2 Real-Time Transit Visualization
- Animated planet crossing its star with synchronized light curve
- Helps users understand what a transit physically looks like
- Renders at 60fps using CSS animations and timed JavaScript

### 15.3 Habitable Zone Calculator
- Computes inner and outer habitable zone boundaries from stellar luminosity
- Plots the planet's orbital distance in context
- Searches a 20-planet reference database for similar known exoplanets

### 15.4 Mission Planning Engine
- 7 specialist science roles assigned per unverified signal
- Instrument-specific recommendations (JWST, ESPRESSO, CHEOPS, etc.)
- Priority scoring system (0-100) based on scientific value
- Complete workflow from detection → classification → follow-up recommendation

### 15.5 Batch Analysis Engine
- 100 pre-loaded diverse star systems
- Animated 6-step pipeline runner with real-time progress tracking
- Downloadable CSV of all results
- Aggregate statistics and visualizations

### 15.6 Low-Latency Architecture
- Sub-200ms inference for single predictions
- ~3 second batch processing for 100 objects
- CPU-only pipeline (no GPU dependency)
- Models loaded once at startup, cached in memory

---

## 16. DEPLOYMENT & LIVE DEMO

### 16.1 Deployment Configuration

**Backend (Python/Flask):**
- Server: Gunicorn with 2 workers
- Timeout: 120 seconds
- Auto-deploy on push to `main` branch
- Environment: Python 3.10+

**Frontend (React.js):**
- Build: Production-optimized bundle via `npm run build`
- Hosting: Render static site
- Auto-deploy on push to `main` branch

### 16.2 Access

- **Live Application**: https://stellar-w9oz.onrender.com/
- **Source Code**: https://github.com/404Avinash/stellar
- **Note**: First visit after inactivity may take ~30s (free tier cold start)

---

## 17. SUSTAINABILITY & ENVIRONMENTAL CONNECTION

### 17.1 Computational Sustainability
- **CPU-only inference**: No GPU power consumption
- **Energy per prediction**: ~0.0001 kWh (vs. ~0.01 kWh for GPU-based neural network inference)
- **Lightweight deployment**: Runs on free-tier cloud infrastructure

### 17.2 Telescope Resource Conservation
- Automated false positive filtering reduces unnecessary follow-up observations
- Estimated telescope time savings: if 50% of false positives are filtered before observation, this saves $500K–$2M per observation cycle in wasted telescope time
- One night on a major telescope consumes approximately 10 MWh of energy

### 17.3 Scientific Sustainability
- Understanding exoplanetary atmospheres informs climate modeling on Earth
- Transit spectroscopy techniques developed for exoplanets are being adapted for Earth-observation satellites monitoring greenhouse gases
- Open-access platform promotes sustainable scientific practices (shared infrastructure rather than per-lab computation)

### 17.4 Educational Sustainability
- Democratizes access to real NASA data without requiring institutional computing resources
- Reduces the computational and financial barriers to space science education
- Plain-English interface enables global accessibility

---

## 18. LIMITATIONS & FUTURE WORK

### 18.1 Current Limitations

1. **Dataset scope**: Currently limited to Kepler KOIs. Does not include TESS, K2 (except via KOI overlap), or ground-based detections.

2. **Feature set**: 10 input features capture the most important transit and stellar parameters, but additional features (photometric centroids, secondary eclipse depths, vetting flags) could improve performance.

3. **Class imbalance**: The 1.82:1 false positive to confirmed ratio is moderate, but performance on rare edge cases (grazing transits of confirmed planets, low-SNR confirmed planets) could be improved with targeted augmentation.

4. **Free-tier limitations**: Render's free tier has cold start delays and limited compute resources, which may affect user experience during high-traffic periods.

5. **Static dataset**: The 9,564 KOIs are a snapshot; new dispositions and corrected parameters from the NASA archive are not automatically ingested.

### 18.2 Future Directions

1. **TESS Integration**: Retrain the model on TESS candidate data (7,913+ objects and growing). The pipeline architecture is modular — swap the data, retrain, deploy.

2. **PLATO Readiness**: ESA's PLATO mission (launching 2026) will monitor 1,000,000+ stars. Our architecture can scale to handle the order-of-magnitude increase in candidates.

3. **Active Learning**: Implement an active learning loop where the model flags the most uncertain candidates for human review, accelerating the labeling of the 1,979 remaining Kepler candidates.

4. **API Access**: Expose the prediction API for programmatic access by research teams, enabling integration with existing astronomical software (AstroPy, lightkurve, exoplanet).

5. **Multi-method Detection**: Extend beyond transit photometry to include radial velocity features, enabling cross-method validation.

---

## 19. REFERENCES

1. NASA Exoplanet Archive — https://exoplanetarchive.ipac.caltech.edu/
2. Kepler Mission Overview — NASA/Ames Research Center
3. Morton, T. D. (2012). "An Efficient Automated Validation Procedure for Exoplanet Transit Candidates" — VESPA
4. Thompson, S. E. et al. (2018). "Planetary Candidates Observed by Kepler. VIII." — Robovetter
5. Valizadegan, H. et al. (2022). "ExoMiner: A Highly Accurate and Explainable Deep Learning Classifier" — NASA
6. Chen, T. & Guestrin, C. (2016). "XGBoost: A Scalable Tree Boosting System"
7. Wolpert, D. H. (1992). "Stacked Generalization" — Neural Networks
8. Pedregosa, F. et al. (2011). "Scikit-learn: Machine Learning in Python"
9. Borucki, W. J. et al. (2010). "Kepler Planet-Detection Mission: Introduction and First Results"
10. Rauer, H. et al. (2014). "The PLATO 2.0 Mission" — Experimental Astronomy

---

## 20. APPENDIX

### A. API Request/Response Examples

**Single Prediction Request:**
```json
POST /api/predict
{
  "koi_period": 365.25,
  "koi_impact": 0.5,
  "koi_duration": 13.0,
  "koi_depth": 84,
  "koi_model_snr": 25.0,
  "koi_steff": 5778,
  "koi_slogg": 4.44,
  "koi_srad": 1.0,
  "koi_smass": 1.0,
  "koi_smet": 0.0
}
```

**Single Prediction Response:**
```json
{
  "label": "CONFIRMED",
  "confidence": 0.94,
  "predicted_radius": 1.42,
  "radius_uncertainty": 0.24,
  "planet_class": "Super-Earth",
  "probabilities": {
    "CONFIRMED": 0.94,
    "FALSE POSITIVE": 0.06
  }
}
```

### B. Batch Analysis Sample Results

| # | Classification | Confidence | Radius (R⊕) | Uncertainty | Planet Class |
|---|---|---|---|---|---|
| 1 | Real Planet | 96.2% | 1.18 | ±0.12 | Earth-size |
| 2 | Real Planet | 89.4% | 8.52 | ±1.83 | Gas Giant |
| 3 | False Alarm | 92.1% | — | — | — |
| 4 | Real Planet | 94.7% | 1.42 | ±0.24 | Super-Earth |
| 5 | False Alarm | 78.3% | — | — | — |

### C. Complete Feature Engineering Pipeline

```
Raw Input (10 features)
    │
    ├── Median imputation (fill missing values)
    │
    ├── Feature engineering:
    │   ├── log_period = log10(koi_period)
    │   ├── log_depth = log10(koi_depth + 1)
    │   ├── log_duration = log10(koi_duration + 1)
    │   ├── log_snr = log10(koi_model_snr + 1)
    │   ├── period_dur_ratio = koi_period / (koi_duration + 0.01)
    │   ├── stellar_density = koi_smass / (koi_srad³ + 0.001)
    │   └── depth_snr_ratio = koi_depth / (koi_model_snr + 1)
    │
    ├── StandardScaler (fit on training data)
    │
    └── Output: 17 scaled features
```

### D. Glossary of Key Terms

| Term | Plain English |
|---|---|
| **Exoplanet** | A planet orbiting a star other than our Sun |
| **Transit** | When a planet passes in front of its star, blocking a tiny bit of light |
| **KOI** | Kepler Object of Interest — a star showing dips that might be a planet |
| **False Positive** | A signal that looks like a planet but isn't |
| **ROC-AUC** | A score (0-1) measuring how well the AI separates real planets from fakes |
| **F1-Score** | A score (0-1) measuring the balance between catching real planets and rejecting fakes |
| **R²** | A score (0-1) measuring how well the AI predicts planet size |
| **Stacking Ensemble** | Combining multiple AI models so they vote together |
| **Quantile Regression** | A way to predict not just the answer but the range of uncertainty |
| **Habitable Zone** | The ring around a star where water could exist as liquid |
| **Transit Depth** | How much starlight gets blocked — bigger planets block more |
| **Impact Parameter** | How close to the star's center the planet crosses |
| **SNR** | Signal-to-Noise Ratio — how strong the signal is compared to background noise |

---

*End of Report*

**Team RUSTY** | Stellar Verification Program | Innorave Eco-Hackathon 2026
