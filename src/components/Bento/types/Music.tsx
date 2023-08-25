'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { PlaylistItem } from '@/types/index';

import AudioPlayer from '@/components/AudioPlayer';
import Icon from '@/components/Icons/Icon';

import cc from '@/lib/cc';

import Bento from '../Bento';

interface MusicProps {
  playlist: PlaylistItem[];
  className?: string;
}

const Music: React.FC<MusicProps> = ({ playlist = [], className }) => {
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistItem[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPulse, setShowPulse] = useState(false);
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

  const handlePlayOrPause = () => {
    playOrPause();
    setShowPulse(true);
    setTimeout(() => setShowPulse(false), 600);
  };

  useEffect(() => {
    const tracksWithPreview = playlist.filter((track) => !!track.track.preview_url);
    setPlaylistTracks(tracksWithPreview);
    const initialPreviewUrl = tracksWithPreview[0]?.track?.preview_url;
    if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
    }
  }, [playlist]);

  const currentTrack = playlistTracks[currentTrackIndex]?.track;

  const image = currentTrack?.album?.images[1]?.url || '/images/noalbum.png';

  return (
    <Bento size="1x1" className={cc(className, isPlaying && '', 'bento relative z-0 !border-none')}>
      <div className="absolute right-0 z-20 p-5">
        <a href="https://music.apple.com/nl/playlist/r-b/pl.u-38oWX9ECd2XAl3" target="_blank">
          <Image
            src="/images/icons/music.png"
            className={`${
              isPlaying && 'rounded-md bg-gradient-to-b from-[#E96575] to-[#E63F45]'
            } drop-shadow-md transition-transform duration-300 ease-in-out hover:scale-105`}
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
        <div className="m-auto mt-4 flex w-full max-w-[184px] items-center justify-between">
          <button
            onClick={() => changeTrack('previous')}
            className="w-5 fill-white"
            name="Previous song"
            aria-label="Previous song"
          >
            <Icon type="next" />
          </button>
          <button
            onClick={handlePlayOrPause}
            className={cc(
              showPulse ? 'button' : '',
              'relative flex h-6 w-6 justify-center fill-white',
            )}
            name="Play / Pause"
            aria-label="Play / Pause"
          >
            <Icon
              type="pause"
              className={cc(
                isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
                'h-full transition-[opacity,transform] duration-300 ease-in-out active:scale-90',
              )}
            />
            <Icon
              type="play"
              className={cc(
                !isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
                'transition-[opacity,transform] duration-300 ease-in-out absolute active:scale-90 h-full',
              )}
            />
          </button>
          <button
            onClick={() => changeTrack('next')}
            className="w-5 -scale-x-100 fill-white"
            name="Next song"
            aria-label="Next song"
          >
            <Icon type="next" />
          </button>
        </div>
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
            className="slider"
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

export default Music;
