// Filler words and phrases. Longest first so "you know" is counted before "know".
const FILLERS = ['you know', 'i mean', 'kind of', 'sort of', 'basically', 'actually', 'literally', 'like', 'umm', 'um', 'uhh', 'uh', 'erm', 'er'];

const PATTERN = new RegExp(`\\b(${FILLERS.join('|')})\\b`, 'gi');

export const countFillers = (text = '') => {
  const byWord = {};
  let total = 0;
  for (const m of text.matchAll(PATTERN)) {
    const w = m[1].toLowerCase();
    byWord[w] = (byWord[w] || 0) + 1;
    total += 1;
  }
  const top = Object.entries(byWord)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word, count]) => ({ word, count }));
  return { total, top };
};

export const wordCount = (text = '') => (text.trim() ? text.trim().split(/\s+/).length : 0);
