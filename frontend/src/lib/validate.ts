const QUOTES: Array<[RegExp, string]> = [
  [/[\u2018\u2019\u201b]/g, "'"],
  [/[\u201c\u201d]/g, '"'],
  [/[\u2013\u2014]/g, '-'],
  [/\u00a0/g, ' '],
];

export function normalise(value: string): string {
  let out = value.trim();
  for (const [pattern, replacement] of QUOTES) out = out.replace(pattern, replacement);
  return out
    .replace(/\s+/g, ' ')
    .replace(/\s*([()[\]{},;:=+\-*/<>])\s*/g, '$1')
    .replace(/["']/g, '')
    .replace(/;+$/, '')
    .replace(/\.$/, '')
    .toLowerCase();
}

export function matchesAnswer(value: string, accepted: string[]): boolean {
  const candidate = normalise(value);
  if (!candidate) return false;
  return accepted.some((entry) => normalise(entry) === candidate);
}

export function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    const swap = Math.abs(hash) % (index + 1);
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}
