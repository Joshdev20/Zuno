import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Lesson } from '../../lib/types';
import { buildPreview } from '../../lib/runner';
import { CodeTokens } from '../ui/CodeTokens';

type Box = { width: number; height: number; scale: number };

const DESKTOP: Box = { width: 900, height: 380, scale: 0.4 };
const MOBILE: Box = { width: 420, height: 460, scale: 0.8 };

/**
 * Shows the finished exercise at the top of a lesson, so the payoff is visible
 * before the reading starts. Rendered in a sandboxed frame and scaled to the
 * container width; Python lessons show the solution instead of a page.
 */
export function ProjectPreview({ lesson }: { lesson: Lesson }) {
  const reduceMotion = useReducedMotion();
  const doc = useMemo(() => buildPreview(lesson.exercise), [lesson]);
  const frame = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box>(DESKTOP);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const target = width < 520 ? MOBILE : DESKTOP;
      setBox({ ...target, scale: Math.min(1, width / target.width) });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [doc]);

  const frameHeight = doc ? box.height : 200;
  const title = lesson.build?.title ?? lesson.title;
  const blurb = lesson.build?.blurb ?? lesson.exercise.brief;

  return (
    <motion.section
      className="build-preview"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
    >
      <header className="build-preview-head">
        <p className="eyebrow">What you will build</p>
        <span className="chip chip--plain mono">{lesson.exercise.checks.length} checks</span>
      </header>

      <div
        className={`build-preview-frame${doc ? '' : ' build-preview-frame--code'}`}
        ref={frame}
        style={{ aspectRatio: `${box.width} / ${frameHeight}` }}
      >
        {doc ? (
          <iframe
            title={`Preview of the finished ${title.toLowerCase()}`}
            srcDoc={doc}
            sandbox="allow-scripts"
            tabIndex={-1}
            style={{
              width: box.width,
              height: box.height,
              transform: `scale(${box.scale})`,
            }}
          />
        ) : (
          <pre className="build-preview-code">
            <code>
              <CodeTokens code={lesson.exercise.solution} language="python" />
            </code>
          </pre>
        )}
        <span className="build-preview-tag mono">{doc ? 'live preview' : 'solution'}</span>
      </div>

      <div className="build-preview-copy">
        <h3>{title}</h3>
        <p>{blurb}</p>
      </div>
    </motion.section>
  );
}
