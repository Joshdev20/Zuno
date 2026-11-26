import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { getTrack, levelLabel, tracks } from '../lib/curriculum';
import { isLessonUnlocked, useProgress } from '../lib/progress';
import { Icon } from '../components/ui/Icon';
import { ProgressBar, Ring } from '../components/ui/Meters';
import { NotFound } from './NotFound';
import { fadeUp, stagger, viewportOnce } from '../lib/motion';

const order = ['beginner', 'intermediate', 'advanced'] as const;

export function TrackPage() {
  const reduceMotion = useReducedMotion();
  const { trackId } = useParams();
  const track = getTrack(trackId);
  const { state } = useProgress();

  useEffect(() => {
    if (track) document.title = `${track.name} — Zuno`;
  }, [track]);

  if (!track) return <NotFound />;

  const done = track.lessons.filter((lesson) => state.completed[lesson.id]).length;
  const ratio = done / track.lessons.length;
  const minutes = track.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
  const xp = track.lessons.reduce((sum, lesson) => sum + lesson.xp, 0);
  const nextLesson = track.lessons.find((lesson) => !state.completed[lesson.id]);
  const otherTracks = tracks.filter((entry) => entry.id !== track.id);

  return (
    <motion.div
      className="page"
      variants={stagger(0.04, 0.07)}
      initial={reduceMotion ? false : 'hidden'}
      animate="shown"
    >
      <motion.div className="lesson-crumbs" variants={fadeUp}>
        <Link to="/learn" className="back-link">
          <Icon name="arrowLeft" size={14} />
          Today
        </Link>
        <span className="crumb-sep">/</span>
        <span className="mono">{track.name}</span>
      </motion.div>

      <motion.header className="track-head" variants={fadeUp}>
        <div className="track-head-copy">
          <p className="eyebrow">{track.tagline} track</p>
          <h1 className="page-title">{track.name}</h1>
          <p className="page-sub">{track.description}</p>
          <div className="track-head-meta mono">
            <span>{track.lessons.length} lessons</span>
            <span>{minutes} min</span>
            <span>{xp} XP</span>
            <span>{done} complete</span>
          </div>
          {nextLesson && (
            <Link to={`/learn/${track.id}/${nextLesson.id}`} className="btn btn--primary">
              {done === 0 ? 'Start the track' : 'Continue'}
              <Icon name="arrowRight" size={15} />
            </Link>
          )}
        </div>
        <div className="track-head-meter">
          <Ring value={ratio} size={112} stroke={7}>
            <span className="ring-big">{Math.round(ratio * 100)}%</span>
            <span className="ring-sub mono">complete</span>
          </Ring>
        </div>
      </motion.header>

      {order.map((level, levelIndex) => {
        const lessons = track.lessons.filter((lesson) => lesson.level === level);
        if (lessons.length === 0) return null;
        return (
          <motion.section
            key={level}
            className="level-block"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: levelIndex * 0.05 }}
          >
            <div className="level-head">
              <h2>{levelLabel[level]}</h2>
              <span className="level-rule" />
              <span className="mono muted">{lessons.length} lessons</span>
            </div>
            <ul className="lesson-list">
              {lessons.map((lesson) => {
                const index = track.lessons.findIndex((entry) => entry.id === lesson.id);
                const complete = Boolean(state.completed[lesson.id]);
                const isNext = nextLesson?.id === lesson.id;
                const locked = !complete && !isLessonUnlocked(state, track, lesson);
                if (locked) {
                  return (
                    <li key={lesson.id}>
                      <div className="lesson-row is-locked">
                        <span className="lesson-status">
                          <Icon name="lock" size={13} />
                        </span>
                        <span className="lesson-row-main">
                          <span className="lesson-row-title">{lesson.title}</span>
                          <span className="lesson-row-summary">Finish the previous lesson to unlock.</span>
                        </span>
                        <span className="lesson-row-meta mono">
                          {lesson.minutes} min · {lesson.xp} XP
                        </span>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={lesson.id}>
                    <Link
                      to={`/learn/${track.id}/${lesson.id}`}
                      className={`lesson-row${complete ? ' is-complete' : ''}${isNext ? ' is-next' : ''}`}
                    >
                      <span className={`lesson-status${complete ? ' is-complete' : ''}`}>
                        {complete ? <Icon name="check" size={13} /> : <span className="mono">{index + 1}</span>}
                      </span>
                      <span className="lesson-row-main">
                        <span className="lesson-row-title">
                          {lesson.title}
                          {isNext && <span className="chip chip--pine">Next up</span>}
                        </span>
                        <span className="lesson-row-summary">{lesson.summary}</span>
                      </span>
                      <span className="lesson-row-meta mono">
                        {lesson.minutes} min · {lesson.xp} XP
                      </span>
                      <Icon name="arrowRight" size={15} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.section>
        );
      })}

      <motion.section
        className="track-foot"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="track-foot-title">Keep going</h2>
        <div className="track-foot-grid">
          {otherTracks.map((entry) => {
            const entryDone = entry.lessons.filter((lesson) => state.completed[lesson.id]).length;
            return (
              <Link key={entry.id} to={`/learn/${entry.id}`} className="track-foot-card">
                <span className={`track-dot track-dot--${entry.id}`} aria-hidden="true" />
                <span className="track-foot-copy">
                  <strong>{entry.name}</strong>
                  <span className="mono muted">
                    {entryDone}/{entry.lessons.length} complete
                  </span>
                </span>
                <ProgressBar
                  value={entryDone / entry.lessons.length}
                  height={3}
                  tone={entry.id === 'css' ? 'clay' : entry.id === 'js' ? 'brass' : entry.id === 'python' ? 'slate' : 'pine'}
                />
                <Icon name="arrowRight" size={15} />
              </Link>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}
