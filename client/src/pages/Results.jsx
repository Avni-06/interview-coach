import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircleCheck, CircleAlert, Lightbulb, Printer } from 'lucide-react';
import API from '../api/axios';
import Header from '../components/Header';
import RadarChart from '../components/RadarChart';
import RubricBars from '../components/RubricBars';
import { average, scoreLevel, formatDate, averageRubric, TYPE_LABELS, LEVEL_LABELS } from '../lib/score';

const summary = (s) =>
  s >= 8 ? 'Strong performance. You are well prepared for this role.'
  : s >= 6 ? 'Solid result. A little more depth in your answers will lift it further.'
  : s >= 4 ? 'You have the basics. Review the model answers and practice again.'
  : 'Focus on the fundamentals, then retake this interview.';

const Results = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get(`/sessions/${sessionId}`)
      .then(({ data }) => setSession(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load these results.'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="center-screen"><div role="status"><div className="spinner" /><p className="muted">Loading results</p></div></div>
      </>
    );
  }

  if (error || !session) {
    return (
      <>
        <Header />
        <div className="center-screen">
          <div>
            <h2 className="section-title">Results unavailable</h2>
            <p className="muted">{error}</p>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to dashboard</button>
          </div>
        </div>
      </>
    );
  }

  const avg = average(session.scores) ?? 0;
  const rubric = averageRubric(session.evaluations);
  const meta = [TYPE_LABELS[session.interviewType], LEVEL_LABELS[session.difficulty]].filter(Boolean).join(', ');

  return (
    <>
      <Header />
      <main className="page page-narrow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 className="page-title">{session.role} interview</h1>
            <p className="page-sub">{formatDate(session.createdAt)}, {session.questions.length} questions{meta ? `, ${meta.toLowerCase()}` : ''}</p>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Print report</button>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Practice again</button>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 24, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
            <span className={`score-big text-${scoreLevel(avg)}`}>{avg.toFixed(1)}<small>/10</small></span>
            <span className="muted">Overall score</span>
          </div>
          <div className="bar" style={{ marginTop: 16 }}><span style={{ width: `${avg * 10}%` }} /></div>
          <p style={{ marginTop: 14 }}>{summary(avg)}</p>
        </div>

        {rubric && (
          <>
            <h2 className="section-title" style={{ marginTop: 32 }}>Skill breakdown</h2>
            <div className="panel rubric-panel" style={{ marginTop: 12 }}>
              <RadarChart rubric={rubric} />
              <RubricBars rubric={rubric} />
            </div>
          </>
        )}

        <h2 className="section-title" style={{ marginTop: 32 }}>Question breakdown</h2>
        <div className="panel" style={{ marginTop: 12 }}>
          {session.questions.map((question, i) => {
            const score = session.scores[i];
            const ev = session.evaluations?.[i];
            return (
              <article key={i} className="q-item">
                <div className="q-head">
                  <h3 className="q-title">{i + 1}. {question}</h3>
                  {typeof score === 'number' ? (
                    <span className={`score-badge lvl-${scoreLevel(score)}`}>{score}/10</span>
                  ) : (
                    <span className="muted" style={{ fontSize: 13 }}>Skipped</span>
                  )}
                </div>
                <p className="q-label">Your answer</p>
                <p className="q-answer">{session.answers[i] || 'No answer provided.'}</p>

                {ev?.good && (
                  <>
                    <p className="q-label text-high" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><CircleCheck size={15} /> What worked</p>
                    <p>{ev.good}</p>
                  </>
                )}
                {ev?.missing && (
                  <>
                    <p className="q-label text-low" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><CircleAlert size={15} /> What was missing</p>
                    <p>{ev.missing}</p>
                  </>
                )}
                {session.feedback[i] && (
                  <>
                    <p className="q-label" style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--accent)' }}><Lightbulb size={15} /> Model answer</p>
                    <p>{session.feedback[i]}</p>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
};

export default Results;
