export const scoreLevel = (s) => (s >= 7 ? 'high' : s >= 5 ? 'mid' : 'low');

export const scoreLabel = (s) =>
  s >= 8 ? 'Strong answer' : s >= 6 ? 'Solid answer' : s >= 4 ? 'Needs more depth' : 'Needs significant work';

export const average = (arr = []) => {
  const nums = arr.filter((n) => typeof n === 'number');
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
};

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const RUBRIC = [
  { key: 'correctness', label: 'Correctness' },
  { key: 'depth', label: 'Depth' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'structure', label: 'Structure' },
];

export const TYPE_LABELS = {
  mixed: 'Mixed',
  technical: 'Technical',
  behavioral: 'Behavioral',
  hr: 'HR',
};

export const LEVEL_LABELS = {
  intern: 'Intern / fresher',
  junior: 'Junior (0-2 yrs)',
  mid: 'Mid-level (3-5 yrs)',
};

// Average each rubric dimension across answered questions. Returns null for old sessions without rubric data.
export const averageRubric = (evaluations = []) => {
  const rated = evaluations.filter((e) => e?.rubric);
  if (!rated.length) return null;
  return Object.fromEntries(
    RUBRIC.map(({ key }) => [key, rated.reduce((sum, e) => sum + e.rubric[key], 0) / rated.length])
  );
};

export const FOCUS_TIPS = {
  correctness: 'Revisit the fundamentals behind the questions you missed. Check each claim before you say it.',
  depth: 'Go beyond definitions: add a concrete example, a trade-off, or a failure you have handled.',
  clarity: 'Lead with the answer in one sentence, then support it. Cut filler words and hedging.',
  structure: 'Use a simple frame: claim, reasoning, example. For behavioral questions use Situation, Task, Action, Result.',
};
