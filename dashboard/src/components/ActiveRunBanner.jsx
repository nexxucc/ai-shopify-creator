import { useRunStatus } from '../hooks/useRuns';
import './ActiveRunBanner.css';

const PHASE_LABELS = {
  queued: 'Queued',
  architect: 'AI Architect designing store...',
  researcher: 'AI Researcher finding products...',
  content: 'AI Writer creating content...',
  pricing: 'AI Optimizer setting prices...',
  theme: 'AI Stylist picking theme...',
  building: 'Creating on Shopify...',
  done: 'Complete!',
};

export default function ActiveRunBanner({ runId, onComplete }) {
  const status = useRunStatus(runId);

  if (!status) return null;

  const isFinished = status.status === 'complete' || status.status === 'error' || status.status === 'webhook_failed';

  if (isFinished) {
    // Notify parent after a brief delay so user can see final state
    setTimeout(() => onComplete(status.status), 1500);
  }

  const phaseLabel = PHASE_LABELS[status.currentPhase] || status.currentPhase || 'Processing...';
  const progress = status.progress || 0;
  const isError = status.status === 'error' || status.status === 'webhook_failed';

  return (
    <div className={`active-run slide-down ${isError ? 'error' : ''} ${status.status === 'complete' ? 'complete' : ''}`}>
      <div className="active-run-header">
        <div className="active-run-title">
          {!isFinished && <div className="pulse-dot" />}
          {isError && <span className="error-icon">✕</span>}
          {status.status === 'complete' && <span className="success-icon">✓</span>}
          <span>{isError ? 'Build Failed' : status.status === 'complete' ? 'Store Created!' : 'Building your store...'}</span>
        </div>
        <span className="run-id-badge">{runId.substring(0, 8)}</span>
      </div>

      <div className={`progress-bar ${isError ? 'error' : ''}`}>
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="progress-info">
        <span className="phase-label">{isError ? (status.errorMessage || 'An error occurred') : phaseLabel}</span>
        <span className="progress-pct">{progress}%</span>
      </div>
    </div>
  );
}
