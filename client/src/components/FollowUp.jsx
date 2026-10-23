import { useState } from 'react';
import { MessageSquarePlus, CircleCheck, CircleAlert, Lightbulb } from 'lucide-react';
import API from '../api/axios';
import RubricBars from './RubricBars';
import { scoreLevel, scoreLabel } from '../lib/score';

const MAX_LEN = 3000;

// Optional practice round after an answer: one probing follow-up, evaluated but not scored into the session.
const FollowUp = ({ sessionId, questionIndex }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const request = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const ask = () =>
    request(async () => {
      const { data } = await API.post('/ai/followup', { sessionId, questionIndex });
      setQuestion(data.followUp);
    });

  const submit = () =>
    request(async () => {
      const { data } = await API.post('/ai/followup/evaluate', { sessionId, questionIndex, answer });
      setFeedback(data);
    });

  if (!question) {
    return (
      <div className="followup-ask">
        <button className="btn btn-secondary" onClick={ask} disabled={busy}>
          <MessageSquarePlus size={16} />
          {busy ? 'Thinking of a follow-up…' : 'Practice a follow-up'}
        </button>
        {error && <div className="alert" role="alert" style={{ marginTop: 12 }}>{error}</div>}
      </div>
    );
  }

  return (
    <section className="panel followup" aria-label="Follow-up question">
      <div className="followup-head">
        <span className="q-label" style={{ margin: 0 }}>Follow-up</span>
        <span className="hint">Practice only, not counted in your score</span>
      </div>
      <p className="followup-q">{question}</p>

      {!feedback ? (
        <>
          <textarea
            className="input"
            rows={5}
            maxLength={MAX_LEN}
            placeholder="Answer the follow-up…"
            aria-label="Your follow-up answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={busy}
          />
          <div className="answer-meta">
            <span className="hint num">{answer.length} / {MAX_LEN}</span>
            <button className="btn btn-primary" onClick={submit} disabled={busy || !answer.trim()}>
              {busy ? 'Evaluating…' : 'Submit follow-up'}
            </button>
          </div>
          {error && <div className="alert" role="alert" style={{ marginTop: 12 }}>{error}</div>}
        </>
      ) : (
        <div className="followup-result">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <span className={`score-big text-${scoreLevel(feedback.score)}`}>{feedback.score}<small>/10</small></span>
            <span className="section-title">{scoreLabel(feedback.score)}</span>
          </div>
          {feedback.rubric && <RubricBars rubric={feedback.rubric} />}
          <div className="fb fb-good"><h3><CircleCheck size={16} /> What worked</h3><p>{feedback.good}</p></div>
          <div className="fb fb-miss"><h3><CircleAlert size={16} /> What was missing</h3><p>{feedback.missing}</p></div>
          <div className="fb fb-model"><h3><Lightbulb size={16} /> Model answer</h3><p>{feedback.modelAnswer}</p></div>
        </div>
      )}
    </section>
  );
};

export default FollowUp;
