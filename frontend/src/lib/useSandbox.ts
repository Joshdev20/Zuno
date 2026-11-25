import { useCallback, useEffect, useRef, useState } from 'react';
import type { RunResult } from './types';

export function useSandbox(timeoutMs = 5000) {
  const [srcDoc, setSrcDoc] = useState('');
  const [result, setResult] = useState<RunResult | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const runIdRef = useRef('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; runId?: string } & Partial<RunResult>;
      if (!data || data.type !== 'zuno:result' || data.runId !== runIdRef.current) return;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
      setTimedOut(false);
      setResult({
        results: data.results ?? [],
        logs: data.logs ?? [],
        error: data.error ?? null,
      });
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const run = useCallback(
    (build: (runId: string) => string) => {
      const runId = `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      runIdRef.current = runId;
      setResult(null);
      setTimedOut(false);
      setSrcDoc(build(runId));
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setTimedOut(true);
        setSrcDoc('');
      }, timeoutMs);
    },
    [timeoutMs],
  );

  return { srcDoc, result, timedOut, run };
}
