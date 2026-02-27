import { db } from "@/lib/db";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { ProductItem as ProductItemView, ProductSection as ProductSectionView } from "@/lib/types";
import { ensureImageUrl } from "@/lib/utils/image";

import {
  mapProduct,
  mapProductSection,
  toOptionalString
} from "@/lib/data-access/shared";

export async function listProductSectionsWithProducts(): Promise<ProductSectionView[]> {
  const sections = await db.productSection.findMany({
    include: {
      products: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      }
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });

  return sections.map(mapProductSection);
}

export async function createProductSection(input: {
  name: string;
  description?: string;
  imageUrl: string;
  sortOrder?: number;
}): Promise<ProductSectionView> {
  const created = await db.productSection.create({
    data: {
      name: input.name.trim(),
      description: toOptionalString(input.description),
      imageUrl: ensureImageUrl(input.imageUrl, DEFAULT_IMAGE_URLS.section),
      sortOrder: input.sortOrder ?? 0
    },
    include: {
      products: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      }
    }
  });

  return mapProductSection(created);
}

export async function updateProductSection(
  id: string,
  updates: {
    name?: string;
    description?: string;
    imageUrl?: string;
    sortOrder?: number;
  }
): Promise<ProductSectionView | undefined> {
  const current = await db.productSection.findUnique({ where: { id } });

  if (!current) {
    return undefined;
  }

  const updated = await db.productSection.update({
    where: { id },
    data: {
      ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
      ...(updates.description !== undefined ? { description: toOptionalString(updates.description) } : {}),
      ...(updates.imageUrl !== undefined
        ? { imageUrl: ensureImageUrl(updates.imageUrl, DEFAULT_IMAGE_URLS.section) }
        : {}),
      ...(updates.sortOrder !== undefined ? { sortOrder: updates.sortOrder } : {})
    },
    include: {
      products: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      }
    }
  });

  return mapProductSection(updated);
}

export async function deleteProductSection(id: string): Promise<boolean> {
  try {
    await db.productSection.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function createProduct(input: {
  sectionId: string;
  name: string;
  sku?: string;
  brand?: string;
  summary: string;
  imageUrl: string;
  isActive?: boolean;
  sortOrder?: number;
}): Promise<ProductItemView> {
  const created = await db.product.create({
    data: {
      sectionId: input.sectionId,
      name: input.name.trim(),
      sku: toOptionalString(input.sku),
      brand: toOptionalString(input.brand),
      summary: input.summary.trim(),
      imageUrl: ensureImageUrl(input.imageUrl, DEFAULT_IMAGE_URLS.product),
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0
    }
  });

  return mapProduct(created);
}

export async function updateProduct(
  id: string,
  updates: {
    sectionId?: string;
    name?: string;
    sku?: string;
    brand?: string;
    summary?: string;
    imageUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
  }
): Promise<ProductItemView | undefined> {
  const current = await db.product.findUnique({ where: { id } });

  if (!current) {
    return undefined;
  }

  const updated = await db.product.update({
    where: { id },
    data: {
      ...(updates.sectionId !== undefined ? { sectionId: updates.sectionId } : {}),
      ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
      ...(updates.sku !== undefined ? { sku: toOptionalString(updates.sku) } : {}),
      ...(updates.brand !== undefined ? { brand: toOptionalString(updates.brand) } : {}),
      ...(updates.summary !== undefined ? { summary: updates.summary.trim() } : {}),
      ...(updates.imageUrl !== undefined
        ? { imageUrl: ensureImageUrl(updates.imageUrl, DEFAULT_IMAGE_URLS.product) }
        : {}),
      ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
      ...(updates.sortOrder !== undefined ? { sortOrder: updates.sortOrder } : {})
    }
  });

  return mapProduct(updated);
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await db.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
