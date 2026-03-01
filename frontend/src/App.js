import React, { useState } from 'react';
import axios from 'axios';
import PredictionForm from './components/PredictionForm';
import PredictionResults from './components/PredictionResults';
import PredictionHistory from './components/PredictionHistory';
import Statistics from './components/Statistics';
import DatasetExplorer from './components/DatasetExplorer';
import DiscoveryQueue from './components/DiscoveryQueue';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('predict');

  const handlePredict = async (formData) => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      // Convert every field to a number before sending
      const payload = {};
      for (const [k, v] of Object.entries(formData)) {
        payload[k] = parseFloat(v);
      }
      const res = await axios.post(`${API}/api/predict`, payload);
      setPrediction({ ...res.data, input: payload, timestamp: new Date().toISOString() });
    } catch (err) {
      const msg = err.response?.data?.error || 'Prediction failed — is the backend running?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <h1 className="logo">
            <span className="logo-icon">✦</span> Stellar Verification Program
          </h1>
          <p className="tagline">Exoplanet Classification &amp; Radius Prediction</p>
          <div className="header-badges">
            <span className="hbadge hbadge-purple">GradientBoosting AI</span>
            <span className="hbadge hbadge-green">6,128+ Confirmed in Archive</span>
            <span className="hbadge hbadge-blue">Kepler Q1-Q17 · 9,564 KOIs</span>
            <span className="hbadge hbadge-pink">ROC-AUC 97.6%</span>
            <span className="hbadge hbadge-yellow">∼40% FP Rate → Solved</span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        {['predict', 'discover', 'explore', 'history', 'statistics'].map((t) => (
          <button
            key={t}
            className={`nav-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'predict' && '🔭 '}
            {t === 'discover' && '🚀 '}
            {t === 'explore' && '🛰️ '}
            {t === 'history' && '📋 '}
            {t === 'statistics' && '📊 '}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      {/* Main */}
      <main className="main">
        {tab === 'predict' && (
          <>
            <PredictionForm onSubmit={handlePredict} loading={loading} />
            {error && <div className="error-banner">{error}</div>}
            {prediction && <PredictionResults data={prediction} />}
          </>
        )}
        {tab === 'discover' && <DiscoveryQueue apiBase={API} />}
        {tab === 'explore' && <DatasetExplorer apiBase={API} />}
        {tab === 'history' && <PredictionHistory apiBase={API} />}
        {tab === 'statistics' && <Statistics apiBase={API} />}
      </main>

      <footer className="footer">
        Stellar Verification Program &copy; 2026 — Powered by NASA KOI Data
      </footer>
    </div>
  );
}

export default App;
