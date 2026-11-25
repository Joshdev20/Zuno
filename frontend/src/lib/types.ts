export type Level = 'beginner' | 'intermediate' | 'advanced';
export type TrackId = 'html' | 'css' | 'js';
export type ExerciseKind = 'html' | 'css' | 'js';

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

export type Section = SectionText | SectionCode | SectionList | SectionCallout;

export interface Check {
  kind: 'dom' | 'js' | 'style' | 'source' | 'console';
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

export interface Lesson {
  id: string;
  level: Level;
  title: string;
  summary: string;
  minutes: number;
  xp: number;
  objectives: string[];
  sections: Section[];
  exercise: Exercise;
  quiz: QuizQuestion[];
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
