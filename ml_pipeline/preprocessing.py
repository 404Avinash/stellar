"""
ML Pipeline - Preprocessing Module
Handles validation, feature engineering, and scaling for inference & training.
"""
import pandas as pd
import numpy as np
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, os.pardir, "models")

# ── features the user provides at prediction time ──────────────────
INPUT_FEATURES = [
    "koi_period",       # Orbital period (days)
    "koi_impact",       # Impact parameter
    "koi_duration",     # Transit duration (hours)
    "koi_depth",        # Transit depth (ppm)
    "koi_model_snr",    # Model signal-to-noise ratio
    "koi_steff",        # Stellar effective temperature (K)
    "koi_slogg",        # Stellar surface gravity (log10 cm/s^2)
    "koi_srad",         # Stellar radius (solar radii)
    "koi_smass",        # Stellar mass (solar masses)
    "koi_smet",         # Stellar metallicity (dex)
]

# ── validation ranges (physical plausibility) ──────────────────────
VALID_RANGES = {
    "koi_period":    (0.1,   1e5),
    "koi_impact":    (0.0,   3.0),
    "koi_duration":  (0.01,  200),
    "koi_depth":     (0.0,   1e7),
    "koi_model_snr": (0.0,   1e6),
    "koi_steff":     (2500,  15000),
    "koi_slogg":     (0.0,   6.0),
    "koi_srad":      (0.01,  200),
    "koi_smass":     (0.01,  100),
    "koi_smet":      (-5.0,  5.0),
}


def validate_input(data: dict):
    """Return (is_valid, list_of_error_strings)."""
    errors = []
    for feat in INPUT_FEATURES:
        if feat not in data or data[feat] is None or data[feat] == "":
            errors.append(f"Missing required field: {feat}")
            continue
        try:
            val = float(data[feat])
        except (ValueError, TypeError):
            errors.append(f"{feat} must be numeric")
            continue
        lo, hi = VALID_RANGES[feat]
        if not (lo <= val <= hi):
            errors.append(f"{feat} = {val} outside valid range [{lo}, {hi}]")
    return len(errors) == 0, errors


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add derived columns that help the models."""
    out = df.copy()
    out["log_period"]       = np.log1p(df["koi_period"])
    out["log_depth"]        = np.log1p(df["koi_depth"])
    out["log_duration"]     = np.log1p(df["koi_duration"])
    out["log_snr"]          = np.log1p(df["koi_model_snr"])
    out["period_dur_ratio"] = df["koi_period"] / (df["koi_duration"] + 1e-9)
    out["stellar_density"]  = df["koi_smass"] / (df["koi_srad"] ** 3 + 1e-9)
    out["depth_snr_ratio"]  = df["koi_depth"] / (df["koi_model_snr"] + 1e-9)
    return out


def _all_feature_names():
    dummy = pd.DataFrame([{f: 1.0 for f in INPUT_FEATURES}])
    return list(engineer_features(dummy).columns)

ALL_FEATURES = _all_feature_names()


def preprocess_input(data: dict) -> np.ndarray:
    """
    Validate -> DataFrame -> engineer -> scale with SAVED scaler.
    Returns a 2-D numpy array of shape (1, n_features).
    """
    ok, errs = validate_input(data)
    if not ok:
        raise ValueError("; ".join(errs))

    row = {f: float(data[f]) for f in INPUT_FEATURES}
    df = pd.DataFrame([row])
    df = engineer_features(df)[ALL_FEATURES]

    scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(
            "Scaler not found. Run  python ml_pipeline/train.py  first."
        )
    scaler = joblib.load(scaler_path)
    return scaler.transform(df)


def prepare_training_data(csv_path: str):
    """
    Returns X_scaled, y_class (0/1), y_radius (float).
    Keeps only CONFIRMED and FALSE POSITIVE rows.
    Fits + saves the scaler to models/scaler.pkl.
    """
    from sklearn.preprocessing import StandardScaler

    df = pd.read_csv(csv_path)
    df = df[df["koi_disposition"].isin(["CONFIRMED", "FALSE POSITIVE"])].copy()

    cols_needed = INPUT_FEATURES + ["koi_disposition", "koi_prad"]
    df = df.dropna(subset=cols_needed).reset_index(drop=True)

    X = engineer_features(df[INPUT_FEATURES])[ALL_FEATURES]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.pkl"))
    print(f"  Scaler saved  ({X_scaled.shape[1]} features, {X_scaled.shape[0]} rows)")

    y_class  = (df["koi_disposition"] == "CONFIRMED").astype(int)
    y_radius = df["koi_prad"].copy()

    return X_scaled, y_class, y_radius
