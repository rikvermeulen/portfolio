import Image from "next/image";

import type { CategoryProps, CategoryTag } from "./Category.types.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import Tag from "@/components/Tag/index.ts";
import classnames from "@/utils/classnames/index.ts";

const Category = ({ sizeKey, label, tags, className }: CategoryProps) => {
  const normalizedTags: CategoryTag[] = tags
    ? tags.map((tag) => (typeof tag === "string" ? { label: tag } : tag))
    : label
      ? [{ label }]
      : [];

  return (
    <Bento
      sizes={bentos[sizeKey].sizes}
      className={classnames("relative", className)}
    >
      <Image
        alt="Category folder"
        height={100}
        priority
        src="/svgs/directory.svg"
        width={100}
        className="absolute inset-0 size-full object-fill"
      />
      <div className="absolute right-5 bottom-5 z-20 flex max-w-[75%] flex-col items-end justify-end gap-2">
        {normalizedTags.map((tag) => (
          <Tag
            key={`${tag.label}-${tag.variant ?? "neutral"}`}
            label={tag.label}
            variant={tag.variant}
            className="w-fit"
          />
        ))}
      </div>
    </Bento>
  );
};

export default Category;
