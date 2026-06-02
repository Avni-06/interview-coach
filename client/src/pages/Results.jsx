import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Results = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/sessions/${sessionId}`)
      .then(({ data }) => setSession(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <p style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>Loading results...</p>
    </div>
  );

  const avgScore = session?.scores?.length
    ? Math.round(session.scores.reduce((a, b) => a + b, 0) / session.scores.length)
    : 0;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />

      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,5,8,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontWeight: '800', fontSize: '18px' }}>
          Interview<span className="neon-text">Coach</span>
        </span>
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '8px 16px',
          fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)'
        }}>
          ← back to dashboard
        </button>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>
            {avgScore >= 8 ? '🏆' : avgScore >= 6 ? '🎯' : avgScore >= 4 ? '📈' : '💪'}
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '8px' }}>
            Interview <span className="neon-text">Complete</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            {session?.role} — {session?.questions?.length} questions
          </p>
        </div>

        {/* Score summary */}
        <div className="glass-card fade-up fade-up-delay-1" style={{ padding: '32px', textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>OVERALL SCORE</p>
          <div style={{ fontSize: '80px', fontWeight: '800', color: 'var(--neon)', lineHeight: 1, marginBottom: '12px', textShadow: '0 0 40px rgba(0,255,136,0.4)' }}>
            {avgScore}<span style={{ fontSize: '40px', color: 'rgba(255,255,255,0.2)' }}>/10</span>
          </div>
          <div className="progress-track" style={{ maxWidth: '300px', margin: '0 auto', height: '8px' }}>
            <div className="progress-fill" style={{ width: `${avgScore * 10}%` }} />
          </div>
          <p style={{ marginTop: '16px', fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>
            {avgScore >= 8 ? 'Outstanding performance! You are interview-ready.' :
             avgScore >= 6 ? 'Good job! A bit more practice and you will nail it.' :
             avgScore >= 4 ? 'Keep practicing. Review the model answers carefully.' :
             'Don\'t give up! Every interview makes you better.'}
          </p>
        </div>

        {/* Per question breakdown */}
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }} className="fade-up fade-up-delay-2">
          Question Breakdown
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {session?.questions?.map((question, i) => (
            <div key={i} className="glass-card fade-up" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span className="neon-badge">Q{i + 1}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '700',
                  color: session.scores[i] >= 7 ? 'var(--neon)' : session.scores[i] >= 5 ? 'var(--neon-blue)' : 'var(--neon-pink)'
                }}>
                  {session.scores[i]}/10
                </span>
              </div>
              <p style={{ fontWeight: '600', marginBottom: '8px', lineHeight: 1.4 }}>{question}</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>YOUR ANSWER</p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: '12px', fontStyle: 'italic' }}>
                {session.answers[i] || 'No answer provided'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>💡 MODEL ANSWER</p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                {session.feedback[i]}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} className="neon-btn" style={{ maxWidth: '300px', fontSize: '16px', padding: '16px' }}>
            Practice Again →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;