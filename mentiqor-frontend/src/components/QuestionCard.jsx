export default function QuestionCard({ question, index, total }) {
  return (
    <div style={S.card}>
      <div style={S.meta}>
        <div style={S.tags}>
          <span style={S.subject}>{question.subject}</span>
          <span style={S.sep}>›</span>
          <span style={S.chapter}>{question.chapter}</span>
        </div>
        <span style={S.counter}>Q{index + 1} / {total}</span>
      </div>
      <p style={S.text}>{question.question}</p>
    </div>
  );
}

const S = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '13px',
    padding: '22px 22px 20px',
    marginBottom: 12,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  tags: { display: 'flex', alignItems: 'center', gap: 5 },
  subject: {
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 20,
    background: 'var(--accent-bg)',
    color: 'var(--accent-2)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sep:     { color: 'var(--text-dim)', fontSize: 12 },
  chapter: { fontSize: 12, color: 'var(--text-muted)' },
  counter: {
    fontSize: 12,
    color: 'var(--text-muted)',
    background: 'var(--surface-2)',
    padding: '3px 10px',
    borderRadius: 20,
    border: '1px solid var(--border)',
  },
  text: { fontSize: 16, lineHeight: 1.7, color: 'var(--text)', fontWeight: 400 },
};