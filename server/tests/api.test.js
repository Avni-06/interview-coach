const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../models/User', () => ({ findById: jest.fn(), findOne: jest.fn(), create: jest.fn() }));
jest.mock('../models/Session', () => ({ findById: jest.fn(), find: jest.fn(), create: jest.fn(), findOneAndUpdate: jest.fn() }));
jest.mock('../utils/llm', () => ({
  callJSON: jest.fn(),
  safeText: (s) => String(s),
}));

const User = require('../models/User');
const Session = require('../models/Session');
const { callJSON } = require('../utils/llm');
const app = require('../app');

const ME = '1'.repeat(24);
const OTHER = '2'.repeat(24);
const SID = 'a'.repeat(24);
const token = jwt.sign({ id: ME }, process.env.JWT_SECRET);
const auth = { Authorization: `Bearer ${token}` };

const makeSession = (owner, extra = {}) => ({
  _id: SID,
  user: { toString: () => owner },
  role: 'Frontend Dev',
  questions: ['What is the virtual DOM?', 'Explain closures.'],
  answers: [],
  feedback: [],
  scores: [],
  evaluations: [],
  completed: false,
  markModified: jest.fn(),
  save: jest.fn().mockResolvedValue(undefined),
  ...extra,
});

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: ME }) });
});

describe('platform', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('sets security headers (helmet)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('allows any local dev origin and the production site', async () => {
    for (const origin of ['http://localhost:5174', 'http://127.0.0.1:5173', 'https://interview-coach-sable.vercel.app']) {
      const res = await request(app).get('/api/health').set('Origin', origin);
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(origin);
    }
  });

  test('blocks requests from a disallowed origin', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example');
    expect(res.status).toBe(403);
  });
});

describe('auth', () => {
  test('register rejects invalid body with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x' });
    expect(res.status).toBe(400);
  });

  test('login with unknown user returns 401', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'secret1' });
    expect(res.status).toBe(401);
  });

  test('login with correct password returns a token', async () => {
    const hash = await bcrypt.hash('secret1', 4);
    User.findOne.mockResolvedValue({ _id: ME, name: 'Ash', email: 'a@b.com', password: hash });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'secret1' });
    expect(res.status).toBe(200);
    expect(jwt.verify(res.body.token, process.env.JWT_SECRET).id).toBe(ME);
  });

  test('protected route without token returns 401', async () => {
    const res = await request(app).get('/api/sessions');
    expect(res.status).toBe(401);
  });

  test('token for a deleted user returns 401', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const res = await request(app).get('/api/sessions').set(auth);
    expect(res.status).toBe(401);
  });
});

describe('sessions', () => {
  test('malformed session id returns 400', async () => {
    const res = await request(app).get('/api/sessions/not-an-id').set(auth);
    expect(res.status).toBe(400);
  });

  test('cannot read another user\'s session', async () => {
    Session.findById.mockResolvedValue(makeSession(OTHER));
    const res = await request(app).get(`/api/sessions/${SID}`).set(auth);
    expect(res.status).toBe(403);
  });
});

describe('ai', () => {
  test('start returns existing questions without calling the LLM', async () => {
    Session.findById.mockResolvedValue(makeSession(ME));
    const res = await request(app).post('/api/ai/start').set(auth).send({ sessionId: SID });
    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(2);
    expect(callJSON).not.toHaveBeenCalled();
  });

  test('start generates and saves questions for a fresh session', async () => {
    const qs = ['q1?????', 'q2?????', 'q3?????', 'q4?????', 'q5?????'];
    Session.findById.mockResolvedValue(makeSession(ME, { questions: [] }));
    Session.findOneAndUpdate.mockResolvedValue({ questions: qs });
    callJSON.mockResolvedValue({ questions: qs });
    const res = await request(app).post('/api/ai/start').set(auth).send({ sessionId: SID });
    expect(res.status).toBe(200);
    expect(res.body.questions).toEqual(qs);
    expect(Session.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: SID, 'questions.0': { $exists: false } },
      { $set: { questions: qs } },
      { new: true }
    );
  });

  test('concurrent start calls share one LLM call and return the same questions', async () => {
    const qs = ['q1?????', 'q2?????', 'q3?????', 'q4?????', 'q5?????'];
    Session.findById.mockResolvedValue(makeSession(ME, { questions: [] }));
    // first writer wins; the second write matches nothing (null) and falls back to the stored questions
    Session.findOneAndUpdate.mockResolvedValueOnce({ questions: qs }).mockResolvedValueOnce(null);
    callJSON.mockImplementation(() => new Promise((r) => setTimeout(() => r({ questions: qs }), 30)));
    const post = () => request(app).post('/api/ai/start').set(auth).send({ sessionId: SID });
    const [a, b] = await Promise.all([post(), post()]);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(callJSON).toHaveBeenCalledTimes(1);
  });

  test('evaluate on someone else\'s session is forbidden (IDOR guard)', async () => {
    Session.findById.mockResolvedValue(makeSession(OTHER));
    const res = await request(app)
      .post('/api/ai/evaluate').set(auth)
      .send({ sessionId: SID, questionIndex: 0, answer: 'my answer' });
    expect(res.status).toBe(403);
    expect(callJSON).not.toHaveBeenCalled();
  });

  test('evaluate with unknown question index returns 400', async () => {
    Session.findById.mockResolvedValue(makeSession(ME));
    const res = await request(app)
      .post('/api/ai/evaluate').set(auth)
      .send({ sessionId: SID, questionIndex: 9, answer: 'x' });
    expect(res.status).toBe(400);
  });

  test('evaluate stores the full feedback and returns it', async () => {
    const s = makeSession(ME);
    Session.findById.mockResolvedValue(s);
    callJSON.mockResolvedValue({ score: 7, rubric: { correctness: 7, depth: 7, clarity: 7, structure: 7 }, good: 'g', missing: 'm', modelAnswer: 'ma' });
    const res = await request(app)
      .post('/api/ai/evaluate').set(auth)
      .send({ sessionId: SID, questionIndex: 0, answer: 'my answer' });
    expect(res.status).toBe(200);
    expect(res.body.score).toBe(7);
    expect(s.scores[0]).toBe(7);
    expect(s.evaluations[0]).toMatchObject({ good: 'g', missing: 'm', rubric: { depth: 7 } });
  });

  test('evaluate marks the session completed on the last question', async () => {
    const s = makeSession(ME);
    Session.findById.mockResolvedValue(s);
    callJSON.mockResolvedValue({ score: 5, good: 'g', missing: 'm', modelAnswer: 'ma' });
    await request(app).post('/api/ai/evaluate').set(auth).send({ sessionId: SID, questionIndex: 1, answer: 'x' });
    expect(s.completed).toBe(true);
  });

  test('LLM failure surfaces as a clean error, not a crash', async () => {
    Session.findById.mockResolvedValue(makeSession(ME));
    callJSON.mockRejectedValue(Object.assign(new Error('boom'), { status: 502 }));
    const res = await request(app)
      .post('/api/ai/evaluate').set(auth)
      .send({ sessionId: SID, questionIndex: 0, answer: 'x' });
    expect(res.status).toBe(502);
    expect(res.body.message).toMatch(/try again/i);
  });
});
