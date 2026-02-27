import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth";
import { checkRateLimit, error, json, preflight } from "@/lib/api-utils";
import { MAX_IMAGE_UPLOAD_BYTES, allowedImageMimeTypes, saveImageToLocalStorage } from "@/lib/integrations/storage";

export const runtime = "nodejs";

function normalizeScope(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }

  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "");

  return cleaned.length > 0 ? cleaned : undefined;
}

export function OPTIONS() {
  return preflight();
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request, { limit: 40, windowMs: 60_000 });

  if (rate) {
    return rate;
  }

  const auth = await requireAuth(request, ["user"]);

  if (!auth.ok) {
    return auth.response;
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return error("تعذر قراءة الملف المرفوع.", 400);
  }

  const fileValue = formData.get("file");

  if (!(fileValue instanceof File)) {
    return error("الرجاء اختيار صورة للرفع.", 422);
  }

  if (fileValue.size <= 0) {
    return error("الملف فارغ.", 422);
  }

  if (fileValue.size > MAX_IMAGE_UPLOAD_BYTES) {
    return error("حجم الصورة يتجاوز الحد المسموح (8MB).", 422);
  }

  const mimeType = fileValue.type.toLowerCase();

  if (!allowedImageMimeTypes.has(mimeType)) {
    return error("نوع الصورة غير مدعوم. الصيغ المقبولة: JPG, PNG, WEBP, GIF, AVIF.", 422);
  }

  const scopeValue = formData.get("scope");
  const scope = typeof scopeValue === "string" ? normalizeScope(scopeValue) : undefined;
  const arrayBuffer = await fileValue.arrayBuffer();
  const url = await saveImageToLocalStorage({
    arrayBuffer,
    originalName: fileValue.name,
    mimeType,
    folder: scope
  });

  return json(
    {
      ok: true,
      data: {
        url,
        fileName: fileValue.name,
        mimeType,
        size: fileValue.size
      }
    },
    201
  );
}
