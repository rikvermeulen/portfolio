import type { BentoGridProps } from "./BentoGrid.types.ts";

import classnames from "@/utils/classnames/index.ts";

/** The bento grid. Columns, gaps and square rows per breakpoint live in `layout.css`. */
function BentoGrid({ className, children, ...props }: BentoGridProps) {
  return (
    <div className="bentogrid-container">
      <div className={classnames("bentogrid", className)} {...props}>
        {children}
      </div>
    </div>
  );
}

export default BentoGrid;
