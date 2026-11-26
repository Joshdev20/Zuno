import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { completedCount, todayCompletions, trackStats, useProgress } from '../../lib/progress';
import { POP, SPRING } from '../../lib/motion';
import { Icon } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { ProgressBar, Ring } from '../ui/Meters';
import { CommandPalette } from '../ui/CommandPalette';
import { Toasts } from '../ui/Toasts';

const navItems = [
  { to: '/learn', label: 'Today', icon: 'home' as const, end: true },
  { to: '/playground', label: 'Playground', icon: 'terminal' as const, end: false },
  { to: '/achievements', label: 'Achievements', icon: 'award' as const, end: false },
];

export function AppShell() {
  const { state, level } = useProgress();
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const stats = trackStats(state);
  const done = completedCount(state);
  const today = todayCompletions(state);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-head">
          <Logo to="/learn" />
        </div>

        <nav className="sidebar-nav" aria-label="Main">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      className="nav-pill"
                      layoutId="nav-pill"
                      transition={reduceMotion ? { duration: 0 } : SPRING}
                    />
                  )}
                  <Icon name={item.icon} size={17} />
                  <span>{item.label}</span>
                  {item.to === '/learn' && done > 0 && <span className="nav-count">{done}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-section">
          <p className="sidebar-label">Tracks</p>
          {stats.map(({ track, done: trackDone, total, ratio }) => (
            <NavLink
              key={track.id}
              to={`/learn/${track.id}`}
              className={({ isActive }) => `track-link${isActive ? ' is-active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      className="nav-pill nav-pill--track"
                      layoutId="track-pill"
                      transition={reduceMotion ? { duration: 0 } : SPRING}
                    />
                  )}
                  <span className="track-link-top">
                    <span className={`track-dot track-dot--${track.id}`} aria-hidden="true" />
                    <span>{track.name}</span>
                    <span className="track-link-count">
                      {trackDone}/{total}
                    </span>
                  </span>
                  <ProgressBar
                    value={ratio}
                    height={3}
                    tone={track.id === 'css' ? 'clay' : track.id === 'js' ? 'brass' : 'pine'}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-foot">
          <div className="level-card">
            <Ring value={level.progress} size={46} stroke={4}>
              <span className="level-num">{level.level}</span>
            </Ring>
            <div className="level-copy">
              <strong>{level.label}</strong>
              <span className="mono">
                {level.intoLevel} / {level.span} XP
              </span>
            </div>
          </div>
          <p className="sidebar-hint">{level.toNext} XP to level {level.level + 1}</p>
        </div>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-brand">
              <Logo to="/learn" />
            </span>
            <span className="topbar-crumb">
              <Icon name="book" size={15} />
              <span>Learning workspace</span>
            </span>
          </div>
          <div className="topbar-right">
            <button type="button" className="search-trigger" onClick={() => setPaletteOpen(true)}>
              <Icon name="search" size={15} />
              <span>Search</span>
              <kbd>⌘K</kbd>
            </button>
            <span className="stat-chip" title="Current streak">
              <Icon name="flame" size={15} />
              <motion.strong key={state.streak.count} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={POP}>
                {state.streak.count}
              </motion.strong>
              <span className="stat-chip-label">day{state.streak.count === 1 ? '' : 's'}</span>
            </span>
            <span className="stat-chip" title="Total experience">
              <Icon name="bolt" size={15} />
              <motion.strong key={state.xp} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={POP}>
                {state.xp}
              </motion.strong>
              <span className="stat-chip-label">XP</span>
            </span>
            <span className={`stat-chip stat-chip--goal${today > 0 ? ' is-met' : ''}`} title="Lessons today">
              <Icon name={today > 0 ? 'check' : 'target'} size={15} />
              <span className="stat-chip-label">{today > 0 ? 'Goal met' : 'Daily goal'}</span>
            </span>
          </div>
        </header>

        <main className="shell-content">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' is-active' : ''}`}
          >
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button type="button" className="mobile-nav-item" onClick={() => setPaletteOpen(true)}>
          <Icon name="search" size={19} />
          <span>Search</span>
        </button>
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Toasts />
    </div>
  );
}
