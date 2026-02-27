import { DEFAULT_IMAGE_URLS, IMAGE_PLACEHOLDER_VALUE, SETTING_IMAGE_FALLBACKS } from "@/lib/constants/images";
import { isImageReference } from "@/lib/image-utils";

function sanitizeImageReference(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0 || !isImageReference(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function ensureImageUrl(value: string | null | undefined, fallback: string = DEFAULT_IMAGE_URLS.global): string {
  return sanitizeImageReference(value) ?? fallback;
}

export function ensureImageUrlList(
  values: string[] | null | undefined,
  fallback: string = DEFAULT_IMAGE_URLS.global
): string[] {
  const validItems = (values ?? []).map((item) => sanitizeImageReference(item)).filter((item): item is string => Boolean(item));

  return validItems.length > 0 ? validItems : [fallback];
}

export function getSettingImageFallback(key: string): string {
  return SETTING_IMAGE_FALLBACKS[key] ?? DEFAULT_IMAGE_URLS.global;
}

export function isPlaceholderImageValue(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }

  return value.trim() === IMAGE_PLACEHOLDER_VALUE;
}

export function toRenderableImageUrl(value: string | null | undefined): string | undefined {
  const normalized = sanitizeImageReference(value);

  if (!normalized || isPlaceholderImageValue(normalized)) {
    return undefined;
  }

  return normalized;
}
