import { PROJECT_STATUS_VALUES, PROJECT_TYPE_VALUES } from "@/lib/constants/projects";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { db } from "@/lib/db";
import { LiftProject as LiftProjectView, ProjectStatus as AppProjectStatus } from "@/lib/types";
import { ensureImageUrl } from "@/lib/utils/image";
import { toUtcDateFromDateKey } from "@/lib/utils/date";

import { mapProject, statusToDb, typeToDb } from "@/lib/data-access/shared";

export async function getAllContent(): Promise<LiftProjectView[]> {
  const projects = await db.liftProject.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return projects.map(mapProject);
}

export async function searchContent(query: { q?: string; status?: string; type?: string }): Promise<LiftProjectView[]> {
  const q = query.q?.trim().toLowerCase() ?? "";
  const status = query.status ?? "all";
  const type = query.type ?? "all";
  const statusFilter =
    status === "all" || !PROJECT_STATUS_VALUES.includes(status as AppProjectStatus)
      ? undefined
      : statusToDb[status as AppProjectStatus];
  const typeFilter =
    type === "all" || !PROJECT_TYPE_VALUES.includes(type as LiftProjectView["type"])
      ? undefined
      : typeToDb[type as LiftProjectView["type"]];

  const projects = await db.liftProject.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { location: { contains: q } },
              { clientName: { contains: q } }
            ]
          }
        : {})
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return projects.map(mapProject);
}

export async function getContentById(id: string): Promise<LiftProjectView | undefined> {
  const project = await db.liftProject.findUnique({ where: { id } });
  return project ? mapProject(project) : undefined;
}

export async function createContent(input: Omit<LiftProjectView, "id" | "createdAt">): Promise<LiftProjectView> {
  const created = await db.liftProject.create({
    data: {
      title: input.title,
      location: input.location,
      clientName: input.clientName,
      type: typeToDb[input.type],
      floors: input.floors,
      status: statusToDb[input.status],
      nextVisit: toUtcDateFromDateKey(input.nextVisit),
      summary: input.summary,
      speedMps: input.specs.speedMps,
      loadKg: input.specs.loadKg,
      warrantyMonths: input.specs.warrantyMonths,
      coverImage: ensureImageUrl(input.coverImage, DEFAULT_IMAGE_URLS.project)
    }
  });

  return mapProject(created);
}

export async function updateContent(
  id: string,
  updates: Partial<Omit<LiftProjectView, "id" | "createdAt">>
): Promise<LiftProjectView | undefined> {
  const current = await db.liftProject.findUnique({ where: { id } });

  if (!current) {
    return undefined;
  }

  const updated = await db.liftProject.update({
    where: { id },
    data: {
      ...(updates.title !== undefined ? { title: updates.title } : {}),
      ...(updates.location !== undefined ? { location: updates.location } : {}),
      ...(updates.clientName !== undefined ? { clientName: updates.clientName } : {}),
      ...(updates.type !== undefined ? { type: typeToDb[updates.type] } : {}),
      ...(updates.floors !== undefined ? { floors: updates.floors } : {}),
      ...(updates.status !== undefined ? { status: statusToDb[updates.status] } : {}),
      ...(updates.nextVisit !== undefined ? { nextVisit: toUtcDateFromDateKey(updates.nextVisit) } : {}),
      ...(updates.summary !== undefined ? { summary: updates.summary } : {}),
      ...(updates.coverImage !== undefined
        ? { coverImage: ensureImageUrl(updates.coverImage, DEFAULT_IMAGE_URLS.project) }
        : {}),
      ...(updates.specs
        ? {
            speedMps: updates.specs.speedMps,
            loadKg: updates.specs.loadKg,
            warrantyMonths: updates.specs.warrantyMonths
          }
        : {})
    }
  });

  return mapProject(updated);
}

export async function deleteContent(id: string): Promise<boolean> {
  try {
    await db.liftProject.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
