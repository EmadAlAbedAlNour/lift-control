import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell">
        <article className="mx-auto w-full max-w-xl rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-ink">تسجيل الدخول</h1>
          <p className="mb-6 max-w-prose text-base leading-relaxed text-subtext">
            ادخل إلى لوحة إدارة المشاريع والإشعارات والإعدادات. يمكنك تسجيل الدخول بالبريد وكلمة المرور.
          </p>
          <LoginForm />
          <div className="mt-6 space-y-2 text-sm text-subtext">
            <p>
              نسيت كلمة المرور؟
              <Link className="me-2 font-semibold text-primary" href="/auth/reset-password">
                استعادة كلمة المرور
              </Link>
            </p>
            <p>
              تسجيل اجتماعي (Google / GitHub) متاح في التكاملات القادمة.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
