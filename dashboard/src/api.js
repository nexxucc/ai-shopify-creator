const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed: ${res.status}`);
    }

    return data;
}

export const api = {
    // Health
    health: () => request('/health'),

    // Store runs
    createStore: (payload) =>
        request('/api/stores/create', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    getStatus: (runId) => request(`/api/stores/${runId}/status`),

    getResult: (runId) => request(`/api/stores/${runId}/result`),

    listRuns: () => request('/api/stores'),

    cleanup: () =>
        request('/api/stores/cleanup', { method: 'DELETE' }),
};
