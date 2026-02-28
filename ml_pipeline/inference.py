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


def _load():
    global _classifier, _regressor
    clf_path = os.path.join(MODELS_DIR, "classifier.pkl")
    reg_path = os.path.join(MODELS_DIR, "regressor.pkl")

    if not os.path.exists(clf_path) or not os.path.exists(reg_path):
        raise FileNotFoundError(
            "Trained models not found. Run  python ml_pipeline/train.py  first."
        )
    _classifier = joblib.load(clf_path)
    _regressor  = joblib.load(reg_path)
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
    """
    global _regressor
    if _regressor is None:
        _load()

    if X.ndim == 1:
        X = X.reshape(1, -1)

    radius = float(_regressor.predict(X)[0])

    # Estimate uncertainty via staged predictions convergence
    staged = [s[0] for s in _regressor.staged_predict(X)]
    last_n = staged[max(0, len(staged) - 50):]
    uncertainty = float(np.std(last_n)) if len(last_n) > 1 else 0.0

    return {
        "radius":      max(0.0, radius),
        "uncertainty":  uncertainty,
    }
