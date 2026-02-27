import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { put } from "@vercel/blob";

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
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN?.trim();
const IS_VERCEL_RUNTIME = process.env.VERCEL === "1";

type StorageProvider = "local" | "vercel-blob";

const mimeToExtension = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"]
]);

export const allowedImageMimeTypes = new Set(mimeToExtension.keys());

// Keep upload payload below typical serverless limits.
export const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;

function resolveStorageProvider(): StorageProvider {
  if (STORAGE_PROVIDER === "local") {
    return "local";
  }

  if (STORAGE_PROVIDER === "vercel-blob" || STORAGE_PROVIDER === "blob") {
    return "vercel-blob";
  }

  if (BLOB_READ_WRITE_TOKEN) {
    return "vercel-blob";
  }

  return "local";
}

export async function createUploadSignature(input: UploadInput) {
  const provider = resolveStorageProvider();

  return {
    provider,
    fileName: input.fileName,
    mimeType: input.mimeType,
    uploadUrl: process.env.STORAGE_UPLOAD_URL ?? "/api/uploads",
    expiresInSeconds: 900
  };
}

function extensionFromName(name: string): string | null {
  const ext = path.extname(name).replace(".", "").toLowerCase();
  return ext.length > 0 ? ext : null;
}

function resolveUploadSubPath(folder?: string): string {
  const normalizedFolder = folder?.trim().replace(/^[\\/]+|[\\/]+$/g, "") || "";
  return normalizedFolder.length > 0 ? path.join(LOCAL_UPLOAD_ROOT, normalizedFolder) : LOCAL_UPLOAD_ROOT;
}

function createFinalName(input: SaveImageInput): string {
  const baseNameRaw = path.basename(input.originalName, path.extname(input.originalName));
  const baseName = toSanitizedFileName(baseNameRaw) || "upload";
  const extFromMime = mimeToExtension.get(input.mimeType);
  const ext = extFromMime ?? extensionFromName(input.originalName) ?? "jpg";
  return `${baseName}-${randomUUID()}.${ext}`;
}

function resolveTargetPath(folder?: string): { absoluteDir: string; publicPrefix: string } {
  const uploadSubPath = resolveUploadSubPath(folder);
  const absoluteDir = path.join(process.cwd(), "public", uploadSubPath);
  const publicPrefix = `/${uploadSubPath.replace(/\\/g, "/")}`;

  return { absoluteDir, publicPrefix };
}

export async function saveImageToLocalStorage(input: SaveImageInput): Promise<string> {
  const { absoluteDir, publicPrefix } = resolveTargetPath(input.folder);
  await mkdir(absoluteDir, { recursive: true });

  const finalName = createFinalName(input);
  const absolutePath = path.join(absoluteDir, finalName);

  await writeFile(absolutePath, Buffer.from(input.arrayBuffer));

  return `${publicPrefix}/${finalName}`;
}

export async function saveImageToBlobStorage(input: SaveImageInput): Promise<string> {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing.");
  }

  const uploadSubPath = resolveUploadSubPath(input.folder).replace(/\\/g, "/");
  const finalName = createFinalName(input);
  const blobPath = `${uploadSubPath}/${finalName}`;

  const blob = await put(blobPath, Buffer.from(input.arrayBuffer), {
    access: "public",
    addRandomSuffix: false,
    contentType: input.mimeType,
    token: BLOB_READ_WRITE_TOKEN
  });

  return blob.url;
}

export async function saveImage(input: SaveImageInput): Promise<string> {
  const provider = resolveStorageProvider();

  if (provider === "vercel-blob") {
    return saveImageToBlobStorage(input);
  }

  if (IS_VERCEL_RUNTIME) {
    throw new Error("Local uploads are not supported on Vercel. Configure BLOB_READ_WRITE_TOKEN.");
  }

  return saveImageToLocalStorage(input);
}
