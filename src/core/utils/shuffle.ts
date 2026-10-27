/**
 * Чесне тасування масиву за алгоритмом Фішера-Йейтса (Knuth / Fisher-Yates shuffle).
 * Забезпечує математично рівномірний розподіл перестановок O(n) без зміщення.
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Вибірка k випадкових унікальних елементів з масиву
 */
export function sampleRandom<T>(array: readonly T[], count: number): T[] {
  if (count <= 0) return [];
  if (count >= array.length) return shuffleArray(array);
  return shuffleArray(array).slice(0, count);
}
