import Image from "next/image";

import type { AppIconProps } from "./AppIcon.types.ts";

import Glass from "@/components/Glass/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

const APP_ICON_RADIUS = 6;

const AppIcon = ({
  src,
  alt,
  interactive = false,
  className,
}: AppIconProps) => (
  <div
    style={{ borderRadius: APP_ICON_RADIUS }}
    className={classnames(
      "relative size-7 shrink-0 overflow-hidden",
      interactive && "group",
      className,
    )}
  >
    <Image
      alt={alt ?? "App icon"}
      height={240}
      src={src}
      width={240}
      className="size-full object-cover"
    />
    <Glass
      intensity={0.05}
      interactive={interactive}
      radius={APP_ICON_RADIUS}
      tint="none"
    />
  </div>
);

export default AppIcon;
