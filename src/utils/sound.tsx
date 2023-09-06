'use client';

import { createContext, ReactNode, useContext, useEffect } from 'react';

interface SoundContextProps {
  playSound: (src: string) => void;
  stopAllSounds: () => void;
}

const SoundContext = createContext<SoundContextProps | undefined>(undefined);

export const useSound = (): SoundContextProps => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

interface SoundProviderProps {
  children: ReactNode;
}

const audioPool: { [key: string]: HTMLAudioElement } = {};

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const playingSounds: Set<HTMLAudioElement> = new Set();

  const getOrCreateAudio = (fileName: string): HTMLAudioElement => {
    if (!audioPool[fileName]) {
      audioPool[fileName] = new Audio(`/sounds/${fileName}.mp3`);
    }
    return audioPool[fileName];
  };

  const playSound = (fileName: string) => {
    const audio = getOrCreateAudio(fileName).cloneNode(true) as HTMLAudioElement;
    audio.addEventListener('ended', () => {
      playingSounds.delete(audio);
    });

    audio.play();
    playingSounds.add(audio);
  };

  const stopAllSounds = () => {
    playingSounds.forEach((audio) => audio.pause());
    playingSounds.clear();
  };

  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, []);

  return (
    <SoundContext.Provider value={{ playSound, stopAllSounds }}>{children}</SoundContext.Provider>
  );
};
