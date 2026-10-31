const B = 'http://localhost:8000/api', H = { 'content-type': 'application/json' };
const post = async (p, b, t) => { const s = performance.now();
  const r = await fetch(B + p, { method: 'POST', headers: { ...H, ...(t && { authorization: 'Bearer ' + t }) }, body: JSON.stringify(b) });
  return { ms: performance.now() - s, data: await r.json(), ok: r.ok }; };
const stat = (a) => `min ${Math.min(...a).toFixed(0)} / avg ${(a.reduce((x, y) => x + y) / a.length).toFixed(0)} / max ${Math.max(...a).toFixed(0)} ms`;
const email = `perf${Date.now()}@example.com`;
const { data: u } = await post('/auth/register', { name: 'Perf', email, password: 'perftest1' });
const gen = [], ev = [];
for (let i = 0; i < 10; i++) {
  const sess = await post('/sessions', { role: 'Frontend' }, u.token);
  if (!sess.ok) { console.log('session create failed:', sess.data); process.exit(1); }
  const s = sess.data;
  const g = await post('/ai/start', { sessionId: s._id }, u.token);
  if (!g.ok) { console.log('ai/start failed:', g.data); process.exit(1); }
  gen.push(g.ms);
  const e = await post('/ai/evaluate', { sessionId: s._id, questionIndex: 0, answer: 'The virtual DOM is a lightweight copy of the DOM that React diffs to batch minimal updates.' }, u.token);
  if (!e.ok) { console.log('ai/evaluate failed:', e.data); process.exit(1); }
  ev.push(e.ms);
}
console.log('generate:', stat(gen)); console.log('evaluate:', stat(ev));
