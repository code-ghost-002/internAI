import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Card, Button, Input, Textarea, Select, Alert } from '../../components/common/UI';

const TYPES    = ['Engineering','AI/ML','Design','Data','Marketing','Finance','Operations','Other'];
const WORKMODES= ['Remote','On-site','Hybrid'];

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listingKind, setListingKind] = useState('internship');
  const [form, setForm] = useState({
    title:'', company: user?.company || '', description:'', requirements:'',
    location:'', type:'Engineering', workMode:'Remote', stipend:'', duration:'3 months',
    openings:'1', tags:'', applicationDeadline:'',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        listingKind,
        openings: Number(form.openings) || 1,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        stipendAmount: parseInt(form.stipend?.replace(/\D/g,'')) || 0,
        applicationDeadline: form.applicationDeadline || undefined,
      };
      await api.post('/jobs', payload);
      navigate('/recruiter/my-jobs');
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.errors?.[0]?.msg || 'Failed to post listing');
    } finally { setSaving(false); }
  };

  const isInternship = listingKind === 'internship';

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        title={isInternship ? 'Post an Internship' : 'Post a Full-time Job'}
        subtitle="AI will automatically match and rank candidates for you."
      />
      <Alert type="error" message={error} />

      {/* Listing kind toggle */}
      <Card style={{ marginBottom:16, padding:'18px 20px' }}>
        <div style={{ fontSize:13, color:'var(--text-dim)', fontWeight:500, marginBottom:12 }}>Listing Type</div>
        <div style={{ display:'flex', gap:10 }}>
          {[
            { key:'internship', label:'◈ Internship', sub:'Short-term, stipend-based', color:'var(--green)' },
            { key:'job',        label:'◇ Full-time Job', sub:'Permanent position, salary-based', color:'var(--purple)' },
          ].map(opt => (
            <button key={opt.key} type="button" onClick={() => setListingKind(opt.key)}
              style={{ flex:1, padding:'14px 16px', borderRadius:10, border:`2px solid ${listingKind===opt.key ? opt.color : 'var(--border)'}`, background: listingKind===opt.key ? `${opt.color}10` : 'var(--card)', cursor:'pointer', textAlign:'left', fontFamily:'Outfit,sans-serif', transition:'all .15s' }}>
              <div style={{ fontSize:14, fontWeight:600, color: listingKind===opt.key ? opt.color : 'var(--text-dim)', marginBottom:4 }}>{opt.label}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{opt.sub}</div>
            </button>
          ))}
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily:'DM Serif Display,serif', fontSize:18, color:'var(--text)', marginBottom:18 }}>Basic Details</h2>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            <div style={{ flex:2, minWidth:200 }}>
              <Input label={isInternship ? 'Internship Title *' : 'Job Title *'}
                placeholder={isInternship ? 'Frontend Engineer Intern' : 'Senior Frontend Engineer'}
                value={form.title} onChange={set('title')} required />
            </div>
            <div style={{ flex:1, minWidth:160 }}><Input label="Company Name *" placeholder="Acme Corp" value={form.company} onChange={set('company')} required /></div>
          </div>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:160 }}>
              <Select label="Category" value={form.type} onChange={set('type')}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </Select>
            </div>
            <div style={{ flex:1, minWidth:140 }}>
              <Select label="Work Mode" value={form.workMode} onChange={set('workMode')}>
                {WORKMODES.map(m => <option key={m}>{m}</option>)}
              </Select>
            </div>
            <div style={{ flex:1, minWidth:160 }}><Input label="Location *" placeholder="New York / Remote" value={form.location} onChange={set('location')} required /></div>
          </div>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:140 }}>
              <Input
                label={isInternship ? 'Stipend' : 'Salary / CTC'}
                placeholder={isInternship ? '$5,000/mo' : '$120,000/yr'}
                value={form.stipend} onChange={set('stipend')} />
            </div>
            {isInternship && (
              <div style={{ flex:1, minWidth:140 }}>
                <Input label="Duration" placeholder="3 months" value={form.duration} onChange={set('duration')} />
              </div>
            )}
            <div style={{ flex:1, minWidth:100 }}><Input label="Openings" type="number" min="1" value={form.openings} onChange={set('openings')} /></div>
            <div style={{ flex:1, minWidth:160 }}><Input label="Deadline" type="date" value={form.applicationDeadline} onChange={set('applicationDeadline')} /></div>
          </div>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily:'DM Serif Display,serif', fontSize:18, color:'var(--text)', marginBottom:18 }}>Description</h2>
          <Textarea
            label={isInternship ? 'Internship Description *' : 'Job Description *'}
            placeholder={isInternship ? 'Describe the role, team, and what interns will work on…' : 'Describe responsibilities, team, and growth opportunities…'}
            value={form.description} onChange={set('description')} style={{ minHeight:160 }} />
          <Textarea label="Requirements" placeholder="Skills, experience, and qualifications needed…"
            value={form.requirements} onChange={set('requirements')} style={{ minHeight:100 }} />
        </Card>

        <Card style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily:'DM Serif Display,serif', fontSize:18, color:'var(--text)', marginBottom:8 }}>Skills / Tags</h2>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:12 }}>Comma-separated. Used by AI to match candidates.</p>
          <Input label="" placeholder="React, TypeScript, Node.js, Python…" value={form.tags} onChange={set('tags')} />
          {form.tags && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
              {form.tags.split(',').map(t=>t.trim()).filter(Boolean).map(t=>(
                <span key={t} style={{ background:'rgba(0,200,248,.1)', border:'1px solid rgba(0,200,248,.25)', color:'var(--accent)', fontSize:12, padding:'2px 10px', borderRadius:12 }}>{t}</span>
              ))}
            </div>
          )}
        </Card>

        <div style={{ display:'flex', gap:12 }}>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate('/recruiter/my-jobs')} style={{ flex:1 }}>Cancel</Button>
          <Button type="submit" variant="primary" size="lg" loading={saving} style={{ flex:2 }}>
            {isInternship ? '◈ Post Internship' : '◇ Post Full-time Job'} &amp; Activate AI Matching
          </Button>
        </div>
      </form>
    </div>
  );
}
