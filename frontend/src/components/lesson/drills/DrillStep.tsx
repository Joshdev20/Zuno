import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Drill } from '../../../lib/types';
import { matchesAnswer, shuffleWithSeed } from '../../../lib/validate';
import { CodeTokens } from '../../ui/CodeTokens';
import { Icon } from '../../ui/Icon';
import { Inline } from '../Inline';
import { EASE_IN_OUT, POP, fadeUp, stagger } from '../../../lib/motion';

interface DrillStepProps {
  drill: Drill;
  language: string;
  solved: boolean;
  onSolved: () => void;
}

const label: Record<Drill['kind'], string> = {
  choice: 'Pick one',
  fill: 'Fill in the missing code',
  order: 'Put the lines in order',
  find: 'Find the error',
  predict: 'Predict the output',
  short: 'Short answer',
};

export function DrillStep({ drill, language, solved, onSolved }: DrillStepProps) {
  const [wrong, setWrong] = useState(0);
  const [showHint, setShowHint] = useState(0);
  const hints = drill.hints ?? [];
  const markWrong = () => setWrong((n) => n + 1);

  useEffect(() => {
    setWrong(0);
    setShowHint(0);
  }, [drill]);

  return (
    <div className="runner-step">
      <p className="runner-eyebrow mono">{label[drill.kind]}</p>
      <h2 className="runner-h2">
        <Inline text={drill.prompt} />
      </h2>

      {drill.kind === 'choice' && <ChoiceDrill drill={drill} solved={solved} onSolved={onSolved} onWrong={markWrong} />}
      {drill.kind === 'fill' && (
        <FillDrill drill={drill} language={language} solved={solved} onSolved={onSolved} onWrong={markWrong} />
      )}
      {drill.kind === 'order' && (
        <OrderDrill drill={drill} language={language} solved={solved} onSolved={onSolved} onWrong={markWrong} />
      )}
      {drill.kind === 'find' && (
        <FindDrill drill={drill} language={language} solved={solved} onSolved={onSolved} onWrong={markWrong} />
      )}
      {(drill.kind === 'predict' || drill.kind === 'short') && (
        <TextDrill drill={drill} language={language} solved={solved} onSolved={onSolved} onWrong={markWrong} />
      )}

      {wrong > 0 && !solved && showHint < hints.length && (
        <button type="button" className="drill-hint-btn" onClick={() => setShowHint((n) => n + 1)}>
          <Icon name="bulb" size={13} />
          Show hint {showHint + 1} of {hints.length}
        </button>
      )}
      {hints.slice(0, showHint).map((hint, index) => (
        <p key={index} className="drill-hint">
          <span className="mono">Hint {index + 1}</span>
          <Inline text={hint} />
        </p>
      ))}

      {solved && (
        <div className="drill-explain">
          <p className="drill-explain-title">
            <Icon name="check" size={13} /> Correct
          </p>
          <p>
            <Inline text={drill.explain} />
          </p>
        </div>
      )}
    </div>
  );
}

function ChoiceDrill({
  drill,
  solved,
  onSolved,
  onWrong,
}: {
  drill: Extract<Drill, { kind: 'choice' }>;
  solved: boolean;
  onSolved: () => void;
  onWrong: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <motion.ul
      className="runner-options"
      variants={stagger(0, 0.05)}
      initial={reduceMotion ? false : 'hidden'}
      animate="shown"
    >
      {drill.options.map((option, index) => {
        const state = solved
          ? index === drill.answer
            ? 'is-correct'
            : 'is-muted'
          : picked === index
            ? index === drill.answer
              ? 'is-correct'
              : 'is-wrong'
            : '';
        return (
          <motion.li key={option} variants={fadeUp}>
            <motion.button
              type="button"
              className={`runner-option ${state}`}
              disabled={solved}
              animate={state === 'is-wrong' ? { x: [0, -6, 6, -3, 0] } : { x: 0 }}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              transition={{ duration: 0.32, ease: EASE_IN_OUT }}
              onClick={() => {
                if (solved) return;
                setPicked(index);
                if (index === drill.answer) onSolved();
                else onWrong();
              }}
            >
              <span className="runner-option-key">{String.fromCharCode(65 + index)}</span>
              <span className="runner-option-copy">
                <Inline text={option} />
              </span>
              {state === 'is-correct' && (
                <motion.span
                  className="runner-option-mark"
                  initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={POP}
                >
                  <Icon name="check" size={15} />
                </motion.span>
              )}
              {state === 'is-wrong' && <Icon name="close" size={15} />}
            </motion.button>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

function FillDrill({
  drill,
  language,
  solved,
  onSolved,
  onWrong,
}: {
  drill: Extract<Drill, { kind: 'fill' }>;
  language: string;
  solved: boolean;
  onSolved: () => void;
  onWrong: () => void;
}) {
  const [values, setValues] = useState<string[]>(() => drill.blanks.map(() => ''));
  const [checked, setChecked] = useState<boolean[] | null>(null);
  const segments = useMemo(() => drill.code.split(/(\{\{\d+\}\})/), [drill.code]);

  useEffect(() => {
    setValues(drill.blanks.map(() => ''));
    setChecked(null);
  }, [drill]);

  const submit = () => {
    if (solved) return;
    const marks = drill.blanks.map((accepted, index) => matchesAnswer(values[index] ?? '', accepted));
    setChecked(marks);
    if (marks.every(Boolean)) onSolved();
    else onWrong();
  };

  return (
    <div className="drill-fill">
      <pre className="drill-code">
        <code>
          {segments.map((segment, index) => {
            const match = segment.match(/^\{\{(\d+)\}\}$/);
            if (!match)
              return (
                <span key={index}>
                  <CodeTokens code={segment} language={language} />
                </span>
              );
            const blank = Number(match[1]);
            const state = checked ? (checked[blank] ? 'is-ok' : 'is-bad') : '';
            return (
              <input
                key={index}
                className={`drill-blank ${state}`}
                value={values[blank] ?? ''}
                aria-label={`Blank ${blank + 1}`}
                size={Math.max(6, (drill.blanks[blank]?.[0] ?? '').length + 1)}
                disabled={solved}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                onChange={(event) => {
                  const next = [...values];
                  next[blank] = event.target.value;
                  setValues(next);
                  setChecked(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submit();
                }}
              />
            );
          })}
        </code>
      </pre>
      {!solved && (
        <button type="button" className="btn btn--primary btn--sm drill-submit" onClick={submit}>
          Check answer
        </button>
      )}
      {checked && !checked.every(Boolean) && (
        <p className="drill-miss">
          <Icon name="close" size={13} /> Not yet. The blank marked in red needs another look.
        </p>
      )}
    </div>
  );
}

function OrderDrill({
  drill,
  language,
  solved,
  onSolved,
  onWrong,
}: {
  drill: Extract<Drill, { kind: 'order' }>;
  language: string;
  solved: boolean;
  onSolved: () => void;
  onWrong: () => void;
}) {
  const shuffled = useMemo(() => {
    const entries = drill.lines.map((line, index) => ({ line, index }));
    const mixed = shuffleWithSeed(entries, drill.prompt);
    return mixed.some((entry, position) => entry.index !== position) ? mixed : [...mixed].reverse();
  }, [drill]);
  const [order, setOrder] = useState(shuffled);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setOrder(shuffled);
    setChecked(false);
  }, [shuffled]);

  const move = (from: number, direction: -1 | 1) => {
    const to = from + direction;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    setOrder(next);
    setChecked(false);
  };

  return (
    <div className="drill-order">
      <ol className="drill-order-list">
        {order.map((entry, position) => (
          <li
            key={entry.index}
            className={`drill-order-row${checked ? (entry.index === position ? ' is-ok' : ' is-bad') : ''}`}
          >
            <span className="drill-order-num mono">{position + 1}</span>
            <code>
              <CodeTokens code={entry.line} language={language} />
            </code>
            <span className="drill-order-moves">
              <button type="button" onClick={() => move(position, -1)} aria-label="Move line up" disabled={solved || position === 0}>
                <Icon name="arrowUp" size={12} />
              </button>
              <button
                type="button"
                onClick={() => move(position, 1)}
                aria-label="Move line down"
                disabled={solved || position === order.length - 1}
              >
                <Icon name="arrowDown" size={12} />
              </button>
            </span>
          </li>
        ))}
      </ol>
      {!solved && (
        <button
          type="button"
          className="btn btn--primary btn--sm drill-submit"
          onClick={() => {
            setChecked(true);
            if (order.every((entry, position) => entry.index === position)) onSolved();
            else onWrong();
          }}
        >
          Check order
        </button>
      )}
    </div>
  );
}

function FindDrill({
  drill,
  language,
  solved,
  onSolved,
  onWrong,
}: {
  drill: Extract<Drill, { kind: 'find' }>;
  language: string;
  solved: boolean;
  onSolved: () => void;
  onWrong: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  return (
    <div className="drill-find">
      <ol className="drill-find-list">
        {drill.lines.map((line, index) => {
          const state = checked
            ? index === drill.bad
              ? ' is-ok'
              : picked === index
                ? ' is-bad'
                : ''
            : picked === index
              ? ' is-picked'
              : '';
          return (
            <li key={index}>
              <button
                type="button"
                className={`drill-find-row${state}`}
                disabled={solved}
                onClick={() => {
                  if (solved) return;
                  setPicked(index);
                  setChecked(false);
                }}
              >
                <span className="drill-order-num mono">{index + 1}</span>
                <code>
                  <CodeTokens code={line} language={language} />
                </code>
              </button>
            </li>
          );
        })}
      </ol>
      {!solved && (
        <button
          type="button"
          className="btn btn--primary btn--sm drill-submit"
          disabled={picked === null}
          onClick={() => {
            setChecked(true);
            if (picked === drill.bad) onSolved();
            else onWrong();
          }}
        >
          Check line
        </button>
      )}
      {checked && picked !== drill.bad && (
        <p className="drill-miss">
          <Icon name="close" size={13} /> That line is fine. Read each one as the computer would.
        </p>
      )}
    </div>
  );
}

function TextDrill({
  drill,
  language,
  solved,
  onSolved,
  onWrong,
}: {
  drill: Extract<Drill, { kind: 'predict' | 'short' }>;
  language: string;
  solved: boolean;
  onSolved: () => void;
  onWrong: () => void;
}) {
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setValue('');
    setChecked(false);
  }, [drill]);

  const submit = () => {
    if (solved) return;
    setChecked(true);
    if (matchesAnswer(value, drill.answers)) onSolved();
    else onWrong();
  };

  return (
    <div className="drill-text">
      {drill.kind === 'predict' && (
        <figure className="code-figure">
          <div className="code-figure-bar">
            <span>snippet</span>
          </div>
          <pre>
            <code>
              <CodeTokens code={drill.code} language={language} />
            </code>
          </pre>
        </figure>
      )}
      <div className="drill-answer">
        <input
          className={`drill-input${checked ? (solved ? ' is-ok' : ' is-bad') : ''}`}
          value={value}
          placeholder={drill.kind === 'predict' ? 'What does it print?' : 'Type your answer'}
          aria-label="Your answer"
          disabled={solved}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          onChange={(event) => {
            setValue(event.target.value);
            setChecked(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit();
          }}
        />
        {!solved && (
          <button type="button" className="btn btn--primary btn--sm" onClick={submit} disabled={!value.trim()}>
            Check answer
          </button>
        )}
      </div>
      {checked && !solved && (
        <p className="drill-miss">
          <Icon name="close" size={13} /> Not that one. Run it in your head line by line, then try again.
        </p>
      )}
    </div>
  );
}
