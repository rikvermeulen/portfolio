"use client";

import { createContext, use } from "react";

import type { SpotifyConnection } from "@/hooks/useSpotifyConnection/index.ts";
import type { ReactNode } from "react";

import { useSpotifyConnection } from "@/hooks/useSpotifyConnection/index.ts";

const PLAYER_NAME = "Rik's Portfolio";
const SpotifyConnectionContext = createContext<SpotifyConnection | null>(null);

export function SpotifyConnectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const connection = useSpotifyConnection(PLAYER_NAME, true);

  return (
    <SpotifyConnectionContext value={connection}>
      {children}
    </SpotifyConnectionContext>
  );
}

export function useSharedSpotifyConnection(): SpotifyConnection {
  const connection = use(SpotifyConnectionContext);

  if (!connection) {
    throw new Error(
      "useSharedSpotifyConnection must be used inside SpotifyConnectionProvider",
    );
  }

  return connection;
}
