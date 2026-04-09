const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ok = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const fetchQuestions = ({ subject, chapter } = {}) => {
  const p = new URLSearchParams();
  if (subject && subject !== 'All') p.append('subject', subject);
  if (chapter && chapter !== 'All') p.append('chapter', chapter);
  return fetch(`${BASE}/questions?${p}`).then(ok);
};

export const submitAnswer = (payload) =>
  fetch(`${BASE}/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(ok);

export const fetchStats = (userId) =>
  fetch(`${BASE}/stats/${userId}`).then(ok);

export const fetchWeakTopics = (userId, threshold = 60) =>
  fetch(`${BASE}/weak-topics/${userId}?threshold=${threshold}`).then(ok);

export const fetchSessions = (userId) =>
  fetch(`${BASE}/sessions/${userId}`).then(ok);

export const saveSession = (payload) =>
  fetch(`${BASE}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(ok);

export const fetchQuote = () =>
  fetch(`${BASE}/quote`).then(ok);