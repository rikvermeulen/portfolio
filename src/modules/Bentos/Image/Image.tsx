import ImageNext from "next/image";

import type { ImageProps } from "./Image.types.ts";

import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

const Image = ({ src, alt, caption, className }: ImageProps) => {
  return (
    <Bento
      sizes={bentoBoxSizes.image}
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
