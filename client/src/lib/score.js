export const scoreLevel = (s) => (s >= 7 ? 'high' : s >= 5 ? 'mid' : 'low');

export const scoreLabel = (s) =>
  s >= 8 ? 'Strong answer' : s >= 6 ? 'Solid answer' : s >= 4 ? 'Needs more depth' : 'Needs significant work';

export const average = (arr = []) => {
  const nums = arr.filter((n) => typeof n === 'number');
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
};

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
