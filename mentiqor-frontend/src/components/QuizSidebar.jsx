const STATUS_CLASS = {
  current:     'current',
  answered:    'answered',
  skipped:     'skipped',
  unattempted: 'unattempted',
};

const LEGEND = [
  { key: 'answered',    label: 'Answered',    color: 'var(--status-answered)' },
  { key: 'skipped',     label: 'Skipped',     color: 'var(--status-marked)' },
  { key: 'unattempted', label: 'Not attempted', color: 'var(--status-not-visited)' },
];

export default function QuizSidebar({ questions, currentIndex, answers, skipped, timeLeft, onNavigate, onSubmit, onExpire }) {
  const answered    = Object.keys(answers).length;
  const skippedCnt  = skipped.size;
  const unattempted = questions.length - answered - skippedCnt;

  // Timer logic
  const h   = Math.floor(timeLeft / 3600);
  const m   = Math.floor((timeLeft % 3600) / 60);
  const s   = timeLeft % 60;
  const fmt = (n) => String(n).padStart(2, '0');
  const display = h > 0 ? `${fmt(h)}:${fmt(m)}:${fmt(s)}` : `${fmt(m)}:${fmt(s)}`;
  const timerClass = timeLeft <= 120 ? 'danger' : timeLeft <= 300 ? 'warning' : 'safe';

  const getStatus = (i) => {
    if (i === currentIndex)         return 'current';
    if (answers[i] !== undefined)   return 'answered';
    if (skipped.has(i))             return 'skipped';
    return 'unattempted';
  };

  const counts = {
    answered:    answered,
    skipped:     skippedCnt,
    unattempted: unattempted,
  };

  return (
    <div className="quiz-sidebar">
      {/* Timer */}
      <div className="timer-card">
        <div className="timer-label">Time Remaining</div>
        <div className={`timer-display ${timerClass}`}>{display}</div>
      </div>

      {/* Legend */}
      <div className="quiz-legend">
        {LEGEND.map(({ key, label, color }) => (
          <div key={key} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            <span>{label}</span>
            <span className="legend-count" style={{ color }}>{counts[key]}</span>
          </div>
        ))}
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--accent)' }} />
          <span>Current</span>
          <span className="legend-count" style={{ color: 'var(--accent)' }}>Q{currentIndex + 1}</span>
        </div>
      </div>

      {/* Q grid */}
      <div className="q-grid-container">
        <div className="q-grid-label">Questions</div>
        <div className="q-grid">
          {questions.map((_, i) => (
            <button
              key={i}
              className={`q-num-btn ${STATUS_CLASS[getStatus(i)]}`}
              onClick={() => onNavigate(i)}
              title={`Question ${i + 1} — ${getStatus(i)}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button className="sidebar-submit" onClick={onSubmit}>
        Submit Quiz
      </button>
    </div>
  );
}