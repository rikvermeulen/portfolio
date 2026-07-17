import type { DividerProps } from "./Divider.types.ts";

import classnames from "@/utils/classnames/index.ts";

const Divider = ({ anchorId, className, ...props }: DividerProps) => {
  return (
    <div
      id={anchorId}
      aria-hidden
      className={classnames("bentogrid-section-break scroll-mt-24", className)}
      {...props}
    />
  );
};

export default Divider;
