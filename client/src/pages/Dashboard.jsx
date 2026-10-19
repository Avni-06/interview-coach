import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Monitor, Server, Layers, BarChart3, Container, Compass, Check, GraduationCap, Smartphone } from 'lucide-react';
import API from '../api/axios';
import useAuthStore from '../store/authStore';
import Header from '../components/Header';
import { average, scoreLevel, formatDate, TYPE_LABELS, LEVEL_LABELS } from '../lib/score';

const ROLES = [
  { title: 'Frontend Dev', icon: Monitor, desc: 'React, CSS, JavaScript, accessibility' },
  { title: 'Backend Dev', icon: Server, desc: 'APIs, databases, Node.js, system basics' },
  { title: 'Full Stack Dev', icon: Layers, desc: 'End-to-end features across client and server' },
  { title: 'Data Scientist', icon: BarChart3, desc: 'Machine learning, Python, statistics' },
  { title: 'DevOps Engineer', icon: Container, desc: 'CI/CD, Docker, cloud, monitoring' },
  { title: 'Android Developer', icon: Smartphone, desc: 'Kotlin, Jetpack Compose, app architecture' },
  { title: 'SDE Intern', icon: GraduationCap, desc: 'Data structures, problem solving, CS fundamentals' },
  { title: 'Product Manager', icon: Compass, desc: 'Strategy, prioritization, user research' },
];

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [interviewType, setInterviewType] = useState('mixed');
  const [difficulty, setDifficulty] = useState('junior');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/sessions')
      .then(({ data }) => setSessions(data))
      .catch(console.error)
      .finally(() => setSessionsLoaded(true));
  }, []);

  const startInterview = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/sessions', { role: selectedRole, interviewType, difficulty });
      navigate(`/interview/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start the interview. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const scored = sessions.filter((s) => s.scores?.some((n) => typeof n === 'number'));
  const sessionAvgs = scored.map((s) => average(s.scores));
  const overall = average(sessionAvgs);
  const best = sessionAvgs.length ? Math.max(...sessionAvgs) : null;
  const firstName = user?.name?.split(' ')[0];

  return (
    <>
      <Header />
      <main className="page">
        <h1 className="page-title">{firstName ? `Welcome back, ${firstName}` : 'Dashboard'}</h1>
        <p className="page-sub">Choose a role, answer five questions, and get a score with feedback on each answer.</p>

        <div className="dash-grid">
          <section aria-labelledby="start-title">
            <h2 id="start-title" className="section-title">Start an interview</h2>
            <div className="panel role-list" role="radiogroup" aria-label="Interview role">
              {ROLES.map(({ title, icon: Icon, desc }) => {
                const selected = selectedRole === title;
                return (
                  <button
                    key={title}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className="role-row"
                    onClick={() => setSelectedRole(title)}
                  >
                    <span className="role-icon"><Icon size={18} /></span>
                    <span>
                      <span className="role-name">{title}</span>
                      <span className="role-desc" style={{ display: 'block' }}>{desc}</span>
                    </span>
                    {selected && <Check size={18} className="role-check" />}
                  </button>
                );
              })}
            </div>

            <div className="options">
              <div className="field">
                <label htmlFor="type">Interview type</label>
                <select id="type" className="input" value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="level">Experience level</label>
                <select id="level" className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  {Object.entries(LEVEL_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
            </div>

            {error && <div className="alert" role="alert" style={{ marginTop: 12 }}>{error}</div>}

            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={startInterview} disabled={loading || !selectedRole}>
                {loading ? 'Starting…' : selectedRole ? `Start ${selectedRole} interview` : 'Select a role to start'}
              </button>
            </div>
          </section>

          <section aria-labelledby="progress-title">
            <h2 id="progress-title" className="section-title">Your progress</h2>
            <div className="panel stats" style={{ marginTop: 12 }}>
              <div className="stat">
                <div className="stat-value">{scored.length}</div>
                <div className="stat-label">Interviews</div>
              </div>
              <div className="stat">
                <div className="stat-value">{overall === null ? '–' : overall.toFixed(1)}</div>
                <div className="stat-label">Average score</div>
              </div>
              <div className="stat">
                <div className="stat-value">{best === null ? '–' : best.toFixed(1)}</div>
                <div className="stat-label">Best score</div>
              </div>
            </div>

            <h2 className="section-title" style={{ marginTop: 28 }}>Recent sessions</h2>
            <div className="panel session-list">
              {!sessionsLoaded ? (
                <div className="empty">Loading sessions…</div>
              ) : sessions.length === 0 ? (
                <div className="empty">
                  <strong>No sessions yet</strong>
                  Your scored interviews will appear here.
                </div>
              ) : (
                sessions.slice(0, 8).map((s) => {
                  const avg = average(s.scores);
                  return (
                    <div key={s._id} className="session-row">
                      <div>
                        <div className="session-role">{s.role}</div>
                        <div className="session-date">{formatDate(s.createdAt)}</div>
                      </div>
                      {avg === null ? (
                        <span className="muted" style={{ fontSize: 13 }}>Not finished</span>
                      ) : (
                        <span className={`score-badge lvl-${scoreLevel(avg)}`}>{avg.toFixed(1)}/10</span>
                      )}
                      {avg === null ? <span /> : <Link to={`/results/${s._id}`}>View</Link>}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
