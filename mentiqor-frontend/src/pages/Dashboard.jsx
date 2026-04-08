import { useEffect, useState } from "react";
import { fetchStats, fetchWeakTopics } from "../services/api";

export default function Dashboard({ userId, onNavigate }) {
  const [stats, setStats]           = useState(null);
  const [weakTopics, setWeakTopics] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    Promise.all([fetchStats(userId), fetchWeakTopics(userId)])
      .then(([s, w]) => { setStats(s); setWeakTopics(w); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div style={S.center}>
      <div style={S.spinner} />
      <p style={{ color: "var(--text-muted)", marginTop: 16, fontSize: 14 }}>
        Loading your stats...
      </p>
    </div>
  );

  if (error || !stats) return (
    <div style={S.center}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
      <p style={{ color: "var(--text-muted)", textAlign: "center", maxWidth: 300, lineHeight: 1.65 }}>
        No attempts yet. Start practicing to see your performance here.
      </p>
      <button style={S.primaryBtn} onClick={() => onNavigate("quiz")}>
        Start Practice →
      </button>
    </div>
  );

  const { overall, by_subject } = stats;
  const accuracyColor = overall.accuracy_percent >= 70
    ? "var(--success)"
    : overall.accuracy_percent >= 40 ? "var(--warning)" : "var(--error)";

  return (
    <div className="animate-in">
      <div style={S.pageHeader}>
        <h2 style={S.pageTitle}>Your Dashboard</h2>
        <button style={S.practiceBtn} onClick={() => onNavigate("quiz")}>
          Practice →
        </button>
      </div>

      {/* Overall stats grid */}
      <div style={S.statsGrid}>
        <StatCard label="Attempted"   value={overall.total_attempted} />
        <StatCard label="Correct"     value={overall.total_correct}   color="var(--success)" />
        <StatCard label="Accuracy"    value={`${overall.accuracy_percent}%`} color={accuracyColor} />
        <StatCard
          label="Total Marks"
          value={`${overall.total_marks >= 0 ? "+" : ""}${overall.total_marks}`}
          color={overall.total_marks >= 0 ? "var(--success)" : "var(--error)"}
        />
      </div>

      {/* Subject breakdown */}
      <div style={S.section}>
        <h3 style={S.sectionTitle}>Subject Breakdown</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {by_subject.map(sub => (
            <SubjectRow key={sub.subject} data={sub} />
          ))}
        </div>
      </div>

      {/* Weak topics */}
      <div style={S.section}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ ...S.sectionTitle, margin: 0 }}>Weak Topics</h3>
          <span style={S.thresholdTag}>
            below {weakTopics?.threshold_percent ?? 60}% accuracy
          </span>
        </div>

        {weakTopics?.weak_topics?.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {weakTopics.weak_topics.map((t, i) => (
              <WeakRow key={i} data={t} />
            ))}
          </div>
        ) : (
          <div style={S.allGood}>
            ✅ &nbsp;All chapters above 60% — great work!
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function StatCard({ label, value, color = "var(--text)" }) {
  return (
    <div style={S.statCard}>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "monospace", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 7, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
    </div>
  );
}

function SubjectRow({ data }) {
  const acc = data.accuracy_percent;
  const barColor = acc >= 70 ? "var(--success)" : acc >= 40 ? "var(--warning)" : "var(--error)";
  const marksSign = data.total_marks >= 0 ? "+" : "";

  return (
    <div style={S.subjectRow}>
      <div style={S.subjectTop}>
        <span style={S.subjectName}>{data.subject}</span>
        <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
          <span style={{ color: "var(--text-muted)" }}>
            {data.correct}/{data.attempted}
          </span>
          <span style={{ color: barColor, fontWeight: 600 }}>{acc}%</span>
          <span style={{ color: data.total_marks >= 0 ? "var(--success)" : "var(--error)", fontFamily: "monospace" }}>
            {marksSign}{data.total_marks}
          </span>
        </div>
      </div>
      <div style={S.barTrack}>
        <div style={{ ...S.barFill, width: `${acc}%`, background: barColor }} />
      </div>
    </div>
  );
}

function WeakRow({ data }) {
  const acc = data.accuracy_percent;
  const color = acc < 30 ? "var(--error)" : "var(--warning)";

  return (
    <div style={S.weakRow}>
      <div>
        <span style={S.weakChapter}>{data.chapter}</span>
        <span style={S.weakSubject}>{data.subject}</span>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ color, fontWeight: 700, fontSize: 16, fontFamily: "monospace" }}>
          {acc}%
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>
          {data.correct}/{data.attempted}
        </div>
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────
const S = {
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50vh",
    gap: 16,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid var(--border)",
    borderTop: "3px solid var(--accent)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: 22,
    fontWeight: 700,
    color: "var(--text)",
  },
  practiceBtn: {
    padding: "8px 18px",
    background: "var(--accent-bg)",
    color: "var(--accent-muted)",
    border: "1px solid rgba(91,94,244,0.3)",
    borderRadius: "var(--radius-sm)",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "18px 14px",
    textAlign: "center",
  },
  section: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "22px 24px",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text)",
    marginBottom: 16,
  },
  thresholdTag: {
    fontSize: 11.5,
    color: "var(--text-muted)",
    background: "var(--surface-2)",
    border: "1px solid var(--border-2)",
    padding: "3px 10px",
    borderRadius: 20,
  },
  subjectRow: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "13px 16px",
  },
  subjectTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subjectName: {
    fontSize: 14.5,
    fontWeight: 500,
    color: "var(--text)",
  },
  barTrack: {
    height: 5,
    background: "var(--border)",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.6s ease",
  },
  weakRow: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  weakChapter: {
    display: "block",
    fontSize: 14.5,
    fontWeight: 500,
    color: "var(--text)",
    marginBottom: 2,
  },
  weakSubject: {
    display: "block",
    fontSize: 12,
    color: "var(--text-muted)",
  },
  allGood: {
    textAlign: "center",
    color: "var(--success)",
    fontSize: 14,
    padding: "12px",
    background: "var(--success-bg)",
    borderRadius: "var(--radius-sm)",
  },
  primaryBtn: {
    padding: "12px 28px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
};