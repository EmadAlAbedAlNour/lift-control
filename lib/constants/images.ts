export const IMAGE_PLACEHOLDER_VALUE = "/__placeholder__";

export const DEFAULT_IMAGE_URLS = {
  global: IMAGE_PLACEHOLDER_VALUE,
  project: IMAGE_PLACEHOLDER_VALUE,
  product: IMAGE_PLACEHOLDER_VALUE,
  section: IMAGE_PLACEHOLDER_VALUE,
  employeeAvatar: IMAGE_PLACEHOLDER_VALUE,
  companyLogo: IMAGE_PLACEHOLDER_VALUE,
  banner: IMAGE_PLACEHOLDER_VALUE,
  heroCard: IMAGE_PLACEHOLDER_VALUE
} as const;

export const SETTING_IMAGE_FALLBACKS: Record<string, string> = {
  "profile.companyLogoUrl": DEFAULT_IMAGE_URLS.companyLogo,
  "footer.companyImageUrl": DEFAULT_IMAGE_URLS.companyLogo,
  "landing.homeBannerImage": DEFAULT_IMAGE_URLS.banner,
  "landing.hero.cardImage": DEFAULT_IMAGE_URLS.heroCard
};
