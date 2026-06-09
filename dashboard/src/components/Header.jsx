import { Circle } from 'lucide-react';
import './Header.css';

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US');
}

export default function Header({ stats }) {
  const chips = [
    ['Total runs', stats.total],
    ['Successful', stats.successful],
    ['In progress', stats.running],
  ];

  if (stats.failed > 0) {
    chips.push(['Failed', stats.failed]);
  }

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h2>Shopify Store Creator</h2>
      </div>

      <div className="topbar-meta" aria-label="Run summary">
        {chips.map(([label, value]) => (
          <div className="meta-chip" key={label}>
            <Circle size={8} fill="currentColor" />
            <span>{label}: {formatNumber(value)}</span>
          </div>
        ))}
      </div>
    </header>
  );
}
