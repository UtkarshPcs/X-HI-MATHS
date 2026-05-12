import { useState, useEffect, useRef, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const RAW_DATA = [
  { roll: 1, name: "Aditya", test1: 8, test2: 6 },
  { roll: 2, name: "Shreya", test1: 7, test2: 4 },
  { roll: 3, name: "Shourya", test1: "Ab", test2: "Ab" },
  { roll: 4, name: "Mihika", test1: "Ab", test2: 4 },
  { roll: 5, name: "Anuraj", test1: 10, test2: 9 },
  { roll: 6, name: "Parth", test1: 10, test2: 9 },
  { roll: 7, name: "Ravi", test1: 5, test2: 6 },
  { roll: 8, name: "Ruchir", test1: 5, test2: 5 },
  { roll: 9, name: "Sonali", test1: 7, test2: 7 },
  { roll: 10, name: "Yesh", test1: 4, test2: "Ab" },
  { roll: 11, name: "Isha", test1: 6, test2: 8 },
  { roll: 12, name: "Ayush", test1: 7, test2: 6 },
  { roll: 13, name: "Aman Kishor", test1: "Ab", test2: 10 },
  { roll: 14, name: "Kirti", test1: 8, test2: 0 },
  { roll: 15, name: "Suryanahu", test1: 4, test2: "Ab" },
  { roll: 16, name: "Mohit", test1: 1, test2: "Ab" }, // Updated Marks
  { roll: 17, name: "Virat Singh", test1: 6, test2: "Ab" },
  { roll: 18, name: "Rudransh", test1: 10, test2: 7 },
  { roll: 19, name: "Sushant", test1: 7, test2: 6 },
  { roll: 20, name: "Arnav", test1: 0, test2: 0 },
  { roll: 21, name: "Deepanshu", test1: 2, test2: 0 },
  { roll: 22, name: "Anshuka 22", test1: 2, test2: 0 },
  { roll: 23, name: "Utkarsh", test1: 8, test2: 10 },
  { roll: 24, name: "Vibhav", test1: 0, test2: 1 },
  { roll: 25, name: "Aadarsh", test1: 7, test2: "Ab" },
  { roll: 26, name: "Sahil", test1: 2, test2: "Ab" },
  { roll: 27, name: "Ayush Kumar", test1: 6, test2: 3 },
  { roll: 28, name: "Awni", test1: 6, test2: 2 },
  { roll: 29, name: "Aditya Prakash", test1: 7, test2: 5 },
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
  { roll: 40, name: "Utkarsh B.", test1: 7, test2: 8 }, // Updated Name
];

function processData(raw) {
  return raw.map(s => {
    const t1 = s.test1 === "Ab" ? null : s.test1;
    const t2 = s.test2 === "Ab" ? null : s.test2;
    const scores = [t1, t2].filter(v => v !== null);
    const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const total = scores.length ? scores.reduce((a, b) => a + b, 0) : null;
    const absentBoth = t1 === null && t2 === null;
    const improved = t1 !== null && t2 !== null && t2 > t1;
    const improvement = (t1 !== null && t2 !== null) ? t2 - t1 : null;
    return { ...s, t1, t2, avg, total, absentBoth, improved, improvement };
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

// Professional Color Palette
const COLOR_PRIMARY = "#2563eb"; // Blue
const COLOR_SECONDARY = "#4f46e5"; // Indigo
const COLOR_SUCCESS = "#10b981"; // Emerald
const COLOR_DANGER = "#e11d48"; // Rose
const COLOR_WARNING = "#d97706"; // Amber
const COLOR_INFO = "#0ea5e9"; // Sky Blue

const GRADE_COLORS = [COLOR_PRIMARY, COLOR_SECONDARY, COLOR_INFO, COLOR_DANGER, COLOR_WARNING];

function AnimatedCounter({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}</span>;
}

function Card({ children, className = "", darkMode }) {
  return (
    <div className={`rounded-xl p-6 ${className}`} style={{
      background: darkMode ? "#1e293b" : "#ffffff",
      border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
      boxShadow: darkMode ? "0 4px 6px -1px rgba(0, 0, 0, 0.2)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      transition: "all 0.2s ease-in-out",
    }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, color, isFloat, darkMode }) {
  return (
    <Card darkMode={darkMode} className="flex flex-col gap-1 cursor-default hover:-translate-y-1">
      <div className="text-xs font-bold uppercase tracking-wider" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>{label}</div>
      <div className="text-3xl font-bold" style={{ color: color || (darkMode ? "#f8fafc" : "#0f172a") }}>
        {isFloat ? value : <AnimatedCounter target={Number(value)} />}
      </div>
      {sub && <div className="text-sm mt-1" style={{ color: darkMode ? "#64748b" : "#94a3b8" }}>{sub}</div>}
    </Card>
  );
}

const SECTIONS = ["Overview", "Charts", "Insights", "Students", "Highlights"];

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("roll");
  const [sortDir, setSortDir] = useState("asc");
  const [activeSection, setActiveSection] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef();

  const filtered = useMemo(() => {
    let arr = STUDENTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    arr = [...arr].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (va === null) va = -999; if (vb === null) vb = -999;
      if (typeof va === "string") va = va.charCodeAt(0);
      if (typeof vb === "string") vb = vb.charCodeAt(0);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return arr;
  }, [search, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const t1t2Compare = STUDENTS.filter(s => s.t1 !== null && s.t2 !== null).map(s => ({
    name: s.name.split(" ")[0],
    "Test 1": s.t1,
    "Test 2": s.t2,
  }));

  const distributionData = [
    { range: "0-2", count: STUDENTS.filter(s => { const sc = [s.t1, s.t2].filter(v => v !== null); return sc.some(v => v <= 2); }).length },
    { range: "3-5", count: STUDENTS.filter(s => { const sc = [s.t1, s.t2].filter(v => v !== null); return sc.some(v => v >= 3 && v <= 5); }).length },
    { range: "6-7", count: STUDENTS.filter(s => { const sc = [s.t1, s.t2].filter(v => v !== null); return sc.some(v => v >= 6 && v <= 7); }).length },
    { range: "8-9", count: STUDENTS.filter(s => { const sc = [s.t1, s.t2].filter(v => v !== null); return sc.some(v => v >= 8 && v <= 9); }).length },
    { range: "10", count: STUDENTS.filter(s => s.t1 === 10 || s.t2 === 10).length },
  ];

  const top10 = [...STUDENTS].filter(s => s.avg !== null).sort((a, b) => b.avg - a.avg).slice(0, 10);
  const mostImproved = [...STUDENTS].filter(s => s.improvement !== null).sort((a, b) => b.improvement - a.improvement).slice(0, 5);
  const needAttention = [...STUDENTS].filter(s => s.avg !== null && s.avg < 4).sort((a, b) => a.avg - b.avg);
  const fullMarkers = STUDENTS.filter(s => s.t1 === 10 || s.t2 === 10);
  const top5 = top10.slice(0, 5);

  const pieData = [
    { name: "Present", value: t2Present },
    { name: "Absent", value: t2Absent },
  ];

  const bg = darkMode ? "#0f172a" : "#f8fafc";
  const textColor = darkMode ? "#f8fafc" : "#0f172a";
  const mutedText = darkMode ? "#94a3b8" : "#64748b";

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
    setSidebarOpen(false);
  }

  function getBadge(s) {
    if (s.absentBoth) return { label: "Absent Both", color: COLOR_DANGER };
    if (s.avg === null) return { label: "Partial Absent", color: COLOR_WARNING };
    if (s.avg >= 9) return { label: "Topper", color: COLOR_SUCCESS };
    if (s.avg >= 7) return { label: "Good", color: COLOR_INFO };
    if (s.avg >= 5) return { label: "Average", color: COLOR_PRIMARY };
    if (s.avg >= 3) return { label: "Below Avg", color: COLOR_WARNING };
    return { label: "Needs Help", color: COLOR_DANGER };
  }

  const chartAxisProps = { stroke: mutedText, fontSize: 12 };
  const chartTooltipProps = {
    contentStyle: {
      background: darkMode ? "#1e293b" : "#ffffff",
      border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
      borderRadius: 8,
      color: textColor
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textColor, fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", transition: "background 0.3s" }}>

      {/* NAVBAR */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: darkMode ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
        padding: "0 24px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", color: textColor, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center" }}>
            ☰
          </button>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>
            Maths Analytics
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => scrollTo(s)}
              style={{
                background: activeSection === s ? (darkMode ? "#1e293b" : "#f1f5f9") : "none",
                border: "none",
                color: activeSection === s ? COLOR_PRIMARY : mutedText,
                padding: "6px 14px", borderRadius: 20, fontSize: 14, cursor: "pointer", fontWeight: 600,
                display: window.innerWidth < 600 ? "none" : "block", transition: "all 0.2s"
              }}>
              {s}
            </button>
          ))}
          <button onClick={() => setDarkMode(d => !d)} style={{ background: darkMode ? "#1e293b" : "#f1f5f9", border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, color: textColor, padding: "6px 16px", borderRadius: 20, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </nav>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div style={{ position: "fixed", top: 64, left: 0, bottom: 0, width: 240, zIndex: 200, background: darkMode ? "#1e293b" : "#ffffff", borderRight: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, padding: 24 }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => scrollTo(s)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: activeSection === s ? COLOR_PRIMARY : mutedText, padding: "12px 12px", fontSize: 16, fontWeight: 600, cursor: "pointer", borderRadius: 8, marginBottom: 8, backgroundColor: activeSection === s ? (darkMode ? "#0f172a" : "#f1f5f9") : "transparent" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div ref={mainRef} style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* HERO */}
        <div id="Overview" style={{ textAlign: "center", padding: "80px 0 60px" }}>
          <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, border: `1px solid ${COLOR_INFO}40`, marginBottom: 20, fontSize: 13, fontWeight: 600, color: COLOR_INFO, background: `${COLOR_INFO}10` }}>
            Performance Report
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-1px", margin: "0 0 16px", color: textColor }}>
            Maths Weekly Test Dashboard
          </h1>
          <p style={{ color: mutedText, fontSize: 18, marginBottom: 32, maxWidth: 600, margin: "0 auto 32px" }}>
            Comprehensive analytics and evaluation for Weekly Test 1 & Weekly Test 2. Monitoring progress for 40 students.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => window.print()} style={{ background: COLOR_PRIMARY, border: "none", color: "white", padding: "12px 28px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 15, boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)" }}>
              Export PDF
            </button>
            <button onClick={() => {
              const csv = ["Roll,Name,Test1,Test2,Average,Total"].concat(STUDENTS.map(s => `${s.roll},${s.name},${s.t1 ?? "Ab"},${s.t2 ?? "Ab"},${s.avg?.toFixed(1) ?? "-"},${s.total ?? "-"}`)).join("\n");
              const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv); a.download = "maths_test.csv"; a.click();
            }} style={{ background: darkMode ? "#334155" : "#e2e8f0", border: "none", color: textColor, padding: "12px 28px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 15 }}>
              Download CSV
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, marginBottom: 60 }}>
          <StatCard darkMode={darkMode} label="Total Students" value={40} color={COLOR_PRIMARY} />
          <StatCard darkMode={darkMode} label="Present (Test 2)" value={t2Present} color={COLOR_SUCCESS} />
          <StatCard darkMode={darkMode} label="Absent (Test 2)" value={t2Absent} color={COLOR_DANGER} />
          <StatCard darkMode={darkMode} label="Test 1 Average" value={t1Avg} color={COLOR_INFO} isFloat />
          <StatCard darkMode={darkMode} label="Test 2 Average" value={t2Avg} color={COLOR_SECONDARY} isFloat />
          <StatCard darkMode={darkMode} label="Highest Scorer" value={highestScorer.name.split(" ")[0]} color={COLOR_SUCCESS} isFloat />
          <StatCard darkMode={darkMode} label="Absent Both Tests" value={absentBothList.length} color={COLOR_DANGER} />
          <StatCard darkMode={darkMode} label="Attendance Ratio" value={`${attendanceRatio}%`} color={COLOR_PRIMARY} isFloat />
        </div>

        {/* CHARTS */}
        <div id="Charts" style={{ marginBottom: 60 }}>
          <SectionHeader title="Analytics Charts" subtitle="Visual breakdown of performance data" textColor={textColor} mutedText={mutedText} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24, marginBottom: 24 }}>
            <Card darkMode={darkMode}>
              <h3 style={{ color: textColor, marginBottom: 20, fontWeight: 600, fontSize: 16 }}>Average Comparison (Test 1 vs Test 2)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[{ name: "Test 1", avg: parseFloat(t1Avg) }, { name: "Test 2", avg: parseFloat(t2Avg) }]} margin={{ top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                  <XAxis dataKey="name" {...chartAxisProps} />
                  <YAxis domain={[0, 10]} {...chartAxisProps} />
                  <Tooltip {...chartTooltipProps} cursor={{ fill: darkMode ? '#334155' : '#f1f5f9' }} />
                  <Bar dataKey="avg" fill={COLOR_PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={80} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card darkMode={darkMode}>
              <h3 style={{ color: textColor, marginBottom: 20, fontWeight: 600, fontSize: 16 }}>Test 2 Attendance</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} style={{ fontSize: 12 }}>
                    {pieData.map((_, i) => <Cell key={i} fill={i === 0 ? COLOR_SUCCESS : COLOR_DANGER} />)}
                  </Pie>
                  <Tooltip {...chartTooltipProps} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24, marginBottom: 24 }}>
            <Card darkMode={darkMode}>
              <h3 style={{ color: textColor, marginBottom: 20, fontWeight: 600, fontSize: 16 }}>Top 10 Scorers (By Average)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={top10.map(s => ({ name: s.name.split(" ")[0], avg: parseFloat(s.avg?.toFixed(1)) }))} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                  <XAxis type="number" domain={[0, 10]} {...chartAxisProps} />
                  <YAxis dataKey="name" type="category" width={80} {...chartAxisProps} tick={{ fontSize: 12, fill: mutedText }} />
                  <Tooltip {...chartTooltipProps} cursor={{ fill: darkMode ? '#334155' : '#f1f5f9' }} />
                  <Bar dataKey="avg" fill={COLOR_INFO} radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card darkMode={darkMode}>
              <h3 style={{ color: textColor, marginBottom: 20, fontWeight: 600, fontSize: 16 }}>Overall Marks Distribution</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={distributionData} margin={{ top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                  <XAxis dataKey="range" {...chartAxisProps} />
                  <YAxis allowDecimals={false} {...chartAxisProps} />
                  <Tooltip {...chartTooltipProps} cursor={{ fill: darkMode ? '#334155' : '#f1f5f9' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {distributionData.map((_, i) => <Cell key={i} fill={GRADE_COLORS[i % GRADE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card darkMode={darkMode}>
            <h3 style={{ color: textColor, marginBottom: 20, fontWeight: 600, fontSize: 16 }}>Student Comparison (Test 1 vs Test 2)</h3>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={t1t2Compare} margin={{ top: 20, right: 0, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="name" {...chartAxisProps} tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" />
                <YAxis domain={[0, 10]} {...chartAxisProps} />
                <Tooltip {...chartTooltipProps} cursor={{ fill: darkMode ? '#334155' : '#f1f5f9' }} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar dataKey="Test 1" fill={COLOR_PRIMARY} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Test 2" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* SMART INSIGHTS */}
        <div id="Insights" style={{ marginBottom: 60 }}>
          <SectionHeader title="Smart Insights" subtitle="Automated analysis based on class performance" textColor={textColor} mutedText={mutedText} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <InsightCard darkMode={darkMode} title="Best Performer" value={`${highestScorer.name} (Avg: ${highestScorer.avg?.toFixed(1)})`} color={COLOR_INFO} />
            <InsightCard darkMode={darkMode} title="Most Improved" value={`${mostImproved[0]?.name} (+${mostImproved[0]?.improvement} marks)`} color={COLOR_SUCCESS} />
            <InsightCard darkMode={darkMode} title="Highest Score Recorded" value={`${Math.max(...t1Scores, ...t2Scores)} / 10`} color={COLOR_PRIMARY} />
            <InsightCard darkMode={darkMode} title="Lowest Score Recorded" value={`${Math.min(...t1Scores, ...t2Scores)} / 10`} color={COLOR_DANGER} />
            <InsightCard darkMode={darkMode} title="Attention Required" value={`${needAttention.length} students (avg < 4)`} color={COLOR_WARNING} />
            <InsightCard darkMode={darkMode} title="Consistently Absent" value={absentBothList.length > 0 ? absentBothList.map(s => s.name).join(", ") : "None"} color={COLOR_DANGER} />
            <InsightCard darkMode={darkMode} title="Perfect Scores (10/10)" value={`${fullMarkers.length} instances`} color={COLOR_SUCCESS} />
            <InsightCard darkMode={darkMode} title="Current Attendance" value={`${attendanceRatio}% present in Test 2`} color={COLOR_SECONDARY} />
            <InsightCard darkMode={darkMode} title="Overall Class Trend" value={`Average shifted by ${(t2Avg - t1Avg).toFixed(2)} marks`} color={COLOR_INFO} />
          </div>
        </div>

        {/* STUDENT TABLE */}
        <div id="Students" style={{ marginBottom: 60 }}>
          <SectionHeader title="Student Roster" subtitle="Complete list of all records with search and sort capability" textColor={textColor} mutedText={mutedText} />
          <Card darkMode={darkMode} className="overflow-hidden p-0">
            <div style={{ display: "flex", gap: 16, padding: 20, borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, flexWrap: "wrap", background: darkMode ? "#1e293b" : "#f8fafc" }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search student by name..."
                style={{ flex: 1, minWidth: 250, padding: "10px 16px", borderRadius: 8, background: darkMode ? "#0f172a" : "#ffffff", border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`, color: textColor, fontSize: 14, outline: "none" }}
              />
              <select onChange={e => toggleSort(e.target.value)} style={{ padding: "10px 16px", borderRadius: 8, background: darkMode ? "#0f172a" : "#ffffff", border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`, color: textColor, fontSize: 14, outline: "none", cursor: "pointer" }}>
                <option value="roll">Sort by: Roll Number</option>
                <option value="name">Sort by: Name</option>
                <option value="t1">Sort by: Test 1 Score</option>
                <option value="t2">Sort by: Test 2 Score</option>
                <option value="avg">Sort by: Average Score</option>
              </select>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: darkMode ? "#0f172a" : "#f1f5f9" }}>
                    {["Roll", "Name", "Test 1", "Test 2", "Total", "Average", "Status", "Evaluation"].map(h => (
                      <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: mutedText, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const badge = getBadge(s);
                    const isAbsent = s.absentBoth;
                    const tdStyle = { padding: "14px 20px", borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` };

                    return (
                      <tr key={s.roll} style={{
                        background: isAbsent ? (darkMode ? "rgba(225, 29, 72, 0.05)" : "rgba(225, 29, 72, 0.02)") : "transparent",
                        transition: "background 0.2s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = darkMode ? "#334155" : "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = isAbsent ? (darkMode ? "rgba(225, 29, 72, 0.05)" : "rgba(225, 29, 72, 0.02)") : "transparent"}
                      >
                        <td style={{ ...tdStyle, color: mutedText }}>{s.roll}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{s.name}</td>
                        <td style={tdStyle}>{s.t1 ?? "Absent"}</td>
                        <td style={tdStyle}>{s.t2 ?? "Absent"}</td>
                        <td style={tdStyle}>{s.total ?? "—"}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{s.avg?.toFixed(1) ?? "—"}</td>
                        <td style={{ ...tdStyle, color: s.t2 === null ? COLOR_DANGER : mutedText }}>{s.t2 === null ? "Absent" : "Present"}</td>
                        <td style={tdStyle}>
                          <span style={{ background: `${badge.color}15`, color: badge.color, padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
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

        {/* HIGHLIGHTS / SPECIAL SECTIONS */}
        <div id="Highlights" style={{ marginBottom: 60 }}>
          <SectionHeader title="Special Highlights" subtitle="Notable student groups and performance brackets" textColor={textColor} mutedText={mutedText} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>

            <Card darkMode={darkMode}>
              <h3 style={{ color: COLOR_INFO, marginBottom: 16, fontWeight: 600, fontSize: 16, borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, paddingBottom: 12 }}>Top 5 Students</h3>
              {top5.map((s, i) => <StudentRow key={s.roll} s={s} color={COLOR_INFO} rank={i + 1} avg darkMode={darkMode} />)}
            </Card>

            <Card darkMode={darkMode}>
              <h3 style={{ color: COLOR_SECONDARY, marginBottom: 16, fontWeight: 600, fontSize: 16, borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, paddingBottom: 12 }}>Most Improved</h3>
              {mostImproved.map(s => <StudentRow key={s.roll} s={s} color={COLOR_SECONDARY} extra={`+${s.improvement} marks`} darkMode={darkMode} />)}
            </Card>

            <Card darkMode={darkMode}>
              <h3 style={{ color: COLOR_SUCCESS, marginBottom: 16, fontWeight: 600, fontSize: 16, borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, paddingBottom: 12 }}>Full Marks Scorers</h3>
              {[...new Set(fullMarkers.map(s => s.roll))].map(r => {
                const s = STUDENTS.find(x => x.roll === r);
                return <StudentRow key={r} s={s} color={COLOR_SUCCESS} extra={`T1: ${s.t1 ?? "Ab"} / T2: ${s.t2 ?? "Ab"}`} darkMode={darkMode} />;
              })}
            </Card>

            <Card darkMode={darkMode}>
              <h3 style={{ color: COLOR_WARNING, marginBottom: 16, fontWeight: 600, fontSize: 16, borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, paddingBottom: 12 }}>Needs Attention (Avg &lt; 4)</h3>
              {needAttention.length > 0 ? needAttention.map(s => <StudentRow key={s.roll} s={s} color={COLOR_WARNING} avg darkMode={darkMode} />) : <div style={{ color: mutedText, fontSize: 14 }}>No students in this bracket.</div>}
            </Card>

            <Card darkMode={darkMode}>
              <h3 style={{ color: COLOR_DANGER, marginBottom: 16, fontWeight: 600, fontSize: 16, borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, paddingBottom: 12 }}>Absent in Both Tests</h3>
              {absentBothList.length > 0 ? absentBothList.map(s => <StudentRow key={s.roll} s={s} color={COLOR_DANGER} darkMode={darkMode} />) : <div style={{ color: mutedText, fontSize: 14 }}>None.</div>}
            </Card>

          </div>
        </div>

        <footer style={{ textAlign: "center", padding: "40px 20px", color: mutedText, fontSize: 14, borderTop: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
          Developed and Designed by Utkarsh.
        </footer>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, textColor, mutedText }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: textColor, letterSpacing: "-0.5px" }}>{title}</h2>
      <p style={{ color: mutedText, fontSize: 15, margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function InsightCard({ title, value, color, darkMode }) {
  return (
    <div style={{ background: darkMode ? "#1e293b" : "#ffffff", border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, borderRadius: 12, padding: "20px", borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: darkMode ? "#94a3b8" : "#64748b", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: darkMode ? "#f8fafc" : "#0f172a" }}>{value}</div>
    </div>
  );
}

function StudentRow({ s, color, rank, avg, extra, darkMode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${darkMode ? "#334155" : "#f1f5f9"}`, fontSize: 14 }}>
      {rank && <span style={{ background: `${color}15`, color: color, width: 24, height: 24, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{rank}</span>}
      <span style={{ flex: 1, fontWeight: 600, color: darkMode ? "#f8fafc" : "#0f172a" }}>{s.name}</span>
      {avg && s.avg !== null && <span style={{ color: mutedText, fontSize: 13, fontWeight: 500 }}>Avg: <span style={{ color: color, fontWeight: 600 }}>{s.avg?.toFixed(1)}</span></span>}
      {extra && <span style={{ color: color, fontSize: 13, fontWeight: 600 }}>{extra}</span>}
    </div>
  );
}