import { ExternalLink, Package, RefreshCcw } from 'lucide-react';
import './RunsTable.css';

function StatusBadge({ status }) {
  const labels = {
    complete: 'Complete',
    running: 'Running',
    pending: 'Pending',
    error: 'Error',
    webhook_failed: 'Failed',
  };

  return (
    <span className={`status-badge ${status}`}>
      <span className="status-dot-small" />
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
      <section className="runs-section">
        <h3 className="section-title"><Package size={18} /> Recent runs</h3>
        <div className="loading-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="runs-section fade-in">
      <div className="section-header">
        <div>
          <h3 className="section-title"><Package size={18} /> Recent runs</h3>
          <p>Latest production workflow attempts and their current phase.</p>
        </div>
        <span className="run-count">{runs.length} total</span>
      </div>

      {runs.length === 0 ? (
        <div className="empty-state">
          <Package size={34} />
          <p>No runs yet</p>
          <span>Create your first storefront brief above.</span>
        </div>
      ) : (
        <div className="runs-list">
          {runs.map((run) => {
            const progress = run.progress || 0;
            return (
              <article key={run.id} className="run-row">
                <div className="run-row-main">
                  <div className="run-heading">
                    <div>
                      <h4>{run.niche || 'Untitled run'}</h4>
                      <span>{run.target_audience || 'No audience provided'}</span>
                    </div>
                    <span className="run-id">{run.id.substring(0, 8)}</span>
                  </div>

                  <div className="run-meta">
                    <StatusBadge status={run.status} />
                    <span>{progress}%</span>
                    <span>{run.current_phase || 'queued'}</span>
                  </div>

                  <div className="mini-progress" aria-hidden="true">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="run-row-side">
                  <span className="run-date">{formatDate(run.created_at)}</span>
                  {run.store_url ? (
                    <a href={run.store_url.startsWith('http') ? run.store_url : `https://${run.store_url}`} target="_blank" rel="noopener noreferrer" className="store-link">
                      Open store <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="store-link muted"><RefreshCcw size={13} /> Waiting</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
