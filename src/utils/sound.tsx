'use client';

import { createContext, ReactNode, useContext, useEffect, useRef } from 'react';

interface SoundContextProps {
  playSound: (src: string) => void;
  stopSound: () => void;
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
  const currentSoundRef = useRef<HTMLAudioElement | null>(null);

  const getAudio = (fileName: string): HTMLAudioElement => {
    if (!audioPool[fileName]) {
      audioPool[fileName] = new Audio(`/sounds/${fileName}.mp3`);
    }
    return audioPool[fileName];
  };

  const playSound = (fileName: string) => {
    if (currentSoundRef.current) {
      currentSoundRef.current.pause();
    }
    const audio = getAudio(fileName);
    currentSoundRef.current = audio;
    audio.play();
  };

  const stopSound = () => {
    if (currentSoundRef.current) {
      currentSoundRef.current.pause();
      currentSoundRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  return <SoundContext.Provider value={{ playSound, stopSound }}>{children}</SoundContext.Provider>;
};
