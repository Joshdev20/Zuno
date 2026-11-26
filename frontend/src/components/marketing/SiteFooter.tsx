import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Icon } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { scaleIn, viewportOnce } from '../../lib/motion';
import { Accordion } from '../ui/Accordion';

const faqs = [
  {
    q: 'Do I need to install anything?',
    a: 'No. Everything runs in the browser: the editor, the preview and the checks. The only requirement is a modern browser and about ten minutes.',
  },
  {
    q: 'Is the curriculum really free?',
    a: 'Yes. All lessons, the playground and the checks are free with no account. Pro exists for people who want saved projects, challenge sets and feedback.',
  },
  {
    q: 'How long does it take?',
    a: 'About three and a half hours of focused work end to end. Most people spread it over two or three weeks, which is better for retention anyway.',
  },
  {
    q: 'Do you use videos?',
    a: 'No. Every lesson is written, short and specific. Reading a paragraph and then writing the code is faster than scrubbing a timeline.',
  },
  {
    q: 'Where is my progress stored?',
    a: 'In your browser, locally. Nothing leaves your device and nothing needs an account. Clearing site data resets it — Pro adds cross-device sync.',
  },
  {
    q: 'Can I use Zuno on a phone?',
    a: 'The lessons and quizzes work well on small screens. For the coding exercises, a tablet or laptop is a much better experience.',
  },
];

export function FaqSection() {
  return (
    <section className="section">
      <div className="container faq-grid">
        <motion.div
          className="faq-intro"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">Questions</p>
          <h2 className="section-title">
            The things people <em>ask</em> first.
          </h2>
          <p className="section-note">
            Still unsure? The first lesson is seven minutes long and costs nothing. That is usually faster than reading
            an answer.
          </p>
          <Link to="/learn/html/html-01" className="btn btn--primary">
            Try lesson one
            <Icon name="arrowRight" size={15} />
          </Link>
        </motion.div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <Accordion key={faq.q} q={faq.q} a={faq.a} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClosingCta() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section">
      <div className="container">
        <motion.div
          className="closing"
          variants={scaleIn}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="shown"
          viewport={viewportOnce}
        >
          <div className="closing-copy">
            <p className="eyebrow eyebrow--light">Ready when you are</p>
            <h2>
              Your first page is
              <br />
              seven minutes away.
            </h2>
            <p>
              Open the editor, write four lines of HTML, watch them become a page. That is the whole idea.
            </p>
          </div>
          <div className="closing-actions">
            <Link to="/learn/html/html-01" className="btn btn--lg closing-btn">
              Start lesson one
              <Icon name="arrowRight" size={16} />
            </Link>
            <Link to="/playground" className="closing-link">
              Or open the playground
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>An interactive school for the web. Built for people who would rather write the code than watch someone else do it.</p>
        </div>
        <div className="footer-col">
          <p className="footer-label">Curriculum</p>
          <Link to="/learn/html">HTML</Link>
          <Link to="/learn/css">CSS</Link>
          <Link to="/learn/js">JavaScript</Link>
        </div>
        <div className="footer-col">
          <p className="footer-label">Platform</p>
          <Link to="/learn">Dashboard</Link>
          <Link to="/playground">Playground</Link>
          <Link to="/achievements">Achievements</Link>
        </div>
        <div className="footer-col">
          <p className="footer-label">This site</p>
          <a href="#pricing">Pricing</a>
          <a href="#method">Method</a>
          <a href="https://developer.mozilla.org" target="_blank" rel="noreferrer">
            MDN reference
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Zuno. Learn the web by building it.</span>
        <span className="mono">React · TypeScript · FastAPI</span>
      </div>
    </footer>
  );
}
