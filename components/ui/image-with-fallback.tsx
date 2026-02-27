import type { ReactNode } from "react";

import {
  Boxes,
  Building2,
  ImageIcon,
  PackageSearch,
  PanelTop,
  TowerControl,
  UserRound,
  Wrench
} from "lucide-react";
import Image from "next/image";

import { toRenderableImageUrl } from "@/lib/utils/image";

export type ImagePlaceholderKind = "generic" | "logo" | "avatar" | "product" | "section" | "project" | "banner" | "hero";

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  icon?: ReactNode;
  kind?: ImagePlaceholderKind;
  placeholderClassName?: string;
}

function resolvePlaceholderIcon(kind: ImagePlaceholderKind): ReactNode {
  switch (kind) {
    case "logo":
      return <TowerControl className="h-9 w-9 text-primary/80" aria-hidden />;
    case "avatar":
      return <UserRound className="h-9 w-9 text-subtext/75" aria-hidden />;
    case "product":
      return <PackageSearch className="h-9 w-9 text-primary/75" aria-hidden />;
    case "section":
      return <Boxes className="h-9 w-9 text-primary/75" aria-hidden />;
    case "project":
      return <Building2 className="h-9 w-9 text-primary/75" aria-hidden />;
    case "banner":
      return <PanelTop className="h-10 w-10 text-subtext/75" aria-hidden />;
    case "hero":
      return <Wrench className="h-10 w-10 text-primary/75" aria-hidden />;
    default:
      return <ImageIcon className="h-10 w-10 text-subtext/70" aria-hidden />;
  }
}

export function ImageWithFallback({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  icon,
  kind = "generic",
  placeholderClassName
}: ImageWithFallbackProps) {
  const renderableSrc = toRenderableImageUrl(src);

  if (renderableSrc) {
    if (fill) {
      return <Image src={renderableSrc} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
    }

    return (
      <Image
        src={renderableSrc}
        alt={alt}
        width={width ?? 1200}
        height={height ?? 800}
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  const iconNode = icon ?? resolvePlaceholderIcon(kind);

  if (fill) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex items-center justify-center bg-surface-soft ${className ?? ""} ${
          placeholderClassName ?? ""
        }`}
      >
        {iconNode}
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex items-center justify-center bg-surface-soft ${className ?? ""} ${placeholderClassName ?? ""}`}
    >
      {iconNode}
    </div>
  );
}
