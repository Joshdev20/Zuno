export type Level = 'beginner' | 'intermediate' | 'advanced';
export type TrackId = 'html' | 'css' | 'js' | 'python';
export type ExerciseKind = 'html' | 'css' | 'js' | 'python';

export interface SectionHeading {
  type: 'heading';
  body: string;
}
export interface SectionText {
  type: 'text';
  body: string;
}
export interface SectionCode {
  type: 'code';
  language: string;
  code: string;
  caption?: string;
}
export interface SectionList {
  type: 'list';
  items: string[];
}
export interface SectionCallout {
  type: 'callout';
  tone: 'tip' | 'warn' | 'note';
  title: string;
  body: string;
}

export type Section = SectionHeading | SectionText | SectionCode | SectionList | SectionCallout;

export interface Check {
  kind: 'dom' | 'js' | 'style' | 'source' | 'console' | 'python';
  label: string;
  selector?: string;
  property?: string;
  expected?: string;
  expression?: string;
  includes?: string;
  textIncludes?: string;
}

export interface Exercise {
  kind: ExerciseKind;
  brief: string;
  starter: string;
  solution: string;
  markup?: string;
  prelude?: string;
  checks: Check[];
  hints: string[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
}

export type Drill =
  | {
      kind: 'choice';
      prompt: string;
      options: string[];
      answer: number;
      explain: string;
      hints?: string[];
      after?: number;
    }
  | {
      kind: 'fill';
      prompt: string;
      code: string;
      blanks: string[][];
      explain: string;
      hints?: string[];
      after?: number;
    }
  | {
      kind: 'order';
      prompt: string;
      lines: string[];
      explain: string;
      hints?: string[];
      after?: number;
    }
  | {
      kind: 'find';
      prompt: string;
      lines: string[];
      bad: number;
      explain: string;
      hints?: string[];
      after?: number;
    }
  | {
      kind: 'predict';
      prompt: string;
      code: string;
      answers: string[];
      explain: string;
      hints?: string[];
      after?: number;
    }
  | {
      kind: 'short';
      prompt: string;
      answers: string[];
      explain: string;
      hints?: string[];
      after?: number;
    };

export interface LessonBuild {
  title: string;
  blurb: string;
}

export interface Lesson {
  id: string;
  level: Level;
  title: string;
  summary: string;
  minutes: number;
  xp: number;
  objectives: string[];
  sections: Section[];
  drills?: Drill[];
  exercise: Exercise;
  quiz: QuizQuestion[];
  challenge?: boolean;
  project?: boolean;
  build?: LessonBuild;
}

export interface Track {
  id: TrackId;
  name: string;
  tagline: string;
  description: string;
  lessons: Lesson[];
}

export interface CheckResult {
  label: string;
  ok: boolean;
  detail?: string;
}

export interface RunResult {
  results: CheckResult[];
  logs: string[];
  error: string | null;
}
