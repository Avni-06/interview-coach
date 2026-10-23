import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Header from '../components/Header';
import { average, scoreLevel, formatDate, TYPE_LABELS, LEVEL_LABELS } from '../lib/score';

const PAGE_SIZE = 20;

const History = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (nextPage) => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/sessions?page=${nextPage}&limit=${PAGE_SIZE}`);
      setItems((prev) => (nextPage === 1 ? res.data : [...prev, ...res.data]));
      setTotal(Number(res.headers['x-total-count']) || res.data.length);
      setPage(nextPage);
    } catch {
      setError('Could not load your sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(1);
  }, [load]);

  const remove = async (id) => {
    setBusyId(id);
    try {
      await API.delete(`/sessions/${id}`);
      setItems((prev) => prev.filter((s) => s._id !== id));
      setTotal((t) => Math.max(0, t - 1));
      setConfirmId(null);
    } catch {
      setError('Could not delete that session. Try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Header />
      <main className="page page-narrow">
        <h1 className="page-title">History</h1>
        <p className="page-sub">{total} {total === 1 ? 'session' : 'sessions'} in total.</p>

        {error && <div className="alert" role="alert" style={{ marginTop: 20 }}>{error}</div>}

        <div className="panel session-list" style={{ marginTop: 20 }}>
          {!loading && items.length === 0 ? (
            <div className="empty">
              <strong>Nothing here yet</strong>
              <Link to="/dashboard">Start your first interview</Link>
            </div>
          ) : (
            items.map((s) => {
              const avg = average(s.scores);
              return (
                <div key={s._id} className="session-row history-row">
                  <div>
                    <div className="session-role">{s.role}</div>
                    <div className="session-date">
                      {formatDate(s.createdAt)} · {TYPE_LABELS[s.interviewType] || 'Mixed'} · {LEVEL_LABELS[s.difficulty] || 'Junior'}
                    </div>
                  </div>
                  {avg === null ? (
                    <span className="muted" style={{ fontSize: 13 }}>Not finished</span>
                  ) : (
                    <span className={`score-badge lvl-${scoreLevel(avg)}`}>{avg.toFixed(1)}/10</span>
                  )}
                  <div className="row-actions">
                    {avg !== null && <Link to={`/results/${s._id}`}>View</Link>}
                    {confirmId === s._id ? (
                      <>
                        <button className="btn btn-danger btn-sm" disabled={busyId === s._id} onClick={() => remove(s._id)}>
                          {busyId === s._id ? 'Deleting…' : 'Confirm'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setConfirmId(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="btn btn-secondary btn-sm" onClick={() => setConfirmId(s._id)}>Delete</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {loading && <div className="empty">Loading…</div>}
        </div>

        {!loading && items.length < total && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button className="btn btn-secondary" onClick={() => load(page + 1)}>Load more</button>
          </div>
        )}
      </main>
    </>
  );
};

export default History;
