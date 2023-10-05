'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface MusicData {
  isPlaying: boolean;
  handlePlayOrPause: () => void;
  handleChangeTrack: (direction: 'next' | 'previous') => void;
  currentTrack: string;
  albumName: string;
  artist: string;
  albumImage: string;
}

interface MusicContextProps {
  musicData: MusicData;
  setMusicData: (data: Partial<MusicData>) => void;
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
  const [musicData, setMusicDataState] = useState<MusicData>({
    isPlaying: false,
    handlePlayOrPause: () => {},
    handleChangeTrack: () => 'next',
    currentTrack: '',
    albumName: '',
    artist: '',
    albumImage: '',
  });

  const setMusicData = useCallback((data: Partial<MusicData>) => {
    setMusicDataState((prevData) => ({ ...prevData, ...data }));
  }, []);

  const playOrPause = useCallback(() => {
    setMusicData({ isPlaying: !musicData.isPlaying });
  }, [musicData.isPlaying, setMusicData]);

  const value = useMemo(
    () => ({ musicData, playOrPause, setMusicData }),
    [musicData, playOrPause, setMusicData],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};
