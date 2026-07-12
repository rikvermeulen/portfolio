/* eslint-disable no-process-env */
import { scan } from "react-scan";

const REACT_SCAN_INIT_KEY = "__REACT_SCAN_INSTRUMENTATION_INIT__";

if (
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_REACT_SCAN === "true"
) {
  const globalScope = globalThis as typeof globalThis & {
    [REACT_SCAN_INIT_KEY]?: boolean;
  };

  if (!globalScope[REACT_SCAN_INIT_KEY]) {
    globalScope[REACT_SCAN_INIT_KEY] = true;
    scan();
  }
}
