
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const pool = require('./db');
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
app.get('/', (req, res) => res.send('Mentiqor backend running'));

app.get('/ping-db', async (req, res) => {
  try {
    const r = await pool.query('SELECT NOW()');
    res.json({ success: true, time: r.rows[0].now });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ── Questions ─────────────────────────────────────────────────
app.get('/questions', async (req, res) => {
  const { subject, chapter } = req.query;
  let q = `SELECT id, question, option_a, option_b, option_c, option_d, subject, chapter
           FROM questions WHERE 1=1`;
  const p = [];
  if (subject) { p.push(subject); q += ` AND subject = $${p.length}`; }
  if (chapter) { p.push(chapter); q += ` AND chapter = $${p.length}`; }
  q += ' ORDER BY id ASC';
  try {
    const r = await pool.query(q, p);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Attempt ───────────────────────────────────────────────────
app.post('/attempt', async (req, res) => {
  const { user_id, question_id, selected } = req.body;
  if (!user_id || !question_id || !selected)
    return res.status(400).json({ error: 'user_id, question_id, and selected are required.' });

  const sel = selected.toUpperCase();
  if (!['A','B','C','D'].includes(sel))
    return res.status(400).json({ error: 'selected must be A, B, C, or D.' });

  try {
    const qr = await pool.query('SELECT correct, explanation FROM questions WHERE id = $1', [question_id]);
    if (!qr.rows.length) return res.status(404).json({ error: 'Question not found.' });

    const { correct, explanation } = qr.rows[0];
    const is_correct = sel === correct;
    const marks      = is_correct ? 4 : -1;

    await pool.query(
      `INSERT INTO attempts (user_id, question_id, selected, is_correct, marks) VALUES ($1,$2,$3,$4,$5)`,
      [user_id, question_id, sel, is_correct, marks]
    );

    res.json({ is_correct, correct_option: correct, marks_awarded: marks, explanation: explanation || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Stats ─────────────────────────────────────────────────────
app.get('/stats/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const [overall, bySubject] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total_attempted,
          SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS total_correct,
          SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END) AS total_incorrect,
          ROUND(100.0 * SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 2) AS accuracy_percent,
          SUM(marks) AS total_marks
         FROM attempts WHERE user_id = $1`, [user_id]
      ),
      pool.query(
        `SELECT q.subject, COUNT(*) AS attempted,
          SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) AS correct,
          ROUND(100.0 * SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 2) AS accuracy_percent,
          SUM(a.marks) AS total_marks
         FROM attempts a JOIN questions q ON a.question_id = q.id
         WHERE a.user_id = $1 GROUP BY q.subject ORDER BY q.subject`, [user_id]
      ),
    ]);

    const o = overall.rows[0];
    if (parseInt(o.total_attempted) === 0)
      return res.status(404).json({ error: 'No attempts found for this user.' });

    res.json({
      user_id,
      overall: {
        total_attempted:  parseInt(o.total_attempted),
        total_correct:    parseInt(o.total_correct),
        total_incorrect:  parseInt(o.total_incorrect),
        accuracy_percent: parseFloat(o.accuracy_percent) || 0,
        total_marks:      parseInt(o.total_marks) || 0,
      },
      by_subject: bySubject.rows.map(r => ({
        subject:          r.subject,
        attempted:        parseInt(r.attempted),
        correct:          parseInt(r.correct),
        accuracy_percent: parseFloat(r.accuracy_percent) || 0,
        total_marks:      parseInt(r.total_marks) || 0,
      })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Weak topics ───────────────────────────────────────────────
app.get('/weak-topics/:user_id', async (req, res) => {
  const { user_id }  = req.params;
  const threshold    = parseFloat(req.query.threshold) || 60.0;
  try {
    const r = await pool.query(
      `SELECT q.subject, q.chapter, COUNT(*) AS attempted,
        SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) AS correct,
        ROUND(100.0 * SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 2) AS accuracy_percent
       FROM attempts a JOIN questions q ON a.question_id = q.id
       WHERE a.user_id = $1
       GROUP BY q.subject, q.chapter
       HAVING ROUND(100.0 * SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0), 2) < $2
       ORDER BY accuracy_percent ASC`, [user_id, threshold]
    );
    res.json({
      user_id, threshold_percent: threshold,
      weak_topics: r.rows.map(row => ({
        subject:          row.subject,
        chapter:          row.chapter,
        attempted:        parseInt(row.attempted),
        correct:          parseInt(row.correct),
        accuracy_percent: parseFloat(row.accuracy_percent) || 0,
      })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Sessions ──────────────────────────────────────────────────
app.get('/sessions/:user_id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at ASC`,
      [req.params.user_id]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/session', async (req, res) => {
  const { user_id, subject, chapters, total_questions, attempted, correct, marks, accuracy_percent, time_taken_seconds } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required.' });
  try {
    const r = await pool.query(
      `INSERT INTO sessions (user_id, subject, chapters, total_questions, attempted, correct, marks, accuracy_percent, time_taken_seconds)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [user_id, subject, chapters, total_questions || 0, attempted || 0, correct || 0, marks || 0, accuracy_percent || 0, time_taken_seconds || 0]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Motivation Quote (proxy → zenquotes.io) ───────────────────
app.get('/quote', async (req, res) => {
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    const data = await response.json();
    if (!data || !data[0]) throw new Error('Empty response from quote API');
    res.json({ quote: data[0].q, author: data[0].a });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));