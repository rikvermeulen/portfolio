"use client";

import { Component } from "react";

import type {
  BentoErrorBoundaryProps,
  BentoErrorBoundaryState,
} from "./Bento.types.ts";

import { bentos } from "./Bento.const.ts";
import Bento from "./Bento.tsx";

/**
 * Per-tile error boundary. If a tile throws while rendering (e.g. a service
 * throws instead of returning a `Result`), it degrades to a correctly-sized
 * placeholder so a single failure never blanks the whole grid.
 */
class BentoErrorBoundary extends Component<
  BentoErrorBoundaryProps,
  BentoErrorBoundaryState
> {
  public state: BentoErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): BentoErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: unknown) {
    console.error("Bento tile crashed:", error);
  }

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Bento sizes={bentos[this.props.sizeKey].sizes} className="size-full">
        <div className="flex size-full items-center justify-center p-4 text-center text-sm text-ds-gray">
          Couldn’t load this tile.
        </div>
      </Bento>
    );
  }
}

export default BentoErrorBoundary;
