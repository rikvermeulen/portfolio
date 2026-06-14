import Image from "next/image";

import type { InformationProps } from "./Information.types.ts";

import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import Link from "@/components/Link/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

const Information = ({
  title,
  description,
  href,
  linkLabel,
  iconSrc,
  iconAlt = "Information icon",
  iconPosition = "top-right",
  className,
}: InformationProps) => {
  return (
    <Bento
      sizes={bentoBoxSizes.information}
      className={classnames(
        "relative flex size-full flex-col justify-between p-5",
        className,
      )}
    >
      {iconSrc && (
        <div
          className={classnames(
            "absolute right-4 z-10",
            iconPosition === "top-right" ? "top-4" : "bottom-4",
          )}
        ></div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-medium">{title}</h2>
        <p className="">{description}</p>
      </div>
      <div className="flex justify-between gap-2">
        <Link
          href={href}
          className="w-fit self-end text-xs underline decoration-1 underline-offset-2 transition-opacity hover:opacity-80"
        >
          {linkLabel}
        </Link>
        {iconSrc && (
          <Image
            alt={iconAlt}
            height={240}
            src={iconSrc}
            width={240}
            className="size-8 rounded-md drop-shadow-md"
          />
        )}
      </div>
    </Bento>
  );
};

export default Information;
