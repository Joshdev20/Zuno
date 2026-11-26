import { Suspense, lazy, useEffect, useState } from 'react';

const WireScene = lazy(() => import('../three/WireScene').then((module) => ({ default: module.WireScene })));

/**
 * Mounts a three.js scene after first paint, and only on screens wide enough to
 * have room for it. Phones get the CSS-only version.
 */
export function AmbientScene({ variant = 'cluster' }: { variant?: 'cluster' | 'knot' }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(min-width: 900px)').matches) return;
    const idle =
      window.requestIdleCallback ?? ((run: () => void) => window.setTimeout(run, 500));
    const handle = idle(() => setReady(true));
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle as number);
      else window.clearTimeout(handle as number);
    };
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <WireScene variant={variant} />
    </Suspense>
  );
}
