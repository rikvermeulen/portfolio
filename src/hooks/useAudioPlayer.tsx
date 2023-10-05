import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { UseAudioPlayerProps } from '@/types/types';

import { useMusic } from '@/utils/contextMusic';

const useAudioPlayer = ({
  initialUrl,
  playlistTracks = [],
  currentTrackIndex = 0,
  setCurrentTrackIndex,
}: UseAudioPlayerProps) => {
  const { setMusicData } = useMusic();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);

  const fadeAudioOut = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const fadeDuration = 400;
    const intervals = fadeDuration / 10;
    const originalVolume = audio.volume;
    const step = originalVolume / intervals;
    let fadeCounter = 0;

    const fade = () => {
      if (!audio) return;

      audio.volume = Math.max(audio.volume - step, 0);
      fadeCounter++;

      if (fadeCounter < intervals) {
        setTimeout(fade, 10);
      } else {
        audio.pause();
        audio.volume = originalVolume;
        setIsPlaying(false);
      }
    };
    fade();
  }, []);

  const handleVolumeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const size = (e.target.valueAsNumber / Number(e.target.max)) * 100;
    e.target.style.setProperty('--background-size', `${size}%`);
    if (audioRef.current) {
      audioRef.current.volume = e.target.valueAsNumber;
    }
  }, []);

  const changeTrack = useCallback(
    (direction: 'next' | 'previous') => {
      if (!setCurrentTrackIndex) return;

      const newIndex =
        (currentTrackIndex + (direction === 'next' ? 1 : -1) + playlistTracks.length) %
        playlistTracks.length;
      setCurrentTrackIndex(newIndex);

      const newTrack = playlistTracks[newIndex];
      setPreviewUrl('track' in newTrack ? newTrack.track?.preview_url : newTrack.audio_preview_url);

      if (isPlaying && audioRef.current) {
        audioRef.current.play();
      }
    },
    [currentTrackIndex, isPlaying, playlistTracks, setCurrentTrackIndex],
  );

  const playOrPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(console.error);
      setIsPlaying(true);
    } else {
      fadeAudioOut();
    }
  }, [fadeAudioOut]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime >= 26) {
      endPreview();
    }
  }, [audioRef]);

  const endPreview = useCallback(() => {
    if (!audioRef.current) return;

    fadeAudioOut();
    audioRef.current.currentTime = 0;
  }, [audioRef, fadeAudioOut]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = previewUrl || '';
    audio.load();

    if (isPlaying) {
      audio.play().catch(console.error);
    }

    const handleTimeUpdate = () => {
      if (audio.currentTime >= 26) fadeAudioOut();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [previewUrl, isPlaying, fadeAudioOut]);

  useEffect(() => {
    const currentTrack = playlistTracks[currentTrackIndex];

    if (!currentTrack) return;

    const isTrack = 'track' in currentTrack;

    const trackStatus = {
      isPlaying,
      handlePlayOrPause: playOrPause,
      handleChangeTrack: changeTrack,
    };

    if (isTrack) {
      const { name, album, artists } = currentTrack?.track;
      setMusicData({
        ...trackStatus,
        currentTrack: name,
        albumName: album?.name,
        artist: artists[0]?.name,
        albumImage: album?.images[0]?.url,
      });
    } else {
      setMusicData({
        ...trackStatus,
        currentTrack: currentTrack.name,
        albumName: currentTrack.name,
        artist: 'Podcast',
        albumImage: currentTrack.images[0]?.url,
      });
    }
  }, [isPlaying, currentTrackIndex, playlistTracks, setMusicData, playOrPause, changeTrack]);

  return useMemo(
    () => ({
      audioRef,
      isPlaying,
      setIsPlaying,
      previewUrl,
      setPreviewUrl,
      playOrPause,
      handleVolumeChange,
      changeTrack,
      handleTimeUpdate,
    }),
    [
      audioRef,
      isPlaying,
      previewUrl,
      playOrPause,
      handleVolumeChange,
      changeTrack,
      handleTimeUpdate,
    ],
  );
};

export default useAudioPlayer;
