import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Alert } from '../../components/common/UI';
import styles from './Auth.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', company: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
    try {
      const user = await register(form);
      navigate(user.role === 'student' ? '/student/dashboard' : '/recruiter/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <div className={styles.logo}>I</div>
          <h1>InternAI</h1>
          <p>Create your free account</p>
        </div>

        <Alert type="error" message={error} />

        <form onSubmit={handleSubmit}>
          <Input label="Full name" placeholder="Alex Rivera" value={form.name} onChange={set('name')} required />
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>I am a…</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['student', 'recruiter'].map(r => (
                <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                  style={{ flex: 1, padding: '10px', borderRadius: 9, border: `2px solid ${form.role === r ? 'var(--accent)' : 'var(--border)'}`, background: form.role === r ? 'rgba(0,200,248,.1)' : 'var(--card)', color: form.role === r ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Outfit,sans-serif', textTransform: 'capitalize' }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {form.role === 'recruiter' && (
            <Input label="Company name" placeholder="e.g. Acme Corp" value={form.company} onChange={set('company')} />
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submitBtn}>
            Create Account
          </Button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
