import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import HabitableZone from './HabitableZone';
import './PredictionResults.css';

const COLORS = { confirmed: '#00ffa3', false_positive: '#ff5f7e' };

/* ── False-positive scenario explanations (from NASA/BLENDER research) ── */
function getFPContext(confidence) {
  if (confidence >= 0.80) return {
    icon: '⚡',
    type: 'Two Stars Mimicking a Planet (Eclipsing Binary)',
    desc: 'The signal is most likely caused by two stars orbiting each other, not a planet. When one star passes in front of the other, it creates a dip in brightness that looks just like a planet transit. This is the most common ‘false alarm’ in planet hunting — accounting for about half of all fake detections.',
    color: '#ff5f7e',
    tag: 'MOST COMMON FALSE ALARM',
  };
  if (confidence >= 0.60) return {
    icon: '🔀',
    type: 'Blended Background Stars (Background EB)',
    desc: 'There is probably a pair of eclipsing stars somewhere behind or near our target star. Their signal gets mixed in with the target star’s light and creates a shallower dip that looks planet-sized. Astronomers can check this by seeing if the light source slightly shifts position during the dip.',
    color: '#fb923c',
    tag: 'BACKGROUND STAR BLEND',
  };
  return {
    icon: '🌀',
    type: 'Star Itself Acting Up (Stellar Variability)',
    desc: 'The dip in brightness may be caused by the star itself — things like starspots (like sunspots but bigger), stellar flares, or pulsations. Unlike a real planet transit, these signals tend to change over time and don’t have a perfectly regular schedule.',
    color: '#ffd166',
    tag: 'STELLAR NOISE',
  };
}

/* ── Planet size classification (Kepler radius gap research) ── */
function getPlanetContext(radius) {
  if (radius < 1.0) return {
    icon: '🌑', type: 'Smaller Than Earth',
    desc: 'This planet is even smaller than Earth — one of the tiniest known. Planets this small are very hard to detect because they block so little starlight. If confirmed, scientists would want to measure its mass to understand what it’s made of.',
    color: '#38bdf8', range: '< 1.0 × Earth',
  };
  if (radius < 1.5) return {
    icon: '🌍', type: 'Earth-Sized Rocky World',
    desc: 'About the same size as Earth — likely a rocky planet with a solid surface. This is the most exciting category for finding life! Scientists check whether it’s in the habitable zone (not too hot, not too cold) where liquid water could exist on the surface.',
    color: '#00ffa3', range: '1.0 – 1.5 × Earth',
  };
  if (radius < 2.5) return {
    icon: '🌏', type: 'Super-Earth (Bigger Than Earth, Smaller Than Neptune)',
    desc: 'Larger than Earth but smaller than Neptune. Planets below ~1.7× Earth are probably rocky. Larger ones likely have a thick gas atmosphere on top of a rocky core. There is nothing like this in our Solar System — it is one of the most common planet types in the galaxy!',
    color: '#7c6eff', range: '1.5 – 2.5 × Earth',
  };
  if (radius < 6.0) return {
    icon: '🔵', type: 'Mini-Neptune (Ice or Gas Giant)',
    desc: 'Similar in size to Neptune in our Solar System. These planets likely have a large atmosphere of hydrogen, helium, and water vapour surrounding a rocky or icy core. They are the most common type found by the Kepler telescope.',
    color: '#b79fff', range: '2.5 – 6.0 × Earth',
  };
  if (radius < 15.0) return {
    icon: '🪐', type: 'Gas Giant (Jupiter-like)',
    desc: 'A massive ball of gas similar to Jupiter or Saturn in our Solar System. These are the easiest planets to detect because they are so big. Ones orbiting very close to their star (called “Hot Jupiters”) were actually the first type of exoplanet ever discovered, back in the 1990s.',
    color: '#ffd166', range: '6.0 – 15.0 × Earth',
  };
  return {
    icon: '🔴', type: 'Super-Jupiter (At the Edge of Being a Star)',
    desc: 'This is so large it sits right at the border between a massive planet and a “brown dwarf” — a failed star that was not quite massive enough to ignite nuclear fusion. Scientists would need to measure its mass directly to decide which category it truly belongs in.',
    color: '#fb923c', range: '> 15.0 × Earth',
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
        <h3 className="rc-title">Step 1 — Is it a Real Planet?</h3>
        <div className="verdict-wrap">
          <div className={`verdict ${isConfirmed ? 'confirmed' : 'false-positive'}`}>
            {isConfirmed ? '✨' : '❌'} {classification?.replace('_', ' ')}
          </div>
          <span className={`pulse-ring ${isConfirmed ? 'conf' : 'fp'}`} />
        </div>
        <p className="rc-conf">The AI is <strong>{(classification_confidence * 100).toFixed(1)}%</strong> confident in this result</p>
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
                <p className="sc-source">📚 Explained by NASA KOI false-positive research (BLENDER/PASTIS studies)</p>
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
                  The AI is {(classification_confidence * 100).toFixed(1)}% confident this signal is a genuine planet.
                  The transit shape and timing match what real planets look like in Kepler data.
                  Next step for astronomers would be a follow-up measurement to confirm the planet’s mass.
                </p>
                <p className="sc-source">📚 Based on NASA’s Kepler KOI Catalogue · AI trained on 9,564 real star systems (97.6% accuracy)</p>
              </div>
            );
          }
        })()}
      </div>

      {/* Regression */}
      <div className="card result-card">
        <h3 className="rc-title">Step 2 — How Big is the Planet?</h3>
        <div className="radius-display">
          <div className="radius-value">{predicted_radius?.toFixed(3)}</div>
          <span className="radius-unit" title="R⊕ = Earth radii. 1 = same size as Earth. 11.2 = same size as Jupiter.">R⊕ (Earth radii)</span>
        </div>
        <p className="rc-unc">±{radius_uncertainty?.toFixed(3)} Earth radii margin of error</p>
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
        Result ready in {latency_ms?.toFixed(0)} ms
      </div>

      {/* Habitable Zone + Exoplanet Similarity */}
      {data.input && (
        <HabitableZone input={data.input} radius={predicted_radius} />
      )}
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
      <p style={{ fontSize: '0.72rem', color: '#6b7094', marginBottom: 4, marginTop: 0 }}>
        Size compared to planets in our Solar System:
      </p>
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
