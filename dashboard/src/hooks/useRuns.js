import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';

export function useRuns() {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRuns = useCallback(async () => {
        try {
            const data = await api.listRuns();
            setRuns(data.runs || []);
        } catch (e) {
            console.error('Failed to fetch runs:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRuns();
        const interval = setInterval(fetchRuns, 10000);
        return () => clearInterval(interval);
    }, [fetchRuns]);

    return { runs, loading, refresh: fetchRuns };
}

export function useRunStatus(runId) {
    const [status, setStatus] = useState(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!runId) return;

        const poll = async () => {
            try {
                const data = await api.getStatus(runId);
                setStatus(data);

                if (data.status === 'complete' || data.status === 'error' || data.status === 'webhook_failed') {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                }
            } catch (e) {
                console.error('Polling error:', e);
            }
        };

        poll();
        intervalRef.current = setInterval(poll, 3000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [runId]);

    return status;
}
