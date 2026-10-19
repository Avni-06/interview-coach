import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';
import AuthLayout from '../components/AuthLayout';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/auth/register', form);
      login(data, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Try again in a few seconds.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <h1>Create your account</h1>
        <p className="muted" style={{ marginTop: 6 }}>Practice with role-specific questions and get scored feedback.</p>
      </div>

      {error && <div className="alert" role="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" className="input" autoComplete="name"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="input" autoComplete="email" placeholder="you@example.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" className="input" autoComplete="new-password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          <span className="hint">At least 6 characters.</span>
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
