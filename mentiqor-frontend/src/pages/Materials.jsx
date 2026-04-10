import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

// ─────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────
const SUPABASE_URL = 'https://uijmprfzqxmluiuuftod.supabase.co';
const BUCKET       = 'pyq-papers';
const YT_KEY       = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE         = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─────────────────────────────────────────────────
//  STATIC DATA — PYQ Papers
// ─────────────────────────────────────────────────
const pdf = (year, date, shift, slug) => ({
  year, date, shift,
  pdfUrl: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${year}/${slug}_shift${shift}.pdf`,
});

const shifts = (year, date, slug, numShifts = 2) => {
  const result = [];
  for (let i = 1; i <= numShifts; i++) result.push(pdf(year, date, i, slug));
  return result;
};

const PYQ_PAPERS = [
  ...shifts('2025', 'Jan 22', 'jan22'), ...shifts('2025', 'Jan 23', 'jan23'),
  ...shifts('2025', 'Jan 24', 'jan24'), ...shifts('2025', 'Jan 28', 'jan28'),
  ...shifts('2025', 'Jan 29', 'jan29'),
  ...shifts('2024', 'Apr 4',  'apr4'),
  ...shifts('2024', 'Apr 5',  'apr5'), ...shifts('2024', 'Apr 6',  'apr6'),
  ...shifts('2024', 'Apr 8',  'apr8'), ...shifts('2024', 'Apr 9',  'apr9'),

  ...shifts('2023', 'Jan 24', 'jan24'), ...shifts('2023', 'Jan 25', 'jan25'),
  ...shifts('2023', 'Apr 6',  'apr6'),  ...shifts('2023', 'Apr 13', 'apr13'),
  ...shifts('2022', 'Jun 24', 'jun24'), ...shifts('2022', 'Jun 25', 'jun25'),
  ...shifts('2022', 'Jul 25', 'jul25'),
];

const PYQ_YEARS = [...new Set(PYQ_PAPERS.map(p => p.year))].sort((a, b) => b - a);

// ─────────────────────────────────────────────────
//  STATIC DATA — Video Playlists
// ─────────────────────────────────────────────────
const PLAYLISTS = [
  { subject: 'Mathematics', topic: 'Sets, Relations and Functions',             detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Complex Numbers and Quadratic Equations',   detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Matrices and Determinants',                 detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Permutations and Combinations',             detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Binomial Theorem',                          detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Sequences and Series',                      detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Limits, Continuity and Differentiability',  detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Integral Calculus',                         detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Differential Equations',                    detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Coordinate Geometry',                       detailedUrl: 'https://www.youtube.com/playlist?list=PLu0W_9lII9agICnT8t4iYVSZ3eykIAOME', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Vector Algebra',                            detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Three Dimensional Geometry',                detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Statistics and Probability',                detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Trigonometry',                              detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Mathematical Reasoning',                    detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Linear Programming',                        detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Inverse Trigonometric Functions',           detailedUrl: '', shortUrl: '' },
  { subject: 'Mathematics', topic: 'Application of Derivatives',                detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Physics and Measurement',                       detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Kinematics',                                    detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Laws of Motion',                                detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Work, Energy and Power',                        detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Rotational Motion',                             detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Gravitation',                                   detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Properties of Solids and Liquids',              detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Thermodynamics',                                detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Kinetic Theory of Gases',                       detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Oscillations and Waves',                        detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Electrostatics',                                detailedUrl: 'https://www.youtube.com/playlist?list=PLF_7kfnwLFCF7NBFr1QVGBIVXbRKGV3UG', shortUrl: '' },
  { subject: 'Physics', topic: 'Current Electricity',                           detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Magnetic Effects of Current and Magnetism',     detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Electromagnetic Induction and Alternating Currents', detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Electromagnetic Waves',                         detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Optics',                                        detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Dual Nature of Matter and Radiation',           detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Atoms and Nuclei',                              detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Electronic Devices',                            detailedUrl: '', shortUrl: '' },
  { subject: 'Physics', topic: 'Communication Systems',                         detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Some Basic Concepts of Chemistry',            detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Atomic Structure',                            detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Chemical Bonding and Molecular Structure',    detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'States of Matter (Gases & Liquids)',          detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Thermodynamics',                              detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Equilibrium',                                 detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Redox Reactions and Electrochemistry',        detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Chemical Kinetics',                           detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Surface Chemistry',                           detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Solutions',                                   detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Solid State',                                 detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Classification of Elements and Periodicity',  detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Hydrogen',                                    detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 's-Block Elements',                            detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'p-Block Elements',                            detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'd and f Block Elements',                      detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Coordination Compounds',                      detailedUrl: 'https://www.youtube.com/playlist?list=PLpIJq64f7kxWBZiqLlJYy0r8RTa_TBmLm', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Environmental Chemistry',                     detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Qualitative Analysis',                        detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Basic Principles (IUPAC, Isomerism, GOC)',    detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Hydrocarbons',                                detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Haloalkanes and Haloarenes',                  detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Alcohols, Phenols and Ethers',                detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Aldehydes, Ketones and Carboxylic Acids',     detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Amines',                                      detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Biomolecules and Polymers',                   detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Chemistry in Everyday Life',                  detailedUrl: '', shortUrl: '' },
  { subject: 'Chemistry', topic: 'Practical Organic Chemistry',                 detailedUrl: '', shortUrl: '' },
];

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry'];

// ─────────────────────────────────────────────────
//  IDENTIFIER HELPERS
// ─────────────────────────────────────────────────
const pyqId = p => `${p.year}_${p.date}_shift${p.shift}`;
const vidId = v => `${v.subject}_${v.topic}`;

// ─────────────────────────────────────────────────
//  API HELPERS
// ─────────────────────────────────────────────────
const apiFetch = path =>
  fetch(`${BASE}${path}`).then(r => r.json());

const apiPost = (path, body) =>
  fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json());

// ─────────────────────────────────────────────────
//  YOUTUBE FALLBACK
// ─────────────────────────────────────────────────
async function searchYouTube(topic, type) {
  const searchTerm = type === 'detailed'
    ? `${topic} JEE Mains one shot full chapter`
    : `${topic} JEE Mains revision 10 minutes`;
  const q = encodeURIComponent(searchTerm);
  if (!YT_KEY) return `https://www.youtube.com/results?search_query=${q}`;
  try {
    const res  = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${q}&type=video&key=${YT_KEY}`);
    const data = await res.json();
    const id   = data?.items?.[0]?.id?.videoId;
    return id ? `https://www.youtube.com/watch?v=${id}` : `https://www.youtube.com/results?search_query=${q}`;
  } catch {
    return `https://www.youtube.com/results?search_query=${q}`;
  }
}

// ─────────────────────────────────────────────────
//  SHIFT BADGE COLOR
// ─────────────────────────────────────────────────
const shiftColor = shift =>
  shift === 1
    ? { bg: 'rgba(168,106,58,0.12)', color: 'var(--accent)' }
    : { bg: 'rgba(167,139,250,0.10)', color: '#a78bfa' };

// ─────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={S.toast}>
      <span style={{ color: '#f87171', marginRight: 6 }}>⚠</span>
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────
//  DONE TOGGLE BUTTON
// ─────────────────────────────────────────────────
function DoneToggle({ done, loading, onToggle }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onToggle(); }}
      disabled={loading}
      title={done ? 'Mark as not done' : 'Mark as done'}
      aria-label={done ? 'Mark as not done' : 'Mark as done'}
      aria-pressed={done}
      style={{
        ...S.doneBtn,
        background:  done ? 'rgba(16,185,129,0.15)' : 'var(--surface-2)',
        borderColor: done ? 'rgba(16,185,129,0.5)'  : 'var(--border-2)',
        color:       done ? '#10b981'                : 'var(--text-muted)',
        opacity:     loading ? 0.5 : 1,
        cursor:      loading ? 'default' : 'pointer',
      }}
    >
      {loading ? '…' : done ? '✓' : '○'}
    </button>
  );
}

// ─────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────
export default function Materials() {
  const { user } = useAuth();

  const [search,        setSearch]        = useState('');
  const [yearFilter,    setYearFilter]    = useState('All');
  const [activeSubj,    setActiveSubj]    = useState('Mathematics');
  const [loadingVids,   setLoadingVids]   = useState({});
  const [activeSection, setActiveSection] = useState('pyq');

  // Completion state
  const [completedPYQ,    setCompletedPYQ]    = useState(new Set());
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [togglingItems,   setTogglingItems]   = useState({});
  const [toast,           setToast]           = useState(null);

  // ── Fetch completions on mount ──
  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      apiFetch(`/completions/${user.id}?type=pyq`),
      apiFetch(`/completions/${user.id}?type=video`),
    ]).then(([pyqData, vidData]) => {
      if (pyqData.completions)  setCompletedPYQ(new Set(pyqData.completions));
      if (vidData.completions)  setCompletedVideos(new Set(vidData.completions));
    }).catch(err => console.error('Failed to load completions:', err));
  }, [user?.id]);

  // ── Generic toggle handler (optimistic) ──
  const handleToggle = useCallback(async (type, identifier) => {
    const isVideo    = type === 'video';
    const currentSet = isVideo ? completedVideos : completedPYQ;
    const setFn      = isVideo ? setCompletedVideos : setCompletedPYQ;
    const wasDone    = currentSet.has(identifier);
    const nowDone    = !wasDone;

    // Optimistic update
    setFn(prev => {
      const next = new Set(prev);
      nowDone ? next.add(identifier) : next.delete(identifier);
      return next;
    });
    setTogglingItems(prev => ({ ...prev, [identifier]: true }));

    try {
      const result = await apiPost('/completion', {
        user_id:         user.id,
        completion_type: type,
        item_identifier: identifier,
        completed:       nowDone,
      });
      if (!result.success) throw new Error(result.error || 'Server error');
    } catch (err) {
      // Revert on failure
      console.error('Toggle failed:', err);
      setFn(prev => {
        const next = new Set(prev);
        wasDone ? next.add(identifier) : next.delete(identifier);
        return next;
      });
      setToast('Could not save — please try again.');
    } finally {
      setTogglingItems(prev => ({ ...prev, [identifier]: false }));
    }
  }, [user?.id, completedPYQ, completedVideos]);

  // ── PYQ filter ──
  const filteredPYQ = PYQ_PAPERS.filter(p => {
    const matchYear   = yearFilter === 'All' || p.year === yearFilter;
    const q           = search.toLowerCase();
    const matchSearch = !q || p.year.includes(q) || p.date.toLowerCase().includes(q);
    return matchYear && matchSearch;
  });

  // ── Video filter ──
  const filteredVideos = PLAYLISTS.filter(v => {
    const q = search.toLowerCase();
    return v.subject === activeSubj &&
      (!q || v.topic.toLowerCase().includes(q) || v.subject.toLowerCase().includes(q));
  });

  // ── Watch handler ──
  const handleWatch = useCallback(async (v, type) => {
    const urlField   = type === 'detailed' ? 'detailedUrl' : 'shortUrl';
    if (v[urlField]) { window.open(v[urlField], '_blank'); return; }
    const loadingKey = `${v.topic}_${type}`;
    setLoadingVids(prev => ({ ...prev, [loadingKey]: true }));
    const url = await searchYouTube(v.topic, type);
    setLoadingVids(prev => ({ ...prev, [loadingKey]: false }));
    window.open(url, '_blank');
  }, []);

  return (
    <div className="fade-up" style={S.page}>

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* ── Page header ── */}
      <div style={S.header}>
        <div>
          <h2 style={S.pageTitle}>📚 Study Materials</h2>
          <p style={S.pageSub}>PYQ papers (shift-wise) · topic-wise video playlists</p>
        </div>
        <div style={S.searchWrap}>
          <span style={S.searchIcon}>⌕</span>
          <input
            style={S.searchInput}
            placeholder="Search papers or topics…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e  => { e.target.style.borderColor = 'var(--border-2)'; }}
          />
          {search && (
            <button style={S.clearBtn} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={S.twoColLayout}>

        {/* LEFT SIDEBAR */}
        <div style={S.sidebar}>
          <button
            style={{ ...S.sidebarBtn, ...(activeSection === 'pyq' ? S.sidebarBtnActive : {}) }}
            onClick={() => setActiveSection('pyq')}
          >
            📄 PYQ Papers
          </button>
          <button
            style={{ ...S.sidebarBtn, ...(activeSection === 'videos' ? S.sidebarBtnActive : {}) }}
            onClick={() => setActiveSection('videos')}
          >
            ▶️ Video Playlists
          </button>

          {/* Progress summary */}
          {user && (
            <div style={S.progressBox}>
              <div style={S.progressLabel}>Your progress</div>
              <div style={S.progressRow}>
                <span style={S.progressKey}>PYQ done</span>
                <span style={S.progressVal}>{completedPYQ.size} / {PYQ_PAPERS.length}</span>
              </div>
              <div style={S.progressRow}>
                <span style={S.progressKey}>Videos done</span>
                <span style={S.progressVal}>{completedVideos.size} / {PLAYLISTS.length}</span>
              </div>
              {/* Mini progress bars */}
              <ProgressBar value={completedPYQ.size}    max={PYQ_PAPERS.length} />
              <ProgressBar value={completedVideos.size} max={PLAYLISTS.length}  />
            </div>
          )}
        </div>

        {/* RIGHT CONTENT */}
        <div style={S.rightContent}>

          {/* ── SECTION A: PYQ Papers ── */}
          {activeSection === 'pyq' && (
            <section style={S.section}>
              <div style={S.sectionHeader}>
                <div>
                  <div style={S.sectionLabel}>SECTION A</div>
                  <h3 style={S.sectionTitle}>📄 PYQ Papers <span style={S.sectionSub}>Shift-wise</span></h3>
                </div>
                <div style={S.filterWrap}>
                  <span style={S.filterLabel}>Year</span>
                  <select
                    style={S.select}
                    value={yearFilter}
                    onChange={e => setYearFilter(e.target.value)}
                  >
                    <option value="All">All Years</option>
                    {PYQ_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {filteredPYQ.length === 0 ? (
                <EmptyState msg="No papers match your search." />
              ) : (
                PYQ_YEARS
                  .filter(y => yearFilter === 'All' || y === yearFilter)
                  .map(year => {
                    const papers = filteredPYQ.filter(p => p.year === year);
                    if (!papers.length) return null;
                    return (
                      <div key={year} style={S.yearGroup}>
                        <div style={S.yearBadge}>{year}</div>
                        <div style={S.paperGrid}>
                          {papers.map((p, i) => {
                            const id   = pyqId(p);
                            const done = completedPYQ.has(id);
                            return (
                              <PaperCard
                                key={i}
                                paper={p}
                                done={done}
                                toggling={!!togglingItems[id]}
                                onToggle={() => handleToggle('pyq', id)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
              )}
            </section>
          )}

          {/* ── SECTION B: Video Playlists ── */}
          {activeSection === 'videos' && (
            <section style={S.section}>
              <div style={S.sectionHeader}>
                <div>
                  <div style={S.sectionLabel}>SECTION B</div>
                  <h3 style={S.sectionTitle}>▶️ Video Playlists <span style={S.sectionSub}>Topic-wise</span></h3>
                </div>
              </div>

              <div style={S.tabRow}>
                {SUBJECTS.map(subj => (
                  <button
                    key={subj}
                    style={{ ...S.tab, ...(activeSubj === subj ? S.tabActive : {}) }}
                    onClick={() => setActiveSubj(subj)}
                  >
                    {subjectIcon(subj)} {subj}
                    {activeSubj === subj && <div style={S.tabUnderline} />}
                  </button>
                ))}
              </div>

              {filteredVideos.length === 0 ? (
                <EmptyState msg="No topics match your search." />
              ) : (
                <div style={S.videoGrid}>
                  {filteredVideos.map((v, i) => {
                    const id   = vidId(v);
                    const done = completedVideos.has(id);
                    return (
                      <VideoCard
                        key={i}
                        item={v}
                        done={done}
                        toggling={!!togglingItems[id]}
                        onToggle={() => handleToggle('video', id)}
                        loadingDetailed={!!loadingVids[`${v.topic}_detailed`]}
                        loadingShort={!!loadingVids[`${v.topic}_short`]}
                        onWatchDetailed={() => handleWatch(v, 'detailed')}
                        onWatchShort={() => handleWatch(v, 'short')}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────

function PaperCard({ paper, done, toggling, onToggle }) {
  const sc = shiftColor(paper.shift);
  return (
    <div
      style={{
        ...S.paperCard,
        background:  done ? 'rgba(16,185,129,0.07)' : 'var(--surface)',
        border:      done ? '1px solid rgba(16,185,129,0.35)' : '1px solid var(--border)',
        borderLeft:  done ? '3px solid #10b981' : undefined,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Top row: icon + shift badge + done toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontSize: 22, opacity: done ? 0.55 : 1 }}>📄</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ ...S.shiftBadge, background: sc.bg, color: sc.color }}>
            Shift {paper.shift}
          </span>
          <DoneToggle done={done} loading={toggling} onToggle={onToggle} />
        </div>
      </div>

      <div style={{ ...S.paperDate, opacity: done ? 0.65 : 1 }}>{paper.date}</div>
      <div style={S.paperYear}>{paper.year}</div>

      {done && <div style={S.donePill}>✓ Done</div>}

      <a
        href={paper.pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={S.downloadBtn}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent)'; }}
      >
        ↓ Download PDF
      </a>
    </div>
  );
}

function VideoCard({ item, done, toggling, onToggle, loadingDetailed, loadingShort, onWatchDetailed, onWatchShort }) {
  const hasDetailed = !!item.detailedUrl;
  const hasShort    = !!item.shortUrl;
  return (
    <div
      style={{
        ...S.videoCard,
        background:  done ? 'rgba(16,185,129,0.07)' : 'var(--surface)',
        border:      done ? '1px solid rgba(16,185,129,0.35)' : '1px solid var(--border)',
        borderLeft:  done ? '3px solid #10b981' : undefined,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={S.videoTop}>
        <span style={{ ...S.videoIcon, opacity: done ? 0.55 : 1 }}>▶</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={S.videoBadge}>JEE Mains</span>
          <DoneToggle done={done} loading={toggling} onToggle={onToggle} />
        </div>
      </div>

      <div style={{ ...S.videoTopic, opacity: done ? 0.7 : 1 }}>{item.topic}</div>

      {done && <div style={S.donePill}>✓ Done</div>}

      <div style={S.buttonGroup}>
        <button
          style={{ ...S.watchBtnDetailed, opacity: loadingDetailed ? 0.6 : 1 }}
          onClick={onWatchDetailed}
          disabled={loadingDetailed}
        >
          {loadingDetailed ? 'Finding...' : hasDetailed ? '📘 One-Shot' : '🔍 Find Detailed'}
        </button>
        <button
          style={{ ...S.watchBtnShort, opacity: loadingShort ? 0.6 : 1 }}
          onClick={onWatchShort}
          disabled={loadingShort}
        >
          {loadingShort ? 'Finding...' : hasShort ? '⚡ Revision (10 min)' : '🔍 Find Short'}
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#10b981', borderRadius: 99, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
      {msg}
    </div>
  );
}

function subjectIcon(subj) {
  return subj === 'Mathematics' ? '∑ ' : subj === 'Physics' ? '⚡ ' : '⚗️ ';
}

// ─────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────
const S = {
  page: { paddingBottom: 60 },

  header: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32,
  },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 },
  pageSub:   { fontSize: 13, color: 'var(--text-muted)' },

  searchWrap:  { position: 'relative', display: 'flex', alignItems: 'center', minWidth: 260 },
  searchIcon:  { position: 'absolute', left: 11, fontSize: 18, color: 'var(--text-muted)', pointerEvents: 'none', lineHeight: 1 },
  searchInput: {
    width: '100%', padding: '9px 36px 9px 34px',
    background: 'var(--surface)', border: '1px solid var(--border-2)',
    borderRadius: 8, color: 'var(--text)', fontSize: 13.5, outline: 'none',
    transition: 'border-color 0.15s', fontFamily: 'var(--font-body)',
  },
  clearBtn: { position: 'absolute', right: 10, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', padding: '2px 4px' },

  twoColLayout: { display: 'flex', gap: 28, alignItems: 'flex-start' },
  sidebar: {
    width: 200, flexShrink: 0, position: 'sticky', top: 80,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  sidebarBtn: {
    padding: '12px 16px', background: 'var(--surface-2)',
    border: '1px solid var(--border)', borderRadius: 12,
    color: 'var(--text-muted)', fontSize: 14, fontWeight: 600,
    textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
    fontFamily: 'var(--font-body)',
  },
  sidebarBtnActive: { background: 'var(--accent-bg)', borderColor: 'var(--accent)', color: 'var(--accent-2)' },
  rightContent: { flex: 1, minWidth: 0 },

  progressBox: {
    marginTop: 8, padding: '14px',
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
  },
  progressLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase' },
  progressRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  progressKey:   { fontSize: 12, color: 'var(--text-muted)' },
  progressVal:   { fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' },

  section:       { marginBottom: 8 },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  sectionLabel:  { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 4 },
  sectionTitle:  { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  sectionSub:    { fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 },

  filterWrap:  { display: 'flex', alignItems: 'center', gap: 8 },
  filterLabel: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 },
  select: {
    padding: '6px 12px', background: 'var(--surface)',
    border: '1px solid var(--border-2)', borderRadius: 7,
    color: 'var(--text)', fontSize: 13, cursor: 'pointer', outline: 'none',
    fontFamily: 'var(--font-body)',
  },

  yearGroup: { marginBottom: 24 },
  yearBadge: {
    display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
    color: 'var(--accent)', background: 'var(--accent-bg)',
    border: '1px solid var(--border-accent)', borderRadius: 5,
    padding: '3px 10px', marginBottom: 12,
  },
  paperGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: 12 },

  paperCard: {
    borderRadius: 12, padding: '16px 14px',
    display: 'flex', flexDirection: 'column',
    transition: 'transform 0.18s, background 0.2s, border-color 0.2s',
  },
  shiftBadge: { fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', padding: '2px 8px', borderRadius: 20 },
  paperDate:  { fontSize: 14.5, fontWeight: 700, color: 'var(--text)', marginBottom: 2 },
  paperYear:  { fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, flex: 1 },
  downloadBtn: {
    display: 'block', textAlign: 'center', padding: '8px 0',
    background: 'var(--accent-bg)', color: 'var(--accent)',
    border: '1px solid var(--border-accent)', borderRadius: 7,
    fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
  },

  doneBtn: {
    width: 26, height: 26, borderRadius: '50%', border: '1.5px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, transition: 'all 0.18s', flexShrink: 0, lineHeight: 1,
  },
  donePill: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 10.5, fontWeight: 700,
    color: '#10b981', background: 'rgba(16,185,129,0.12)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: 20, padding: '2px 8px', marginBottom: 8,
  },

  tabRow:       { display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, gap: 0 },
  tab: {
    position: 'relative', padding: '9px 22px',
    background: 'none', border: 'none',
    color: 'var(--text-muted)', fontSize: 13.5, fontWeight: 500,
    cursor: 'pointer', transition: 'color 0.15s', whiteSpace: 'nowrap',
  },
  tabActive:    { color: 'var(--accent)', fontWeight: 600 },
  tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'var(--accent)', borderRadius: '2px 2px 0 0' },

  videoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 },
  videoCard: {
    borderRadius: 12, padding: '16px 16px 14px',
    display: 'flex', flexDirection: 'column',
    transition: 'transform 0.18s, background 0.2s, border-color 0.2s',
  },
  videoTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  videoIcon:  { fontSize: 20, color: '#f43f5e' },
  videoBadge: {
    fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em',
    padding: '2px 7px', borderRadius: 20,
    background: 'rgba(139,92,246,0.10)', color: '#a78bfa',
    border: '1px solid rgba(139,92,246,0.25)',
  },
  videoTopic: { fontSize: 13.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.45, marginBottom: 10, flex: 1 },

  buttonGroup: { display: 'flex', gap: 8, marginTop: 4 },
  watchBtnDetailed: {
    flex: 1, padding: '8px 0',
    background: 'var(--accent-bg)', color: 'var(--accent)',
    border: '1px solid var(--border-accent)', borderRadius: 7,
    fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
    transition: 'opacity 0.15s', fontFamily: 'var(--font-body)', textAlign: 'center',
  },
  watchBtnShort: {
    flex: 1, padding: '8px 0',
    background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
    border: '1px solid rgba(245,158,11,0.3)', borderRadius: 7,
    fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
    transition: 'opacity 0.15s', fontFamily: 'var(--font-body)', textAlign: 'center',
  },

  toast: {
    position: 'fixed', bottom: 24, right: 24, zIndex: 999,
    padding: '10px 16px',
    background: 'var(--surface)', border: '1px solid var(--border-2)',
    borderRadius: 9, fontSize: 13, color: 'var(--text)',
    boxShadow: 'var(--shadow-md)',
    display: 'flex', alignItems: 'center',
  },
};