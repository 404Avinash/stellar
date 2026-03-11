"""
ML Pipeline - Inference Module
Loads pre-trained models and returns predictions.
"""
import joblib
import numpy as np
import os

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, os.pardir, "models")

_classifier = None
_regressor  = None
_reg_q16    = None
_reg_q84    = None


def _load():
    global _classifier, _regressor, _reg_q16, _reg_q84
    clf_path  = os.path.join(MODELS_DIR, "classifier.pkl")
    reg_path  = os.path.join(MODELS_DIR, "regressor.pkl")
    q16_path  = os.path.join(MODELS_DIR, "regressor_q16.pkl")
    q84_path  = os.path.join(MODELS_DIR, "regressor_q84.pkl")

    if not os.path.exists(clf_path) or not os.path.exists(reg_path):
        raise FileNotFoundError(
            "Trained models not found. Run  python ml_pipeline/train.py  first."
        )
    _classifier = joblib.load(clf_path)
    _regressor  = joblib.load(reg_path)
    # Quantile models added in upgraded pipeline — graceful fallback if missing
    _reg_q16 = joblib.load(q16_path) if os.path.exists(q16_path) else None
    _reg_q84 = joblib.load(q84_path) if os.path.exists(q84_path) else None
    print("  Models loaded from disk.")


def predict_classification(X: np.ndarray) -> dict:
    """
    X – shape (1, n_features), already scaled.
    Returns {'prediction': 0|1, 'confidence': float, 'probabilities': [p0, p1]}.
    """
    global _classifier
    if _classifier is None:
        _load()

    if X.ndim == 1:
        X = X.reshape(1, -1)

    pred  = int(_classifier.predict(X)[0])
    proba = _classifier.predict_proba(X)[0].tolist()

    return {
        "prediction":    pred,
        "confidence":    float(max(proba)),
        "probabilities": proba,
    }


def predict_radius(X: np.ndarray) -> dict:
    """
    X – shape (1, n_features), already scaled.
    Returns {'radius': float, 'uncertainty': float}.
    Uncertainty is half the 68% credible interval from quantile regressors.
    """
    global _regressor, _reg_q16, _reg_q84
    if _regressor is None:
        _load()

    if X.ndim == 1:
        X = X.reshape(1, -1)

    radius = float(_regressor.predict(X)[0])

    # Use quantile models when available (upgraded pipeline)
    if _reg_q16 is not None and _reg_q84 is not None:
        lo = float(_reg_q16.predict(X)[0])
        hi = float(_reg_q84.predict(X)[0])
        uncertainty = max(0.0, (hi - lo) / 2.0)
    else:
        # Legacy fallback: staged predictions convergence
        staged = [s[0] for s in _regressor.staged_predict(X)]
        last_n = staged[max(0, len(staged) - 50):]
        uncertainty = float(np.std(last_n)) if len(last_n) > 1 else 0.0

    return {
        "radius":      max(0.0, radius),
        "uncertainty": uncertainty,
    }
