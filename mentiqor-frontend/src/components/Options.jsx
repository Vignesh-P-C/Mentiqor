const OPTIONS = ['A', 'B', 'C', 'D'];

export default function Options({ question, selected, onSelect, disabled }) {
  return (
    <div style={S.container}>
      {OPTIONS.map(opt => {
        const isSelected = opt === selected;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            disabled={disabled}
            style={isSelected ? S.optSelected : S.opt}
          >
            <span style={isSelected ? S.labelSelected : S.label}>{opt}</span>
            <span style={S.text}>{question[`option_${opt.toLowerCase()}`]}</span>
          </button>
        );
      })}
    </div>
  );
}

const base = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 13,
  padding: '12px 15px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  color: 'var(--text)',
  fontSize: '14.5px',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.13s',
  width: '100%',
  lineHeight: 1.55,
};

const S = {
  container: { display: 'flex', flexDirection: 'column', gap: 8 },
  opt: { ...base },
  optSelected: {
    ...base,
    border: '1px solid var(--accent)',
    background: 'var(--accent-bg)',
  },
  label: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 25, height: 25,
    borderRadius: '50%',
    background: 'var(--surface-2)',
    border: '1px solid var(--border-2)',
    fontSize: 11.5,
    fontWeight: 700,
    color: 'var(--text-muted)',
    flexShrink: 0,
    marginTop: 1,
  },
  labelSelected: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 25, height: 25,
    borderRadius: '50%',
    background: 'var(--accent)',
    border: '1px solid var(--accent)',
    fontSize: 11.5,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
    marginTop: 1,
  },
  text: { flex: 1 },
};