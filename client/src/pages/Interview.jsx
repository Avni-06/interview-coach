import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Interview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const { data } = await API.post('/ai/start', { sessionId });
        setQuestions(data.questions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [sessionId]);

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    try {
      const { data } = await API.post('/ai/evaluate', {
        sessionId,
        questionIndex: currentIndex,
        answer,
      });
      setFeedback(data);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex === questions.length - 1) {
      navigate(`/results/${sessionId}`);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnswer('');
      setFeedback(null);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤖</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          Generating your questions...
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          AI is crafting personalized questions for you
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,5,8,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontWeight: '800', fontSize: '18px' }}>
          Interview<span className="neon-text">Coach</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            Question <span style={{ color: 'var(--neon)' }}>{currentIndex + 1}</span> of {questions.length}
          </span>
          <div className="progress-track" style={{ width: '120px' }}>
            <div className="progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Question card */}
        <div className="glass-card fade-up" style={{ padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span className="neon-badge">Q{currentIndex + 1}</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
              answer thoughtfully
            </span>
          </div>
          <p style={{ fontSize: '20px', fontWeight: '600', lineHeight: 1.5 }}>
            {questions[currentIndex]}
          </p>
        </div>

        {/* Answer area */}
        {!feedback && (
          <div className="glass-card fade-up fade-up-delay-1" style={{ padding: '32px' }}>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '12px' }}>
              YOUR ANSWER
            </label>
            <textarea
              className="neon-input"
              rows={6}
              placeholder="Type your answer here... be detailed and specific"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              style={{ resize: 'vertical', minHeight: '140px' }}
            />
            <button
              onClick={submitAnswer}
              disabled={evaluating || !answer.trim()}
              className="neon-btn"
              style={{ marginTop: '16px' }}
            >
              {evaluating ? 'AI is evaluating...' : 'Submit Answer →'}
            </button>
          </div>
        )}

        {/* Feedback card */}
        {feedback && (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Score */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: `conic-gradient(var(--neon) ${feedback.score * 10}%, rgba(255,255,255,0.05) 0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--dark2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--neon)' }}>{feedback.score}</span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>SCORE</p>
                <p style={{ fontSize: '20px', fontWeight: '700' }}>
                  {feedback.score >= 8 ? '🔥 Excellent' : feedback.score >= 6 ? '👍 Good' : feedback.score >= 4 ? '📈 Needs work' : '💪 Keep practicing'}
                </p>
              </div>
            </div>

            {/* Good */}
            <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid var(--neon)' }}>
              <p style={{ fontSize: '12px', color: 'var(--neon)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>✓ WHAT WAS GOOD</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{feedback.good}</p>
            </div>

            {/* Missing */}
            <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid var(--neon-pink)' }}>
              <p style={{ fontSize: '12px', color: 'var(--neon-pink)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>✗ WHAT WAS MISSING</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{feedback.missing}</p>
            </div>

            {/* Model answer */}
            <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid var(--neon-blue)' }}>
              <p style={{ fontSize: '12px', color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>💡 MODEL ANSWER</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{feedback.modelAnswer}</p>
            </div>

            {/* Next button */}
            <button onClick={nextQuestion} className="neon-btn" style={{ fontSize: '16px', padding: '16px' }}>
              {currentIndex === questions.length - 1 ? 'View Final Results →' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;