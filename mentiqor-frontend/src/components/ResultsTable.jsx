import { useState } from 'react';

const MARKS = { correct: '+4', incorrect: '−1', skipped: '0', unattempted: '0' };
const MARK_VAL = { correct: 4, incorrect: -1, skipped: 0, unattempted: 0 };

export default function ResultsTable({ results, onRetry, onDashboard }) {
  const [open, setOpen] = useState({});

  const correct     = results.filter(r => r.status === 'correct').length;
  const incorrect   = results.filter(r => r.status === 'incorrect').length;
  const skipped     = results.filter(r => r.status === 'skipped').length;
  const unattempted = results.filter(r => r.status === 'unattempted').length;
  const totalMarks  = results.reduce((s, r) => s + MARK_VAL[r.status], 0);
  const accuracy    = results.length > 0
    ? Math.round((correct / results.filter(r => r.status !== 'unattempted').length || 1) * 100)
    : 0;

  const statusColor = {
    correct:     'var(--success)',
    incorrect:   'var(--error)',
    skipped:     'var(--warning)',
    unattempted: 'var(--text-muted)',
  };
  const statusBg = {
    correct:     'var(--success-bg)',
    incorrect:   'var(--error-bg)',
    skipped:     'var(--warning-bg)',
    unattempted: 'var(--surface-3)',
  };
  const statusLabel = {
    correct: '✓ Correct', incorrect: '✗ Wrong',
    skipped: '⏭ Skipped', unattempted: '— Not attempted',
  };

  return (
    <div className="fade-up">
      {/* Summary banner */}
      <div style={S.banner}>
        <div style={S.bannerLeft}>
          <div style={S.bigScore} data-color={totalMarks >= 0 ? 'pos' : 'neg'}>
            {totalMarks >= 0 ? '+' : ''}{totalMarks}
            <span style={S.bigScoreLabel}>marks</span>
          </div>
          <div>
            <div style={S.bannerTitle}>Quiz Complete</div>
            <div style={S.bannerSub}>{results.length} questions · {accuracy}% accuracy on attempted</div>
          </div>
        </div>
        <div style={S.bannerStats}>
          {[
            { v: correct,     l: 'Correct',     c: 'var(--success)' },
            { v: incorrect,   l: 'Wrong',        c: 'var(--error)' },
            { v: skipped,     l: 'Skipped',      c: 'var(--warning)' },
            { v: unattempted, l: 'Not Attempted', c: 'var(--text-muted)' },
          ].map(({ v, l, c }) => (
            <div key={l} style={S.statChip}>
              <span style={{ ...S.statNum, color: c }}>{v}</span>
              <span style={S.statLabel}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={S.actions}>
        <button style={S.btnPrimary} onClick={onRetry}>Retry Quiz</button>
        <button style={S.btnSecondary} onClick={onDashboard}>View Dashboard</button>
      </div>

      {/* Results list */}
      <div style={S.list}>
        {results.map((r, i) => (
          <div key={i} style={{ ...S.row, borderLeft: `3px solid ${statusColor[r.status]}` }}>
            <div style={S.rowTop} onClick={() => setOpen(o => ({ ...o, [i]: !o[i] }))}>
              <div style={S.rowLeft}>
                <span style={S.qNum}>Q{i + 1}</span>
                <span style={S.qText}>{r.question.question}</span>
              </div>
              <div style={S.rowRight}>
                <span style={{ ...S.statusBadge, color: statusColor[r.status], background: statusBg[r.status] }}>
                  {statusLabel[r.status]}
                </span>
                <span style={{ ...S.marksBadge, color: MARK_VAL[r.status] > 0 ? 'var(--success)' : MARK_VAL[r.status] < 0 ? 'var(--error)' : 'var(--text-muted)' }}>
                  {MARKS[r.status]}
                </span>
                <span style={S.chevron}>{open[i] ? '▲' : '▼'}</span>
              </div>
            </div>

            {open[i] && (
              <div style={S.detail}>
                <div style={S.detailGrid}>
                  <div>
                    <span style={S.detailLabel}>Your answer</span>
                    <span style={{ ...S.detailVal, color: r.status === 'correct' ? 'var(--success)' : r.status === 'incorrect' ? 'var(--error)' : 'var(--text-muted)' }}>
                      {r.userAnswer ? `${r.userAnswer} — ${r.question[`option_${r.userAnswer.toLowerCase()}`]}` : '—'}
                    </span>
                  </div>
                  {r.status === 'incorrect' && (
                    <div>
                      <span style={S.detailLabel}>Correct answer</span>
                      <span style={{ ...S.detailVal, color: 'var(--success)' }}>
                        {r.correctAnswer} — {r.question[`option_${r.correctAnswer.toLowerCase()}`]}
                      </span>
                    </div>
                  )}
                </div>
                {r.explanation && (
                  <div style={S.explanation}>
                    <span style={S.explLabel}>Explanation</span>
                    <p style={S.explText}>{r.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const S = {
  banner: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '24px',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
  },
  bannerLeft: { display: 'flex', alignItems: 'center', gap: 20 },
  bigScore: {
    fontFamily: 'monospace',
    fontSize: 36,
    fontWeight: 800,
    color: 'var(--accent-2)',
    lineHeight: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  bigScoreLabel: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', marginTop: 3 },
  bannerTitle: { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  bannerSub:   { fontSize: 13, color: 'var(--text-muted)', marginTop: 3 },
  bannerStats: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  statChip: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '10px 14px',
    textAlign: 'center',
    minWidth: 70,
  },
  statNum:   { display: 'block', fontSize: 20, fontWeight: 700, fontFamily: 'monospace' },
  statLabel: { display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },
  actions: { display: 'flex', gap: 10, marginBottom: 16 },
  btnPrimary: {
    padding: '10px 22px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '10px 22px',
    background: 'var(--surface)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-2)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  rowTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '13px 16px',
    cursor: 'pointer',
    gap: 12,
  },
  rowLeft:  { display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 },
  rowRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  qNum: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-muted)',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    padding: '2px 8px',
    borderRadius: 4,
  },
  qText: { fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5, flex: 1 },
  statusBadge: {
    fontSize: 11.5,
    fontWeight: 600,
    padding: '3px 9px',
    borderRadius: 5,
    whiteSpace: 'nowrap',
  },
  marksBadge: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  chevron: { fontSize: 10, color: 'var(--text-dim)' },
  detail: {
    padding: '0 16px 16px',
    borderTop: '1px solid var(--border)',
    paddingTop: 14,
  },
  detailGrid: { display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 },
  detailLabel: {
    display: 'block',
    fontSize: 10.5,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 4,
  },
  detailVal: { fontSize: 13.5, fontWeight: 500 },
  explanation: {
    background: 'var(--surface-2)',
    borderLeft: '3px solid var(--accent)',
    borderRadius: '0 7px 7px 0',
    padding: '10px 13px',
  },
  explLabel: {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--accent-2)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: 5,
  },
  explText: { fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 },
};