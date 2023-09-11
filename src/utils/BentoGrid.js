/**
 * @typedef {Object} UserConfig
 * @property {string | HTMLElement} [target='.bentogrid'] - The target element to apply the grid to.
 * @property {number} [minCellWidth=100] - The minimum width of each cell in the grid.
 * @property {number} [columns=undefined] - The number of columns to use for the grid. This overrides minCellWidth.
 * @property {number} [cellGap=0] - The space between each cell in the grid.
 * @property {number} [aspectRatio=1/1] - The aspect ratio of each cell in the grid.
 * @property {Object.<number, Breakpoint>} [breakpoints] - Breakpoints to set responsive grid behavior. minWidth looks at breakpointReference.
 * @property {string} [breakpointReference='target'] - Select if the breakpoints should reference to the target's or the window's width.
 * @property {boolean} [balanceFillers=false] - Whether to balance the position of the fillers. If set, they change their position with other elements.
 * @property {Object.<string, number>} [itemBreakpoints] - Custom widths for the predefined breakpoints.
 */

/**
 * @typedef {Object} Breakpoint
 * @property {number} [minCellWidth] - The minimum width of each cell in the grid.
 * @property {number} [cellGap] - The space between each cell in the grid.
 * @property {number} [columns] - The number of columns to use for the grid. This overrides minCellWidth.
 * @property {number} [aspectRatio] - The aspect ratio of each cell in the grid.
 */

const DEFAULT_ITEM_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

class BentoGrid {
  /**
   * Create a new BentoGrid instance.
   * @param {UserConfig} userConfig - User configuration for the grid.
   */
  constructor(userConfig) {
    this.setDefaultConfig();
    this.mergeConfigs(userConfig);
    this.initializeGrid();
    this.handleResponsiveBehavior();
  }

  setDefaultConfig() {
    this.config = {
      target: '.bentogrid',
      minCellWidth: 100,
      cellGap: 0,
      aspectRatio: 1 / 1,
      breakpoints: {},
      balanceFillers: false,
      breakpointReference: 'target',
    };
  }

  mergeConfigs(userConfig) {
    Object.assign(this.config, userConfig);

    this.gridContainer =
      typeof this.config.target === 'string'
        ? document.querySelector(this.config.target)
        : this.config.target;

    this.itemBreakpoints = {
      ...DEFAULT_ITEM_BREAKPOINTS,
      ...this.config.itemBreakpoints,
    };

    this.prevTotalColumns = null;
    this.prevColumnCount = null;
    this.activeItemBreakpoint = this.getCurrentItemBreakpoint();
  }

  initializeGrid() {
    this.setElements();
    this.hideOriginalFillers();
    this.setupGrid();
    this.updateGrid();
  }

  setElements() {
    // Grid items with the 'data-bento' attribute
    this.gridItems = Array.from(this.gridContainer.querySelectorAll(':scope > *'))
      .filter((item) => item.hasAttribute('data-bento'))
      // items that are visible
      .filter((item) => item.offsetParent !== null);

    // Fillers that do not have the 'data-bento' attribute and are not set by the script
    this.fillers = Array.from(this.gridContainer.querySelectorAll(':scope > *'))
      .filter((item) => !item.hasAttribute('data-bento'))
      .filter((filler) => !filler.style.gridColumn);
  }

  parseBentoData(item) {
    const bentoValue = item.getAttribute('data-bento');

    if (!bentoValue) {
      console.warn('Missing or invalid data-bento value on element:', item);
      return { default: [1, 1] };
    }

    const bentoData = bentoValue
      .split(' ')
      .filter(Boolean)
      .reduce((acc, size) => {
        size = size.trim();
        if (size.includes(':')) {
          const [breakpoint, dimensions] = size.split(':').map((s) => s.trim());
          acc[breakpoint] = dimensions.split('x').map(Number);
        } else {
          acc.default = size.split('x').map(Number);
        }
        return acc;
      }, {});

    if (!bentoData.default) bentoData.default = [1, 1];

    return bentoData;
  }

  getCurrentItemBreakpoint() {
    const width =
      this.config.breakpointReference === 'target'
        ? this.gridContainer.clientWidth
        : window.innerWidth;

    return [...Object.keys(this.itemBreakpoints)]
      .reverse()
      .find((bp) => width >= this.itemBreakpoints[bp]);
  }

  getActiveItemSize(bentoData) {
    const breakpoints = Object.keys(this.itemBreakpoints)
      .filter((bp) => bp !== 'default' && bentoData[bp])
      .sort((a, b) => this.itemBreakpoints[a] - this.itemBreakpoints[b]);

    const width =
      this.config.breakpointReference === 'target'
        ? this.gridContainer.clientWidth
        : window.innerWidth;

    let activeSize = bentoData.default;

    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i];
      const breakpointWidth = this.itemBreakpoints[breakpoint];

      if (width >= breakpointWidth) {
        activeSize = bentoData[breakpoint];
        break;
      }
    }

    return activeSize;
  }

  getBreakpoint() {
    const width =
      this.config.breakpointReference === 'target'
        ? this.gridContainer.clientWidth
        : window.innerWidth;

    let activeBreakpoint = { ...this.config };

    const cleanupBreakpoint = (breakpoint) => {
      if (breakpoint.columns) {
        delete activeBreakpoint.minCellWidth;
      } else if (breakpoint.minCellWidth) {
        delete activeBreakpoint.columns;
      }
    };

    cleanupBreakpoint(activeBreakpoint);

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

  setupGrid() {
    const breakpoint = this.getBreakpoint();

    // Calculate the total number of columns
    const totalColumns =
      breakpoint.columns ||
      Math.floor(
        (this.gridContainer.clientWidth + breakpoint.cellGap) /
          (breakpoint.minCellWidth + breakpoint.cellGap),
      );

    // Configure the grid container styles
    this.gridContainer.style.display = 'grid';
    this.gridContainer.style.gridTemplateColumns = `repeat(${totalColumns}, minmax(${breakpoint.minCellWidth}px, 1fr))`;
    this.gridContainer.style.gridGap = `${breakpoint.cellGap}px`;

    // Calculate the cell width based on the container width, total columns and cell gap
    const containerWidth = this.gridContainer.clientWidth;
    const cellWidth = (containerWidth - (totalColumns - 1) * breakpoint.cellGap) / totalColumns;

    // Calculate the row height based on the aspect ratio and cell width
    const rowHeight = cellWidth / breakpoint.aspectRatio;

    // Set the row height as a CSS variable to read it later in the updateGrid method
    this.gridContainer.style.setProperty('--bento-row-height', `${rowHeight}px`);

    return totalColumns;
  }

  hideOriginalFillers() {
    this.fillers.forEach((filler) => {
      filler.style.display = 'none';
    });
  }

  removeClonedFillers() {
    // Fillers that are visible
    Array.from(this.gridContainer.querySelectorAll(':scope > *'))
      .filter((item) => !item.hasAttribute('data-bento'))
      .filter((filler) => !!filler.style.gridColumn)
      .forEach((filler) => {
        filler.remove();
      });
  }

  updateGrid() {
    const totalColumns = this.setupGrid();

    if (this.prevTotalColumns !== totalColumns) {
      this.removeClonedFillers();
    }

    const gridMatrix = [];
    let maxRow = 0;

    // Initialize the grid matrix
    for (let i = 0; i < totalColumns; i++) {
      gridMatrix[i] = [];
    }

    function getNextAvailablePosition(gridColumnSpan, gridRowSpan) {
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

    function isPositionAvailable(column, row, gridColumnSpan, gridRowSpan) {
      for (let c = column; c < column + gridColumnSpan; c++) {
        for (let r = row; r < row + gridRowSpan; r++) {
          if (gridMatrix[c] && gridMatrix[c][r]) {
            return false;
          }
        }
      }
      return true;
    }

    function occupyPosition(column, row, gridColumnSpan, gridRowSpan) {
      for (let c = column; c < column + gridColumnSpan; c++) {
        for (let r = row; r < row + gridRowSpan; r++) {
          if (!gridMatrix[c]) {
            gridMatrix[c] = [];
          }
          gridMatrix[c][r] = true;
        }
      }
    }

    this.gridItems.forEach((item) => {
      const bentoData = this.parseBentoData(item);
      const [gridColumnSpan, gridRowSpan] = this.getActiveItemSize(bentoData);

      const position = getNextAvailablePosition(gridColumnSpan, gridRowSpan);
      item.style.gridColumn = `${position.column + 1} / span ${gridColumnSpan}`;
      item.style.gridRow = `${position.row + 1} / span ${gridRowSpan}`;

      occupyPosition(position.column, position.row, gridColumnSpan, gridRowSpan);

      // Update maxRow
      maxRow = Math.max(maxRow, position.row + gridRowSpan);
    });

    this.gridContainer.style.gridTemplateRows = `repeat(${maxRow}, minmax(var(--bento-row-height), 1fr))`;

    // Find the maximum row
    this.gridItems.forEach((item) => {
      const gridRowStart = parseInt(item.style.gridRow.split(' / ')[0]);
      const gridRowSpan = parseInt(item.style.gridRow.split(' / ')[1].split(' ')[1]);
      maxRow = Math.max(maxRow, gridRowStart + gridRowSpan - 1);
    });
    const addFillers = () => {
      let fillerIndex = 0;
      let lastFillerPositions = [];

      for (let row = 0; row < maxRow; row++) {
        for (let column = 0; column < totalColumns; column++) {
          if (!gridMatrix[column][row]) {
            let gridColumnSpan = 1;
            let gridRowSpan = 1;

            // Find the maximum gridColumnSpan
            while (
              column + gridColumnSpan < totalColumns &&
              !gridMatrix[column + gridColumnSpan][row]
            ) {
              gridColumnSpan++;
            }

            // Find the maximum gridRowSpan
            for (let r = row + 1; r < maxRow; r++) {
              let rowSpanValid = true;
              for (let c = column; c < column + gridColumnSpan; c++) {
                if (gridMatrix[c][r]) {
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
              filler = this.fillers[fillerIndex].cloneNode(true);
              // Update the filler index for the next iteration
              fillerIndex = (fillerIndex + 1) % this.fillers.length;
              filler.style.display = 'block';
            } else {
              // Create a new div if no fillers are available
              filler = document.createElement('div');
            }

            filler.classList.add('bento-filler');
            filler.style.gridColumn = `${column + 1} / span ${gridColumnSpan}`;
            filler.style.gridRow = `${row + 1} / span ${gridRowSpan}`;

            let swapPerformed = false;

            // Swap the filler element with an existing element of the same size, if available
            if (this.config.balanceFillers) {
              const availableSwaps = Array.from(this.gridItems)
                .filter((item) => !item.hasAttribute('data-bento-no-swap'))
                .filter((item) => {
                  const gridColumnStart = parseInt(item.style.gridColumn.split(' / ')[0]);
                  const gridRowStart = parseInt(item.style.gridRow.split(' / ')[0]);
                  const gridColumnEnd = parseInt(
                    item.style.gridColumn.split(' / ')[1].split(' ')[1],
                  );
                  const gridRowEnd = parseInt(item.style.gridRow.split(' / ')[1].split(' ')[1]);

                  return (
                    gridColumnEnd === gridColumnSpan &&
                    gridRowEnd === gridRowSpan &&
                    (gridColumnStart !== column + 1 || gridRowStart !== row + 1)
                  );
                });

              if (availableSwaps.length > 0) {
                const getNextPositionDistance = (current, next) => {
                  return Math.abs(current.column - next.column) + Math.abs(current.row - next.row);
                };

                const getAverageSwapsDistance = (swaps, newSwap) => {
                  if (swaps.length === 0) return 0;
                  const totalDistance = swaps.reduce((sum, swap) => {
                    return sum + getNextPositionDistance(swap, newSwap);
                  }, 0);
                  return totalDistance / swaps.length;
                };

                const bestSwap = availableSwaps.reduce((best, current) => {
                  const currentAvgDistance = getAverageSwapsDistance(lastFillerPositions, {
                    column: parseInt(current.style.gridColumn.split(' / ')[0]) - 1,
                    row: parseInt(current.style.gridRow.split(' / ')[0]) - 1,
                  });

                  const bestAvgDistance = getAverageSwapsDistance(lastFillerPositions, {
                    column: parseInt(best.style.gridColumn.split(' / ')[0]) - 1,
                    row: parseInt(best.style.gridRow.split(' / ')[0]) - 1,
                  });

                  return currentAvgDistance > bestAvgDistance ? current : best;
                }, availableSwaps[0]);

                const originalGridColumn = bestSwap.style.gridColumn;
                const originalGridRow = bestSwap.style.gridRow;
                bestSwap.style.gridColumn = filler.style.gridColumn;
                bestSwap.style.gridRow = filler.style.gridRow;
                filler.style.gridColumn = originalGridColumn;
                filler.style.gridRow = originalGridRow;

                lastFillerPositions.push({
                  column: parseInt(filler.style.gridColumn.split(' / ')[0]) - 1,
                  row: parseInt(filler.style.gridRow.split(' / ')[0]) - 1,
                });
                swapPerformed = true;
              }
            }

            // Update gridMatrix
            occupyPosition(column, row, gridColumnSpan, gridRowSpan);

            this.gridContainer.appendChild(filler);
          }
        }
      }
    };

    addFillers();

    this.prevTotalColumns = totalColumns;

    this.emitCalculationDoneEvent();
  }

  handleResponsiveBehavior() {
    const onResize = () => {
      if (this.resizeObserver._animationFrameId) {
        cancelAnimationFrame(this.resizeObserver._animationFrameId);
      }
      this.resizeObserver._animationFrameId = requestAnimationFrame(() => {
        const currentColumnCount = this.setupGrid();
        if (currentColumnCount !== this.prevColumnCount) {
          this.updateGrid();
        }
        this.prevColumnCount = currentColumnCount;

        const newItemBreakpoint = this.getCurrentItemBreakpoint();
        if (newItemBreakpoint && newItemBreakpoint !== this.activeItemBreakpoint) {
          this.updateGrid();
          this.activeItemBreakpoint = newItemBreakpoint;
        }
      });
    };

    if (this.config.breakpointReference === 'window') {
      this.resizeObserver = {
        observe: () => {
          window.addEventListener('resize', onResize);
        },
        unobserve: () => {
          window.removeEventListener('resize', onResize);
        },
      };
    } else {
      this.resizeObserver = new ResizeObserver(onResize);
    }

    this.resizeObserver.observe(this.gridContainer);
  }

  /**
   * Recalculate the grid layout.
   * Useful for cases when elements are added, removed, or visibility changes.
   */
  recalculate() {
    this.setElements();
    this.updateGrid();
  }

  /**
   * Emits a "calculationDone" event when the grid calculation is completed.
   * @method
   * @emits {CustomEvent} calculationDone - The event object contains a "detail" property with the gridContainer as a property.
   */
  emitCalculationDoneEvent() {
    const calculationDoneEvent = new CustomEvent('calculationDone', {
      detail: {
        gridContainer: this.gridContainer,
      },
    });
    this.gridContainer.dispatchEvent(calculationDoneEvent);
  }
}

export default BentoGrid;