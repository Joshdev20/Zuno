import { Link } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';

export function NotFound() {
  return (
    <div className="not-found">
      <p className="eyebrow">404</p>
      <h1>This page has not been built yet.</h1>
      <p>Either the link is wrong, or the lesson moved. Both are recoverable.</p>
      <div className="not-found-actions">
        <Link to="/learn" className="btn btn--primary">
          Back to learning
          <Icon name="arrowRight" size={15} />
        </Link>
        <Link to="/" className="btn btn--ghost">
          Home
        </Link>
      </div>
    </div>
  );
}
