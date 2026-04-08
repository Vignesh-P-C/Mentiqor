const OPTIONS = ["A", "B", "C", "D"];

export default function Options({ question, selected, result, onSelect, disabled }) {
  const getStyle = (opt) => {
    // No answer submitted yet
    if (!result) {
      return opt === selected ? S.optSelected : S.opt;
    }
    // Answer submitted: color code
    if (opt === result.correct_option) return S.optCorrect;
    if (opt === selected && !result.is_correct) return S.optIncorrect;
    return { ...S.opt, opacity: 0.45 };
  };

  const getLabelStyle = (opt) => {
    if (!result) return opt === selected ? S.labelSelected : S.label;
    if (opt === result.correct_option) return S.labelCorrect;
    if (opt === selected && !result.is_correct) return S.labelIncorrect;
    return S.label;
  };

  return (
    <div style={S.container}>
      {OPTIONS.map(opt => {
        const text = question[`option_${opt.toLowerCase()}`];
        return (
          <button
            key={opt}
            style={getStyle(opt)}
            onClick={() => onSelect(opt)}
            disabled={!!selected || disabled}
          >
            <span style={getLabelStyle(opt)}>{opt}</span>
            <span style={S.optText}>{text}</span>
          </button>
        );
      })}
    </div>
  );
}

const base = {
  display: "flex",
  alignItems: "flex-start",
  gap: 14,
  padding: "13px 16px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--text)",
  fontSize: 15,
  textAlign: "left",
  cursor: "pointer",
  transition: "all 0.15s",
  width: "100%",
  lineHeight: 1.5,
};

const S = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
    marginBottom: 14,
  },
  opt: { ...base },
  optSelected: {
    ...base,
    border: "1px solid var(--accent)",
    background: "var(--accent-bg)",
  },
  optCorrect: {
    ...base,
    border: "1px solid var(--success)",
    background: "var(--success-bg)",
    color: "#6ee7b7",
    cursor: "default",
  },
  optIncorrect: {
    ...base,
    border: "1px solid var(--error)",
    background: "var(--error-bg)",
    color: "#fda4af",
    cursor: "default",
  },
  label: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 26,
    height: 26,
    borderRadius: "50%",
    background: "var(--surface-2)",
    border: "1px solid var(--border-2)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-muted)",
    flexShrink: 0,
    marginTop: 1,
  },
  labelSelected: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 26,
    height: 26,
    borderRadius: "50%",
    background: "var(--accent)",
    border: "1px solid var(--accent)",
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
    flexShrink: 0,
    marginTop: 1,
  },
  labelCorrect: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 26,
    height: 26,
    borderRadius: "50%",
    background: "var(--success)",
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
    flexShrink: 0,
    marginTop: 1,
  },
  labelIncorrect: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 26,
    height: 26,
    borderRadius: "50%",
    background: "var(--error)",
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
    flexShrink: 0,
    marginTop: 1,
  },
  optText: {
    flex: 1,
  },
};