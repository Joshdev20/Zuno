import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Logo } from '../ui/Logo';
import { Icon } from '../ui/Icon';

export function MarketingNav() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });

  return (
    <header className="m-nav">
      <div className="container m-nav-inner">
        <Logo />
        <nav className="m-nav-links" aria-label="Sections">
          <a href="#curriculum">Curriculum</a>
          <a href="#method">Method</a>
          <a href="#pricing">Pricing</a>
          <Link to="/playground">Playground</Link>
        </nav>
        <div className="m-nav-actions">
          <Link to="/learn" className="btn btn--ghost btn--sm">
            Open app
          </Link>
          <Link to="/learn/html/html-01" className="btn btn--primary btn--sm">
            Start free
            <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      </div>
      <motion.div className="m-nav-progress" style={{ scaleX: progress }} aria-hidden="true" />
    </header>
  );
}
