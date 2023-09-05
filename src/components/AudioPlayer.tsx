import { useCallback, useEffect, useRef, useState } from 'react';

import { PlaylistItem } from '@/types/index';

import { useMusic } from '@/utils/contextMusic';

export interface PodcastItem {
  audio_preview_url: string;
}
interface UseAudioPlayerProps {
  initialUrl: string;
  playlistTracks?: PlaylistItem[] | PodcastItem[];
  currentTrackIndex?: number;
  setCurrentTrackIndex?: (index: number) => void;
}

const AudioPlayer = ({
  initialUrl,
  playlistTracks = [],
  currentTrackIndex = 0,
  setCurrentTrackIndex,
}: UseAudioPlayerProps) => {
  const { setMusicData } = useMusic();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);

  const fadeOut = useCallback(() => {
    if (!audioRef.current) return;

    const fadeDuration = 400;
    const intervals = fadeDuration / 10;
    const originalVolume = audioRef.current.volume;
    const step = originalVolume / intervals;

    let fadeCounter = 0;

    const fade = () => {
      if (!audioRef.current) return;

      const newVolume = audioRef.current.volume - step;
      audioRef.current.volume = Math.max(newVolume, 0);
      fadeCounter++;

      if (fadeCounter < intervals) {
        setTimeout(fade, 10);
      } else {
        audioRef.current.pause();
        audioRef.current.volume = originalVolume;
        setIsPlaying(false);
      }
    };

    fade();
  }, [audioRef]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const size = (e.target.valueAsNumber / Number(e.target.max)) * 100;
      e.target.style.setProperty('--background-size', `${size}%`);
      if (audioRef.current) {
        audioRef.current.volume = e.target.valueAsNumber;
      }
    },
    [audioRef],
  );

  const changeTrack = useCallback(
    (direction: 'next' | 'previous') => {
      if (!setCurrentTrackIndex) return;

      const modifier = direction === 'next' ? 1 : -1;
      const newIndex =
        (currentTrackIndex + modifier + playlistTracks.length) % playlistTracks.length;
      setCurrentTrackIndex(newIndex);
      if ('track' in playlistTracks[newIndex]) {
        const track = playlistTracks[newIndex] as PlaylistItem;
        setPreviewUrl(track.track?.preview_url);
      } else if ('audio_preview_url' in playlistTracks[newIndex]) {
        const podcast = playlistTracks[newIndex] as PodcastItem;
        setPreviewUrl(podcast.audio_preview_url);
      }

      if (isPlaying && audioRef.current) {
        audioRef.current.play();
      }
    },
    [currentTrackIndex, playlistTracks, isPlaying, audioRef],
  );

  const immediatePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const playOrPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch((error) => {
          console.error('Error playing the audio:', error);
        });
        setIsPlaying(true);
      } else {
        fadeOut();
        // immediatePause();
      }
    }
  };

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime >= 26) {
      endPreview();
    }
  }, [audioRef]);

  const endPreview = useCallback(() => {
    if (!audioRef.current) return;

    fadeOut();
    audioRef.current.currentTime = 0;
  }, [audioRef, fadeOut]);

  useEffect(() => {
    if (!audioRef.current) return;

    const newPreviewUrl = previewUrl || '';
    audioRef.current.src = newPreviewUrl;
    audioRef.current.load();

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error('Error playing the audio:', error);
      });
    }

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
  }, [previewUrl, isPlaying, handleTimeUpdate]);

  useEffect(() => {
    const currentTrack = playlistTracks[currentTrackIndex];

    if (!currentTrack) return;

    setMusicData({
      isPlaying,
      currentTrack: 'track' in currentTrack ? currentTrack?.track?.name : '',
      albumName: 'track' in currentTrack ? currentTrack?.track?.album?.name : '',
      artist: 'track' in currentTrack ? currentTrack?.track?.artists[0]?.name : '',
      albumImage: 'track' in currentTrack ? currentTrack?.track?.album?.images[0]?.url : '',
    });
  }, [isPlaying, currentTrackIndex, playlistTracks, setMusicData]);

  return {
    audioRef,
    isPlaying,
    setIsPlaying,
    previewUrl,
    setPreviewUrl,
    playOrPause,
    handleVolumeChange,
    changeTrack,
    handleTimeUpdate,
  };
};

export default AudioPlayer;
