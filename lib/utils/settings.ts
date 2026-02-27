import { SystemSetting } from "@/lib/types";

export function toSettingsMap(settings: SystemSetting[]): Map<string, string> {
  return new Map(settings.map((item) => [item.key, item.value]));
}

export function readSetting(settings: Map<string, string> | undefined, key: string, fallback: string): string {
  if (!settings) {
    return fallback;
  }

  const value = settings.get(key);
  return value !== undefined ? value : fallback;
}
