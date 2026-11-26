import type { PointerEvent } from 'react';

export function trackSpotlight(event: PointerEvent<HTMLElement>) {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  target.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  target.style.setProperty('--my', `${event.clientY - rect.top}px`);
}
