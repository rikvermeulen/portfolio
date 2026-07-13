import ImageNext from "next/image";

import type { ImageProps } from "./Image.types.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import classnames from "@/utils/classnames/index.ts";

const Image = ({ sizeKey, src, alt, caption, className }: ImageProps) => {
  return (
    <Bento
      sizes={bentos[sizeKey].sizes}
      className={classnames("flex size-full flex-col p-5", className)}
    >
      <ImageNext
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 40vw"
        src={src}
        className="object-cover"
      />
      <p className="absolute right-4 bottom-4 left-4 z-20 text-xs text-white">
        {caption}
      </p>
    </Bento>
  );
};

export default Image;
