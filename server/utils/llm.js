const groq = require('../config/groq');

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Calls the LLM in JSON mode and validates the result with a zod schema.
 * Retries on malformed / invalid output so one bad response doesn't crash the request.
 */
async function callJSON({ system, user, schema, temperature = 0.2, retries = 2 }) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create(
        {
          model: MODEL,
          temperature,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        },
        { timeout: 30000 }
      );
      const raw = completion.choices[0].message.content;
      return schema.parse(JSON.parse(raw));
    } catch (err) {
      lastErr = err;
      console.warn(`LLM attempt ${attempt + 1} failed: ${err.message}`);
    }
  }
  const error = new Error('AI response failed after retries');
  error.status = 502;
  error.cause = lastErr;
  throw error;
}

// Role comes from the user: strip anything that could break out of the prompt.
const safeText = (s, max = 60) => String(s).replace(/[^\p{L}\p{N}\s&+/.,()-]/gu, '').slice(0, max).trim();

module.exports = { callJSON, safeText };
