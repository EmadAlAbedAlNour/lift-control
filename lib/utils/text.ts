export function normalizeNameKey(value: string): string {
  return value.trim().toLowerCase();
}

export function toTelHref(value: string): string {
  return `tel:${value.replace(/\s+/g, "")}`;
}
