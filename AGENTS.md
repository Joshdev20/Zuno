# Zuno — repository notes

Mobile-first, Mimo-inspired programming education platform. React + Vite + TypeScript frontend
(`frontend/`, dev port 12000), FastAPI backend (`api/`), shared curriculum JSON
(`shared/curriculum/`). No database: progress lives in localStorage.

## Commands

```bash
npm --prefix frontend install
npm --prefix frontend run dev      # dev server
npm --prefix frontend run build    # tsc + vite build
npx --prefix frontend tsc --noEmit # type check only
```

## Motion conventions

Every animation goes through the tokens in `frontend/src/lib/motion.ts`; do not hand-roll
durations or easings in components.

- Easing: `EASE_OUT` (`[0.22, 1, 0.36, 1]`) for entrances, `EASE_IN_OUT` for state changes.
- Springs: `SPRING` (nav/pills), `POP` (taps, ticks, counters), `SOFT_SPRING` (large surfaces).
- Variants: `fadeUp`, `scaleIn`, `fadeIn`, `slideInLeft`, `wordUp`, `stagger(delay, gap)`.
- Viewport: `viewportOnce` for scroll reveals; `viewportSoft` for tight sections.
- CSS durations live in `styles/tokens.css` as `--dur-1..4` and `--ease-out`.

Reusable pieces:

- `components/ui/SplitText.tsx` — masked per-word reveal; pass `emWords` to italicise words.
- `components/ui/CountUp.tsx` — in-view number count; renders the final value under reduced motion.
- `components/ui/Accordion.tsx` — height-animated disclosure.
- `lib/useSpotlight.ts` — `trackSpotlight` writes `--mx/--my` for the shared `.spotlight` glow
  (defined in `styles/base.css`).

Rules:

- Always gate movement on `useReducedMotion()` (`initial={reduceMotion ? false : ...}`); the global
  `prefers-reduced-motion` block in `styles/base.css` only neutralises CSS transitions.
- Animate transform and opacity; avoid layout properties except inside `Accordion`.
- Keep the hero mock and app pages cheap: no new WebGL scene without lazy loading
  (`components/marketing/WireScene.tsx` is the pattern).
- Anything that changes a count (XP, streak, checks) should animate on change so the UI feels live.
