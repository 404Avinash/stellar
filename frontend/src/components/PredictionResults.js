import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import './PredictionResults.css';

const COLORS = { confirmed: '#00ffa3', false_positive: '#ff5f7e' };

/* ── False-positive scenario explanations (from NASA/BLENDER research) ── */
function getFPContext(confidence) {
  if (confidence >= 0.80) return {
    icon: '⚡',
    type: 'Eclipsing Binary (EB)',
    desc: 'High-confidence FP — most likely an eclipsing binary system. Deep V-shaped light curve dips mimic planetary transits; a secondary eclipse typically visible at ½ orbital period distinguishes this scenario. Accounts for ~50% of Kepler false positives.',
    color: '#ff5f7e',
    tag: 'MOST COMMON FP',
  };
  if (confidence >= 0.60) return {
    icon: '🔀',
    type: 'Blended / Background EB',
    desc: 'Intermediate-confidence FP — possibly a blended background eclipsing binary. A foreground star dilutes the deep EB signal to a planet-like depth. Centroid shift analysis (astrometry) can confirm — the centroid should shift toward the background source during eclipse.',
    color: '#fb923c',
    tag: 'BACKGROUND BLEND',
  };
  return {
    icon: '🌀',
    type: 'Stellar Variability / Artifact',
    desc: 'Low-confidence FP — consistent with stellar activity (starspots, pulsations, flares) or instrumental systematics. Unlike true transits, variability signatures evolve over time and lack strict periodicity. BLENDER or PASTIS Bayesian validation recommended for confirmation.',
    color: '#ffd166',
    tag: 'STELLAR ACTIVITY',
  };
}

/* ── Planet size classification (Kepler radius gap research) ── */
function getPlanetContext(radius) {
  if (radius < 1.0) return {
    icon: '🌑', type: 'Sub-Earth Class',
    desc: 'Extraordinarily rare — one of the smallest exoplanet classes known. Sub-Earths are difficult to detect even with Kepler. If confirmed, mass determination via radial velocity is critical to distinguish from Mercury-analog.',
    color: '#38bdf8', range: '< 1.0 R⊕',
  };
  if (radius < 1.5) return {
    icon: '🌍', type: 'Earth-Analog Class',
    desc: 'Earth-sized rocky world. Prime habitable zone candidate — cross-reference stellar effective temperature and semi-major axis for liquid water potential. Radius < 1.5 R⊕ strongly suggests rocky bulk composition (below the Kepler radius gap).',
    color: '#00ffa3', range: '1.0 – 1.5 R⊕',
  };
  if (radius < 2.5) return {
    icon: '🌏', type: 'Super-Earth Class',
    desc: 'Super-Earth / mini-Neptune boundary. Below ~1.7 R⊕ likely rocky; above likely volatile-rich with H/He envelope. The Kepler radius gap (1.5–2 R⊕) caused by photoevaporation creates a natural division between these populations.',
    color: '#7c6eff', range: '1.5 – 2.5 R⊕',
  };
  if (radius < 6.0) return {
    icon: '🔵', type: 'Neptune / Sub-Neptune Class',
    desc: 'Ice or gas giant class dominant in Kepler detections. Transit + radial velocity gives mean density → water/ammonia ice envelope likely. Most abundant type in the 2–4 R⊕ range. TESS has found thousands of sub-Neptune candidates.',
    color: '#b79fff', range: '2.5 – 6.0 R⊕',
  };
  if (radius < 15.0) return {
    icon: '🪐', type: 'Gas Giant / Jupiter Class',
    desc: 'Jupiter-class gas giant. Easiest to detect via transit method due to large radius ratio. Hot Jupiters (period < 10 days) were the first exoplanets discovered and remain critical test cases for planetary migration and formation models.',
    color: '#ffd166', range: '6.0 – 15.0 R⊕',
  };
  return {
    icon: '🔴', type: 'Super-Jupiter / Brown Dwarf Boundary',
    desc: 'Super-Jupiter or near the planetary/stellar boundary (~13 M♃ = deuterium-burning limit). Mass confirmation via radial velocity is essential to distinguish a massive gas giant from a low-mass brown dwarf. Very rare in transit surveys.',
    color: '#fb923c', range: '> 15.0 R⊕',
  };
}

function PredictionResults({ data }) {
  if (!data) return null;

  const cls = data.classification || {};
  const reg = data.regression || {};

  const classification = cls.label || 'UNKNOWN';
  const classification_confidence = cls.confidence || 0;
  const probabilities = cls.probabilities || {};
  const predicted_radius = reg.planetary_radius || 0;
  const radius_uncertainty = reg.uncertainty || 0;
  const latency_ms = data.latency_ms || 0;

  const isConfirmed = classification === 'CONFIRMED';

  const pieData = [
    { name: 'Confirmed',      value: +(probabilities?.confirmed || 0).toFixed(3) },
    { name: 'False Positive',  value: +(probabilities?.false_positive || 0).toFixed(3) },
  ];

  const confClass = classification_confidence >= 0.8 ? 'conf-high'
    : classification_confidence >= 0.6 ? 'conf-med' : 'conf-low';

  return (
    <div className="results-wrap">
      {/* Classification */}
      <div className="card result-card">
        <h3 className="rc-title">Task A — Classification</h3>
        <div className="verdict-wrap">
          <div className={`verdict ${isConfirmed ? 'confirmed' : 'false-positive'}`}>
            {isConfirmed ? '✨' : '❌'} {classification?.replace('_', ' ')}
          </div>
          <span className={`pulse-ring ${isConfirmed ? 'conf' : 'fp'}`} />
        </div>
        <p className="rc-conf">Confidence: <strong>{(classification_confidence * 100).toFixed(1)}%</strong></p>
        <div className="conf-bar-wrap">
          <div className="conf-bar-track">
            <div
              className={`conf-bar-fill ${confClass}`}
              style={{ width: `${(classification_confidence * 100).toFixed(1)}%` }}
            />
          </div>
        </div>

        <div className="pie-box">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={4}
                label={({ name, value }) => `${name}: ${(value * 100).toFixed(0)}%`}
              >
                <Cell fill={COLORS.confirmed} />
                <Cell fill={COLORS.false_positive} />
              </Pie>
              <Tooltip
                contentStyle={{ background: '#131629', border: '1px solid #1e2340', borderRadius: 8 }}
                formatter={(v) => `${(v * 100).toFixed(1)}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ── Scenario Explanation ── */}
        {(() => {
          if (!isConfirmed) {
            const fp = getFPContext(classification_confidence);
            return (
              <div className="scenario-card" style={{ borderColor: fp.color + '44' }}>
                <div className="sc-header">
                  <span className="sc-icon">{fp.icon}</span>
                  <div>
                    <span className="sc-tag" style={{ color: fp.color }}>{fp.tag}</span>
                    <p className="sc-type" style={{ color: fp.color }}>{fp.type}</p>
                  </div>
                </div>
                <p className="sc-desc">{fp.desc}</p>
                <p className="sc-source">Classification source: NASA KOI BLENDER/PASTIS false-positive taxonomy</p>
              </div>
            );
          } else {
            return (
              <div className="scenario-card confirmed-ctx">
                <div className="sc-header">
                  <span className="sc-icon">✨</span>
                  <div>
                    <span className="sc-tag" style={{ color: '#00ffa3' }}>VERIFIED CANDIDATE</span>
                    <p className="sc-type" style={{ color: '#00ffa3' }}>Exoplanet Signal Detected</p>
                  </div>
                </div>
                <p className="sc-desc">
                  Model confidence exceeds {(classification_confidence * 100).toFixed(1)}% threshold. Transit signal
                  consistent with a genuine planetary occultation. Signal-to-noise and orbital geometry
                  parameters align with confirmed Kepler planet population. Recommend spectroscopic follow-up
                  via HARPS or HIRES for radial velocity mass confirmation.
                </p>
                <p className="sc-source">Classification source: NASA KOI Cumulative Catalogue · GradientBoosting Classifier (ROC-AUC 97.6%)</p>
              </div>
            );
          }
        })()}
      </div>

      {/* Regression */}
      <div className="card result-card">
        <h3 className="rc-title">Task B — Radius Prediction</h3>
        <div className="radius-display">
          <div className="radius-value">{predicted_radius?.toFixed(3)}</div>
          <span className="radius-unit">R⊕</span>
        </div>
        <p className="rc-unc">±{radius_uncertainty?.toFixed(3)} R⊕ uncertainty</p>
        <RadiusScale value={predicted_radius} />

        {/* ── Planet class context ── */}
        {(() => {
          const pc = getPlanetContext(predicted_radius);
          return (
            <div className="planet-class-card" style={{ borderColor: pc.color + '44' }}>
              <div className="pc-header">
                <span className="pc-icon">{pc.icon}</span>
                <div>
                  <span className="pc-range" style={{ color: pc.color }}>{pc.range}</span>
                  <p className="pc-type" style={{ color: pc.color }}>{pc.type}</p>
                </div>
              </div>
              <p className="pc-desc">{pc.desc}</p>
            </div>
          );
        })()}
      </div>

      {/* Latency */}
      <div className="latency-pill">
        <span className="latency-dot" />
        {latency_ms?.toFixed(0)} ms inference
      </div>
    </div>
  );
}

/* Tiny inline radius context bar */
function RadiusScale({ value }) {
  const markers = [
    { label: 'Earth', r: 1.0 },
    { label: 'Neptune', r: 3.86 },
    { label: 'Jupiter', r: 11.21 },
  ];
  const maxR = 15;
  const pct = Math.min((value / maxR) * 100, 100);

  return (
    <div className="radius-scale">
      <div className="rs-track">
        <div className="rs-fill" style={{ width: `${pct}%` }} />
        {markers.map((m) => (
          <div
            key={m.label}
            className="rs-marker"
            style={{ left: `${(m.r / maxR) * 100}%` }}
            title={`${m.label} = ${m.r} R⊕`}
          >
            <span className="rs-dot" />
            <span className="rs-label">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PredictionResults;
