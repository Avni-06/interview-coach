import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Header from '../components/Header';
import RubricBars from '../components/RubricBars';
import TrendChart from '../components/TrendChart';
import { RUBRIC, FOCUS_TIPS, scoreLevel } from '../lib/score';

const Progress = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    API.get('/sessions/stats')
      .then((res) => alive && setStats(res.data))
      .catch(() => alive && setError('Could not load your progress. Please refresh.'));
    return () => { alive = false; };
  }, []);

  const empty = stats && stats.totals.sessions === 0;
  const delta = stats?.momentum?.delta;
  const weakLabel = stats?.weakest && RUBRIC.find((r) => r.key === stats.weakest)?.label;

  return (
    <>
      <Header />
      <main className="page">
        <h1 className="page-title">Progress</h1>
        <p className="page-sub">How your scores are moving across completed interviews.</p>

        {error && <div className="alert" role="alert" style={{ marginTop: 20 }}>{error}</div>}
        {!stats && !error && <div className="empty">Loading…</div>}

        {empty && (
          <div className="panel empty" style={{ marginTop: 24 }}>
            <strong>No completed interviews yet</strong>
            Finish a session and your trend will show up here. <Link to="/dashboard">Start practicing</Link>
          </div>
        )}

        {stats && !empty && (
          <>
            <div className="panel stats stats-4" style={{ marginTop: 24 }}>
              <div className="stat">
                <div className="stat-value">{stats.totals.sessions}</div>
                <div className="stat-label">Interviews</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.totals.questions}</div>
                <div className="stat-label">Questions answered</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.totals.average.toFixed(1)}</div>
                <div className="stat-label">Average score</div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {delta == null ? '–' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`}
                </div>
                <div className={`stat-label ${delta == null ? '' : delta >= 0 ? 'text-high' : 'text-low'}`}>
                  {delta == null ? 'Trend (needs 4 sessions)' : 'vs previous 3 sessions'}
                </div>
              </div>
            </div>

            <h2 className="section-title" style={{ marginTop: 28 }}>Score trend</h2>
            <div className="panel pad" style={{ marginTop: 12 }}>
              <TrendChart points={stats.trend} />
            </div>

            <div className="progress-grid">
              <section>
                <h2 className="section-title">By role</h2>
                <div className="panel pad" style={{ marginTop: 12 }}>
                  {stats.byRole.map((r) => (
                    <div key={r.role} className="role-stat">
                      <div>
                        <div className="session-role">{r.role}</div>
                        <div className="session-date">{r.sessions} {r.sessions === 1 ? 'session' : 'sessions'}</div>
                      </div>
                      <span className="bar" aria-hidden="true"><span style={{ width: `${r.average * 10}%` }} /></span>
                      <span className={`score-badge lvl-${scoreLevel(r.average)}`}>{r.average.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="section-title">Skill breakdown</h2>
                <div className="panel pad" style={{ marginTop: 12 }}>
                  {stats.rubric ? (
                    <>
                      <RubricBars rubric={stats.rubric} />
                      <div className="focus-box">
                        <strong>Focus area: {weakLabel}</strong>
                        {FOCUS_TIPS[stats.weakest]}
                      </div>
                    </>
                  ) : (
                    <p className="muted">Skill scores appear after your next completed interview.</p>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default Progress;
