const { buildStats } = require('../utils/stats');

const rubric = (c, d, cl, st) => ({ rubric: { correctness: c, depth: d, clarity: cl, structure: st } });
const session = (id, role, day, scores, evaluations = []) => ({
  _id: id, role, createdAt: `2026-10-${String(day).padStart(2, '0')}T10:00:00Z`, scores, evaluations,
});

describe('buildStats', () => {
  test('returns an empty shape when there are no scored sessions', () => {
    expect(buildStats([]).totals).toEqual({ sessions: 0, questions: 0, average: null });
    expect(buildStats([session('a', 'Frontend Dev', 1, [])]).trend).toEqual([]);
  });

  test('totals ignore unfinished sessions and holes in the scores array', () => {
    const s = buildStats([
      session('a', 'Frontend Dev', 1, [6, null, 8]),
      session('b', 'Backend Dev', 2, []),
    ]);
    expect(s.totals).toEqual({ sessions: 1, questions: 2, average: 7 });
  });

  test('trend is oldest to newest regardless of input order', () => {
    const s = buildStats([
      session('late', 'Frontend Dev', 9, [9]),
      session('early', 'Frontend Dev', 1, [3]),
    ]);
    expect(s.trend.map((t) => t.id)).toEqual(['early', 'late']);
  });

  test('trend keeps only the latest 20 sessions', () => {
    const many = Array.from({ length: 25 }, (_, i) => session(`s${i}`, 'Frontend Dev', i + 1, [5]));
    const s = buildStats(many);
    expect(s.trend).toHaveLength(20);
    expect(s.trend[0].id).toBe('s5');
  });

  test('groups averages by role', () => {
    const s = buildStats([
      session('a', 'Frontend Dev', 1, [4]),
      session('b', 'Frontend Dev', 2, [8]),
      session('c', 'Backend Dev', 3, [7]),
    ]);
    expect(s.byRole[0]).toEqual({ role: 'Frontend Dev', sessions: 2, average: 6 });
    expect(s.byRole[1]).toEqual({ role: 'Backend Dev', sessions: 1, average: 7 });
  });

  test('finds the weakest rubric dimension', () => {
    const s = buildStats([
      session('a', 'Frontend Dev', 1, [7], [rubric(8, 4, 7, 6)]),
      session('b', 'Frontend Dev', 2, [7], [rubric(8, 6, 7, 6)]),
    ]);
    expect(s.rubric).toEqual({ correctness: 8, depth: 5, clarity: 7, structure: 6 });
    expect(s.weakest).toBe('depth');
  });

  test('rubric is null for old sessions without rubric data', () => {
    const s = buildStats([session('a', 'Frontend Dev', 1, [6], [{ good: 'x', missing: 'y' }])]);
    expect(s.rubric).toBeNull();
    expect(s.weakest).toBeNull();
  });

  test('momentum compares the last 3 sessions to the 3 before (needs 4+ sessions)', () => {
    const base = [4, 4, 4, 6, 6, 6].map((n, i) => session(`s${i}`, 'Frontend Dev', i + 1, [n]));
    expect(buildStats(base).momentum).toEqual({ recent: 6, previous: 4, delta: 2 });
    expect(buildStats(base.slice(0, 3)).momentum).toBeNull();
  });
});
