"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { ImageFieldInput } from "@/components/ui/image-field-input";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { INPUT_FIELD_CLASS } from "@/lib/constants/ui";
import { PlatformUser, UserRole } from "@/lib/types";
import { parseApiResponse } from "@/lib/utils/client-api";
import { parseDateKey } from "@/lib/utils/date";
import { ensureImageUrl } from "@/lib/utils/image";

interface EmployeesManagerProps {
  employees: PlatformUser[];
  currentUserId: string;
}

type EmployeeSort = "newest" | "oldest" | "name_asc" | "role";
type EmployeeView = "cards" | "rows";
type RoleFilter = "all" | UserRole;

type Notice = {
  type: "success" | "error";
  text: string;
};

type EmployeeDraft = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
  avatarUrl: string;
};

const roleLabels: Record<UserRole, string> = {
  admin: "مدير",
  supervisor: "مشرف",
  user: "موظف"
};

const roleBadgeClasses: Record<UserRole, string> = {
  admin: "bg-primary-soft text-primary",
  supervisor: "bg-warning-soft text-warning-text",
  user: "bg-surface text-subtext"
};

const roleSortOrder: Record<UserRole, number> = {
  admin: 1,
  supervisor: 2,
  user: 3
};

const numberFormatter = new Intl.NumberFormat("ar-SA");
const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

const fieldClass = INPUT_FIELD_CLASS;

function emptyDraft(): EmployeeDraft {
  return {
    name: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
    avatarUrl: DEFAULT_IMAGE_URLS.employeeAvatar
  };
}

function draftFromEmployee(employee: PlatformUser): EmployeeDraft {
  return {
    name: employee.name,
    email: employee.email,
    phone: employee.phone ?? "",
    role: employee.role,
    password: "",
    avatarUrl: ensureImageUrl(employee.avatarUrl, DEFAULT_IMAGE_URLS.employeeAvatar)
  };
}

function formatDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return dateFormatter.format(date);
}

export function EmployeesManager({ employees, currentUserId }: EmployeesManagerProps) {
  const [items, setItems] = useState<PlatformUser[]>(employees);
  const [draft, setDraft] = useState<EmployeeDraft>(emptyDraft());
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sort, setSort] = useState<EmployeeSort>("newest");
  const [view, setView] = useState<EmployeeView>("cards");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const stats = useMemo(() => {
    const admins = items.filter((item) => item.role === "admin").length;
    const supervisors = items.filter((item) => item.role === "supervisor").length;
    const staff = items.filter((item) => item.role === "user").length;

    return {
      admins,
      supervisors,
      staff
    };
  }, [items]);

  const visibleEmployees = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    const filtered = items.filter((item) => {
      const matchesSearch =
        normalized.length === 0
          ? true
          : item.name.toLowerCase().includes(normalized) ||
            item.email.toLowerCase().includes(normalized) ||
            (item.phone ?? "").toLowerCase().includes(normalized);
      const matchesRole = roleFilter === "all" ? true : item.role === roleFilter;

      return matchesSearch && matchesRole;
    });

    return filtered.sort((a, b) => {
      if (sort === "newest") {
        return b.createdAt.localeCompare(a.createdAt);
      }

      if (sort === "oldest") {
        return a.createdAt.localeCompare(b.createdAt);
      }

      if (sort === "name_asc") {
        return a.name.localeCompare(b.name);
      }

      return roleSortOrder[a.role] - roleSortOrder[b.role] || a.name.localeCompare(b.name);
    });
  }, [items, roleFilter, search, sort]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timeout);
  }, [notice]);

  function showNotice(type: Notice["type"], text: string) {
    setNotice({ type, text });
  }

  function resetForm() {
    setEditingEmployeeId(null);
    setDraft(emptyDraft());
  }

  function beginEdit(employee: PlatformUser) {
    setEditingEmployeeId(employee.id);
    setDraft(draftFromEmployee(employee));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildCreatePayload() {
    return {
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      role: draft.role,
      password: draft.password,
      avatarUrl: ensureImageUrl(draft.avatarUrl, DEFAULT_IMAGE_URLS.employeeAvatar)
    };
  }

  function buildUpdatePayload() {
    const payload: Record<string, unknown> = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      role: draft.role,
      avatarUrl: ensureImageUrl(draft.avatarUrl, DEFAULT_IMAGE_URLS.employeeAvatar)
    };

    if (draft.password.trim().length > 0) {
      payload.password = draft.password;
    }

    return payload;
  }

  async function saveEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyKey("employee-save");

    try {
      const response = await fetch(editingEmployeeId ? `/api/users/${editingEmployeeId}` : "/api/users", {
        method: editingEmployeeId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEmployeeId ? buildUpdatePayload() : buildCreatePayload())
      });

      const saved = await parseApiResponse<PlatformUser>(response);

      setItems((current) =>
        editingEmployeeId ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current]
      );

      showNotice("success", editingEmployeeId ? "تم تحديث بيانات الموظف." : "تمت إضافة الموظف.");
      resetForm();
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "تعذر حفظ بيانات الموظف.");
    } finally {
      setBusyKey(null);
    }
  }

  async function removeEmployee(employee: PlatformUser) {
    if (employee.id === currentUserId) {
      showNotice("error", "لا يمكن حذف حسابك الحالي.");
      return;
    }

    if (!window.confirm(`هل تريد حذف الموظف "${employee.name}"؟`)) {
      return;
    }

    setBusyKey(`employee-delete-${employee.id}`);

    try {
      const response = await fetch(`/api/users/${employee.id}`, { method: "DELETE" });
      await parseApiResponse<{ id: string; deleted: boolean }>(response);
      setItems((current) => current.filter((item) => item.id !== employee.id));

      if (editingEmployeeId === employee.id) {
        resetForm();
      }

      showNotice("success", "تم حذف الموظف.");
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "تعذر حذف الموظف.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {notice ? <div className={notice.type === "success" ? "alert-success" : "alert-error"}>{notice.text}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">إجمالي الأعضاء</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{numberFormatter.format(items.length)}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">المديرون</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{numberFormatter.format(stats.admins)}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">المشرفون</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{numberFormatter.format(stats.supervisors)}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">الموظفون</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{numberFormatter.format(stats.staff)}</p>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              {editingEmployeeId ? "تعديل موظف" : "إضافة موظف جديد"}
            </h2>
            <p className="mt-1 text-sm text-subtext">إدارة كاملة لحسابات الفريق والصلاحيات من مكان واحد.</p>
          </div>

          <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveEmployee}>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-ink" htmlFor="employee-name">
                الاسم
              </label>
              <input
                id="employee-name"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                required
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="employee-email">
                البريد الإلكتروني
              </label>
              <input
                id="employee-email"
                type="email"
                value={draft.email}
                onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                required
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="employee-phone">
                رقم الهاتف
              </label>
              <input
                id="employee-phone"
                value={draft.phone}
                onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                required
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="employee-role">
                الدور
              </label>
              <select
                id="employee-role"
                value={draft.role}
                onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value as UserRole }))}
                className={fieldClass}
              >
                <option value="user">موظف</option>
                <option value="supervisor">مشرف</option>
                <option value="admin">مدير</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="employee-password">
                {editingEmployeeId ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور"}
              </label>
              <input
                id="employee-password"
                type="password"
                value={draft.password}
                onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))}
                minLength={8}
                required={!editingEmployeeId}
                className={fieldClass}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <ImageFieldInput
                id="employee-avatar"
                label="الصورة الشخصية"
                value={draft.avatarUrl}
                onChange={(nextValue) => setDraft((current) => ({ ...current, avatarUrl: nextValue }))}
                scope="employees"
                placeholderKind="avatar"
              />
            </div>

            <button type="submit" disabled={busyKey === "employee-save"} className="btn-primary sm:col-span-2">
              {busyKey === "employee-save" ? "جاري الحفظ..." : editingEmployeeId ? "حفظ التعديلات" : "إضافة الموظف"}
            </button>

            {editingEmployeeId ? (
              <button type="button" onClick={resetForm} className="btn-secondary bg-white sm:col-span-2">
                إلغاء التعديل
              </button>
            ) : null}
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-ink">إدارة الفريق</h2>
              <p className="text-sm text-subtext">عرض احترافي قابل للتخصيص مع تعديل وحذف مباشر.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView("cards")}
                className={`rounded-md border px-4 py-2 text-sm font-medium ${
                  view === "cards" ? "border-primary bg-primary-soft text-primary" : "border-border bg-page text-subtext"
                }`}
              >
                بطاقات
              </button>
              <button
                type="button"
                onClick={() => setView("rows")}
                className={`rounded-md border px-4 py-2 text-sm font-medium ${
                  view === "rows" ? "border-primary bg-primary-soft text-primary" : "border-border bg-page text-subtext"
                }`}
              >
                جدول
              </button>
            </div>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-4">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-ink" htmlFor="employees-search">
                بحث
              </label>
              <input
                id="employees-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم أو البريد أو الهاتف"
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="employees-role">
                الدور
              </label>
              <select
                id="employees-role"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
                className={fieldClass}
              >
                <option value="all">كل الأدوار</option>
                <option value="admin">مدير</option>
                <option value="supervisor">مشرف</option>
                <option value="user">موظف</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="employees-sort">
                ترتيب
              </label>
              <select
                id="employees-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as EmployeeSort)}
                className={fieldClass}
              >
                <option value="newest">الأحدث انضمامًا</option>
                <option value="oldest">الأقدم انضمامًا</option>
                <option value="name_asc">الاسم أبجديًا</option>
                <option value="role">بحسب الدور</option>
              </select>
            </div>
          </div>

          {visibleEmployees.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-subtext">
              لا توجد نتائج مطابقة للبحث أو الفلاتر.
            </p>
          ) : view === "cards" ? (
            <div className="space-y-3">
              {visibleEmployees.map((employee) => {
                const isCurrentUser = employee.id === currentUserId;
                const isDeleteBusy = busyKey === `employee-delete-${employee.id}`;

                return (
                  <article key={employee.id} className="rounded-xl border border-border bg-surface-soft p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded-full border border-border bg-page">
                          <ImageWithFallback
                            src={ensureImageUrl(employee.avatarUrl, DEFAULT_IMAGE_URLS.employeeAvatar)}
                            alt={`صورة ${employee.name}`}
                            width={120}
                            height={120}
                            className="h-full w-full object-cover"
                            kind="avatar"
                            placeholderClassName="bg-surface-soft"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-ink">{employee.name}</h3>
                          <p className="text-sm text-subtext">{employee.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${roleBadgeClasses[employee.role]}`}>
                          {roleLabels[employee.role]}
                        </span>
                        {isCurrentUser ? (
                          <span className="rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">حسابك</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
                      <p>
                        <span className="font-medium text-ink">الهاتف:</span> {employee.phone ?? "--"}
                      </p>
                      <p>
                        <span className="font-medium text-ink">تاريخ الانضمام:</span> {formatDate(employee.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => beginEdit(employee)} className="btn-secondary bg-white px-4 py-2">
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEmployee(employee)}
                        disabled={isCurrentUser || isDeleteBusy}
                        className="btn-danger"
                      >
                        {isDeleteBusy ? "جاري الحذف..." : "حذف"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleEmployees.map((employee) => {
                const isCurrentUser = employee.id === currentUserId;
                const isDeleteBusy = busyKey === `employee-delete-${employee.id}`;

                return (
                  <article
                    key={employee.id}
                    className="grid gap-3 rounded-lg border border-border bg-surface-soft p-4 text-sm sm:grid-cols-2 xl:grid-cols-7"
                  >
                    <p>
                      <span className="font-medium text-ink">الاسم:</span> {employee.name}
                      {isCurrentUser ? <span className="mr-2 rounded bg-primary-soft px-2 py-0.5 text-xs text-primary">أنت</span> : null}
                    </p>
                    <p>
                      <span className="font-medium text-ink">البريد:</span> {employee.email}
                    </p>
                    <p>
                      <span className="font-medium text-ink">الهاتف:</span> {employee.phone ?? "--"}
                    </p>
                    <p>
                      <span className="font-medium text-ink">الدور:</span> {roleLabels[employee.role]}
                    </p>
                    <p>
                      <span className="font-medium text-ink">الانضمام:</span> {formatDate(employee.createdAt)}
                    </p>
                    <button type="button" onClick={() => beginEdit(employee)} className="btn-secondary bg-white px-3 py-2">
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEmployee(employee)}
                      disabled={isCurrentUser || isDeleteBusy}
                      className="btn-danger"
                    >
                      {isDeleteBusy ? "جاري..." : "حذف"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
