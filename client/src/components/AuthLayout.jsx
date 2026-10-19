import { CircleCheck, CircleAlert } from 'lucide-react';
import { Brand } from './Header';
import ThemeToggle from './ThemeToggle';

const SampleFeedback = () => (
  <div className="sample">
    <p className="sample-note">Sample feedback from a practice session</p>
    <div className="panel">
      <div className="sample-q">How would you reduce unnecessary re-renders in a large React list?</div>
      <div className="sample-score">
        <span className="score-big text-mid">7<small>/10</small></span>
        <span className="muted">Solid answer</span>
      </div>
      <div className="sample-block">
        <h3 className="text-high"><CircleCheck size={16} /> What worked</h3>
        <p>Clear case for memoization and for virtualizing long lists, with a reason for each.</p>
      </div>
      <div className="sample-block">
        <h3 className="text-low"><CircleAlert size={16} /> What was missing</h3>
        <p>No mention of measuring first with the React Profiler before optimizing.</p>
      </div>
    </div>
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="auth">
    <div className="auth-main">
      <div className="auth-top">
        <Brand to="/login" />
        <ThemeToggle />
      </div>
      <div className="auth-form">{children}</div>
    </div>
    <aside className="auth-aside" aria-hidden="true">
      <SampleFeedback />
    </aside>
  </div>
);

export default AuthLayout;
