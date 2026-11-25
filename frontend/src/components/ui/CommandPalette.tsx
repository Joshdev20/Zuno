import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { allLessons, tracks } from '../../lib/curriculum';
import { Icon } from './Icon';

interface PaletteItem {
  id: string;
  label: string;
  meta: string;
  to: string;
  group: 'Go to' | 'Lessons';
}

const pages: PaletteItem[] = [
  { id: 'page-today', label: 'Today', meta: 'Dashboard and streak', to: '/learn', group: 'Go to' },
  { id: 'page-playground', label: 'Playground', meta: 'Write anything, see it live', to: '/playground', group: 'Go to' },
  { id: 'page-badges', label: 'Achievements', meta: 'Badges and progress', to: '/achievements', group: 'Go to' },
  { id: 'page-home', label: 'Landing page', meta: 'Marketing site', to: '/', group: 'Go to' },
];

const lessonItems: PaletteItem[] = allLessons.map((lesson) => {
  const track = tracks.find((entry) => entry.lessons.some((item) => item.id === lesson.id));
  return {
    id: lesson.id,
    label: lesson.title,
    meta: `${track?.name ?? ''} · ${lesson.level}`,
    to: `/learn/${track?.id}/${lesson.id}`,
    group: 'Lessons',
  };
});

const items = [...pages, ...lessonItems];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items.slice(0, 8);
    return items
      .filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(needle))
      .slice(0, 10);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const go = (item: PaletteItem | undefined) => {
    if (!item) return;
    navigate(item.to);
    onClose();
  };

  return (
    <div className="palette-backdrop" onMouseDown={onClose} role="presentation">
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Quick search"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="palette-input">
          <Icon name="search" size={17} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActive((current) => Math.min(current + 1, results.length - 1));
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActive((current) => Math.max(current - 1, 0));
              } else if (event.key === 'Enter') {
                event.preventDefault();
                go(results[active]);
              }
            }}
            placeholder="Search lessons, pages…"
            aria-label="Search lessons and pages"
          />
          <kbd>ESC</kbd>
        </div>
        <ul className="palette-list">
          {results.length === 0 && <li className="palette-empty">Nothing matches “{query}”.</li>}
          {results.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={`palette-item${index === active ? ' is-active' : ''}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(item)}
              >
                <span className="palette-item-main">
                  <Icon name={item.group === 'Lessons' ? 'book' : 'arrowRight'} size={15} />
                  <span>{item.label}</span>
                </span>
                <span className="palette-item-meta">{item.meta}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="palette-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to move
          </span>
          <span>
            <kbd>↵</kbd> to open
          </span>
        </div>
      </div>
    </div>
  );
}
