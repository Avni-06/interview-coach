import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/auth/login', form);
      login(data, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '20px' }}>
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div className="pulse-dot" />
            <span className="neon-badge">AI-Powered</span>
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: '800', lineHeight: 1.1 }}>
            Interview<br />
            <span className="neon-text">Coach</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '10px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            level up your interview game
          </p>
        </div>

        {/* Card */}
        <div className="glass-card fade-up fade-up-delay-1" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
            Welcome back 👋
          </h2>

          {error && (
            <div style={{ background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px', color: '#ff006e', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>EMAIL</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="neon-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                className="neon-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="neon-btn" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Authenticating...' : 'Login →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
            no account?{' '}
            <Link to="/register" style={{ color: 'var(--neon)', textDecoration: 'none', fontWeight: '500' }}>
              register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;