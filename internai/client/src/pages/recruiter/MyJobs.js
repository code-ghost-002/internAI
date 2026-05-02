import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PageHeader, Card, Badge, Button, Spinner, EmptyState } from '../../components/common/UI';

export default function MyJobs() {
  const [jobs, setJobs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { api.get('/jobs/my-jobs').then(r => setJobs(r.data)).finally(() => setLoading(false)); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    setDeleting(id);
    try { await api.delete(`/jobs/${id}`); setJobs(j => j.filter(x => x._id !== id)); }
    finally { setDeleting(null); }
  };

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const { data } = await api.put(`/jobs/${job._id}`, { status: newStatus });
      setJobs(js => js.map(j => j._id === job._id ? data : j));
    } catch {}
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="My Job Postings"
        subtitle={`${jobs.filter(j=>j.status==='active').length} active · ${jobs.length} total`}
        action={<Link to="/recruiter/post-job"><Button variant="primary">+ Post New Job</Button></Link>}
      />

      {jobs.length === 0 ? (
        <EmptyState icon="◈" title="No jobs posted yet" message="Post your first internship to start receiving applications." />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {jobs.map(job => (
            <Card key={job._id} style={{ padding:'20px 22px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:14, flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4 }}>
                    <h3 style={{ fontFamily:'DM Serif Display,serif', fontSize:17, color:'var(--text)' }}>{job.title}</h3>
                    <Badge color={job.status==='active'?'green':'red'}>{job.status}</Badge>
                    <Badge color={job.listingKind==='internship'?'accent':'purple'}>
                      {job.listingKind==='internship' ? 'Internship' : 'Full-time'}
                    </Badge>
                    <Badge color="accent">{job.workMode}</Badge>
                  </div>
                  <div style={{ color:'var(--text-muted)', fontSize:13, marginBottom:10 }}>
                    {job.company} · {job.location} {job.stipend && `· ${job.stipend}`}
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                    {job.tags?.slice(0,4).map(t=>(
                      <span key={t} style={{ background:'rgba(0,200,248,.08)', border:'1px solid rgba(0,200,248,.2)', color:'var(--accent)', fontSize:11, padding:'2px 9px', borderRadius:12 }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:18 }}>
                    <span style={{ fontSize:13, color:'var(--text-muted)' }}>👥 {job.applicantCount || 0} applicants</span>
                    <span style={{ fontSize:13, color:'var(--text-muted)' }}>🗓 {new Date(job.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                    {job.applicationDeadline && <span style={{ fontSize:13, color:'var(--amber)' }}>Deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, flexShrink:0, flexWrap:'wrap' }}>
                  <Button variant="ghost" size="sm" onClick={() => toggleStatus(job)}>
                    {job.status==='active' ? 'Close' : 'Reopen'}
                  </Button>
                  <Link to={`/recruiter/applicants?jobId=${job._id}`}>
                    <Button variant="secondary" size="sm">View Applicants</Button>
                  </Link>
                  <Button variant="danger" size="sm" loading={deleting===job._id} onClick={()=>handleDelete(job._id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
