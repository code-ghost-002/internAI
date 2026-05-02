import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Card, Button, Input, Textarea, Select, Alert } from '../../components/common/UI';

const SIZES = ['1-10','11-50','51-200','201-500','500+'];

export default function RecruiterProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name:               user?.name || '',
    bio:                user?.bio || '',
    location:           user?.location || '',
    company:            user?.company || '',
    companyDescription: user?.companyDescription || '',
    companyWebsite:     user?.companyWebsite || '',
    companySize:        user?.companySize || '51-200',
    linkedIn:           user?.linkedIn || '',
  });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSuccess(''); setError('');
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data);
      setSuccess('Profile updated!');
    } catch (e) {
      setError(e.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth:680 }}>
      <PageHeader title="Recruiter Profile" subtitle="Your profile is visible to candidates who apply." />
      <Alert type="success" message={success} />
      <Alert type="error"   message={error} />

      <form onSubmit={handleSave}>
        <Card style={{ marginBottom:16 }}>
          <h2 style={{ fontFamily:'DM Serif Display,serif', fontSize:18, color:'var(--text)', marginBottom:18 }}>Personal Info</h2>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:200 }}><Input label="Full Name" value={form.name} onChange={set('name')} /></div>
            <div style={{ flex:1, minWidth:200 }}><Input label="Location" placeholder="City, Country" value={form.location} onChange={set('location')} /></div>
          </div>
          <Textarea label="Bio" placeholder="Your background and role…" value={form.bio} onChange={set('bio')} />
          <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/…" value={form.linkedIn} onChange={set('linkedIn')} />
        </Card>

        <Card style={{ marginBottom:20 }}>
          <h2 style={{ fontFamily:'DM Serif Display,serif', fontSize:18, color:'var(--text)', marginBottom:18 }}>Company Info</h2>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            <div style={{ flex:2, minWidth:200 }}><Input label="Company Name" value={form.company} onChange={set('company')} /></div>
            <div style={{ flex:1, minWidth:140 }}>
              <Select label="Company Size" value={form.companySize} onChange={set('companySize')}>
                {SIZES.map(s => <option key={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <Input label="Company Website" placeholder="https://…" value={form.companyWebsite} onChange={set('companyWebsite')} />
          <Textarea label="Company Description" placeholder="What does your company do? What's the culture like?" value={form.companyDescription} onChange={set('companyDescription')} />
        </Card>

        <Button type="submit" variant="primary" size="lg" loading={saving} style={{ width:'100%' }}>Save Profile</Button>
      </form>
    </div>
  );
}
