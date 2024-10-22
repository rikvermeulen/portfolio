'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

import { IPlaylistItem } from '@/types/types';

import AudioControls from '@/components/AudioControls';
import Bento from '@/components/Bento/Bento';
import Icon from '@/components/Icons/Icon';

import AudioPlayer from '@/hooks/useAudioPlayer';
import cc from '@/lib/cc';

interface MusicProps {
  playlist: IPlaylistItem[];
  className?: string;
}

const Music: React.FC<MusicProps> = ({ playlist = [], className }) => {
  const [playlistTracks, setPlaylistTracks] = useState<IPlaylistItem[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [pulsedButton, setPulsedButton] = useState<null | 'playPause' | 'previous' | 'next'>(null);
  const {
    audioRef,
    isPlaying,
    previewUrl,
    setPreviewUrl,
    playOrPause,
    handleVolumeChange,
    changeTrack,
    handleTimeUpdate,
  } = AudioPlayer({
    initialUrl: '',
    playlistTracks: playlistTracks,
    currentTrackIndex,
    setCurrentTrackIndex,
  });

  const handlePlayOrPause = useCallback(() => {
    playOrPause();
    setPulsedButton('playPause');
    setTimeout(() => setPulsedButton(null), 600);
  }, [playOrPause, setPulsedButton]);

  const handleChangeTrack = useCallback(
    (direction: 'previous' | 'next') => {
      changeTrack(direction);
      setPulsedButton(direction);
      setTimeout(() => setPulsedButton(null), 600);
    },
    [changeTrack, setPulsedButton],
  );

  useEffect(() => {
    const tracksWithPreview = playlist.filter((track) => !!track.track.preview_url);
    setPlaylistTracks(tracksWithPreview);
    const initialPreviewUrl = tracksWithPreview[0]?.track?.preview_url;
    if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
    }
  }, [playlist, setPreviewUrl]);

  const currentTrack = useMemo(
    () => playlistTracks[currentTrackIndex]?.track,
    [playlistTracks, currentTrackIndex],
  );

  const image = currentTrack?.album?.images[1]?.url || '/images/noalbum.png';

  return (
    <Bento
      size="1x1"
      className={cc(
        className,
        'bento relative z-0 !border-none bg-gradient-to-b from-[#E96575] to-[#ff333a]',
      )}
    >
      <div className="absolute right-0 z-20 p-5">
        <a href="https://music.apple.com/nl/playlist/r-b/pl.u-38oWX9ECd2XAl3" target="_blank">
          <Image
            src="/images/icons/music.png"
            className={`${
              isPlaying && 'rounded-md bg-gradient-to-b from-[#EA6776] to-[#E63E44] drop-shadow-md'
            } transition-transform duration-300 ease-in-out hover:scale-105`}
            alt="media"
            width={32}
            height={32}
          />
        </a>
      </div>
      <div
        className={`inset absolute z-0 h-full w-full bg-cover contrast-[0.90] transition-opacity duration-500 ease-in-out ${
          isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: image ? `url(${image})` : '',
        }}
      >
        <div className=" h-full w-full backdrop-blur-xl"></div>
      </div>
      <div className={'relative z-10 h-full p-5'}>
        <div className="flex h-40 w-full items-center justify-center">
          {image && (
            <Image
              src={image}
              priority
              alt={currentTrack?.album.name || 'No album'}
              width={144}
              height={144}
              className={cc(
                isPlaying ? 'pop-up' : 'pop-down',
                'rounded-md drop-shadow-md duration-300 ease-in-out transition-transform scale-100',
              )}
            />
          )}
        </div>
        <div className="mt-3 flex flex-col text-sm text-white">
          <div className="flex items-center gap-2">
            <p className="font-bold">{currentTrack?.name}</p>
            {currentTrack?.explicit && <Icon type="explicit" className="w-2.5" />}
          </div>
          <div className="relative -top-1 text-white/70">{currentTrack?.artists[0].name}</div>
        </div>
        <AudioControls
          isPlaying={isPlaying}
          pulsedButton={pulsedButton}
          handlePlayOrPause={handlePlayOrPause}
          handleChangeTrack={handleChangeTrack}
        />
        <label className="mt-6 flex items-center justify-center gap-4" htmlFor="rangeMusic">
          <Icon type="mute" className="w-2 fill-white" />
          <span className="sr-only">Volume control for the music player</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            defaultValue="0.5"
            id="rangeMusic"
            name="rangeMusic"
            aria-describedby="rangeMusic"
            onChange={handleVolumeChange}
            className="slider h-1 w-[70%] scale-100 appearance-none rounded-full opacity-80 outline-none transition-[opacity,width,background,opacity] duration-200 ease-linear active:w-9/12 active:scale-y-[1.4] active:opacity-100"
            style={{ '--background-size': '50%' } as React.CSSProperties}
          />
          <Icon type="sound" className="w-3.5 fill-white" />
        </label>
        <audio ref={audioRef} style={{ display: 'none' }} onTimeUpdate={handleTimeUpdate}>
          <source src={previewUrl || ''} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </Bento>
  );
};

export default memo(Music);
