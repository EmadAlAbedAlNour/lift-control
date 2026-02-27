"use client";

import { useEffect, useMemo, useState } from "react";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { ensureImageUrlList } from "@/lib/utils/image";

interface HomeBannerCarouselProps {
  images: string[];
  autoPlay?: boolean;
  intervalMs?: number;
}

function clampInterval(value: number | undefined): number {
  if (!value || Number.isNaN(value)) {
    return 5000;
  }

  return Math.min(15000, Math.max(2500, Math.round(value)));
}

export function HomeBannerCarousel({ images, autoPlay = true, intervalMs = 5000 }: HomeBannerCarouselProps) {
  const safeImages = useMemo(() => ensureImageUrlList(images, DEFAULT_IMAGE_URLS.banner), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const duration = clampInterval(intervalMs);
  const currentIndex = safeImages.length > 0 ? activeIndex % safeImages.length : 0;

  useEffect(() => {
    if (!autoPlay || safeImages.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeImages.length);
    }, duration);

    return () => window.clearInterval(timer);
  }, [autoPlay, duration, safeImages.length]);

  return (
    <section className="relative aspect-[16/6] overflow-hidden border-b border-border bg-page sm:h-[300px] sm:aspect-auto lg:h-[360px]">
      {safeImages.map((image, index) => (
        <ImageWithFallback
          key={`${image}-${index}`}
          src={image}
          alt={`صورة بانر ${index + 1}`}
          fill
          priority={index === 0}
          className={`object-contain transition-opacity duration-500 md:object-cover ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          sizes="100vw"
          kind="banner"
          placeholderClassName="bg-surface"
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-l from-page/90 via-page/35 to-transparent" aria-hidden />

      {safeImages.length > 1 ? (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2" aria-hidden>
          {safeImages.map((_, index) => (
            <span
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-white/70"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
