import Image from "next/image";
import type { SyntheticEvent } from "react";

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  onError?: () => void;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
};

export function SmartImage({ src, alt, className, sizes, priority, fill, onError, onLoad }: SmartImageProps) {
  if (src.startsWith("/")) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          className={className}
          onError={onError}
          onLoad={onLoad}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1000}
        sizes={sizes}
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        className={className}
        onError={onError}
        onLoad={onLoad}
      />
    );
  }

  return (
    // Admin-entered URLs can point anywhere, so the optimizer is skipped.
    // Uploaded files arrive as absolute Blob URLs; keep `fill` working for them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={onError}
      onLoad={onLoad}
      style={
        fill
          ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
          : undefined
      }
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
