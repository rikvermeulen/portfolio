import ImageNext from "next/image";

import type { ImageProps } from "./Image.types.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import classnames from "@/utils/classnames/index.ts";

const Image = ({
  sizeKey,
  src,
  alt,
  caption,
  fit = "cover",
  className,
  surfaceClassName,
}: ImageProps) => {
  if (fit === "contain") {
    return (
      <Bento
        sizes={bentos[sizeKey].sizes}
        surfaceClassName={surfaceClassName}
        className={classnames(
          "flex size-full flex-col justify-between p-5",
          className,
        )}
      >
        <div className="relative min-h-0 flex-1">
          <ImageNext
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            src={src}
            className="object-contain p-4"
          />
        </div>
        <p className="bento-body">{caption}</p>
      </Bento>
    );
  }

  return (
    <Bento
      sizes={bentos[sizeKey].sizes}
      surfaceClassName={surfaceClassName}
      className={classnames("flex size-full flex-col p-5", className)}
    >
      <ImageNext
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 40vw"
        src={src}
        className="object-cover"
      />
      <p className="bento-body absolute right-4 bottom-4 left-4 z-20 text-white">
        {caption}
      </p>
    </Bento>
  );
};

export default Image;
