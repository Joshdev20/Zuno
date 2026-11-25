import { Link } from 'react-router-dom';

export function Logo({ wordmark = true, to = '/' }: { wordmark?: boolean; to?: string }) {
  return (
    <Link to={to} className="logo" aria-label="Zuno home">
      <span className="logo-mark" aria-hidden="true">
        Z
      </span>
      {wordmark && <span className="logo-word">zuno</span>}
    </Link>
  );
}
