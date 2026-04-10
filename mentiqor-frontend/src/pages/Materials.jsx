import { useState, useCallback } from 'react';

// ─────────────────────────────────────────────────
//  CONFIG — replace with your actual Supabase URL
// ─────────────────────────────────────────────────
const SUPABASE_URL = 'https://uijmprfzqxmluiuuftod.supabase.co';
const BUCKET       = 'pyq-papers';
const YT_KEY       = import.meta.env.VITE_YOUTUBE_API_KEY;

// ─────────────────────────────────────────────────
//  STATIC DATA — PYQ Papers
// ─────────────────────────────────────────────────
const pdf = (year, date, shift, slug) => ({
  year, date, shift,
  pdfUrl: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${year}/${slug}_shift${shift}.pdf`,
});

const shifts = (year, date, slug, numShifts = 2) => {
  const result = [];
  for (let i = 1; i <= numShifts; i++) {
    result.push(pdf(year, date, i, slug));
  }
  return result;
};

const PYQ_PAPERS = [
  // ===== 2025 =====
  ...shifts('2025', 'Jan 22', 'jan22'),
  ...shifts('2025', 'Jan 23', 'jan23'),
  ...shifts('2025', 'Jan 24', 'jan24'),
  ...shifts('2025', 'Jan 28', 'jan28'),
  ...shifts('2025', 'Jan 29', 'jan29'),
  // Add more 2025 dates here as you upload PDFs

  // ===== 2024 =====
  ...shifts('2024', 'Jan 27', 'jan27'),
  ...shifts('2024', 'Jan 29', 'jan29'),
  ...shifts('2024', 'Jan 30', 'jan30'),
  ...shifts('2024', 'Jan 31', 'jan31'),
  ...shifts('2024', 'Feb 1', 'feb1'),
  ...shifts('2024', 'Apr 4', 'apr4'),
  ...shifts('2024', 'Apr 8', 'apr8'),

  // ===== 2023 =====
  ...shifts('2023', 'Jan 24', 'jan24'),
  ...shifts('2023', 'Jan 25', 'jan25'),
  ...shifts('2023', 'Apr 6', 'apr6'),
  ...shifts('2023', 'Apr 13', 'apr13'),

  // ===== 2022 =====
  ...shifts('2022', 'Jun 24', 'jun24'),
  ...shifts('2022', 'Jun 25', 'jun25'),
  ...shifts('2022', 'Jul 25', 'jul25'),
];

const PYQ_YEARS = [...new Set(PYQ_PAPERS.map(p => p.year))].sort((a,b) => b - a);

// ─────────────────────────────────────────────────
//  STATIC DATA — Video Playlists
// ─────────────────────────────────────────────────
const PLAYLISTS = [
  // Mathematics
  { subject: 'Mathematics', topic: 'Limits, Continuity & Differentiability', videoUrl: '' },
  { subject: 'Mathematics', topic: 'Integration & Differential Equations',   videoUrl: '' },
  { subject: 'Mathematics', topic: 'Coordinate Geometry',                    videoUrl: 'https://www.youtube.com/playlist?list=PLu0W_9lII9agICnT8t4iYVSZ3eykIAOME' },
  { subject: 'Mathematics', topic: 'Vectors & 3D Geometry',                  videoUrl: '' },
  { subject: 'Mathematics', topic: 'Probability & Statistics',               videoUrl: '' },
  { subject: 'Mathematics', topic: 'Complex Numbers & Quadratic Equations',  videoUrl: '' },
  { subject: 'Mathematics', topic: 'Matrices & Determinants',                videoUrl: '' },
  { subject: 'Mathematics', topic: 'Trigonometry',                           videoUrl: '' },
  // Physics
  { subject: 'Physics', topic: 'Mechanics — Laws of Motion',     videoUrl: '' },
  { subject: 'Physics', topic: 'Work, Energy & Power',           videoUrl: '' },
  { subject: 'Physics', topic: 'Rotational Motion',              videoUrl: '' },
  { subject: 'Physics', topic: 'Electrostatics',                 videoUrl: 'https://www.youtube.com/playlist?list=PLF_7kfnwLFCF7NBFr1QVGBIVXbRKGV3UG' },
  { subject: 'Physics', topic: 'Current Electricity',            videoUrl: '' },
  { subject: 'Physics', topic: 'Magnetic Effects of Current',    videoUrl: '' },
  { subject: 'Physics', topic: 'Optics',                         videoUrl: '' },
  { subject: 'Physics', topic: 'Modern Physics & Dual Nature',   videoUrl: '' },
  { subject: 'Physics', topic: 'Waves & Thermodynamics',         videoUrl: '' },
  // Chemistry
  { subject: 'Chemistry', topic: 'Chemical Bonding & Molecular Structure', videoUrl: '' },
  { subject: 'Chemistry', topic: 'Equilibrium',                            videoUrl: '' },
  { subject: 'Chemistry', topic: 'Electrochemistry',                       videoUrl: '' },
  { subject: 'Chemistry', topic: 'Coordination Compounds',                 videoUrl: 'https://www.youtube.com/playlist?list=PLpIJq64f7kxWBZiqLlJYy0r8RTa_TBmLm' },
  { subject: 'Chemistry', topic: 'Organic Chemistry — GOC & Hydrocarbons', videoUrl: '' },
  { subject: 'Chemistry', topic: 'Aldehydes, Ketones & Carboxylic Acids',  videoUrl: '' },
  { subject: 'Chemistry', topic: 'Biomolecules & Polymers',                videoUrl: '' },
  { subject: 'Chemistry', topic: 'p-Block & d-Block Elements',             videoUrl: '' },
];

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry'];

// ─────────────────────────────────────────────────
//  YOUTUBE FALLBACK
// ─────────────────────────────────────────────────
async function searchYouTubePlaylist(topic) {
  if (!YT_KEY) {
    // No API key — fall back to a search URL
    const q = encodeURIComponent(`${topic} JEE Mains playlist`);
    return `https://www.youtube.com/results?search_query=${q}`;
  }
  const q   = encodeURIComponent(`${topic} JEE Mains playlist`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${q}&type=video&key=${YT_KEY}`;
  try {
    const res  = await fetch(url);
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
  shift === 1 ? { bg: 'rgba(168,106,58,0.12)', color: 'var(--accent)' }
              : { bg: 'rgba(167,139,250,0.10)', color: '#a78bfa' };

// ─────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────
export default function Materials() {
  const [search,      setSearch]      = useState('');
  const [yearFilter,  setYearFilter]  = useState('All');
  const [activeSubj,  setActiveSubj]  = useState('Mathematics');
  const [loadingVids, setLoadingVids] = useState({});  // topic → bool
  // ✨ NEW: Sidebar active section
  const [activeSection, setActiveSection] = useState('pyq'); // 'pyq' or 'videos'

  // ── PYQ filter ──
  const filteredPYQ = PYQ_PAPERS.filter(p => {
    const matchYear = yearFilter === 'All' || p.year === yearFilter;
    const q = search.toLowerCase();
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
  const handleWatch = useCallback(async (v) => {
    if (v.videoUrl) { window.open(v.videoUrl, '_blank'); return; }
    setLoadingVids(prev => ({ ...prev, [v.topic]: true }));
    const url = await searchYouTubePlaylist(v.topic);
    setLoadingVids(prev => ({ ...prev, [v.topic]: false }));
    window.open(url, '_blank');
  }, []);

  return (
    <div className="fade-up" style={S.page}>

      {/* ── Page header ── */}
      <div style={S.header}>
        <div>
          <h2 style={S.pageTitle}>📚 Study Materials</h2>
          <p style={S.pageSub}>PYQ papers (shift-wise) · topic-wise video playlists</p>
        </div>

        {/* Search */}
        <div style={S.searchWrap}>
          <span style={S.searchIcon}>⌕</span>
          <input
            style={S.searchInput}
            placeholder="Search papers or topics…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e  => { e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e   => { e.target.style.borderColor = 'var(--border-2)'; }}
          />
          {search && (
            <button style={S.clearBtn} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* ✨ NEW: Two-column layout with sidebar */}
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
        </div>

        {/* RIGHT CONTENT */}
        <div style={S.rightContent}>
          {activeSection === 'pyq' && (
            <>
              {/* ══════════════════════════════════════════
                  SECTION A — PYQ Papers (exactly as you wrote)
              ══════════════════════════════════════════ */}
              <section style={S.section}>
                {/* Section header */}
                <div style={S.sectionHeader}>
                  <div>
                    <div style={S.sectionLabel}>SECTION A</div>
                    <h3 style={S.sectionTitle}>📄 PYQ Papers <span style={S.sectionSub}>Shift-wise</span></h3>
                  </div>
                  {/* Year filter */}
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
                  /* Group by year */
                  PYQ_YEARS
                    .filter(y => yearFilter === 'All' || y === yearFilter)
                    .map(year => {
                      const papers = filteredPYQ.filter(p => p.year === year);
                      if (!papers.length) return null;
                      return (
                        <div key={year} style={S.yearGroup}>
                          <div style={S.yearBadge}>{year}</div>
                          <div style={S.paperGrid}>
                            {papers.map((p, i) => (
                              <PaperCard key={i} paper={p} />
                            ))}
                          </div>
                        </div>
                      );
                    })
                )}
              </section>
            </>
          )}

          {activeSection === 'videos' && (
            <>
              {/* ══════════════════════════════════════════
                  SECTION B — Video Playlists (exactly as you wrote)
              ══════════════════════════════════════════ */}
              <section style={S.section}>
                <div style={S.sectionHeader}>
                  <div>
                    <div style={S.sectionLabel}>SECTION B</div>
                    <h3 style={S.sectionTitle}>▶️ Video Playlists <span style={S.sectionSub}>Topic-wise</span></h3>
                  </div>
                </div>

                {/* Subject tabs */}
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
                    {filteredVideos.map((v, i) => (
                      <VideoCard
                        key={i}
                        item={v}
                        loading={!!loadingVids[v.topic]}
                        onWatch={() => handleWatch(v)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────

function PaperCard({ paper }) {
  const sc = shiftColor(paper.shift);
  return (
    <div
      style={S.paperCard}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';        e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontSize: 24 }}>📄</div>
        <span style={{ ...S.shiftBadge, background: sc.bg, color: sc.color }}>
          Shift {paper.shift}
        </span>
      </div>

      <div style={S.paperDate}>{paper.date}</div>
      <div style={S.paperYear}>{paper.year}</div>

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

function VideoCard({ item, loading, onWatch }) {
  const hasLink = !!item.videoUrl;
  return (
    <div
      style={S.videoCard}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';        e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={S.videoTop}>
        <span style={S.videoIcon}>▶</span>
        {!hasLink && (
          <span style={S.ytBadge}>YT Search</span>
        )}
      </div>
      <div style={S.videoTopic}>{item.topic}</div>

      <button
        style={{ ...S.watchBtn, opacity: loading ? 0.6 : 1 }}
        onClick={onWatch}
        disabled={loading}
      >
        {loading ? 'Finding…' : hasLink ? 'Watch Playlist →' : 'Find & Watch →'}
      </button>
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
  page: {
    paddingBottom: 60,
  },

  /* Header */
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 800,
    color: 'var(--text)',
    marginBottom: 4,
  },
  pageSub: {
    fontSize: 13,
    color: 'var(--text-muted)',
  },

  /* Search */
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: 260,
  },
  searchIcon: {
    position: 'absolute',
    left: 11,
    fontSize: 18,
    color: 'var(--text-muted)',
    pointerEvents: 'none',
    lineHeight: 1,
  },
  searchInput: {
    width: '100%',
    padding: '9px 36px 9px 34px',
    background: 'var(--surface)',
    border: '1px solid var(--border-2)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: 13.5,
    outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'var(--font-body)',
  },
  clearBtn: {
    position: 'absolute',
    right: 10,
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 12,
    cursor: 'pointer',
    padding: '2px 4px',
  },

  /* Section */
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: 'var(--text-muted)',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text)',
  },
  sectionSub: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--text-muted)',
    marginLeft: 6,
  },

  /* Year filter */
  filterWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  select: {
    padding: '6px 12px',
    background: 'var(--surface)',
    border: '1px solid var(--border-2)',
    borderRadius: 7,
    color: 'var(--text)',
    fontSize: 13,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'var(--font-body)',
  },

  /* Year group */
  yearGroup: {
    marginBottom: 24,
  },
  yearBadge: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--accent)',
    background: 'var(--accent-bg)',
    border: '1px solid var(--border-accent)',
    borderRadius: 5,
    padding: '3px 10px',
    marginBottom: 12,
  },
  paperGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))',
    gap: 12,
  },

  /* Paper card */
  paperCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '16px 14px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.18s, border-color 0.18s',
    cursor: 'default',
  },
  shiftBadge: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: '0.04em',
    padding: '2px 8px',
    borderRadius: 20,
  },
  paperDate: {
    fontSize: 14.5,
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: 2,
  },
  paperYear: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginBottom: 14,
    flex: 1,
  },
  downloadBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '8px 0',
    background: 'var(--accent-bg)',
    color: 'var(--accent)',
    border: '1px solid var(--border-accent)',
    borderRadius: 7,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
  },

  /* Section divider (kept but not used because sections are separate; no harm) */
  divider: {
    height: 1,
    background: 'var(--border)',
    margin: '36px 0',
  },

  /* Subject tabs */
  tabRow: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    marginBottom: 24,
    gap: 0,
  },
  tab: {
    position: 'relative',
    padding: '9px 22px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 13.5,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 0.15s',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    color: 'var(--accent)',
    fontWeight: 600,
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

  /* Video grid */
  videoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12,
  },

  /* Video card */
  videoCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '16px 16px 14px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.18s, border-color 0.18s',
  },
  videoTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  videoIcon: {
    fontSize: 20,
    color: '#f43f5e',
  },
  ytBadge: {
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: '0.05em',
    padding: '2px 7px',
    borderRadius: 20,
    background: 'rgba(251,191,36,0.10)',
    color: 'var(--warning, #f59e0b)',
    border: '1px solid rgba(251,191,36,0.25)',
  },
  videoTopic: {
    fontSize: 13.5,
    fontWeight: 600,
    color: 'var(--text)',
    lineHeight: 1.45,
    marginBottom: 14,
    flex: 1,
  },
  watchBtn: {
    padding: '8px 0',
    background: 'var(--accent-bg)',
    color: 'var(--accent)',
    border: '1px solid var(--border-accent)',
    borderRadius: 7,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    fontFamily: 'var(--font-body)',
    textAlign: 'center',
  },

  // ✨ NEW STYLES FOR SIDEBAR LAYOUT
  twoColLayout: {
    display: 'flex',
    gap: 28,
    alignItems: 'flex-start',
  },
  sidebar: {
    width: 200,
    flexShrink: 0,
    position: 'sticky',
    top: 80,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sidebarBtn: {
    padding: '12px 16px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    color: 'var(--text-muted)',
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-body)',
  },
  sidebarBtnActive: {
    background: 'var(--accent-bg)',
    borderColor: 'var(--accent)',
    color: 'var(--accent-2)',
  },
  rightContent: {
    flex: 1,
    minWidth: 0, // prevents overflow
  },
};