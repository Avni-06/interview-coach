import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../store/themeStore';

const ThemeToggle = () => {
  const { theme, toggle } = useThemeStore();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button className="icon-btn" onClick={toggle} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
