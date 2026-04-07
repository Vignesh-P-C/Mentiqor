const BASE_URL = "http://localhost:5000";
export const fetchQuestion = async () => {
  const res = await fetch(`${BASE_URL}/questions?limit=1`);
  return res.json();
};

export const submitAnswer = async (data) => {
  const res = await fetch(`${BASE_URL}/attempt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};