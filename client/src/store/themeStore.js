import { create } from 'zustand';

const read = () => {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* storage unavailable */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const apply = (theme) => {
  document.documentElement.dataset.theme = theme;
};

const useThemeStore = create((set, get) => {
  const initial = read();
  apply(initial);
  return {
    theme: initial,
    toggle: () => {
      const next = get().theme === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('theme', next); } catch { /* ignore */ }
      set({ theme: next });
    },
  };
});

export default useThemeStore;
