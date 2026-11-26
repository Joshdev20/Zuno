import type { ReactNode } from 'react';

const paths = {
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </>
  ),
  arrowUp: (
    <>
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </>
  ),
  arrowDown: (
    <>
      <path d="M12 5v14" />
      <path d="m18 13-6 6-6-6" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2Z" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  check: <path d="m20 6-11 11-5-5" />,
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  flame: (
    <path d="M12 22c3.9 0 7-2.9 7-6.6 0-3.9-2.6-6.4-4.2-9.1-.7-1.2-1.3-2.6-1.5-4.3-2.3 1.6-3.6 3.9-3.6 5.9 0 1.2.4 2.2 1.2 3.1-1.9-.2-3.1-1.7-3.1-3.6C6 13 8.1 22 12 22Z" />
  ),
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5v-13Z" />
      <path d="M8 3v18" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5.5H5v2A3 3 0 0 0 8 10.5" />
      <path d="M16 5.5h3v2a3 3 0 0 1-3 3" />
      <path d="M12 13v4" />
      <path d="M9 21h6" />
      <path d="M10 17h4" />
    </>
  ),
  code: (
    <>
      <path d="m9 8-4 4 4 4" />
      <path d="m15 8 4 4-4 4" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="m7.5 10 2.2 2-2.2 2" />
      <path d="M12.5 14h4" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v3.5" />
      <path d="M12 17.5V21" />
      <path d="M3 12h3.5" />
      <path d="M17.5 12H21" />
      <path d="m5.6 5.6 2.5 2.5" />
      <path d="m15.9 15.9 2.5 2.5" />
      <path d="m18.4 5.6-2.5 2.5" />
      <path d="m8.1 15.9-2.5 2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 8.5 4.7L12 12.4 3.5 7.7 12 3Z" />
      <path d="m3.5 12.5 8.5 4.7 8.5-4.7" />
      <path d="m3.5 16.8 8.5 4.7 8.5-4.7" />
    </>
  ),
  brush: (
    <>
      <path d="m14.5 4.5 5 5" />
      <path d="M17 2.5 21.5 7 11 17.5l-4-4L17 2.5Z" />
      <path d="M7 13.5c-2 0-3.5 1.5-3.5 3.5 0 1.6-.8 2.6-2 3.5 3.8.6 6.5-1.2 6.5-4 0-1.7-.6-3-1-3Z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  command: (
    <path d="M9 6.5a2.5 2.5 0 1 0-2.5 2.5H17a2.5 2.5 0 1 0-2.5-2.5v11A2.5 2.5 0 1 0 17 15H7a2.5 2.5 0 1 0 2 2.5v-11Z" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  play: <path d="M7.5 5.2 19 12 7.5 18.8V5.2Z" />,
  rotate: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3 4.5v5h5" />
    </>
  ),
  home: (
    <>
      <path d="m4 10.5 8-7 8 7" />
      <path d="M6 9.5V20h12V9.5" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="m8.5 13.5-1 7.5 4.5-2.5 4.5 2.5-1-7.5" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6" />
      <path d="M18 14.8c2.1.7 3.5 2.4 3.5 5.2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 7.5 8 5.5 8-5.5" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 18,
  className,
  strokeWidth = 1.6,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
