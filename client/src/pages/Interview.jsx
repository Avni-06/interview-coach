import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircleCheck, CircleAlert, Lightbulb, Mic, Square, Gauge } from 'lucide-react';
import API from '../api/axios';
import Header from '../components/Header';
import RubricBars from '../components/RubricBars';
import FollowUp from '../components/FollowUp';
import { scoreLevel, scoreLabel } from '../lib/score';
import { countFillers, wordCount } from '../lib/speech';
import useSpeech from '../lib/useSpeech';

const MAX_LEN = 3000;

const Interview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [delivery, setDelivery] = useState(null);

  const appendSpoken = useCallback((text) => {
    if (!text) return;
    setAnswer((prev) => `${prev.replace(/\s+$/, '')}${prev.trim() ? ' ' : ''}${text}`.slice(0, MAX_LEN));
  }, []);
  const speech = useSpeech(appendSpoken);
  const fillers = countFillers(answer);

  useEffect(() => {
    let cancelled = false;
    API.post('/ai/start', { sessionId })
      .then(({ data }) => { if (!cancelled) setQuestions(data.questions); })
      .catch((err) => {
        if (!cancelled) setLoadError(err.response?.data?.message || 'Could not load your questions.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [sessionId, attempt]);

  const retryLoad = () => {
    setLoading(true);
    setLoadError('');
    setAttempt((x) => x + 1);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    speech.stop();
    setEvaluating(true);
    setError('');
    try {
      const { data } = await API.post('/ai/evaluate', { sessionId, questionIndex: currentIndex, answer });
      setFeedback(data);
      setDelivery({ words: wordCount(answer), ...countFillers(answer) });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not evaluate your answer. Try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex === questions.length - 1) {
      navigate(`/results/${sessionId}`);
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswer('');
      setFeedback(null);
      setDelivery(null);
      setError('');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="center-screen">
          <div role="status">
            <div className="spinner" />
            <h2 className="section-title">Preparing your questions</h2>
            <p className="muted">This usually takes a few seconds.</p>
          </div>
        </div>
      </>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <>
        <Header />
        <div className="center-screen">
          <div>
            <h2 className="section-title">We couldn’t load this interview</h2>
            <p className="muted">{loadError || 'No questions were generated.'}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={retryLoad}>Try again</button>
              <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to dashboard</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isLast = currentIndex === questions.length - 1;

  return (
    <>
      <Header>
        <span className="muted num" style={{ fontSize: 14 }}>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="bar" style={{ width: 96 }} aria-hidden="true">
          <span style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>
      </Header>

      <main className="page page-narrow">
        <h1 className="question-text">{questions[currentIndex]}</h1>

        {!feedback && (
          <div style={{ marginTop: 24 }}>
            <label htmlFor="answer" className="section-title" style={{ display: 'block', marginBottom: 8 }}>Your answer</label>
            <textarea
              id="answer"
              className="input"
              rows={9}
              maxLength={MAX_LEN}
              placeholder="Explain your approach, give a concrete example, and mention trade-offs."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={evaluating}
            />
            <div className="answer-meta">
              <span className="hint num">
                {answer.length} / {MAX_LEN}
                {fillers.total > 0 && <span className="filler-count"> · {fillers.total} filler {fillers.total === 1 ? 'word' : 'words'}</span>}
              </span>
              <div className="row-actions">
                {speech.supported && (
                  <button
                    type="button"
                    className={`btn btn-secondary${speech.listening ? ' mic-live' : ''}`}
                    onClick={speech.listening ? speech.stop : speech.start}
                    disabled={evaluating}
                    aria-pressed={speech.listening}
                  >
                    {speech.listening ? <Square size={14} /> : <Mic size={16} />}
                    {speech.listening ? 'Stop' : 'Speak'}
                  </button>
                )}
                <button className="btn btn-primary" onClick={submitAnswer} disabled={evaluating || !answer.trim()}>
                  {evaluating ? 'Evaluating…' : 'Submit answer'}
                </button>
              </div>
            </div>
            {speech.listening && (
              <p className="hint" role="status" style={{ marginTop: 8 }}>
                Listening… {speech.interim && <em>{speech.interim}</em>}
              </p>
            )}
            {speech.error && <div className="alert" role="alert" style={{ marginTop: 12 }}>{speech.error}</div>}
            {error && <div className="alert" role="alert" style={{ marginTop: 12 }}>{error}</div>}
          </div>
        )}

        {feedback && (
          <div style={{ marginTop: 24 }}>
            <div className="panel">
              <div style={{ padding: 20, display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span className={`score-big text-${scoreLevel(feedback.score)}`}>{feedback.score}<small>/10</small></span>
                <span className="section-title">{scoreLabel(feedback.score)}</span>
              </div>
              {feedback.rubric && (
                <div className="fb">
                  <RubricBars rubric={feedback.rubric} />
                </div>
              )}
              {delivery && (
                <div className="fb">
                  <h3><Gauge size={16} /> Delivery</h3>
                  <p>
                    {delivery.words} words.{' '}
                    {delivery.total === 0
                      ? 'No filler words detected.'
                      : `${delivery.total} filler ${delivery.total === 1 ? 'word' : 'words'}: ${delivery.top
                          .map((t) => `"${t.word}" ×${t.count}`)
                          .join(', ')}.`}
                  </p>
                </div>
              )}
              <div className="fb fb-good">
                <h3><CircleCheck size={16} /> What worked</h3>
                <p>{feedback.good}</p>
              </div>
              <div className="fb fb-miss">
                <h3><CircleAlert size={16} /> What was missing</h3>
                <p>{feedback.missing}</p>
              </div>
              <div className="fb fb-model">
                <h3><Lightbulb size={16} /> Model answer</h3>
                <p>{feedback.modelAnswer}</p>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <FollowUp key={currentIndex} sessionId={sessionId} questionIndex={currentIndex} />
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={nextQuestion}>
                {isLast ? 'See final results' : 'Next question'}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Interview;
