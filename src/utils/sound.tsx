import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [sound, setSound] = useState<HTMLAudioElement | null>(null);

  const playSound = (src: string) => {
    const audio = new Audio(src);
    setSound(audio);
    audio.play();
  };

  const stopSound = () => {
    if (sound) sound.pause();
  };

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, [sound]);

  return <SoundContext.Provider value={{ playSound, stopSound }}>{children}</SoundContext.Provider>;
};
