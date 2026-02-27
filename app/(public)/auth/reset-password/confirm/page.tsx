import { ResetPasswordConfirmForm } from "@/components/forms/reset-password-confirm-form";

interface ResetPasswordConfirmPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordConfirmPage({ searchParams }: ResetPasswordConfirmPageProps) {
  const resolved = await searchParams;
  const token = resolved.token ?? "";

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell">
        <article className="mx-auto w-full max-w-xl rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-ink">تعيين كلمة مرور جديدة</h1>
          <p className="mb-6 max-w-prose text-base leading-relaxed text-subtext">
            أدخل كلمة مرور جديدة للحساب المرتبط بالرابط الذي استلمته عبر البريد.
          </p>
          <ResetPasswordConfirmForm token={token} />
        </article>
      </div>
    </section>
  );
}
