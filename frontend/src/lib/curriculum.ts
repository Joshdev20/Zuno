import htmlTrack from '@shared/curriculum/html.json';
import cssTrack from '@shared/curriculum/css.json';
import jsTrack from '@shared/curriculum/js.json';
import pythonTrack from '@shared/curriculum/python.json';
import type { Lesson, Track } from './types';

export const tracks = [htmlTrack, cssTrack, jsTrack, pythonTrack] as unknown as Track[];

export const trackById = new Map<string, Track>(tracks.map((t) => [t.id, t]));

export const allLessons: Lesson[] = tracks.flatMap((track) => track.lessons);

export const lessonById = new Map<string, Lesson>(allLessons.map((l) => [l.id, l]));

export const lessonTrack = new Map<string, Track>(
  tracks.flatMap((track) => track.lessons.map((lesson) => [lesson.id, track] as [string, Track])),
);

export const totalLessons = allLessons.length;

export const totalMinutes = allLessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

export const totalXp = allLessons.reduce((sum, lesson) => sum + lesson.xp, 0);

export function getTrack(id: string | undefined): Track | undefined {
  return id ? trackById.get(id) : undefined;
}

export function getLesson(trackId: string | undefined, lessonId: string | undefined): Lesson | undefined {
  if (!trackId || !lessonId) return undefined;
  return trackById.get(trackId)?.lessons.find((lesson) => lesson.id === lessonId);
}

export function neighbours(lessonId: string): { previous?: Lesson; next?: Lesson } {
  const index = allLessons.findIndex((lesson) => lesson.id === lessonId);
  if (index === -1) return {};
  return { previous: allLessons[index - 1], next: allLessons[index + 1] };
}

export const levelLabel: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const fileForKind: Record<string, string> = {
  html: 'index.html',
  css: 'styles.css',
  js: 'script.js',
  python: 'main.py',
};
