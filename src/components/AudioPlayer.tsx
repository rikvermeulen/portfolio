import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAudioPlayerProps {
  initialUrl: string;
}

const AudioPlayer = ({ initialUrl }: UseAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);

  const fadeOut = useCallback(() => {
    if (!audioRef.current) return;

    const fadeDuration = 200;
    const originalVolume = audioRef.current.volume;
    const step = originalVolume / (fadeDuration / 10);
    const fade = () => {
      if (!audioRef.current) return;

      const newVolume = audioRef.current.volume - step;
      audioRef.current.volume = Math.max(newVolume, 0);

      if (audioRef.current.volume > 0) {
        setTimeout(fade, 10);
      } else {
        audioRef.current.pause();
        audioRef.current.volume = originalVolume;
        setIsPlaying(false);
      }
    };

    fade();
  }, [audioRef]);

  const playPause = useCallback(() => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().catch((error) => {
        console.error('Error playing the audio:', error);
      });
      setIsPlaying(true);
    } else {
      fadeOut();
    }
  }, [audioRef, fadeOut]);

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

  return {
    audioRef,
    isPlaying,
    setIsPlaying,
    previewUrl,
    setPreviewUrl,
    playPause,
    handleTimeUpdate,
    fadeOut,
    endPreview,
  };
};

export default AudioPlayer;
