import { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, CircleDotDashed } from 'lucide-react';
import { useRunStatus } from '../hooks/useRuns';
import './ActiveRunBanner.css';

const PHASE_LABELS = {
  queued: 'Queued',
  architect: 'Planning storefront structure',
  researcher: 'Researching product direction',
  content: 'Writing product and page content',
  pricing: 'Preparing pricing strategy',
  theme: 'Preparing theme direction',
  building: 'Creating assets in Shopify',
  done: 'Complete',
};

const PHASES = ['architect', 'researcher', 'content', 'pricing', 'theme', 'building'];

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
    <section className={`active-run slide-down ${isError ? 'error' : ''} ${status.status === 'complete' ? 'complete' : ''}`}>
      <div className="active-run-header">
        <div className="active-run-title">
          {!isFinished && <CircleDotDashed size={20} className="active-icon spinning" />}
          {isError && <AlertCircle size={20} className="active-icon error" />}
          {status.status === 'complete' && <CheckCircle2 size={20} className="active-icon success" />}
          <div>
            <h3>{isError ? 'Build failed' : status.status === 'complete' ? 'Store created' : 'Store build in progress'}</h3>
            <p>{isError ? (status.errorMessage || 'Open the n8n execution for details.') : phaseLabel}</p>
          </div>
        </div>
        <span className="run-id-badge">{runId.substring(0, 8)}</span>
      </div>

      <div className={`progress-bar ${isError ? 'error' : ''}`}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="phase-track" aria-label="Build phases">
        {PHASES.map((item) => {
          const currentIndex = PHASES.indexOf(phase);
          const itemIndex = PHASES.indexOf(item);
          const isActive = item === phase;
          const isDone = status.status === 'complete' || (currentIndex >= 0 && itemIndex < currentIndex);

          return (
            <div key={item} className={`phase-pill ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
              <span />
              {PHASE_LABELS[item].replace('Preparing ', '').replace('Creating assets in ', '')}
            </div>
          );
        })}
      </div>
    </section>
  );
}
