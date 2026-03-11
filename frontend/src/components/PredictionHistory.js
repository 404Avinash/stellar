import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './PredictionHistory.css';

const FRIENDLY_KEYS = {
  koi_period:    'Orbit Duration (days)',
  koi_impact:    'Transit Path (0–1)',
  koi_duration:  'Transit Length (hrs)',
  koi_depth:     'Light Blocked (ppm)',
  koi_model_snr: 'Detection Clarity',
  koi_steff:     'Star Temperature (K)',
  koi_slogg:     'Star Surface Gravity',
  koi_srad:      'Star Size (vs Sun)',
  koi_smass:     'Star Mass (vs Sun)',
  koi_smet:      'Star Metal Content',
};

function PredictionHistory({ apiBase }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/api/predictions`);
      setRows(Array.isArray(res.data) ? res.data : res.data.predictions || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <div className="card"><p className="dim">Loading your history…</p></div>;
  if (!rows.length) return <div className="card"><p className="dim">🔭 No checks yet! Head to the “Check a Planet” tab and run your first one.</p></div>;

  return (
    <div className="card">
      <div className="hist-header">
        <h2 className="hist-title">📋 My Planet Checks</h2>
        <span className="hist-count">{rows.length} check{rows.length !== 1 && 's'} done</span>
      </div>

      <div className="hist-table-wrap">
        <table className="hist-table">
          <thead>
            <tr>
              <th>#</th>
              <th>When</th>
              <th>Result</th>
              <th>AI Confidence</th>
              <th>Planet Size</th>
              <th>Speed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isOpen = expanded === r.id;
              const isConf = r.classification_result === 'CONFIRMED';
              return (
                <React.Fragment key={r.id}>
                  <tr className={isOpen ? 'row-open' : ''}>
                    <td className="dim">{r.id}</td>
                    <td className="dim">{new Date(r.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${isConf ? 'badge-green' : 'badge-red'}`}>
                        {isConf ? '✅ Real Planet' : '❌ Not a Planet'}
                      </span>
                    </td>
                    <td>{(r.classification_confidence * 100).toFixed(1)}%</td>
                    <td>{r.regression_result?.toFixed(3)} × Earth</td>
                    <td className="dim">{r.latency_ms?.toFixed(0)} ms</td>
                    <td>
                      <button className="expand-btn" title={isOpen ? 'Collapse details' : 'See what you entered'} onClick={() => setExpanded(isOpen ? null : r.id)}>
                        {isOpen ? '▲ Hide' : '▼ Details'}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="detail-row">
                      <td colSpan={7}>
                        <div className="detail-grid">
                          <p style={{ gridColumn: '1/-1', fontSize: '0.75rem', color: '#6b7094', margin: '0 0 6px' }}>What you entered for this check:</p>
                          {r.input_data && Object.entries(
                            typeof r.input_data === 'string' ? JSON.parse(r.input_data) : r.input_data
                          ).map(([k, v]) => (
                            <div key={k} className="detail-item">
                              <span className="dk">{FRIENDLY_KEYS[k] || k}</span>
                              <span className="dv">{typeof v === 'number' ? v.toFixed(4) : v}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PredictionHistory;
