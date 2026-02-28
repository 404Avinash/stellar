import React, { useState } from 'react';
import './PredictionForm.css';

const FEATURES = [
  { key: 'koi_period',     label: 'Orbital Period (days)',      placeholder: '3.5',    tip: 'Time for one orbit around the star' },
  { key: 'koi_impact',     label: 'Impact Parameter',           placeholder: '0.45',   tip: '0 = center transit, 1 = grazing (0–1+)' },
  { key: 'koi_duration',   label: 'Transit Duration (hrs)',     placeholder: '2.8',    tip: 'How long transit lasts' },
  { key: 'koi_depth',      label: 'Transit Depth (ppm)',        placeholder: '500',    tip: 'Fractional dip in stellar brightness' },
  { key: 'koi_model_snr',  label: 'Model SNR',                  placeholder: '30',     tip: 'Signal-to-noise of transit model fit' },
  { key: 'koi_steff',      label: 'Stellar Temp (K)',            placeholder: '5700',   tip: 'Host star effective temperature' },
  { key: 'koi_slogg',      label: 'Stellar log(g)',              placeholder: '4.4',    tip: 'Host star surface gravity (log cgs)' },
  { key: 'koi_srad',       label: 'Stellar Radius (R☉)',       placeholder: '1.0',    tip: 'Host star radius in solar radii' },
  { key: 'koi_smass',      label: 'Stellar Mass (M☉)',         placeholder: '1.0',    tip: 'Host star mass in solar masses' },
  { key: 'koi_smet',       label: 'Stellar Metallicity',        placeholder: '0.0',    tip: '[Fe/H] relative to Sun' },
];

const DEFAULT_VALUES = {};
FEATURES.forEach(f => { DEFAULT_VALUES[f.key] = ''; });

const PRESETS = {
  'Earth-like': {
    koi_period: '365.25', koi_impact: '0.3', koi_duration: '13.0',
    koi_depth: '84', koi_model_snr: '50', koi_steff: '5778',
    koi_slogg: '4.44', koi_srad: '1.0', koi_smass: '1.0', koi_smet: '0.0',
  },
  'Hot Jupiter': {
    koi_period: '3.5', koi_impact: '0.15', koi_duration: '2.8',
    koi_depth: '14000', koi_model_snr: '100', koi_steff: '6000',
    koi_slogg: '4.2', koi_srad: '1.3', koi_smass: '1.2', koi_smet: '0.1',
  },
  'Super Earth': {
    koi_period: '15.0', koi_impact: '0.5', koi_duration: '4.2',
    koi_depth: '350', koi_model_snr: '35', koi_steff: '4800',
    koi_slogg: '4.6', koi_srad: '0.8', koi_smass: '0.7', koi_smet: '-0.1',
  },
};

function PredictionForm({ onSubmit, loading }) {
  const [values, setValues] = useState({ ...DEFAULT_VALUES });

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const applyPreset = (name) => {
    setValues({ ...PRESETS[name] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check all filled
    const missing = FEATURES.filter((f) => values[f.key] === '');
    if (missing.length) {
      alert(`Please fill: ${missing.map(f => f.label).join(', ')}`);
      return;
    }
    onSubmit(values);
  };

  const handleClear = () => setValues({ ...DEFAULT_VALUES });

  return (
    <div className="card form-card">
      <h2 className="form-title">🔭 Predict Exoplanet Status</h2>
      <p className="form-subtitle">
        Enter Kepler Object of Interest (KOI) parameters to classify the candidate
        and predict its planetary radius.
      </p>

      {/* Presets */}
      <div className="presets">
        <span className="preset-label">Quick fill:</span>
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            type="button"
            className="preset-btn"
            onClick={() => applyPreset(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        {FEATURES.map((f) => (
          <div className="field" key={f.key}>
            <label className="field-label" htmlFor={f.key}>
              {f.label}
              <span className="field-tip" title={f.tip}>ⓘ</span>
            </label>
            <input
              id={f.key}
              type="number"
              step="any"
              placeholder={f.placeholder}
              value={values[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="field-input"
            />
          </div>
        ))}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Predicting…' : '🚀 Run Prediction'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleClear}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

export default PredictionForm;
