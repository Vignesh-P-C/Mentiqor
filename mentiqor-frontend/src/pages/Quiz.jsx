import { useEffect, useState, useMemo, useRef } from 'react';
import { fetchQuestions, submitAnswer, saveSession } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import Options      from '../components/Options';
import QuizSidebar  from '../components/QuizSidebar';
import ResultsTable from '../components/ResultsTable';

// ── Helpers ──────────────────────────────────────────────────
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const spreadAcross = (questions, limit) => {
  if (questions.length === 0) return [];
  const byChapter = {};
  questions.forEach(q => {
    (byChapter[q.chapter] = byChapter[q.chapter] || []).push(q);
  });
  const chapters  = Object.values(byChapter);
  const perChapter = Math.ceil(limit / chapters.length);
  const result = chapters.flatMap(qs => shuffle(qs).slice(0, perChapter));
  return shuffle(result).slice(0, limit);
};

const smartSelect = (all, subject, selectedChapters) => {
  if (subject === 'All') {
    // 25 per subject
    const bySubject = {};
    all.forEach(q => (bySubject[q.subject] = bySubject[q.subject] || []).push(q));
    return shuffle(Object.values(bySubject).flatMap(qs => spreadAcross(qs, 25)));
  }
  const subjectQs = all.filter(q => q.subject === subject);
  if (selectedChapters.length === 0) {
    return spreadAcross(subjectQs, 75);
  }
  const filtered = subjectQs.filter(q => selectedChapters.includes(q.chapter));
  const limit     = Math.min(filtered.length, selectedChapters.length * 25);
  return spreadAcross(filtered, limit);
};

const RECOMMENDED_SECS = { Mathematics: 180, Physics: 150, Chemistry: 120 };

const getRecommendedTime = (questions) => {
  if (questions.length === 0) return 0;
  const subjects = [...new Set(questions.map(q => q.subject))];
  if (subjects.length === 1) {
    return questions.length * (RECOMMENDED_SECS[subjects[0]] || 150);
  }
  const total = questions.reduce((s, q) => s + (RECOMMENDED_SECS[q.subject] || 150), 0);
  return Math.round(total);
};

const fmtTime = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}h ${m}m`
    : `${m}m ${String(sec).padStart(2,'0')}s`;
};

const STAGE = { SETUP: 'setup', QUIZ: 'quiz', RESULTS: 'results' };

// ── Component ─────────────────────────────────────────────────
export default function Quiz({ userId, onNavigate }) {
  const [all, setAll]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [stage, setStage]   = useState(STAGE.SETUP);

  // Setup filters
  const [subject, setSubject]         = useState('All');
  const [selChapters, setSelChapters] = useState([]);
  const [customTime, setCustomTime]   = useState(null); // null = use recommended

  // Active quiz
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex]       = useState(0);
  const [answers, setAnswers]     = useState({});  // { index: 'A'|'B'|'C'|'D' }
  const [skipped, setSkipped]     = useState(new Set());
  const [timeLeft, setTimeLeft]   = useState(0);
  const timerRef = useRef(null);

  // Warning modal
  const [showWarning, setShowWarning] = useState(false);

  // Results
  const [results, setResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // ── Load questions ──
  useEffect(() => {
    fetchQuestions()
      .then(setAll)
      .catch(() => setError('Could not reach backend. Make sure the server is running.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived ──
  const subjects = useMemo(
    () => ['All', ...[...new Set(all.map(q => q.subject))].sort()],
    [all]
  );
  const chapters = useMemo(() => {
    if (subject === 'All') return [];
    return [...new Set(all.filter(q => q.subject === subject).map(q => q.chapter))].sort();
  }, [all, subject]);

  const previewQs = useMemo(
    () => smartSelect(all, subject, selChapters),
    [all, subject, selChapters]
  );
  const recommended = useMemo(() => getRecommendedTime(previewQs), [previewQs]);

  // ── Timer ──
  useEffect(() => {
    if (stage !== STAGE.QUIZ) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAutoSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [stage]);

  // ── Start quiz ──
  const startQuiz = () => {
    const qs   = smartSelect(all, subject, selChapters);
    const time = customTime !== null ? customTime : recommended;
    setQuestions(qs);
    setQIndex(0);
    setAnswers({});
    setSkipped(new Set());
    setTimeLeft(time);
    setResults([]);
    setStage(STAGE.QUIZ);
  };

  // ── Select answer ──
  const handleSelect = (option) => {
    setAnswers(a => ({ ...a, [qIndex]: option }));
    const newSkipped = new Set(skipped);
    newSkipped.delete(qIndex);
    setSkipped(newSkipped);
  };

  // ── Skip ──
  const handleSkip = () => {
    const newSkipped = new Set(skipped);
    newSkipped.add(qIndex);
    const newAnswers = { ...answers };
    delete newAnswers[qIndex];
    setAnswers(newAnswers);
    setSkipped(newSkipped);
    goNext();
  };

  const goNext = () => { if (qIndex < questions.length - 1) setQIndex(i => i + 1); };
  const goPrev = () => { if (qIndex > 0) setQIndex(i => i - 1); };

  // ── Submit ──
  const unanswered = useMemo(
    () => questions.map((_, i) => i).filter(i => answers[i] === undefined && !skipped.has(i)),
    [questions, answers, skipped]
  );

  const handleSubmitClick = () => {
    if (unanswered.length > 0) { setShowWarning(true); return; }
    doSubmit();
  };

  const handleAutoSubmit = () => {
    setShowWarning(false);
    doSubmit();
  };

  const doSubmit = async () => {
    clearInterval(timerRef.current);
    setShowWarning(false);
    setSubmitting(true);

    const results = [];
    for (let i = 0; i < questions.length; i++) {
      const q          = questions[i];
      const userAnswer = answers[i];
      const isSkipped  = skipped.has(i);

      if (userAnswer) {
        try {
          const res = await submitAnswer({ user_id: userId, question_id: q.id, selected: userAnswer });
          results.push({
            question:      q,
            userAnswer,
            correctAnswer: res.correct_option,
            explanation:   res.explanation,
            marks:         res.marks_awarded,
            status:        res.is_correct ? 'correct' : 'incorrect',
          });
        } catch {
          results.push({ question: q, userAnswer, correctAnswer: '?', explanation: null, marks: -1, status: 'incorrect' });
        }
      } else {
        results.push({
          question:      q,
          userAnswer:    null,
          correctAnswer: null,
          explanation:   null,
          marks:         0,
          status:        isSkipped ? 'skipped' : 'unattempted',
        });
      }
    }

    // Save session
    const correct   = results.filter(r => r.status === 'correct').length;
    const attempted = results.filter(r => r.status === 'correct' || r.status === 'incorrect').length;
    const marks     = results.reduce((s, r) => s + (r.marks || 0), 0);
    const accuracy  = attempted > 0 ? parseFloat(((correct / attempted) * 100).toFixed(2)) : 0;
    const elapsed   = (customTime || recommended) - timeLeft;

    try {
      await saveSession({
        user_id:             userId,
        subject:             subject,
        chapters:            selChapters.join(', ') || subject,
        total_questions:     questions.length,
        attempted,
        correct,
        marks,
        accuracy_percent:    accuracy,
        time_taken_seconds:  elapsed,
      });
    } catch { /* non-fatal */ }

    setResults(results);
    setSubmitting(false);
    setStage(STAGE.RESULTS);
  };

  const handleChapterToggle = (ch) => {
    setSelChapters(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  // ── Render ──
  if (loading) return (
    <div style={SC.center}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', marginTop: 14, fontSize: 14 }}>Loading questions...</p>
    </div>
  );

  if (error) return (
    <div style={SC.center}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
      <p style={{ color: 'var(--error)', textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>{error}</p>
    </div>
  );

  // ── SETUP ──
  if (stage === STAGE.SETUP) {
    const effTime = customTime !== null ? customTime : recommended;
    return (
      <div style={{ maxWidth: 580, margin: '0 auto' }} className="fade-up">
        <div style={SC.card}>
          <div style={SC.setupHeader}>
            <h2 style={SC.title}>Start Practice</h2>
            <span style={SC.badge}>{all.length} questions</span>
          </div>
          <p style={SC.sub}>Filter by subject and chapters, or attempt all questions.</p>

          {/* Subject */}
          <div style={SC.field}>
            <label style={SC.label}>Subject</label>
            <select style={SC.select} value={subject}
              onChange={e => { setSubject(e.target.value); setSelChapters([]); }}>
              {subjects.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Chapters (only when a specific subject is selected) */}
          {subject !== 'All' && chapters.length > 0 && (
            <div style={SC.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={SC.label}>Chapters ({selChapters.length === 0 ? 'all' : selChapters.length + ' selected'})</label>
                <span style={SC.linkBtn}
                  onClick={() => setSelChapters(selChapters.length === chapters.length ? [] : [...chapters])}>
                  {selChapters.length === chapters.length ? 'Deselect all' : 'Select all'}
                </span>
              </div>
              <div style={SC.chapterGrid}>
                {chapters.map(ch => {
                  const isChecked = selChapters.includes(ch);
                  return (
                    <label key={ch} style={{ ...SC.chapterChip, ...(isChecked ? SC.chapterChipActive : {}) }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleChapterToggle(ch)}
                        style={{ display: 'none' }}
                      />
                      {ch}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time selection */}
          <div style={SC.field}>
            <label style={SC.label}>Time Limit</label>
            <div style={SC.timeOptions}>
              {[
                { label: `Recommended (${fmtTime(recommended)})`, value: null },
                { label: '30 min', value: 30 * 60 },
                { label: '1 hour', value: 60 * 60 },
                { label: '1.5 hours', value: 90 * 60 },
                { label: '2 hours', value: 120 * 60 },
                { label: '3 hours', value: 180 * 60 },
              ].map(opt => (
                <label key={opt.label} style={{ ...SC.timeChip, ...(customTime === opt.value ? SC.timeChipActive : {}) }}>
                  <input
                    type="radio"
                    name="time"
                    checked={customTime === opt.value}
                    onChange={() => setCustomTime(opt.value)}
                    style={{ display: 'none' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div style={SC.timeHint}>
              Recommended: Math 3 min/q · Physics 2.5 min/q · Chemistry 2 min/q
            </div>
          </div>

          <div style={SC.preview}>
            <span style={{ color: 'var(--accent-2)', fontWeight: 700 }}>{previewQs.length}</span>
            &nbsp;questions · &nbsp;
            <span style={{ color: 'var(--text-muted)' }}>{fmtTime(effTime)} time limit</span>
            &nbsp;· Shuffled
          </div>

          <button
            style={{ ...SC.primaryBtn, opacity: previewQs.length === 0 ? 0.45 : 1 }}
            onClick={startQuiz}
            disabled={previewQs.length === 0}
          >
            Start Quiz →
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (stage === STAGE.RESULTS) {
    return (
      <ResultsTable
        results={results}
        onRetry={startQuiz}
        onDashboard={() => onNavigate('dashboard')}
      />
    );
  }

  // ── QUIZ ──
  const currentQ = questions[qIndex];

  return (
    <div>
      {/* Submit warning modal */}
      {showWarning && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⚠️ Unanswered Questions</h3>
            <p>
              You have {unanswered.length} question{unanswered.length !== 1 ? 's' : ''} you haven't
              answered or skipped. Submitting now will give 0 marks for these.
            </p>
            <div className="modal-q-list">
              {unanswered.map(i => (
                <span key={i} className="modal-q-chip"
                  onClick={() => { setShowWarning(false); setQIndex(i); }}
                  style={{ cursor: 'pointer' }}>
                  Q{i + 1}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Click a question number to go to it, or submit anyway.
            </p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={doSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Anyway'}
              </button>
              <button className="btn-secondary" onClick={() => setShowWarning(false)}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div style={SC.quizLayout}>
        {/* Left: question + options + nav */}
        <div>
          <QuestionCard question={currentQ} index={qIndex} total={questions.length} />

          <Options
            question={currentQ}
            selected={answers[qIndex]}
            onSelect={handleSelect}
            disabled={submitting}
          />

          {/* Navigation buttons */}
          <div style={SC.navRow}>
            <button
              style={{ ...SC.navBtn, opacity: qIndex === 0 ? 0.4 : 1 }}
              onClick={goPrev}
              disabled={qIndex === 0}
            >
              ← Previous
            </button>
            <button style={SC.skipBtn} onClick={handleSkip}>
              Skip
            </button>
            <button
              style={{ ...SC.navBtnPrimary, opacity: qIndex === questions.length - 1 ? 0.45 : 1 }}
              onClick={goNext}
              disabled={qIndex === questions.length - 1}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Right: sidebar */}
        <QuizSidebar
          questions={questions}
          currentIndex={qIndex}
          answers={answers}
          skipped={skipped}
          timeLeft={timeLeft}
          onNavigate={setQIndex}
          onSubmit={handleSubmitClick}
          onExpire={handleAutoSubmit}
        />
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const SC = {
  center: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', minHeight: '50vh',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '32px',
  },
  setupHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  title: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)' },
  badge: {
    fontSize: 12, color: 'var(--text-muted)',
    background: 'var(--surface-2)', border: '1px solid var(--border-2)',
    padding: '3px 11px', borderRadius: 20,
  },
  sub:   { fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 24 },
  field: { marginBottom: 22 },
  label: {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.6px', marginBottom: 8,
  },
  select: {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg)', border: '1px solid var(--border-2)',
    borderRadius: '8px', color: 'var(--text)', fontSize: 14.5, outline: 'none',
  },
  chapterGrid: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chapterChip: {
    padding: '6px 13px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border-2)',
    borderRadius: '7px',
    fontSize: 13,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.13s',
  },
  chapterChipActive: {
    background: 'var(--accent-bg)',
    border: '1px solid var(--accent)',
    color: 'var(--accent-2)',
    fontWeight: 600,
  },
  timeOptions: { display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 8 },
  timeChip: {
    padding: '6px 14px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border-2)',
    borderRadius: '7px',
    fontSize: 13,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    userSelect: 'none',
  },
  timeChipActive: {
    background: 'var(--accent-bg)',
    border: '1px solid var(--accent)',
    color: 'var(--accent-2)',
    fontWeight: 600,
  },
  timeHint: { fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 },
  preview: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--text-muted)',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    padding: '9px 14px',
    borderRadius: '8px',
    marginBottom: 20,
  },
  linkBtn: { fontSize: 12, color: 'var(--accent-2)', cursor: 'pointer' },
  primaryBtn: {
    width: '100%', padding: '13px',
    background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: '9px',
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
  },
  quizLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: 18,
    alignItems: 'start',
  },
  navRow: { display: 'flex', gap: 10, marginTop: 14 },
  navBtn: {
    flex: 1, padding: '11px',
    background: 'var(--surface)',
    border: '1px solid var(--border-2)',
    borderRadius: '9px',
    color: 'var(--text-muted)',
    fontSize: 14, fontWeight: 500,
    cursor: 'pointer',
  },
  skipBtn: {
    padding: '11px 20px',
    background: 'var(--warning-bg)',
    border: '1px solid rgba(245,158,11,0.3)',
    borderRadius: '9px',
    color: 'var(--warning)',
    fontSize: 14, fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  navBtnPrimary: {
    flex: 1, padding: '11px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: '9px',
    color: '#fff',
    fontSize: 14, fontWeight: 600,
    cursor: 'pointer',
  },
};