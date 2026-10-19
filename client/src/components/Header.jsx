import { Link, useNavigate } from 'react-router-dom';
import { ClipboardCheck, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import ThemeToggle from './ThemeToggle';

export const Brand = ({ to = '/dashboard' }) => (
  <Link to={to} className="brand">
    <ClipboardCheck size={22} strokeWidth={2} />
    Interview Coach
  </Link>
);

const Header = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-bar no-print">
      <div className="app-bar-inner">
        <Brand />
        <div className="bar-actions">
          {children}
          {user?.name && <span className="bar-user">{user.name}</span>}
          <ThemeToggle />
          <button className="icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
