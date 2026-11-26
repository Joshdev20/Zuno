import { tracks } from './curriculum';
import type { ProgressState } from './progress';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: 'spark' | 'layers' | 'brush' | 'bolt' | 'flame' | 'trophy' | 'target' | 'grid' | 'clock' | 'terminal';
  test: (state: ProgressState) => boolean;
}

function trackDone(state: ProgressState, trackId: string): boolean {
  const track = tracks.find((entry) => entry.id === trackId);
  if (!track) return false;
  return track.lessons.every((lesson) => state.completed[lesson.id]);
}

function trackStarted(state: ProgressState, trackId: string): number {
  const track = tracks.find((entry) => entry.id === trackId);
  if (!track) return 0;
  return track.lessons.filter((lesson) => state.completed[lesson.id]).length;
}

export const badges: Badge[] = [
  {
    id: 'first-step',
    name: 'First step',
    description: 'Complete your first lesson.',
    icon: 'spark',
    test: (state) => Object.keys(state.completed).length >= 1,
  },
  {
    id: 'five-lessons',
    name: 'Momentum',
    description: 'Complete five lessons.',
    icon: 'bolt',
    test: (state) => Object.keys(state.completed).length >= 5,
  },
  {
    id: 'ten-lessons',
    name: 'Halfway',
    description: 'Complete ten lessons.',
    icon: 'trophy',
    test: (state) => Object.keys(state.completed).length >= 10,
  },
  {
    id: 'streak-3',
    name: 'Three in a row',
    description: 'Learn three days in a row.',
    icon: 'flame',
    test: (state) => state.streak.count >= 3,
  },
  {
    id: 'streak-7',
    name: 'Weekly habit',
    description: 'Learn seven days in a row.',
    icon: 'clock',
    test: (state) => state.streak.count >= 7,
  },
  {
    id: 'html-complete',
    name: 'Structurally sound',
    description: 'Finish every HTML lesson.',
    icon: 'layers',
    test: (state) => trackDone(state, 'html'),
  },
  {
    id: 'css-complete',
    name: 'Well composed',
    description: 'Finish every CSS lesson.',
    icon: 'brush',
    test: (state) => trackDone(state, 'css'),
  },
  {
    id: 'js-complete',
    name: 'Fully wired',
    description: 'Finish every JavaScript lesson.',
    icon: 'bolt',
    test: (state) => trackDone(state, 'js'),
  },
  {
    id: 'python-complete',
    name: 'Interpreter',
    description: 'Finish every Python lesson.',
    icon: 'terminal',
    test: (state) => trackDone(state, 'python'),
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    description: 'Complete a lesson in every track.',
    icon: 'grid',
    test: (state) =>
      trackStarted(state, 'html') > 0 &&
      trackStarted(state, 'css') > 0 &&
      trackStarted(state, 'js') > 0 &&
      trackStarted(state, 'python') > 0,
  },
  {
    id: 'quiz-ace',
    name: 'Quiz ace',
    description: 'Answer a quiz perfectly.',
    icon: 'target',
    test: (state) => Object.values(state.quizzes).some(Boolean),
  },
  {
    id: 'tinkerer',
    name: 'Tinkerer',
    description: 'Run code in the playground ten times.',
    icon: 'spark',
    test: (state) => state.playgroundRuns >= 10,
  },
  {
    id: 'level-5',
    name: 'Engineer',
    description: 'Reach level 5.',
    icon: 'trophy',
    test: (state) => state.xp >= 1000,
  },
];

export function earnedBadges(state: ProgressState): Badge[] {
  return badges.filter((badge) => badge.test(state));
}
