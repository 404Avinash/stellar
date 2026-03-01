import React, { useRef, useEffect, useCallback } from "react";
import "./TransitSimulator.css";

/*
  TransitSimulator — live animated visualization of a planetary transit
  Shows:  
  1. A star disk with planet crossing it
  2. The resulting photometric light curve (flux vs phase)
  Updates in real-time as the user changes parameters.
*/

const W = 520, H = 180;     // light-curve canvas size
const SW = 520, SH = 200;   // star view canvas size

// Color temperature → RGB (approximate black-body)
function tempToRGB(T) {
  T = Math.max(1000, Math.min(40000, T)) / 100;
  let r, g, b;
  if (T <= 66) { r = 255; } else { r = 329.698727446 * Math.pow(T - 60, -0.1332047592); }
  if (T <= 66) { g = 99.4708025861 * Math.log(T) - 161.1195681661; } 
  else { g = 288.1221695283 * Math.pow(T - 60, -0.0755148492); }
  if (T >= 66) { b = 255; } 
  else if (T <= 19) { b = 0; } 
  else { b = 138.5177312231 * Math.log(T - 10) - 305.0447927307; }
  return [Math.min(255, Math.max(0, r)), Math.min(255, Math.max(0, g)), Math.min(255, Math.max(0, b))];
}

// Limb darkening model (quadratic)
function limbDarkening(r_frac) {
  const u1 = 0.4, u2 = 0.2;
  const mu = Math.sqrt(Math.max(0, 1 - r_frac * r_frac));
  return 1 - u1 * (1 - mu) - u2 * (1 - mu) * (1 - mu);
}

export default function TransitSimulator({ params }) {
  const starRef = useRef(null);
  const curveRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  const depth = parseFloat(params.koi_depth) || 84;       // ppm
  const duration = parseFloat(params.koi_duration) || 13;  // hours
  const period = parseFloat(params.koi_period) || 365;     // days
  const impact = parseFloat(params.koi_impact) || 0.3;
  const steff = parseFloat(params.koi_steff) || 5778;
  const srad = parseFloat(params.koi_srad) || 1.0;

  // Derived
  const depthFrac = Math.min(depth / 1e6, 0.05);  // cap visual
  const rp_ratio = Math.sqrt(depthFrac);            // Rp/Rs
  const starR = 60 * Math.min(srad, 2.5);           // pixels
  const planetR = Math.max(4, starR * rp_ratio * 3); // boost for visibility
  const transitFrac = Math.min(duration / (period * 24), 0.15);

  const draw = useCallback((t) => {
    tRef.current = t;
    const starCanvas = starRef.current;
    const curveCanvas = curveRef.current;
    if (!starCanvas || !curveCanvas) return;

    const sctx = starCanvas.getContext("2d");
    const cctx = curveCanvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    // ─── Star View ──────────────────────────────
    starCanvas.width = SW * dpr;
    starCanvas.height = SH * dpr;
    sctx.scale(dpr, dpr);
    sctx.clearRect(0, 0, SW, SH);

    const cx = SW / 2, cy = SH / 2;
    const [sr, sg, sb] = tempToRGB(steff);

    // Star glow
    const glow = sctx.createRadialGradient(cx, cy, starR * 0.3, cx, cy, starR * 2.5);
    glow.addColorStop(0, `rgba(${sr},${sg},${sb},0.12)`);
    glow.addColorStop(0.5, `rgba(${sr},${sg},${sb},0.04)`);
    glow.addColorStop(1, `rgba(${sr},${sg},${sb},0)`);
    sctx.fillStyle = glow;
    sctx.fillRect(0, 0, SW, SH);

    // Star disk with limb darkening
    for (let i = 40; i >= 0; i--) {
      const f = i / 40;
      const ld = limbDarkening(f);
      sctx.beginPath();
      sctx.arc(cx, cy, starR * f + 1, 0, Math.PI * 2);
      sctx.fillStyle = `rgba(${Math.round(sr * ld)},${Math.round(sg * ld)},${Math.round(sb * ld)},1)`;
      sctx.fill();
    }

    // Planet position (sinusoidal orbit across the star)
    const phase = ((t / 4000) % 1);  // 0→1 cycle
    const px = cx + (SW * 0.7) * (phase - 0.5);
    const py = cy + impact * starR * 0.8;

    // Draw planet
    sctx.beginPath();
    sctx.arc(px, py, planetR, 0, Math.PI * 2);
    sctx.fillStyle = "#0c0e1a";
    sctx.fill();
    // Planet tiny glow edge
    sctx.strokeStyle = `rgba(${sr},${sg},${sb},0.15)`;
    sctx.lineWidth = 1;
    sctx.stroke();

    // Is planet in front of star?
    const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    const inTransit = dist < (starR + planetR * 0.3);

    // ─── Light Curve ────────────────────────────
    curveCanvas.width = W * dpr;
    curveCanvas.height = H * dpr;
    cctx.scale(dpr, dpr);
    cctx.clearRect(0, 0, W, H);

    // Y-axis scale
    const yTop = 20, yBot = H - 25;
    const yRange = yBot - yTop;
    const baseline = yTop + 10;
    const dipPx = Math.min(yRange * 0.7, depth / 1e6 * yRange * 600); // amplified for visibility

    // Grid
    cctx.strokeStyle = "rgba(124,110,255,0.08)";
    cctx.lineWidth = 1;
    for (let gy = yTop; gy <= yBot; gy += 20) {
      cctx.beginPath(); cctx.moveTo(30, gy); cctx.lineTo(W - 10, gy); cctx.stroke();
    }
    for (let gx = 30; gx <= W - 10; gx += 60) {
      cctx.beginPath(); cctx.moveTo(gx, yTop); cctx.lineTo(gx, yBot); cctx.stroke();
    }

    // Transit shape
    const midX = W / 2;
    const tWidth = Math.max(40, W * transitFrac * 2);
    const ingressW = tWidth * 0.15 * (1 + impact * 0.5);

    cctx.beginPath();
    cctx.moveTo(30, baseline);
    cctx.lineTo(midX - tWidth / 2, baseline);

    // ingress
    cctx.lineTo(midX - tWidth / 2 + ingressW, baseline + dipPx);
    // flat bottom (or V-shape for high impact)
    const flatBottom = Math.max(0, tWidth - 2 * ingressW);
    cctx.lineTo(midX - tWidth / 2 + ingressW + flatBottom, baseline + dipPx);
    // egress
    cctx.lineTo(midX + tWidth / 2, baseline);
    cctx.lineTo(W - 10, baseline);

    // Gradient fill
    const grad = cctx.createLinearGradient(0, baseline, 0, baseline + dipPx);
    grad.addColorStop(0, "rgba(124,110,255,0.35)");
    grad.addColorStop(1, "rgba(124,110,255,0.05)");
    cctx.lineTo(W - 10, yBot);
    cctx.lineTo(30, yBot);
    cctx.closePath();
    cctx.fillStyle = grad;
    cctx.fill();

    // Line on top
    cctx.beginPath();
    cctx.moveTo(30, baseline);
    cctx.lineTo(midX - tWidth / 2, baseline);
    cctx.lineTo(midX - tWidth / 2 + ingressW, baseline + dipPx);
    cctx.lineTo(midX - tWidth / 2 + ingressW + flatBottom, baseline + dipPx);
    cctx.lineTo(midX + tWidth / 2, baseline);
    cctx.lineTo(W - 10, baseline);
    cctx.strokeStyle = "#7c6eff";
    cctx.lineWidth = 2;
    cctx.stroke();

    // Current phase marker
    const markerX = 30 + (W - 40) * phase;
    cctx.beginPath();
    cctx.arc(markerX, (() => {
      // calculate Y at this X position on the curve
      const rel = markerX - (midX - tWidth / 2);
      if (rel < 0 || markerX > midX + tWidth / 2) return baseline;
      if (rel < ingressW) return baseline + (rel / ingressW) * dipPx;
      if (rel < ingressW + flatBottom) return baseline + dipPx;
      return baseline + dipPx * (1 - (rel - ingressW - flatBottom) / ingressW);
    })(), 4, 0, Math.PI * 2);
    cctx.fillStyle = inTransit ? "#ff6ef7" : "#00ffa3";
    cctx.fill();
    cctx.strokeStyle = "#fff";
    cctx.lineWidth = 1.5;
    cctx.stroke();

    // Labels
    cctx.fillStyle = "#6b7094";
    cctx.font = "10px 'Space Grotesk', sans-serif";
    cctx.textAlign = "center";
    cctx.fillText("Orbital Phase →", W / 2, H - 4);
    cctx.save();
    cctx.translate(12, (yTop + yBot) / 2);
    cctx.rotate(-Math.PI / 2);
    cctx.fillText("Flux", 0, 0);
    cctx.restore();

    // Depth annotation
    if (dipPx > 15) {
      cctx.fillStyle = "#b79fff";
      cctx.font = "bold 10px 'Space Grotesk', sans-serif";
      cctx.textAlign = "left";
      cctx.fillText(`${depth} ppm`, midX + tWidth / 2 + 8, baseline + dipPx / 2 + 3);

      // Arrow
      cctx.beginPath();
      cctx.moveTo(midX + tWidth / 2 + 4, baseline + 2);
      cctx.lineTo(midX + tWidth / 2 + 4, baseline + dipPx - 2);
      cctx.strokeStyle = "#b79fff66";
      cctx.lineWidth = 1;
      cctx.stroke();
    }

    animRef.current = requestAnimationFrame(() => draw(t + 16));
  }, [depth, duration, period, impact, steff, srad, starR, planetR, transitFrac, depthFrac]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(() => draw(0));
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div className="transit-sim">
      <div className="ts-header">
        <div className="ts-dot" />
        <span className="ts-title">LIVE TRANSIT SIMULATION</span>
        <span className="ts-sub">Real-time photometric model</span>
      </div>
      <div className="ts-view">
        <canvas ref={starRef} className="ts-star-canvas" style={{ width: SW, height: SH }} />
        <div className="ts-params">
          <span>Rp/R★ = <em>{rp_ratio.toFixed(4)}</em></span>
          <span>Depth = <em>{depth} ppm</em></span>
          <span>Duration = <em>{duration}h</em></span>
          <span>b = <em>{impact.toFixed(2)}</em></span>
        </div>
      </div>
      <canvas ref={curveRef} className="ts-curve-canvas" style={{ width: W, height: H }} />
    </div>
  );
}
