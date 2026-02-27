import { db } from "@/lib/db";
import { Customer as CustomerView } from "@/lib/types";

import {
  mapCustomer,
  toOptionalString
} from "@/lib/data-access/shared";

export async function listCustomers(): Promise<CustomerView[]> {
  const customers = await db.customer.findMany({
    orderBy: [{ createdAt: "desc" }, { name: "asc" }]
  });

  return customers.map(mapCustomer);
}

export async function getCustomerById(id: string): Promise<CustomerView | undefined> {
  const customer = await db.customer.findUnique({
    where: {
      id
    }
  });

  return customer ? mapCustomer(customer) : undefined;
}

export async function getCustomerNameById(id: string): Promise<string | null> {
  const customer = await db.customer.findUnique({
    where: {
      id
    },
    select: {
      name: true
    }
  });

  return customer?.name ?? null;
}

export async function countProjectsByClientName(clientName: string): Promise<number> {
  return db.liftProject.count({
    where: {
      clientName
    }
  });
}

export async function createCustomer(input: {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  notes?: string;
  isActive?: boolean;
}): Promise<CustomerView> {
  const created = await db.customer.create({
    data: {
      name: input.name.trim(),
      email: toOptionalString(input.email),
      phone: toOptionalString(input.phone),
      location: toOptionalString(input.location),
      notes: toOptionalString(input.notes),
      isActive: input.isActive ?? true
    }
  });

  return mapCustomer(created);
}

export async function updateCustomer(
  id: string,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    notes?: string;
    isActive?: boolean;
  }
): Promise<CustomerView | undefined> {
  const current = await db.customer.findUnique({
    where: {
      id
    }
  });

  if (!current) {
    return undefined;
  }

  const nextName = updates.name?.trim();

  const updated = await db.$transaction(async (tx) => {
    if (nextName && nextName !== current.name) {
      await tx.liftProject.updateMany({
        where: {
          clientName: current.name
        },
        data: {
          clientName: nextName
        }
      });
    }

    return tx.customer.update({
      where: {
        id
      },
      data: {
        ...(nextName !== undefined ? { name: nextName } : {}),
        ...(updates.email !== undefined ? { email: toOptionalString(updates.email) } : {}),
        ...(updates.phone !== undefined ? { phone: toOptionalString(updates.phone) } : {}),
        ...(updates.location !== undefined ? { location: toOptionalString(updates.location) } : {}),
        ...(updates.notes !== undefined ? { notes: toOptionalString(updates.notes) } : {}),
        ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {})
      }
    });
  });

  return mapCustomer(updated);
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    await db.customer.delete({
      where: {
        id
      }
    });
    return true;
  } catch {
    return false;
  }
}
