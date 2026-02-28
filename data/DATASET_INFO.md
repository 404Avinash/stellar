# Dataset Information

## Expected Dataset Format

Your KOI dataset should be a CSV file with the following columns:

### Required Columns for Prediction:
- `koi_period` (float) - Orbital period in days
- `koi_impact` (float) - Impact parameter of transit
- `koi_duration` (float) - Transit duration in hours
- `koi_depth` (float) - Transit depth in ppm
- `koi_steff` (float) - Host star effective temperature in K
- `koi_srad` (float) - Host star radius in solar radii
- `koi_smass` (float) - Host star mass in solar masses

### Target Columns for Training:
- `koi_disposition` (string) - Classification target: 'CONFIRMED' or 'FALSE POSITIVE'
- `koi_prad` (float) - Planetary radius in Earth radii

### Optional Columns:
Any additional KOI parameters from NASA Exoplanet Archive

## Data Placement

1. Download your KOI dataset from [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/)
2. Place CSV file in the `data/` folder
3. Name it `koi_data.csv` or update filename in training script

## Data Preprocessing

The system automatically:
- Handles missing values through imputation
- Removes rows with missing target values
- Normalizes features using StandardScaler
- Applies feature engineering

## Example Data

```csv
koi_period,koi_impact,koi_duration,koi_depth,koi_steff,koi_srad,koi_smass,koi_disposition,koi_prad
10.5,0.5,5.2,500,5778,1.0,1.0,CONFIRMED,1.05
23.2,0.1,3.8,250,5500,0.9,0.95,FALSE POSITIVE,1.2
```

## Validation Rules

Input validation ensures:
- All numeric fields are present
- Values are numeric (not NaN or string)
- Non-negative values where applicable
- Values within physical plausibility ranges

---

For more information on KOI data, visit the [NASA Exoplanet Archive Documentation](https://exoplanetarchive.ipac.caltech.edu/ws/bulk_serialize/resultset)
