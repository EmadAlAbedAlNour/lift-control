"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { parseApiResponse } from "@/lib/utils/client-api";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      phone: formData.get("phone")
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    try {
      await parseApiResponse<{ user: unknown }>(response, "فشل إنشاء الحساب.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "فشل إنشاء الحساب.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink" htmlFor="name">
          الاسم الكامل
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="input-field"
          placeholder="أدخل الاسم"
        />
      </div>
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
        <label className="block text-sm font-medium text-ink" htmlFor="phone">
          رقم الجوال
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          className="input-field"
          placeholder="05xxxxxxxx"
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
          minLength={8}
          className="input-field"
          placeholder="8 أحرف على الأقل"
        />
      </div>
      {error ? <p className="alert-error">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
      </button>
    </form>
  );
}
