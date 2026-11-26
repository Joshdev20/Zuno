import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, stagger, viewportOnce } from '../../lib/motion';
import { Icon } from '../ui/Icon';

function EditorVisual() {
  return (
    <div className="feat-visual feat-visual--code" aria-hidden="true">
      <div className="feat-code-line">
        <span className="feat-ln">1</span>
        <code>
          <span className="tok-tag">.card</span> <span className="tok-punc">{'{'}</span>
        </code>
      </div>
      <div className="feat-code-line">
        <span className="feat-ln">2</span>
        <code>
          <span className="tok-indent" />
          <span className="tok-attr">padding</span>
          <span className="tok-punc">:</span> <span className="tok-num">24px</span>
          <span className="tok-punc">;</span>
        </code>
      </div>
      <div className="feat-code-line">
        <span className="feat-ln">3</span>
        <code>
          <span className="tok-indent" />
          <span className="tok-attr">border-radius</span>
          <span className="tok-punc">:</span> <span className="tok-num">12px</span>
          <span className="tok-punc">;</span>
        </code>
      </div>
      <div className="feat-code-line">
        <span className="feat-ln">4</span>
        <code>
          <span className="tok-punc">{'}'}</span>
          <span className="feat-caret" />
        </code>
      </div>
    </div>
  );
}

function ChecksVisual() {
  return (
    <div className="feat-visual feat-visual--checks" aria-hidden="true">
      <div className="feat-check is-ok">
        <span className="feat-check-icon">
          <Icon name="check" size={12} />
        </span>
        Document starts with &lt;!DOCTYPE html&gt;
      </div>
      <div className="feat-check is-ok">
        <span className="feat-check-icon">
          <Icon name="check" size={12} />
        </span>
        An &lt;h1&gt; introduces the page
      </div>
      <div className="feat-check is-bad">
        <span className="feat-check-icon">
          <Icon name="close" size={12} />
        </span>
        A paragraph follows the heading
        <span className="feat-check-detail">No &lt;p&gt; found in the body</span>
      </div>
    </div>
  );
}

function StreakVisual() {
  return (
    <div className="feat-visual feat-visual--streak" aria-hidden="true">
      <div className="streak-row">
        {[1, 1, 1, 0, 1, 1, 1].map((filled, index) => (
          <span key={index} className={`streak-dot${filled ? ' is-filled' : ''}`} />
        ))}
      </div>
      <div className="streak-stats">
        <span>
          <strong>4</strong> day streak
        </span>
        <span>
          <strong>260</strong> XP
        </span>
        <span>
          <strong>3</strong> badges
        </span>
      </div>
    </div>
  );
}

function TerminalVisual() {
  return (
    <div className="feat-visual feat-visual--terminal" aria-hidden="true">
      <p>
        <span className="term-prompt">›</span> doubleAll([1, 2, 3])
      </p>
      <p className="term-out">[2, 4, 6]</p>
      <p>
        <span className="term-prompt">›</span> cart.total
      </p>
      <p className="term-out">20</p>
    </div>
  );
}

export function FeaturesSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">What is inside</p>
            <h2 className="section-title">Everything you need, nothing you don't.</h2>
          </div>
          <p className="section-note">
            No dashboards to configure, no plugin ecosystem to learn. An editor, a preview, checks and a record of what
            you have done.
          </p>
        </div>

        <motion.div
          className="feat-grid"
          variants={stagger(0, 0.08)}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="shown"
          viewport={viewportOnce}
        >
          <motion.article className="feat-card feat-card--wide" variants={fadeUp}>
            <div className="feat-copy">
              <span className="feat-icon">
                <Icon name="code" size={18} />
              </span>
              <h3>A real editor, not a video</h3>
              <p>
                Syntax highlighting, line numbers and a live preview. Write HTML, CSS and JavaScript exactly as you
                would in a project folder.
              </p>
            </div>
            <EditorVisual />
          </motion.article>

          <motion.article className="feat-card feat-card--wide" variants={fadeUp}>
            <div className="feat-copy">
              <span className="feat-icon">
                <Icon name="target" size={18} />
              </span>
              <h3>Checks that tell you why</h3>
              <p>
                Each check inspects the result, not the spelling of your code. Failures point at the missing element,
                the wrong computed style, the unexpected return value.
              </p>
            </div>
            <ChecksVisual />
          </motion.article>

          <motion.article className="feat-card" variants={fadeUp}>
            <div className="feat-copy">
              <span className="feat-icon">
                <Icon name="flame" size={18} />
              </span>
              <h3>Momentum by default</h3>
              <p>XP, levels and a daily streak that records the days you actually showed up.</p>
            </div>
            <StreakVisual />
          </motion.article>

          <motion.article className="feat-card" variants={fadeUp}>
            <div className="feat-copy">
              <span className="feat-icon">
                <Icon name="terminal" size={18} />
              </span>
              <h3>An open playground</h3>
              <p>Three panes, no brief, instant output. For the ideas that arrive between lessons.</p>
            </div>
            <TerminalVisual />
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}
