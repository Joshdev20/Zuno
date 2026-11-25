import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { tracks } from '../../lib/curriculum';

const highlights: Record<string, string[]> = {
  html: ['Semantic documents', 'Forms with real labels', 'Accessible media'],
  css: ['The box model', 'Flexbox and grid', 'Theming with tokens'],
  js: ['Values and logic', 'DOM events', 'Async and classes'],
  python: ['Printing and variables', 'Loops over data', 'Functions that return'],
};

export function TracksSection() {
  return (
    <section className="section" id="curriculum">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">The curriculum</p>
            <h2 className="section-title">Four tracks. One habit.</h2>
          </div>
          <p className="section-note">
            Each track runs from first principles to the details that separate a page that works from a page that feels
            considered. HTML, CSS and JavaScript run in a live preview; Python runs in a real interpreter loaded in
            your browser. Lessons unlock in order, and nothing is locked behind a paywall.
          </p>
        </div>

        <div className="track-grid">
          {tracks.map((track, index) => {
            const minutes = track.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
            const xp = track.lessons.reduce((sum, lesson) => sum + lesson.xp, 0);
            return (
              <article key={track.id} className={`track-card track-card--${track.id}`}>
                <div className="track-card-top">
                  <span className="track-index">0{index + 1}</span>
                  <span className="track-tag">{track.tagline}</span>
                </div>
                <h3 className="track-name">{track.name}</h3>
                <p className="track-desc">{track.description}</p>
                <ul className="track-list">
                  {(highlights[track.id] ?? []).map((item) => (
                    <li key={item}>
                      <span className="track-bullet" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="track-card-foot">
                  <span className="mono">
                    {track.lessons.length} lessons · {minutes} min · {xp} XP
                  </span>
                  <Link to={`/learn/${track.id}`} className="track-cta">
                    Open track
                    <Icon name="arrowRight" size={15} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
