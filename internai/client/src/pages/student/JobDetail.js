import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card, Badge, Button, Spinner, Alert, Textarea } from '../../components/common/UI';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => setJob(r.data)).finally(() => setLoading(false));
  }, [id]);

  const generateCoverLetter = async () => {
    setAiGenerating(true);
    try {
      const { data } = await api.post('/ai/cover-letter', { jobId: id });
      setCoverLetter(data.coverLetter);
    } catch (e) {
      setError('Could not generate cover letter. Add your resume first.');
    } finally { setAiGenerating(false); }
  };

  const handleApply = async () => {
    setApplying(true); setError('');
    try {
      await api.post(`/applications/${id}`, { coverLetter });
      setSuccess(true);
      setShowModal(false);
    } catch (e) {
      setError(e.response?.data?.error || 'Application failed');
    } finally { setApplying(false); }
  };

  if (loading) return <Spinner />;
  if (!job) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Job not found.</div>;

  return (
    <div style={{ maxWidth: 780 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', marginBottom: 20, fontFamily: 'Outfit,sans-serif' }}>
        ← Back
      </button>

      <Alert type="success" message={success ? '🎉 Application submitted! Check your Applications tab.' : ''} />
      <Alert type="error" message={error} />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,rgba(0,200,248,.2),rgba(157,125,245,.2))', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
              {job.company?.[0]}
            </div>
            <div>
              <h1 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>{job.title}</h1>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{job.company} · {job.location}</div>
            </div>
          </div>
          {!success && <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>Apply Now</Button>}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
          <Badge color="accent">{job.workMode}</Badge>
          <Badge color="purple">{job.type}</Badge>
          {job.duration && <Badge color="amber">{job.duration}</Badge>}
          {job.stipend && <Badge color="green">{job.stipend}</Badge>}
          {job.openings && <Badge color="accent">{job.openings} opening{job.openings > 1 ? 's' : ''}</Badge>}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 18, color: 'var(--text)', marginBottom: 14 }}>About the Role</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{job.description}</p>
      </Card>

      {job.requirements && (
        <Card style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 18, color: 'var(--text)', marginBottom: 14 }}>Requirements</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
        </Card>
      )}

      {job.tags?.length > 0 && (
        <Card>
          <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 18, color: 'var(--text)', marginBottom: 14 }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {job.tags.map(t => <Badge key={t} color="accent">{t}</Badge>)}
          </div>
        </Card>
      )}

      {/* Apply Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'DM Serif Display,serif', color: 'var(--text)', fontSize: 20 }}>Apply to {job.title}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <Alert type="error" message={error} />
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}>Cover Letter (optional)</label>
              <Button variant="ghost" size="sm" loading={aiGenerating} onClick={generateCoverLetter}>✦ AI Generate</Button>
            </div>
            <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
              placeholder="Tell the recruiter why you're a great fit..."
              style={{ width: '100%', minHeight: 160, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Outfit,sans-serif', marginBottom: 18 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" size="md" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</Button>
              <Button variant="primary" size="md" loading={applying} onClick={handleApply} style={{ flex: 2 }}>Submit Application</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
