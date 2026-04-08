import Timer from './Timer';

const STATUS = {
  current:     { bg: 'var(--accent)',      color: '#fff',           border: 'var(--accent)' },
  answered:    { bg: 'var(--accent-bg)',   color: 'var(--accent-2)', border: 'var(--accent)' },
  skipped:     { bg: 'var(--warning-bg)',  color: 'var(--warning)',  border: 'var(--warning)' },
  unattempted: { bg: 'transparent',        color: 'var(--text-muted)', border: 'var(--border-2)' },
};

export default function QuizSidebar({ questions, currentIndex, answers, skipped, timeLeft, onNavigate, onSubmit, onExpire }) {
  const answered   = Object.keys(answers).length;
  const skippedCnt = skipped.size;
  const total      = questions.length;
  const unattempted = total - answered - skippedCnt;

  const getStatus = (i) => {
    if (i === currentIndex) return 'current';
    if (answers[i] !== undefined) return 'answered';
    if (skipped.has(i)) return 'skipped';
    return 'unattempted';
  };

  return (
    <div style={S.sidebar}>
      {/* Timer */}
      <div style={S.timerCard}>
        <Timer seconds={timeLeft} onExpire={onExpire} />
      </div>

      {/* Legend */}
      <div style={S.legend}>
        {[
          { label: `${answered} Answered`,    color: 'var(--accent-2)' },
          { label: `${skippedCnt} Skipped`,   color: 'var(--warning)' },
          { label: `${unattempted} Pending`,  color: 'var(--text-muted)' },
        ].map(({ label, color }) => (
          <span key={label} style={{ ...S.legendItem, color }}>{label}</span>
        ))}
      </div>

      {/* Question grid */}
      <div style={S.grid}>
        {questions.map((_, i) => {
          const st = getStatus(i);
          const { bg, color, border } = STATUS[st];
          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              style={{ ...S.qBtn, background: bg, color, border: `1px solid ${border}` }}
              title={`Question ${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Submit */}
      <button style={S.submitBtn} onClick={onSubmit}>
        Submit Quiz
      </button>
    </div>
  );
}

const S = {
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    position: 'sticky',
    top: 76,
  },
  timerCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '18px 14px',
    textAlign: 'center',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  legendItem: {
    fontSize: 11.5,
    fontWeight: 600,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    padding: '3px 9px',
    borderRadius: 20,
  },
  grid: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '14px',
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 6,
    maxHeight: '340px',
    overflowY: 'auto',
  },
  qBtn: {
    padding: '7px 4px',
    borderRadius: '6px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.12s',
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '9px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.2px',
  },
};