import { LiftProject } from "@/lib/types";

export const PROJECT_STATUS_VALUES = ["new", "planned", "in_progress", "completed"] as const;
export const PROJECT_TYPE_VALUES = ["passenger", "cargo", "panoramic", "hospital"] as const;

export const PROJECT_STATUS_LABELS_AR: Record<LiftProject["status"], string> = {
  new: "جديد",
  planned: "مجدول",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل"
};

export const PROJECT_TYPE_LABELS_SHORT_AR: Record<LiftProject["type"], string> = {
  passenger: "ركاب",
  cargo: "بضائع",
  panoramic: "بانورامي",
  hospital: "طبي"
};

export const PROJECT_TYPE_LABELS_LONG_AR: Record<LiftProject["type"], string> = {
  passenger: "مصاعد ركاب",
  cargo: "مصاعد بضائع",
  panoramic: "مصاعد بانورامية",
  hospital: "مصاعد طبية"
};

export const PROJECT_STATUS_OPTIONS_AR: Array<{ value: LiftProject["status"]; label: string }> = [
  { value: "new", label: "جديد" },
  { value: "planned", label: "مجدول" },
  { value: "in_progress", label: "قيد التنفيذ" },
  { value: "completed", label: "مكتمل" }
];

export const PROJECT_TYPE_OPTIONS_AR: Array<{ value: LiftProject["type"]; label: string }> = [
  { value: "passenger", label: "ركاب" },
  { value: "cargo", label: "بضائع" },
  { value: "panoramic", label: "بانورامي" },
  { value: "hospital", label: "طبي" }
];
