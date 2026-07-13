import type { InformationProps } from "./Information.types.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import Link from "@/components/Link/index.ts";
import classnames from "@/utils/classnames/index.ts";

const Information = ({
  sizeKey,
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
      iconPosition={iconPosition}
      image={iconSrc}
      imageAlt={iconAlt}
      sizes={bentos[sizeKey].sizes}
      className={classnames(
        "relative flex size-full flex-col justify-between p-5",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-medium">{title}</h2>
        <p>{description}</p>
      </div>
      <div className="flex">
        <Link
          href={href}
          className="w-fit text-xs underline decoration-1 underline-offset-2 transition-opacity hover:opacity-80"
        >
          {linkLabel}
        </Link>
      </div>
    </Bento>
  );
};

export default Information;
