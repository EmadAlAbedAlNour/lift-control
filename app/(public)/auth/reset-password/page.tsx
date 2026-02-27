import Link from "next/link";

import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell">
        <article className="mx-auto w-full max-w-xl rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-ink">استعادة كلمة المرور</h1>
          <p className="mb-6 max-w-prose text-base leading-relaxed text-subtext">
            أدخل البريد الإلكتروني المرتبط بحسابك لإرسال رابط إعادة تعيين كلمة المرور.
          </p>
          <ResetPasswordForm />
          <p className="mt-6 text-sm text-subtext">
            تذكرت كلمة المرور؟
            <Link className="me-2 font-semibold text-primary" href="/auth/login">
              العودة لتسجيل الدخول
            </Link>
          </p>
        </article>
      </div>
    </section>
  );
}
