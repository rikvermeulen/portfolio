"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

import type { ReactNode } from "react";

interface SoundContextProps {
  playSound: (src: string) => void;
  stopAllSounds: () => void;
}

const SoundContext = createContext<SoundContextProps | undefined>(undefined);

export const useSound = (): SoundContextProps => {
  const context = useContext(SoundContext);

  // Always return the context, even if it's undefined
  // The SoundProvider should always be available in the app
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }

  return context;
};

interface SoundProviderProps {
  children: ReactNode;
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const playingSounds = useRef(new Set<HTMLAudioElement>());
  const audioPool = useRef<Record<string, HTMLAudioElement>>({});

  const getOrCreateAudio = (fileName: string): HTMLAudioElement => {
    if (!audioPool.current[fileName]) {
      audioPool.current[fileName] = new Audio(`/sounds/${fileName}.mp3`);
    }
    return audioPool.current[fileName];
  };

  const playSound = (fileName: string) => {
    try {
      const audio = getOrCreateAudio(fileName).cloneNode(
        true,
      ) as HTMLAudioElement;

      audio.addEventListener("ended", () => {
        playingSounds.current.delete(audio);
      });

      audio.play().catch((error) => {
        console.warn("Error playing audio:", error);
        playingSounds.current.delete(audio);
      });

      playingSounds.current.add(audio);
    } catch (error) {
      console.warn("Error creating or playing audio:", error);
    }
  };

  const stopAllSounds = useCallback(() => {
    playingSounds.current.forEach((audio) => {
      try {
        if (audio && typeof audio.pause === "function") {
          audio.pause();
        }
      } catch (error) {
        console.warn("Error pausing audio:", error);
      }
    });
    playingSounds.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      stopAllSounds();
      // Clean up audio pool
      Object.values(audioPool.current).forEach((audio) => {
        try {
          if (audio && typeof audio.pause === "function") {
            audio.pause();
          }
        } catch (error) {
          console.warn("Error cleaning up audio pool:", error);
        }
      });
      audioPool.current = {};
    };
  }, [stopAllSounds]);

  return (
    <SoundContext.Provider value={{ playSound, stopAllSounds }}>
      {children}
    </SoundContext.Provider>
  );
};
