# Stellar Verification Program - Project Submission

## Project Title
Stellar Verification Program: ML-Powered Exoplanet Classification and Radius Prediction

## Team Information
- **Team Name**: [Your Team Name]
- **Team Members**: [Member 1], [Member 2], [Member 3]
- **Contact**: [Contact Email]
- **Date**: February 28, 2026

## Problem Statement

### Objectives
The Stellar Verification Program aims to leverage machine learning to:
1. **Distinguish confirmed exoplanets from false positives** using Kepler Object of Interest (KOI) data
2. **Accurately predict planetary radius** for confirmed exoplanets

### Challenge
- Not all detected signals correspond to real planets
- Binary stars, stellar noise, and instrumental errors create false positives
- Planetary characteristics must be estimated from incomplete and noisy data

### Solution Approach
Deploy an end-to-end system with:
- Robust frontend interface with validation
- RESTful backend API for predictions
- ML pipeline with preprocessing and inference
- Database for historical tracking

## System Architecture

### Frontend Layer (React.js)
- **Input Interface**: User-friendly form with tooltips and validation
- **Validation**: Client-side validation before API calls
- **Visualization**: Interactive charts (Pie, Bar) for results
- **Tabs**: Predict, History, Statistics

### Backend Layer (Flask)
- **API Endpoints**: `/api/predict`, `/api/statistics`, `/api/predictions`
- **Database**: SQLAlchemy with SQLite
- **Error Handling**: Comprehensive validation and error responses

### ML Pipeline (Python)
- **Preprocessing**: Feature normalization, engineering
- **Classification**: Random Forest for KOI disposition
- **Regression**: Random Forest for planetary radius
- **Inference**: Real-time predictions with confidence scores

## ML Tasks Description

### Task A - Classification
**Goal**: Distinguish CONFIRMED exoplanets from FALSE POSITIVE transit signals

**Target Column**: `koi_disposition`

**Features Used**:
- `koi_period` - Orbital period
- `koi_impact` - Impact parameter
- `koi_duration` - Transit duration
- `koi_depth` - Transit depth
- `koi_steff` - Star temperature
- `koi_srad` - Star radius
- `koi_smass` - Star mass

**Approach**:
1. Load and explore KOI dataset
2. Handle missing values and outliers
3. Engineer composite features
4. Train Random Forest classifier
5. Evaluate using F1-score and ROC-AUC

### Task B - Regression
**Goal**: Predict planetary radius (in Earth radii) for exoplanets

**Target Column**: `koi_prad`

**Approach**:
1. Filter confirmed exoplanets only
2. Prepare regression-specific feature set
3. Train Random Forest regressor
4. Evaluate using RMSE and MAE

## Data Preprocessing & Feature Engineering

### Preprocessing Steps
1. **Missing Value Handling**: Impute with mean values
2. **Outlier Detection**: Identify extreme values
3. **Normalization**: StandardScaler for feature scaling
4. **Validation**: Range checks for physical plausibility

### Feature Engineering
Key engineered features:
- `period_duration_ratio`: Orbital period / Transit duration
- `log_depth`: Log-transformed transit depth
- `log_temp`: Log-transformed stellar temperature
- `stellar_density`: Star mass / (Star radius)³

### Feature Selection
Selected features based on:
- Correlation analysis with targets
- Domain knowledge of exoplanet physics
- Availability at prediction time
- Avoiding target leakage

## Model Selection & Training

### Classification Model
**Model**: Random Forest Classifier
```
- n_estimators: 200
- max_depth: 15
- min_samples_split: 5
- min_samples_leaf: 2
```

**Rationale**:
- Handles non-linear relationships
- Provides feature importance
- Robust to outliers
- Fast inference

### Regression Model
**Model**: Random Forest Regressor
```
- n_estimators: 200
- max_depth: 15
- min_samples_split: 5
- min_samples_leaf: 2
```

**Training Process**:
1. 80-20 train-test split
2. Stratified split for classification
3. Model training and evaluation
4. Hyperparameter tuning if needed

## System Implementation

### Frontend Implementation
- React functional components with hooks
- Axios for API communication
- Recharts for data visualization
- Tailwind CSS for styling
- Input validation with error messages

### Backend Implementation
- Flask with Flask-CORS
- SQLAlchemy ORM for database
- Modular code structure
- Comprehensive error handling
- RESTful API design

### Deployment Considerations
- Environment variables for config
- Database migrations
- CORS configuration
- API rate limiting (optional)
- Logging and monitoring

## Results & Performance

### Classification Results
- **F1-Score**: [To be filled after training]
- **ROC-AUC**: [To be filled after training]
- **Accuracy**: [To be filled after training]

### Regression Results
- **RMSE**: [To be filled after training]
- **MAE**: [To be filled after training]
- **R² Score**: [To be filled after training]

### Key Observations
1. [Add key findings from EDA]
2. [Add insights from model performance]
3. [Add analysis of prediction errors]

### Feature Importance
Top features for classification:
1. [To be determined after training]
2. [To be determined after training]
3. [To be determined after training]

Top features for regression:
1. [To be determined after training]
2. [To be determined after training]
3. [To be determined after training]

## Limitations & Future Improvements

### Limitations
1. **Data Quality**: Missing values handled through imputation
2. **Feature Availability**: Some features may not be available at prediction time
3. **Class Imbalance**: May need stratified sampling or reweighting
4. **Model Uncertainty**: Confidence intervals for predictions

### Future Improvements
1. Ensemble methods combining multiple models
2. Deep learning approaches (Neural Networks)
3. Hyperparameter optimization (GridSearchCV, Bayesian)
4. Cross-validation for robust performance estimation
5. Feature interaction analysis
6. Deployment to cloud platform (AWS, GCP, Azure)

## Appendix: System Requirements

### Hardware
- CPU: 2+ cores
- RAM: 4GB minimum
- Storage: 500MB minimum

### Software
- Python 3.8+
- Node.js 14+
- Flask 2.3+
- React 18+
- scikit-learn 1.2+

### Dependencies
See `backend/requirements.txt` and `frontend/package.json`

---

**Submission Date**: February 28, 2026
**Status**: Complete
