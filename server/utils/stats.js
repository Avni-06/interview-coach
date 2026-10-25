const RUBRIC_KEYS = ['correctness', 'depth', 'clarity', 'structure'];

const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
const round1 = (n) => (n === null ? null : Math.round(n * 10) / 10);

// Average of the numeric scores of one session (null for unfinished sessions)
const sessionScore = (s) => mean((s.scores || []).filter((n) => typeof n === 'number'));

/**
 * Turns a user's sessions into the numbers the Progress page needs.
 * Pure function: no DB access, so it is easy to test.
 */
function buildStats(sessions = []) {
  const scored = sessions
    .map((s) => ({ s, score: sessionScore(s) }))
    .filter((x) => x.score !== null)
    .sort((a, b) => new Date(a.s.createdAt) - new Date(b.s.createdAt));

  if (!scored.length) {
    return { totals: { sessions: 0, questions: 0, average: null }, trend: [], byRole: [], rubric: null, weakest: null, momentum: null };
  }

  const questions = scored.reduce((n, x) => n + x.s.scores.filter((v) => typeof v === 'number').length, 0);

  const trend = scored.slice(-20).map(({ s, score }) => ({
    id: String(s._id),
    date: s.createdAt,
    role: s.role,
    score: round1(score),
  }));

  const roles = new Map();
  for (const { s, score } of scored) {
    const r = roles.get(s.role) || [];
    r.push(score);
    roles.set(s.role, r);
  }
  const byRole = [...roles.entries()]
    .map(([role, list]) => ({ role, sessions: list.length, average: round1(mean(list)) }))
    .sort((a, b) => b.sessions - a.sessions || b.average - a.average);

  const evaluations = scored.flatMap(({ s }) => (s.evaluations || []).filter((e) => e && e.rubric));
  let rubric = null;
  let weakest = null;
  if (evaluations.length) {
    rubric = Object.fromEntries(
      RUBRIC_KEYS.map((k) => [k, round1(mean(evaluations.map((e) => e.rubric[k]).filter((n) => typeof n === 'number')))])
    );
    weakest = RUBRIC_KEYS.reduce((min, k) => (rubric[k] < rubric[min] ? k : min), RUBRIC_KEYS[0]);
  }

  // Momentum: last 3 sessions vs the 3 before them (needs at least 4 sessions)
  let momentum = null;
  if (scored.length >= 4) {
    const recent = scored.slice(-3).map((x) => x.score);
    const previous = scored.slice(-6, -3).map((x) => x.score);
    momentum = { recent: round1(mean(recent)), previous: round1(mean(previous)), delta: round1(mean(recent) - mean(previous)) };
  }

  return {
    totals: { sessions: scored.length, questions, average: round1(mean(scored.map((x) => x.score))) },
    trend,
    byRole,
    rubric,
    weakest,
    momentum,
  };
}

module.exports = { buildStats };
