jest.mock('../config/groq', () => ({ chat: { completions: { create: jest.fn() } } }));
const { schemas } = require('../controllers/aiController');

const base = { good: 'g', missing: 'm', modelAnswer: 'ma' };

describe('evaluationSchema (rubric)', () => {
  test('overall score is the rounded mean of the four dimensions', () => {
    const r = schemas.evaluationSchema.parse({ correctness: 8, depth: 6, clarity: 7, structure: 7, ...base });
    expect(r.score).toBe(7);
    expect(r.rubric).toEqual({ correctness: 8, depth: 6, clarity: 7, structure: 7 });
  });

  test('clamps dimensions to 1-10 and rounds decimals', () => {
    const r = schemas.evaluationSchema.parse({ correctness: 14, depth: 0, clarity: '6.6', structure: 5, ...base });
    expect(r.rubric).toEqual({ correctness: 10, depth: 1, clarity: 7, structure: 5 });
  });

  test('rejects output missing a dimension or feedback text', () => {
    expect(schemas.evaluationSchema.safeParse({ correctness: 5, depth: 5, clarity: 5, ...base }).success).toBe(false);
    expect(schemas.evaluationSchema.safeParse({ correctness: 5, depth: 5, clarity: 5, structure: 5, good: '', missing: 'm', modelAnswer: 'x' }).success).toBe(false);
  });
});

describe('questionsSchema', () => {
  const qs = ['Question one?', 'Question two?', 'Question three?', 'Question four?', 'Question five?', 'Question six?'];

  test('keeps exactly five questions', () => {
    expect(schemas.questionsSchema.parse({ questions: qs }).questions).toHaveLength(5);
  });

  test('accepts objects and renamed keys', () => {
    const r = schemas.questionsSchema.parse({ interview_questions: qs.map((question) => ({ question })) });
    expect(r.questions[0]).toBe('Question one?');
  });

  test('rejects fewer than five questions', () => {
    expect(schemas.questionsSchema.safeParse({ questions: qs.slice(0, 3) }).success).toBe(false);
  });
});
