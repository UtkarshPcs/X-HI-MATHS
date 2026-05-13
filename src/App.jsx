import { useState, useEffect, useRef, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── DATA ────────────────────────────────────────────────────────────────────
const RAW_DATA = [
  { roll: 1, name: "Aditya 1", test1: 8, test2: 6 },
  { roll: 2, name: "Shreya", test1: 7, test2: 4 },
  { roll: 3, name: "Shourya", test1: "Ab", test2: "Ab" },
  { roll: 4, name: "Mihika", test1: "Ab", test2: 4 },
  { roll: 5, name: "Anuraj", test1: 10, test2: 9 },
  { roll: 6, name: "Parth", test1: 10, test2: 9 },
  { roll: 7, name: "Ravi", test1: 5, test2: 6 },
  { roll: 8, name: "Ruchir", test1: 5, test2: 5 },
  { roll: 9, name: "Sonali", test1: 7, test2: 7 },
  { roll: 10, name: "Yesh", test1: 6, test2: 6 },
  { roll: 11, name: "Isha", test1: 4, test2: 8 },
  { roll: 12, name: "Ayush", test1: 7, test2: 6 },
  { roll: 13, name: "Aman Kishor", test1: "Ab", test2: 10 },
  { roll: 14, name: "Kirti", test1: 8, test2: 0 },
  { roll: 15, name: "Suryanahu", test1: 4, test2: "Ab" },
  { roll: 16, name: "Mohit", test1: 4, test2: "Na" },
  { roll: 17, name: "Virat Singh", test1: 6, test2: "Ab" },
  { roll: 18, name: "Rudransh", test1: 10, test2: 7 },
  { roll: 19, name: "Sushant", test1: 7, test2: 6 },
  { roll: 20, name: "Arnav", test1: 0, test2: 0 },
  { roll: 21, name: "Deepanshu", test1: 2, test2: 0 },
  { roll: 22, name: "Anushka 22", test1: 2, test2: 0 },
  { roll: 23, name: "Utkarsh", test1: 8, test2: 10 },
  { roll: 24, name: "Vibhav", test1: 0, test2: 1 },
  { roll: 25, name: "Aadarsh", test1: 7, test2: "Ab" },
  { roll: 26, name: "Sahil", test1: 2, test2: "Ab" },
  { roll: 27, name: "Ayush Kumar", test1: 6, test2: 3 },
  { roll: 28, name: "Awni", test1: 6, test2: 2 },
  { roll: 29, name: "Aditya Praksh 29", test1: 7, test2: 5 },
  { roll: 30, name: "Abhigyan", test1: 1, test2: 0 },
  { roll: 31, name: "Anushka 31", test1: 5, test2: 9 },
  { roll: 32, name: "Shivam", test1: 6, test2: 2 },
  { roll: 33, name: "Chirag", test1: 6, test2: 10 },
  { roll: 34, name: "Khushi", test1: 6, test2: "Ab" },
  { roll: 35, name: "Pratyaksh", test1: 4, test2: 6 },
  { roll: 36, name: "Rahul", test1: 7, test2: 10 },
  { roll: 37, name: "Manshi", test1: 8, test2: 8 },
  { roll: 38, name: "Shivansh", test1: "Ab", test2: 6 },
  { roll: 39, name: "Abhishek", test1: 2, test2: "Ab" },
  { roll: 40, name: "Utkarsh B.", test1: 7, test2: 8 },
];

function processData(raw) {
  return raw.map(s => {
    // "Ab" = absent (counts as 0 in avg), "Na" = data not available (excluded)
    const parse = v => (v === "Ab" || v === "Na") ? null : v;
    const label = v => v === "Na" ? "N/A" : "Absent";
    const t1 = parse(s.test1);
    const t2 = parse(s.test2);
    const t1Label = t1 === null ? label(s.test1) : null;
    const t2Label = t2 === null ? label(s.test2) : null;

    // Effective scores: "Ab" → 0 (counted), "Na" → null (excluded)
    const t1Eff = s.test1 === "Ab" ? 0 : t1;
    const t2Eff = s.test2 === "Ab" ? 0 : t2;
    const effScores = [t1Eff, t2Eff].filter(v => v !== null);

    const avg = effScores.length ? effScores.reduce((a, b) => a + b, 0) / effScores.length : null;
    const total = effScores.length ? effScores.reduce((a, b) => a + b, 0) : null;
    const absentBoth = t1 === null && t2 === null;
    const improvement = t1Eff !== null && t2Eff !== null ? t2Eff - t1Eff : null;
    return { ...s, t1, t2, t1Label, t2Label, avg, total, absentBoth, improvement };
  });
}

const STUDENTS = processData(RAW_DATA);
const t1Scores = STUDENTS.filter(s => s.t1 !== null).map(s => s.t1);
const t2Scores = STUDENTS.filter(s => s.t2 !== null).map(s => s.t2);
const t1Avg = (t1Scores.reduce((a, b) => a + b, 0) / t1Scores.length).toFixed(2);
const t2Avg = (t2Scores.reduce((a, b) => a + b, 0) / t2Scores.length).toFixed(2);
const t2Present = t2Scores.length;
const t2Absent = STUDENTS.length - t2Present;
const absentBothList = STUDENTS.filter(s => s.absentBoth);
const highestScorer = [...STUDENTS].filter(s => s.avg !== null).sort((a, b) => b.avg - a.avg)[0];
const attendanceRatio = ((t2Present / STUDENTS.length) * 100).toFixed(1);

// ─── COLOURS ─────────────────────────────────────────────────────────────────
const C = {
  primary: "#2563eb",
  secondary: "#4f46e5",
  success: "#10b981",
  danger: "#e11d48",
  warning: "#d97706",
  info: "#0ea5e9",
};
const GRADE_COLORS = [C.primary, C.secondary, C.info, C.danger, C.warning];
const SECTIONS = ["Overview", "Charts", "Insights", "Students", "Highlights"];

// Rolls that should always show their FULL name (not just first word) in charts
const FULL_NAME_ROLLS = new Set([40]);
function displayName(s) {
  return FULL_NAME_ROLLS.has(s.roll) ? s.name : s.name.split(" ")[0];
}

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

// ─── EXPORT HELPERS ──────────────────────────────────────────────────────────
function downloadCSV() {
  const header = "Roll,Name,Test1,Test2,Total,Average,Status";
  const rows = STUDENTS.map(s =>
    [
      s.roll,
      `"${s.name}"`,
      s.t1 !== null ? s.t1 : (s.t1Label || "Absent"),
      s.t2 !== null ? s.t2 : (s.t2Label || "Absent"),
      s.total ?? "-",
      s.avg != null ? s.avg.toFixed(2) : "-",
      s.absentBoth ? "Absent Both" : s.t2 === null ? "Absent T2" : "Present",
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "maths_test_results.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadPDF() {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text("Maths Weekly Test Dashboard", 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}  |  Total Students: ${STUDENTS.length}  |  Test 1 Avg: ${t1Avg}  |  Test 2 Avg: ${t2Avg}  |  Attendance: ${attendanceRatio}%`, 14, 26);

  autoTable(doc, {
    startY: 32,
    head: [["Roll", "Name", "Test 1", "Test 2", "Total", "Average", "Status", "Evaluation"]],
    body: STUDENTS.map(s => {
      const badge = getBadgeLabel(s);
      return [
        s.roll,
        s.name,
        s.t1 !== null ? s.t1 : (s.t1Label || "Absent"),
        s.t2 !== null ? s.t2 : (s.t2Label || "Absent"),
        s.total ?? "—",
        s.avg != null ? s.avg.toFixed(2) : "—",
        s.absentBoth ? "Absent Both" : s.t2 === null ? "Absent T2" : "Present",
        badge,
      ];
    }),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 32 } },
  });

  doc.save("maths_test_results.pdf");
}

function getBadgeLabel(s) {
  if (s.absentBoth) return "Absent Both";
  if (s.avg === null) return "Partial Absent";
  if (s.avg >= 9) return "Topper";
  if (s.avg >= 7) return "Good";
  if (s.avg >= 5) return "Average";
  if (s.avg >= 3) return "Below Avg";
  return "Needs Help";
}

function getBadge(s) {
  const label = getBadgeLabel(s);
  const colorMap = {
    "Absent Both": C.danger,
    "Partial Absent": C.warning,
    "Topper": C.success,
    "Good": C.info,
    "Average": C.primary,
    "Below Avg": C.warning,
    "Needs Help": C.danger,
  };
  return { label, color: colorMap[label] };
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1200 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(current);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count}</span>;
}

function Card({ children, className = "", style = {}, darkMode }) {
  return (
    <div
      className={`rounded-xl p-6 ${className}`}
      style={{
        background: darkMode ? "#1e293b" : "#ffffff",
        border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
        boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, color, isFloat, darkMode }) {
  const textColor = darkMode ? "#f8fafc" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const mutedLabel = darkMode ? "#94a3b8" : "#64748b";
  return (
    <Card
      darkMode={darkMode}
      className="flex flex-col gap-1 cursor-default hover:-translate-y-1"
    >
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: mutedLabel }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: color || textColor, lineHeight: 1.2 }}>
        {isFloat ? value : <AnimatedCounter target={Number(value)} />}
      </div>
      {sub && <div style={{ fontSize: 13, marginTop: 2, color: muted }}>{sub}</div>}
    </Card>
  );
}

function SectionHeader({ title, subtitle, textColor, mutedText }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", color: textColor, letterSpacing: "-0.5px" }}>{title}</h2>
      <p style={{ color: mutedText, fontSize: 15, margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function InsightCard({ title, value, color, darkMode }) {
  return (
    <div style={{
      background: darkMode ? "#1e293b" : "#ffffff",
      borderTop: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
      borderRight: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
      borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
      borderLeft: `5px solid ${color}`,
      borderRadius: 12,
      padding: 20,
      boxShadow: darkMode ? "0 2px 12px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: darkMode ? "#94a3b8" : "#64748b", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: darkMode ? "#f8fafc" : "#0f172a" }}>{value}</div>
    </div>
  );
}

// FIX: mutedText passed as prop instead of relying on outer scope
function StudentRow({ s, color, rank, showAvg, extra, mutedText, darkMode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${darkMode ? "#334155" : "#f1f5f9"}`, fontSize: 14 }}>
      {rank && (
        <span style={{ background: `${color}20`, color, width: 24, height: 24, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
          {rank}
        </span>
      )}
      <span style={{ flex: 1, fontWeight: 600, color: darkMode ? "#f8fafc" : "#0f172a" }}>{s.name}</span>
      {showAvg && s.avg !== null && (
        <span style={{ color: mutedText, fontSize: 13 }}>
          Avg: <span style={{ color, fontWeight: 700 }}>{s.avg.toFixed(1)}</span>
        </span>
      )}
      {extra && <span style={{ color, fontSize: 13, fontWeight: 600 }}>{extra}</span>}
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("roll");
  const [sortDir, setSortDir] = useState("asc");
  const [activeSection, setActiveSection] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [distFilter, setDistFilter] = useState("both"); // "t1" | "t2" | "both"
  const [fullFilter, setFullFilter] = useState("both"); // "t1" | "t2" | "both"
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth < 900;

  const bg = darkMode ? "#0f172a" : "#f8fafc";
  const textColor = darkMode ? "#f8fafc" : "#0f172a";
  const mutedText = darkMode ? "#94a3b8" : "#64748b";

  const filtered = useMemo(() => {
    let arr = STUDENTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    arr = [...arr].sort((a, b) => {
      let va = a[sortKey] ?? -999;
      let vb = b[sortKey] ?? -999;
      if (typeof va === "string") va = va.charCodeAt(0);
      if (typeof vb === "string") vb = vb.charCodeAt(0);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return arr;
  }, [search, sortKey, sortDir]);

  const t1t2Compare = STUDENTS
    .filter(s => s.t1 !== null && s.t2 !== null)
    .map(s => ({ name: displayName(s), "Test 1": s.t1, "Test 2": s.t2 }));

  // allScores always = both tests (used in insights stats)
  const allScores = [
    ...STUDENTS.filter(s => s.t1 !== null).map(s => s.t1),
    ...STUDENTS.filter(s => s.t2 !== null).map(s => s.t2),
  ];

  // Score distribution — reactive to distFilter (chart only)
  const distScores = useMemo(() => {
    const t1 = STUDENTS.filter(s => s.t1 !== null).map(s => s.t1);
    const t2 = STUDENTS.filter(s => s.t2 !== null).map(s => s.t2);
    if (distFilter === "t1") return t1;
    if (distFilter === "t2") return t2;
    return [...t1, ...t2];
  }, [distFilter]);
  const distributionData = [
    { range: "0–2", count: distScores.filter(v => v <= 2).length },
    { range: "3–5", count: distScores.filter(v => v >= 3 && v <= 5).length },
    { range: "6–7", count: distScores.filter(v => v >= 6 && v <= 7).length },
    { range: "8–9", count: distScores.filter(v => v >= 8 && v <= 9).length },
    { range: "10", count: distScores.filter(v => v === 10).length },
  ];

  const top10 = [...STUDENTS].filter(s => s.avg !== null).sort((a, b) => b.avg - a.avg).slice(0, 10);
  const top5 = top10.slice(0, 5);
  const mostImproved = [...STUDENTS].filter(s => s.improvement !== null && s.t1 !== null).sort((a, b) => b.improvement - a.improvement).slice(0, 5);
  const needAttention = [...STUDENTS].filter(s => s.avg !== null && s.avg < 4).sort((a, b) => a.avg - b.avg);
  const fullMarkers = STUDENTS.filter(s => s.t1 === 10 || s.t2 === 10);

  const pieData = [
    { name: "Present", value: t2Present },
    { name: "Absent", value: t2Absent },
  ];

  const axisProps = { stroke: mutedText, fontSize: 12 };
  const tooltipStyle = {
    contentStyle: {
      background: darkMode ? "#1e293b" : "#ffffff",
      border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
      borderRadius: 8,
      color: textColor,
    },
  };

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
    setSidebarOpen(false);
  }

  const btnBase = {
    border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
    padding: "6px 16px", borderRadius: 20, transition: "all 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textColor, fontFamily: "'Inter', system-ui, sans-serif", transition: "background 0.3s", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: darkMode ? "rgba(15,23,42,0.88)" : "rgba(255,255,255,0.88)",
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
        padding: "0 16px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 8, minWidth: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: "0 1 auto" }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ background: "none", border: "none", color: textColor, fontSize: 20, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}>
            ☰
          </button>
          <span style={{ fontWeight: 800, fontSize: isMobile ? 14 : 17, letterSpacing: "-0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {isMobile ? "Maths Analytics" : "Maths Analytics"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!isMobile && SECTIONS.map(s => (
            <button key={s} onClick={() => scrollTo(s)} style={{
              ...btnBase,
              background: activeSection === s ? (darkMode ? "#1e293b" : "#f1f5f9") : "none",
              color: activeSection === s ? C.primary : mutedText,
            }}>{s}</button>
          ))}
          <button onClick={() => setDarkMode(d => !d)} style={{
            ...btnBase,
            background: darkMode ? "#1e293b" : "#f1f5f9",
            border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
            color: textColor,
          }}>
            {darkMode ? "☀ Light" : "☾ Dark"}
          </button>
        </div>
      </nav>

      {/* SIDEBAR BACKDROP + PANEL */}
      {sidebarOpen && (
        <>
          {/* Backdrop — tap to close on mobile */}
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 199,
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(2px)",
            }}
          />
          <div style={{
            position: "fixed", top: 64, left: 0, bottom: 0,
            width: isMobile ? "75vw" : 220,
            maxWidth: 280, zIndex: 200,
            background: darkMode ? "#1e293b" : "#ffffff",
            borderRight: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
            padding: 20, boxShadow: "4px 0 24px rgba(0,0,0,0.2)",
            overflowY: "auto",
          }}>
            {SECTIONS.map(s => (
              <button key={s} onClick={() => scrollTo(s)} style={{
                display: "block", width: "100%", textAlign: "left",
                background: activeSection === s ? (darkMode ? "#0f172a" : "#f1f5f9") : "transparent",
                border: "none",
                color: activeSection === s ? C.primary : mutedText,
                padding: "12px 14px", fontSize: 15, fontWeight: 600,
                cursor: "pointer", borderRadius: 8, marginBottom: 6,
              }}>{s}</button>
            ))}
          </div>
        </>
      )}

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 12px 60px" : "0 20px 80px" }}>

        {/* HERO / OVERVIEW */}
        <div id="Overview" style={{ textAlign: "center", padding: isMobile ? "40px 0 32px" : "80px 0 60px" }}>
          <div style={{ display: "inline-block", padding: "5px 16px", borderRadius: 20, marginBottom: 20, fontSize: 13, fontWeight: 600, color: C.info, background: `${C.info}18`, border: `1px solid ${C.info}40` }}>
            Performance Report
          </div>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 46px)", fontWeight: 800, letterSpacing: "-1px", margin: "0 0 14px", color: textColor, lineHeight: 1.2 }}>
            Maths Weekly Test Dashboard
          </h1>
          <p style={{ color: mutedText, fontSize: isMobile ? 15 : 17, maxWidth: 560, margin: "0 auto 28px", lineHeight: 1.6 }}>
            Comprehensive analytics for Weekly Test 1 &amp; Test 2 — tracking 40 students.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={downloadPDF} style={{
              background: C.primary, border: "none", color: "#fff",
              padding: "12px 28px", borderRadius: 8, fontWeight: 700,
              cursor: "pointer", fontSize: 15,
              boxShadow: `0 4px 14px ${C.primary}50`,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 20px ${C.primary}60`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 4px 14px ${C.primary}50`; }}
            >
              ⬇ Export PDF
            </button>
            <button onClick={downloadCSV} style={{
              background: darkMode ? "#334155" : "#e2e8f0", border: "none",
              color: textColor, padding: "12px 28px", borderRadius: 8,
              fontWeight: 700, cursor: "pointer", fontSize: 15, transition: "transform 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}
            >
              ⬇ Download CSV
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(min(${isMobile ? "140px" : "200px"}, 100%), 1fr))`, gap: isMobile ? 12 : 18, marginBottom: isMobile ? 40 : 60 }}>
          <StatCard darkMode={darkMode} label="Total Students" value={40} color={C.primary} />
          <StatCard darkMode={darkMode} label="Present (Test 2)" value={t2Present} color={C.success} />
          <StatCard darkMode={darkMode} label="Absent (Test 2)" value={t2Absent} color={C.danger} />
          <StatCard darkMode={darkMode} label="Test 1 Average" value={t1Avg} color={C.info} isFloat />
          <StatCard darkMode={darkMode} label="Test 2 Average" value={t2Avg} color={C.secondary} isFloat />
          <StatCard darkMode={darkMode} label="Top Scorer" value={displayName(highestScorer)} color={C.success} isFloat />
          <StatCard darkMode={darkMode} label="Absent Both Tests" value={absentBothList.length} color={C.danger} />
          <StatCard darkMode={darkMode} label="Attendance Rate" value={`${attendanceRatio}%`} color={C.primary} isFloat />
        </div>

        {/* CHARTS */}
        <div id="Charts" style={{ marginBottom: 60 }}>
          <SectionHeader title="Analytics Charts" subtitle="Visual breakdown of class performance" textColor={textColor} mutedText={mutedText} />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(380px, 100%), 1fr))`, gap: isMobile ? 14 : 22, marginBottom: isMobile ? 14 : 22 }}>
            <Card darkMode={darkMode}>
              <h3 style={{ color: textColor, marginBottom: 18, fontWeight: 700, fontSize: 15 }}>Average: Test 1 vs Test 2</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[{ name: "Test 1", avg: parseFloat(t1Avg) }, { name: "Test 2", avg: parseFloat(t2Avg) }]} margin={{ top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis domain={[0, 10]} {...axisProps} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: darkMode ? "#334155" : "#f1f5f9" }} />
                  <Bar dataKey="avg" fill={C.primary} radius={[6, 6, 0, 0]} maxBarSize={80} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card darkMode={darkMode}>
              <h3 style={{ color: textColor, marginBottom: 18, fontWeight: 700, fontSize: 15 }}>Test 2 Attendance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`} labelLine={false} style={{ fontSize: 12 }}>
                    {pieData.map((_, i) => <Cell key={i} fill={i === 0 ? C.success : C.danger} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(380px, 100%), 1fr))`, gap: isMobile ? 14 : 22, marginBottom: isMobile ? 14 : 22 }}>
            <Card darkMode={darkMode}>
              <h3 style={{ color: textColor, marginBottom: 18, fontWeight: 700, fontSize: 15 }}>Top 10 Scorers (By Average)</h3>
              <ResponsiveContainer width="100%" height={310}>
                <BarChart data={top10.map(s => ({ name: displayName(s), avg: parseFloat(s.avg.toFixed(1)) }))} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                  <XAxis type="number" domain={[0, 10]} {...axisProps} />
                  <YAxis dataKey="name" type="category" width={76} {...axisProps} tick={{ fontSize: 11, fill: mutedText }} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: darkMode ? "#334155" : "#f1f5f9" }} />
                  <Bar dataKey="avg" fill={C.info} radius={[0, 6, 6, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card darkMode={darkMode}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                <h3 style={{ color: textColor, fontWeight: 700, fontSize: 15, margin: 0 }}>Overall Score Distribution</h3>
                <div style={{ display: "flex", gap: 6 }}>
                  {[("both"), ("t1"), ("t2")].map(f => (
                    <button key={f} onClick={() => setDistFilter(f)} style={{
                      padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      cursor: "pointer", border: "none", transition: "all 0.2s",
                      background: distFilter === f ? C.primary : (darkMode ? "#334155" : "#e2e8f0"),
                      color: distFilter === f ? "#fff" : mutedText,
                    }}>
                      {f === "both" ? "Both" : f === "t1" ? "Test 1" : "Test 2"}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={distributionData} margin={{ top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                  <XAxis dataKey="range" {...axisProps} />
                  <YAxis allowDecimals={false} {...axisProps} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: darkMode ? "#334155" : "#f1f5f9" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {distributionData.map((_, i) => <Cell key={i} fill={GRADE_COLORS[i % GRADE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <Card darkMode={darkMode}>
            <h3 style={{ color: textColor, marginBottom: 18, fontWeight: 700, fontSize: 15 }}>Student Comparison (Test 1 vs Test 2)</h3>
            {/* Horizontally scrollable on small screens so 30 bars never get crushed */}
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <div style={{ minWidth: isMobile ? 600 : "100%" }}>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={t1t2Compare} margin={{ top: 16, right: 8, left: -10, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                    <XAxis dataKey="name" {...axisProps} tick={{ fontSize: 9 }} interval={0} angle={-45} textAnchor="end" />
                    <YAxis domain={[0, 10]} {...axisProps} />
                    <Tooltip {...tooltipStyle} cursor={{ fill: darkMode ? "#334155" : "#f1f5f9" }} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                    <Bar dataKey="Test 1" fill={C.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Test 2" fill={C.secondary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* SMART INSIGHTS */}
        <div id="Insights" style={{ marginBottom: 60 }}>
          <SectionHeader title="Smart Insights" subtitle="Automated analysis based on class performance" textColor={textColor} mutedText={mutedText} />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(260px, 100%), 1fr))`, gap: isMobile ? 12 : 18 }}>
            <InsightCard darkMode={darkMode} title="Best Performer" color={C.info} value={`${highestScorer.name} (Avg: ${highestScorer.avg?.toFixed(1)})`} />
            <InsightCard darkMode={darkMode} title="Most Improved" color={C.success} value={`${mostImproved[0]?.name} (+${mostImproved[0]?.improvement} marks)`} />
            <InsightCard darkMode={darkMode} title="Highest Score Recorded" color={C.primary} value={`${Math.max(...t1Scores, ...t2Scores)} / 10`} />
            <InsightCard darkMode={darkMode} title="Lowest Score Recorded" color={C.danger} value={`${Math.min(...t1Scores, ...t2Scores)} / 10`} />
            <InsightCard darkMode={darkMode} title="Needs Attention" color={C.warning} value={`${needAttention.length} students (avg < 4)`} />
            <InsightCard darkMode={darkMode} title="Consistently Absent" color={C.danger} value={absentBothList.length > 0 ? absentBothList.map(s => s.name).join(", ") : "None"} />
            <InsightCard darkMode={darkMode} title="Perfect Scores (10/10)" color={C.success} value={`${allScores.filter(v => v === 10).length} instances`} />
            <InsightCard darkMode={darkMode} title="Attendance Rate" color={C.secondary} value={`${attendanceRatio}% present in Test 2`} />
            <InsightCard darkMode={darkMode} title="Overall Class Trend" color={C.info} value={`Avg shifted by ${(parseFloat(t2Avg) - parseFloat(t1Avg)).toFixed(2)} marks`} />
          </div>
        </div>

        {/* STUDENT TABLE */}
        <div id="Students" style={{ marginBottom: 60 }}>
          <SectionHeader title="Student Roster" subtitle="Full list with search and sort" textColor={textColor} mutedText={mutedText} />
          <Card darkMode={darkMode} className="overflow-hidden p-0">
            <div style={{ display: "flex", gap: 10, padding: isMobile ? 12 : 18, borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, flexWrap: "wrap", background: darkMode ? "#1e293b" : "#f8fafc" }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name…"
                style={{ flex: 1, minWidth: isMobile ? "100%" : 200, padding: "9px 14px", borderRadius: 8, background: darkMode ? "#0f172a" : "#ffffff", border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`, color: textColor, fontSize: 14, outline: "none" }}
              />
              <select onChange={e => setSortKey(e.target.value)}
                style={{ padding: "9px 14px", borderRadius: 8, background: darkMode ? "#0f172a" : "#ffffff", border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`, color: textColor, fontSize: 14, outline: "none", cursor: "pointer" }}>
                <option value="roll">Sort: Roll No.</option>
                <option value="name">Sort: Name</option>
                <option value="t1">Sort: Test 1</option>
                <option value="t2">Sort: Test 2</option>
                <option value="avg">Sort: Average</option>
              </select>
              <button onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
                style={{ padding: "9px 14px", borderRadius: 8, background: darkMode ? "#0f172a" : "#ffffff", border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`, color: textColor, fontSize: 14, cursor: "pointer" }}>
                {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>
            </div>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? 12 : 14, minWidth: 560 }}>
                <thead>
                  <tr style={{ background: darkMode ? "#0f172a" : "#f1f5f9" }}>
                    {["Roll", "Name", "Test 1", "Test 2", "Total", "Average", "T2 Status", "Evaluation"].map(h => (
                      <th key={h} style={{ padding: isMobile ? "10px 12px" : "13px 18px", textAlign: "left", color: mutedText, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const badge = getBadge(s);
                    const isAbsent = s.absentBoth;
                    const td = { padding: isMobile ? "10px 12px" : "13px 18px", borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, whiteSpace: "nowrap" };
                    return (
                      <tr key={s.roll}
                        style={{ background: isAbsent ? (darkMode ? "rgba(225,29,72,0.06)" : "rgba(225,29,72,0.02)") : "transparent", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = darkMode ? "#334155" : "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = isAbsent ? (darkMode ? "rgba(225,29,72,0.06)" : "rgba(225,29,72,0.02)") : "transparent"}
                      >
                        <td style={{ ...td, color: mutedText }}>{s.roll}</td>
                        <td style={{ ...td, fontWeight: 600 }}>{s.name}</td>
                        <td style={td}>{s.t1 !== null ? s.t1 : <span style={{ color: s.t1Label === "N/A" ? C.info : C.warning }}>{s.t1Label}</span>}</td>
                        <td style={td}>{s.t2 !== null ? s.t2 : <span style={{ color: s.t2Label === "N/A" ? C.info : C.warning }}>{s.t2Label}</span>}</td>
                        <td style={td}>{s.total ?? "—"}</td>
                        <td style={{ ...td, fontWeight: 700 }}>{s.avg?.toFixed(1) ?? "—"}</td>
                        <td style={{ ...td, color: s.t2 === null ? (s.t2Label === "N/A" ? C.info : C.danger) : C.success, fontWeight: 600 }}>{s.t2 === null ? (s.t2Label || "Absent") : "Present"}</td>
                        <td style={td}>
                          <span style={{ background: `${badge.color}18`, color: badge.color, padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* HIGHLIGHTS */}
        <div id="Highlights" style={{ marginBottom: 60 }}>
          <SectionHeader title="Special Highlights" subtitle="Notable student groups and performance brackets" textColor={textColor} mutedText={mutedText} />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(280px, 100%), 1fr))`, gap: isMobile ? 14 : 22 }}>
            <Card darkMode={darkMode}>
              <h3 style={{ color: C.info, marginBottom: 14, fontWeight: 700, fontSize: 15, borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, paddingBottom: 12 }}>🏆 Top 5 Students</h3>
              {top5.map((s, i) => <StudentRow key={s.roll} s={s} color={C.info} rank={i + 1} showAvg mutedText={mutedText} darkMode={darkMode} />)}
            </Card>
            <Card darkMode={darkMode}>
              <h3 style={{ color: C.secondary, marginBottom: 14, fontWeight: 700, fontSize: 15, borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, paddingBottom: 12 }}>📈 Most Improved</h3>
              {mostImproved.map(s => <StudentRow key={s.roll} s={s} color={C.secondary} extra={`+${s.improvement} marks`} mutedText={mutedText} darkMode={darkMode} />)}
            </Card>
            <Card darkMode={darkMode}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14, borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, paddingBottom: 12 }}>
                <h3 style={{ color: C.success, fontWeight: 700, fontSize: 15, margin: 0 }}>⭐ Full Marks (10/10)</h3>
                <div style={{ display: "flex", gap: 6 }}>
                  {["both", "t1", "t2"].map(f => (
                    <button key={f} onClick={() => setFullFilter(f)} style={{
                      padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      cursor: "pointer", border: "none", transition: "all 0.2s",
                      background: fullFilter === f ? C.success : (darkMode ? "#334155" : "#e2e8f0"),
                      color: fullFilter === f ? "#fff" : mutedText,
                    }}>
                      {f === "both" ? "Both" : f === "t1" ? "Test 1" : "Test 2"}
                    </button>
                  ))}
                </div>
              </div>
              {(() => {
                const rolls = [...new Set(
                  STUDENTS
                    .filter(s =>
                      fullFilter === "t1" ? s.t1 === 10 :
                      fullFilter === "t2" ? s.t2 === 10 :
                      s.t1 === 10 || s.t2 === 10
                    )
                    .map(s => s.roll)
                )];
                if (rolls.length === 0)
                  return <div style={{ color: mutedText, fontSize: 14 }}>No full marks in this selection.</div>;
                return rolls.map(r => {
                  const s = STUDENTS.find(x => x.roll === r);
                  const extra = fullFilter === "t1" ? "T1: 10" : fullFilter === "t2" ? "T2: 10" : `T1: ${s.t1 ?? "Ab"} / T2: ${s.t2 ?? "Ab"}`;
                  return <StudentRow key={r} s={s} color={C.success} extra={extra} mutedText={mutedText} darkMode={darkMode} />;
                });
              })()}
            </Card>
            <Card darkMode={darkMode}>
              <h3 style={{ color: C.warning, marginBottom: 14, fontWeight: 700, fontSize: 15, borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, paddingBottom: 12 }}>⚠ Needs Attention (Avg &lt; 4)</h3>
              {needAttention.length > 0
                ? needAttention.map(s => <StudentRow key={s.roll} s={s} color={C.warning} showAvg mutedText={mutedText} darkMode={darkMode} />)
                : <div style={{ color: mutedText, fontSize: 14 }}>No students in this bracket.</div>}
            </Card>
            <Card darkMode={darkMode}>
              <h3 style={{ color: C.danger, marginBottom: 14, fontWeight: 700, fontSize: 15, borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, paddingBottom: 12 }}>❌ Absent in Both Tests</h3>
              {absentBothList.length > 0
                ? absentBothList.map(s => <StudentRow key={s.roll} s={s} color={C.danger} mutedText={mutedText} darkMode={darkMode} />)
                : <div style={{ color: mutedText, fontSize: 14 }}>None — great attendance!</div>}
            </Card>
          </div>
        </div>

        <footer style={{ textAlign: "center", padding: "40px 20px", color: mutedText, fontSize: 14, borderTop: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
          <a
            href="https://wa.me/918102783645"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: mutedText, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#25D366"}
            onMouseLeave={e => e.currentTarget.style.color = mutedText}
          >
            Designed &amp; Developed by <strong>Utkarsh</strong>
          </a>
          <div style={{ marginTop: 10, fontSize: 13, color: mutedText }}>
            ⚠️ If you think your marks are incorrect, directly{" "}
            <a
              href="https://wa.me/918102783645"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#25D366", fontWeight: 700, textDecoration: "none" }}
            >
              contact on WhatsApp
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

