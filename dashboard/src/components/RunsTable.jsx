import { Check, Clock3, ExternalLink, Package, RefreshCcw, X } from 'lucide-react';
import './RunsTable.css';

function getStatusClass(status) {
  if (status === 'complete') return 'completed';
  if (status === 'error' || status === 'webhook_failed') return 'failed';
  if (status === 'running' || status === 'pending') return 'processing';
  return 'queued';
}

function getStatusLabel(status) {
  const labels = {
    complete: 'Completed',
    running: 'Processing',
    pending: 'Queued',
    error: 'Failed',
    webhook_failed: 'Failed',
  };

  return labels[status] || 'Queued';
}

function StatusIcon({ status }) {
  const className = getStatusClass(status);

  if (className === 'completed') return <Check size={13} />;
  if (className === 'failed') return <X size={13} />;
  if (className === 'processing') return <Clock3 size={13} />;
  return <Package size={13} />;
}

function formatDetail(run) {
  if (run.status === 'complete') return run.store_url ? 'Store ready for review.' : 'Generation completed.';
  if (run.status === 'error' || run.status === 'webhook_failed') return run.error_message || 'Execution failed. Review n8n logs.';
  if (run.current_phase) return `${run.current_phase.replaceAll('_', ' ')}...`;
  return 'Waiting for workflow update...';
}

export default function RunsTable({ runs, loading }) {
  const visibleRuns = runs.slice(0, 7);

  return (
    <aside className="history-panel fade-in" id="history" aria-labelledby="history-heading">
      <div className="history-header">
        <div>
          <h2 id="history-heading">Generation History</h2>
          <p>Latest production executions</p>
        </div>
      </div>

      {loading ? (
        <div className="timeline-list loading-list">
          {[1, 2, 3].map((item) => (
            <div key={item} className="timeline-item skeleton-item" />
          ))}
        </div>
      ) : visibleRuns.length === 0 ? (
        <div className="history-empty">
          <Package size={28} />
          <p>No generations yet</p>
          <span>Submit a store configuration to start the first run.</span>
        </div>
      ) : (
        <div className="timeline-list">
          {visibleRuns.map((run) => {
            const statusClass = getStatusClass(run.status);
            const statusLabel = getStatusLabel(run.status);

            return (
              <article key={run.id} className={`timeline-item ${statusClass}`}>
                <div className="timeline-marker">
                  <StatusIcon status={run.status} />
                </div>
                <div className="timeline-content">
                  <span className="timeline-status">{statusLabel}</span>
                  <h3>{run.niche || 'Untitled store'}</h3>
                  <p>{formatDetail(run)}</p>
                  {run.store_url ? (
                    <a href={run.store_url.startsWith('http') ? run.store_url : `https://${run.store_url}`} target="_blank" rel="noopener noreferrer">
                      View store <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="waiting-link">
                      <RefreshCcw size={12} /> {run.progress || 0}% complete
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </aside>
  );
}
