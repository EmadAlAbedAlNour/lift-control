"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { parseApiResponse } from "@/lib/utils/client-api";

interface ResetPasswordConfirmFormProps {
  token: string;
}

export function ResetPasswordConfirmForm({ token }: ResetPasswordConfirmFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setStatus("error");
      setErrorMessage("الرابط غير صالح.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("تأكيد كلمة المرور غير مطابق.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    const response = await fetch("/api/auth/reset-password/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token,
        password
      })
    });

    try {
      await parseApiResponse<{ message: string }>(response, "تعذر تحديث كلمة المرور.");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "تعذر تحديث كلمة المرور.");
      setLoading(false);
      return;
    }

    setStatus("success");
    setLoading(false);
  }

  if (token.length === 0) {
    return (
      <p className="alert-error">
        الرابط غير صالح. اطلب رابطا جديدا من صفحة الاستعادة.
      </p>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink" htmlFor="password">
          كلمة المرور الجديدة
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="input-field"
          placeholder="8 أحرف على الأقل"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink" htmlFor="confirmPassword">
          تأكيد كلمة المرور
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="input-field"
          placeholder="أعد كتابة كلمة المرور"
        />
      </div>

      {status === "error" ? (
        <p className="alert-error">{errorMessage}</p>
      ) : null}

      {status === "success" ? <p className="alert-success">تم تحديث كلمة المرور بنجاح.</p> : null}

      <button
        type="submit"
        disabled={loading || status === "success"}
        className="btn-primary w-full"
      >
        {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
      </button>

      {status === "success" ? (
        <Link className="btn-secondary bg-page" href="/auth/login">
          الانتقال إلى تسجيل الدخول
        </Link>
      ) : null}
    </form>
  );
}
