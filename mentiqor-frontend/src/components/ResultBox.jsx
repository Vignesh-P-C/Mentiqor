export default function ResultBox({ result, onNext, isLast }) {
  const { is_correct, correct_option, marks_awarded, explanation } = result;

  return (
    <div style={S.container} className="animate-in">
      <div style={S.topRow}>
        <span style={is_correct ? S.correctBadge : S.incorrectBadge}>
          {is_correct ? "✓  Correct" : "✗  Incorrect"}
        </span>
        <span style={{ ...S.marksBadge, color: marks_awarded > 0 ? "var(--success)" : "var(--error)" }}>
          {marks_awarded > 0 ? "+" : ""}{marks_awarded} marks
        </span>
      </div>

      {!is_correct && (
        <p style={S.correctAnswer}>
          Correct answer: <strong style={{ color: "var(--success)" }}>{correct_option}</strong>
        </p>
      )}

      {explanation && (
        <div style={S.explanation}>
          <span style={S.explLabel}>Explanation</span>
          <p style={S.explText}>{explanation}</p>
        </div>
      )}

      <button style={S.nextBtn} onClick={onNext}>
        {isLast ? "Finish Quiz →" : "Next Question →"}
      </button>
    </div>
  );
}

const S = {
  container: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "20px 22px",
    marginTop: 6,
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  correctBadge: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--success)",
    background: "var(--success-bg)",
    padding: "5px 13px",
    borderRadius: 6,
  },
  incorrectBadge: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--error)",
    background: "var(--error-bg)",
    padding: "5px 13px",
    borderRadius: 6,
  },
  marksBadge: {
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "monospace",
  },
  correctAnswer: {
    fontSize: 13.5,
    color: "var(--text-muted)",
    marginBottom: 14,
  },
  explanation: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderLeft: "3px solid var(--accent)",
    borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
    padding: "12px 14px",
    marginBottom: 16,
  },
  explLabel: {
    display: "block",
    fontSize: 10.5,
    fontWeight: 600,
    color: "var(--accent-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    marginBottom: 6,
  },
  explText: {
    fontSize: 13.5,
    color: "var(--text-2)",
    lineHeight: 1.65,
  },
  nextBtn: {
    width: "100%",
    padding: "12px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontSize: 14.5,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
};