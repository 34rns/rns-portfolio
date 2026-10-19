import Image from "next/image";

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
};

export function SmartImage({ src, alt, className, sizes, priority, fill }: SmartImageProps) {
  if (src.startsWith("/")) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={className}
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
        priority={priority}
        className={className}
      />
    );
  }

  return (
    // Admin-entered URLs can point anywhere, so the optimizer is skipped.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
