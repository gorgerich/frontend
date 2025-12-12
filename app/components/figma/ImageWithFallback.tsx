// app/components/figma/ImageWithFallback.tsx
"use client";

import React, { useState } from "react";
import Image, { ImageProps, StaticImageData } from "next/image";
export type ImageWithFallbackProps = Omit<ImageProps, "src"> & {
src: string | StaticImageData;
fallbackSrc?: string;
};

export default function ImageWithFallback({
src,
fallbackSrc = "/placeholder-rect.png",
alt,
...rest
}: ImageWithFallbackProps) {
const [currentSrc, setCurrentSrc] = useState<string | StaticImageData>(src);

return (
// NOTE: Next Image требует width/height или layout="fill". Если у вас используются размеры через className, можно поставить fill и wrapper.
<Image
src={currentSrc}
alt={alt ?? ""}
onError={() => {
if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
}}
{...(rest as any)}
/>
);
} 