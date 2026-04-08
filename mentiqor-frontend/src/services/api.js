const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

export const fetchQuestions = async ({ subject, chapter } = {}) => {
  const params = new URLSearchParams();
  if (subject && subject !== "All") params.append("subject", subject);
  if (chapter && chapter !== "All") params.append("chapter", chapter);
  const res = await fetch(`${BASE_URL}/questions?${params}`);
  return handleResponse(res);
};

export const submitAnswer = async ({ user_id, question_id, selected }) => {
  const res = await fetch(`${BASE_URL}/attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, question_id, selected }),
  });
  return handleResponse(res);
};

export const fetchStats = async (user_id) => {
  const res = await fetch(`${BASE_URL}/stats/${user_id}`);
  return handleResponse(res);
};

export const fetchWeakTopics = async (user_id, threshold = 60) => {
  const res = await fetch(`${BASE_URL}/weak-topics/${user_id}?threshold=${threshold}`);
  return handleResponse(res);
};