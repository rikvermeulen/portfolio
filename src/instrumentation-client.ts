/* eslint-disable no-restricted-properties -- validated env module / standalone scripts read process.env directly */
const REACT_SCAN_INIT_KEY = "__REACT_SCAN_INSTRUMENTATION_INIT__";

// Dynamic import so react-scan stays out of the production bundle.
if (
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_REACT_SCAN === "true"
) {
  const globalScope = globalThis as typeof globalThis & {
    [REACT_SCAN_INIT_KEY]?: boolean;
  };

  if (!globalScope[REACT_SCAN_INIT_KEY]) {
    globalScope[REACT_SCAN_INIT_KEY] = true;
    void import("react-scan").then(({ scan }) => scan());
  }
}
