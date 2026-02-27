"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { parseApiResponse } from "@/lib/utils/client-api";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: formData.get("email"),
      password: formData.get("password")
    };

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    try {
      await parseApiResponse<{ user: unknown }>(response, "فشل تسجيل الدخول.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل تسجيل الدخول.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink" htmlFor="password">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="input-field"
          placeholder="********"
        />
      </div>
      {error ? <p className="alert-error">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "جاري التحقق..." : "تسجيل الدخول"}
      </button>
    </form>
  );
}
