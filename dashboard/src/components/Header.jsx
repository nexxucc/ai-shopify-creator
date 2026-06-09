import { Activity, CheckCircle2, Clock3, Rocket, RotateCcw } from 'lucide-react';
import './Header.css';

export default function Header({ stats }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <div className="logo-icon" aria-hidden="true">
            <Rocket size={21} />
          </div>
          <div className="logo-text">
            <h1>AI Shopify Creator</h1>
            <p>Controlled storefront generation pipeline</p>
          </div>
        </div>

        <div className="header-stats" aria-label="Run statistics">
          <div className="header-stat">
            <Activity size={15} />
            <div>
              <strong>{stats.total}</strong>
              <span>Total runs</span>
            </div>
          </div>
          <div className="header-stat">
            <CheckCircle2 size={15} />
            <div>
              <strong className="success">{stats.successful}</strong>
              <span>Successful</span>
            </div>
          </div>
          <div className="header-stat">
            <RotateCcw size={15} />
            <div>
              <strong>{stats.running}</strong>
              <span>In progress</span>
            </div>
          </div>
          <div className="header-stat">
            <Clock3 size={15} />
            <div>
              <strong>{stats.avgTime}</strong>
              <span>Average time</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
