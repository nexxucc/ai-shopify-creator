import { Rocket, Activity, CheckCircle, Clock } from 'lucide-react';
import './Header.css';

export default function Header({ stats }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-icon">
          <Rocket size={20} />
        </div>
        <div className="logo-text">
          <h1>AI Shopify <span>Creator</span></h1>
          <p className="logo-subtitle">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="header-stats">
        <div className="header-stat">
          <div className="header-stat-value">{stats.total}</div>
          <div className="header-stat-label">
            <Activity size={12} /> Total Runs
          </div>
        </div>
        <div className="header-stat">
          <div className="header-stat-value success">{stats.successful}</div>
          <div className="header-stat-label">
            <CheckCircle size={12} /> Successful
          </div>
        </div>
        <div className="header-stat">
          <div className="header-stat-value">{stats.avgTime}</div>
          <div className="header-stat-label">
            <Clock size={12} /> Avg Time
          </div>
        </div>
      </div>
    </header>
  );
}
