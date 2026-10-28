const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'must be a valid id');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(100),
});

const INTERVIEW_TYPES = ['mixed', 'technical', 'behavioral', 'hr'];
const DIFFICULTIES = ['intern', 'junior', 'mid'];

const createSessionSchema = z.object({
  role: z.string().trim().min(2).max(60),
  interviewType: z.enum(INTERVIEW_TYPES).default('mixed'),
  difficulty: z.enum(DIFFICULTIES).default('junior'),
  contextKind: z.enum(['jd', 'resume']).optional(),
  contextText: z.string().trim().max(4000).optional(),
}).refine((d) => !d.contextText || d.contextText.length >= 30, {
  message: 'add at least 30 characters or leave it empty',
  path: ['contextText'],
});

const startSchema = z.object({ sessionId: objectId });

const evaluateSchema = z.object({
  sessionId: objectId,
  questionIndex: z.number().int().min(0).max(19),
  answer: z.string().trim().min(1).max(3000),
});

const followUpSchema = z.object({
  sessionId: objectId,
  questionIndex: z.number().int().min(0).max(19),
});

module.exports = {
  INTERVIEW_TYPES,
  DIFFICULTIES,
  registerSchema,
  loginSchema,
  createSessionSchema,
  startSchema,
  evaluateSchema,
  followUpSchema,
};
