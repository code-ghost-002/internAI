import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard, PageHeader, Card, Badge, Spinner, Button } from '../../components/common/UI';

const STATUS_COLOR = { applied:'accent', reviewing:'accent', interview:'purple', offer:'green', rejected:'red', withdrawn:'red' };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([
          api.get('/users/stats'),
          api.get('/applications/my'),
        ]);
        setStats(s.data);
        setApps(a.data.slice(0, 5));
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's a snapshot of your internship journey."
        action={<Link to="/student/jobs"><Button variant="primary">Browse Jobs</Button></Link>}
      />

      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <StatCard label="Applications" value={stats?.total ?? 0} sub="total submitted" color="accent" />
        <StatCard label="Interviews" value={stats?.interview ?? 0} sub="scheduled" color="purple" />
        <StatCard label="Offers" value={stats?.offer ?? 0} sub="received" color="green" />
        <StatCard label="AI Score" value={stats?.aiScore ? `${stats.aiScore}%` : '—'} sub="profile strength" color="amber" />
      </div>

      {!user?.aiScore && (
        <Card style={{ marginBottom: 24, borderColor: 'rgba(0,200,248,.3)', background: 'rgba(0,200,248,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>✦ Analyze your resume with AI</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Get a score, improvement tips, and matched job roles in seconds.</div>
            </div>
            <Link to="/student/ai-resume"><Button variant="primary" size="sm">Analyze Now</Button></Link>
          </div>
        </Card>
      )}

      <h2 style={{ fontSize: 17, fontFamily: 'Outfit,sans-serif', fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Recent Applications</h2>

      {apps.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>◎</div>
            <div>No applications yet. <Link to="/student/jobs">Browse jobs</Link> to get started.</div>
          </div>
        </Card>
      ) : (
        <Card style={{ padding: 0 }}>
          {apps.map((a, i) => (
            <div key={a._id} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: i < apps.length - 1 ? '1px solid var(--border)' : 'none', gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14, marginBottom: 2 }}>{a.job?.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.job?.company} · {a.job?.location}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <Badge color={STATUS_COLOR[a.status] || 'accent'}>{a.status}</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
