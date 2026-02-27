export type UserRole = "user" | "supervisor" | "admin";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl: string;
  createdAt: string;
}

export type ProjectStatus = "new" | "planned" | "in_progress" | "completed";

export interface LiftProject {
  id: string;
  title: string;
  location: string;
  clientName: string;
  type: "passenger" | "cargo" | "panoramic" | "hospital";
  floors: number;
  status: ProjectStatus;
  nextVisit: string;
  summary: string;
  specs: {
    speedMps: number;
    loadKg: number;
    warrantyMonths: number;
  };
  coverImage: string;
  createdAt: string;
}

export interface SystemSetting {
  key: string;
  label: string;
  value: string;
  category: "profile" | "notifications" | "security" | "billing";
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  channel: "in_app" | "email";
  createdAt: string;
  read: boolean;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
}

export interface ProductItem {
  id: string;
  sectionId: string;
  name: string;
  sku?: string;
  brand?: string;
  summary: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSection {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  products: ProductItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
