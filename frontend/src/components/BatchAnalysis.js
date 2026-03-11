import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import './BatchAnalysis.css';

const INPUT_FEATURES = [
  'koi_period','koi_impact','koi_duration','koi_depth','koi_model_snr',
  'koi_steff','koi_slogg','koi_srad','koi_smass','koi_smet',
];

const SAMPLE_DATA = [
  {koi_period:2.2046, koi_impact:0.146, koi_duration:2.706, koi_depth:1490, koi_model_snr:151.7, koi_steff:5455, koi_slogg:4.467, koi_srad:0.927, koi_smass:0.877, koi_smet:-0.183},
  {koi_period:54.318, koi_impact:0.256, koi_duration:6.246, koi_depth:7380, koi_model_snr:83.7,  koi_steff:5765, koi_slogg:4.375, koi_srad:1.057, koi_smass:0.986, koi_smet:0.017},
  {koi_period:0.937,  koi_impact:0.943, koi_duration:1.191, koi_depth:3630, koi_model_snr:23.3,  koi_steff:5300, koi_slogg:4.450, koi_srad:0.870, koi_smass:0.800, koi_smet:-0.300},
  {koi_period:14.651, koi_impact:0.025, koi_duration:4.492, koi_depth:1108, koi_model_snr:67.6,  koi_steff:5880, koi_slogg:4.362, koi_srad:1.064, koi_smass:1.023, koi_smet:0.108},
  {koi_period:7.052,  koi_impact:0.617, koi_duration:3.073, koi_depth:925,  koi_model_snr:42.5,  koi_steff:5200, koi_slogg:4.500, koi_srad:0.820, koi_smass:0.750, koi_smet:-0.100},
  {koi_period:1.462,  koi_impact:1.120, koi_duration:0.890, koi_depth:410,  koi_model_snr:9.2,   koi_steff:6120, koi_slogg:4.210, koi_srad:1.340, koi_smass:1.180, koi_smet:0.250},
  {koi_period:3.217,  koi_impact:0.920, koi_duration:1.540, koi_depth:230,  koi_model_snr:7.8,   koi_steff:5890, koi_slogg:4.380, koi_srad:1.080, koi_smass:1.010, koi_smet:0.050},
  {koi_period:22.411, koi_impact:0.102, koi_duration:4.810, koi_depth:2840, koi_model_snr:96.3,  koi_steff:5690, koi_slogg:4.420, koi_srad:0.980, koi_smass:0.950, koi_smet:0.020},
  {koi_period:9.863,  koi_impact:0.330, koi_duration:3.540, koi_depth:1620, koi_model_snr:55.1,  koi_steff:5510, koi_slogg:4.440, koi_srad:0.910, koi_smass:0.870, koi_smet:-0.050},
  {koi_period:41.086, koi_impact:0.680, koi_duration:5.920, koi_depth:510,  koi_model_snr:18.4,  koi_steff:5940, koi_slogg:4.350, koi_srad:1.100, koi_smass:1.050, koi_smet:0.110},
  {koi_period:5.311,  koi_impact:0.038, koi_duration:2.934, koi_depth:1820, koi_model_snr:77.4,  koi_steff:5620, koi_slogg:4.410, koi_srad:0.950, koi_smass:0.910, koi_smet:-0.020},
  {koi_period:118.38, koi_impact:0.140, koi_duration:9.811, koi_depth:3960, koi_model_snr:44.2,  koi_steff:5782, koi_slogg:4.430, koi_srad:1.000, koi_smass:1.000, koi_smet:0.000},
  {koi_period:0.643,  koi_impact:1.080, koi_duration:0.530, koi_depth:180,  koi_model_snr:6.1,   koi_steff:5340, koi_slogg:4.520, koi_srad:0.840, koi_smass:0.780, koi_smet:-0.180},
  {koi_period:33.600, koi_impact:0.510, koi_duration:7.120, koi_depth:6700, koi_model_snr:71.0,  koi_steff:5100, koi_slogg:4.480, koi_srad:0.860, koi_smass:0.820, koi_smet:-0.120},
  {koi_period:4.888,  koi_impact:0.270, koi_duration:2.180, koi_depth:740,  koi_model_snr:35.6,  koi_steff:6050, koi_slogg:4.310, koi_srad:1.200, koi_smass:1.120, koi_smet:0.090},
];

const C = {
  green:'#00ffa3', red:'#ff5f7e', purple:'#7c6eff',
  pink:'#ff6ef7',  yellow:'#ffd166', blue:'#38bdf8', orange:'#fb923c',
};
const RADIUS_COLORS = [C.blue, C.green, C.yellow, C.orange, C.red, C.pink];
const PIE_COLORS    = [C.green, C.red];

const RUNNER_STEPS = [
  { label: 'Loading & validating your data',   desc: 'Checking 10 features per object for completeness',   duration: 350 },
  { label: 'Engineering physics features',     desc: 'Computing 12 derived measurements from raw inputs',   duration: 500 },
  { label: 'Running the AI stacking ensemble', desc: 'XGBoost + Random Forest + Extra Trees → meta-learner', duration: 880 },
  { label: 'Predicting planet sizes',          desc: 'Estimating planetary radius (× Earth) per object',      duration: 420 },
  { label: 'Calculating confidence bounds',    desc: 'Quantile regression for uncertainty (±) per object',   duration: 330 },
  { label: 'Building your summary',            desc: 'Aggregating stats, charts & per-object table',        duration: 240 },
];
const RUNNER_TOTAL = RUNNER_STEPS.reduce((s, r) => s + r.duration, 0);

function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return { error: 'CSV must have a header row + at least 1 data row.' };
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const missing = INPUT_FEATURES.filter(f => !headers.includes(f));
  if (missing.length) return { error: `Missing columns: ${missing.join(', ')}` };
  const rows = [];
  for (let i = 1; i < Math.min(lines.length, 101); i++) {
    if (!lines[i].trim()) continue;
    const vals = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((h, idx) => {
      if (INPUT_FEATURES.includes(h)) row[h] = parseFloat(vals[idx]);
    });
    rows.push(row);
  }
  if (!rows.length) return { error: 'No data rows found in CSV.' };
  return { rows };
}

function exportCSV(results) {
  const hdrs = ['#', 'classification', 'confidence_%', 'predicted_radius_Re',
    'radius_uncertainty', 'planet_class', ...INPUT_FEATURES];
  const body = results.map(r => [
    r.row + 1, r.label, (r.confidence * 100).toFixed(2),
    r.predicted_radius, r.radius_uncertainty, r.planet_class,
    ...INPUT_FEATURES.map(f => r.input[f]),
  ]);
  const csv = [hdrs, ...body].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'batch_predictions.csv'; a.click();
  URL.revokeObjectURL(url);
}

function exportSampleCSV() {
  const csv = [INPUT_FEATURES.join(','),
    ...SAMPLE_DATA.map(r => INPUT_FEATURES.map(f => r[f]).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'sample_koi_template.csv'; a.click();
  URL.revokeObjectURL(url);
}

const DarkTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ba-tip">
      <p className="ba-tip-lbl">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || C.purple }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function BatchAnalysis({ apiBase }) {
  const [rows,       setRows]       = useState(null);
  const [parseErr,   setParseErr]   = useState('');
  const [runner,     setRunner]     = useState(null); // null | { step: 0..N }
  const [result,     setResult]     = useState(null);
  const [apiError,   setApiError]   = useState('');
  const [dragging,   setDragging]   = useState(false);
  const [sortCol,    setSortCol]    = useState('row');
  const [sortDir,    setSortDir]    = useState('asc');
  const fileRef = useRef();
  const runnerCancelRef = useRef(false);

  const applyFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const parsed = parseCSV(e.target.result);
      if (parsed.error) { setParseErr(parsed.error); setRows(null); }
      else { setParseErr(''); setRows(parsed.rows); setResult(null); setApiError(''); }
    };
    reader.readAsText(file);
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    applyFile(e.dataTransfer.files[0]);
  }, [applyFile]);

  const loadSample = () => {
    setRows(SAMPLE_DATA.slice(0, 15));
    setParseErr(''); setResult(null); setApiError('');
  };

  const runAnalysis = async () => {
    if (!rows?.length) return;
    setApiError(''); setResult(null);
    runnerCancelRef.current = false;
    setRunner({ step: 0 });

    const delay = ms => new Promise(r => setTimeout(r, ms));

    // Fire the real API call immediately — runs in parallel with animation
    const apiPromise = axios.post(`${apiBase}/api/batch-predict`, { rows });

    // Step animation — plays concurrently with the API call
    const animPromise = (async () => {
      for (let i = 0; i < RUNNER_STEPS.length; i++) {
        if (runnerCancelRef.current) return;
        setRunner({ step: i });
        await delay(RUNNER_STEPS[i].duration);
      }
      if (!runnerCancelRef.current) setRunner({ step: RUNNER_STEPS.length });
    })();

    try {
      // Wait for BOTH the animation AND the API to finish
      const [, res] = await Promise.all([animPromise, apiPromise]);
      await delay(500); // hold “all done” state briefly so user can see it
      setResult(res.data);
      setRunner(null);
    } catch (err) {
      runnerCancelRef.current = true;
      setRunner(null);
      setApiError(err.response?.data?.error || 'Batch analysis failed — is the backend running?');
    }
  };

  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const sortedResults = result?.results ? [...result.results].sort((a, b) => {
    const av = a[sortCol] ?? 0, bv = b[sortCol] ?? 0;
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === 'asc' ? av - bv : bv - av;
  }) : [];

  const classData = result ? [
    { name: 'Confirmed',      value: result.confirmed },
    { name: 'False Positive', value: result.false_positives },
  ].filter(d => d.value > 0) : [];

  const THD = ({ col, label }) => (
    <th className={`ba-th ${sortCol === col ? 'ba-th-sorted' : ''}`} onClick={() => handleSort(col)}>
      {label}{sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
    </th>
  );

  return (
    <div className="ba-root">

      {/* ── SECTION HEADER ── */}
      <div className="ba-section-head">
        <div className="ba-sh-left">
          <span className="ba-sh-icon">⚡</span>
          <div>
            <h3 className="ba-sh-title">Batch Analysis Engine</h3>
            <p className="ba-sh-sub">
              Classify up to 100 KOI objects simultaneously &mdash; upload a CSV or load sample objects
            </p>
          </div>
        </div>
        <button className="ba-ghost-btn" onClick={exportSampleCSV}>↓ Download CSV Template</button>
      </div>

      {/* ── DROP ZONE ── */}
      <div
        className={`ba-dropzone${dragging ? ' ba-dropzone-over' : ''}${rows ? ' ba-dropzone-ready' : ''}`}
        onDragEnter={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !rows && fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".csv" hidden onChange={e => applyFile(e.target.files[0])} />
        {rows ? (
          <div className="ba-ready-row">
            <span className="ba-ready-check">✓</span>
            <div>
              <p className="ba-ready-count">{rows.length} object{rows.length !== 1 ? 's' : ''} ready</p>
              <p className="ba-ready-sub">10 features per object · {rows.length <= 100 ? 'within limit' : 'will cap at 100'}</p>
            </div>
            <button className="ba-ghost-btn ba-clear-btn"
              onClick={e => { e.stopPropagation(); setRows(null); setResult(null); setApiError(''); }}>
              ✕ Clear
            </button>
          </div>
        ) : (
          <div className="ba-drop-prompt">
            <span className="ba-drop-emoji">{dragging ? '📂' : '📄'}</span>
            <p className="ba-drop-main">{dragging ? 'Drop it!' : 'Drag & drop a CSV file here'}</p>
            <p className="ba-drop-hint">or <span className="ba-link">click to browse</span> · max 100 rows</p>
          </div>
        )}
      </div>

      {parseErr && <div className="ba-error-strip">{parseErr}</div>}

      {/* ── ACTION BAR ── */}
      <div className="ba-action-bar">
        <button className="ba-ghost-btn" onClick={loadSample}>🧪 Load 15 Sample Objects</button>
        <button
          className={`ba-primary-btn${(!rows || runner !== null) ? ' ba-btn-disabled' : ''}`}
          onClick={runAnalysis}
          disabled={!rows || runner !== null}
        >
          {runner !== null
            ? <><span className="ba-spinner" /> Running…</>
            : `⚡ Analyze ${rows?.length ?? 0} Object${rows?.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* ── RUNNER PANEL ── */}
      {runner !== null && (
        <div className="ba-runner">
          <div className="ba-runner-hd">
            <span className="ba-runner-emoji">🔬</span>
            <div>
              <p className="ba-runner-title">
                {runner.step >= RUNNER_STEPS.length
                  ? '🎉 Analysis complete — loading your results…'
                  : `Analysing ${rows?.length} object${rows?.length !== 1 ? 's' : ''}…`}
              </p>
              <p className="ba-runner-sub">
                {runner.step < RUNNER_STEPS.length
                  ? `Step ${runner.step + 1} of ${RUNNER_STEPS.length} · ${RUNNER_STEPS[runner.step]?.label}`
                  : 'All steps complete'}
              </p>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="ba-runner-pb-wrap">
            <div
              className="ba-runner-pb-fill"
              style={{
                width: `${
                  runner.step >= RUNNER_STEPS.length
                    ? 100
                    : Math.round(
                        RUNNER_STEPS.slice(0, runner.step).reduce((s, r) => s + r.duration, 0)
                        / RUNNER_TOTAL * 100
                      )
                }%`,
              }}
            />
          </div>

          {/* Step list */}
          <div className="ba-runner-steps">
            {RUNNER_STEPS.map((s, i) => {
              const done   = runner.step > i;
              const active = runner.step === i;
              return (
                <div
                  key={i}
                  className={`ba-rs ${done ? 'ba-rs-done' : active ? 'ba-rs-active' : 'ba-rs-pending'}`}
                >
                  <span className="ba-rs-icon">
                    {done
                      ? '✓'
                      : active
                      ? <span className="ba-runner-spin" />
                      : '○'}
                  </span>
                  <div className="ba-rs-body">
                    <span className="ba-rs-label">{s.label}</span>
                    {(done || active) && <span className="ba-rs-desc">{s.desc}</span>}
                  </div>
                  <span className="ba-rs-status">
                    {done ? 'Done' : active ? 'Running…' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {apiError && <div className="ba-error-strip">{apiError}</div>}

      {/* ── RESULTS ── */}
      {result && (
        <div className="ba-results-block">

          {/* KPI strip */}
          <div className="ba-kpi-strip">
            {[
              { label: 'Total Analyzed',   val: result.total,                             color: C.purple, fmt: v => v },
              { label: 'Confirmed',        val: result.confirmed,                         color: C.green,  fmt: v => v },
              { label: 'False Positives',  val: result.false_positives,                   color: C.red,    fmt: v => v },
              { label: 'Confirm Rate',     val: result.confirm_rate * 100,                color: C.yellow, fmt: v => v.toFixed(1) + '%' },
              { label: 'Avg Confidence',   val: result.avg_confidence * 100,              color: C.blue,   fmt: v => v.toFixed(1) + '%' },
              { label: 'Avg Planet Radius',val: result.avg_radius,                        color: C.pink,   fmt: v => v.toFixed(2) + ' R⊕' },
            ].map(k => (
              <div className="ba-kpi card" key={k.label} style={{ '--kc': k.color }}>
                <p className="ba-kpi-lbl">{k.label}</p>
                <p className="ba-kpi-val" style={{ color: k.color }}>{k.fmt(k.val)}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="ba-charts-row">

            {/* Donut */}
            <div className="card ba-chart-box">
              <p className="ba-chart-ttl">Classification Split</p>
              <div className="ba-donut-wrap">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={classData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" innerRadius={58} outerRadius={88}
                      paddingAngle={4} strokeWidth={0}
                      label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent*100).toFixed(0)}%`}
                      labelLine={{ stroke: '#6b7094', strokeWidth: 1 }}
                    >
                      {classData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]}
                          style={{ filter: `drop-shadow(0 0 8px ${PIE_COLORS[i]}88)` }} />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ba-donut-center">
                  <span style={{ color: C.green, fontSize: '1.25rem', fontWeight: 800 }}>
                    {(result.confirm_rate * 100).toFixed(0)}%
                  </span>
                  <span style={{ color: '#6b7094', fontSize: '.68rem' }}>confirmed</span>
                </div>
              </div>
            </div>

            {/* Radius histogram */}
            <div className="card ba-chart-box">
              <p className="ba-chart-ttl">Radius Distribution</p>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={result.radius_buckets}
                  margin={{ top: 8, right: 8, left: -10, bottom: 28 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2340" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7094', fontSize: 10 }}
                    angle={-18} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: '#6b7094', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<DarkTip />} />
                  <Bar dataKey="count" name="Objects" radius={[5,5,0,0]}>
                    {result.radius_buckets.map((_, i) => (
                      <Cell key={i} fill={RADIUS_COLORS[i % RADIUS_COLORS.length]}
                        style={{ filter: `drop-shadow(0 0 5px ${RADIUS_COLORS[i%RADIUS_COLORS.length]}88)` }} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Confidence distribution */}
            <div className="card ba-chart-box">
              <p className="ba-chart-ttl">Confidence Distribution</p>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={result.confidence_buckets}
                  margin={{ top: 8, right: 8, left: -10, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2340" vertical={false} />
                  <XAxis dataKey="range" tick={{ fill: '#6b7094', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7094', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<DarkTip />} />
                  <Bar dataKey="count" name="Objects" radius={[5,5,0,0]}>
                    {result.confidence_buckets.map((_, i) => {
                      const clrs = [C.red, C.orange, C.yellow, C.blue, C.green];
                      return <Cell key={i} fill={clrs[i % clrs.length]}
                        style={{ filter: `drop-shadow(0 0 5px ${clrs[i%clrs.length]}55)` }} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insight callout */}
          <div className="ba-insight card">
            <span className="ba-insight-icon">💡</span>
            <p>
              Out of <strong>{result.total}</strong> objects analyzed,{' '}
              <strong style={{ color: C.green }}>{result.confirmed}</strong> ({(result.confirm_rate*100).toFixed(0)}%)
              {' '}are predicted genuine exoplanet candidates and{' '}
              <strong style={{ color: C.red }}>{result.false_positives}</strong> are likely false positives.
              The stacking ensemble assigned uncertainty bounds via quantile regression —
              check the ± column for cases needing follow-up.
              {result.row_errors?.length > 0 &&
                ` ⚠ ${result.row_errors.length} row${result.row_errors.length > 1 ? 's' : ''} skipped due to missing/invalid data.`}
            </p>
          </div>

          {/* Results table */}
          <div className="card ba-table-card">
            <div className="ba-table-topbar">
              <p className="ba-chart-ttl" style={{ marginBottom: 0 }}>
                Per-Object Results &mdash; {result.total} objects
              </p>
              <button className="ba-ghost-btn ba-sm-btn" onClick={() => exportCSV(result.results)}>
                ↓ Export CSV
              </button>
            </div>
            <div className="ba-table-scroll">
              <table className="ba-table">
                <thead>
                  <tr>
                    <THD col="row"              label="#" />
                    <THD col="label"            label="Classification" />
                    <THD col="confidence"       label="Confidence" />
                    <THD col="predicted_radius" label="Radius (R⊕)" />
                    <THD col="radius_uncertainty" label="± CI" />
                    <THD col="planet_class"     label="Class" />
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map(r => (
                    <tr key={r.row}
                      className={`ba-row ba-row-${r.label === 'CONFIRMED' ? 'conf' : 'fp'}`}>
                      <td className="ba-td ba-mono">{r.row + 1}</td>
                      <td className="ba-td">
                        <span className={`ba-badge ba-badge-${r.label === 'CONFIRMED' ? 'conf' : 'fp'}`}>
                          {r.label}
                        </span>
                      </td>
                      <td className="ba-td ba-mono">
                        <span style={{
                          color: r.confidence > 0.85 ? C.green
                               : r.confidence > 0.70 ? C.yellow : C.red,
                        }}>
                          {(r.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="ba-td ba-mono">{r.predicted_radius.toFixed(3)}</td>
                      <td className="ba-td ba-mono" style={{ color: '#5c6080' }}>
                        ±{r.radius_uncertainty.toFixed(3)}
                      </td>
                      <td className="ba-td">
                        <span className="ba-class-pill">{r.planet_class}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
