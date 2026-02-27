import { db } from "@/lib/db";
import { SystemSetting as AppSystemSetting } from "@/lib/types";

import {
  defaultSystemSettingsByKey,
  ensureDefaultSystemSettings,
  mapSetting
} from "@/lib/data-access/shared";

export async function listSettings(): Promise<AppSystemSetting[]> {
  await ensureDefaultSystemSettings();

  const settings = await db.systemSetting.findMany({
    orderBy: {
      key: "asc"
    }
  });

  return settings.map(mapSetting);
}

export async function updateSetting(key: string, value: string): Promise<AppSystemSetting | undefined> {
  await ensureDefaultSystemSettings();

  const setting = await db.systemSetting.findUnique({ where: { key } });

  if (!setting) {
    const fallback = defaultSystemSettingsByKey.get(key);

    if (!fallback) {
      return undefined;
    }

    const created = await db.systemSetting.create({
      data: {
        key: fallback.key,
        label: fallback.label,
        category: fallback.category,
        value
      }
    });

    return mapSetting(created);
  }

  const updated = await db.systemSetting.update({
    where: { key },
    data: { value }
  });

  return mapSetting(updated);
}

export async function updateSettingsBatch(
  settings: Array<{
    key: string;
    value: string;
  }>
): Promise<AppSystemSetting[]> {
  const deduped = new Map<string, string>();

  for (const item of settings) {
    deduped.set(item.key, item.value);
  }

  const updates: AppSystemSetting[] = [];

  for (const [key, value] of deduped.entries()) {
    const updated = await updateSetting(key, value);

    if (updated) {
      updates.push(updated);
    }
  }

  return updates;
}
