import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, Badge, Button, Spinner, EmptyState } from '../../components/common/UI';

const STAGES = [
  { key: 'applied',    label: 'Applied',    color: 'accent'  },
  { key: 'reviewing',  label: 'Reviewing',  color: 'accent'  },
  { key: 'interview',  label: 'Interview',  color: 'purple'  },
  { key: 'offer',      label: 'Offer',      color: 'green'   },
  { key: 'rejected',   label: 'Rejected',   color: 'red'     },
];

export default function MyApplications() {
  const [apps, setApps]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]     = useState('kanban'); // 'kanban' | 'list'
  const [withdrawing, setWithdrawing] = useState(null);

  useEffect(() => {
    api.get('/applications/my').then(r => setApps(r.data)).finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    setWithdrawing(id);
    try {
      await api.delete(`/applications/${id}`);
      setApps(a => a.filter(x => x._id !== id));
    } finally { setWithdrawing(null); }
  };

  if (loading) return <Spinner />;

  const grouped = STAGES.reduce((acc, s) => {
    acc[s.key] = apps.filter(a => a.status === s.key);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="My Applications"
        subtitle={`${apps.length} total application${apps.length !== 1 ? 's' : ''}`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            {['kanban','list'].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${view===v?'var(--accent)':'var(--border)'}`, background: view===v?'rgba(0,200,248,.12)':'var(--card)', color: view===v?'var(--accent)':'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', textTransform: 'capitalize' }}>
                {v}
              </button>
            ))}
          </div>
        }
      />

      {apps.length === 0 ? (
        <EmptyState icon="◎" title="No applications yet" message="Browse jobs and start applying!" />
      ) : view === 'kanban' ? (
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {STAGES.map(stage => (
            <div key={stage.key} style={{ minWidth: 210, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--${stage.color})` }} />
                <span style={{ color: `var(--${stage.color})`, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: .5 }}>{stage.label}</span>
                <span style={{ marginLeft: 'auto', background: `rgba(var(--${stage.color}-rgb),.15)`, color: `var(--${stage.color})`, fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, border: `1px solid var(--${stage.color})`, opacity: .7 }}>
                  {grouped[stage.key].length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {grouped[stage.key].length === 0 && (
                  <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '20px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Empty</div>
                )}
                {grouped[stage.key].map(a => (
                  <AppKanbanCard key={a._id} app={a} onWithdraw={handleWithdraw} withdrawing={withdrawing === a._id} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', padding: '11px 20px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, gap: 16 }}>
            <span>Role</span><span>Company</span><span>Date</span><span>Status</span>
          </div>
          {apps.map((a, i) => (
            <div key={a._id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', padding: '13px 20px', borderBottom: i < apps.length - 1 ? '1px solid var(--border)' : 'none', gap: 16, alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{a.job?.title}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{a.job?.company}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(a.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
              <Badge color={STAGES.find(s=>s.key===a.status)?.color||'accent'}>{a.status}</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function AppKanbanCard({ app, onWithdraw, withdrawing }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 14px' }}>
      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13, marginBottom: 3 }}>{app.job?.title}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>{app.job?.company}</div>
      {app.job?.stipend && <div style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{app.job.stipend}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{new Date(app.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
        {app.status === 'applied' && (
          <button onClick={() => onWithdraw(app._id)} disabled={withdrawing}
            style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 11, cursor: 'pointer', opacity: withdrawing ? .5 : 1, fontFamily: 'Outfit,sans-serif' }}>
            Withdraw
          </button>
        )}
      </div>
    </div>
  );
}
