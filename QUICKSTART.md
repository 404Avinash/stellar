# Quick Start Guide

## 🚀 Setup (5 minutes)

### Step 1: Clone/Download the Project
```bash
cd nas_charlie
```

### Step 2: Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
✓ Backend running on http://localhost:5000

### Step 3: Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm start
```
✓ Frontend running on http://localhost:3000

## 📊 Using the Application

1. **Make a Prediction**
   - Fill in the form with KOI parameters
   - Click "Get Prediction"
   - View classification and radius prediction results

2. **View History**
   - See all previous predictions in the History tab
   - Track classification decisions and confidence scores

3. **Analytics Dashboard**
   - View prediction statistics and distributions
   - Analyze confirmed vs false positive ratios

## 🤖 Training Models

1. **Prepare Data**
   - Place your KOI dataset in `data/` folder
   - Ensure it has required columns

2. **Train Models**
   ```bash
   python ml_pipeline/train_sample.py
   ```
   - Models saved to `models/` folder

3. **Update Backend**
   - Backend automatically loads models
   - Restart Flask to apply changes

## 🧪 Test Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Make Prediction
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "koi_period": 10.5,
    "koi_impact": 0.5,
    "koi_duration": 5.2,
    "koi_depth": 500,
    "koi_steff": 5778,
    "koi_srad": 1.0,
    "koi_smass": 1.0
  }'
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change Flask port in `backend/app.py` |
| Port 3000 in use | Run `PORT=3001 npm start` |
| CORS errors | Check Flask is running on :5000 |
| Dependencies fail | Delete `node_modules` and `venv`, reinstall |

## 📁 Folder Layout

```
nas_charlie/
├── frontend/            # React app
├── backend/             # Flask API
├── ml_pipeline/         # ML models
├── data/                # Your dataset here
├── models/              # Trained models (auto-generated)
└── README.md            # Full documentation
```

## 📚 Next Steps

1. Add your KOI dataset to `data/` folder
2. Run training: `python ml_pipeline/train_sample.py`
3. Explore the UI at http://localhost:3000
4. Check prediction history and statistics
5. Iterate on model improvements

**Questions?** Check README.md for detailed documentation.
