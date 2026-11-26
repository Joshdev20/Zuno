import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { apiEnabled, saveProgress } from './api';
import { tracks } from './curriculum';
import type { Lesson, Track } from './types';

const STORAGE_KEY = 'zuno.progress.v1';

export interface Completion {
  at: string;
  xp: number;
}

export interface ProgressState {
  xp: number;
  completed: Record<string, Completion>;
  quizzes: Record<string, boolean>;
  streak: { count: number; last: string };
  activeDays: string[];
  playgroundRuns: number;
  startedAt: string;
  resume: Record<string, number>;
}

export interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: 'xp' | 'badge' | 'info';
}

export interface LevelInfo {
  level: number;
  label: string;
  intoLevel: number;
  span: number;
  progress: number;
  toNext: number;
}

const emptyState = (): ProgressState => ({
  xp: 0,
  completed: {},
  quizzes: {},
  streak: { count: 0, last: '' },
  activeDays: [],
  playgroundRuns: 0,
  startedAt: new Date().toISOString(),
  resume: {},
});

export function dateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const LEVEL_NAMES = [
  'Curious',
  'Apprentice',
  'Builder',
  'Craftsperson',
  'Engineer',
  'Architect',
  'Principal',
];

function threshold(level: number): number {
  return 50 * level * (level - 1);
}

export function levelForXp(xp: number): LevelInfo {
  let level = 1;
  while (threshold(level + 1) <= xp) level += 1;
  const base = threshold(level);
  const next = threshold(level + 1);
  const span = next - base;
  const intoLevel = xp - base;
  return {
    level,
    label: LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)],
    intoLevel,
    span,
    progress: span === 0 ? 0 : Math.min(1, intoLevel / span),
    toNext: Math.max(0, next - xp),
  };
}

function load(): ProgressState {
  if (typeof window === 'undefined') return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...emptyState(),
      ...parsed,
      streak: { ...emptyState().streak, ...(parsed.streak ?? {}) },
      completed: parsed.completed ?? {},
      quizzes: parsed.quizzes ?? {},
      activeDays: parsed.activeDays ?? [],
      resume: parsed.resume ?? {},
    };
  } catch {
    return emptyState();
  }
}

function withActivity(state: ProgressState): ProgressState {
  const today = dateKey();
  if (state.streak.last === today && state.activeDays.includes(today)) return state;
  const yesterday = dateKey(new Date(Date.now() - 86_400_000));
  const count = state.streak.last === yesterday ? state.streak.count + 1 : 1;
  const activeDays = Array.from(new Set([...state.activeDays, today])).slice(-120);
  return { ...state, streak: { count, last: today }, activeDays };
}

export function completedCount(state: ProgressState): number {
  return Object.keys(state.completed).length;
}

export function trackStats(state: ProgressState) {
  return tracks.map((track) => {
    const done = track.lessons.filter((lesson) => state.completed[lesson.id]).length;
    const next = track.lessons.find((lesson) => !state.completed[lesson.id]);
    return {
      track,
      done,
      total: track.lessons.length,
      ratio: track.lessons.length ? done / track.lessons.length : 0,
      next,
      complete: done === track.lessons.length,
    };
  });
}

export function isLessonUnlocked(state: ProgressState, track: Track, lesson: Lesson): boolean {
  const index = track.lessons.findIndex((entry) => entry.id === lesson.id);
  if (index <= 0) return true;
  return Boolean(state.completed[track.lessons[index - 1].id]);
}

export function nextLessonFor(state: ProgressState): Lesson | undefined {
  for (const track of tracks) {
    const next = track.lessons.find((lesson) => !state.completed[lesson.id]);
    if (next) return next;
  }
  return undefined;
}

export function todayCompletions(state: ProgressState): number {
  const today = dateKey();
  return Object.values(state.completed).filter((entry) => entry.at.slice(0, 10) === today).length;
}

interface ProgressContextValue {
  state: ProgressState;
  level: LevelInfo;
  toasts: Toast[];
  completeLesson: (lesson: Lesson) => boolean;
  completeQuiz: (lessonId: string, perfect: boolean) => void;
  setResume: (lessonId: string, step: number) => void;
  logPlaygroundRun: () => void;
  resetProgress: () => void;
  dismissToast: (id: number) => void;
  notify: (toast: Omit<Toast, 'id'>) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;
  const toastId = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable (private mode) — progress stays in memory */
    }
  }, [state]);

  useEffect(() => {
    if (!apiEnabled) return;
    const timer = window.setTimeout(() => {
      void saveProgress({
        completed: Object.keys(state.completed),
        xp: state.xp,
        streak: state.streak.count,
        active_days: state.activeDays,
      }).catch(() => {
        /* the API is a mirror, never the source of truth */
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [state]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = ++toastId.current;
      setToasts((current) => [...current, { ...toast, id }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((entry) => entry.id !== id));
      }, 4600);
    },
    [],
  );

  const setResume = useCallback((lessonId: string, step: number) => {
    setState((current) =>
      current.resume[lessonId] === step ? current : { ...current, resume: { ...current.resume, [lessonId]: step } },
    );
  }, []);

  const completeLesson = useCallback(
    (lesson: Lesson) => {
      const current = stateRef.current;
      if (current.completed[lesson.id]) return false;
      const next: ProgressState = withActivity({
        ...current,
        xp: current.xp + lesson.xp,
        completed: {
          ...current.completed,
          [lesson.id]: { at: new Date().toISOString(), xp: lesson.xp },
        },
      });
      setState(next);
      notify({ tone: 'xp', title: `+${lesson.xp} XP`, body: `${lesson.title} complete` });
      return true;
    },
    [notify],
  );

  const completeQuiz = useCallback(
    (lessonId: string, perfect: boolean) => {
      if (!perfect) return;
      const current = stateRef.current;
      if (current.quizzes[lessonId]) return;
      const next: ProgressState = withActivity({
        ...current,
        xp: current.xp + 15,
        quizzes: { ...current.quizzes, [lessonId]: true },
      });
      setState(next);
      notify({ tone: 'xp', title: '+15 XP', body: 'Quiz answered perfectly' });
    },
    [notify],
  );

  const logPlaygroundRun = useCallback(() => {
    const current = stateRef.current;
    setState(withActivity({ ...current, playgroundRuns: current.playgroundRuns + 1 }));
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = emptyState();
    setState(fresh);
    notify({ tone: 'info', title: 'Progress reset', body: 'A clean slate.' });
  }, [notify]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      level: levelForXp(state.xp),
      toasts,
      completeLesson,
      completeQuiz,
      setResume,
      logPlaygroundRun,
      resetProgress,
      dismissToast,
      notify,
    }),
    [state, toasts, completeLesson, completeQuiz, setResume, logPlaygroundRun, resetProgress, dismissToast, notify],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used inside ProgressProvider');
  return context;
}
