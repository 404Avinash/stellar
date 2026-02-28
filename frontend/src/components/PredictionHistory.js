import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './PredictionHistory.css';

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

  if (loading) return <div className="card"><p className="dim">Loading history…</p></div>;
  if (!rows.length) return <div className="card"><p className="dim">No predictions yet. Go make one!</p></div>;

  return (
    <div className="card">
      <div className="hist-header">
        <h2 className="hist-title">📋 Prediction History</h2>
        <span className="hist-count">{rows.length} record{rows.length !== 1 && 's'}</span>
      </div>

      <div className="hist-table-wrap">
        <table className="hist-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Time</th>
              <th>Classification</th>
              <th>Confidence</th>
              <th>Predicted Radius</th>
              <th>Latency</th>
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
                        {r.classification_result?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{(r.classification_confidence * 100).toFixed(1)}%</td>
                    <td>{r.regression_result?.toFixed(3)} R⊕</td>
                    <td className="dim">{r.latency_ms?.toFixed(0)} ms</td>
                    <td>
                      <button className="expand-btn" onClick={() => setExpanded(isOpen ? null : r.id)}>
                        {isOpen ? '▲' : '▼'}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="detail-row">
                      <td colSpan={7}>
                        <div className="detail-grid">
                          {r.input_data && Object.entries(
                            typeof r.input_data === 'string' ? JSON.parse(r.input_data) : r.input_data
                          ).map(([k, v]) => (
                            <div key={k} className="detail-item">
                              <span className="dk">{k}</span>
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
