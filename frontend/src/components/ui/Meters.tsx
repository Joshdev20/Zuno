export function ProgressBar({
  value,
  tone = 'pine',
  height = 6,
  label,
}: {
  value: number;
  tone?: 'pine' | 'clay' | 'brass' | 'slate' | 'ink';
  height?: number;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={`bar bar--${tone}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Ring({
  value,
  size = 64,
  stroke = 5,
  tone = 'var(--pine)',
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line-soft)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 600ms var(--ease)' }}
        />
      </svg>
      <span className="ring-label">{children}</span>
    </span>
  );
}
