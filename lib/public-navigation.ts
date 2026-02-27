import { readSetting } from "@/lib/utils/settings";

export type PublicNavKey = "home" | "services" | "products" | "projects" | "about" | "contact";

export interface PublicNavItem {
  key: PublicNavKey;
  href: string;
  label: string;
}

export const defaultPublicNavItems: PublicNavItem[] = [
  { key: "home", href: "/", label: "الرئيسية" },
  { key: "services", href: "/services", label: "الخدمات" },
  { key: "products", href: "/our-products", label: "المنتجات" },
  { key: "projects", href: "/projects", label: "المشاريع" },
  { key: "about", href: "/about", label: "عن الشركة" },
  { key: "contact", href: "/contact", label: "التواصل" }
];

export const publicNavItems = defaultPublicNavItems;

export function buildPublicNavItems(settings?: Map<string, string>): PublicNavItem[] {
  return [
    { key: "home", href: "/", label: readSetting(settings, "nav.homeLabel", "الرئيسية") },
    { key: "services", href: "/services", label: readSetting(settings, "nav.servicesLabel", "الخدمات") },
    { key: "products", href: "/our-products", label: readSetting(settings, "nav.productsLabel", "المنتجات") },
    { key: "projects", href: "/projects", label: readSetting(settings, "nav.projectsLabel", "المشاريع") },
    { key: "about", href: "/about", label: readSetting(settings, "nav.aboutLabel", "عن الشركة") },
    { key: "contact", href: "/contact", label: readSetting(settings, "nav.contactLabel", "التواصل") }
  ];
}
