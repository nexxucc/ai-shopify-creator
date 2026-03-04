import { useState, useCallback } from 'react';
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
    avgTime: runs.length > 0 ? '~5m' : '—',
  };

  const handleCreate = useCallback(async (formData) => {
    setCreating(true);
    try {
      const data = await api.createStore(formData);
      setActiveRunId(data.runId);
      showToast('🚀 Store creation started!');
      refresh();
    } catch (err) {
      showToast(err.message, 'error');
      setCreating(false);
    }
  }, [showToast, refresh]);

  const handleRunComplete = useCallback((status) => {
    if (status === 'complete') {
      showToast('🎉 Store created successfully!');
    } else {
      showToast('❌ Store creation failed. Check the run details.', 'error');
    }
    setActiveRunId(null);
    setCreating(false);
    refresh();
  }, [showToast, refresh]);

  const handleCleanup = useCallback(async () => {
    if (!confirm('This will delete ALL products, collections, pages from Shopify and clear the database. Continue?')) return;
    try {
      const result = await api.cleanup();
      showToast(`🧹 Cleaned: ${result.deleted.products} products, ${result.deleted.collections} collections, ${result.deleted.pages} pages`);
      refresh();
    } catch (err) {
      showToast('Cleanup failed: ' + err.message, 'error');
    }
  }, [showToast, refresh]);

  return (
    <div className="app">
      <Header stats={stats} />

      <main className="main-content">
        <CreateStoreForm onSubmit={handleCreate} disabled={creating} />

        {activeRunId && (
          <ActiveRunBanner runId={activeRunId} onComplete={handleRunComplete} />
        )}

        <RunsTable runs={runs} loading={loading} />

        {runs.length > 0 && (
          <div className="cleanup-section">
            <button className="btn-cleanup" onClick={handleCleanup}>
              🧹 Clean Up Store & Reset Database
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built with Gemini AI + n8n + Shopify API</p>
      </footer>
    </div>
  );
}
