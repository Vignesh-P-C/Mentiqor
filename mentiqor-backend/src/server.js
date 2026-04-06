const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = require('./db'); // assuming this exports pool correctly

// Root route (optional but useful)
app.get('/', (req, res) => {
  res.send('Mentiqor backend running');
});

// 🔹 DB test route (keep this)
app.get('/ping-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/questions', async (req, res) => {
  const { subject, chapter } = req.query;

  let query = `
    SELECT id, question, option_a, option_b, option_c, option_d, subject, chapter
    FROM questions
    WHERE 1=1
  `;
  const params = [];

  if (subject) {
    params.push(subject);
    query += ` AND subject = $${params.length}`;
  }

  if (chapter) {
    params.push(chapter);
    query += ` AND chapter = $${params.length}`;
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/attempt', async (req, res) => {
  const { user_id, question_id, selected } = req.body;

  if (!user_id || !question_id || !selected) {
    return res.status(400).json({ error: 'user_id, question_id, and selected are required.' });
  }

  const validOptions = ['A', 'B', 'C', 'D'];
  if (!validOptions.includes(selected.toUpperCase())) {
    return res.status(400).json({ error: 'selected must be A, B, C, or D.' });
  }

  const selectedUpper = selected.toUpperCase();

  try {
    const qResult = await pool.query(
      'SELECT correct, explanation FROM questions WHERE id = $1',
      [question_id]
    );

    if (qResult.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const { correct, explanation } = qResult.rows[0];
    const is_correct = selectedUpper === correct;
    const marks = is_correct ? 4 : -1;   // JEE Mains marking scheme

    await pool.query(
      `INSERT INTO attempts (user_id, question_id, selected, is_correct, marks)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, question_id, selectedUpper, is_correct, marks]
    );

    res.json({
      is_correct,
      correct_option: correct,
      marks_awarded: marks,
      explanation: explanation || null,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/stats/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const overallResult = await pool.query(
      `SELECT
        COUNT(*) AS total_attempted,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS total_correct,
        SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END) AS total_incorrect,
        ROUND(
          100.0 * SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) / COUNT(*), 2
        ) AS accuracy_percent,
        SUM(marks) AS total_marks
       FROM attempts
       WHERE user_id = $1`,
      [user_id]
    );

    const subjectResult = await pool.query(
      `SELECT
        q.subject,
        COUNT(*) AS attempted,
        SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) AS correct,
        ROUND(
          100.0 * SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) / COUNT(*), 2
        ) AS accuracy_percent,
        SUM(a.marks) AS total_marks
       FROM attempts a
       JOIN questions q ON a.question_id = q.id
       WHERE a.user_id = $1
       GROUP BY q.subject`,
      [user_id]
    );

    const overall = overallResult.rows[0];

    if (parseInt(overall.total_attempted) === 0) {
      return res.status(404).json({ error: 'No attempts found for this user.' });
    }

    res.json({
      user_id,
      overall: {
        total_attempted: parseInt(overall.total_attempted),
        total_correct: parseInt(overall.total_correct),
        total_incorrect: parseInt(overall.total_incorrect),
        accuracy_percent: parseFloat(overall.accuracy_percent),
        total_marks: parseInt(overall.total_marks),
      },
      by_subject: subjectResult.rows.map(row => ({
        subject: row.subject,
        attempted: parseInt(row.attempted),
        correct: parseInt(row.correct),
        accuracy_percent: parseFloat(row.accuracy_percent),
        total_marks: parseInt(row.total_marks),
      })),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/weak-topics/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const threshold = parseFloat(req.query.threshold) || 60.0;

  try {
    const result = await pool.query(
      `SELECT
        q.subject,
        q.chapter,
        COUNT(*) AS attempted,
        SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) AS correct,
        ROUND(
          100.0 * SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) / COUNT(*), 2
        ) AS accuracy_percent
       FROM attempts a
       JOIN questions q ON a.question_id = q.id
       WHERE a.user_id = $1
       GROUP BY q.subject, q.chapter
       HAVING ROUND(
         100.0 * SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) / COUNT(*), 2
       ) < $2
       ORDER BY accuracy_percent ASC`,
      [user_id, threshold]
    );

    if (result.rows.length === 0) {
      return res.json({
        user_id,
        threshold_percent: threshold,
        weak_topics: [],
        message: 'No weak topics found. Keep it up!',
      });
    }

    res.json({
      user_id,
      threshold_percent: threshold,
      weak_topics: result.rows.map(row => ({
        subject: row.subject,
        chapter: row.chapter,
        attempted: parseInt(row.attempted),
        correct: parseInt(row.correct),
        accuracy_percent: parseFloat(row.accuracy_percent),
      })),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));