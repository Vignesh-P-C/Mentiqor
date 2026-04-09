const OPTIONS = ['A', 'B', 'C', 'D'];

export default function Options({ question, selected, result, onSelect, disabled }) {
  const getBtnClass = (opt) => {
    let cls = 'option-btn';
    if (!result) {
      if (opt === selected) cls += ' selected';
    } else {
      if (opt === result.correct_option)          cls += ' correct';
      else if (opt === selected && !result.is_correct) cls += ' wrong';
      else                                             cls += ' dimmed';
    }
    return cls;
  };

  return (
    <div className="options-list">
      {OPTIONS.map(opt => (
        <button
          key={opt}
          className={getBtnClass(opt)}
          onClick={() => onSelect(opt)}
          disabled={!!selected || disabled}
        >
          <span className="option-label">{opt}</span>
          <span className="option-text">
            {question[`option_${opt.toLowerCase()}`]}
          </span>
        </button>
      ))}
    </div>
  );
}