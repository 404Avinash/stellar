"""
Train classification & regression models and save to models/ directory.

Usage:
    python ml_pipeline/train.py

Run from the project root (nas_charlie/).
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.metrics import (
    f1_score, roc_auc_score, classification_report,
    mean_squared_error, mean_absolute_error, r2_score,
)
from preprocessing import prepare_training_data

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.pardir, "models")
DATA_PATH  = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.pardir, "data", "koi_data.csv")


def train():
    print("=" * 60)
    print("  STELLAR VERIFICATION PROGRAM — MODEL TRAINING")
    print("=" * 60)

    # ── 1. Prepare data ────────────────────────────────────────────
    print("\n[1/4] Preparing data …")
    X, y_class, y_radius = prepare_training_data(DATA_PATH)
    print(f"  Samples : {X.shape[0]}")
    print(f"  Features: {X.shape[1]}")
    print(f"  Confirmed: {y_class.sum()}  |  False Positive: {(1 - y_class).sum()}")

    # ── 2. Classification ──────────────────────────────────────────
    print("\n[2/4] Training classifier (GradientBoosting) …")
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y_class, test_size=0.20, random_state=42, stratify=y_class
    )

    clf = GradientBoostingClassifier(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        random_state=42,
    )
    clf.fit(X_tr, y_tr)

    y_pred  = clf.predict(X_te)
    y_proba = clf.predict_proba(X_te)[:, 1]

    f1  = f1_score(y_te, y_pred)
    auc = roc_auc_score(y_te, y_proba)
    print(f"  F1-score : {f1:.4f}")
    print(f"  ROC-AUC  : {auc:.4f}")
    print(f"  Accuracy : {clf.score(X_te, y_te):.4f}")
    print(classification_report(y_te, y_pred, target_names=["FALSE POSITIVE", "CONFIRMED"]))

    # ── 3. Regression (on CONFIRMED only) ──────────────────────────
    print("[3/4] Training regressor (GradientBoosting) …")
    mask_conf = y_class == 1
    Xr, yr = X[mask_conf], y_radius[mask_conf].values

    Xr_tr, Xr_te, yr_tr, yr_te = train_test_split(
        Xr, yr, test_size=0.20, random_state=42
    )

    reg = GradientBoostingRegressor(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        random_state=42,
    )
    reg.fit(Xr_tr, yr_tr)

    yr_pred = reg.predict(Xr_te)
    rmse = np.sqrt(mean_squared_error(yr_te, yr_pred))
    mae  = mean_absolute_error(yr_te, yr_pred)
    r2   = r2_score(yr_te, yr_pred)
    print(f"  RMSE : {rmse:.4f}")
    print(f"  MAE  : {mae:.4f}")
    print(f"  R²   : {r2:.4f}")

    # ── 4. Save ────────────────────────────────────────────────────
    print("\n[4/4] Saving models …")
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(clf, os.path.join(MODELS_DIR, "classifier.pkl"))
    joblib.dump(reg, os.path.join(MODELS_DIR, "regressor.pkl"))
    print(f"  Saved to  {os.path.abspath(MODELS_DIR)}/")

    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    train()
