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

  // --- Input validation ---
  if (!user_id || !question_id || !selected) {
    return res.status(400).json({ error: 'user_id, question_id, and selected are required.' });
  }

  const validOptions = ['A', 'B', 'C', 'D'];
  if (!validOptions.includes(selected.toUpperCase())) {
    return res.status(400).json({ error: 'selected must be A, B, C, or D.' });
  }

  const selectedUpper = selected.toUpperCase();

  try {
    // --- Step 1: Fetch the question ---
    const qResult = await pool.query(
      'SELECT correct, explanation FROM questions WHERE id = $1',
      [question_id]
    );

    if (qResult.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const { correct, explanation } = qResult.rows[0];
    const is_correct = selectedUpper === correct;

    // --- Step 2: Save the attempt ---
    await pool.query(
      `INSERT INTO attempts (user_id, question_id, selected, is_correct)
       VALUES ($1, $2, $3, $4)`,
      [user_id, question_id, selectedUpper, is_correct]
    );

    // --- Step 3: Return instant feedback ---
    res.json({
      is_correct,
      correct_option: correct,
      explanation: explanation || null,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));