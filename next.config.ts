import type { NextConfig } from "next";

const DEFAULT_IMAGE_HOSTS = ["images.unsplash.com"];

function resolveImageHosts(): string[] {
  const raw = process.env.NEXT_IMAGE_HOSTS;

  if (!raw || raw.trim().length === 0) {
    return DEFAULT_IMAGE_HOSTS;
  }

  const hosts = raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return hosts.length > 0 ? hosts : DEFAULT_IMAGE_HOSTS;
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