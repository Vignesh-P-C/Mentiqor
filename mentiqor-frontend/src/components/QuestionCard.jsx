export default function QuestionCard({ question, index, total }) {
  return (
    <div className="question-card">
      <div className="question-meta">
        <div className="q-tags">
          <span className="q-subject-tag">{question.subject}</span>
          <span className="q-chapter-tag">›&nbsp;{question.chapter}</span>
        </div>
        <span className="q-counter">
          {index + 1} / {total}
        </span>
      </div>
      <p className="question-text">{question.question}</p>
    </div>
  );
}