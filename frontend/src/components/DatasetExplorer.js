import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./DatasetExplorer.css";

/*
  DatasetExplorer — browse 9,564 real KOI objects, filter, sort,
  and classify any record with the live ML model in one click.
*/

const DISP_COLORS = {
  CONFIRMED: "#00ffa3",
  "FALSE POSITIVE": "#ff5f7e",
  CANDIDATE: "#ffd166",
};

const COLUMNS = [
  { key: "kepoi_name", label: "KOI Name", w: 110 },
  { key: "koi_disposition", label: "Status", w: 120 },
  { key: "koi_period", label: "Period (d)", w: 90, num: true },
  { key: "koi_depth", label: "Depth (ppm)", w: 90, num: true },
  { key: "koi_duration", label: "Dur (hrs)", w: 80, num: true },
  { key: "koi_model_snr", label: "SNR", w: 70, num: true },
  { key: "koi_steff", label: "T★ (K)", w: 80, num: true },
  { key: "koi_prad", label: "Radius (R⊕)", w: 95, num: true },
];

export default function DatasetExplorer({ apiBase }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("koi_period");
  const [dir, setDir] = useState("asc");
  const [disposition, setDisposition] = useState("");
  const [search, setSearch] = useState("");
  const [dispCounts, setDispCounts] = useState({});
  const [classifying, setClassifying] = useState(null); // kepoi_name being classified
  const [classResult, setClassResult] = useState({}); // { kepoi_name: result }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, per_page: 30, sort, dir,
        ...(disposition && { disposition }),
        ...(search && { search }),
      });
      const res = await axios.get(`${apiBase}/api/explore?${params}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setDispCounts(res.data.disposition_counts || {});
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, page, sort, dir, disposition, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (col) => {
    if (sort === col) setDir(d => d === "asc" ? "desc" : "asc");
    else { setSort(col); setDir("asc"); }
    setPage(1);
  };

  const handleFilter = (d) => {
    setDisposition(prev => prev === d ? "" : d);
    setPage(1);
  };

  const classifyRow = async (row) => {
    const name = row.kepoi_name;
    setClassifying(name);
    try {
      const payload = {};
      const features = ["koi_period", "koi_impact", "koi_duration", "koi_depth",
        "koi_model_snr", "koi_steff", "koi_slogg", "koi_srad", "koi_smass", "koi_smet"];
      for (const f of features) {
        if (row[f] === "" || row[f] === undefined || row[f] === null) {
          setClassResult(prev => ({ ...prev, [name]: { error: "Missing data" } }));
          setClassifying(null);
          return;
        }
        payload[f] = parseFloat(row[f]);
      }
      const res = await axios.post(`${apiBase}/api/explore/classify`, payload);
      setClassResult(prev => ({ ...prev, [name]: res.data }));
    } catch {
      setClassResult(prev => ({ ...prev, [name]: { error: "Failed" } }));
    } finally {
      setClassifying(null);
    }
  };

  return (
    <div className="explorer">
      <div className="exp-header">
        <div>
          <h2 className="exp-title">🛰️ Browse Real NASA Star Systems</h2>
          <p className="exp-sub">
            {total.toLocaleString()} real star systems from NASA’s Kepler mission · Click any row for an AI planet check
          </p>
        </div>
        <div className="exp-search">
          <input
            className="exp-search-input"
            placeholder="Search by star name or ID (e.g. K00752, 757450)…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="exp-filters">
        {Object.entries(dispCounts).map(([d, cnt]) => (
          <button
            key={d}
            className={`exp-pill ${disposition === d ? "active" : ""}`}
            style={{ "--pc": DISP_COLORS[d] || "#7c6eff" }}
            onClick={() => handleFilter(d)}
          >
            <span className="pill-dot" style={{ background: DISP_COLORS[d] }} />
            {DISP_LABELS[d] || d} <em>{cnt.toLocaleString()}</em>
          </button>
        ))}
        <span className="exp-total">{total.toLocaleString()} objects</span>
      </div>

      {/* Table */}
      <div className="exp-table-wrap">
        <table className="exp-table">
          <thead>
            <tr>
              {COLUMNS.map(c => (
                <th key={c.key} style={{ width: c.w }}
                  onClick={() => handleSort(c.key)}
                  className={sort === c.key ? "sorted" : ""}
                >
                  {c.label}
                  {sort === c.key && <span className="sort-arrow">{dir === "asc" ? " ↑" : " ↓"}</span>}
                </th>
              ))}
              <th style={{ width: 100 }}>AI Planet Check</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={COLUMNS.length + 1} className="exp-loading">
                <div className="orbit-loader"><div /><div /><div /></div>
                Loading star systems…
              </td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={COLUMNS.length + 1} className="exp-empty">No star systems match your filters</td></tr>
            ) : data.map((row, i) => {
              const name = row.kepoi_name;
              const cr = classResult[name];
              return (
                <tr key={name || i} className="exp-row" onClick={() => classifyRow(row)}>
                  {COLUMNS.map(c => (
                    <td key={c.key}>
                      {c.key === "koi_disposition" ? (
                        <span className="disp-tag" style={{ color: DISP_COLORS[row[c.key]] }}>
                          {DISP_LABELS[row[c.key]] || row[c.key]}
                        </span>
                      ) : c.num && row[c.key] !== "" ? (
                        Number(row[c.key]).toFixed(c.key === "koi_period" ? 2 : c.key === "koi_prad" ? 3 : 1)
                      ) : row[c.key]}
                    </td>
                  ))}
                  <td>
                    {classifying === name ? (
                      <span className="classify-loading">⏳</span>
                    ) : cr ? (
                      cr.error ? (
                        <span className="classify-err">⚠ {cr.error}</span>
                      ) : (
                        <div className="classify-result">
                          <span style={{ color: cr.label === "CONFIRMED" ? "#00ffa3" : "#ff5f7e" }}>
                              {cr.label === "CONFIRMED" ? "✅" : "❌"} {(cr.confidence * 100).toFixed(0)}% sure
                            </span>
                            <span className="classify-radius">{cr.radius?.toFixed(2)} × Earth</span>
                        </div>
                      )
                    ) : (
                      <span className="classify-hint">🔎 Check</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="exp-pager">
          <button disabled={page <= 1} onClick={() => setPage(1)} title="First page">⏮ First</button>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>◄ Prev</button>
          <span className="pager-info">
            Page {page} of {pages.toLocaleString()}
          </span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next ►</button>
          <button disabled={page >= pages} onClick={() => setPage(pages)} title="Last page">Last ⏭</button>
        </div>
      )}
    </div>
  );
}
