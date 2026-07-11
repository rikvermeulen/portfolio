"use client";

import { Component } from "react";

import type { BentoBoxSizeKey } from "./config.ts";

import Bento from "./Bento.tsx";
import { bentoBoxSizes } from "./config.ts";

interface BentoErrorBoundaryProps {
  readonly size: BentoBoxSizeKey;
  readonly children: React.ReactNode;
}

interface BentoErrorBoundaryState {
  readonly hasError: boolean;
}

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
      <Bento sizes={bentoBoxSizes[this.props.size]} className="size-full">
        <div className="flex size-full items-center justify-center p-4 text-center text-sm text-dark-grey">
          Couldn’t load this tile.
        </div>
      </Bento>
    );
  }
}

export default BentoErrorBoundary;
