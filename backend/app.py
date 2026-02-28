"""
Stellar Verification Program — Flask REST API
Serves classification & regression predictions for KOI data.
"""
import sys, os

# Ensure the project root is on the Python path so ml_pipeline is importable
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import json
import time

from ml_pipeline.preprocessing import preprocess_input, validate_input, INPUT_FEATURES, VALID_RANGES
from ml_pipeline.inference import predict_classification, predict_radius

# ── app setup ──────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(PROJECT_ROOT, "backend", "predictions.db")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


# ── database model ─────────────────────────────────────────────────
class Prediction(db.Model):
    id                      = db.Column(db.Integer, primary_key=True)
    timestamp               = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    input_data              = db.Column(db.Text)          # JSON string
    classification_result   = db.Column(db.String(20))
    classification_confidence = db.Column(db.Float)
    regression_result       = db.Column(db.Float)
    regression_uncertainty  = db.Column(db.Float)
    latency_ms              = db.Column(db.Float)

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "input_data": json.loads(self.input_data) if self.input_data else {},
            "classification_result": self.classification_result,
            "classification_confidence": self.classification_confidence,
            "regression_result": self.regression_result,
            "regression_uncertainty": self.regression_uncertainty,
            "latency_ms": self.latency_ms,
        }


with app.app_context():
    db.create_all()


# ── routes ─────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Stellar Verification API is running"}), 200


@app.route("/api/features", methods=["GET"])
def features_info():
    """Return the list of required input features with descriptions & ranges."""
    descriptions = {
        "koi_period":    "Orbital period (days)",
        "koi_impact":    "Impact parameter",
        "koi_duration":  "Transit duration (hours)",
        "koi_depth":     "Transit depth (ppm)",
        "koi_model_snr": "Model signal-to-noise ratio",
        "koi_steff":     "Stellar effective temp (K)",
        "koi_slogg":     "Surface gravity (log g)",
        "koi_srad":      "Stellar radius (solar radii)",
        "koi_smass":     "Stellar mass (solar masses)",
        "koi_smet":      "Stellar metallicity (dex)",
    }
    info = []
    for f in INPUT_FEATURES:
        lo, hi = VALID_RANGES[f]
        info.append({
            "name": f,
            "description": descriptions.get(f, ""),
            "min": lo,
            "max": hi,
        })
    return jsonify(info), 200


@app.route("/api/predict", methods=["POST"])
def predict():
    """Accept KOI parameters → return classification + radius prediction."""
    t0 = time.perf_counter()
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        # Convert string values to float (frontend may send strings)
        cleaned = {}
        for f in INPUT_FEATURES:
            raw = data.get(f)
            if raw is None or raw == "":
                return jsonify({"error": f"Missing required field: {f}"}), 400
            try:
                cleaned[f] = float(raw)
            except (ValueError, TypeError):
                return jsonify({"error": f"{f} must be a number"}), 400

        # Validate ranges
        ok, errs = validate_input(cleaned)
        if not ok:
            return jsonify({"error": "; ".join(errs)}), 400

        # Preprocess
        X = preprocess_input(cleaned)

        # Predict
        cls = predict_classification(X)
        reg = predict_radius(X)

        latency = (time.perf_counter() - t0) * 1000

        result = {
            "classification": {
                "prediction": cls["prediction"],
                "confidence": round(cls["confidence"], 4),
                "label": "CONFIRMED" if cls["prediction"] == 1 else "FALSE POSITIVE",
                "probabilities": {
                    "false_positive": round(cls["probabilities"][0], 4),
                    "confirmed": round(cls["probabilities"][1], 4),
                },
            },
            "regression": {
                "planetary_radius": round(reg["radius"], 4),
                "uncertainty": round(reg["uncertainty"], 4),
            },
            "latency_ms": round(latency, 1),
        }

        # Persist
        row = Prediction(
            input_data=json.dumps(cleaned),
            classification_result=result["classification"]["label"],
            classification_confidence=result["classification"]["confidence"],
            regression_result=result["regression"]["planetary_radius"],
            regression_uncertainty=result["regression"]["uncertainty"],
            latency_ms=result["latency_ms"],
        )
        db.session.add(row)
        db.session.commit()

        return jsonify(result), 200

    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 503
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal error: {str(e)}"}), 500


@app.route("/api/predictions", methods=["GET"])
def get_predictions():
    rows = Prediction.query.order_by(Prediction.id.desc()).all()
    return jsonify([r.to_dict() for r in rows]), 200


@app.route("/api/predictions/<int:pid>", methods=["GET"])
def get_prediction(pid):
    row = Prediction.query.get(pid)
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify(row.to_dict()), 200


@app.route("/api/statistics", methods=["GET"])
def statistics():
    from collections import defaultdict

    total     = Prediction.query.count()
    confirmed = Prediction.query.filter_by(classification_result="CONFIRMED").count()
    fp        = Prediction.query.filter_by(classification_result="FALSE POSITIVE").count()

    avg_conf   = db.session.query(db.func.avg(Prediction.classification_confidence)).scalar() or 0
    avg_radius = db.session.query(db.func.avg(Prediction.regression_result)).scalar() or 0
    avg_lat    = db.session.query(db.func.avg(Prediction.latency_ms)).scalar() or 0

    all_preds = Prediction.query.order_by(Prediction.id.asc()).all()

    # ── Radius buckets (planet category) ──────────────────────────
    radius_defs = [
        {"name": "Sub-Earth",    "label": "< 1 R⊕",   "lo": 0,   "hi": 1},
        {"name": "Earth-like",   "label": "1–2 R⊕",   "lo": 1,   "hi": 2},
        {"name": "Super-Earth",  "label": "2–4 R⊕",   "lo": 2,   "hi": 4},
        {"name": "Neptune-like", "label": "4–8 R⊕",   "lo": 4,   "hi": 8},
        {"name": "Jupiter-like", "label": "8–15 R⊕",  "lo": 8,   "hi": 15},
        {"name": "Super-Jupiter","label": "> 15 R⊕",   "lo": 15,  "hi": 1e9},
    ]
    radius_buckets = []
    for b in radius_defs:
        cnt = sum(1 for p in all_preds if p.regression_result is not None
                  and b["lo"] <= p.regression_result < b["hi"])
        radius_buckets.append({"name": b["name"], "label": b["label"], "count": cnt})

    # ── Confidence buckets ─────────────────────────────────────────
    conf_defs = [(0, .60, "<60%"), (.60, .70, "60-70%"), (.70, .80, "70-80%"),
                 (.80, .90, "80-90%"), (.90, 1.01, ">90%")]
    confidence_buckets = [
        {"range": label,
         "count": sum(1 for p in all_preds
                      if p.classification_confidence is not None
                      and lo <= p.classification_confidence < hi)}
        for lo, hi, label in conf_defs
    ]

    # ── Timeline (by date) ─────────────────────────────────────────
    tmap = defaultdict(lambda: {"confirmed": 0, "false_positive": 0, "total": 0})
    for p in all_preds:
        key = p.timestamp.strftime("%m/%d") if p.timestamp else "?"
        tmap[key]["total"] += 1
        if p.classification_result == "CONFIRMED":
            tmap[key]["confirmed"] += 1
        else:
            tmap[key]["false_positive"] += 1
    timeline = [{"date": k, **v} for k, v in sorted(tmap.items())]

    # ── Feature importance from trained classifier ─────────────────
    feature_importance = []
    try:
        import ml_pipeline.inference as _inf
        from ml_pipeline.preprocessing import ALL_FEATURES
        if _inf._classifier is None:
            _inf._load()
        clf_model = _inf._classifier
        if clf_model is not None:
            pairs = sorted(zip(ALL_FEATURES, clf_model.feature_importances_),
                           key=lambda x: x[1], reverse=True)
            feature_importance = [
                {"feature": f.replace("koi_", "").replace("_", " "),
                 "importance": round(float(v) * 100, 2)}
                for f, v in pairs[:10]
            ]
    except Exception:
        pass

    return jsonify({
        "total_predictions":    total,
        "confirmed_exoplanets": confirmed,
        "false_positives":      fp,
        "confirm_rate":         round(confirmed / total, 4) if total > 0 else 0,
        "avg_confidence":       round(float(avg_conf), 4),
        "avg_planetary_radius": round(float(avg_radius), 4),
        "avg_latency_ms":       round(float(avg_lat), 1),
        "radius_buckets":       radius_buckets,
        "confidence_buckets":   confidence_buckets,
        "timeline":             timeline,
        "feature_importance":   feature_importance,
        "model_metrics": {
            "classifier": {
                "f1_score":  0.8995,
                "roc_auc":   0.9758,
                "accuracy":  0.9241,
                "precision": 0.92,
                "recall":    0.91,
            },
            "regressor": {
                "r2_score": 0.9167,
                "rmse":     0.9447,
                "mae":      0.1800,
            },
            "training_samples": 7306,
            "total_features":   17,
            "dataset":          "NASA KOI Cumulative (9,564 objects)",
        },
    }), 200


# ── main ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
