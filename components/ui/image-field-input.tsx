"use client";

import { useMemo, useRef, useState } from "react";
import { ImageOff, Upload } from "lucide-react";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import type { ImagePlaceholderKind } from "@/components/ui/image-with-fallback";
import { parseApiResponse } from "@/lib/utils/client-api";
import { isPlaceholderImageValue } from "@/lib/utils/image";

interface ImageFieldInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  scope?: string;
  inputClassName?: string;
  placeholderKind?: ImagePlaceholderKind;
}

type UploadNotice =
  | {
      type: "error" | "success";
      message: string;
    }
  | null;

function parseErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function ImageFieldInput({
  id,
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "https://example.com/image.jpg أو /uploads/...",
  scope,
  inputClassName = "input-field bg-page",
  placeholderKind = "generic"
}: ImageFieldInputProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<UploadNotice>(null);
  const displayValue = useMemo(() => (isPlaceholderImageValue(value) ? "" : value), [value]);
  const hasImageValue = displayValue.trim().length > 0;

  async function uploadSelectedFile(file: File) {
    setBusy(true);
    setNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      if (scope && scope.trim().length > 0) {
        formData.append("scope", scope.trim());
      }

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData
      });
      const payload = await parseApiResponse<{ url?: string }>(response, "تعذر رفع الصورة.");

      const nextUrl = payload.url;

      if (!nextUrl) {
        throw new Error("تم رفع الصورة ولكن لم يتم إرجاع رابط صالح.");
      }

      onChange(nextUrl);
      setNotice({ type: "success", message: "تم رفع الصورة وتحديث الرابط." });
    } catch (error) {
      setNotice({ type: "error", message: parseErrorMessage(error, "تعذر رفع الصورة.") });
    } finally {
      setBusy(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-ink" htmlFor={id}>
        {label}
      </label>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          id={id}
          type="text"
          value={displayValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${inputClassName} disabled:bg-muted`}
        />

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(event) => {
              const selected = event.target.files?.[0];

              if (!selected) {
                return;
              }

              void uploadSelectedFile(selected);
            }}
            disabled={disabled || busy}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || busy}
            className="btn-secondary h-11 w-full px-4 py-2 sm:w-auto"
          >
            <span className="inline-flex items-center gap-2">
              <Upload className="h-4 w-4" aria-hidden />
              {busy ? "جاري الرفع..." : "رفع من الجهاز"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled || busy || !hasImageValue}
            className="btn-secondary h-11 w-full px-4 py-2 disabled:opacity-60 sm:w-auto"
          >
            <span className="inline-flex items-center gap-2">
              <ImageOff className="h-4 w-4" aria-hidden />
              إزالة
            </span>
          </button>
        </div>
      </div>

      {notice ? (
        <p className={notice.type === "success" ? "text-xs text-success-text" : "text-xs text-danger-text"}>{notice.message}</p>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border bg-page">
        <ImageWithFallback
          src={value}
          alt="معاينة الصورة"
          width={1200}
          height={700}
          className="h-44 w-full object-cover"
          kind={placeholderKind}
          placeholderClassName="bg-surface text-subtext"
        />
      </div>
    </div>
  );
}
