import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { allLessons, lessonTrack, totalLessons, totalXp } from '../lib/curriculum';
import {
  completedCount,
  nextLessonFor,
  todayCompletions,
  trackStats,
  useProgress,
} from '../lib/progress';
import { earnedBadges, badges } from '../lib/badges';
import { Icon } from '../components/ui/Icon';
import { ProgressBar, Ring } from '../components/ui/Meters';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Dashboard() {
  const { state, level } = useProgress();
  const next = nextLessonFor(state);
  const nextTrack = next ? lessonTrack.get(next.id) : undefined;
  const done = completedCount(state);
  const today = todayCompletions(state);
  const stats = trackStats(state);
  const earned = earnedBadges(state);
  const remaining = allLessons.filter((lesson) => !state.completed[lesson.id]);
  const nextThree = remaining.slice(0, 3);

  useEffect(() => {
    document.title = 'Today — Zuno';
  }, []);

  return (
    <div className="page fade-in">
      <header className="page-head">
        <div>
          <p className="eyebrow">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="page-title">
            {greeting()}
            {done > 0 ? '.' : '. Start with one page.'}
          </h1>
          <p className="page-sub">
            {done === 0
              ? 'Twenty-one lessons, three tracks, no account. Begin with the shape of an HTML document.'
              : `You have completed ${done} of ${totalLessons} lessons and banked ${state.xp} of ${totalXp} XP.`}
          </p>
        </div>
        <div className="page-head-actions">
          <Link to="/playground" className="btn btn--ghost btn--sm">
            <Icon name="terminal" size={15} />
            Playground
          </Link>
          <Link to="/achievements" className="btn btn--ghost btn--sm">
            <Icon name="award" size={15} />
            Achievements
          </Link>
        </div>
      </header>

      <section className="stat-row">
        <article className="stat-card">
          <span className="stat-icon stat-icon--clay">
            <Icon name="flame" size={17} />
          </span>
          <div>
            <p className="stat-value">{state.streak.count}</p>
            <p className="stat-label">day streak</p>
          </div>
          <div className="stat-days" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, index) => (
              <span key={index} className={`stat-day${index >= 7 - Math.min(7, state.streak.count) ? ' is-on' : ''}`} />
            ))}
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon stat-icon--brass">
            <Icon name="bolt" size={17} />
          </span>
          <div>
            <p className="stat-value">{state.xp}</p>
            <p className="stat-label">total XP</p>
          </div>
          <span className="stat-badge mono">
            L{level.level} {level.label}
          </span>
        </article>

        <article className="stat-card">
          <span className="stat-icon stat-icon--pine">
            <Icon name="book" size={17} />
          </span>
          <div>
            <p className="stat-value">
              {done}
              <span className="stat-value-sub">/{totalLessons}</span>
            </p>
            <p className="stat-label">lessons complete</p>
          </div>
          <ProgressBar value={done / totalLessons} height={4} />
        </article>

        <article className="stat-card">
          <span className="stat-icon stat-icon--ink">
            <Icon name="target" size={17} />
          </span>
          <div>
            <p className="stat-value">{today > 0 ? 'Met' : 'Open'}</p>
            <p className="stat-label">daily goal</p>
          </div>
          <Ring value={today > 0 ? 1 : 0} size={38} stroke={3}>
            <span className="ring-tiny">{today > 0 ? '✓' : '0'}</span>
          </Ring>
        </article>
      </section>

      <div className="dash-grid">
        <section className="continue-card">
          <div className="continue-top">
            <p className="eyebrow">{done === 0 ? 'Start here' : 'Continue where you left off'}</p>
            {nextTrack && (
              <span className={`chip chip--${nextTrack.id === 'css' ? 'clay' : nextTrack.id === 'js' ? 'brass' : 'pine'}`}>
                {nextTrack.name}
              </span>
            )}
          </div>
          {next ? (
            <>
              <h2 className="continue-title">{next.title}</h2>
              <p className="continue-summary">{next.summary}</p>
              <div className="continue-meta mono">
                <span>
                  <Icon name="clock" size={13} /> {next.minutes} min
                </span>
                <span>
                  <Icon name="bolt" size={13} /> {next.xp} XP
                </span>
                <span>
                  <Icon name="target" size={13} /> {next.exercise.checks.length} checks
                </span>
              </div>
              <Link to={`/learn/${nextTrack?.id}/${next.id}`} className="btn btn--primary">
                {done === 0 ? 'Start lesson one' : 'Resume lesson'}
                <Icon name="arrowRight" size={15} />
              </Link>
            </>
          ) : (
            <>
              <h2 className="continue-title">Every lesson, complete.</h2>
              <p className="continue-summary">
                That is the whole curriculum. Keep the streak alive in the playground, or revisit a lesson you rushed.
              </p>
              <Link to="/playground" className="btn btn--primary">
                Open the playground
                <Icon name="arrowRight" size={15} />
              </Link>
            </>
          )}
          <div className="continue-progress">
            <div className="continue-progress-head mono">
              <span>Overall progress</span>
              <span>{Math.round((done / totalLessons) * 100)}%</span>
            </div>
            <ProgressBar value={done / totalLessons} height={5} />
          </div>
        </section>

        <aside className="side-stack">
          <section className="side-card">
            <div className="side-card-head">
              <h3>Tracks</h3>
              <span className="mono muted">{stats.length}</span>
            </div>
            <ul className="track-rows">
              {stats.map(({ track, done: trackDone, total, ratio }) => (
                <li key={track.id}>
                  <Link to={`/learn/${track.id}`} className="track-row">
                    <span className={`track-dot track-dot--${track.id}`} aria-hidden="true" />
                    <span className="track-row-main">
                      <span className="track-row-title">
                        {track.name}
                        <span className="mono muted">
                          {trackDone}/{total}
                        </span>
                      </span>
                      <ProgressBar
                        value={ratio}
                        height={3}
                        tone={track.id === 'css' ? 'clay' : track.id === 'js' ? 'brass' : track.id === 'python' ? 'slate' : 'pine'}
                      />
                    </span>
                    <Icon name="arrowRight" size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="side-card">
            <div className="side-card-head">
              <h3>Up next</h3>
              <span className="mono muted">{remaining.length} left</span>
            </div>
            {nextThree.length === 0 ? (
              <p className="side-empty">Nothing queued. You finished the curriculum.</p>
            ) : (
              <ul className="next-list">
                {nextThree.map((lesson, index) => {
                  const track = lessonTrack.get(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <Link to={`/learn/${track?.id}/${lesson.id}`} className="next-item">
                        <span className="next-index mono">{String(index + 1).padStart(2, '0')}</span>
                        <span className="next-main">
                          <span className="next-title">{lesson.title}</span>
                          <span className="next-meta mono">
                            {track?.name} · {lesson.minutes} min
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <section className="badge-strip">
        <div className="badge-strip-head">
          <h3>Achievements</h3>
          <span className="mono muted">
            {earned.length}/{badges.length} unlocked
          </span>
          <Link to="/achievements" className="badge-strip-link">
            View all <Icon name="arrowRight" size={13} />
          </Link>
        </div>
        <ul className="badge-strip-list">
          {badges.slice(0, 6).map((badge) => {
            const unlocked = earned.some((entry) => entry.id === badge.id);
            return (
              <li key={badge.id} className={`badge-pill${unlocked ? ' is-unlocked' : ''}`}>
                <span className="badge-pill-icon">
                  <Icon name={badge.icon} size={15} />
                </span>
                <span>
                  <strong>{badge.name}</strong>
                  <small>{unlocked ? 'Unlocked' : badge.description}</small>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
