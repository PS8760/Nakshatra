export const WORD_BANK = [
  "apple", "river", "candle", "forest", "mirror",
  "bridge", "lantern", "ocean", "thunder", "garden",
];

export function getRandomWords(count = 3): string[] {
  const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
