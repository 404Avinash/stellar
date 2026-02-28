# Stellar Verification Program - Exoplanet Prediction System

A comprehensive end-to-end machine learning system for classifying exoplanets and predicting planetary radius using Kepler Objects of Interest (KOI) data.

## 🌟 Project Overview

The Stellar Verification Program uses advanced machine learning to:
1. **Classify KOI signals** - Distinguish confirmed exoplanets from false positives
2. **Predict planetary radius** - Estimate the planetary radius in Earth radii

## 📋 Project Structure

```
nas_charlie/
├── frontend/              # React.js web application
│   ├── public/           # Static assets
│   ├── src/              # React components
│   │   ├── components/   # Reusable components
│   │   ├── App.js        # Main app component
│   │   └── App.css       # Styling
│   └── package.json      # Frontend dependencies
├── backend/              # Flask REST API
│   ├── app.py           # Main Flask application
│   └── requirements.txt  # Python dependencies
├── ml_pipeline/          # ML models and pipeline
│   ├── preprocessing.py  # Data preprocessing
│   ├── inference.py      # Model inference
│   ├── training.py       # Model training
│   └── eda.py           # Exploratory Data Analysis
├── data/                 # Data directory (add your dataset here)
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL or SQLite

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create Python virtual environment:
```bash
python -m venv venv
source venv/Scripts/activate  # On Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run Flask server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## 📊 API Endpoints

### Prediction
- **POST** `/api/predict` - Get classification and regression predictions
  ```json
  {
    "koi_period": 10.5,
    "koi_impact": 0.5,
    "koi_duration": 5.2,
    "koi_depth": 500,
    "koi_steff": 5778,
    "koi_srad": 1.0,
    "koi_smass": 1.0
  }
  ```

### History & Statistics
- **GET** `/api/predictions` - Get all predictions
- **GET** `/api/predictions/<id>` - Get specific prediction
- **GET** `/api/statistics` - Get aggregated statistics
- **GET** `/api/health` - Health check

## 🤖 ML Pipeline

### Data Preprocessing
- Handles missing values through imputation
- Feature normalization using StandardScaler
- Feature engineering for composite metrics

### Model Architecture
- **Classification**: Random Forest Classifier
  - Metric: F1-score, ROC-AUC
  
- **Regression**: Random Forest Regressor
  - Metric: RMSE, MAE

## 🎯 Features

### Frontend
✅ Input validation with immediate feedback
✅ Interactive prediction interface
✅ Real-time visualization of results
✅ Prediction history tracking
✅ Statistical analytics dashboard
✅ Responsive design

### Backend
✅ RESTful API with CORS support
✅ Input validation and preprocessing
✅ Real-time model inference
✅ Prediction history in database
✅ Statistical aggregation

## 📈 Performance Metrics

### Classification Performance
- **F1-Score**: Measures precision and recall balance
- **ROC-AUC**: Area under the receiver operating characteristic curve

### Regression Performance
- **RMSE**: Root Mean Squared Error
- **MAE**: Mean Absolute Error

## 🔧 Configuration

Create a `.env` file in the backend directory:
```
FLASK_ENV=development
FLASK_DEBUG=1
DATABASE_URL=sqlite:///exoplanet_predictions.db
```

## 📚 Data Requirements

The system expects the following features:
- `koi_period` - Orbital period (days)
- `koi_impact` - Impact parameter
- `koi_duration` - Transit duration (hours)
- `koi_depth` - Transit depth (ppm)
- `koi_steff` - Star effective temperature (K)
- `koi_srad` - Star radius (solar radii)
- `koi_smass` - Star mass (solar masses)

Target variables:
- `koi_disposition` - Classification target (CONFIRMED/FALSE POSITIVE)
- `koi_prad` - Planetary radius (Earth radii)

## 🧪 Testing

Run the frontend tests:
```bash
cd frontend
npm test
```

## 🐛 Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the Flask backend is running and accessible at `http://localhost:5000`

### Database Issues
Delete `exoplanet_predictions.db` and restart the Flask app to reset the database

### Port Already in Use
- Flask: Change port in `app.py` to a different port
- React: Use `PORT=3001 npm start`

## 📝 Documentation

See `ml_pipeline/README.md` for detailed ML pipeline documentation.

## 👥 Team

[Add your team members here]

## 📄 License

[Add license information]
