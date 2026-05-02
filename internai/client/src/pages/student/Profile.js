import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Card, Button, Input, Textarea, Alert } from '../../components/common/UI';

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name:        user?.name || '',
    bio:         user?.bio || '',
    location:    user?.location || '',
    linkedIn:    user?.linkedIn || '',
    github:      user?.github || '',
    skills:      user?.skills?.join(', ') || '',
    institution: user?.education?.institution || '',
    degree:      user?.education?.degree || '',
    field:       user?.education?.field || '',
    graduationYear: user?.education?.graduationYear || '',
  });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSuccess(''); setError('');
    try {
      const { data } = await api.put('/users/profile', {
        name:     form.name,
        bio:      form.bio,
        location: form.location,
        linkedIn: form.linkedIn,
        github:   form.github,
        skills:   form.skills.split(',').map(s => s.trim()).filter(Boolean),
        education: {
          institution:    form.institution,
          degree:         form.degree,
          field:          form.field,
          graduationYear: Number(form.graduationYear) || undefined,
        },
      });
      updateUser(data);
      setSuccess('Profile updated successfully!');
    } catch (e) {
      setError(e.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <PageHeader title="My Profile" subtitle="Keep your profile up to date for better AI matches." />
      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      <form onSubmit={handleSave}>
        <Card style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 18, color: 'var(--text)', marginBottom: 18 }}>Personal Info</h2>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}><Input label="Full Name" value={form.name} onChange={set('name')} /></div>
            <div style={{ flex: 1, minWidth: 200 }}><Input label="Location" placeholder="City, Country" value={form.location} onChange={set('location')} /></div>
          </div>
          <Textarea label="Bio" placeholder="Short intro about yourself…" value={form.bio} onChange={set('bio')} />
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}><Input label="LinkedIn URL" placeholder="https://linkedin.com/in/…" value={form.linkedIn} onChange={set('linkedIn')} /></div>
            <div style={{ flex: 1, minWidth: 200 }}><Input label="GitHub URL" placeholder="https://github.com/…" value={form.github} onChange={set('github')} /></div>
          </div>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 18, color: 'var(--text)', marginBottom: 18 }}>Education</h2>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 200 }}><Input label="Institution" placeholder="MIT, Stanford…" value={form.institution} onChange={set('institution')} /></div>
            <div style={{ flex: 1, minWidth: 130 }}><Input label="Graduation Year" type="number" placeholder="2025" value={form.graduationYear} onChange={set('graduationYear')} /></div>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 150 }}><Input label="Degree" placeholder="B.S., M.S.…" value={form.degree} onChange={set('degree')} /></div>
            <div style={{ flex: 2, minWidth: 200 }}><Input label="Field of Study" placeholder="Computer Science…" value={form.field} onChange={set('field')} /></div>
          </div>
        </Card>

        <Card style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>Skills</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Comma-separated list. These help AI match you to the right roles.</p>
          <Input label="" placeholder="React, Python, Node.js, SQL, Docker…" value={form.skills} onChange={set('skills')} />
          {form.skills && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                <span key={s} style={{ background: 'rgba(0,200,248,.1)', border: '1px solid rgba(0,200,248,.25)', color: 'var(--accent)', fontSize: 12, padding: '2px 10px', borderRadius: 12 }}>{s}</span>
              ))}
            </div>
          )}
        </Card>

        <Button type="submit" variant="primary" size="lg" loading={saving} style={{ width: '100%' }}>
          Save Profile
        </Button>
      </form>
    </div>
  );
}
