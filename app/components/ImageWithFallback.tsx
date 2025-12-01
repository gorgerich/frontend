"use client";

import React from "react";
import Image, { ImageProps } from "next/image";

type ImageWithFallbackProps = ImageProps & {
  fallbackSrc?: string;
};

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = React.useState(false);

  const imgSrc = hasError && fallbackSrc ? fallbackSrc : src;

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        // один раз переключаемся на fallback, если он есть
        if (!hasError && fallbackSrc) {
          setHasError(true);
        }
      }}
    />
  );
}