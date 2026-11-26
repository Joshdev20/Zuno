import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Icon } from '../ui/Icon';
import { SplitText } from '../ui/SplitText';
import { trackSpotlight } from '../../lib/useSpotlight';
import { AmbientScene } from './AmbientScene';
import { totalLessons, totalMinutes } from '../../lib/curriculum';


const hours = Math.round((totalMinutes / 60) * 10) / 10;

const copy = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const line = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

function HeroMock() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="mock spotlight" onPointerMove={trackSpotlight}>
        <div className="mock-chrome">
          <span className="mock-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="mock-tab">index.html</span>
          <span className="mock-action">Check</span>
        </div>

        <div className="mock-code">
          <div className="mock-line">
            <span className="mock-ln">1</span>
            <code>
              <span className="tok-punc">&lt;</span>
              <span className="tok-tag">h1</span>
              <span className="tok-attr"> class</span>
              <span className="tok-punc">=</span>
              <span className="tok-str">"title"</span>
              <span className="tok-punc">&gt;</span>
              Field notes
              <span className="tok-punc">&lt;/</span>
              <span className="tok-tag">h1</span>
              <span className="tok-punc">&gt;</span>
            </code>
          </div>
          <div className="mock-line">
            <span className="mock-ln">2</span>
            <code>
              <span className="tok-punc">&lt;</span>
              <span className="tok-tag">p</span>
              <span className="tok-punc">&gt;</span>
              The sand held the light for an hour.
              <span className="tok-punc">&lt;/</span>
              <span className="tok-tag">p</span>
              <span className="tok-punc">&gt;</span>
            </code>
          </div>
          <div className="mock-line">
            <span className="mock-ln">3</span>
            <code>
              <span className="tok-punc">&lt;</span>
              <span className="tok-tag">ul</span>
              <span className="tok-attr"> class</span>
              <span className="tok-punc">=</span>
              <span className="tok-str">"list"</span>
              <span className="tok-punc">&gt;</span>
            </code>
          </div>
          <div className="mock-line">
            <span className="mock-ln">4</span>
            <code>
              <span className="tok-indent" />
              <span className="tok-punc">&lt;</span>
              <span className="tok-tag">li</span>
              <span className="tok-punc">&gt;</span>
              Notebook
              <span className="tok-punc">&lt;/</span>
              <span className="tok-tag">li</span>
              <span className="tok-punc">&gt;</span>
            </code>
          </div>
          <div className="mock-line">
            <span className="mock-ln">5</span>
            <code>
              <span className="tok-punc">&lt;/</span>
              <span className="tok-tag">ul</span>
              <span className="tok-punc">&gt;</span>
              <span className="mock-caret" />
            </code>
          </div>
        </div>

        <div className="mock-split">
          <div className="mock-preview">
            <p className="mock-label">Preview</p>
            <div className="mock-preview-body">
              <h4>Field notes</h4>
              <p>The sand held the light for an hour.</p>
              <ul>
                <li>Notebook</li>
                <li>Thermos</li>
              </ul>
            </div>
          </div>
          <div className="mock-checks">
            <p className="mock-label">Checks</p>
            <ul>
              <li className="is-ok">
                <Icon name="check" size={12} />
                Doctype declared
              </li>
              <li className="is-ok">
                <Icon name="check" size={12} />
                Heading hierarchy
              </li>
              <li className="is-ok">
                <Icon name="check" size={12} />
                List has 3 items
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="hero-float hero-float--streak">
        <span className="hero-float-icon">
          <Icon name="flame" size={16} />
        </span>
        <span>
          <strong>4 day streak</strong>
          <small>Best: 11 days</small>
        </span>
      </div>

      <div className="hero-float hero-float--xp">
        <span className="hero-float-icon hero-float-icon--pine">
          <Icon name="bolt" size={16} />
        </span>
        <span>
          <strong>+60 XP</strong>
          <small>Lesson complete</small>
        </span>
      </div>
    </div>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const visualFade = useTransform(scrollYProgress, [0, 0.9], [1, 0.35]);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 120, damping: 18 });
  const springY = useSpring(tiltY, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(springX, [-0.5, 0.5], [7, -7]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [-6, 6]);

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    tiltX.set((event.clientX - rect.left) / rect.width - 0.5);
    tiltY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <section className="hero" ref={heroRef}>
      <AmbientScene />

      <div className="container hero-grid">
        <motion.div
          className="hero-copy"
          variants={copy}
          initial={reduceMotion ? false : 'hidden'}
          animate="shown"
        >
          <motion.p className="eyebrow" variants={line}>
            Interactive curriculum · HTML · CSS · JavaScript · Python
          </motion.p>
          <h1 className="hero-title">
            <SplitText text="Learn the web" delay={0.12} />
            <br />
            <SplitText text="by building it." emWords={['building']} delay={0.26} />
          </h1>
          <motion.p className="hero-lede" variants={line}>
            {totalLessons} short lessons, written to be read once and used immediately. Write real code in the
            browser, get checked in milliseconds, and keep a streak that makes the habit stick.
          </motion.p>
          <motion.div className="hero-actions" variants={line}>
            <Link to="/learn/html/html-01" className="btn btn--primary btn--lg">
              Start lesson one
              <Icon name="arrowRight" size={16} />
            </Link>
            <Link to="/playground" className="btn btn--ghost btn--lg">
              <Icon name="terminal" size={16} />
              Try the playground
            </Link>
          </motion.div>
          <motion.ul className="hero-meta" variants={line}>
            <li>No account needed</li>
            <li>{totalLessons} lessons · {hours} hours</li>
            <li>Progress saved locally</li>
          </motion.ul>
        </motion.div>
        <motion.div
          className="hero-stage"
          ref={stage}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          style={reduceMotion ? { perspective: 1200 } : { perspective: 1200, y: visualY, opacity: visualFade }}
          initial={reduceMotion ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
        >
          <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
            <HeroMock />
          </motion.div>
        </motion.div>
      </div>

      <div className="strip">
        <div className="container strip-inner">
          <span>HTML</span>
          <span>CSS</span>
          <span>JavaScript</span>
          <span>The DOM</span>
          <span>Flexbox</span>
          <span>Grid</span>
          <span>Async</span>
          <span>Python</span>
          <span>Accessibility</span>
        </div>
      </div>
    </section>
  );
}
