const HTTP_URL_PATTERN = /^https?:\/\/\S+$/i;

export function isImageReference(value: string): boolean {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return false;
  }

  if (trimmed.startsWith("/")) {
    return true;
  }

  return HTTP_URL_PATTERN.test(trimmed);
}

export function toSanitizedFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
