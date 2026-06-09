import { useEffect, useRef } from 'react';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import { useRunStatus } from '../hooks/useRuns';
import './ActiveRunBanner.css';

const PHASE_LABELS = {
  queued: 'Queued',
  architect: 'Planning storefront structure',
  researcher: 'Researching market direction',
  content: 'Writing product and page content',
  pricing: 'Preparing pricing model',
  theme: 'Preparing theme direction',
  building: 'Creating Shopify assets',
  done: 'Complete',
};

export default function ActiveRunBanner({ runId, onComplete }) {
  const status = useRunStatus(runId);
  const notifiedRef = useRef(false);

  const isFinished = status && ['complete', 'error', 'webhook_failed'].includes(status.status);
  const isError = status && (status.status === 'error' || status.status === 'webhook_failed');
  const progress = status?.progress || 0;
  const phase = status?.currentPhase || 'queued';
  const phaseLabel = PHASE_LABELS[phase] || phase || 'Processing';

  useEffect(() => {
    if (!isFinished || notifiedRef.current) return;

    notifiedRef.current = true;
    const timer = setTimeout(() => onComplete(status.status), 1500);
    return () => clearTimeout(timer);
  }, [isFinished, onComplete, status?.status]);

  if (!status) return null;

  return (
    <section className={`active-run ${isError ? 'failed' : ''} ${status.status === 'complete' ? 'completed' : ''}`}>
      <div className="active-run-heading">
        <div className="active-run-icon" aria-hidden="true">
          {isError ? <AlertTriangle size={17} /> : status.status === 'complete' ? <Check size={17} /> : <Loader2 size={17} className="spin" />}
        </div>
        <div>
          <span>Active run</span>
          <h3>{isError ? 'Generation failed' : status.status === 'complete' ? 'Generation complete' : phaseLabel}</h3>
        </div>
        <strong>{runId.substring(0, 8)}</strong>
      </div>

      <div className="run-progress-line" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <p>{isError ? (status.errorMessage || 'Open the failed n8n execution for details.') : `${progress}% complete`}</p>
    </section>
  );
}
