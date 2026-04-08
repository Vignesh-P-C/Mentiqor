import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { fetchStats, fetchWeakTopics, fetchSessions } from '../services/api';

// Chart colors — hardcoded to work with both themes
const COLORS = { success: '#10b981', error: '#f43f5e', warning: '#f59e0b', accent: '#5b5ef4', accent2: '#818cf8', muted: '#6b6b8a' };
const PIE_COLORS = [COLORS.success, COLORS.error, COLORS.warning, COLORS.muted];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0e0e1c', border: '1px solid #1e1e38', borderRadius: 8, padding: '9px 13px', fontSize: 12 }}>
      {label && <div style={{ color: '#6b6b8a', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#e2e2f5' }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard({ userId, onNavigate }) {
  const [stats,      setStats]      = useState(null);
  const [weak,       setWeak]       = useState(null);
  const [sessions,   setSessions]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    Promise.all([fetchStats(userId), fetchWeakTopics(userId), fetchSessions(userId)])
      .then(([s, w, sess]) => { setStats(s); setWeak(w); setSessions(sess); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div style={S.center}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', marginTop: 14, fontSize: 14 }}>Loading dashboard...</p>
    </div>
  );

  if (error || !stats) return (
    <div style={S.center}>
      <div style={{ fontSize: 38, marginBottom: 12 }}>📊</div>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 300, lineHeight: 1.65, marginBottom: 20 }}>
        No attempts yet. Complete a quiz to see your performance analysis here.
      </p>
      <button style={S.primaryBtn} onClick={() => onNavigate('quiz')}>Start Practice →</button>
    </div>
  );

  const { overall, by_subject } = stats;
  const weakTopics = weak?.weak_topics || [];

  // Chart data
  const sessionLine = sessions.slice(-10).map((s, i) => ({
    name:     `#${sessions.length - (sessions.slice(-10).length - 1 - i)}`,
    accuracy: parseFloat(s.accuracy_percent),
    marks:    s.marks,
  }));

  const subjectBar = by_subject.map(s => ({
    name:     s.subject,
    accuracy: parseFloat(s.accuracy_percent),
    correct:  s.correct,
    attempted: s.attempted,
  }));

  const pieData = [
    { name: 'Correct',   value: overall.total_correct },
    { name: 'Incorrect', value: overall.total_incorrect },
  ].filter(d => d.value > 0);

  const weakBar = weakTopics.slice(0, 10).map(t => ({
    name:     t.chapter.length > 22 ? t.chapter.slice(0, 22) + '…' : t.chapter,
    accuracy: parseFloat(t.accuracy_percent),
    subject:  t.subject,
  }));

  const accColor = overall.accuracy_percent >= 70 ? COLORS.success : overall.accuracy_percent >= 40 ? COLORS.warning : COLORS.error;

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={S.header}>
        <div>
          <h2 style={S.pageTitle}>Performance Dashboard</h2>
          <p style={S.pageSub}>Analysis of your JEE Mains practice</p>
        </div>
        <button style={S.practiceBtn} onClick={() => onNavigate('quiz')}>Practice →</button>
      </div>

      {/* KPI cards */}
      <div style={S.kpiGrid}>
        <KPICard label="Sessions"     value={sessions.length}            icon="📚" />
        <KPICard label="Attempted"    value={overall.total_attempted}    icon="✏️" />
        <KPICard label="Accuracy"     value={`${overall.accuracy_percent}%`} icon="🎯" color={accColor} />
        <KPICard label="Total Marks"  value={`${overall.total_marks >= 0 ? '+' : ''}${overall.total_marks}`} icon="⭐"
          color={overall.total_marks >= 0 ? COLORS.success : COLORS.error} />
        <KPICard label="Correct"      value={overall.total_correct}   icon="✅" color={COLORS.success} />
        <KPICard label="Incorrect"    value={overall.total_incorrect} icon="❌" color={COLORS.error} />
      </div>

      {/* Row 1: Line chart + Pie */}
      <div style={S.row2}>
        {/* Session accuracy over time */}
        <div style={S.chartCard}>
          <div style={S.chartHeader}>
            <h3 style={S.chartTitle}>Accuracy Over Sessions</h3>
            <span style={S.chartSub}>Last {sessionLine.length} sessions</span>
          </div>
          {sessionLine.length < 2 ? (
            <EmptyChart msg="Complete more quizzes to see your trend" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sessionLine} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke={COLORS.accent2} strokeWidth={2}
                  dot={{ fill: COLORS.accent, r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div style={S.chartCard}>
          <div style={S.chartHeader}>
            <h3 style={S.chartTitle}>Attempt Breakdown</h3>
            <span style={S.chartSub}>All time</span>
          </div>
          {pieData.length === 0 ? <EmptyChart msg="No data yet" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                    dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 16 }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i], display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Subject breakdown bar */}
      <div style={S.chartCard}>
        <div style={S.chartHeader}>
          <h3 style={S.chartTitle}>Subject Accuracy</h3>
          <span style={S.chartSub}>% correct per subject</span>
        </div>
        {subjectBar.length === 0 ? <EmptyChart msg="No subject data yet" /> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={subjectBar} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.muted }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="accuracy" name="Accuracy %" radius={[5, 5, 0, 0]}>
                {subjectBar.map((d, i) => (
                  <Cell key={i} fill={d.accuracy >= 70 ? COLORS.success : d.accuracy >= 40 ? COLORS.warning : COLORS.error} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Row 3: Weak topics + recent sessions */}
      <div style={S.row2}>
        {/* Weak topics */}
        <div style={S.chartCard}>
          <div style={S.chartHeader}>
            <h3 style={S.chartTitle}>⚠️ Weak Topics</h3>
            <span style={S.chartSub}>below 60% accuracy</span>
          </div>
          {weakBar.length === 0 ? (
            <div style={S.allGood}>✅ All topics above 60% — great work!</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(weakBar.length * 36, 140)}>
              <BarChart data={weakBar} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: COLORS.muted }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: COLORS.muted }} width={130} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accuracy" name="Accuracy %" radius={[0, 4, 4, 0]}>
                  {weakBar.map((d, i) => (
                    <Cell key={i} fill={d.accuracy < 30 ? COLORS.error : COLORS.warning} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent sessions */}
        <div style={S.chartCard}>
          <div style={S.chartHeader}>
            <h3 style={S.chartTitle}>Recent Sessions</h3>
            <span style={S.chartSub}>Last {Math.min(sessions.length, 8)}</span>
          </div>
          {sessions.length === 0 ? <EmptyChart msg="No sessions yet" /> : (
            <div style={S.sessionList}>
              {sessions.slice(-8).reverse().map((s, i) => {
                const acc = parseFloat(s.accuracy_percent);
                const color = acc >= 70 ? COLORS.success : acc >= 40 ? COLORS.warning : COLORS.error;
                const date  = new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                return (
                  <div key={i} style={S.sessionRow}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
                        {s.subject || 'Mixed'} · {s.chapters ? s.chapters.split(',').length + ' chapter(s)' : ''}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {s.attempted}/{s.total_questions} attempted · {date}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color, fontFamily: 'monospace' }}>{acc}%</div>
                      <div style={{ fontSize: 12, color: s.marks >= 0 ? COLORS.success : COLORS.error, fontFamily: 'monospace' }}>
                        {s.marks >= 0 ? '+' : ''}{s.marks} pts
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──
function KPICard({ label, value, icon, color = 'var(--text)' }) {
  return (
    <div style={S.kpiCard}>
      <div style={S.kpiIcon}>{icon}</div>
      <div style={{ ...S.kpiValue, color }}>{value}</div>
      <div style={S.kpiLabel}>{label}</div>
    </div>
  );
}

function EmptyChart({ msg }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
      {msg}
    </div>
  );
}

// ── Styles ──
const S = {
  center: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', minHeight: '55vh', gap: 12,
  },
  header: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12,
  },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 },
  pageSub:   { fontSize: 13, color: 'var(--text-muted)' },
  practiceBtn: {
    padding: '9px 20px',
    background: 'var(--accent-bg)',
    color: 'var(--accent-2)',
    border: '1px solid rgba(91,94,244,0.3)',
    borderRadius: '8px',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  primaryBtn: {
    padding: '11px 28px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: 14.5,
    fontWeight: 600,
    cursor: 'pointer',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px 12px',
    textAlign: 'center',
  },
  kpiIcon:  { fontSize: 18, marginBottom: 8 },
  kpiValue: { fontSize: 22, fontWeight: 800, fontFamily: 'monospace', lineHeight: 1, marginBottom: 5 },
  kpiLabel: { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
    marginBottom: 14,
  },
  chartCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '20px 20px 16px',
    marginBottom: 14,
  },
  chartHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  chartTitle:  { fontFamily: "'Syne', sans-serif", fontSize: 14.5, fontWeight: 700, color: 'var(--text)' },
  chartSub:    { fontSize: 11.5, color: 'var(--text-muted)' },
  allGood: {
    textAlign: 'center', padding: '16px',
    color: COLORS.success,
    background: 'rgba(16,185,129,0.08)',
    borderRadius: '8px',
    fontSize: 13,
  },
  sessionList: { display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' },
  sessionRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 12px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    gap: 12,
  },
};