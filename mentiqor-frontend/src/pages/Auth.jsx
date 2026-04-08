import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [tab, setTab]       = useState('login');
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [error, setError]   = useState('');
  const [msg, setMsg]       = useState('');
  const [busy, setBusy]     = useState(false);

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
      {/* Background glow blobs */}
      <div style={S.blob1} />
      <div style={S.blob2} />

      <div style={S.card}>
        <div style={S.brand}>
          <span style={S.dot} />
          Mentiqor
        </div>
        <p style={S.tagline}>JEE Mains Practice Platform</p>

        {/* Tabs */}
        <div style={S.tabs}>
          <button style={tab === 'login' ? S.tabActive : S.tab} onClick={() => { setTab('login'); setError(''); setMsg(''); }}>
            Sign In
          </button>
          <button style={tab === 'signup' ? S.tabActive : S.tab} onClick={() => { setTab('signup'); setError(''); setMsg(''); }}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handle} style={S.form}>
          <div style={S.fieldGroup}>
            <label style={S.label}>Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={S.input}
            />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
              style={S.input}
            />
          </div>

          {error && <div style={S.errorBox}>{error}</div>}
          {msg   && <div style={S.msgBox}>{msg}</div>}

          <button type="submit" style={S.submitBtn} disabled={busy}>
            {busy ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={S.footer}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={S.link} onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); setMsg(''); }}>
            {tab === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
  },
  blob1: {
    position: 'absolute',
    top: '-120px', left: '-80px',
    width: '500px', height: '500px',
    background: 'radial-gradient(circle, rgba(91,94,244,0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute',
    bottom: '-100px', right: '-60px',
    width: '400px', height: '400px',
    background: 'radial-gradient(circle, rgba(129,140,248,0.10) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '18px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    zIndex: 1,
    boxShadow: 'var(--shadow)',
  },
  brand: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--accent-2)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  dot: {
    display: 'inline-block',
    width: '8px', height: '8px',
    background: 'var(--accent)',
    borderRadius: '50%',
    boxShadow: '0 0 10px var(--accent-glow)',
  },
  tagline: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '28px',
  },
  tabs: {
    display: 'flex',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '3px',
    marginBottom: '24px',
  },
  tab: {
    flex: 1, padding: '8px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: 'var(--text-muted)',
    fontSize: '13.5px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  tabActive: {
    flex: 1, padding: '8px',
    background: 'var(--accent-bg)',
    border: 'none',
    borderRadius: '6px',
    color: 'var(--accent-2)',
    fontSize: '13.5px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  input: {
    padding: '11px 14px',
    background: 'var(--bg)',
    border: '1px solid var(--border-2)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '14.5px',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  errorBox: {
    padding: '10px 14px',
    background: 'var(--error-bg)',
    border: '1px solid rgba(244,63,94,0.3)',
    borderRadius: '7px',
    color: 'var(--error)',
    fontSize: '13px',
  },
  msgBox: {
    padding: '10px 14px',
    background: 'var(--success-bg)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '7px',
    color: 'var(--success)',
    fontSize: '13px',
  },
  submitBtn: {
    padding: '12px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'opacity 0.15s',
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '20px',
  },
  link: {
    color: 'var(--accent-2)',
    cursor: 'pointer',
    fontWeight: '500',
  },
};