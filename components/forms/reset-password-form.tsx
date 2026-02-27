"use client";

import { FormEvent, useState } from "react";

export function ResetPasswordForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: formData.get("email")
      })
    });

    setLoading(false);
    setStatus(response.ok ? "success" : "error");
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink" htmlFor="email">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input-field"
          placeholder="name@company.com"
        />
      </div>

      {status === "success" ? (
        <p className="alert-success">
          إذا كان البريد موجودا فسيتم إرسال رابط إعادة التعيين.
        </p>
      ) : null}

      {status === "error" ? (
        <p className="alert-error">
          تعذر تنفيذ الطلب حاليا. حاول مرة أخرى.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
      </button>
    </form>
  );
}
