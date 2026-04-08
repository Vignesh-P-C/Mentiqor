import { useEffect, useRef } from 'react';

export default function Timer({ seconds, onExpire }) {
  const intervalRef = useRef(null);

  // We don't manage time internally — parent passes decreasing `seconds` value.
  // This component is purely display + calls onExpire when seconds reach 0.

  useEffect(() => {
    if (seconds <= 0 && onExpire) onExpire();
  }, [seconds]);

  const h   = Math.floor(seconds / 3600);
  const m   = Math.floor((seconds % 3600) / 60);
  const s   = seconds % 60;
  const pct = 0; // handled by parent

  const fmt = (n) => String(n).padStart(2, '0');

  // Color logic
  const danger  = seconds <= 120;
  const warning = seconds <= 300 && seconds > 120;
  const color   = danger ? 'var(--error)' : warning ? 'var(--warning)' : 'var(--accent-2)';

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
        Time Left
      </div>
      <div style={{
        fontFamily: 'monospace',
        fontSize: 26,
        fontWeight: 700,
        color,
        letterSpacing: 1,
        animation: danger && seconds % 2 === 0 ? 'pulse 1s ease infinite' : 'none',
        transition: 'color 0.3s',
      }}>
        {h > 0 && `${fmt(h)}:`}{fmt(m)}:{fmt(s)}
      </div>
    </div>
  );
}