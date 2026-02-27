import type { NextConfig } from "next";

const DEFAULT_IMAGE_HOSTS = ["images.unsplash.com", "*.public.blob.vercel-storage.com"];

function toHostname(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return "";
  }

  if (trimmed.includes("://")) {
    try {
      return new URL(trimmed).hostname;
    } catch {
      return "";
    }
  }

  return trimmed.split("/")[0] ?? "";
}

function resolveImageHosts(): string[] {
  const raw = process.env.NEXT_IMAGE_HOSTS;

  if (!raw || raw.trim().length === 0) {
    return DEFAULT_IMAGE_HOSTS;
  }

  const hosts = raw
    .split(",")
    .map((item) => toHostname(item))
    .filter((item) => item.length > 0);

  return hosts.length > 0 ? Array.from(new Set(hosts)) : DEFAULT_IMAGE_HOSTS;
}

const imageHosts = resolveImageHosts();

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https",
      hostname
    }))
  }
};

export default nextConfig;
