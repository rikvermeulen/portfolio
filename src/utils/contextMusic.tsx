'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface MusicContextProps {
  musicData: {
    isPlaying: boolean;
    currentTrack: string;
    albumName: string;
    artist: string;
    albumImage: string;
  };
  setMusicData: (data: any) => void;
  playOrPause: () => void;
}

const MusicContext = createContext<MusicContextProps | undefined>(undefined);

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [musicData, setMusicData] = useState({
    isPlaying: false,
    currentTrack: '',
    albumName: '',
    artist: '',
    albumImage: '',
  });

  const playOrPause = () => {
    setMusicData((prevData) => ({ ...prevData, isPlaying: !prevData.isPlaying }));
  };

  return (
    <MusicContext.Provider value={{ musicData, playOrPause, setMusicData }}>
      {children}
    </MusicContext.Provider>
  );
};
