import React, { useState } from 'react';
import TransitSimulator from './TransitSimulator';
import './PredictionForm.css';

const FEATURES = [
  { key: 'koi_period',    label: 'Planet’s Orbit Duration (days)',       placeholder: '3.5',   tip: 'How many Earth-days the planet takes to go all the way around its star. Earth = 365 days. A close-in planet might be just 3 days!' },
  { key: 'koi_impact',   label: 'Transit Path (0 = centre, 1 = edge)',   placeholder: '0.45',  tip: '0 means the planet crosses right through the middle of the star’s disc. 1 means it barely grazes the edge. Closer to 0 = cleaner signal.' },
  { key: 'koi_duration', label: 'Transit Length (hours)',                 placeholder: '2.8',   tip: 'How many hours the planet blocks part of the star’s light as it passes in front of it.' },
  { key: 'koi_depth',    label: 'Starlight Blocked (ppm)',                placeholder: '500',   tip: 'Parts-per-million of starlight blocked. 1,000,000 ppm = 100%. Earth blocks ~84 ppm. Jupiter blocks ~14,000 ppm. Bigger planet = more light blocked.' },
  { key: 'koi_model_snr',label: 'Detection Clarity Score (SNR)',          placeholder: '30',    tip: 'Signal-to-noise ratio — how clearly the transit stands out above background noise. Above 10 is solid. Below 7 is hard to trust.' },
  { key: 'koi_steff',    label: 'Star’s Temperature (Kelvin)',            placeholder: '5700',  tip: 'How hot the host star is. Our Sun = 5,778 K (yellow). Red dwarfs ≈ 3,000 K. Blue-white stars > 10,000 K.' },
  { key: 'koi_slogg',    label: 'Star’s Surface Gravity (log g)',         placeholder: '4.4',   tip: 'A measure of how strong gravity is on the star’s surface. Normal stars like our Sun = ~4.4. Giant stars = ~2–3.' },
  { key: 'koi_srad',     label: 'Star’s Size (compared to our Sun)',      placeholder: '1.0',   tip: '1.0 = same size as our Sun. 0.5 = half the size. 2.0 = twice as big. This directly affects how big the planet looks.' },
  { key: 'koi_smass',    label: 'Star’s Mass (compared to our Sun)',      placeholder: '1.0',   tip: '1.0 = same mass as our Sun. Heavier stars are hotter and shorter-lived. This helps calculate planet orbit size.' },
  { key: 'koi_smet',     label: 'Star’s Metal Content (vs Sun)',          placeholder: '0.0',   tip: '0 = same metal content as our Sun. Negative = fewer metals. Positive = more. Most stars are between −0.5 and +0.5.' },
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
      <h2 className="form-title">🔭 Does This Star Have a Planet?</h2>
      <p className="form-subtitle">
        Fill in what we know about the star and its signal, then click <strong>Run AI Check</strong>.
        Not sure what the numbers mean? Hover the <strong>ⓘ</strong> icons for plain-English explanations,
        or pick one of the quick presets below to get started instantly.
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

      {/* Live Transit Simulator */}
      <TransitSimulator params={values} />

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
            {loading ? '⏳ Checking…' : '🚀 Run AI Check'}
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
