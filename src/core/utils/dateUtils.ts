/**
 * Утиліти для роботи з датами, відносним часом та навчальними страйками.
 */

/**
 * Повертає відносний час українською мовою (наприклад, "5 хв тому", "вчора", "щойно")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 45) return 'щойно';
    if (diffMin < 60) return `${diffMin} хв тому`;
    if (diffHours < 24) return `${diffHours} год тому`;
    if (diffDays === 1) return 'вчора';
    if (diffDays < 7) return `${diffDays} дн тому`;

    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}

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
 * Перевіряє, чи активність була сьогодні (за локальною датою)
 */
export function isToday(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
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
    // Вже зафіксовано сьогодні: стрік залишається (щонайменше 1)
    return {
      streakDays: Math.max(1, safeCurrent),
      lastActiveDate: currentIso,
      isNewStreakDay: false,
    };
  } else if (diffDays === 1) {
    // Вчора була активність, сьогодні користувач продовжив навчання: +1 день
    return {
      streakDays: (safeCurrent > 0 ? safeCurrent : 1) + 1,
      lastActiveDate: currentIso,
      isNewStreakDay: true,
    };
  } else {
    // Пропущено один або більше днів: стрік починається з 1
    return {
      streakDays: 1,
      lastActiveDate: currentIso,
      isNewStreakDay: true,
    };
  }
}

/**
 * Повертає актуальний стрік для відображення іншим користувачам (наприклад, у рейтингу).
 * Якщо користувач не заходив понад 1 день (пропустив вчора і сьогодні), його стрік = 0.
 */
export function getEffectiveStreak(
  lastActiveDate: string | null | undefined,
  storedStreak: number,
  now: Date = new Date()
): number {
  if (!lastActiveDate || !storedStreak || storedStreak <= 0) return 0;
  const lastDate = new Date(lastActiveDate);
  if (isNaN(lastDate.getTime())) return 0;

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

  // Якщо активність була сьогодні (0) або вчора (1), стрік ще живий
  if (diffDays <= 1) {
    return storedStreak;
  }
  return 0;
}

/**
 * Схиляння слова "день" українською мовою для стріку
 */
export function getStreakText(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день поспіль';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100))
    return 'дні поспіль';
  return 'днів поспіль';
}
