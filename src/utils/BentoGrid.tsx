export interface Breakpoint {
  minCellWidth?: number;
  cellGap: number;
  columns: number;
  aspectRatio?: number;
}

interface BentoData {
  default: [number, number];
  [key: string]: [number, number];
}

interface UserConfig {
  target?: string | HTMLElement;
  minCellWidth?: number;
  columns?: number;
  cellGap?: number;
  aspectRatio?: number;
  breakpoints?: Record<number, Breakpoint>;
  breakpointReference?: string;
  balanceFillers?: boolean;
  itemBreakpoints?: Record<string, number>;
}

const DEFAULT_ITEM_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

class BentoGrid {
  private readonly config: UserConfig;
  private readonly gridContainer: HTMLElement | null;
  private readonly itemBreakpoints: Record<string, number>;
  private prevTotalColumns: number | null;
  private prevColumnCount: number | null;
  private activeItemBreakpoint: string | null;
  private gridItems: HTMLElement[];
  private fillers: HTMLElement[];
  private resizeObserver: ResizeObserver | null = null;

  public constructor(userConfig: UserConfig) {
    this.config = {
      target: ".bentogrid",
      minCellWidth: 100,
      cellGap: 0,
      aspectRatio: 1 / 1,
      breakpoints: {},
      balanceFillers: false,
      breakpointReference: "target",
      ...userConfig,
    };

    this.gridContainer =
      typeof this.config.target === "string"
        ? (document.querySelector(this.config.target) as HTMLElement | null)
        : this.config.target || null;
    // Initialize grid container

    this.itemBreakpoints = {
      ...DEFAULT_ITEM_BREAKPOINTS,
      ...this.config.itemBreakpoints,
    };

    this.prevTotalColumns = null;
    this.prevColumnCount = null;
    this.activeItemBreakpoint = this.getCurrentItemBreakpoint() ?? null;

    this.gridItems = [];
    this.fillers = [];

    window.requestAnimationFrame(() => {
      this.initializeGrid();
      this.handleResponsiveBehavior();
    });
  }

  private initializeGrid() {
    this.setElements();
    this.hideOriginalFillers();
    this.setupGrid();
    this.updateGrid();
  }

  private setElements() {
    if (!this.gridContainer) {
      return;
    }

    const allItems: NodeListOf<Element> =
      this.gridContainer.querySelectorAll(":scope > *");

    this.gridItems = Array.from(allItems)
      .filter((item) => item.hasAttribute("data-bento"))
      .filter((item) => (item as HTMLElement).offsetParent !== null)
      .map((item) => item as HTMLElement);

    this.fillers = Array.from(allItems)
      .filter((item) => !item.hasAttribute("data-bento"))
      .filter((filler) => !(filler as HTMLElement).style.gridColumn)
      .map((filler) => filler as HTMLElement);
  }

  private parseBentoData(item: HTMLElement): BentoData {
    const bentoValue = item.getAttribute("data-bento");

    if (!bentoValue) {
      console.warn("Missing or invalid data-bento value on element:", item);
      return { default: [1, 1] };
    }

    const bentoData = bentoValue
      .split(" ")
      .filter(Boolean)
      .reduce<BentoData>(
        (acc, size) => {
          const trimmedSize = size.trim();
          if (trimmedSize.includes(":")) {
            const [breakpoint, dimensions] = trimmedSize
              .split(":")
              .map((s) => s.trim());
            const [width, height] = dimensions?.split("x").map(Number) || [
              1, 1,
            ];
            if (breakpoint && width !== undefined && height !== undefined) {
              acc[breakpoint] = [width, height];
            }
          } else {
            const [width, height] = trimmedSize.split("x").map(Number);
            acc.default = [width || 1, height || 1];
          }
          return acc;
        },
        { default: [1, 1] },
      );

    if (!bentoData.default) {
      bentoData.default = [1, 1];
    }

    return bentoData;
  }

  private getCurrentItemBreakpoint() {
    if (!this.gridContainer) {
      return null;
    }

    const width =
      this.config.breakpointReference === "target"
        ? this.gridContainer.clientWidth
        : window.innerWidth;

    return [...Object.keys(this.itemBreakpoints)]
      .reverse()
      .find((bp) => width >= (this.itemBreakpoints[bp] || 0));
  }

  private getActiveItemSize(bentoData: Record<string, unknown>) {
    if (!this.gridContainer) {
      return null;
    }

    const breakpoints = Object.keys(this.itemBreakpoints)
      .filter((bp) => bp !== "default" && bentoData[bp])
      .sort(
        (a, b) =>
          (this.itemBreakpoints[a] || 0) - (this.itemBreakpoints[b] || 0),
      );

    const width =
      this.config.breakpointReference === "target"
        ? this.gridContainer.clientWidth
        : window.innerWidth;

    let activeSize = bentoData.default;

    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i];
      if (!breakpoint) {
        continue;
      }
      const breakpointWidth = this.itemBreakpoints[breakpoint];

      if (breakpoint && breakpointWidth && width >= breakpointWidth) {
        activeSize = bentoData[breakpoint] || bentoData.default;
        break;
      }
    }

    return activeSize;
  }

  private getBreakpoint() {
    if (!this.gridContainer) {
      return null;
    }

    const width =
      this.config.breakpointReference === "target"
        ? this.gridContainer.clientWidth
        : window.innerWidth;

    let activeBreakpoint = { ...this.config };

    const cleanupBreakpoint = (breakpoint: UserConfig | undefined) => {
      if (!breakpoint) {
        return;
      }
      if (breakpoint.columns) {
        delete activeBreakpoint.minCellWidth;
      } else if (breakpoint.minCellWidth) {
        delete activeBreakpoint.columns;
      }
    };

    cleanupBreakpoint(activeBreakpoint);
    if (!this.config.breakpoints) {
      return null;
    }

    const breakpointKeys = Object.keys(this.config.breakpoints)
      .map(Number)
      .sort((a, b) => a - b);

    for (const breakpointKey of breakpointKeys) {
      if (width >= breakpointKey) {
        activeBreakpoint = {
          ...activeBreakpoint,
          ...this.config.breakpoints[breakpointKey],
        };
        cleanupBreakpoint(this.config.breakpoints[breakpointKey]);
      }
    }

    return activeBreakpoint;
  }

  private setupGrid() {
    if (!this.gridContainer) {
      return null;
    }

    const containerWidth = this.gridContainer.clientWidth;

    const breakpoint = this.getBreakpoint();

    if (!breakpoint) {
      return null;
    }

    const totalColumns =
      breakpoint.columns ||
      Math.floor(
        (containerWidth + (breakpoint.cellGap || 0)) /
          ((breakpoint.minCellWidth || 0) + (breakpoint.cellGap || 0)),
      );

    const cellWidth =
      (containerWidth - (totalColumns - 1) * (breakpoint.cellGap || 0)) /
      totalColumns;
    const rowHeight = breakpoint.aspectRatio
      ? cellWidth / breakpoint.aspectRatio
      : 0;

    if (!this.gridContainer) {
      return totalColumns;
    }

    this.gridContainer.style.display = "grid";
    this.gridContainer.style.gridTemplateColumns = `repeat(${totalColumns}, minmax(${
      breakpoint.minCellWidth || 0
    }px, 1fr))`;
    this.gridContainer.style.gap = `${breakpoint.cellGap || 0}px`;
    if (breakpoint.aspectRatio) {
      this.gridContainer.style.setProperty(
        "--bento-row-height",
        `${rowHeight}px`,
      );
    }

    return totalColumns;
  }

  private hideOriginalFillers() {
    this.fillers.forEach((filler) => {
      filler.style.display = "none";
    });
  }

  private removeClonedFillers() {
    if (!this.gridContainer) {
      return;
    }

    Array.from(this.gridContainer.querySelectorAll(":scope > *"))
      .filter((item) => !item.hasAttribute("data-bento"))
      .filter((filler) => !!(filler as HTMLElement).style.gridColumn)
      .forEach((filler) => {
        filler.remove();
      });
  }

  private updateGrid() {
    const totalColumns = this.setupGrid();

    if (!totalColumns) {
      return;
    }

    if (this.prevTotalColumns !== totalColumns) {
      this.removeClonedFillers();
    }

    const gridMatrix: boolean[][] = [];
    let maxRow = 0;

    // Initialize the grid matrix
    for (let i = 0; i < totalColumns; i++) {
      gridMatrix[i] = [];
    }

    function getNextAvailablePosition(
      gridColumnSpan: number,
      gridRowSpan: number,
    ) {
      if (!totalColumns) {
        return { column: 0, row: 0 };
      }

      let foundPosition = false;
      let column = 0;
      let row = 0;

      while (!foundPosition) {
        if (isPositionAvailable(column, row, gridColumnSpan, gridRowSpan)) {
          foundPosition = true;
        } else {
          column++;
          if (column + gridColumnSpan > totalColumns) {
            column = 0;
            row++;
          }
        }
      }

      return { column, row };
    }

    function isPositionAvailable(
      column: number,
      row: number,
      gridColumnSpan: number,
      gridRowSpan: number,
    ) {
      for (let c = column; c < column + gridColumnSpan; c++) {
        for (let r = row; r < row + gridRowSpan; r++) {
          if (gridMatrix[c] && gridMatrix[c]?.[r]) {
            return false;
          }
        }
      }
      return true;
    }

    function occupyPosition(
      column: number,
      row: number,
      gridColumnSpan: number,
      gridRowSpan: number,
    ) {
      for (let c = column; c < column + gridColumnSpan; c++) {
        for (let r = row; r < row + gridRowSpan; r++) {
          if (!gridMatrix[c]) {
            gridMatrix[c] = [];
          }
          if (gridMatrix[c]) {
            gridMatrix[c]![r] = true;
          }
        }
      }
    }

    this.gridItems.forEach((item) => {
      const bentoData = this.parseBentoData(item);
      const activeSize = this.getActiveItemSize(bentoData);
      if (!activeSize || !Array.isArray(activeSize)) {
        return;
      }
      const [gridColumnSpan, gridRowSpan] = activeSize;

      const position = getNextAvailablePosition(gridColumnSpan, gridRowSpan);
      item.style.gridColumn = `${position.column + 1} / span ${gridColumnSpan}`;
      item.style.gridRow = `${position.row + 1} / span ${gridRowSpan}`;

      occupyPosition(
        position.column,
        position.row,
        gridColumnSpan,
        gridRowSpan,
      );

      // Update maxRow
      maxRow = Math.max(maxRow, position.row + gridRowSpan);
    });

    if (this.gridContainer) {
      this.gridContainer.style.gridTemplateRows = `repeat(${maxRow}, minmax(var(--bento-row-height), 1fr))`;
    }

    // Find the maximum row
    this.gridItems.forEach((item) => {
      const gridRowParts = item.style.gridRow.split(" / ");
      const gridRowStart = parseInt(gridRowParts[0] || "1");
      const gridRowSpan = parseInt(gridRowParts[1]?.split(" ")[1] || "1");
      maxRow = Math.max(maxRow, gridRowStart + gridRowSpan - 1);
    });
    const addFillers = () => {
      let fillerIndex = 0;
      const lastFillerPositions: { column: number; row: number }[] = [];

      for (let row = 0; row < maxRow; row++) {
        for (let column = 0; column < totalColumns; column++) {
          if (!gridMatrix[column] || !gridMatrix[column]![row]) {
            let gridColumnSpan = 1;
            let gridRowSpan = 1;

            // Find the maximum gridColumnSpan
            while (
              column + gridColumnSpan < totalColumns &&
              gridMatrix[column + gridColumnSpan] &&
              !gridMatrix[column + gridColumnSpan]![row]
            ) {
              gridColumnSpan++;
            }

            // Find the maximum gridRowSpan
            for (let r = row + 1; r < maxRow; r++) {
              let rowSpanValid = true;
              for (let c = column; c < column + gridColumnSpan; c++) {
                if (gridMatrix[c] && gridMatrix[c]![r]) {
                  rowSpanValid = false;
                  break;
                }
              }
              if (!rowSpanValid) {
                break;
              }
              gridRowSpan++;
            }

            let filler;
            if (this.fillers.length > 0) {
              // Clone the filler
              filler = this.fillers[fillerIndex]?.cloneNode(
                true,
              ) as HTMLElement;
              // Update the filler index for the next iteration
              fillerIndex = (fillerIndex + 1) % this.fillers.length;
              filler.style.display = "block";
            } else {
              // Create a new div if no fillers are available
              filler = document.createElement("div");
            }

            filler.classList.add("bento-filler");
            filler.style.gridColumn = `${column + 1} / span ${gridColumnSpan}`;
            filler.style.gridRow = `${row + 1} / span ${gridRowSpan}`;

            // let swapPerformed = false; // Track if swap was performed

            // Swap the filler element with an existing element of the same size, if available
            if (this.config.balanceFillers) {
              const availableSwaps = Array.from(this.gridItems)
                .filter((item) => !item.hasAttribute("data-bento-no-swap"))
                .filter((item) => {
                  const gridColumnParts = item.style.gridColumn.split(" / ");
                  const gridRowParts = item.style.gridRow.split(" / ");
                  const gridColumnStart = parseInt(gridColumnParts[0] || "1");
                  const gridRowStart = parseInt(gridRowParts[0] || "1");
                  const gridColumnEnd = parseInt(
                    gridColumnParts[1]?.split(" ")[1] || "1",
                  );
                  const gridRowEnd = parseInt(
                    gridRowParts[1]?.split(" ")[1] || "1",
                  );

                  return (
                    gridColumnEnd === gridColumnSpan &&
                    gridRowEnd === gridRowSpan &&
                    (gridColumnStart !== column + 1 || gridRowStart !== row + 1)
                  );
                });

              if (availableSwaps.length > 0) {
                const getNextPositionDistance = (
                  current: { column: number; row: number },
                  next: { column: number; row: number },
                ) => {
                  return (
                    Math.abs(current.column - next.column) +
                    Math.abs(current.row - next.row)
                  );
                };

                const getAverageSwapsDistance = (
                  swaps: { column: number; row: number }[],
                  newSwap: { column: number; row: number },
                ) => {
                  if (swaps.length === 0) {
                    return 0;
                  }
                  const totalDistance = swaps.reduce((sum, swap) => {
                    return sum + getNextPositionDistance(swap, newSwap);
                  }, 0);
                  return totalDistance / swaps.length;
                };

                const bestSwap = availableSwaps.reduce((best, current) => {
                  if (!best) {
                    return current;
                  }
                  const currentColumnParts =
                    current.style.gridColumn.split(" / ");
                  const currentRowParts = current.style.gridRow.split(" / ");
                  const bestColumnParts = best.style.gridColumn.split(" / ");
                  const bestRowParts = best.style.gridRow.split(" / ");

                  const currentAvgDistance = getAverageSwapsDistance(
                    lastFillerPositions,
                    {
                      column: parseInt(currentColumnParts[0] || "1") - 1,
                      row: parseInt(currentRowParts[0] || "1") - 1,
                    },
                  );

                  const bestAvgDistance = getAverageSwapsDistance(
                    lastFillerPositions,
                    {
                      column: parseInt(bestColumnParts[0] || "1") - 1,
                      row: parseInt(bestRowParts[0] || "1") - 1,
                    },
                  );

                  return currentAvgDistance > bestAvgDistance ? current : best;
                }, availableSwaps[0]);

                if (bestSwap) {
                  const originalGridColumn = bestSwap.style.gridColumn;
                  const originalGridRow = bestSwap.style.gridRow;
                  bestSwap.style.gridColumn = filler.style.gridColumn;
                  bestSwap.style.gridRow = filler.style.gridRow;
                  filler.style.gridColumn = originalGridColumn;
                  filler.style.gridRow = originalGridRow;

                  const fillerColumnParts =
                    filler.style.gridColumn.split(" / ");
                  const fillerRowParts = filler.style.gridRow.split(" / ");
                  lastFillerPositions.push({
                    column: parseInt(fillerColumnParts[0] || "1") - 1,
                    row: parseInt(fillerRowParts[0] || "1") - 1,
                  });
                  // swapPerformed = true; // Track if swap was performed
                }
              }
            }

            // Update gridMatrix
            occupyPosition(column, row, gridColumnSpan, gridRowSpan);

            if (this.gridContainer) {
              this.gridContainer.appendChild(filler);
            }
          }
        }
      }
    };

    addFillers();

    this.prevTotalColumns = totalColumns;

    this.emitCalculationDoneEvent();
  }

  private handleResponsiveBehavior() {
    const onResize = () => {
      if (
        this.resizeObserver &&
        "_" in this.resizeObserver &&
        (this.resizeObserver as { _animationFrameId?: number })
          ._animationFrameId
      ) {
        cancelAnimationFrame(
          (this.resizeObserver as { _animationFrameId?: number })
            ._animationFrameId!,
        );
      }
      if (this.resizeObserver && "_" in this.resizeObserver) {
        (
          this.resizeObserver as { _animationFrameId?: number }
        )._animationFrameId = requestAnimationFrame(() => {
          const currentColumnCount = this.setupGrid();
          if (currentColumnCount !== this.prevColumnCount) {
            this.updateGrid();
          }
          this.prevColumnCount = currentColumnCount;

          const newItemBreakpoint = this.getCurrentItemBreakpoint();
          if (
            newItemBreakpoint &&
            newItemBreakpoint !== this.activeItemBreakpoint
          ) {
            this.updateGrid();
            this.activeItemBreakpoint = newItemBreakpoint;
          }
        });
      }
    };

    if (this.config.breakpointReference === "window") {
      this.resizeObserver = {
        observe: () => {
          window.addEventListener("resize", onResize);
        },
        unobserve: () => {
          window.removeEventListener("resize", onResize);
        },
        disconnect: () => {
          window.removeEventListener("resize", onResize);
        },
      } as ResizeObserver;
    } else {
      this.resizeObserver = new ResizeObserver(onResize);
    }

    if (this.gridContainer) {
      this.resizeObserver.observe(this.gridContainer);
    }
  }

  public cleanup() {
    if (this.resizeObserver) {
      if (this.config.breakpointReference === "window") {
        (
          this.resizeObserver as unknown as { unobserve: () => void }
        ).unobserve();
      } else {
        this.resizeObserver.disconnect();
      }
    }
  }

  /**
   * Recalculate the grid layout.
   * Useful for cases when elements are added, removed, or visibility changes.
   */
  public recalculate() {
    this.setElements();
    this.updateGrid();
  }

  /**
   * Emits a "calculationDone" event when the grid calculation is completed.
   */
  private emitCalculationDoneEvent() {
    const calculationDoneEvent = new CustomEvent("calculationDone", {
      detail: {
        gridContainer: this.gridContainer,
      },
    });
    if (this.gridContainer) {
      this.gridContainer.dispatchEvent(calculationDoneEvent);
    }
  }
}

export default BentoGrid;
