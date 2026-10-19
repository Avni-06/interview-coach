const {
  registerSchema,
  loginSchema,
  evaluateSchema,
  startSchema,
  createSessionSchema,
} = require('../validators/schemas');

const id = 'a'.repeat(24);

describe('validators', () => {
  test('register: accepts valid input and normalises email', () => {
    const r = registerSchema.safeParse({ name: 'Ash', email: ' ASH@Mail.com ', password: 'secret1' });
    expect(r.success).toBe(true);
    expect(r.data.email).toBe('ash@mail.com');
  });

  test('register: rejects bad email', () => {
    expect(registerSchema.safeParse({ name: 'Ash', email: 'nope', password: 'secret1' }).success).toBe(false);
  });

  test('register: rejects short password', () => {
    expect(registerSchema.safeParse({ name: 'Ash', email: 'a@b.com', password: '123' }).success).toBe(false);
  });

  test('login: requires a password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });

  test('createSession: rejects empty role', () => {
    expect(createSessionSchema.safeParse({ role: '' }).success).toBe(false);
  });

  test('start: rejects malformed session id', () => {
    expect(startSchema.safeParse({ sessionId: '123' }).success).toBe(false);
    expect(startSchema.safeParse({ sessionId: id }).success).toBe(true);
  });

  test('evaluate: rejects oversized answer', () => {
    const r = evaluateSchema.safeParse({ sessionId: id, questionIndex: 0, answer: 'a'.repeat(3001) });
    expect(r.success).toBe(false);
  });

  test('evaluate: rejects out-of-range or non-integer question index', () => {
    expect(evaluateSchema.safeParse({ sessionId: id, questionIndex: -1, answer: 'x' }).success).toBe(false);
    expect(evaluateSchema.safeParse({ sessionId: id, questionIndex: 1.5, answer: 'x' }).success).toBe(false);
  });

  test('evaluate: strips unknown fields', () => {
    const r = evaluateSchema.safeParse({ sessionId: id, questionIndex: 0, answer: 'x', isAdmin: true });
    expect(r.success).toBe(true);
    expect(r.data.isAdmin).toBeUndefined();
  });
});

describe('session options', () => {
  test('createSession defaults type and difficulty', () => {
    const r = createSessionSchema.safeParse({ role: 'Frontend Dev' });
    expect(r.data).toEqual({ role: 'Frontend Dev', interviewType: 'mixed', difficulty: 'junior' });
  });

  test('createSession rejects unknown type or difficulty', () => {
    expect(createSessionSchema.safeParse({ role: 'Frontend Dev', interviewType: 'trivia' }).success).toBe(false);
    expect(createSessionSchema.safeParse({ role: 'Frontend Dev', difficulty: 'god' }).success).toBe(false);
  });
});
