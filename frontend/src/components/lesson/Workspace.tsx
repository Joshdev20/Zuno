import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildDocument, mergeResults } from '../../lib/runner';
import { explainPythonError, runPython, type PythonRun } from '../../lib/python';
import { useSandbox } from '../../lib/useSandbox';
import { fileForKind } from '../../lib/curriculum';
import type { CheckResult, Lesson } from '../../lib/types';
import { motion, useReducedMotion } from 'framer-motion';
import { CodeEditor } from './CodeEditor';
import { EASE_OUT, POP, stagger } from '../../lib/motion';
import { Icon } from '../ui/Icon';

type Tab = 'preview' | 'console' | 'checks';

const tabLabels: Record<Tab, string> = {
  preview: 'Preview',
  console: 'Console',
  checks: 'Checks',
};

function readDraft(key: string, fallback: string): string {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function Workspace({
  lesson,
  completed,
  onComplete,
  onPassed,
  hideFoot,
  next,
}: {
  lesson: Lesson;
  completed: boolean;
  onComplete: () => void;
  onPassed?: () => void;
  hideFoot?: boolean;
  next?: { href: string; title: string };
}) {
  const draftKey = `zuno.draft.${lesson.id}`;
  const [code, setCode] = useState(() => readDraft(draftKey, lesson.exercise.starter));
  const [tab, setTab] = useState<Tab>(lesson.exercise.kind === 'js' ? 'console' : 'preview');
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [runId, setRunId] = useState(0);
  const reduceMotion = useReducedMotion();
  const [pyRun, setPyRun] = useState<PythonRun | null>(null);
  const [checking, setChecking] = useState(false);
  const { srcDoc, result, timedOut, run } = useSandbox();
  const pending = useRef(false);
  const codeRef = useRef(code);
  const autoTimer = useRef<number | null>(null);
  codeRef.current = code;

  const isPython = lesson.exercise.kind === 'python';
  const checks = lesson.exercise.checks;
  const total = checks.length;
  const passed = results ? results.filter((entry) => entry.ok).length : 0;
  const allPassed = results !== null && total > 0 && passed === total;

  const build = useCallback(
    (runId: string) =>
      buildDocument({
        exercise: lesson.exercise,
        code: codeRef.current,
        checks: lesson.exercise.checks,
        runId,
      }),
    [lesson.exercise],
  );

  useEffect(() => {
    setCode(readDraft(`zuno.draft.${lesson.id}`, lesson.exercise.starter));
    setResults(null);
    setPyRun(null);
    setChecking(false);
    setTab(lesson.exercise.kind === 'html' || lesson.exercise.kind === 'css' ? 'preview' : 'console');
  }, [lesson.id, lesson.exercise.starter, lesson.exercise.kind]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, code);
      } catch {
        /* ignore storage failures */
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [code, draftKey]);

  useEffect(() => {
    if (isPython) return;
    if (autoTimer.current) window.clearTimeout(autoTimer.current);
    autoTimer.current = window.setTimeout(() => run(build), 650);
    return () => {
      if (autoTimer.current) window.clearTimeout(autoTimer.current);
    };
  }, [code, run, build, isPython]);

  useEffect(() => {
    if (!result || !pending.current) return;
    pending.current = false;
    setResults(mergeResults(checks, result.results, codeRef.current));
    setRunId((current) => current + 1);
    setChecking(false);
    setTab('checks');
  }, [result, checks]);

  useEffect(() => {
    if (!timedOut || !pending.current) return;
    pending.current = false;
    setChecking(false);
    setResults(
      checks.map((check) => ({
        label: check.label,
        ok: false,
        detail: 'Timed out — check for an infinite loop.',
      })),
    );
    setTab('checks');
  }, [timedOut, checks]);

  useEffect(() => {
    if (allPassed) onPassed?.();
  }, [allPassed, onPassed]);

  const handleCheck = useCallback(() => {
    if (autoTimer.current) window.clearTimeout(autoTimer.current);
    if (isPython) {
      setChecking(true);
      void runPython(codeRef.current, checks).then((out) => {
        setPyRun(out);
        setResults(out.results.length > 0 ? out.results : null);
        setChecking(false);
        setTab('checks');
      });
      return;
    }
    pending.current = true;
    setChecking(true);
    run(build);
  }, [build, run, isPython, checks]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        handleCheck();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleCheck]);

  const resetCode = () => {
    setCode(lesson.exercise.starter);
    setResults(null);
  };

  const showSolution = () => {
    setCode(lesson.exercise.solution);
    setResults(null);
  };

  const tabs: Tab[] =
    lesson.exercise.kind === 'html' || (lesson.exercise.kind === 'css' && lesson.exercise.markup)
      ? ['preview', 'console', 'checks']
      : ['console', 'checks'];

  const logs = isPython ? pyRun?.logs ?? [] : result?.logs ?? [];
  const error = isPython ? pyRun?.error ?? null : result?.error ?? null;
  const fix = error ? explainPythonError(error) : null;

  return (
    <div className="workspace">
      <div className="ws-bar">
        <div className="ws-file">
          <span className={`ws-file-dot ws-file-dot--${lesson.exercise.kind}`} aria-hidden="true" />
          <span className="mono">{fileForKind[lesson.exercise.kind]}</span>
        </div>
        <div className="ws-actions">
          <button type="button" className="ws-btn" onClick={resetCode} title="Reset to starter code">
            <Icon name="rotate" size={14} />
            <span>Reset</span>
          </button>
          <button type="button" className="ws-btn" onClick={showSolution} title="Load the reference solution">
            Solution
          </button>
          <button type="button" className="ws-check" onClick={handleCheck} disabled={checking}>
            {checking ? (isPython ? 'Running…' : 'Checking…') : isPython ? 'Run' : 'Check'}
            <kbd>⌘↵</kbd>
          </button>
        </div>
      </div>

      <div className="ws-editor">
        <CodeEditor value={code} onChange={setCode} kind={lesson.exercise.kind} />
      </div>

      <div className="ws-panes">
        <div className="ws-tabs" role="tablist" aria-label="Output panes">
          {tabs.map((entry) => (
            <button
              key={entry}
              type="button"
              role="tab"
              aria-selected={tab === entry}
              className={`ws-tab${tab === entry ? ' is-active' : ''}`}
              onClick={() => setTab(entry)}
            >
              {tabLabels[entry]}
              {entry === 'checks' && results && (
                <span className={`ws-tab-count${allPassed ? ' is-ok' : ''}`}>
                  {passed}/{total}
                </span>
              )}
            </button>
          ))}
          <span className="ws-pane-hint">{tab === 'preview' ? 'Live' : ''}</span>
        </div>

        <div className="ws-pane">
          <iframe
            title="Live preview"
            className={`ws-frame${tab === 'preview' ? '' : ' is-hidden'}`}
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-forms allow-modals"
          />

          {tab === 'console' && (
            <div className="ws-console mono">
              {error && <p className="console-error">{error}</p>}
              {fix && <p className="console-fix">{fix}</p>}
              {timedOut && <p className="console-error">Execution timed out after 5 seconds.</p>}
              {!error && !timedOut && logs.length === 0 && (
                <p className="console-empty">
                  {isPython
                    ? 'Run the code to see print() output here.'
                    : lesson.exercise.kind === 'js'
                      ? 'Console output appears here. Try console.log() in your code.'
                      : 'Your console output will appear here.'}
                </p>
              )}
              {logs.map((line, index) => (
                <p key={index} className="console-line">
                  <span className="console-caret">›</span>
                  {line}
                </p>
              ))}
            </div>
          )}

          {tab === 'checks' && (
            <div className="ws-checks">
              {!results && (
                <p className="checks-empty">
                  Press <strong>Check</strong> to run the tests against your code. Nothing is graded on style —
                  only on behaviour.
                </p>
              )}
              {results && (
                <>
                  <div className="checks-summary">
                    <span className={`checks-score${allPassed ? ' is-ok' : ''}`}>
                      {passed} of {total} passing
                    </span>
                    <span className="checks-hint">
                      {allPassed ? 'Everything checks out.' : 'Fix the items below and check again.'}
                    </span>
                  </div>
                  <motion.ul
                    key={runId}
                    className="checks-list"
                    variants={stagger(0.05, 0.06)}
                    initial={reduceMotion ? false : 'hidden'}
                    animate="shown"
                  >
                    {results.map((entry, index) => (
                      <motion.li
                        key={`${entry.label}-${index}`}
                        className={entry.ok ? 'is-ok' : 'is-bad'}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          shown: { opacity: 1, x: 0, transition: POP },
                        }}
                      >
                        <motion.span
                          className="check-mark"
                          initial={reduceMotion ? false : { scale: 0.4 }}
                          animate={{ scale: 1 }}
                          transition={POP}
                        >
                          <Icon name={entry.ok ? 'check' : 'close'} size={12} />
                        </motion.span>
                        <span className="check-copy">
                          <span>{entry.label}</span>
                          {!entry.ok && entry.detail && (
                            <motion.small
                              initial={reduceMotion ? false : { opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.35, duration: 0.4, ease: EASE_OUT }}
                            >
                              {entry.detail}
                            </motion.small>
                          )}
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`ws-foot${hideFoot ? ' is-hidden' : ''}`}>
        {allPassed && !completed && (
          <>
            <span className="ws-foot-copy">
              <strong>All checks passed.</strong>
              <span>Mark the lesson complete to bank the XP.</span>
            </span>
            <button type="button" className="btn btn--primary btn--sm" onClick={onComplete}>
              Complete · +{lesson.xp} XP
            </button>
          </>
        )}
        {completed && (
          <>
            <span className="ws-foot-copy">
              <strong>
                <Icon name="check" size={14} /> Lesson complete
              </strong>
              <span>Your progress is saved in this browser.</span>
            </span>
            {next && (
              <Link to={next.href} className="btn btn--ghost btn--sm">
                Next lesson
                <Icon name="arrowRight" size={14} />
              </Link>
            )}
          </>
        )}
        {!allPassed && !completed && (
          <span className="ws-foot-copy ws-foot-copy--quiet">
            <Icon name="command" size={13} /> Press ⌘↵ to check, or use the Check button.
          </span>
        )}
      </div>
    </div>
  );
}
