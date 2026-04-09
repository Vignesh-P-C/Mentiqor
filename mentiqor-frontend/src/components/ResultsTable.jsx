import { useState } from 'react';

const MARK_VAL  = { correct: 4, incorrect: -1, skipped: 0, unattempted: 0 };
const MARK_DISP = { correct: '+4', incorrect: '−1', skipped: '0', unattempted: '0' };

const STATUS_META = {
  correct:     { label: '✓ Correct',        colorClass: 'text-success', bgClass: 'answered' },
  incorrect:   { label: '✗ Incorrect',       colorClass: 'text-error',   bgClass: 'incorrect' },
  skipped:     { label: '⏭ Skipped',        colorClass: 'text-marked',  bgClass: 'skipped' },
  unattempted: { label: '— Not attempted',   colorClass: 'text-muted',   bgClass: 'unattempted' },
};

export default function ResultsTable({ results, onRetry, onDashboard }) {
  const [open, setOpen] = useState({});

  const correct     = results.filter(r => r.status === 'correct').length;
  const incorrect   = results.filter(r => r.status === 'incorrect').length;
  const skipped     = results.filter(r => r.status === 'skipped').length;
  const unattempted = results.filter(r => r.status === 'unattempted').length;
  const attempted   = correct + incorrect;
  const totalMarks  = results.reduce((s, r) => s + MARK_VAL[r.status], 0);
  const accuracy    = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  const toggle = (i) => setOpen(o => ({ ...o, [i]: !o[i] }));

  return (
    <div className="fade-up">
      {/* Banner */}
      <div className="results-banner">
        <div className="flex items-center gap-6">
          <div>
            <div className={`results-score ${totalMarks >= 0 ? 'positive' : 'negative'}`}>
              {totalMarks >= 0 ? '+' : ''}{totalMarks}
              <span className="results-score-unit">marks</span>
            </div>
          </div>
          <div>
            <div className="results-info-title">Quiz Complete</div>
            <div className="results-info-sub">
              {results.length} questions · {accuracy}% accuracy on attempted
            </div>
          </div>
        </div>

        <div className="results-stats">
          {[
            { v: correct,     l: 'Correct',  c: 'var(--status-answered)' },
            { v: incorrect,   l: 'Wrong',    c: 'var(--status-unanswered)' },
            { v: skipped,     l: 'Skipped',  c: 'var(--status-marked)' },
            { v: unattempted, l: 'Missed',   c: 'var(--text-muted)' },
          ].map(({ v, l, c }) => (
            <div key={l} className="results-stat-chip">
              <span className="results-stat-num" style={{ color: c }}>{v}</span>
              <span className="results-stat-label">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <button className="btn btn--primary" onClick={onRetry}>Retry Quiz</button>
        <button className="btn btn--secondary" onClick={onDashboard}>View Dashboard</button>
      </div>

      {/* Results list */}
      <div className="results-list">
        {results.map((r, i) => {
          const meta = STATUS_META[r.status];
          const markVal = MARK_VAL[r.status];
          const markColor = markVal > 0
            ? 'var(--status-answered)'
            : markVal < 0 ? 'var(--status-unanswered)' : 'var(--text-muted)';
          const isOpen = !!open[i];

          return (
            <div key={i} className={`result-row ${r.status} ${isOpen ? 'open' : ''}`}>
              <div className="result-row-header" onClick={() => toggle(i)}>
                <div className="flex items-start gap-3 flex-1" style={{ minWidth: 0 }}>
                  <span className="result-q-badge">Q{i + 1}</span>
                  <span className="result-q-text">{r.question.question}</span>
                </div>
                <div className="result-right">
                  <span
                    className="result-status-badge"
                    style={{
                      color: `var(--status-${r.status === 'correct' ? 'answered' : r.status === 'incorrect' ? 'unanswered' : r.status === 'skipped' ? 'marked' : 'not-visited'})`,
                      background: `var(--status-${r.status === 'correct' ? 'answered' : r.status === 'incorrect' ? 'unanswered' : r.status === 'skipped' ? 'marked' : 'not-visited'}-bg)`,
                    }}
                  >
                    {meta.label}
                  </span>
                  <span className="result-marks-badge" style={{ color: markColor }}>
                    {MARK_DISP[r.status]}
                  </span>
                  <span className="result-chevron">▼</span>
                </div>
              </div>

              {isOpen && (
                <div className="result-detail">
                  <div className="result-answer-grid">
                    <div className="result-answer-block">
                      <label>Your answer</label>
                      <span style={{ color: r.status === 'correct' ? 'var(--status-answered)' : r.status === 'incorrect' ? 'var(--status-unanswered)' : 'var(--text-muted)' }}>
                        {r.userAnswer
                          ? `${r.userAnswer} — ${r.question[`option_${r.userAnswer.toLowerCase()}`]}`
                          : '—'}
                      </span>
                    </div>
                    {r.status === 'incorrect' && (
                      <div className="result-answer-block">
                        <label>Correct answer</label>
                        <span style={{ color: 'var(--status-answered)' }}>
                          {r.correctAnswer} — {r.question[`option_${r.correctAnswer.toLowerCase()}`]}
                        </span>
                      </div>
                    )}
                  </div>
                  {r.explanation && (
                    <div className="result-explanation">
                      <span className="result-explanation-label">Explanation</span>
                      <p className="result-explanation-text">{r.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}