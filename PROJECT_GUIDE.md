# Stellar Verification Program - Complete Project Guide

## 📚 Overview

This is a complete, production-ready implementation of the **Innorave Eco-Hackathon Stellar Verification Program**. It includes:

- ✅ **React.js Frontend** with interactive UI
- ✅ **Flask Backend** with RESTful API
- ✅ **ML Pipeline** for classification and regression
- ✅ **Database Integration** for history tracking
- ✅ **Comprehensive Documentation** and training guide
- ✅ **Jupyter Notebook** for EDA and model development

## 🎯 What This Project Does

### Task A: Classification
**Goal**: Distinguish CONFIRMED exoplanets from FALSE POSITIVE transit signals

**Input**: KOI parameters (orbital period, transit depth, duration, star properties)
**Output**: Classification (CONFIRMED/FALSE POSITIVE) + Confidence score

### Task B: Regression  
**Goal**: Predict planetary radius in Earth radii

**Input**: Same KOI parameters
**Output**: Predicted radius + Uncertainty estimate

## 📂 Project Structure

```
nas_charlie/
├── frontend/                          # React.js Web Application
│   ├── public/                       # Static assets
│   │   └── index.html               
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── PredictionForm.js    # Input form with validation
│   │   │   ├── PredictionResults.js # Results visualization
│   │   │   ├── PredictionHistory.js # History table
│   │   │   └── Statistics.js        # Analytics dashboard
│   │   ├── App.js                   # Main app
│   │   └── index.js                 # Entry point
│   └── package.json                 # Dependencies
│
├── backend/                           # Flask REST API
│   ├── app.py                        # Main Flask application
│   ├── __init__.py                   
│   └── requirements.txt              # Python dependencies
│
├── ml_pipeline/                       # Machine Learning Pipeline
│   ├── preprocessing.py              # Data preprocessing & feature engineering
│   ├── inference.py                  # Model inference functions
│   ├── training.py                   # Model training
│   ├── eda.py                        # Exploratory data analysis
│   ├── train_sample.py               # Sample training script
│   └── __init__.py
│
├── data/                              # Dataset directory
│   └── DATASET_INFO.md              # Dataset format guide
│
├── models/                            # Trained models (generated)
│   ├── classifier.pkl
│   ├── regressor.pkl
│   └── scaler.pkl
│
├── EDA_and_ML_Pipeline.ipynb         # Jupyter notebook (comprehensive)
├── README.md                          # Full documentation
├── QUICKSTART.md                      # 5-minute quick start
├── TRAINING.md                        # Training guide
├── SUBMISSION_TEMPLATE.md             # PDF submission guide
└── .gitignore                         # Git ignore rules
```

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Python 3.8+
- Node.js 14+
- pip and npm

### 1️⃣ Clone/Setup
```bash
cd nas_charlie
```

### 2️⃣ Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
✅ Backend running at `http://localhost:5000`

### 3️⃣ Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm start
```
✅ Frontend running at `http://localhost:3000`

### 4️⃣ Make Predictions!
- Open browser to `http://localhost:3000`
- Fill in KOI parameters
- Click "Get Prediction"
- View results with visualizations

## 🤖 Training Models

### Option 1: Using the Sample Script
```bash
python ml_pipeline/train_sample.py
```

### Option 2: Using Jupyter Notebook
```bash
jupyter notebook EDA_and_ML_Pipeline.ipynb
```

**Steps**:
1. Place your KOI dataset in `data/koi_data.csv`
2. Run the training notebook cells
3. Models are automatically saved to `models/`
4. Backend loads models on startup

## 📊 API Endpoints

### Health Check
```bash
GET /api/health
```

### Make Prediction
```bash
POST /api/predict
Content-Type: application/json

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

**Response**:
```json
{
  "classification": {
    "prediction": 1,
    "confidence": 0.92,
    "label": "CONFIRMED"
  },
  "regression": {
    "planetary_radius": 1.23,
    "uncertainty": 0.18
  }
}
```

### Get All Predictions
```bash
GET /api/predictions
```

### Get Statistics
```bash
GET /api/statistics
```

## 📈 Performance Metrics

### Classification (Task A)
- **F1-Score**: Measures precision and recall balance
- **ROC-AUC**: Area under receiver operating characteristic curve
- **Accuracy**: Overall correctness

### Regression (Task B)
- **RMSE**: Root Mean Squared Error
- **MAE**: Mean Absolute Error
- **R² Score**: Coefficient of determination

## 🔧 Configuration

### Backend Configuration
File: `backend/.env`
```
FLASK_ENV=development
FLASK_DEBUG=1
DATABASE_URL=sqlite:///exoplanet_predictions.db
```

### Frontend Configuration
File: `frontend/src/App.js`
- API base URL: `http://localhost:5000`
- Modify port if needed

## 💾 Database

- **Type**: SQLite (default)
- **Location**: `backend/exoplanet_predictions.db`
- **Tables**: Prediction history with timestamps
- **Features**:
  - Input parameters stored
  - Classification results
  - Regression predictions
  - Timestamps for auditing

## 📋 Feature List

### Input Features (Required at Prediction Time)
1. **koi_period** - Orbital period in days
2. **koi_impact** - Impact parameter of transit
3. **koi_duration** - Transit duration in hours
4. **koi_depth** - Transit depth in ppm
5. **koi_steff** - Host star effective temperature (K)
6. **koi_srad** - Host star radius (solar radii)
7. **koi_smass** - Host star mass (solar masses)

### Engineered Features (Auto-generated)
- `period_duration_ratio`
- `log_depth`
- `log_period`
- `log_steff`
- `stellar_density`
- `log_density`

## 🧪 Testing

### Test Classification Endpoint
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "koi_period": 365.25,
    "koi_impact": 0.1,
    "koi_duration": 13.0,
    "koi_depth": 100,
    "koi_steff": 5778,
    "koi_srad": 1.0,
    "koi_smass": 1.0
  }'
```

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 already in use | Change port in `backend/app.py`: `app.run(port=5001)` |
| Port 3000 already in use | Run frontend with: `PORT=3001 npm start` |
| CORS errors | Ensure Flask backend is running on port 5000 |
| Models not found | Run training script: `python ml_pipeline/train_sample.py` |
| Database error | Delete `backend/exoplanet_predictions.db` and restart |
| Dependencies fail | Delete `node_modules` and `venv`, reinstall |

## 📚 Documentation Files

- **[README.md](README.md)** - Full technical documentation
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[TRAINING.md](TRAINING.md)** - Model training guide
- **[SUBMISSION_TEMPLATE.md](SUBMISSION_TEMPLATE.md)** - PDF submission format
- **[EDA_and_ML_Pipeline.ipynb](EDA_and_ML_Pipeline.ipynb)** - Complete Jupyter notebook

## 🎨 Frontend Features

### Tabs
1. **Predict** - Make predictions with input form
2. **History** - View all past predictions
3. **Statistics** - Analytics dashboard

### Input Form
- Real-time validation
- Tooltips for each field
- Error messages
- Loading state

### Results Display
- Classification prediction (confirmed/false positive)
- Confidence score
- Planetary radius prediction
- Uncertainty estimate
- Input summary

### Visualizations
- Pie charts for confidence
- Bar charts for radius
- Prediction history table
- Statistics dashboard with charts

## 🔐 Security Considerations

- Input validation on both frontend and backend
- Error handling without exposing sensitive info
- Database queries use parameterized statements
- CORS properly configured

## 🚢 Deployment

### Recommended Platforms
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, AWS, Google Cloud, DigitalOcean
- **Database**: Cloud SQL, DynamoDB, or cloud file storage

### Deployment Steps
1. Build frontend: `npm run build`
2. Push to repository
3. Configure environment variables
4. Deploy backend to cloud platform
5. Update frontend API endpoint for production

## 📊 Next Steps for Hackathon

1. **Add Your Dataset**
   - Place KOI data in `data/koi_data.csv`
   - Ensure it matches the format in DATASET_INFO.md

2. **Train Models**
   - Run `python ml_pipeline/train_sample.py`
   - Or use Jupyter notebook for detailed analysis

3. **Customize**
   - Adjust hyperparameters in training scripts
   - Add new features in preprocessing.py
   - Modify visualizations in React components

4. **Test & Validate**
   - Test with sample KOI data
   - Verify predictions make sense
   - Check performance metrics

5. **Document**
   - Fill in SUBMISSION_TEMPLATE.md with results
   - Add your findings to documentation
   - Create visualizations for presentation

## 🏆 Evaluation Criteria

### Classification (Task A)
- F1-Score
- ROC-AUC Score
- Model interpretability

### Regression (Task B)
- RMSE
- MAE
- Physically meaningful predictions

### System Development
- Input validation robustness
- API reliability and latency
- Error handling
- Visualization clarity
- Code organization

## 👥 Team Collaboration

- **Frontend Developer**: Work in `frontend/` folder
- **Backend Developer**: Work in `backend/` folder  
- **ML Engineer**: Work in `ml_pipeline/` folder
- **Documentation**: Update README and guides

All changes saved automatically with git.

## 📞 Support

For detailed documentation, see:
- README.md - Technical details
- QUICKSTART.md - Quick reference
- TRAINING.md - Model training
- Jupyter notebook - Step-by-step walkthrough

## 📝 License

[Add your license here]

---

**Status**: ✅ Production Ready
**Last Updated**: February 28, 2026
**Version**: 1.0.0
