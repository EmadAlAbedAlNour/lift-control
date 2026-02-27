export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysKey(date: Date, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return toDateKey(next);
}

export function getTodayLocalDate(): string {
  const now = new Date();
  const shifted = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 10);
}

export function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

export function toUtcDateFromDateKey(dateKey: string, hour = 8): Date {
  const normalizedHour = String(hour).padStart(2, "0");
  return new Date(`${dateKey}T${normalizedHour}:00:00Z`);
}
