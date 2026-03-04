import { Package, ExternalLink } from 'lucide-react';
import './RunsTable.css';

function StatusBadge({ status }) {
  const labels = {
    complete: '✓ Complete',
    running: '● Running',
    pending: '○ Pending',
    error: '✕ Error',
    webhook_failed: '✕ Failed',
  };

  return (
    <span className={`status-badge ${status}`}>
      {labels[status] || status}
    </span>
  );
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function RunsTable({ runs, loading }) {
  if (loading) {
    return (
      <div className="runs-section">
        <h3 className="section-title"><Package size={18} /> Recent Runs</h3>
        <div className="loading-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="runs-section fade-in">
      <div className="section-header">
        <h3 className="section-title"><Package size={18} /> Recent Runs</h3>
        <span className="run-count">{runs.length} total</span>
      </div>

      {runs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>No runs yet</p>
          <span>Create your first AI store above!</span>
        </div>
      ) : (
        <div className="runs-list">
          {runs.map((run) => (
            <div key={run.id} className="run-row">
              <div className="run-row-main">
                <div className="run-niche">{run.niche || '—'}</div>
                <div className="run-meta">
                  <StatusBadge status={run.status} />
                  <span className="run-progress">{run.progress || 0}%</span>
                  <span className="run-phase">{run.current_phase || '—'}</span>
                </div>
              </div>
              <div className="run-row-side">
                <span className="run-date">{formatDate(run.created_at)}</span>
                <span className="run-id">{run.id.substring(0, 8)}</span>
                {run.store_url && (
                  <a href={run.store_url.startsWith('http') ? run.store_url : `https://${run.store_url}`} target="_blank" rel="noopener noreferrer" className="store-link">
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
