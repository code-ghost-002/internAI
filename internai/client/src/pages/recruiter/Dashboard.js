import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard, PageHeader, Card, Badge, Spinner, Button } from '../../components/common/UI';

const STATUS_COLOR = { applied:'accent', reviewing:'accent', interview:'purple', offer:'green', rejected:'red' };

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [apps, setApps]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users/stats'),
      api.get('/applications/recruiter'),
    ]).then(([s, a]) => {
      setStats(s.data);
      setApps(a.data.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={`${user?.company || 'Your'} Dashboard`}
        subtitle="Overview of your job postings and candidate pipeline."
        action={<Link to="/recruiter/post-job"><Button variant="primary">+ Post a Job</Button></Link>}
      />

      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <StatCard label="Active Jobs"      value={stats?.activeJobs ?? 0}       sub="open postings"     color="accent"  />
        <StatCard label="Total Applicants" value={stats?.totalApplicants ?? 0}  sub="across all roles"  color="purple"  />
        <StatCard label="Interviews Set"   value={stats?.interviews ?? 0}        sub="in progress"       color="green"   />
        <StatCard label="Offers Made"      value={stats?.offers ?? 0}            sub="this cycle"        color="amber"   />
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Recent Applicants</h2>

      {apps.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>◎</div>
            <div>No applicants yet. <Link to="/recruiter/post-job">Post a job</Link> to get started.</div>
          </div>
        </Card>
      ) : (
        <Card style={{ padding: 0 }}>
          {apps.map((a, i) => (
            <div key={a._id} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: i < apps.length - 1 ? '1px solid var(--border)' : 'none', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(0,200,248,.2),rgba(157,125,245,.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--accent)', fontSize: 14, flexShrink: 0 }}>
                {a.student?.name?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{a.student?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Applied for {a.job?.title}</div>
              </div>
              {a.aiMatchScore > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.aiMatchScore >= 80 ? 'var(--green)' : 'var(--amber)' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: a.aiMatchScore >= 80 ? 'var(--green)' : 'var(--amber)' }}>{a.aiMatchScore}%</span>
                </div>
              )}
              <Badge color={STATUS_COLOR[a.status] || 'accent'}>{a.status}</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
