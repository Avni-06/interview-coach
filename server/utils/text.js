const MAX_CONTEXT = 4000;

/**
 * Cleans user-pasted context (job description / resume) before it is stored or sent to the LLM:
 * - removes anything that could close our <context> wrapper tag
 * - redacts emails and phone numbers (resumes are full of them, the model never needs them)
 * - normalises whitespace and caps the length
 */
function sanitizeContext(input = '') {
  return String(input)
    .replace(/<\/?\s*context\s*>/gi, ' ')
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]')
    .replace(/(\+?\d[\d\s().-]{8,}\d)/g, '[phone]')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_CONTEXT);
}

module.exports = { sanitizeContext, MAX_CONTEXT };
