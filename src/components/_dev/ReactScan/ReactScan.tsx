"use client";

import { useEffect } from "react";
import { scan } from "react-scan";

function ReactScan(): null {
  useEffect(() => {
    scan();
  }, []);

  return null;
}

export default ReactScan;
