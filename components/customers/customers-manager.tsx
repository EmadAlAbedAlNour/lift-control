"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { INPUT_FIELD_CLASS } from "@/lib/constants/ui";
import { Customer } from "@/lib/types";
import { parseApiResponse } from "@/lib/utils/client-api";
import { parseDateKey } from "@/lib/utils/date";

export interface CustomerWithInsight extends Customer {
  projects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  dueSoonProjects: number;
  latestVisit?: string;
}

interface CustomersManagerProps {
  initialCustomers: CustomerWithInsight[];
}

type CustomerFilter = "all" | "active" | "inactive" | "with_projects" | "needs_attention";
type CustomerSort = "projects_desc" | "latest_desc" | "name_asc" | "risk_desc";
type CustomerView = "cards" | "rows";

type Notice = {
  type: "success" | "error";
  text: string;
};

type CustomerDraft = {
  name: string;
  email: string;
  phone: string;
  location: string;
  notes: string;
  isActive: boolean;
};

const numberFormatter = new Intl.NumberFormat("ar-SA");
const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

const fieldClass = INPUT_FIELD_CLASS;

function emptyDraft(): CustomerDraft {
  return {
    name: "",
    email: "",
    phone: "",
    location: "",
    notes: "",
    isActive: true
  };
}

function draftFromCustomer(customer: CustomerWithInsight): CustomerDraft {
  return {
    name: customer.name,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    location: customer.location ?? "",
    notes: customer.notes ?? "",
    isActive: customer.isActive
  };
}

function riskScore(customer: CustomerWithInsight): number {
  return customer.overdueProjects * 2 + customer.dueSoonProjects;
}

function completionRate(customer: CustomerWithInsight): number {
  if (customer.projects === 0) {
    return 0;
  }

  return Math.round((customer.completedProjects / customer.projects) * 100);
}

function formatDate(dateKey?: string): string {
  if (!dateKey) {
    return "--";
  }

  const date = parseDateKey(dateKey);
  return dateFormatter.format(date);
}

function withEmptyInsights(customer: Customer): CustomerWithInsight {
  return {
    ...customer,
    projects: 0,
    activeProjects: 0,
    completedProjects: 0,
    overdueProjects: 0,
    dueSoonProjects: 0,
    latestVisit: undefined
  };
}

export function CustomersManager({ initialCustomers }: CustomersManagerProps) {
  const [customers, setCustomers] = useState<CustomerWithInsight[]>(initialCustomers);
  const [draft, setDraft] = useState<CustomerDraft>(emptyDraft());
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [sort, setSort] = useState<CustomerSort>("projects_desc");
  const [view, setView] = useState<CustomerView>("cards");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const totals = useMemo(() => {
    const totalProjects = customers.reduce((acc, item) => acc + item.projects, 0);
    const activeCustomers = customers.filter((item) => item.isActive).length;
    const needsAttention = customers.filter((item) => item.overdueProjects > 0 || item.dueSoonProjects > 0).length;
    const withProjects = customers.filter((item) => item.projects > 0).length;

    return {
      totalProjects,
      activeCustomers,
      needsAttention,
      withProjects
    };
  }, [customers]);

  const visibleCustomers = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    const filtered = customers.filter((item) => {
      const matchesSearch =
        normalized.length === 0
          ? true
          : item.name.toLowerCase().includes(normalized) ||
            (item.location ?? "").toLowerCase().includes(normalized) ||
            (item.phone ?? "").toLowerCase().includes(normalized) ||
            (item.email ?? "").toLowerCase().includes(normalized);

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "active"
            ? item.isActive
            : filter === "inactive"
              ? !item.isActive
              : filter === "with_projects"
                ? item.projects > 0
                : item.overdueProjects > 0 || item.dueSoonProjects > 0;

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      if (sort === "projects_desc") {
        return b.projects - a.projects || a.name.localeCompare(b.name);
      }

      if (sort === "latest_desc") {
        return (b.latestVisit ?? "").localeCompare(a.latestVisit ?? "") || a.name.localeCompare(b.name);
      }

      if (sort === "name_asc") {
        return a.name.localeCompare(b.name);
      }

      return riskScore(b) - riskScore(a) || b.projects - a.projects;
    });
  }, [customers, filter, search, sort]);

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
    setEditingCustomerId(null);
    setDraft(emptyDraft());
  }

  function beginEdit(customer: CustomerWithInsight) {
    setEditingCustomerId(customer.id);
    setDraft(draftFromCustomer(customer));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildPayload() {
    const payload: Record<string, unknown> = {
      name: draft.name.trim(),
      isActive: draft.isActive
    };
    const email = draft.email.trim();
    const phone = draft.phone.trim();
    const location = draft.location.trim();
    const notes = draft.notes.trim();

    if (email.length > 0) {
      payload.email = email;
    }

    if (phone.length > 0) {
      payload.phone = phone;
    }

    if (location.length > 0) {
      payload.location = location;
    }

    if (notes.length > 0) {
      payload.notes = notes;
    }

    return payload;
  }

  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyKey("customer-save");

    try {
      const response = await fetch(editingCustomerId ? `/api/customers/${editingCustomerId}` : "/api/customers", {
        method: editingCustomerId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload())
      });

      const saved = await parseApiResponse<Customer>(response);

      setCustomers((current) => {
        if (editingCustomerId) {
          const previous = current.find((item) => item.id === saved.id);

          return current.map((item) =>
            item.id === saved.id
              ? {
                  ...(previous ? item : withEmptyInsights(saved)),
                  ...saved
                }
              : item
          );
        }

        return [withEmptyInsights(saved), ...current];
      });

      showNotice("success", editingCustomerId ? "تم تحديث بيانات العميل." : "تمت إضافة العميل.");
      resetForm();
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "تعذر حفظ بيانات العميل.");
    } finally {
      setBusyKey(null);
    }
  }

  async function removeCustomer(customer: CustomerWithInsight) {
    if (customer.projects > 0) {
      showNotice("error", "لا يمكن حذف عميل مرتبط بمشاريع. عدل الاسم أو أغلق المشاريع أولا.");
      return;
    }

    if (!window.confirm(`هل تريد حذف العميل "${customer.name}"؟`)) {
      return;
    }

    setBusyKey(`customer-delete-${customer.id}`);

    try {
      const response = await fetch(`/api/customers/${customer.id}`, { method: "DELETE" });
      await parseApiResponse<{ id: string; deleted: boolean }>(response);
      setCustomers((current) => current.filter((item) => item.id !== customer.id));

      if (editingCustomerId === customer.id) {
        resetForm();
      }

      showNotice("success", "تم حذف العميل.");
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "تعذر حذف العميل.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {notice ? <div className={notice.type === "success" ? "alert-success" : "alert-error"}>{notice.text}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">إجمالي العملاء</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{numberFormatter.format(customers.length)}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">عملاء نشطون</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{numberFormatter.format(totals.activeCustomers)}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">عملاء لديهم مشاريع</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{numberFormatter.format(totals.withProjects)}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">إجمالي المشاريع المرتبطة</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{numberFormatter.format(totals.totalProjects)}</p>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              {editingCustomerId ? "تعديل عميل" : "إضافة عميل جديد"}
            </h2>
            <p className="mt-1 text-sm text-subtext">إدارة بيانات العملاء مع ربط واضح بمؤشرات المشاريع.</p>
          </div>

          <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveCustomer}>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-ink" htmlFor="customer-name">
                اسم العميل
              </label>
              <input
                id="customer-name"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                required
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="customer-phone">
                رقم الهاتف
              </label>
              <input
                id="customer-phone"
                value={draft.phone}
                onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                placeholder="+966..."
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="customer-email">
                البريد الإلكتروني
              </label>
              <input
                id="customer-email"
                type="email"
                value={draft.email}
                onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                className={fieldClass}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-ink" htmlFor="customer-location">
                الموقع
              </label>
              <input
                id="customer-location"
                value={draft.location}
                onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
                className={fieldClass}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-ink" htmlFor="customer-notes">
                ملاحظات
              </label>
              <textarea
                id="customer-notes"
                rows={3}
                value={draft.notes}
                onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                className="w-full rounded-md border border-border bg-page px-4 py-3 text-base text-ink focus:border-primary focus:outline-none"
              />
            </div>

            <label className="sm:col-span-2 flex items-center gap-3 rounded-md border border-border bg-page px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))}
              />
              <span className="font-medium text-ink">العميل نشط</span>
            </label>

            <button type="submit" disabled={busyKey === "customer-save"} className="btn-primary sm:col-span-2">
              {busyKey === "customer-save" ? "جاري الحفظ..." : editingCustomerId ? "حفظ التعديلات" : "إضافة العميل"}
            </button>

            {editingCustomerId ? (
              <button type="button" onClick={resetForm} className="btn-secondary bg-white sm:col-span-2">
                إلغاء التعديل
              </button>
            ) : null}
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-ink">قائمة العملاء</h2>
              <p className="text-sm text-subtext">بحث وتصفية وفرز مع تحكم كامل بالتعديل والحذف.</p>
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
              <label className="text-sm font-medium text-ink" htmlFor="customers-search">
                بحث
              </label>
              <input
                id="customers-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم أو الموقع أو الهاتف"
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="customers-filter">
                فلترة
              </label>
              <select
                id="customers-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value as CustomerFilter)}
                className={fieldClass}
              >
                <option value="all">كل العملاء</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="with_projects">لديهم مشاريع</option>
                <option value="needs_attention">يتطلب متابعة</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="customers-sort">
                ترتيب
              </label>
              <select
                id="customers-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as CustomerSort)}
                className={fieldClass}
              >
                <option value="projects_desc">الأكثر مشاريع</option>
                <option value="latest_desc">أحدث زيارة</option>
                <option value="risk_desc">الأعلى خطورة</option>
                <option value="name_asc">الاسم أبجديًا</option>
              </select>
            </div>
          </div>

          {visibleCustomers.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-subtext">
              لا توجد نتائج مطابقة للفلاتر الحالية.
            </p>
          ) : view === "cards" ? (
            <div className="space-y-3">
              {visibleCustomers.map((item) => {
                const risk = riskScore(item);
                const rate = completionRate(item);
                const isDeleteBusy = busyKey === `customer-delete-${item.id}`;

                return (
                  <article key={item.id} className="rounded-lg border border-border bg-surface-soft p-4">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-ink">{item.name}</h3>
                        <p className="text-sm text-subtext">{item.location ?? "بدون موقع محدد"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            item.isActive ? "bg-success-soft text-success-text" : "bg-muted text-subtext"
                          }`}
                        >
                          {item.isActive ? "نشط" : "غير نشط"}
                        </span>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            risk > 0 ? "bg-warning-soft text-warning-text" : "bg-success-soft text-success-text"
                          }`}
                        >
                          {risk > 0 ? "تحتاج متابعة" : "مستقرة"}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3 grid gap-2 text-sm sm:grid-cols-2">
                      <p>
                        <span className="font-medium text-ink">الهاتف:</span> {item.phone ?? "--"}
                      </p>
                      <p>
                        <span className="font-medium text-ink">البريد:</span> {item.email ?? "--"}
                      </p>
                      <p>
                        <span className="font-medium text-ink">المشاريع:</span> {numberFormatter.format(item.projects)}
                      </p>
                      <p>
                        <span className="font-medium text-ink">آخر زيارة:</span> {formatDate(item.latestVisit)}
                      </p>
                    </div>

                    <div className="mb-2 flex items-center justify-between text-xs text-subtext">
                      <span>نسبة الإنجاز</span>
                      <span>{numberFormatter.format(rate)}%</span>
                    </div>
                    <div className="mb-4 h-2 overflow-hidden rounded-full bg-page">
                      <div className="h-full bg-primary" style={{ width: `${rate}%` }} aria-hidden />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => beginEdit(item)} className="btn-secondary bg-white px-4 py-2">
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomer(item)}
                        disabled={isDeleteBusy || item.projects > 0}
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
              {visibleCustomers.map((item) => {
                const risk = riskScore(item);
                const isDeleteBusy = busyKey === `customer-delete-${item.id}`;

                return (
                  <article
                    key={item.id}
                    className="grid gap-3 rounded-lg border border-border bg-surface-soft p-4 text-sm sm:grid-cols-2 xl:grid-cols-8"
                  >
                    <p>
                      <span className="font-medium text-ink">العميل:</span> {item.name}
                    </p>
                    <p>
                      <span className="font-medium text-ink">الحالة:</span> {item.isActive ? "نشط" : "غير نشط"}
                    </p>
                    <p>
                      <span className="font-medium text-ink">المشاريع:</span> {numberFormatter.format(item.projects)}
                    </p>
                    <p>
                      <span className="font-medium text-ink">النشطة:</span> {numberFormatter.format(item.activeProjects)}
                    </p>
                    <p>
                      <span className="font-medium text-ink">المكتملة:</span> {numberFormatter.format(item.completedProjects)}
                    </p>
                    <p>
                      <span className="font-medium text-ink">آخر زيارة:</span> {formatDate(item.latestVisit)}
                    </p>
                    <p>
                      <span className="font-medium text-ink">المخاطر:</span>{" "}
                      <span className={risk > 0 ? "text-warning-text" : "text-success-text"}>
                        {risk > 0 ? `${numberFormatter.format(risk)} نقطة` : "منخفضة"}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => beginEdit(item)} className="btn-secondary bg-white px-3 py-2">
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomer(item)}
                        disabled={isDeleteBusy || item.projects > 0}
                        className="btn-danger"
                      >
                        {isDeleteBusy ? "جاري..." : "حذف"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <p className="text-sm text-subtext">
          يتطلب متابعة: {numberFormatter.format(totals.needsAttention)} عميل | لا يمكن حذف عميل مرتبط بمشاريع قبل
          معالجة المشاريع المرتبطة.
        </p>
      </section>
    </div>
  );
}
