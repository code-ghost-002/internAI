import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { PageHeader, Card, Badge, Button, Spinner, EmptyState } from '../../components/common/UI';

const STATUSES = ['applied','reviewing','interview','offer','rejected'];
const STATUS_COLOR = { applied:'accent', reviewing:'accent', interview:'purple', offer:'green', rejected:'red', withdrawn:'red' };

export default function Applicants() {
  const [searchParams] = useSearchParams();
  const jobIdFilter = searchParams.get('jobId');

  const [apps, setApps]       = useState([]);
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob]   = useState(jobIdFilter || 'all');
  const [updating, setUpdating]         = useState(null);
  const [expanded, setExpanded]         = useState(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedJob !== 'all') params.jobId = selectedJob;
      if (statusFilter !== 'all') params.status = statusFilter;
      const [appsRes, jobsRes] = await Promise.all([
        api.get('/applications/recruiter', { params }),
        api.get('/jobs/my-jobs'),
      ]);
      setApps(appsRes.data);
      setJobs(jobsRes.data);
    } finally { setLoading(false); }
  }, [selectedJob, statusFilter]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const updateStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      const { data } = await api.put(`/applications/${appId}/status`, { status });
      setApps(as => as.map(a => a._id === appId ? { ...a, status: data.status } : a));
    } finally { setUpdating(null); }
  };

  return (
    <div>
      <PageHeader
        title="Applicants"
        subtitle={`${apps.length} candidate${apps.length !== 1 ? 's' : ''} ${statusFilter !== 'all' ? `· ${statusFilter}` : ''}`}
      />

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:22, flexWrap:'wrap' }}>
        <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)}
          style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:9, padding:'8px 12px', color:'var(--text)', fontSize:13, fontFamily:'Outfit,sans-serif', outline:'none', cursor:'pointer' }}>
          <option value="all">All Jobs</option>
          {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding:'7px 13px', borderRadius:8, border:`1px solid ${statusFilter===s?'var(--accent)':'var(--border)'}`, background:statusFilter===s?'rgba(0,200,248,.12)':'var(--card)', color:statusFilter===s?'var(--accent)':'var(--text-muted)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'Outfit,sans-serif', textTransform:'capitalize', transition:'all .15s' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : apps.length === 0 ? (
        <EmptyState icon="◎" title="No applicants found" message="Try adjusting your filters." />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {apps.map(app => (
            <ApplicantCard key={app._id} app={app} onUpdateStatus={updateStatus}
              updating={updating === app._id} expanded={expanded === app._id}
              onToggle={() => setExpanded(expanded === app._id ? null : app._id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicantCard({ app, onUpdateStatus, updating, expanded, onToggle }) {
  const score = app.aiMatchScore;
  const scoreColor = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--accent)' : 'var(--amber)';

  return (
    <Card style={{ padding:'18px 20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,rgba(0,200,248,.2),rgba(157,125,245,.2))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'var(--accent)', fontSize:15, flexShrink:0 }}>
          {app.student?.name?.[0]}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:600, color:'var(--text)', fontSize:15, marginBottom:2 }}>{app.student?.name}</div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>
            {app.student?.email} · Applied for {app.job?.title}
          </div>
          {app.student?.skills?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:8 }}>
              {app.student.skills.slice(0,5).map(s=>(
                <span key={s} style={{ background:'rgba(0,200,248,.08)', border:'1px solid rgba(0,200,248,.2)', color:'var(--accent)', fontSize:11, padding:'1px 8px', borderRadius:10 }}>{s}</span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display:'flex', gap:10, alignItems:'center', flexShrink:0, flexWrap:'wrap' }}>
          {score > 0 && (
            <div style={{ textAlign:'center' }}>
              <div style={{ color:scoreColor, fontWeight:700, fontSize:18 }}>{score}%</div>
              <div style={{ color:'var(--text-muted)', fontSize:10 }}>AI Match</div>
            </div>
          )}
          <Badge color={STATUS_COLOR[app.status] || 'accent'}>{app.status}</Badge>
          <button onClick={onToggle}
            style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:16, cursor:'pointer', padding:'4px 6px' }}>
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop:18, paddingTop:18, borderTop:'1px solid var(--border)', animation:'fadeInUp .2s ease both' }}>
          {app.coverLetter && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>Cover Letter</div>
              <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6, background:'var(--surface)', padding:'12px 14px', borderRadius:8, whiteSpace:'pre-wrap' }}>{app.coverLetter}</p>
            </div>
          )}
          {app.student?.education?.institution && (
            <div style={{ marginBottom:16, fontSize:13, color:'var(--text-dim)' }}>
              🎓 {app.student.education.degree} in {app.student.education.field} — {app.student.education.institution} ({app.student.education.graduationYear})
            </div>
          )}
          <div>
            <div style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:10 }}>Update Status</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {STATUSES.map(s => (
                <button key={s} onClick={() => onUpdateStatus(app._id, s)}
                  disabled={updating || app.status === s}
                  style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${app.status===s?'var(--accent)':'var(--border)'}`, background:app.status===s?'rgba(0,200,248,.12)':'var(--card)', color:app.status===s?'var(--accent)':'var(--text-muted)', fontSize:12, fontWeight:500, cursor:app.status===s?'default':'pointer', fontFamily:'Outfit,sans-serif', textTransform:'capitalize', opacity:updating?.5:1, transition:'all .15s' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
