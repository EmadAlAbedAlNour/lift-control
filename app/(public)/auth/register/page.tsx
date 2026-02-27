import Link from "next/link";

import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell">
        <article className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-ink">تسجيل حساب جديد</h1>
          <p className="mb-6 max-w-prose text-base leading-relaxed text-subtext">
            أنشئ حسابا للشركة أو للفريق التقني للوصول إلى إدارة المحتوى، التقارير، ومتابعة حالات المصاعد.
          </p>
          <RegisterForm />
          <p className="mt-6 text-sm text-subtext">
            لديك حساب بالفعل؟
            <Link className="me-2 font-semibold text-primary" href="/auth/login">
              الدخول الآن
            </Link>
          </p>
        </article>
      </div>
    </section>
  );
}
