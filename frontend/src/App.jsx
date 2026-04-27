import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── helpers ────────────────────────────────────────────────────────────────────
const api = (path, opts) => fetch(API + path, opts).then(r => r.json());

function ScoreRing({ value, label, color, size = 100 }) {
  const r = 38, circ = 2 * Math.PI * r;
  const dash = circ * value;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1a2540" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x="50" y="46" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700"
          fontFamily="'Space Mono', monospace">{Math.round(value * 100)}</text>
        <text x="50" y="60" textAnchor="middle" fill="#8899bb" fontSize="9"
          fontFamily="'DM Sans', sans-serif">/ 100</text>
      </svg>
      <div style={{ fontSize: 11, color: "#8899bb", marginTop: 4, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function Bar({ label, value, color, max = 1 }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "#8899bb", fontFamily: "'DM Sans',sans-serif", letterSpacing:"0.05em" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#fff", fontFamily: "'Space Mono',monospace" }}>{Math.round(value * 100)}</span>
      </div>
      <div style={{ height: 6, background: "#1a2540", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

function TypeBadge({ type, color, onClick, selected }) {
  return (
    <button onClick={() => onClick(type)} style={{
      padding: "8px 14px", borderRadius: 8, cursor: "pointer",
      background: selected ? color + "33" : "#111827",
      border: `1.5px solid ${selected ? color : "#1e2d4a"}`,
      color: selected ? "#fff" : "#8899bb",
      fontSize: 13, fontFamily: "'Space Mono',monospace",
      transition: "all 0.2s", fontWeight: selected ? 700 : 400,
    }}>{type}</button>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
      <div style={{
        width: 40, height: 40, border: "3px solid #1e2d4a",
        borderTop: "3px solid #6C63FF", borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: ANALYSE
// ══════════════════════════════════════════════════════════════════════════════
function AnalysePage({ types }) {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState("INFJ");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyse = async () => {
    if (!text.trim()) return setError("Please enter some text to analyse.");
    setError(""); setLoading(true); setResult(null);
    try {
      const data = await api("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mbti_type: selected }),
      });
      setResult(data);
    } catch { setError("Could not reach the API. Make sure the backend is running."); }
    setLoading(false);
  };

  const profile = types.find(t => t.type === selected);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Space Mono',monospace", color: "#fff", fontSize: 22, marginBottom: 8 }}>Neural Engagement Analyser</h2>
        <p style={{ color: "#8899bb", fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}>Enter text to predict how your brain will neurologically engage with it, based on your MBTI personality type.</p>
      </div>

      {/* MBTI Type selector */}
      <div style={{ background: "#0d1321", border: "1px solid #1e2d4a", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#8899bb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>Select your MBTI type</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {types.map(t => <TypeBadge key={t.type} type={t.type} color={t.color} onClick={setSelected} selected={selected === t.type} />)}
        </div>
        {profile && (
          <div style={{ marginTop: 16, padding: "14px 16px", background: profile.color + "15", borderRadius: 10, border: `1px solid ${profile.color}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: profile.color, flexShrink: 0 }} />
              <span style={{ color: "#fff", fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700 }}>{profile.type} — {profile.name}</span>
            </div>
            <p style={{ color: "#8899bb", fontSize: 12, fontFamily: "'DM Sans',sans-serif", marginTop: 6, marginBottom: 8 }}>{profile.description}</p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div><span style={{ fontSize: 10, color: "#8899bb", letterSpacing:"0.08em", textTransform:"uppercase" }}>Dominant Network</span><br /><span style={{ color: profile.color, fontSize: 13, fontFamily: "'Space Mono',monospace" }}>{profile.dominant_network}</span></div>
              <div><span style={{ fontSize: 10, color: "#8899bb", letterSpacing:"0.08em", textTransform:"uppercase" }}>Stress ROI</span><br /><span style={{ color: "#FF6B6B", fontSize: 13, fontFamily: "'Space Mono',monospace" }}>{profile.stress_roi}</span></div>
              <div><span style={{ fontSize: 10, color: "#8899bb", letterSpacing:"0.08em", textTransform:"uppercase" }}>Cog. Functions</span><br /><span style={{ color: "#fff", fontSize: 13, fontFamily: "'Space Mono',monospace" }}>{profile.cognitive_functions.join(" · ")}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Text input */}
      <div style={{ background: "#0d1321", border: "1px solid #1e2d4a", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#8899bb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>Input text</div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Enter a journaling prompt, therapeutic statement, learning objective, or any text you want to analyse..."
          style={{
            width: "100%", minHeight: 120, background: "#0a0f1e", border: "1px solid #1e2d4a",
            borderRadius: 10, color: "#fff", fontSize: 14, padding: 16,
            fontFamily: "'DM Sans',sans-serif", resize: "vertical", outline: "none",
            lineHeight: 1.6, boxSizing: "border-box",
          }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <span style={{ fontSize: 11, color: "#4a5a7a", fontFamily: "'DM Sans',sans-serif" }}>{text.split(/\s+/).filter(Boolean).length} words</span>
          <button onClick={analyse} disabled={loading || !text.trim()} style={{
            padding: "10px 28px", background: loading ? "#1e2d4a" : "linear-gradient(135deg, #6C63FF, #2D9CDB)",
            border: "none", borderRadius: 10, color: "#fff", fontSize: 14,
            fontFamily: "'Space Mono',monospace", cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700, transition: "opacity 0.2s", opacity: loading ? 0.6 : 1,
          }}>
            {loading ? "Analysing..." : "Analyse →"}
          </button>
        </div>
        {error && <div style={{ marginTop: 10, color: "#FF6B6B", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>{error}</div>}
      </div>

      {/* Results */}
      {loading && <Spinner />}
      {result && (
        <div style={{ background: "#0d1321", border: `1px solid ${result.color}44`, borderRadius: 14, padding: "24px", animation: "fadeIn 0.4s ease" }}>
          <div style={{ fontSize: 11, color: "#8899bb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>Neural engagement report — {result.mbti_type}</div>
          
          {/* Score rings */}
          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
            <ScoreRing value={result.scores.engagement} label="Engagement" color={result.color} />
            <ScoreRing value={result.scores.stress} label="Stress Signal" color="#FF6B6B" />
            <ScoreRing value={result.scores.recovery} label="Recovery Index" color="#27AE60" />
          </div>

          {/* Insight box */}
          <div style={{ background: result.color + "15", border: `1px solid ${result.color}33`, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: result.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>Neural Insight</div>
            <p style={{ color: "#ccd6f6", fontSize: 14, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6, margin: 0 }}>{result.insight}</p>
          </div>

          {/* Network details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#0a0f1e", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: "#8899bb", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Dominant Network</div>
              <div style={{ color: result.color, fontFamily: "'Space Mono',monospace", fontSize: 13 }}>{result.dominant_network}</div>
              <div style={{ color: "#4a5a7a", fontSize: 11, marginTop: 2 }}>({result.dominant_short})</div>
            </div>
            <div style={{ background: "#0a0f1e", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: "#8899bb", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Stress ROI</div>
              <div style={{ color: "#FF6B6B", fontFamily: "'Space Mono',monospace", fontSize: 13 }}>{result.stress_roi}</div>
              <div style={{ color: "#4a5a7a", fontSize: 11, marginTop: 2 }}>({result.stress_short})</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: COMPARE
// ══════════════════════════════════════════════════════════════════════════════
function ComparePage() {
  const [text, setText] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("engagement");

  const compare = async () => {
    if (!text.trim()) return;
    setLoading(true); setResults(null);
    try {
      const data = await api("/api/compare", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      setResults(data);
    } catch {}
    setLoading(false);
  };

  const sorted = results ? [...results.results].sort((a, b) => b[sortBy] - a[sortBy]) : [];
  const maxVal = sorted.length ? Math.max(...sorted.map(r => r[sortBy])) : 1;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Space Mono',monospace", color: "#fff", fontSize: 22, marginBottom: 8 }}>Cross-Type Comparison</h2>
        <p style={{ color: "#8899bb", fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}>See how the same text scores neurologically across all 16 MBTI types simultaneously.</p>
      </div>

      <div style={{ background: "#0d1321", border: "1px solid #1e2d4a", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Enter any text to compare across all 16 types..."
          style={{
            width: "100%", minHeight: 100, background: "#0a0f1e",
            border: "1px solid #1e2d4a", borderRadius: 10, color: "#fff",
            fontSize: 14, padding: 16, fontFamily: "'DM Sans',sans-serif",
            resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box",
          }} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button onClick={compare} disabled={loading || !text.trim()} style={{
            padding: "10px 28px", background: loading ? "#1e2d4a" : "linear-gradient(135deg, #F5A623, #FF6B6B)",
            border: "none", borderRadius: 10, color: "#fff", fontSize: 14,
            fontFamily: "'Space Mono',monospace", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700,
          }}>{loading ? "Comparing..." : "Compare All →"}</button>
        </div>
      </div>

      {loading && <Spinner />}
      {results && (
        <div style={{ background: "#0d1321", border: "1px solid #1e2d4a", borderRadius: 14, padding: "24px", animation: "fadeIn 0.4s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 11, color: "#8899bb", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>All 16 types — sorted by</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["engagement","stress","recovery"].map(k => (
                <button key={k} onClick={() => setSortBy(k)} style={{
                  padding: "5px 14px", borderRadius: 6, border: `1px solid ${sortBy===k?"#6C63FF":"#1e2d4a"}`,
                  background: sortBy===k?"#6C63FF22":"transparent", color: sortBy===k?"#fff":"#8899bb",
                  fontSize: 11, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em",
                }}>{k}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sorted.map((r, i) => (
              <div key={r.mbti_type} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 18, fontSize: 11, color: "#4a5a7a", fontFamily: "'Space Mono',monospace", textAlign: "right" }}>{i+1}</span>
                <span style={{ width: 44, fontSize: 12, color: "#fff", fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{r.mbti_type}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 22, background: "#0a0f1e", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                    <div style={{
                      height: "100%", width: `${(r[sortBy] / maxVal) * 100}%`,
                      background: r.color, borderRadius: 4,
                      transition: "width 0.6s ease", opacity: 0.85,
                    }} />
                  </div>
                </div>
                <span style={{ width: 36, fontSize: 12, color: "#fff", fontFamily: "'Space Mono',monospace", textAlign: "right" }}>{Math.round(r[sortBy]*100)}</span>
                <span style={{ width: 80, fontSize: 10, color: "#8899bb", fontFamily: "'DM Sans',sans-serif" }}>{r.dominant_short}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: PROFILES
// ══════════════════════════════════════════════════════════════════════════════
function ProfilesPage({ types }) {
  const [search, setSearch] = useState("");
  const filtered = types.filter(t =>
    t.type.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.dominant_short.toLowerCase().includes(search.toLowerCase())
  );

  const networks = [...new Set(types.map(t => t.dominant_short))];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Space Mono',monospace", color: "#fff", fontSize: 22, marginBottom: 8 }}>MBTI Neural Profiles</h2>
        <p style={{ color: "#8899bb", fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}>All 16 personality types mapped to their dominant functional brain networks and stress regions of interest.</p>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search type, name, or network..."
        style={{
          width: "100%", background: "#0d1321", border: "1px solid #1e2d4a",
          borderRadius: 10, color: "#fff", fontSize: 14, padding: "12px 16px",
          fontFamily: "'DM Sans',sans-serif", outline: "none", marginBottom: 20, boxSizing: "border-box",
        }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtered.map(t => (
          <div key={t.type} style={{
            background: "#0d1321", border: `1px solid ${t.color}33`,
            borderRadius: 14, padding: "20px", position: "relative", overflow: "hidden",
            transition: "border-color 0.2s",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: t.color }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", color: "#fff", fontSize: 20, fontWeight: 700 }}>{t.type}</div>
                <div style={{ color: t.color, fontSize: 12, marginTop: 2, fontFamily: "'DM Sans',sans-serif" }}>{t.name}</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {t.cognitive_functions.map(f => (
                  <span key={f} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: t.color+"22", color: t.color, fontFamily: "'Space Mono',monospace" }}>{f}</span>
                ))}
              </div>
            </div>
            <p style={{ color: "#8899bb", fontSize: 12, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5, marginBottom: 14 }}>{t.description}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, background: "#0a0f1e", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, color: "#8899bb", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Network</div>
                <div style={{ color: t.color, fontSize: 11, fontFamily: "'Space Mono',monospace" }}>{t.dominant_short}</div>
              </div>
              <div style={{ flex: 1, background: "#0a0f1e", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, color: "#8899bb", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Stress ROI</div>
                <div style={{ color: "#FF6B6B", fontSize: 11, fontFamily: "'Space Mono',monospace" }}>{t.stress_short}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: ABOUT
// ══════════════════════════════════════════════════════════════════════════════
function AboutPage() {
  const cards = [
    { title: "Meta TRIBE v2", icon: "🧠", desc: "Released March 26, 2026 by Meta FAIR. Trained on 700+ subjects and 1,115 hours of fMRI recordings. Predicts neural activity at 70,000 voxel resolution from text, audio, and video.", color: "#6C63FF" },
    { title: "MBTI Framework", icon: "🧩", desc: "The Myers-Briggs Type Indicator categorises personalities into 16 types based on four cognitive dichotomies. Each type is associated with dominant cognitive functions and functional brain networks.", color: "#2D9CDB" },
    { title: "Brain Networks", icon: "⚡", desc: "The scoring engine maps MBTI types to five functional networks: Default Mode (DMN), Language (LAN), Motion (MOT), Auditory (AUD), and Visual (VIS) — each with a corresponding stress ROI.", color: "#F5A623" },
    { title: "Scoring Engine", icon: "📊", desc: "For each input text, the engine computes engagement (dominant network activation), stress signal (stress ROI activation), and a recovery index derived from both scores.", color: "#27AE60" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Space Mono',monospace", color: "#fff", fontSize: 22, marginBottom: 8 }}>About This Project</h2>
        <p style={{ color: "#8899bb", fontSize: 14, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7 }}>
          MBTI-Guided Neural Engagement Analyser is a personality-aware content scoring system built for the Minor Project requirement of B.Tech CSE at MITS Gwalior. It combines Meta FAIR's TRIBE v2 brain encoding model with MBTI-based cognitive profiling to predict how a given piece of text will neurologically engage different personality types.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.title} style={{ background: "#0d1321", border: `1px solid ${c.color}33`, borderRadius: 14, padding: "22px" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
            <div style={{ color: c.color, fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{c.title}</div>
            <p style={{ color: "#8899bb", fontSize: 13, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#0d1321", border: "1px solid #1e2d4a", borderRadius: 14, padding: "24px" }}>
        <div style={{ fontSize: 11, color: "#8899bb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>Project Details</div>
        {[
          ["Student", "Shreyansh Singh — 0901CS231130"],
          ["Guide", "Dr. Gagandeep Kaur, Asst. Professor, CSE"],
          ["Institute", "Madhav Institute of Technology & Science, Gwalior"],
          ["Session", "January – June 2026"],
          ["Stack", "React · FastAPI · Python 3.11 · Meta TRIBE v2"],
          ["Licence", "Academic use — MITS Minor Project"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 16, paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #1e2d4a" }}>
            <span style={{ width: 80, fontSize: 11, color: "#4a5a7a", fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, paddingTop: 1 }}>{k}</span>
            <span style={{ fontSize: 14, color: "#ccd6f6", fontFamily: "'DM Sans',sans-serif" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("analyse");
  const [types, setTypes] = useState([]);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    api("/api/mbti-types")
      .then(d => { setTypes(d.types); setApiStatus("online"); })
      .catch(() => setApiStatus("offline"));
  }, []);

  const nav = [
    { id: "analyse",  label: "Analyse" },
    { id: "compare",  label: "Compare" },
    { id: "profiles", label: "Profiles" },
    { id: "about",    label: "About" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #070d1a; color: #fff; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        textarea:focus, input:focus { border-color: #6C63FF !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #1e2d4a; border-radius: 3px; }
        button:hover { filter: brightness(1.1); }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#070d1a" }}>
        {/* Header */}
        <header style={{
          background: "#0a0f1e", borderBottom: "1px solid #1e2d4a",
          padding: "0 24px", position: "sticky", top: 0, zIndex: 100,
          backdropFilter: "blur(10px)",
        }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #6C63FF, #2D9CDB)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>🧠</div>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#fff", fontWeight: 700 }}>MBTI Neural</div>
                <div style={{ fontSize: 10, color: "#4a5a7a", fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.08em" }}>TRIBE v2 · MITS 2026</div>
              </div>
            </div>

            <nav style={{ display: "flex", gap: 4 }}>
              {nav.map(n => (
                <button key={n.id} onClick={() => setPage(n.id)} style={{
                  padding: "6px 16px", borderRadius: 8, border: "none",
                  background: page === n.id ? "#6C63FF22" : "transparent",
                  color: page === n.id ? "#fff" : "#8899bb",
                  fontSize: 13, fontFamily: "'DM Sans',sans-serif",
                  cursor: "pointer", transition: "all 0.2s",
                  borderBottom: page === n.id ? "2px solid #6C63FF" : "2px solid transparent",
                }}>{n.label}</button>
              ))}
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: apiStatus === "online" ? "#27AE60" : apiStatus === "offline" ? "#FF6B6B" : "#F5A623" }} />
              <span style={{ fontSize: 11, color: "#4a5a7a", fontFamily: "'DM Sans',sans-serif" }}>API {apiStatus}</span>
            </div>
          </div>
        </header>

        {/* API offline banner */}
        {apiStatus === "offline" && (
          <div style={{ background: "#FF6B6B22", border: "1px solid #FF6B6B44", padding: "10px 24px", textAlign: "center" }}>
            <span style={{ fontSize: 13, color: "#FF6B6B", fontFamily: "'DM Sans',sans-serif" }}>
              ⚠️ Backend offline — run <code style={{ background: "#0a0f1e", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>uvicorn main:app --reload</code> in the backend folder to start the API.
            </span>
          </div>
        )}

        {/* Main content */}
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px" }}>
          {page === "analyse"  && <AnalysePage types={types} />}
          {page === "compare"  && <ComparePage />}
          {page === "profiles" && <ProfilesPage types={types} />}
          {page === "about"    && <AboutPage />}
        </main>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid #1e2d4a", padding: "20px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#4a5a7a", fontFamily: "'DM Sans',sans-serif" }}>
            Shreyansh Singh · 0901CS231130 · MITS Gwalior · Minor Project 2026 · Guided by Dr. Gagandeep Kaur
          </p>
        </footer>
      </div>
    </>
  );
}
