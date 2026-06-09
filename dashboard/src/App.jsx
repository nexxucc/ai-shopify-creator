import { useState, useCallback } from 'react';
import { BarChart3, Box, LayoutDashboard, ShieldCheck, Trash2 } from 'lucide-react';
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
    successful: runs.filter((run) => run.status === 'complete').length,
    running: runs.filter((run) => run.status === 'running' || run.status === 'pending').length,
    failed: runs.filter((run) => run.status === 'error' || run.status === 'webhook_failed').length,
  };

  const handleCreate = useCallback(async (formData) => {
    setCreating(true);
    try {
      const data = await api.createStore(formData);
      setActiveRunId(data.runId);
      showToast('Store generation started. Track the run in generation history.');
      refresh();
    } catch (err) {
      showToast(err.message, 'error');
      setCreating(false);
    }
  }, [showToast, refresh]);

  const handleRunComplete = useCallback((status) => {
    if (status === 'complete') {
      showToast('Store generation completed.');
    } else {
      showToast('Store generation failed. Review the latest n8n execution.', 'error');
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
    <div className="obsidian-app">
      <aside className="side-rail" aria-label="Primary navigation">
        <div className="brand-stack">
          <div className="brand-mark" aria-hidden="true">
            <Box size={20} />
          </div>
          <div>
            <h1>Shopify Creator</h1>
            <p>v1.0.4</p>
          </div>
        </div>

        <nav className="nav-stack">
          <a className="nav-item active" href="#dashboard">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>
          <a className="nav-item" href="#history">
            <BarChart3 size={20} />
            <span>History</span>
          </a>
        </nav>

        <div className="rail-footer">
          <div className="rail-status">
            <ShieldCheck size={18} />
            <div>
              <span>Production</span>
              <strong>Pipeline online</strong>
            </div>
          </div>
        </div>
      </aside>

      <div className="workspace" id="dashboard">
        <Header stats={stats} />

        <main className="workspace-main">
          <section className="configuration-column" aria-label="Store configuration">
            <CreateStoreForm onSubmit={handleCreate} disabled={creating} />

            {activeRunId && (
              <ActiveRunBanner runId={activeRunId} onComplete={handleRunComplete} />
            )}

            {runs.length > 0 && (
              <div className="cleanup-section">
                <button className="btn-cleanup" onClick={handleCleanup}>
                  <Trash2 size={15} />
                  Clean up store and reset database
                </button>
              </div>
            )}
          </section>

          <RunsTable runs={runs} loading={loading} />
        </main>

        <footer className="footer">
          <p>Built with n8n, Gemini/Groq, Postgres, and Shopify Admin API</p>
          <div>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>API Documentation</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
