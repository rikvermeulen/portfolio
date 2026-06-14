import Image from "next/image";

import type { CategoryProps, CategoryTag } from "./Category.types.ts";

import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import Tag from "@/components/Tag/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

const Category = ({ label, tags, className }: CategoryProps) => {
  const normalizedTags: CategoryTag[] = tags
    ? tags.map((tag) => (typeof tag === "string" ? { label: tag } : tag))
    : label
      ? [{ label }]
      : [];

  return (
    <Bento
      sizes={bentoBoxSizes.category}
      className={classnames("relative", className)}
    >
      <div className="absolute right-4 bottom-4 z-20 flex max-w-[75%] flex-col items-end justify-end gap-2">
        {normalizedTags.map((tag) => (
          <Tag
            key={`${tag.label}-${tag.variant ?? "neutral"}`}
            label={tag.label}
            variant={tag.variant}
            className="w-fit"
          />
        ))}
      </div>
      <Image
        alt="Category folder"
        height={100}
        src="/svgs/directory.svg"
        width={100}
        className="h-auto w-full object-cover object-center"
      />
    </Bento>
  );
};

export default Category;
