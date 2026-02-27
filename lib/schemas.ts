import { z } from "zod";

import { PROJECT_STATUS_VALUES, PROJECT_TYPE_VALUES } from "@/lib/constants/projects";
import { isImageReference } from "@/lib/image-utils";

const imageReferenceSchema = z.string().trim().min(1).refine(isImageReference, {
  message: "يجب إدخال رابط صورة صحيح أو مسار يبدأ بـ /"
});

export const authRegisterSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(64),
  phone: z
    .string()
    .min(8)
    .max(20)
    .regex(/^[0-9+()\-\s]+$/)
});

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64)
});

export const resetPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordConfirmSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(64)
});

export const contentInputSchema = z.object({
  title: z.string().min(3).max(160),
  location: z.string().min(3).max(160),
  clientName: z.string().min(3).max(120),
  type: z.enum(PROJECT_TYPE_VALUES),
  floors: z.number().int().min(1).max(120),
  status: z.enum(PROJECT_STATUS_VALUES),
  nextVisit: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary: z.string().min(12).max(500),
  specs: z.object({
    speedMps: z.number().min(0.5).max(8),
    loadKg: z.number().int().min(300).max(8000),
    warrantyMonths: z.number().int().min(6).max(60)
  }),
  coverImage: imageReferenceSchema
});

export const contentUpdateSchema = contentInputSchema.partial();

export const productSectionInputSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  imageUrl: imageReferenceSchema,
  sortOrder: z.number().int().min(0).max(999).optional()
});

export const productSectionUpdateSchema = productSectionInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided."
  });

export const productInputSchema = z.object({
  sectionId: z.string().min(1),
  name: z.string().min(2).max(160),
  sku: z.string().max(120).optional(),
  brand: z.string().max(120).optional(),
  summary: z.string().min(8).max(600),
  imageUrl: imageReferenceSchema,
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional()
});

export const productUpdateSchema = productInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided."
  });

export const customerInputSchema = z.object({
  name: z.string().min(2).max(160),
  email: z.string().email().max(160).optional(),
  phone: z
    .string()
    .min(8)
    .max(20)
    .regex(/^[0-9+()\-\s]+$/)
    .optional(),
  location: z.string().min(2).max(180).optional(),
  notes: z.string().max(1200).optional(),
  isActive: z.boolean().optional()
});

export const customerUpdateSchema = customerInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided."
  });

export const updateSettingSchema = z.object({
  key: z.string().min(3),
  value: z.string().min(1).max(5000)
});

export const updateSettingsBatchSchema = z.object({
  settings: z.array(updateSettingSchema).min(1).max(200)
});

export const adminCreateUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z
    .string()
    .min(8)
    .max(20)
    .regex(/^[0-9+()\-\s]+$/),
  password: z.string().min(8).max(64),
  role: z.enum(["user", "supervisor", "admin"]),
  avatarUrl: imageReferenceSchema.optional()
});

export const adminUpdateUserSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    email: z.string().email().optional(),
    phone: z
      .string()
      .min(8)
      .max(20)
      .regex(/^[0-9+()\-\s]+$/)
      .optional(),
    password: z.string().min(8).max(64).optional(),
    role: z.enum(["user", "supervisor", "admin"]).optional(),
    avatarUrl: imageReferenceSchema.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided."
  });
