import { PROJECT_STATUS_LABELS_AR } from "@/lib/constants/projects";
import { ProjectStatus } from "@/lib/types";

const statusMap: Record<
  ProjectStatus,
  {
    label: string;
    styles: string;
  }
> = {
  new: {
    label: PROJECT_STATUS_LABELS_AR.new,
    styles: "bg-primary-soft text-primary"
  },
  planned: {
    label: PROJECT_STATUS_LABELS_AR.planned,
    styles: "bg-warning-soft text-warning-text"
  },
  in_progress: {
    label: PROJECT_STATUS_LABELS_AR.in_progress,
    styles: "bg-progress-soft text-progress-text"
  },
  completed: {
    label: PROJECT_STATUS_LABELS_AR.completed,
    styles: "bg-complete-soft text-complete-text"
  }
};

interface StatusPillProps {
  status: ProjectStatus;
}

export function StatusPill({ status }: StatusPillProps) {
  const item = statusMap[status];

  return (
    <span
      className={`inline-flex min-h-11 items-center rounded-md px-3 py-1 text-sm font-semibold ${item.styles}`}
    >
      {item.label}
    </span>
  );
}