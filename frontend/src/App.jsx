import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [contractCode, setContractCode] = useState("");
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Modal States
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showJson, setShowJson] = useState(false); // NEW JSON toggle

  // ------------------------------------------------------------
  // TIME AGO FORMATTER
  // ------------------------------------------------------------
  function timeAgo(timestamp) {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return `${Math.floor(diff)} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  // ------------------------------------------------------------
  // LOAD AUDIT HISTORY
  // ------------------------------------------------------------
  async function loadHistory() {
    try {
      const res = await axios.get("http://127.0.0.1:8000/audit_history");

      if (res.data.audits) {
        setHistory(res.data.audits.reverse());
      }
    } catch (err) {
      console.error("History load error:", err);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  // ------------------------------------------------------------
  // ANALYZE CONTRACT (AI)
  // ------------------------------------------------------------
  async function analyzeContract() {
    if (!contractCode.trim()) {
      alert("Please paste a contract first.");
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/analyze", {
        contract_code: contractCode,
      });

      if (response.data.report) {
        setReport(response.data.report);
      } else {
        alert("AI did not return a structured report.");
      }
    } catch (err) {
      console.error(err);
      alert("AI analysis failed.");
    }

    setLoading(false);
  }

  // ------------------------------------------------------------
  // SAVE AUDIT → BLOCKCHAIN + BACKEND MEMORY
  // ------------------------------------------------------------
  async function saveToBlockchain() {
    if (!report) {
      alert("Run an AI analysis first.");
      return;
    }

    setSaving(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/save_audit", {
        contract_name: report.contract_info?.name || "Unknown",
        summary: report.plain_text_summary || "No summary",
        full_report: JSON.stringify(report, null, 2),
        tx_hash: "PENDING"
      });


    if (res.data.error) {
       alert("Blockchain save failed: " + res.data.error);
    } else {
       alert("Saved to blockchain! Tx: " + res.data.tx_hash);
       loadHistory();
    }



    } catch (err) {
      console.error(err);
      alert("Blockchain save failed.");
  } finally {
    setSaving(false);
  }
}

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <span className="logo-mark">⚡</span>
          <span className="logo-text">AI Smart Contract Auditor</span>
        </div>

        <div className="header-right">
          <span className="mode-label">
            {darkMode ? "Dark Mode" : "Light Mode"}
          </span>

          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </header>

      {/* MAIN */}
      <main className="layout">
        
        {/* LEFT PANEL */}
        <section className="panel panel-left">
          <h2 className="panel-title">Smart Contract Code</h2>
          <p className="panel-subtitle">
            Paste your Solidity contract here and let the AI audit it.
          </p>

          <textarea
            value={contractCode}
            onChange={(e) => setContractCode(e.target.value)}
            className="code-input"
            placeholder={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Example {
   // paste your code here...
}`}
          />

          <button
            onClick={analyzeContract}
            disabled={loading}
            className="btn primary-btn"
          >
            {loading ? "Analyzing..." : "Analyze with AI 🤖"}
          </button>
        </section>

        {/* RIGHT PANEL */}
        <section className="panel panel-right">
          <h2 className="panel-title">AI Audit Report</h2>

          {!report && (
            <div className="empty-state">
              <p>No analysis yet.</p>
              <p className="empty-state-sub">
                Paste a contract and click <strong>"Analyze with AI"</strong>.
              </p>
            </div>
          )}

          {report && (
            <div className="analysis-card">
              <h3>Contract Info</h3>
              <p><strong>Name:</strong> {report.contract_info.name}</p>
              <p><strong>Compiler:</strong> {report.contract_info.compiler_version}</p>
              <p><strong>Language:</strong> {report.contract_info.language}</p>

              <h3>Severity</h3>
              <p><strong>Overall:</strong> {report.overall_severity}</p>
              <p><strong>CVSS Score:</strong> {report.cvss_score}</p>

              <h3>Executive Summary</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{report.plain_text_summary}</p>

              <h3>Vulnerabilities</h3>
              {report.vulnerabilities.map((v) => (
                <div key={v.id} className="vuln-item">
                  <strong>{v.id} – {v.title}</strong><br />
                  <strong>Severity:</strong> {v.severity}<br />
                  <strong>Risk:</strong> {v.risk}<br />
                  <strong>Exploit:</strong> {v.exploit_scenario}<br />
                  <strong>Fix:</strong> {v.recommendation}
                </div>
              ))}

              <button
                onClick={saveToBlockchain}
                disabled={saving}
                className="btn success-btn"
              >
                {saving ? "Saving to Blockchain..." : "Save to Blockchain ⛓️"}
              </button>
            </div>
          )}

          {/* AUDIT HISTORY */}
          <div className="audit-history">
            <div className="audit-history-header">
              <h3>Audit History</h3>
            </div>

            {history.length === 0 ? (
              <p className="audit-history-text">No audits saved yet.</p>
            ) : (
              <ul className="audit-list">
                {history.map((item, index) => (
                  <li
                    key={index}
                    className="audit-card"
                    onClick={() => {
                      setSelectedAudit(item);
                      setShowModal(true);
                      setShowJson(false); 
                    }}
                  >
                    <div className="audit-top">
                      <strong className="audit-contract">{item.contract_name}</strong>
                    </div>

                    <p className="audit-summary">
                      {item.summary.slice(0, 120)}...
                    </p>

                    <div className="audit-footer">
                      <span className="audit-time">
                        {timeAgo(item.timestamp)}
                      </span>
                      <span className="audit-tx">
                        Tx: {item.tx_hash ? item.tx_hash.slice(0, 12) + "..." : "N/A"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      {/* ---------------------------------------------------------
           MODAL — FULL AI REPORT + JSON TOGGLE
      ---------------------------------------------------------- */}
      {showModal && selectedAudit && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>

            <h2>{selectedAudit.contract_name}</h2>

            <p><strong>Timestamp:</strong> {new Date(selectedAudit.timestamp * 1000).toLocaleString()}</p>
            <p><strong>Tx Hash:</strong> {selectedAudit.tx_hash}</p>

            <h3 style={{ marginTop: "16px" }}>Full AI Report</h3>

            {/* JSON Toggle Button */}
            <button
              className="btn primary-btn"
              style={{ marginBottom: "12px" }}
              onClick={() => setShowJson(!showJson)}
            >
              {showJson ? "Hide JSON" : "Show Raw JSON"}
            </button>

            {/* READABLE REPORT */}
            {!showJson && (
              <div className="readable-report">
                {(() => {
                  try {
                    const full = JSON.parse(selectedAudit.full_report);

                    return (
                      <>
                        <h4>Executive Summary</h4>
                        <p>{full.plain_text_summary}</p>

                        <h4>Vulnerabilities</h4>
                        {full.vulnerabilities.map((v, i) => (
                          <div key={i} style={{ marginBottom: "12px" }}>
                            <strong>{v.id} – {v.title}</strong><br />
                            <strong>Severity:</strong> {v.severity}<br />
                            <strong>Risk:</strong> {v.risk}<br />
                            <strong>Exploit:</strong> {v.exploit_scenario}<br />
                            <strong>Fix:</strong> {v.recommendation}
                          </div>
                        ))}

                        <h4>Gas Optimizations</h4>
                        <ul>
                          {full.gas_optimizations.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>

                        <h4>Secure Code Example</h4>
                        <pre className="modal-report">{full.secure_code_example}</pre>
                      </>
                    );
                  } catch (e) {
                    return (
                      <p style={{ color: "red" }}>
                        Failed to parse full report. Showing raw summary instead.
                        <br />{selectedAudit.summary}
                      </p>
                    );
                  }
                })()}
              </div>
            )}

            {/* RAW JSON */}
            {showJson && (
              <pre className="modal-report" style={{ maxHeight: "400px", overflow: "auto" }}>
                {JSON.stringify(JSON.parse(selectedAudit.full_report), null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
