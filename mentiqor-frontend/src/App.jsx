import { useState } from 'react';
import { useAuth }  from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import Auth         from './pages/Auth';
import Quiz         from './pages/Quiz';
import Dashboard    from './pages/Dashboard';
import Materials from './pages/Materials';

import './App.css';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const { theme, toggleTheme }     = useTheme();
  const [page, setPage]            = useState('quiz');

  // ── Loading ──
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner" />
    </div>
  );

  // ── Auth wall ──
  if (!user) return <Auth />;
  const displayName = getUserName();
  return (
    <div className="app">
      <nav className="navbar">
        <span className="brand">
          <span className="brand-dot" />
          Mentiqor
        </span>

        <div className="nav-center">
          <button className={`nav-btn ${page === 'quiz' ? 'active' : ''}`} onClick={() => setPage('quiz')}>
            Practice
          </button>
          <button className={`nav-btn ${page === 'dashboard' ? 'active' : ''}`} onClick={() => setPage('dashboard')}>
            Dashboard
          </button>
          <button className={`nav-btn ${page === 'materials' ? 'active' : ''}`} onClick={() => setPage('materials')}>
            Materials
          </button>
        </div>

        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{displayName}</div>
            <span className="user-email" style={{ fontSize: '11px' }}>{user.email}</span>
          </div>
          <button className="signout-btn" onClick={signOut}>Sign out</button>
        </div>
      </nav>

      <main className="main-content">
        {page === 'quiz' && <Quiz userId={user.id} onNavigate={setPage} />}
        {page === 'dashboard' && <Dashboard userId={user.id} onNavigate={setPage} />}
        {page === 'materials' && <Materials />}
      </main>
    </div>
  );
}