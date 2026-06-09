import { useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import Header from './components/Header';
import CreateStoreForm from './components/CreateStoreForm';
import ActiveRunBanner from './components/ActiveRunBanner';
import RunsTable from './components/RunsTable';
import { useToast } from './components/Toast';
import { useRuns } from './hooks/useRuns';
import { api } from './api';
import './App.css';

export default function App() {
  const { runs, loading, refresh } = useRuns();
  const [activeRunId, setActiveRunId] = useState(null);
  const [creating, setCreating] = useState(false);
  const showToast = useToast();

  const stats = {
    total: runs.length,
    successful: runs.filter((r) => r.status === 'complete').length,
    running: runs.filter((r) => r.status === 'running' || r.status === 'pending').length,
    avgTime: runs.length > 0 ? '~5m' : '—',
  };

  const handleCreate = useCallback(async (formData) => {
    setCreating(true);
    try {
      const data = await api.createStore(formData);
      setActiveRunId(data.runId);
      showToast('Store creation started. Track progress below.');
      refresh();
    } catch (err) {
      showToast(err.message, 'error');
      setCreating(false);
    }
  }, [showToast, refresh]);

  const handleRunComplete = useCallback((status) => {
    if (status === 'complete') {
      showToast('Store created successfully.');
    } else {
      showToast('Store creation failed. Check the run details.', 'error');
    }
    setActiveRunId(null);
    setCreating(false);
    refresh();
  }, [showToast, refresh]);

  const handleCleanup = useCallback(async () => {
    if (!confirm('This will delete all Shopify products, collections, pages, and clear the run database. Continue?')) return;
    try {
      const result = await api.cleanup();
      showToast(`Cleaned ${result.deleted.products} products, ${result.deleted.collections} collections, and ${result.deleted.pages} pages.`);
      refresh();
    } catch (err) {
      showToast('Cleanup failed: ' + err.message, 'error');
    }
  }, [showToast, refresh]);

  return (
    <div className="app">
      <Header stats={stats} />

      <main className="main-content">
        <section className="hero-shell fade-in">
          <div className="hero-copy">
            <p className="eyebrow">Shopify automation workspace</p>
            <h2>Generate a focused storefront from one structured brief.</h2>
            <p>
              Create products, collections, copy, pricing, and setup tasks through a controlled n8n pipeline connected to your Shopify development store.
            </p>
          </div>
          <div className="hero-panel" aria-label="Deployment status">
            <span className="status-dot" />
            <div>
              <strong>Production pipeline</strong>
              <span>Railway, n8n, Postgres, Shopify Admin API</span>
            </div>
          </div>
        </section>

        <CreateStoreForm onSubmit={handleCreate} disabled={creating} />

        {activeRunId && (
          <ActiveRunBanner runId={activeRunId} onComplete={handleRunComplete} />
        )}

        <RunsTable runs={runs} loading={loading} />

        {runs.length > 0 && (
          <div className="cleanup-section">
            <button className="btn-cleanup" onClick={handleCleanup}>
              <Trash2 size={15} />
              Clean up store and reset database
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built with n8n, Gemini/Groq, Postgres, and Shopify Admin API</p>
      </footer>
    </div>
  );
}
