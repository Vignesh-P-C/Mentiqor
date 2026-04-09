import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [tab, setTab]     = useState('login');
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg]     = useState('');
  const [busy, setBusy]   = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    setBusy(true);
    const { error: err } = tab === 'login'
      ? await signIn(email, pass)
      : await signUp(email, pass);
    setBusy(false);
    if (err) return setError(err.message);
    if (tab === 'signup') setMsg('Check your email to confirm your account.');
  };

  return (
    <div style={S.page}>
      {/* ── Left panel ── */}
      <div style={S.left}>
        <div style={S.gridOverlay} />
        <div style={S.diagBand} />

        <div style={S.leftContent}>
          {/* Brand mark */}
          <div style={S.brandBlock}>
            <div style={S.brandMark} />
            <span style={S.brandName}>MENTIQOR</span>
          </div>

          {/* Hero text */}
          <div style={S.heroBlock}>
            <h1 style={S.heroTitle}>CRACK<br />JEE<br />MAINS</h1>
            <p style={S.heroSub}>Chapter-wise practice with real exam analysis</p>
          </div>

          {/* Features */}
          <div style={S.features}>
            {[
              'Chapter-wise question bank',
              'Subject-level accuracy tracking',
              'Timed mock tests with scoring',
            ].map(f => (
              <div key={f} style={S.featureRow}>
                <span style={S.featureIcon}>◈</span>
                <span style={S.featureText}>{f}</span>
              </div>
            ))}
          </div>

          {/* Decorative bars */}
          <div style={S.decoRow}>
            {[14, 22, 30, 38, 46].map((h, i) => (
              <div key={i} style={{ ...S.decoBar, height: `${h}px`, opacity: 0.18 + i * 0.1 }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={S.right}>
        <div style={S.formWrap}>
          {/* Header */}
          <div style={S.formHeader}>
            <h2 style={S.formTitle}>
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={S.formSub}>
              {tab === 'login'
                ? 'Sign in to continue your practice'
                : 'Join and start cracking JEE Mains'}
            </p>
          </div>

          {/* Underline tabs */}
          <div style={S.tabRow}>
            {[
              { key: 'login',  label: 'Sign In' },
              { key: 'signup', label: 'Sign Up' },
            ].map(({ key, label }) => (
              <button
                key={key}
                style={{ ...S.tabBtn, ...(tab === key ? S.tabBtnActive : {}) }}
                onClick={() => { setTab(key); setError(''); setMsg(''); }}
              >
                {label}
                {tab === key && <div style={S.tabUnderline} />}
              </button>
            ))}
          </div>

          {/* Fields */}
          <form onSubmit={handle} style={S.form}>
            <div style={S.field}>
              <label style={S.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={S.input}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'; }}
                onBlur={e =>  { e.target.style.borderColor = 'var(--border-2)'; e.target.style.background = 'var(--surface-2)'; }}
              />
            </div>

            <div style={S.field}>
              <label style={S.label}>PASSWORD</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
                style={S.input}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'; }}
                onBlur={e =>  { e.target.style.borderColor = 'var(--border-2)'; e.target.style.background = 'var(--surface-2)'; }}
              />
            </div>

            {error && (
              <div style={S.errorBox}>
                <span style={S.errorDot} />
                {error}
              </div>
            )}
            {msg && (
              <div style={S.successBox}>
                <span style={S.successDot} />
                {msg}
              </div>
            )}

            <button
              type="submit"
              style={{ ...S.submitBtn, opacity: busy ? 0.6 : 1 }}
              disabled={busy}
            >
              {busy
                ? 'Please wait...'
                : tab === 'login' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
            </button>
          </form>

          <p style={S.footer}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span
              style={S.footerLink}
              onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); setMsg(''); }}
            >
              {tab === 'login' ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: 'var(--font-body)',
    background: 'var(--bg)',
  },

  /* ── Left panel ── */
  left: {
    width: '52%',
    background: 'var(--surface)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--border)',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  diagBand: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '70%',
    height: '140%',
    background: 'var(--gradient-accent-soft)',
    transform: 'skewX(-12deg)',
    pointerEvents: 'none',
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
    padding: '52px 56px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },

  brandBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 7,
    height: 7,
    background: 'var(--accent)',
    borderRadius: 2,
    transform: 'rotate(45deg)',
  },
  brandName: {
    fontFamily: 'var(--font-display)',
    fontSize: 72,
    fontWeight: 700,
    letterSpacing: '0.18em',
    color: 'var(--accent-2)',
  },

  heroBlock: {
    marginTop: 'auto',
    marginBottom: 36,
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 72,
    fontWeight: 800,
    lineHeight: 0.92,
    letterSpacing: '-0.02em',
    color: 'var(--text)',
    marginBottom: 18,
  },
  heroSub: {
    fontSize: 14,
    color: 'var(--text-muted)',
    fontWeight: 400,
    lineHeight: 1.5,
    maxWidth: 260,
  },

  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: 13,
    marginBottom: 52,
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 10,
    color: 'var(--accent)',
    flexShrink: 0,
  },
  featureText: {
    fontSize: 13,
    color: 'var(--text-muted)',
    fontWeight: 500,
  },

  decoRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 5,
  },
  decoBar: {
    width: 4,
    background: 'var(--accent)',
    borderRadius: 2,
  },

  /* ── Right panel ── */
  right: {
    flex: 1,
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 48px',
  },
  formWrap: {
    width: '100%',
    maxWidth: 360,
  },

  formHeader: {
    marginBottom: 32,
  },
  formTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.01em',
    lineHeight: 1,
    marginBottom: 8,
  },
  formSub: {
    fontSize: 13,
    color: 'var(--text-muted)',
    fontWeight: 400,
  },

  /* Tabs */
  tabRow: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    marginBottom: 28,
  },
  tabBtn: {
    position: 'relative',
    flex: 1,
    padding: '10px 0',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 12.5,
    fontWeight: 600,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'color 0.15s',
  },
  tabBtnActive: {
    color: 'var(--accent)',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    background: 'var(--accent)',
    borderRadius: '2px 2px 0 0',
  },

  /* Form */
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  label: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.10em',
  },
  input: {
    padding: '11px 14px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border-2)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
    fontFamily: 'var(--font-body)',
  },

  /* Feedback */
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 13px',
    background: 'var(--error-bg)',
    border: '1px solid rgba(220,38,38,0.20)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--error)',
    fontSize: 13,
  },
  errorDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'var(--error)',
    flexShrink: 0,
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 13px',
    background: 'var(--success-bg)',
    border: '1px solid rgba(5,150,105,0.20)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--success)',
    fontSize: 13,
  },
  successDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'var(--success)',
    flexShrink: 0,
  },

  /* Submit */
  submitBtn: {
    padding: '13px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12.5,
    fontWeight: 700,
    letterSpacing: '0.08em',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    marginTop: 4,
    fontFamily: 'var(--font-display)',
  },

  footer: {
    textAlign: 'center',
    fontSize: 12.5,
    color: 'var(--text-muted)',
    marginTop: 22,
  },
  footerLink: {
    color: 'var(--accent)',
    cursor: 'pointer',
    fontWeight: 600,
  },
};