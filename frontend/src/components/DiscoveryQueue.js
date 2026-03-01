import React, { useState, useEffect, useCallback } from 'react';
import './DiscoveryQueue.css';

/* ── Role icon map ──────────────────────────────────────────── */
const ROLE_ICONS = {
  "Radial Velocity Observer": "🔬",
  "Transit Photometrist": "📡",
  "Centroid Analyst": "🎯",
  "Statistical Validator": "🧮",
  "Atmospheric Scientist": "🌐",
  "Stellar Characterization": "⭐",
  "Dynamical Analyst": "🪐",
};

const ROLE_COLORS = {
  "Radial Velocity Observer": "#7c6eff",
  "Transit Photometrist": "#00ffa3",
  "Centroid Analyst": "#ff5f7e",
  "Statistical Validator": "#ffa726",
  "Atmospheric Scientist": "#42d4f4",
  "Stellar Characterization": "#f4e842",
  "Dynamical Analyst": "#e040fb",
};

const PRIORITY_COLORS = {
  HIGH: "#ff5f7e",
  MEDIUM: "#ffa726",
  STANDARD: "#6b7094",
};

const ALL_ROLES = [
  "Radial Velocity Observer",
  "Transit Photometrist",
  "Centroid Analyst",
  "Statistical Validator",
  "Atmospheric Scientist",
  "Stellar Characterization",
  "Dynamical Analyst",
];

export default function DiscoveryQueue({ apiBase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [hzOnly, setHzOnly] = useState(false);
  const [sortBy, setSortBy] = useState('priority_score');
  const [sortDir, setSortDir] = useState('desc');

  const fetchDiscovery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '15',
        sort: sortBy,
        dir: sortDir,
      });
      if (roleFilter) params.set('role', roleFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      if (hzOnly) params.set('hz_only', 'true');
      const res = await fetch(`${apiBase}/api/discovery?${params}`);
      if (!res.ok) throw new Error('Failed to load discovery data');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase, page, roleFilter, priorityFilter, hzOnly, sortBy, sortDir]);

  useEffect(() => { fetchDiscovery(); }, [fetchDiscovery]);

  const toggleExpand = (idx) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  const getSortIcon = (col) => {
    if (sortBy !== col) return '↕';
    return sortDir === 'desc' ? '↓' : '↑';
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setPage(1);
  };

  if (loading && !data) {
    return (
      <div className="dq">
        <div className="dq-loading">
          <div className="dq-spinner" />
          <p>Classifying 1,872 CANDIDATE KOIs &amp; generating mission assignments…</p>
          <p className="dq-sub">Running GradientBoosting inference + role assignment engine</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dq">
        <div className="dq-error">
          <span className="dq-error-icon">⚠</span>
          <p>{error}</p>
          <button onClick={fetchDiscovery} className="dq-retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary } = data;

  return (
    <div className="dq">
      {/* ── Hero Header ─────────────────────────────────────── */}
      <div className="dq-hero">
        <h2 className="dq-title">Mission Assignment Engine</h2>
        <p className="dq-sub">
          AI-classified {data.classified.toLocaleString()} unresolved CANDIDATE KOIs →
          generated role-based follow-up assignments for 7 scientific teams
        </p>
      </div>

      {/* ── Summary KPI strip ───────────────────────────────── */}
      <div className="dq-kpi-strip">
        <div className="dq-kpi">
          <span className="dq-kpi-value">{data.classified.toLocaleString()}</span>
          <span className="dq-kpi-label">KOIs Classified</span>
        </div>
        <div className="dq-kpi">
          <span className="dq-kpi-value dq-kpi-green">{summary.confirmed_predictions.toLocaleString()}</span>
          <span className="dq-kpi-label">Predicted Confirmed</span>
        </div>
        <div className="dq-kpi">
          <span className="dq-kpi-value dq-kpi-red">{summary.false_positive_predictions.toLocaleString()}</span>
          <span className="dq-kpi-label">Predicted FP</span>
        </div>
        <div className="dq-kpi">
          <span className="dq-kpi-value dq-kpi-blue">{summary.habitable_zone}</span>
          <span className="dq-kpi-label">Habitable Zone</span>
        </div>
        <div className="dq-kpi">
          <span className="dq-kpi-value dq-kpi-purple">{summary.avg_priority_score}</span>
          <span className="dq-kpi-label">Avg Priority Score</span>
        </div>
      </div>

      {/* ── Role Breakdown Cards ────────────────────────────── */}
      <div className="dq-role-overview">
        <h3 className="dq-section-title">Team Workload Distribution</h3>
        <div className="dq-role-cards">
          {summary.role_breakdown.map((rb) => (
            <button
              key={rb.role}
              className={`dq-role-card ${roleFilter === rb.role ? 'active' : ''}`}
              onClick={() => {
                setRoleFilter(roleFilter === rb.role ? '' : rb.role);
                setPage(1);
              }}
              style={{ '--role-color': ROLE_COLORS[rb.role] || '#7c6eff' }}
            >
              <span className="dq-rc-icon">{ROLE_ICONS[rb.role] || '🔧'}</span>
              <span className="dq-rc-name">{rb.role}</span>
              <span className="dq-rc-count">{rb.count.toLocaleString()}</span>
              <span className="dq-rc-pct">{rb.percentage}% of candidates</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters Bar ─────────────────────────────────────── */}
      <div className="dq-filters">
        <div className="dq-filter-group">
          <label>Priority</label>
          <div className="dq-filter-pills">
            {['', 'HIGH', 'MEDIUM', 'STANDARD'].map((p) => (
              <button
                key={p}
                className={`dq-pill ${priorityFilter === p ? 'active' : ''}`}
                onClick={() => { setPriorityFilter(p); setPage(1); }}
                style={p ? { '--pill-color': PRIORITY_COLORS[p] } : {}}
              >
                {p || 'All'}
              </button>
            ))}
          </div>
        </div>
        <div className="dq-filter-group">
          <label>
            <input
              type="checkbox"
              checked={hzOnly}
              onChange={(e) => { setHzOnly(e.target.checked); setPage(1); }}
            />
            {' '}Habitable Zone Only
          </label>
        </div>
        <div className="dq-filter-meta">
          Showing {data.total_filtered.toLocaleString()} candidates
          {roleFilter && <span className="dq-active-filter"> • {roleFilter}</span>}
          {priorityFilter && <span className="dq-active-filter"> • {priorityFilter} priority</span>}
          {hzOnly && <span className="dq-active-filter"> • HZ only</span>}
        </div>
      </div>

      {/* ── Sort Controls ───────────────────────────────────── */}
      <div className="dq-sort-bar">
        {[
          { key: 'priority_score', label: 'Priority Score' },
          { key: 'conf_prob', label: 'Confidence' },
          { key: 'radius', label: 'Radius' },
          { key: 'num_roles', label: '# Tasks' },
          { key: 'period', label: 'Period' },
        ].map((s) => (
          <button
            key={s.key}
            className={`dq-sort-btn ${sortBy === s.key ? 'active' : ''}`}
            onClick={() => handleSort(s.key)}
          >
            {s.label} <span className="dq-sort-icon">{getSortIcon(s.key)}</span>
          </button>
        ))}
      </div>

      {/* ── Candidate Cards ─────────────────────────────────── */}
      <div className="dq-candidates">
        {data.data.map((c, i) => (
          <div
            key={c.index}
            className={`dq-card ${expandedIdx === c.index ? 'expanded' : ''} ${c.in_habitable_zone ? 'hz' : ''}`}
          >
            {/* Card Header */}
            <div className="dq-card-header" onClick={() => toggleExpand(c.index)}>
              <div className="dq-card-rank">
                <span className="dq-rank-num">#{(page - 1) * 15 + i + 1}</span>
                <div className="dq-score-ring" style={{ '--score': c.priority_score }}>
                  <span>{c.priority_score}</span>
                </div>
              </div>
              <div className="dq-card-info">
                <div className="dq-card-topline">
                  <span className={`dq-pred-badge ${c.prediction === 'CONFIRMED' ? 'confirmed' : 'fp'}`}>
                    {c.prediction === 'CONFIRMED' ? '✓' : '✗'} {c.prediction}
                  </span>
                  <span className="dq-conf">{(c.confirmation_probability * 100).toFixed(1)}%</span>
                  {c.in_habitable_zone && <span className="dq-hz-badge">🌍 HZ</span>}
                  <span className="dq-planet-class">{c.planet_class}</span>
                </div>
                <div className="dq-card-stats">
                  <span>P = {c.koi_period < 100 ? c.koi_period.toFixed(2) : c.koi_period.toFixed(0)}d</span>
                  <span>R = {c.predicted_radius.toFixed(2)} R⊕</span>
                  <span>SNR = {c.koi_model_snr.toFixed(1)}</span>
                  <span>T★ = {c.koi_steff.toFixed(0)} K</span>
                  {c.koi_count > 1 && <span className="dq-multi">×{c.koi_count} planets</span>}
                </div>
              </div>
              <div className="dq-card-roles-mini">
                {c.role_assignments.map((a, j) => (
                  <span
                    key={j}
                    className="dq-role-dot"
                    title={`${a.role} (${a.priority})`}
                    style={{ background: ROLE_COLORS[a.role] || '#7c6eff' }}
                  />
                ))}
                <span className="dq-roles-count">{c.num_roles} tasks</span>
              </div>
              <span className="dq-expand-arrow">{expandedIdx === c.index ? '▲' : '▼'}</span>
            </div>

            {/* Expanded: Role Assignments */}
            {expandedIdx === c.index && (
              <div className="dq-card-body">
                <h4 className="dq-assign-title">Mission Assignments</h4>
                <div className="dq-assignments">
                  {c.role_assignments.map((a, j) => (
                    <div
                      key={j}
                      className="dq-assignment"
                      style={{ '--role-accent': ROLE_COLORS[a.role] || '#7c6eff' }}
                    >
                      <div className="dq-assign-header">
                        <span className="dq-assign-icon">{ROLE_ICONS[a.role] || '🔧'}</span>
                        <div className="dq-assign-meta">
                          <span className="dq-assign-role">{a.role}</span>
                          <span className={`dq-assign-priority p-${a.priority.toLowerCase()}`}>{a.priority}</span>
                        </div>
                        <span className="dq-assign-instrument">{a.instrument}</span>
                      </div>
                      <div className="dq-assign-task">
                        <strong>Task:</strong> {a.task}
                      </div>
                      <div className="dq-assign-reason">
                        <strong>Scientific Justification:</strong> {a.reason}
                      </div>
                      <div className="dq-assign-footer">
                        <span className="dq-assign-deliverable">
                          <strong>Deliverable:</strong> {a.deliverable}
                        </span>
                        <span className="dq-assign-timeline">⏱ {a.timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Candidate Detail Table */}
                <div className="dq-detail-table">
                  <h4 className="dq-assign-title">Candidate Parameters</h4>
                  <div className="dq-params-grid">
                    {[
                      { label: 'Period', value: `${c.koi_period.toFixed(4)} days`, key: 'period' },
                      { label: 'Transit Depth', value: `${c.koi_depth.toFixed(1)} ppm`, key: 'depth' },
                      { label: 'Duration', value: `${c.koi_duration.toFixed(3)} hrs`, key: 'dur' },
                      { label: 'SNR', value: c.koi_model_snr.toFixed(2), key: 'snr' },
                      { label: 'Stellar Teff', value: `${c.koi_steff.toFixed(0)} K`, key: 'teff' },
                      { label: 'Stellar Radius', value: `${c.koi_srad.toFixed(3)} R☉`, key: 'srad' },
                      { label: 'Stellar Mass', value: `${c.koi_smass.toFixed(3)} M☉`, key: 'smass' },
                      { label: 'Catalog Radius', value: c.koi_prad ? `${c.koi_prad.toFixed(3)} R⊕` : '—', key: 'prad' },
                      { label: 'Insolation', value: c.koi_insol ? `${c.koi_insol.toFixed(2)} S⊕` : '—', key: 'insol' },
                      { label: 'Planets in System', value: c.koi_count, key: 'count' },
                    ].map((p) => (
                      <div key={p.key} className="dq-param">
                        <span className="dq-param-label">{p.label}</span>
                        <span className="dq-param-value">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Pagination ──────────────────────────────────────── */}
      <div className="dq-pagination">
        <button
          disabled={page <= 1}
          onClick={() => setPage(p => p - 1)}
          className="dq-page-btn"
        >← Prev</button>
        <span className="dq-page-info">
          Page {data.page} of {data.pages}
        </span>
        <button
          disabled={page >= data.pages}
          onClick={() => setPage(p => p + 1)}
          className="dq-page-btn"
        >Next →</button>
      </div>
    </div>
  );
}
