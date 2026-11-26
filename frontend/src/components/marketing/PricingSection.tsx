import { motion, useReducedMotion } from 'framer-motion';
import { scaleIn, stagger, viewportOnce } from '../../lib/motion';
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
        <div className="section-head section-head--center">
          <p className="eyebrow">Pricing</p>
          <h2 className="section-title">
            Free to learn. <em>Pro</em> to go deeper.
          </h2>
          <p className="section-note section-note--center">
            The whole curriculum is free, permanently. Pro adds the things that help when you are building something
            real.
          </p>
          <div className="billing-toggle" role="group" aria-label="Billing period">
            <button
              type="button"
              className={!yearly ? 'is-active' : ''}
              onClick={() => setYearly(false)}
              aria-pressed={!yearly}
            >
              Monthly
            </button>
            <button
              type="button"
              className={yearly ? 'is-active' : ''}
              onClick={() => setYearly(true)}
              aria-pressed={yearly}
            >
              Yearly
              <span className="billing-save">−33%</span>
            </button>
          </div>
        </div>

        <motion.div
          className="price-grid"
          variants={stagger(0.05, 0.1)}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="shown"
          viewport={viewportOnce}
        >
          <motion.article className="price-card" variants={scaleIn}>
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

          <motion.article className="price-card price-card--pro" variants={scaleIn}>
            <header>
              <div className="price-pro-head">
                <span className="price-name">Pro</span>
                <span className="price-badge">Most popular</span>
              </div>
              <p className="price-amount">
                <span className="price-value">${yearly ? '8' : '12'}</span>
                <span className="price-period">per month</span>
              </p>
              <p className="price-desc">
                {yearly ? 'Billed $96 once a year. Cancel anytime.' : 'Billed monthly. Cancel anytime.'}
              </p>
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
