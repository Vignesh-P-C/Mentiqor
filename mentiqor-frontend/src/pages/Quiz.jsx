import { useEffect, useState, useMemo } from "react";
import { fetchQuestions, submitAnswer } from "../services/api";
import QuestionCard from "../components/QuestionCard";
import Options from "../components/Options";
import ResultBox from "../components/ResultBox";

const STAGE = { SETUP: "setup", QUIZ: "quiz", SUMMARY: "summary" };

// Fisher-Yates shuffle — returns a new shuffled array
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function Quiz({ userId, onNavigate }) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [stage, setStage]               = useState(STAGE.SETUP);

  // Filter selections (setup screen)
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [chapterFilter, setChapterFilter] = useState("All");

  // Active quiz questions (shuffled snapshot taken at start)
  const [activeQuestions, setActiveQuestions] = useState([]);

  // Per-question state
  const [qIndex, setQIndex]       = useState(0);
  const [selected, setSelected]   = useState(null);
  const [result, setResult]       = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Session totals
  const [session, setSession] = useState({ correct: 0, total: 0, marks: 0 });

  // ── Load all questions once on mount ──
  useEffect(() => {
    fetchQuestions()
      .then(setAllQuestions)
      .catch(() => setError("Could not connect to backend. Make sure the server is running on port 5000."))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived: unique subjects ──
  const subjects = useMemo(
    () => ["All", ...[...new Set(allQuestions.map(q => q.subject))].sort()],
    [allQuestions]
  );

  // ── Derived: chapters filtered by selected subject ──
  const chapters = useMemo(() => {
    const base = subjectFilter === "All"
      ? allQuestions
      : allQuestions.filter(q => q.subject === subjectFilter);
    return ["All", ...[...new Set(base.map(q => q.chapter))].sort()];
  }, [allQuestions, subjectFilter]);

  // ── Derived: filtered questions (for preview count on setup screen) ──
  const previewQuestions = useMemo(
    () => allQuestions.filter(q => {
      if (subjectFilter !== "All" && q.subject !== subjectFilter) return false;
      if (chapterFilter !== "All" && q.chapter !== chapterFilter) return false;
      return true;
    }),
    [allQuestions, subjectFilter, chapterFilter]
  );

  const currentQ = activeQuestions[qIndex];
  const isLast   = qIndex === activeQuestions.length - 1;
  const progress = activeQuestions.length > 0 ? (qIndex / activeQuestions.length) * 100 : 0;

  const handleSubjectChange = (val) => {
    setSubjectFilter(val);
    setChapterFilter("All");
  };

  const startQuiz = () => {
    setActiveQuestions(shuffle(previewQuestions));
    setQIndex(0);
    setSelected(null);
    setResult(null);
    setSession({ correct: 0, total: 0, marks: 0 });
    setStage(STAGE.QUIZ);
  };

  const handleSelect = async (option) => {
    if (selected || submitting) return;
    setSelected(option);
    setSubmitting(true);
    try {
      const res = await submitAnswer({
        user_id: userId,
        question_id: currentQ.id,
        selected: option,
      });
      setResult(res);
      setSession(prev => ({
        correct: prev.correct + (res.is_correct ? 1 : 0),
        total:   prev.total + 1,
        marks:   prev.marks + res.marks_awarded,
      }));
    } catch (e) {
      console.error("Submit failed:", e.message);
    }
    setSubmitting(false);
  };

  const handleNext = () => {
    if (isLast) {
      setStage(STAGE.SUMMARY);
    } else {
      setQIndex(i => i + 1);
      setSelected(null);
      setResult(null);
    }
  };

  // ── Loading ──
  if (loading) return (
    <div style={S.center}>
      <div style={S.spinner} />
      <p style={{ color: "var(--text-muted)", marginTop: 16, fontSize: 14 }}>
        Loading questions...
      </p>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={S.center}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <p style={{ color: "var(--error)", textAlign: "center", maxWidth: 340, lineHeight: 1.6 }}>
        {error}
      </p>
    </div>
  );

  // ── Setup Stage ──
  if (stage === STAGE.SETUP) return (
    <div style={S.card} className="animate-in">
      <div style={S.setupHeader}>
        <h2 style={S.setupTitle}>Start Practice</h2>
        <span style={S.totalBadge}>{allQuestions.length} questions</span>
      </div>
      <p style={S.setupSubtitle}>
        Filter by subject and chapter, or attempt all questions.
      </p>

      <div style={S.filterGroup}>
        <label style={S.filterLabel}>Subject</label>
        <select
          style={S.select}
          value={subjectFilter}
          onChange={e => handleSubjectChange(e.target.value)}
        >
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={S.filterGroup}>
        <label style={S.filterLabel}>Chapter</label>
        <select
          style={S.select}
          value={chapterFilter}
          onChange={e => setChapterFilter(e.target.value)}
        >
          {chapters.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={S.previewCount}>
        <span style={{ color: "var(--accent-muted)", fontWeight: 600 }}>
          {previewQuestions.length}
        </span>
        &nbsp;question{previewQuestions.length !== 1 ? "s" : ""} selected
        &nbsp;·&nbsp;Questions will be shuffled
      </div>

      <button
        style={{ ...S.primaryBtn, opacity: previewQuestions.length === 0 ? 0.4 : 1 }}
        onClick={startQuiz}
        disabled={previewQuestions.length === 0}
      >
        Start Quiz →
      </button>
    </div>
  );

  // ── Summary Stage ──
  if (stage === STAGE.SUMMARY) {
    const accuracy = session.total > 0
      ? Math.round((session.correct / session.total) * 100)
      : 0;
    const emoji = accuracy >= 70 ? "🎉" : accuracy >= 40 ? "📈" : "💪";
    const accuracyColor = accuracy >= 70
      ? "var(--success)"
      : accuracy >= 40 ? "var(--warning)" : "var(--error)";

    return (
      <div style={S.card} className="animate-in">
        <div style={{ textAlign: "center", fontSize: 44, marginBottom: 8 }}>{emoji}</div>
        <h2 style={{ ...S.setupTitle, textAlign: "center", marginBottom: 4 }}>
          Session Complete
        </h2>
        <p style={{ ...S.setupSubtitle, textAlign: "center" }}>
          {subjectFilter !== "All" ? subjectFilter : "All Subjects"}
          {chapterFilter !== "All" ? ` · ${chapterFilter}` : ""}
        </p>

        <div style={S.summaryGrid}>
          <SummaryBox label="Attempted" value={session.total} />
          <SummaryBox label="Correct"   value={session.correct} color="var(--success)" />
          <SummaryBox label="Accuracy"  value={`${accuracy}%`}  color={accuracyColor} />
          <SummaryBox
            label="Marks"
            value={`${session.marks >= 0 ? "+" : ""}${session.marks}`}
            color={session.marks >= 0 ? "var(--success)" : "var(--error)"}
          />
        </div>

        <div style={S.summaryActions}>
          <button style={S.primaryBtn} onClick={startQuiz}>
            Retry
          </button>
          <button style={S.secondaryBtn} onClick={() => setStage(STAGE.SETUP)}>
            Change Filters
          </button>
          <button style={S.secondaryBtn} onClick={() => onNavigate("dashboard")}>
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz Stage ──
  return (
    <div className="animate-in">
      {/* Header */}
      <div style={S.quizHeader}>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
          {qIndex + 1} <span style={{ color: "var(--text-dim)" }}>/ {activeQuestions.length}</span>
        </span>
        <span style={{
          color: session.marks >= 0 ? "var(--success)" : "var(--error)",
          fontWeight: 700,
          fontSize: 14,
          fontFamily: "monospace",
        }}>
          {session.marks >= 0 ? "+" : ""}{session.marks} pts
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
          {session.correct}/{session.total} correct
        </span>
      </div>

      {/* Progress bar */}
      <div style={S.progressTrack}>
        <div style={{ ...S.progressFill, width: `${progress}%` }} />
      </div>

      <QuestionCard question={currentQ} />

      <Options
        question={currentQ}
        selected={selected}
        result={result}
        onSelect={handleSelect}
        disabled={submitting}
      />

      {result && (
        <ResultBox result={result} onNext={handleNext} isLast={isLast} />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────
function SummaryBox({ label, value, color = "var(--text)" }) {
  return (
    <div style={S.summaryBox}>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "monospace" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>
        {label}
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
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid var(--border)",
    borderTop: "3px solid var(--accent)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "32px",
    maxWidth: 560,
    margin: "0 auto",
  },
  setupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  setupTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: 22,
    fontWeight: 700,
    color: "var(--text)",
  },
  totalBadge: {
    fontSize: 12,
    color: "var(--text-muted)",
    background: "var(--surface-2)",
    border: "1px solid var(--border-2)",
    padding: "4px 10px",
    borderRadius: 20,
  },
  setupSubtitle: {
    fontSize: 14,
    color: "var(--text-muted)",
    marginBottom: 28,
  },
  filterGroup: {
    marginBottom: 18,
  },
  filterLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    marginBottom: 8,
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    background: "var(--bg)",
    border: "1px solid var(--border-2)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text)",
    fontSize: 14.5,
    outline: "none",
    cursor: "pointer",
  },
  previewCount: {
    fontSize: 13,
    color: "var(--text-muted)",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    padding: "9px 14px",
    borderRadius: "var(--radius-sm)",
    marginBottom: 22,
    textAlign: "center",
  },
  primaryBtn: {
    width: "100%",
    padding: "13px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  secondaryBtn: {
    flex: 1,
    padding: "12px",
    background: "var(--surface-2)",
    color: "var(--text-muted)",
    border: "1px solid var(--border-2)",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressTrack: {
    width: "100%",
    height: 3,
    background: "var(--border)",
    borderRadius: 2,
    marginBottom: 22,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "var(--accent)",
    borderRadius: 2,
    transition: "width 0.4s ease",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    margin: "24px 0",
  },
  summaryBox: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "18px 14px",
    textAlign: "center",
  },
  summaryActions: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};