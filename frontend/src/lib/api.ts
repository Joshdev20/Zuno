const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

/** The FastAPI service is optional: without VITE_API_URL the app stays fully local. */
export const apiEnabled = BASE_URL.length > 0;

const CLIENT_KEY = 'zuno.client.v1';

function clientId(): string {
  try {
    const existing = window.localStorage.getItem(CLIENT_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(CLIENT_KEY, created);
    return created;
  } catch {
    return 'anonymous';
  }
}

export interface ProgressSnapshot {
  completed: string[];
  xp: number;
  streak: number;
  active_days: string[];
}

export async function saveProgress(snapshot: ProgressSnapshot): Promise<void> {
  if (!apiEnabled) return;
  await fetch(`${BASE_URL}/api/progress/${clientId()}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(snapshot),
    keepalive: true,
  });
}
