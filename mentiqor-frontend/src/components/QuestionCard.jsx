export default function QuestionCard({ question }) {
  return (
    <div style={S.card} className="animate-in">
      <div style={S.tags}>
        <span style={S.subjectTag}>{question.subject}</span>
        <span style={S.separator}>›</span>
        <span style={S.chapterTag}>{question.chapter}</span>
      </div>
      <p style={S.text}>{question.question}</p>
    </div>
  );
}

const S = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "24px",
    marginBottom: 14,
  },
  tags: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  subjectTag: {
    fontSize: 11.5,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
    background: "var(--accent-bg)",
    color: "var(--accent-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  separator: {
    color: "var(--text-dim)",
    fontSize: 13,
  },
  chapterTag: {
    fontSize: 12,
    color: "var(--text-muted)",
  },
  text: {
    fontSize: 16.5,
    lineHeight: 1.65,
    color: "var(--text)",
    fontWeight: 400,
  },
};