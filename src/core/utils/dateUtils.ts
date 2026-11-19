/**
 * Утиліти для роботи з датами, тривалістю сесій та навчальними страйками.
 */

/**
 * Форматує секунди у формат "ХХ:YY" (наприклад, 120 -> "02:00")
 */
export function formatDuration(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Розраховує щоденний стрік (кількість днів навчання поспіль).
 * - Якщо активність вже була сьогодні -> стрік зберігається (не менше 1).
 * - Якщо остання активність була вчора -> стрік збільшується на +1.
 * - Якщо пропущено день або більше -> стрік починається заново з 1.
 * - Якщо це перша активність (lastActiveDate порожня) -> стрік = 1.
 */
export function calculateStreak(
  lastActiveDate: string | null | undefined,
  currentStreak: number = 0,
  now: Date = new Date()
): { streakDays: number; lastActiveDate: string; isNewStreakDay: boolean } {
  const currentIso = now.toISOString();
  const safeCurrent = Math.max(0, currentStreak || 0);

  if (!lastActiveDate || lastActiveDate.trim() === '') {
    return {
      streakDays: 1,
      lastActiveDate: currentIso,
      isNewStreakDay: true,
    };
  }

  const lastDate = new Date(lastActiveDate);
  if (isNaN(lastDate.getTime())) {
    return {
      streakDays: 1,
      lastActiveDate: currentIso,
      isNewStreakDay: true,
    };
  }

  // Обчислення різниці календарних днів у локальній часовій зоні
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const startOfLast = new Date(
    lastDate.getFullYear(),
    lastDate.getMonth(),
    lastDate.getDate()
  ).getTime();
  const diffDays = Math.round(
    (startOfToday - startOfLast) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 0) {
    return {
      streakDays: Math.max(1, safeCurrent),
      lastActiveDate: currentIso,
      isNewStreakDay: false,
    };
  } else if (diffDays === 1) {
    return {
      streakDays: (safeCurrent > 0 ? safeCurrent : 1) + 1,
      lastActiveDate: currentIso,
      isNewStreakDay: true,
    };
  } else {
    return {
      streakDays: 1,
      lastActiveDate: currentIso,
      isNewStreakDay: true,
    };
  }
}

/**
 * Відмінювання слова "день" українською мовою для стріку
 */
export function getStreakText(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день поспіль';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100))
    return 'дні поспіль';
  return 'днів поспіль';
}
