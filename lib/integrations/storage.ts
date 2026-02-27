import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { toSanitizedFileName } from "@/lib/image-utils";

interface UploadInput {
  fileName: string;
  mimeType: string;
}

interface SaveImageInput {
  arrayBuffer: ArrayBuffer;
  originalName: string;
  mimeType: string;
  folder?: string;
}

const LOCAL_UPLOAD_ROOT = process.env.LOCAL_UPLOAD_ROOT?.trim() || "uploads";

const mimeToExtension = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"]
]);

export const allowedImageMimeTypes = new Set(mimeToExtension.keys());

export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function createUploadSignature(input: UploadInput) {
  return {
    provider: process.env.STORAGE_PROVIDER ?? "local",
    fileName: input.fileName,
    mimeType: input.mimeType,
    uploadUrl: process.env.STORAGE_UPLOAD_URL ?? "https://example.com/mock-upload",
    expiresInSeconds: 900
  };
}

function extensionFromName(name: string): string | null {
  const ext = path.extname(name).replace(".", "").toLowerCase();
  return ext.length > 0 ? ext : null;
}

function resolveTargetPath(folder?: string): { absoluteDir: string; publicPrefix: string } {
  const normalizedFolder = folder?.trim().replace(/^[\\/]+|[\\/]+$/g, "") || "";
  const uploadSubPath = normalizedFolder.length > 0 ? path.join(LOCAL_UPLOAD_ROOT, normalizedFolder) : LOCAL_UPLOAD_ROOT;
  const absoluteDir = path.join(process.cwd(), "public", uploadSubPath);
  const publicPrefix = `/${uploadSubPath.replace(/\\/g, "/")}`;

  return { absoluteDir, publicPrefix };
}

export async function saveImageToLocalStorage(input: SaveImageInput): Promise<string> {
  const { absoluteDir, publicPrefix } = resolveTargetPath(input.folder);
  await mkdir(absoluteDir, { recursive: true });

  const baseNameRaw = path.basename(input.originalName, path.extname(input.originalName));
  const baseName = toSanitizedFileName(baseNameRaw) || "upload";
  const extFromMime = mimeToExtension.get(input.mimeType);
  const ext = extFromMime ?? extensionFromName(input.originalName) ?? "jpg";
  const finalName = `${baseName}-${randomUUID()}.${ext}`;
  const absolutePath = path.join(absoluteDir, finalName);

  await writeFile(absolutePath, Buffer.from(input.arrayBuffer));

  return `${publicPrefix}/${finalName}`;
}
