import React, { useRef, useEffect } from "react";
import "./HabitableZone.css";

/*
  HabitableZone — visual orbital diagram + habitability analysis
  Shows the star, habitable zone boundaries, and where this planet orbits.
  Also finds the nearest known confirmed exoplanet by parameter similarity.
*/

// ── Famous exoplanet database (real confirmed planets) ────────────
const KNOWN_PLANETS = [
  { name: "Kepler-442b",   period: 112.3,  radius: 1.34, steff: 4402, desc: "Rocky super-Earth in habitable zone, 1,206 ly away", hz: true },
  { name: "Kepler-22b",    period: 289.9,  radius: 2.38, steff: 5518, desc: "First HZ planet found by Kepler, water world candidate", hz: true },
  { name: "Kepler-452b",   period: 384.8,  radius: 1.63, steff: 5757, desc: "Earth's older cousin — most Earth-like orbit found", hz: true },
  { name: "Kepler-186f",   period: 129.9,  radius: 1.17, steff: 3788, desc: "First Earth-sized planet in a HZ (red dwarf host)", hz: true },
  { name: "Kepler-1649c",  period: 19.5,   radius: 1.06, steff: 3240, desc: "Most Earth-similar planet found by Kepler", hz: true },
  { name: "TRAPPIST-1e",   period: 6.1,    radius: 0.92, steff: 2566, desc: "Rocky Earth-analog in TRAPPIST-1 system HZ", hz: true },
  { name: "TRAPPIST-1d",   period: 4.05,   radius: 0.77, steff: 2566, desc: "Sub-Earth-sized, inner HZ of ultra-cool dwarf", hz: true },
  { name: "Proxima Cen b", period: 11.2,   radius: 1.08, steff: 3042, desc: "Nearest exoplanet to Earth, 4.24 light years", hz: true },
  { name: "TOI-700 d",     period: 37.4,   radius: 1.19, steff: 3480, desc: "First TESS HZ Earth-sized planet", hz: true },
  { name: "K2-18b",        period: 32.9,   radius: 2.61, steff: 3457, desc: "JWST detected water vapor in atmosphere (2023)", hz: true },
  { name: "55 Cancri e",   period: 0.74,   radius: 1.88, steff: 5196, desc: "Lava world — surface temperature ~2300K", hz: false },
  { name: "HD 209458 b",   period: 3.52,   radius: 15.05, steff: 6065, desc: "First transiting hot Jupiter detected (2000)", hz: false },
  { name: "WASP-121b",     period: 1.27,   radius: 20.5,  steff: 6460, desc: "Ultra-hot Jupiter, metal rain in atmosphere", hz: false },
  { name: "GJ 1214b",      period: 1.58,   radius: 2.68,  steff: 3026, desc: "Archetype sub-Neptune, JWST atmospheric target", hz: false },
  { name: "Kepler-16b",    period: 228.8,  radius: 8.45,  steff: 4450, desc: "Circumbinary planet — orbits two stars (Tatooine)", hz: false },
  { name: "HAT-P-7b",      period: 2.2,    radius: 16.9,  steff: 6350, desc: "Hot Jupiter with extreme day-night contrast", hz: false },
  { name: "Kepler-10b",    period: 0.84,   radius: 1.47,  steff: 5627, desc: "First rocky planet confirmed by Kepler", hz: false },
  { name: "CoRoT-7b",      period: 0.85,   radius: 1.58,  steff: 5275, desc: "First super-Earth with measured density", hz: false },
  { name: "HR 8799 b",     period: 164000, radius: 13.1,  steff: 7430, desc: "First directly imaged exoplanet system", hz: false },
  { name: "LHS 1140 b",    period: 24.7,   radius: 1.73,  steff: 3216, desc: "Dense rocky super-Earth, prime JWST HZ target", hz: true },
];

function findSimilar(period, radius, steff) {
  const scored = KNOWN_PLANETS.map(p => {
    const dP = (Math.log10(p.period + 1) - Math.log10(period + 1)) / 3;
    const dR = (p.radius - radius) / 10;
    const dT = (p.steff - steff) / 3000;
    return { ...p, dist: Math.sqrt(dP * dP + dR * dR + dT * dT) };
  });
  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, 3);
}

// Habitable zone boundaries (Kopparapu et al. 2013)
function calcHZ(steff, srad, smass) {
  const L = (srad ** 2) * ((steff / 5778) ** 4); // luminosity relative to Sun
  const innerHZ = Math.sqrt(L / 1.107);  // conservative inner (runaway greenhouse)
  const outerHZ = Math.sqrt(L / 0.356);  // conservative outer (max greenhouse)
  const optInner = Math.sqrt(L / 1.014);  // optimistic inner
  const optOuter = Math.sqrt(L / 0.3438); // optimistic outer
  return { innerHZ, outerHZ, optInner, optOuter, luminosity: L };
}

function semiMajorAxis(period, smass) {
  // Kepler's 3rd law: a³ = P² × M → a = (P² × M)^(1/3)
  const P_yr = period / 365.25;
  return Math.pow(P_yr * P_yr * smass, 1 / 3); // in AU
}

export default function HabitableZone({ input, radius }) {
  const canvasRef = useRef(null);

  const period = input?.koi_period || 365;
  const steff = input?.koi_steff || 5778;
  const srad = input?.koi_srad || 1.0;
  const smass = input?.koi_smass || 1.0;

  const hz = calcHZ(steff, srad, smass);
  const a = semiMajorAxis(period, smass);
  const inHZ = a >= hz.innerHZ && a <= hz.outerHZ;
  const inOptHZ = a >= hz.optInner && a <= hz.optOuter;
  const similar = findSimilar(period, radius, steff);

  // Equilibrium temperature estimate
  const albedo = 0.3;
  const Teq = steff * Math.sqrt(srad / (2 * a)) * Math.pow(1 - albedo, 0.25);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = 480, H = 240;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const cx = 60, cy = H / 2;
    const scale = Math.min(160, 160 / Math.max(hz.outerHZ, a * 1.3));

    // Star
    const starR = Math.max(6, Math.min(20, srad * 12));
    const glow = ctx.createRadialGradient(cx, cy, starR * 0.5, cx, cy, starR * 3);
    glow.addColorStop(0, "rgba(255,200,50,0.2)");
    glow.addColorStop(1, "rgba(255,200,50,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.beginPath();
    ctx.arc(cx, cy, starR, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${Math.max(0, Math.min(60, (steff - 2500) / 100))}, 100%, 70%)`;
    ctx.fill();

    // Optimistic HZ
    const oiR = hz.optInner * scale;
    const ooR = hz.optOuter * scale;
    ctx.fillStyle = "rgba(0,255,163,0.04)";
    ctx.beginPath();
    ctx.arc(cx, cy, ooR, -0.3, 0.3);
    ctx.arc(cx, cy, oiR, 0.3, -0.3, true);
    ctx.fill();

    // Conservative HZ band
    const iR = hz.innerHZ * scale;
    const oR = hz.outerHZ * scale;
    ctx.fillStyle = "rgba(0,255,163,0.1)";
    ctx.beginPath();
    ctx.arc(cx, cy, oR, -0.5, 0.5);
    ctx.arc(cx, cy, iR, 0.5, -0.5, true);
    ctx.fill();

    // HZ boundary arcs
    [iR, oR].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, -0.6, 0.6);
      ctx.strokeStyle = "rgba(0,255,163,0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Planet orbit arc
    const pR = a * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, pR, -0.8, 0.8);
    ctx.strokeStyle = inHZ ? "rgba(0,255,163,0.6)" : "rgba(255,95,126,0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Planet dot
    const px = cx + pR * Math.cos(0);
    const py = cy + pR * Math.sin(0);
    ctx.beginPath();
    ctx.arc(px, py, Math.max(4, radius * 1.5), 0, Math.PI * 2);
    ctx.fillStyle = inHZ ? "#00ffa3" : "#ff5f7e";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#6b7094";
    ctx.font = "9px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";

    if (iR > 30) {
      ctx.fillStyle = "#00ffa366";
      ctx.fillText("Inner HZ", cx + iR, cy + 16);
    }
    if (oR > 40) {
      ctx.fillStyle = "#00ffa366";
      ctx.fillText("Outer HZ", cx + oR, cy + 16);
    }
    ctx.fillStyle = inHZ ? "#00ffa3" : "#ff5f7e";
    ctx.font = "bold 10px 'Space Grotesk', sans-serif";
    ctx.fillText(`${a.toFixed(2)} AU`, px, py - 10);

    // Distance scale
    ctx.fillStyle = "#4a5270";
    ctx.font = "8px 'Space Grotesk', sans-serif";
    ctx.fillText("Distance from star →", W / 2 + 40, H - 6);

  }, [steff, srad, smass, period, radius, a, hz, inHZ]);

  return (
    <div className="hz-panel">
      <div className="hz-header">
        <span className="hz-title">🌡️ HABITABLE ZONE ANALYSIS</span>
        <span className={`hz-badge ${inHZ ? "hz-in" : inOptHZ ? "hz-opt" : "hz-out"}`}>
          {inHZ ? "✓ IN HABITABLE ZONE" : inOptHZ ? "~ OPTIMISTIC HZ" : "✗ OUTSIDE HZ"}
        </span>
      </div>

      <div className="hz-body">
        <canvas ref={canvasRef} className="hz-canvas" style={{ width: 480, height: 240 }} />

        <div className="hz-stats">
          <div className="hz-stat">
            <span className="hz-stat-label">Semi-major axis</span>
            <span className="hz-stat-val">{a.toFixed(3)} AU</span>
          </div>
          <div className="hz-stat">
            <span className="hz-stat-label">HZ boundaries</span>
            <span className="hz-stat-val">{hz.innerHZ.toFixed(2)} – {hz.outerHZ.toFixed(2)} AU</span>
          </div>
          <div className="hz-stat">
            <span className="hz-stat-label">Equilibrium temp</span>
            <span className="hz-stat-val" style={{ color: Teq > 200 && Teq < 350 ? "#00ffa3" : "#ff5f7e" }}>
              {Teq.toFixed(0)} K ({(Teq - 273).toFixed(0)}°C)
            </span>
          </div>
          <div className="hz-stat">
            <span className="hz-stat-label">Stellar luminosity</span>
            <span className="hz-stat-val">{hz.luminosity.toFixed(3)} L☉</span>
          </div>
        </div>
      </div>

      {/* ── Exoplanet Similarity Engine ── */}
      <div className="sim-section">
        <p className="sim-title">🔗 NEAREST KNOWN EXOPLANETS</p>
        <div className="sim-grid">
          {similar.map((p, i) => (
            <div className={`sim-card ${i === 0 ? "sim-best" : ""}`} key={p.name}>
              <div className="sim-card-head">
                <span className="sim-rank">#{i + 1}</span>
                <span className="sim-name">{p.name}</span>
                {p.hz && <span className="sim-hz-tag">HZ</span>}
              </div>
              <p className="sim-desc">{p.desc}</p>
              <div className="sim-compare">
                <span>P: {p.period.toFixed(1)}d</span>
                <span>R: {p.radius.toFixed(2)} R⊕</span>
                <span>T★: {p.steff}K</span>
              </div>
              {i === 0 && (
                <p className="sim-match">
                  Similarity: {Math.max(0, (1 - p.dist) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
