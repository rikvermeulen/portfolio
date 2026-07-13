import Image from "next/image";

import type { AppIconProps } from "./AppIcon.types.ts";

import Glass from "@/components/Glass/index.ts";
import classnames from "@/utils/classnames/index.ts";

const APP_ICON_RADIUS = 6;

const AppIcon = ({
  src,
  darkSrc,
  alt,
  interactive = false,
  className,
}: AppIconProps) => {
  const altText = alt ?? "App icon";

  return (
    <div
      className={classnames(
        "relative size-7 shrink-0 overflow-hidden rounded-md",
        interactive && "group",
        className,
      )}
    >
      <Image
        alt={altText}
        height={240}
        src={src}
        width={240}
        className={classnames(
          "size-full object-cover",
          darkSrc && "dark:hidden",
        )}
      />
      {darkSrc ? (
        <Image
          alt={altText}
          height={240}
          src={darkSrc}
          width={240}
          className="absolute inset-0 hidden size-full object-cover dark:block"
        />
      ) : null}
      <Glass
        intensity={0.05}
        interactive={interactive}
        radius={APP_ICON_RADIUS}
        tint="none"
      />
    </div>
  );
};

export default AppIcon;
