import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PageHeader, Card, Badge, Button, Spinner, EmptyState } from '../../components/common/UI';

const TYPES  = ['All', 'Engineering', 'AI/ML', 'Design', 'Data', 'Marketing', 'Finance'];
const MODES  = ['All', 'Remote', 'On-site', 'Hybrid'];
const DURATIONS = ['All', '1 month', '2 months', '3 months', '6 months'];

export default function BrowseInternships() {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [type, setType]         = useState('All');
  const [mode, setMode]         = useState('All');
  const [duration, setDuration] = useState('All');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]       = useState(0);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8, listingKind: 'internship' };
      if (search)           params.search   = search;
      if (type !== 'All')   params.type     = type;
      if (mode !== 'All')   params.workMode = mode;
      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs);
      setTotalPages(data.pages);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [search, type, mode, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div>
      <PageHeader
        title="Internships"
        subtitle={`${total} internship${total !== 1 ? 's' : ''} available`}
      />

      {/* Filter tabs row */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <span style={{ fontSize:12, color:'var(--text-muted)', marginRight:4 }}>Category</span>
        {TYPES.map(t => (
          <button key={t} onClick={() => { setType(t); setPage(1); }}
            style={{ padding:'6px 13px', borderRadius:20, border:`1px solid ${type===t?'var(--accent)':'var(--border)'}`, background:type===t?'rgba(0,200,248,.12)':'var(--card)', color:type===t?'var(--accent)':'var(--text-muted)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'Outfit,sans-serif', transition:'all .15s' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <span style={{ fontSize:12, color:'var(--text-muted)', marginRight:4 }}>Work Mode</span>
        {MODES.map(m => (
          <button key={m} onClick={() => { setMode(m); setPage(1); }}
            style={{ padding:'6px 13px', borderRadius:20, border:`1px solid ${mode===m?'var(--purple)':'var(--border)'}`, background:mode===m?'rgba(157,125,245,.12)':'var(--card)', color:mode===m?'var(--purple)':'var(--text-muted)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'Outfit,sans-serif', transition:'all .15s' }}>
            {m}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ marginBottom:22 }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search internship titles or companies..."
          style={{ width:'100%', background:'var(--card)', border:'1px solid var(--border)', borderRadius:9, padding:'10px 16px', color:'var(--text)', fontSize:14, outline:'none', fontFamily:'Outfit,sans-serif' }} />
      </div>

      {loading ? <Spinner /> : jobs.length === 0 ? (
        <EmptyState icon="◈" title="No internships found" message="Try adjusting your filters or search." />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {jobs.map(job => <InternshipCard key={job._id} job={job} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:28 }}>
          <Button variant="secondary" size="sm" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</Button>
          <span style={{ color:'var(--text-muted)', fontSize:13, padding:'6px 12px' }}>Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Next →</Button>
        </div>
      )}
    </div>
  );
}

function InternshipCard({ job }) {
  const [hovered, setHovered] = useState(false);
  const daysAgo = Math.floor((Date.now() - new Date(job.createdAt)) / 86400000);

  return (
    <Card
      style={{ borderColor: hovered ? 'var(--border-hi)' : 'var(--border)', background: hovered ? 'var(--card-hover)' : 'var(--card)', padding:'20px 22px' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>

      {/* Internship pill */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, gap:12 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div style={{ width:44, height:44, borderRadius:10, background:'linear-gradient(135deg,rgba(0,200,248,.2),rgba(0,229,160,.15))', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:700, color:'var(--accent)', flexShrink:0 }}>
            {job.company?.[0]}
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
              <div style={{ fontFamily:'DM Serif Display,serif', fontSize:16, color:'var(--text)' }}>{job.title}</div>
              <span style={{ background:'rgba(0,229,160,.12)', border:'1px solid rgba(0,229,160,.3)', color:'var(--green)', fontSize:10, fontWeight:700, padding:'1px 8px', borderRadius:20, textTransform:'uppercase', letterSpacing:.5 }}>Internship</span>
            </div>
            <div style={{ fontSize:13, color:'var(--text-muted)' }}>{job.company} · {job.location}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, flexShrink:0, flexWrap:'wrap', justifyContent:'flex-end' }}>
          <Badge color="accent">{job.workMode}</Badge>
          <Badge color="purple">{job.type}</Badge>
        </div>
      </div>

      <p style={{ fontSize:13, color:'var(--text-dim)', marginBottom:14, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
        {job.description}
      </p>

      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
        {job.tags?.slice(0,4).map(t => (
          <span key={t} style={{ background:'rgba(0,200,248,.08)', border:'1px solid rgba(0,200,248,.2)', color:'var(--accent)', fontSize:11, padding:'2px 9px', borderRadius:12 }}>{t}</span>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:16, alignItems:'center' }}>
          {job.stipend && <span style={{ color:'var(--green)', fontWeight:700, fontSize:15 }}>{job.stipend}</span>}
          {job.duration && <span style={{ color:'var(--text-muted)', fontSize:12 }}>⏱ {job.duration}</span>}
          <span style={{ color:'var(--text-muted)', fontSize:12 }}>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
        </div>
        <Link to={`/student/internships/${job._id}`}>
          <Button variant="primary" size="sm">View & Apply</Button>
        </Link>
      </div>
    </Card>
  );
}
