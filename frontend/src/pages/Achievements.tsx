import { useEffect, useState } from 'react';
import { allLessons, totalLessons, totalXp } from '../lib/curriculum';
import { completedCount, useProgress } from '../lib/progress';
import { badges, earnedBadges } from '../lib/badges';
import { Icon } from '../components/ui/Icon';
import { ProgressBar, Ring } from '../components/ui/Meters';

export function Achievements() {
  const { state, level, resetProgress } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const earned = earnedBadges(state);
  const earnedIds = new Set(earned.map((badge) => badge.id));
  const done = completedCount(state);
  const quizzes = Object.values(state.quizzes).filter(Boolean).length;

  useEffect(() => {
    document.title = 'Achievements — Zuno';
  }, []);

  useEffect(() => {
    if (!confirming) return;
    const timer = window.setTimeout(() => setConfirming(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  return (
    <div className="page fade-in">
      <header className="page-head">
        <div>
          <p className="eyebrow">Achievements</p>
          <h1 className="page-title">The record of showing up.</h1>
          <p className="page-sub">
            {earned.length} of {badges.length} badges unlocked. Everything here is computed from your local progress.
          </p>
        </div>
        <button
          type="button"
          className={`btn btn--sm ${confirming ? 'btn--dark' : 'btn--ghost'}`}
          onClick={() => {
            if (confirming) {
              resetProgress();
              setConfirming(false);
            } else {
              setConfirming(true);
            }
          }}
        >
          {confirming ? 'Click again to erase progress' : 'Reset progress'}
        </button>
      </header>

      <section className="ach-stats">
        <div className="ach-stat">
          <Ring value={level.progress} size={72} stroke={5}>
            <span className="ring-big">{level.level}</span>
          </Ring>
          <div>
            <p className="ach-stat-value">{level.label}</p>
            <p className="ach-stat-label mono">
              {state.xp} XP · {level.toNext} to level {level.level + 1}
            </p>
          </div>
        </div>
        <div className="ach-stat ach-stat--plain">
          <p className="ach-stat-value">
            {done}
            <span className="stat-value-sub">/{totalLessons}</span>
          </p>
          <p className="ach-stat-label">lessons complete</p>
          <ProgressBar value={done / totalLessons} height={4} />
        </div>
        <div className="ach-stat ach-stat--plain">
          <p className="ach-stat-value">{state.streak.count}</p>
          <p className="ach-stat-label">current streak</p>
          <p className="ach-stat-foot mono">
            {state.activeDays.length} active day{state.activeDays.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="ach-stat ach-stat--plain">
          <p className="ach-stat-value">{quizzes}</p>
          <p className="ach-stat-label">perfect quizzes</p>
          <p className="ach-stat-foot mono">{state.playgroundRuns} playground runs</p>
        </div>
      </section>

      <section className="badge-grid">
        {badges.map((badge) => {
          const unlocked = earnedIds.has(badge.id);
          return (
            <article key={badge.id} className={`badge-card${unlocked ? ' is-unlocked' : ''}`}>
              <span className="badge-card-icon">
                <Icon name={unlocked ? badge.icon : 'lock'} size={20} />
              </span>
              <div>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
              </div>
              <span className="badge-card-state mono">{unlocked ? 'Unlocked' : 'Locked'}</span>
            </article>
          );
        })}
      </section>

      <section className="ach-foot">
        <div>
          <h2>What counts</h2>
          <p>
            A lesson counts when you pass every check and mark it complete. A quiz counts when both answers are right
            the first time. The streak counts any day you finish a lesson, answer a quiz or run code in the playground.
          </p>
        </div>
        <div className="ach-foot-meta mono">
          <span>
            <Icon name="bolt" size={13} /> {totalXp} XP available
          </span>
          <span>
            <Icon name="book" size={13} /> {allLessons.length} lessons
          </span>
          <span>
            <Icon name="clock" size={13} />
            since {new Date(state.startedAt).toLocaleDateString()}
          </span>
        </div>
      </section>
    </div>
  );
}
