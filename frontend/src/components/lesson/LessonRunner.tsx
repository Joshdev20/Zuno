import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getLesson, getTrack, lessonTrack, levelLabel, neighbours } from '../../lib/curriculum';
import { useProgress } from '../../lib/progress';
import type { Drill, Lesson, QuizQuestion, Section, Track } from '../../lib/types';
import { Icon } from '../ui/Icon';
import { LessonSections } from './LessonSections';
import { Inline } from './Inline';
import { NotFound } from '../../pages/NotFound';
import { isLessonUnlocked } from '../../lib/progress';
import { DrillStep } from './drills/DrillStep';
import { ProjectPreview } from './ProjectPreview';

const Workspace = lazy(() =>
  import('./Workspace').then((module) => ({ default: module.Workspace })),
);

type Step =
  | { kind: 'intro' }
  | { kind: 'section'; sections: Section[] }
  | { kind: 'drill'; drill: Drill; index: number }
  | { kind: 'practice' }
  | { kind: 'quiz'; question: QuizQuestion; index: number }
  | { kind: 'done' };

function groupSections(sections: Section[]): Section[][] {
  const groups: Section[][] = [];
  for (const section of sections) {
    const last = groups[groups.length - 1];
    const opensWithHeading = last?.length === 1 && last[0].type === 'heading';
    const prose = section.type === 'text';
    const lastHasProse = Boolean(last?.some((entry) => entry.type === 'text' || entry.type === 'heading'));
    if (!last || section.type === 'heading' || (prose && lastHasProse && !opensWithHeading)) groups.push([section]);
    else last.push(section);
  }
  return groups;
}

function buildSteps(lesson: Lesson): Step[] {
  const groups = groupSections(lesson.sections);
  const drills = lesson.drills ?? [];
  const steps: Step[] = [{ kind: 'intro' }];
  groups.forEach((sections, groupIndex) => {
    steps.push({ kind: 'section', sections });
    drills.forEach((drill, drillIndex) => {
      const target = drill.after ?? groups.length - 1;
      if (target === groupIndex) steps.push({ kind: 'drill', drill, index: drillIndex });
    });
  });
  steps.push({ kind: 'practice' });
  lesson.quiz.forEach((question, index) => steps.push({ kind: 'quiz', question, index }));
  steps.push({ kind: 'done' });
  return steps;
}

export function LessonRunner() {
  const { trackId, lessonId } = useParams();
  const track: Track | undefined = getTrack(trackId);
  const lesson = getLesson(trackId, lessonId);

  if (!track || !lesson) return <NotFound />;

  return <Runner key={lesson.id} lesson={lesson} track={track} />;
}

function Runner({ lesson, track }: { lesson: Lesson; track: Track }) {
  const { state, completeLesson, completeQuiz, setResume } = useProgress();
  const unlocked = isLessonUnlocked(state, track, lesson);
  const steps = useMemo(() => buildSteps(lesson), [lesson]);
  const stored = state.resume[lesson.id] ?? 0;
  const [index, setIndex] = useState(() => Math.min(Math.max(stored, 0), steps.length - 1));
  const [exerciseSolved, setExerciseSolved] = useState(Boolean(state.completed[lesson.id]));
  const [choice, setChoice] = useState<number | null>(null);
  const [quizSolved, setQuizSolved] = useState<Record<number, boolean>>({});
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [drillSolved, setDrillSolved] = useState<Record<number, boolean>>({});
  const [banked, setBanked] = useState(Boolean(state.completed[lesson.id]));

  const step = steps[index];
  const lessonIndex = track.lessons.findIndex((entry) => entry.id === lesson.id);
  const { next } = neighbours(lesson.id);
  const nextTrack = next ? lessonTrack.get(next.id) : undefined;

  useEffect(() => {
    setResume(lesson.id, index);
  }, [index, lesson.id, setResume]);

  useEffect(() => {
    document.title = `${lesson.title} — Zuno`;
    return () => {
      document.title = 'Zuno';
    };
  }, [lesson.title]);

  const solved = useCallback(() => setExerciseSolved(true), []);

  const canContinue =
    step.kind === 'practice'
      ? exerciseSolved
      : step.kind === 'quiz'
        ? Boolean(quizSolved[step.index])
        : step.kind === 'drill'
          ? Boolean(drillSolved[step.index])
          : true;

  const advance = () => {
    if (step.kind === 'quiz') setChoice(null);
    if (step.kind === 'done') return;
    setIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const finish = () => {
    if (banked) return;
    completeLesson(lesson);
    const perfect = lesson.quiz.length > 0 && lesson.quiz.every((_, questionIndex) => attempts[questionIndex] === 1);
    completeQuiz(lesson.id, perfect);
    setBanked(true);
  };

  useEffect(() => {
    if (step.kind === 'done') finish();
  });

  const progress = ((index + 1) / steps.length) * 100;
  const reduceMotion = useReducedMotion();
  const stepMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
      };

  if (!unlocked && !state.completed[lesson.id]) return <LockedNotice lesson={lesson} track={track} />;

  return (
    <div className="runner">
      <header className="runner-top">
        <Link to={`/learn/${track.id}`} className="runner-close" aria-label="Close lesson">
          <Icon name="close" size={16} />
        </Link>
        <div className="runner-head">
          <p className="runner-eyebrow mono">
            {track.name} · lesson {lessonIndex + 1} of {track.lessons.length}
          </p>
          <p className="runner-title">{lesson.title}</p>
        </div>
        <span className="runner-count mono">
          {index + 1}/{steps.length}
        </span>
        <div className="runner-bar" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <motion.span
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 26 }}
          />
        </div>
      </header>

      <main className="runner-main">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={index} className="runner-step-shell" {...stepMotion}>
        {step.kind === 'intro' && (
          <div className="runner-step">
            <div className="runner-chips">
              <span className={`chip chip--${track.id === 'css' ? 'clay' : track.id === 'js' ? 'brass' : 'pine'}`}>
                {track.name}
              </span>
              <span className="chip chip--plain">{levelLabel[lesson.level]}</span>
              <span className="chip chip--plain">{lesson.minutes} min</span>
              <span className="chip chip--plain">+{lesson.xp} XP</span>
            </div>
            <h1 className="runner-h1">{lesson.title}</h1>
            <p className="runner-lede">{lesson.summary}</p>
            <ProjectPreview lesson={lesson} />
            <section className="objectives">
              <p className="objectives-label">By the end of this lesson</p>
              <ul>
                {lesson.objectives.map((objective) => (
                  <li key={objective}>
                    <Icon name="check" size={13} />
                    {objective}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {step.kind === 'section' && (
          <div className="runner-step">
            <LessonSections sections={step.sections} />
          </div>
        )}

        {step.kind === 'practice' && (
          <div className="runner-step runner-step--work">
            <section className="exercise">
              <div className="exercise-head">
                <p className="eyebrow">Your turn</p>
                <span className="chip chip--plain mono">
                  {lesson.exercise.checks.length} checks · {lesson.xp} XP
                </span>
              </div>
              <p className="exercise-brief">
                <Inline text={lesson.exercise.brief} />
              </p>
              {lesson.exercise.hints.length > 0 && (
                <div className="hints">
                  {lesson.exercise.hints.map((hint, hintIndex) => (
                    <details key={hint} className="hint">
                      <summary>Hint {hintIndex + 1}</summary>
                      <p>
                        <Inline text={hint} />
                      </p>
                    </details>
                  ))}
                </div>
              )}
            </section>
            <Suspense fallback={<div className="workspace-skeleton" aria-hidden="true" />}>
              <Workspace lesson={lesson} completed={banked} onComplete={solved} onPassed={solved} hideFoot />
            </Suspense>
          </div>
        )}

        {step.kind === 'drill' && (
          <DrillStep
            drill={step.drill}
            language={lesson.exercise.kind}
            solved={Boolean(drillSolved[step.index])}
            onSolved={() => setDrillSolved((current) => ({ ...current, [step.index]: true }))}
          />
        )}

        {step.kind === 'quiz' && (
          <QuizStep
            question={step.question}
            index={step.index}
            total={lesson.quiz.length}
            choice={choice}
            solved={Boolean(quizSolved[step.index])}
            onChoose={(option) => {
              setChoice(option);
              setAttempts((current) => ({ ...current, [step.index]: (current[step.index] ?? 0) + 1 }));
              if (option === step.question.answer) {
                setQuizSolved((current) => ({ ...current, [step.index]: true }));
              }
            }}
          />
        )}

        {step.kind === 'done' && (
          <div className="runner-step runner-done">
            <span className="runner-done-mark">
              <Icon name="check" size={22} />
            </span>
            <h1 className="runner-h1">Lesson complete.</h1>
            <p className="runner-lede">
              {lesson.objectives[0] ? `You can now ${lesson.objectives[0].toLowerCase()}.` : lesson.summary}
            </p>
            <div className="runner-stats">
              <div>
                <strong>+{banked ? lesson.xp : 0}</strong>
                <span>XP banked</span>
              </div>
              <div>
                <strong>{lesson.exercise.checks.length}</strong>
                <span>checks passed</span>
              </div>
              <div>
                <strong>{lesson.quiz.length}</strong>
                <span>questions answered</span>
              </div>
            </div>
            <div className="runner-done-actions">
              {next && nextTrack ? (
                <Link to={`/learn/${nextTrack.id}/${next.id}`} className="btn btn--primary">
                  Next: {next.title}
                  <Icon name="arrowRight" size={15} />
                </Link>
              ) : (
                <Link to="/achievements" className="btn btn--primary">
                  See your achievements
                  <Icon name="arrowRight" size={15} />
                </Link>
              )}
              <Link to={`/learn/${track.id}`} className="btn btn--ghost">
                Back to {track.name}
              </Link>
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {step.kind !== 'done' && (
        <footer className="runner-foot">
          <span className="runner-foot-note mono">
            {step.kind === 'practice' && !exerciseSolved && 'Run the checks to unlock Continue'}
            {step.kind === 'quiz' && !quizSolved[step.index] && 'Pick the answer you think is right'}
            {step.kind === 'drill' && !drillSolved[step.index] && 'Answer to unlock Continue'}
            {(step.kind === 'intro' || step.kind === 'section') && `Step ${index + 1} of ${steps.length}`}
          </span>
          <button type="button" className="btn btn--primary runner-continue" onClick={advance} disabled={!canContinue}>
            {step.kind === 'practice' && !exerciseSolved ? 'Check your code first' : 'Continue'}
            <Icon name="arrowRight" size={15} />
          </button>
        </footer>
      )}
    </div>
  );
}

function QuizStep({
  question,
  index,
  total,
  choice,
  solved,
  onChoose,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  choice: number | null;
  solved: boolean;
  onChoose: (option: number) => void;
}) {
  const correct = choice === question.answer;
  return (
    <div className="runner-step">
      <p className="runner-eyebrow mono">
        Question {index + 1} of {total}
      </p>
      <h2 className="runner-h2">
        <Inline text={question.prompt} />
      </h2>
      <ul className="runner-options">
        {question.options.map((option, optionIndex) => {
          const state = solved || (choice !== null && correct)
            ? optionIndex === question.answer
              ? 'is-correct'
              : 'is-muted'
            : choice === optionIndex
              ? 'is-wrong'
              : '';
          return (
            <li key={option}>
              <button
                type="button"
                className={`runner-option ${state}`}
                onClick={() => onChoose(optionIndex)}
                disabled={solved}
              >
                <span className="runner-option-key">{String.fromCharCode(65 + optionIndex)}</span>
                <span className="runner-option-copy">
                  <Inline text={option} />
                </span>
                {state === 'is-correct' && <Icon name="check" size={15} />}
                {state === 'is-wrong' && <Icon name="close" size={15} />}
              </button>
            </li>
          );
        })}
      </ul>
      {choice !== null && (
        <div className={`runner-feedback ${correct ? 'is-ok' : 'is-bad'}`}>
          <p className="runner-feedback-title">{correct ? 'Correct.' : 'Not quite — try again.'}</p>
          {correct ? (
            <p>
              <Inline text={question.explain} />
            </p>
          ) : (
            <p>Re-read the step above and pick the option that matches it. The explanation unlocks when you get there.</p>
          )}
        </div>
      )}
    </div>
  );
}

function LockedNotice({ lesson, track }: { lesson: Lesson; track: Track }) {
  const index = track.lessons.findIndex((entry) => entry.id === lesson.id);
  const previous = track.lessons[index - 1];
  return (
    <div className="runner-locked fade-in">
      <div className="runner-locked-card">
        <span className="runner-locked-icon">
          <Icon name="lock" size={18} />
        </span>
        <h1 className="runner-h1">This lesson is locked</h1>
        <p className="runner-lede">
          {track.name} runs in order. Finish {previous ? `“${previous.title}”` : 'the previous lesson'} and this one
          opens straight after it.
        </p>
        <div className="runner-locked-actions">
          {previous && (
            <Link to={`/learn/${track.id}/${previous.id}`} className="btn btn--primary">
              Go to {previous.title}
              <Icon name="arrowRight" size={15} />
            </Link>
          )}
          <Link to={`/learn/${track.id}`} className="btn btn--ghost">
            Back to {track.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
