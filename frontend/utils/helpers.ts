// ── Word bank: 80+ words across 8 semantic categories ────────────────────────
// Clinically, mixing categories tests semantic memory breadth.
// Words chosen for: common vocabulary, clear imagery, 1-2 syllables preferred.

const WORD_CATEGORIES: Record<string, string[]> = {
  nature:    ["river", "forest", "ocean", "thunder", "garden", "valley", "meadow", "cliff", "breeze", "pebble"],
  objects:   ["candle", "mirror", "lantern", "bottle", "ladder", "pillow", "basket", "hammer", "pencil", "kettle"],
  animals:   ["eagle", "rabbit", "dolphin", "panther", "sparrow", "turtle", "falcon", "badger", "salmon", "lizard"],
  food:      ["apple", "mango", "walnut", "pepper", "lemon", "cherry", "ginger", "almond", "melon", "carrot"],
  colors:    ["crimson", "amber", "violet", "silver", "cobalt", "ivory", "scarlet", "teal", "maroon", "jade"],
  places:    ["bridge", "harbor", "chapel", "market", "castle", "tunnel", "plaza", "cabin", "temple", "cellar"],
  actions:   ["whisper", "stumble", "gather", "wander", "balance", "scatter", "linger", "tumble", "glide", "anchor"],
  abstract:  ["courage", "silence", "wisdom", "patience", "freedom", "justice", "memory", "shadow", "wonder", "burden"],
};

// Flatten all words
const ALL_WORDS = Object.values(WORD_CATEGORIES).flat();

export function getRandomWords(count = 5): string[] {
  // Pick from different categories for better semantic diversity
  const categories = Object.keys(WORD_CATEGORIES);
  const shuffledCats = [...categories].sort(() => Math.random() - 0.5);
  const result: string[] = [];

  // First fill from different categories (ensures variety)
  for (const cat of shuffledCats) {
    if (result.length >= count) break;
    const words = WORD_CATEGORIES[cat];
    const word = words[Math.floor(Math.random() * words.length)];
    if (!result.includes(word)) result.push(word);
  }

  // If we need more, fill randomly from remaining
  while (result.length < count) {
    const word = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
    if (!result.includes(word)) result.push(word);
  }

  return result;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
