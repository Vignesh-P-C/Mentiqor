import { useEffect, useState } from "react";
import { fetchQuestion, submitAnswer } from "../services/api";

function Quiz() {
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    setLoading(true);

    try {
      const data = await fetchQuestion();

      if (!data || data.length === 0) {
        console.error("No questions received");
        return;
      }

      setQuestion(data[0]);
      setSelected(null);
      setResult(null);
    } catch (err) {
      console.error("Error fetching question:", err);
    }

    setLoading(false);
  };

  const handleSubmit = async (option) => {
    if (selected) return;

    setSelected(option);

    try {
      const res = await submitAnswer({
        question_id: question.id,
        selected: option, // ⚠️ IMPORTANT: matches your DB column
        user_id: "test_user",
      });

      setResult(res);
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (!question) return <h2>No question found</h2>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>{question.question}</h2>

      {["A", "B", "C", "D"].map((opt) => {
        const optionText = question[`option_${opt.toLowerCase()}`];

        return (
          <button
            key={opt}
            onClick={() => handleSubmit(opt)}
            style={{
              display: "block",
              margin: "10px 0",
              padding: "10px",
              width: "100%",
              textAlign: "left",
              background:
                selected === opt
                  ? "#d3d3d3"
                  : "#ffffff",
              cursor: "pointer",
              border: "1px solid #ccc",
            }}
          >
            <strong>{opt}.</strong> {optionText}
          </button>
        );
      })}

      {result && (
  <div style={{ marginTop: "20px" }}>
    <h3>{result.is_correct ? "✅ Correct" : "❌ Wrong"}</h3>

    {!result.is_correct && (
      <p>Correct Answer: {result.correct_option}</p>
    )}

    <p>Marks: {result.marks_awarded}</p>

    {result.explanation && <p>{result.explanation}</p>}

    <button onClick={loadQuestion} style={{ marginTop: "10px" }}>
      Next Question
    </button>
  </div>
)}
    </div>
  );
}

export default Quiz;