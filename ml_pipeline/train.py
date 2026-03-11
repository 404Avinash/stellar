"""
Train classification & regression models and save to models/ directory.

Classifier : Stacking ensemble — XGBoost + RandomForest + ExtraTrees → LogisticRegression
Regressor  : XGBoost point estimate + HistGBM quantile bounds (16th & 84th pct) for uncertainty

Usage:
    python ml_pipeline/train.py

Run from the project root (nas_charlie/).
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.ensemble import (
    StackingClassifier,
    RandomForestClassifier,
    ExtraTreesClassifier,
    HistGradientBoostingRegressor,
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    f1_score, roc_auc_score, classification_report,
    mean_squared_error, mean_absolute_error, r2_score,
)
from xgboost import XGBClassifier, XGBRegressor
from preprocessing import prepare_training_data

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.pardir, "models")
DATA_PATH  = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.pardir, "data", "koi_data.csv")


def build_classifier():
    """Stacking ensemble: three diverse base learners → LogisticRegression meta."""
    base = [
        ("xgb", XGBClassifier(
            n_estimators=500,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=1.0,
            eval_metric="logloss",
            random_state=42,
            n_jobs=-1,
        )),
        ("rf", RandomForestClassifier(
            n_estimators=300,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )),
        ("et", ExtraTreesClassifier(
            n_estimators=300,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )),
    ]
    return StackingClassifier(
        estimators=base,
        final_estimator=LogisticRegression(C=1.0, max_iter=1000),
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        n_jobs=-1,
        passthrough=False,
    )


def build_regressor():
    """XGBoost regressor for point-estimate planetary radius."""
    return XGBRegressor(
        n_estimators=500,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
    )


def build_quantile_regressors():
    """HistGBM quantile models for 68 % credible interval (16th–84th pct)."""
    params = dict(max_iter=400, max_depth=5, learning_rate=0.08, random_state=42)
    return (
        HistGradientBoostingRegressor(loss="quantile", quantile=0.16, **params),
        HistGradientBoostingRegressor(loss="quantile", quantile=0.84, **params),
    )


def train():
    print("=" * 60)
    print("  STELLAR VERIFICATION PROGRAM — MODEL TRAINING")
    print("  Ensemble: XGBoost + RandomForest + ExtraTrees → LR")
    print("=" * 60)

    # ── 1. Prepare data ────────────────────────────────────────────
    print("\n[1/5] Preparing data …")
    X, y_class, y_radius = prepare_training_data(DATA_PATH)
    print(f"  Samples : {X.shape[0]}")
    print(f"  Features: {X.shape[1]}")
    print(f"  Confirmed: {y_class.sum()}  |  False Positive: {(1 - y_class).sum()}")

    # ── 2. Classification ──────────────────────────────────────────
    print("\n[2/5] Training stacking classifier (5-fold CV meta-learner) …")
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y_class, test_size=0.20, random_state=42, stratify=y_class
    )

    clf = build_classifier()
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
    print("[3/5] Training XGBoost regressor …")
    mask_conf = y_class == 1
    Xr, yr = X[mask_conf], y_radius[mask_conf].values

    Xr_tr, Xr_te, yr_tr, yr_te = train_test_split(
        Xr, yr, test_size=0.20, random_state=42
    )

    reg = build_regressor()
    reg.fit(Xr_tr, yr_tr)

    yr_pred = reg.predict(Xr_te)
    rmse = np.sqrt(mean_squared_error(yr_te, yr_pred))
    mae  = mean_absolute_error(yr_te, yr_pred)
    r2   = r2_score(yr_te, yr_pred)
    print(f"  RMSE : {rmse:.4f}")
    print(f"  MAE  : {mae:.4f}")
    print(f"  R²   : {r2:.4f}")

    # ── 4. Quantile regressors (uncertainty bounds) ─────────────────
    print("\n[4/5] Training quantile regressors (16th & 84th percentile) …")
    reg_q16, reg_q84 = build_quantile_regressors()
    reg_q16.fit(Xr_tr, yr_tr)
    reg_q84.fit(Xr_tr, yr_tr)

    q16_pred = reg_q16.predict(Xr_te)
    q84_pred = reg_q84.predict(Xr_te)
    coverage = np.mean((yr_te >= q16_pred) & (yr_te <= q84_pred))
    print(f"  68% CI coverage : {coverage:.3f}  (target ≈ 0.68)")

    # ── 5. Save ────────────────────────────────────────────────────
    print("\n[5/5] Saving models …")
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(clf,     os.path.join(MODELS_DIR, "classifier.pkl"))
    joblib.dump(reg,     os.path.join(MODELS_DIR, "regressor.pkl"))
    joblib.dump(reg_q16, os.path.join(MODELS_DIR, "regressor_q16.pkl"))
    joblib.dump(reg_q84, os.path.join(MODELS_DIR, "regressor_q84.pkl"))
    print(f"  Saved to  {os.path.abspath(MODELS_DIR)}/")

    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    train()
