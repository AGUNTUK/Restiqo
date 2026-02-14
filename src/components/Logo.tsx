"use client";

import Image from "next/image";
import { useState } from "react";

type LogoProps = {
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  placeholder?: "empty" | "blur";
  blurDataURL?: string;
};

export default function Logo({
  alt = "Restiqo",
  width = 130,
  height = 40,
  priority = false,
  className,
  sizes = "(max-width: 640px) 110px, (max-width: 1024px) 130px, 150px",
  placeholder = "blur",
  blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/P8Wf7wAAAABJRU5ErkJggg==",
}: LogoProps) {
  const [src, setSrc] = useState("/images/restiqo-logo.png");
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      placeholder={placeholder}
      blurDataURL={placeholder === "blur" ? blurDataURL : undefined}
      onError={() => setSrc("/images/logo.svg")}
    />
  );
}
