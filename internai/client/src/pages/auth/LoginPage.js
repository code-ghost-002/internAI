import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Alert } from '../../components/common/UI';
import styles from './Auth.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'student' ? '/student/dashboard' : '/recruiter/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const fillDemo = (role) => {
    if (role === 'student') setForm({ email: 'alex@student.com', password: 'password123' });
    else setForm({ email: 'sarah@google.com', password: 'password123' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <div className={styles.logo}>I</div>
          <h1>InternAI</h1>
          <p>Sign in to your account</p>
        </div>

        <Alert type="error" message={error} />

        <form onSubmit={handleSubmit}>
          <Input label="Email address" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Password" type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submitBtn}>
            Sign In
          </Button>
        </form>

        <div className={styles.demos}>
          <p>Quick demo login:</p>
          <div className={styles.demoRow}>
            <button className={styles.demoBtn} onClick={() => fillDemo('student')}>Student Demo</button>
            <button className={styles.demoBtn} onClick={() => fillDemo('recruiter')}>Recruiter Demo</button>
          </div>
        </div>

        <p className={styles.switchLink}>
          No account? <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
