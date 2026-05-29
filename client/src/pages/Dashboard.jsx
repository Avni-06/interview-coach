import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuthStore from '../store/authStore';

const ROLES = [
  { title: 'Frontend Dev', icon: '🎨', color: '#00ff88', desc: 'React, CSS, JS, UI/UX' },
  { title: 'Backend Dev', icon: '⚙️', color: '#00d4ff', desc: 'APIs, DBs, Node, Python' },
  { title: 'Full Stack Dev', icon: '🔥', color: '#ff006e', desc: 'End-to-end development' },
  { title: 'Data Scientist', icon: '📊', color: '#a855f7', desc: 'ML, Python, statistics' },
  { title: 'DevOps Engineer', icon: '🚀', color: '#f97316', desc: 'CI/CD, Docker, Cloud' },
  { title: 'Product Manager', icon: '💡', color: '#eab308', desc: 'Strategy, roadmaps, users' },
];

const TiltCard = ({ role, selected, onClick }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="tilt-card glass-card"
      style={{
        padding: '24px',
        cursor: 'pointer',
        transition: 'transform 0.1s ease, box-shadow 0.3s ease',
        border: selected ? `1px solid ${role.color}` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: selected ? `0 0 30px ${role.color}33` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: role.color, borderRadius: '50%',
          width: '20px', height: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', color: '#000', fontWeight: '700'
        }}>✓</div>
      )}
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{role.icon}</div>
      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: selected ? role.color : '#fff' }}>
        {role.title}
      </h3>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
        {role.desc}
      </p>
    </div>
  );
};

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/sessions').then(({ data }) => setSessions(data)).catch(console.error);
  }, []);

  const startInterview = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const { data } = await API.post('/sessions', { role: selectedRole });
      navigate(`/interview/${data._id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,5,8,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="pulse-dot" />
          <span style={{ fontWeight: '800', fontSize: '18px' }}>
            Interview<span className="neon-text">Coach</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>
            hey, <span style={{ color: '#fff' }}>{user?.name?.toLowerCase()}</span> 👋
          </span>
          <button onClick={logout} style={{
            background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)',
            color: '#ff006e', borderRadius: '8px', padding: '6px 14px',
            fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)'
          }}>
            logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: '48px' }}>
          <span className="neon-badge">Ready to practice?</span>
          <h1 style={{ fontSize: '48px', fontWeight: '800', marginTop: '16px', lineHeight: 1.1 }}>
            Pick your role.<br />
            <span className="neon-text">Crush the interview.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '12px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            AI will generate real questions and give you instant feedback
          </p>
        </div>

        {/* Role grid */}
        <div className="fade-up fade-up-delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {ROLES.map((role) => (
            <TiltCard
              key={role.title}
              role={role}
              selected={selectedRole === role.title}
              onClick={() => setSelectedRole(role.title)}
            />
          ))}
        </div>

        {/* Start button */}
        <div className="fade-up fade-up-delay-2" style={{ marginBottom: '60px' }}>
          <button
            onClick={startInterview}
            disabled={loading || !selectedRole}
            className="neon-btn"
            style={{ maxWidth: '320px', fontSize: '16px', padding: '16px' }}
          >
            {loading ? 'Generating questions...' : selectedRole ? `Start ${selectedRole} Interview →` : 'Select a role first'}
          </button>
        </div>

        {/* Past sessions */}
        {sessions.length > 0 && (
          <div className="fade-up fade-up-delay-3">
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
              Past Sessions
              <span style={{ marginLeft: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontWeight: '400' }}>
                {sessions.length} total
              </span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions.map((session) => (
                <div key={session._id} className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '4px' }}>{session.role}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/results/${session._id}`)}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                  >
                    view results →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;