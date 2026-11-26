import { motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT, POP, fadeUp, stagger, viewportOnce } from '../../lib/motion';
import { Icon } from '../ui/Icon';
import { CountUp } from '../ui/CountUp';

function EditorVisual() {
  return (
    <motion.div
      className="feat-visual feat-visual--code"
      aria-hidden="true"
      variants={stagger(0.1, 0.12)}
      initial="hidden"
      whileInView="shown"
      viewport={viewportOnce}
    >
      <motion.div className="feat-code-line" variants={fadeUp}>
        <span className="feat-ln">1</span>
        <code>
          <span className="tok-tag">.card</span> <span className="tok-punc">{'{'}</span>
        </code>
      </motion.div>
      <motion.div className="feat-code-line" variants={fadeUp}>
        <span className="feat-ln">2</span>
        <code>
          <span className="tok-indent" />
          <span className="tok-attr">padding</span>
          <span className="tok-punc">:</span> <span className="tok-num">24px</span>
          <span className="tok-punc">;</span>
        </code>
      </motion.div>
      <motion.div className="feat-code-line" variants={fadeUp}>
        <span className="feat-ln">3</span>
        <code>
          <span className="tok-indent" />
          <span className="tok-attr">border-radius</span>
          <span className="tok-punc">:</span> <span className="tok-num">12px</span>
          <span className="tok-punc">;</span>
        </code>
      </motion.div>
      <motion.div className="feat-code-line" variants={fadeUp}>
        <span className="feat-ln">4</span>
        <code>
          <span className="tok-punc">{'}'}</span>
          <span className="feat-caret" />
        </code>
      </motion.div>
    </motion.div>
  );
}

function ChecksVisual() {
  return (
    <motion.div
      className="feat-visual feat-visual--checks"
      aria-hidden="true"
      variants={stagger(0.15, 0.28)}
      initial="hidden"
      whileInView="shown"
      viewport={viewportOnce}
    >
      <motion.div
        className="feat-check is-ok"
        variants={{ hidden: { opacity: 0, x: -8 }, shown: { opacity: 1, x: 0, transition: POP } }}
      >
        <span className="feat-check-icon">
          <Icon name="check" size={12} />
        </span>
        Document starts with &lt;!DOCTYPE html&gt;
      </motion.div>
      <motion.div
        className="feat-check is-ok"
        variants={{ hidden: { opacity: 0, x: -8 }, shown: { opacity: 1, x: 0, transition: POP } }}
      >
        <span className="feat-check-icon">
          <Icon name="check" size={12} />
        </span>
        An &lt;h1&gt; introduces the page
      </motion.div>
      <motion.div
        className="feat-check is-bad"
        variants={{ hidden: { opacity: 0, x: -8 }, shown: { opacity: 1, x: 0, transition: POP } }}
      >
        <span className="feat-check-icon">
          <Icon name="close" size={12} />
        </span>
        A paragraph follows the heading
        <motion.span
          className="feat-check-detail"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportOnce}
          transition={{ delay: 1.1, duration: 0.4, ease: EASE_OUT }}
        >
          No &lt;p&gt; found in the body
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

function StreakVisual() {
  return (
    <div className="feat-visual feat-visual--streak" aria-hidden="true">
      <div className="streak-row">
        {[1, 1, 1, 0, 1, 1, 1].map((filled, index) => (
          <motion.span
            key={index}
            className={`streak-dot${filled ? ' is-filled' : ''}`}
            initial={{ scale: 0.4, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={viewportOnce}
            transition={{ ...POP, delay: 0.1 + index * 0.06 }}
          />
        ))}
      </div>
      <div className="streak-stats">
        <span>
          <strong>
            <CountUp value={4} duration={0.9} />
          </strong>{' '}
          day streak
        </span>
        <span>
          <strong>
            <CountUp value={260} duration={1.2} />
          </strong>{' '}
          XP
        </span>
        <span>
          <strong>
            <CountUp value={3} duration={0.9} />
          </strong>{' '}
          badges
        </span>
      </div>
    </div>
  );
}

function TerminalVisual() {
  return (
    <motion.div
      className="feat-visual feat-visual--terminal"
      aria-hidden="true"
      variants={stagger(0.1, 0.22)}
      initial="hidden"
      whileInView="shown"
      viewport={viewportOnce}
    >
      <motion.p variants={fadeUp}>
        <span className="term-prompt">›</span> doubleAll([1, 2, 3])
      </motion.p>
      <motion.p className="term-out" variants={fadeUp}>
        [2, 4, 6]
      </motion.p>
      <motion.p variants={fadeUp}>
        <span className="term-prompt">›</span> cart.total
      </motion.p>
      <motion.p className="term-out" variants={fadeUp}>
        20
      </motion.p>
    </motion.div>
  );
}

export function FeaturesSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section">
      <div className="container">
        <motion.div
          className="section-head"
          variants={stagger(0, 0.08)}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="shown"
          viewport={viewportOnce}
        >
          <motion.div variants={fadeUp}>
            <p className="eyebrow">What is inside</p>
            <h2 className="section-title">Everything you need, nothing you don't.</h2>
          </motion.div>
          <motion.p className="section-note" variants={fadeUp}>
            No dashboards to configure, no plugin ecosystem to learn. An editor, a preview, checks and a record of what
            you have done.
          </motion.p>
        </motion.div>

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
