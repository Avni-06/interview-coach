const groq = require('../config/groq');
const Session = require('../models/Session');

const generateQuestions = async (role) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `You are a senior technical interviewer at a top tech company.
Generate exactly 5 interview questions for a ${role} position.
Mix technical, problem-solving, and behavioral questions.
Return ONLY a JSON array of 5 strings, no extra text, no markdown, no backticks.
Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`
      }
    ],
  });
  const text = completion.choices[0].message.content.trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

const evaluateAnswer = async (question, answer, role) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `You are a senior ${role} interviewer evaluating a candidate's answer.

Question: ${question}
Candidate's Answer: ${answer}

Evaluate this answer and return ONLY a JSON object with no markdown, no backticks, exactly this format:
{
  "score": <number from 1 to 10>,
  "good": "<what was good about the answer in 1-2 sentences>",
  "missing": "<what was missing or could be improved in 1-2 sentences>",
  "modelAnswer": "<a strong model answer in 2-3 sentences>"
}`
      }
    ],
  });
  const text = completion.choices[0].message.content.trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

const startSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const questions = await generateQuestions(session.role);
    session.questions = questions;
    await session.save();
    res.json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'AI generation failed' });
  }
};

const evaluateSession = async (req, res) => {
  try {
    const { sessionId, questionIndex, answer } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const question = session.questions[questionIndex];
    if (!question) return res.status(400).json({ message: 'Invalid question index' });
    const feedback = await evaluateAnswer(question, answer, session.role);
    session.answers[questionIndex] = answer;
    session.feedback[questionIndex] = feedback.modelAnswer;
    session.scores[questionIndex] = feedback.score;
    if (questionIndex === session.questions.length - 1) {
      session.completed = true;
    }
    await session.save();
    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'AI evaluation failed' });
  }
};

module.exports = { startSession, evaluateSession };