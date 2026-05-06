const START_YEAR = 2025;

export function getCopyrightYear(now: Date = new Date()): string {
  const currentYear = now.getFullYear();
  return currentYear <= START_YEAR
    ? String(START_YEAR)
    : `${START_YEAR}-${currentYear}`;
}
