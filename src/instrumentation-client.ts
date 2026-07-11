import { scan } from "react-scan";

const REACT_SCAN_INIT_KEY = "__REACT_SCAN_INSTRUMENTATION_INIT__";

// eslint-disable-next-line no-process-env -- client bootstrap; NODE_ENV is inlined at build time
if (process.env.NODE_ENV === "development") {
  const globalScope = globalThis as typeof globalThis & {
    [REACT_SCAN_INIT_KEY]?: boolean;
  };

  if (!globalScope[REACT_SCAN_INIT_KEY]) {
    globalScope[REACT_SCAN_INIT_KEY] = true;
    scan();
  }
}
