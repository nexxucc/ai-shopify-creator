import { Bell, Circle, UserCircle } from 'lucide-react';
import './Header.css';

export default function Header({ stats }) {
  const formattedRuns = Number(stats.total || 0).toLocaleString('en-US');

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h2>Shopify Store Creator</h2>
      </div>

      <div className="topbar-meta" aria-label="System summary">
        <div className="meta-chip">
          <Circle size={8} fill="currentColor" />
          <span>System capacity: 88%</span>
        </div>
        <div className="meta-chip">
          <Circle size={8} fill="currentColor" />
          <span>Total runs: {formattedRuns}</span>
        </div>
        <div className="utility-icons" aria-hidden="true">
          <Bell size={21} />
          <UserCircle size={23} />
        </div>
      </div>
    </header>
  );
}
