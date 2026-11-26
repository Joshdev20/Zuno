import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT, SPRING, scaleIn, stagger, viewportOnce } from '../../lib/motion';
import { trackSpotlight } from '../../lib/useSpotlight';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';

const freeFeatures = [
  'All interactive lessons',
  'Live editor and preview',
  'Instant checks on every exercise',
  'Playground with three panes',
  'XP, levels and 13 badges',
];

const proFeatures = [
  'Everything in Free',
  'Progress sync across devices',
  'Downloadable cheatsheets',
  'Interview-style challenge sets',
  'Project reviews from a mentor',
];

export function PricingSection() {
  const [yearly, setYearly] = useState(true);
  const reduceMotion = useReducedMotion();

  return (
    <section className="section section--tint" id="pricing">
      <div className="container">
        <motion.div
          className="section-head section-head--center"
          variants={stagger(0, 0.08)}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="shown"
          viewport={viewportOnce}
        >
          <motion.p className="eyebrow" variants={scaleIn}>
            Pricing
          </motion.p>
          <motion.h2 className="section-title" variants={scaleIn}>
            Free to learn. <em>Pro</em> to go deeper.
          </motion.h2>
          <motion.p className="section-note section-note--center" variants={scaleIn}>
            The whole curriculum is free, permanently. Pro adds the things that help when you are building something
            real.
          </motion.p>
          <div className="billing-toggle" role="group" aria-label="Billing period">
            <button
              type="button"
              className={!yearly ? 'is-active' : ''}
              onClick={() => setYearly(false)}
              aria-pressed={!yearly}
            >
              {!yearly && <motion.span className="billing-pill" layoutId="billing-pill" transition={SPRING} />}
              <span>Monthly</span>
            </button>
            <button
              type="button"
              className={yearly ? 'is-active' : ''}
              onClick={() => setYearly(true)}
              aria-pressed={yearly}
            >
              {yearly && <motion.span className="billing-pill" layoutId="billing-pill" transition={SPRING} />}
              Yearly
              <span className="billing-save">−33%</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          className="price-grid"
          variants={stagger(0.05, 0.1)}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="shown"
          viewport={viewportOnce}
        >
          <motion.article
            className="price-card spotlight"
            variants={scaleIn}
            onPointerMove={trackSpotlight}
            whileHover={reduceMotion ? undefined : { y: -5 }}
          >
            <header>
              <span className="price-name">Free</span>
              <p className="price-amount">
                <span className="price-value">$0</span>
                <span className="price-period">forever</span>
              </p>
              <p className="price-desc">Everything you need to learn the fundamentals properly.</p>
            </header>
            <ul className="price-list">
              {freeFeatures.map((feature) => (
                <li key={feature}>
                  <Icon name="check" size={14} />
                  {feature}
                </li>
              ))}
            </ul>
            <Link to="/learn" className="btn btn--ghost btn--block">
              Start learning
            </Link>
          </motion.article>

          <motion.article
            className="price-card price-card--pro spotlight"
            variants={scaleIn}
            onPointerMove={trackSpotlight}
            whileHover={reduceMotion ? undefined : { y: -5 }}
          >
            <header>
              <div className="price-pro-head">
                <span className="price-name">Pro</span>
                <span className="price-badge">Most popular</span>
              </div>
              <p className="price-amount">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={yearly ? 'yearly' : 'monthly'}
                    className="price-value"
                    initial={reduceMotion ? false : { y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { y: -14, opacity: 0 }}
                    transition={{ duration: 0.26, ease: EASE_OUT }}
                  >
                    ${yearly ? '8' : '12'}
                  </motion.span>
                </AnimatePresence>
                <span className="price-period">per month</span>
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={yearly ? 'billed-yearly' : 'billed-monthly'}
                  className="price-desc"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                >
                  {yearly ? 'Billed $96 once a year. Cancel anytime.' : 'Billed monthly. Cancel anytime.'}
                </motion.p>
              </AnimatePresence>
            </header>
            <ul className="price-list">
              {proFeatures.map((feature) => (
                <li key={feature}>
                  <Icon name="check" size={14} />
                  {feature}
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn--primary btn--block">
              Start 14-day trial
            </button>
            <p className="price-fine">No card required for the free plan. Cancel in two clicks.</p>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}
