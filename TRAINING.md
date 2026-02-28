# ML Pipeline Training Guide

## Setup Training Environment

1. Install dependencies:
```bash
pip install -r backend/requirements.txt
```

2. Ensure your dataset is in the `data/` directory with the expected columns.

## Training Script

Create `ml_pipeline/train_models.py`:

```python
from training import train_pipeline

# Train models
results = train_pipeline(
    'data/koi_data.csv',
    'models/classifier.pkl',
    'models/regressor.pkl'
)

print("Classification Metrics:", results['classification'])
print("Regression Metrics:", results['regression'])
```

## Running Training

```bash
python ml_pipeline/train_models.py
```

## Expected Output

- `models/classifier.pkl` - Trained classification model
- `models/regressor.pkl` - Trained regression model

## Feature Importance

The Random Forest models provide feature importance scores that can guide feature engineering and selection.

## Model Evaluation

Models are evaluated using:
- **Classification**: F1-score and ROC-AUC
- **Regression**: RMSE and MAE

## Next Steps

1. Fine-tune hyperparameters based on performance
2. Perform cross-validation for robust evaluation
3. Check for feature leakage in target-related features
4. Analyze prediction errors and failure cases
