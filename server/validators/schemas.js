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

const createSessionSchema = z.object({
  role: z.string().trim().min(2).max(60),
});

const startSchema = z.object({ sessionId: objectId });

const evaluateSchema = z.object({
  sessionId: objectId,
  questionIndex: z.number().int().min(0).max(19),
  answer: z.string().trim().min(1).max(3000),
});

const sessionAnswerSchema = z.object({
  answer: z.string().trim().min(1).max(3000),
});

module.exports = {
  registerSchema,
  loginSchema,
  createSessionSchema,
  startSchema,
  evaluateSchema,
  sessionAnswerSchema,
};
