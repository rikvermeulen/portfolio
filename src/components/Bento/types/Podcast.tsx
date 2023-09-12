'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

import AudioPlayer from '@/components/AudioPlayer';
import Icon from '@/components/Icons/Icon';

import cc from '@/lib/cc';
import truncateText from '@/utils/truncateText';

import Bento from '../Bento';

interface PodcastProps {
  playlist: PodcastItem[];
  className?: string;
}

export interface PodcastItem {
  audio_preview_url: string;
  images: [{ url: string }, { url: string }];
  name: string;
  explicit: boolean;
}

const Podcast: React.FC<PodcastProps> = ({ playlist = [], className }) => {
  const [playlistTracks, setPlaylistTracks] = useState<PodcastItem[]>([]);
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
    const tracksWithPreview = playlist.filter((track) => !!track.audio_preview_url);
    setPlaylistTracks(tracksWithPreview);
    const initialPreviewUrl = tracksWithPreview[0]?.audio_preview_url;
    if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
    }
  }, [playlist]);

  const currentTrack = useMemo(
    () => playlistTracks[currentTrackIndex],
    [playlistTracks, currentTrackIndex],
  );

  const image = currentTrack?.images[1]?.url || '/images/noalbum.png';

  return (
    <Bento size="1x1" className={cc(className, isPlaying && '', 'bento relative z-0 !border-none')}>
      <div className="absolute right-0 z-20 p-5">
        <a href="https://open.spotify.com/show/02fM1JHpt9HmHGp482K71b" target="_blank">
          <Image
            src="/images/icons/podcast.png"
            className={cc(
              isPlaying && ' bg-gradient-to-b from-[#BC6AEB] to-[#6E2AAD] ',
              'rounded-md p-1.5 drop-shadow-md transition-transform duration-300 ease-in-out hover:scale-105',
            )}
            alt="media"
            width={32}
            height={32}
          />
        </a>
      </div>
      <div
        className={`absolute z-0 h-full w-full bg-cover contrast-[0.90] transition-opacity duration-500 ease-in-out ${
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
              alt={currentTrack?.name || 'No album'}
              width={144}
              height={144}
              className={cc(
                isPlaying ? 'pop-up' : 'pop-down',
                'rounded-md drop-shadow-md duration-300 transition-transform scale-100',
              )}
            />
          )}
        </div>
        <div className="mt-6 flex flex-col text-sm text-white">
          <div className="flex items-center gap-2">
            <p className="font-bold">{truncateText(currentTrack?.name || '', 40)}</p>
            {currentTrack?.explicit && <Icon type="explicit" className="w-2.5" />}
          </div>
          <div className="relative -top-1 text-white/70">Podcast</div>
        </div>
        <div className="m-auto mt-4 flex w-full max-w-[184px] items-center justify-between">
          <button
            onClick={() => handleChangeTrack('previous')}
            className={cc(pulsedButton === 'previous' ? 'button' : '', 'fill-white relative')}
            name="Previous song"
            aria-label="Previous song"
          >
            <Icon type="next" className={'relative -top-1 border-none outline-none'} />
          </button>
          <button
            onClick={handlePlayOrPause}
            className={cc(
              pulsedButton === 'playPause' ? 'button' : '',
              'relative flex h-6 w-6 justify-center fill-white',
            )}
            name="Play / Pause"
            aria-label="Play / Pause"
          >
            <Icon
              type="pause"
              className={cc(
                isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
                'h-full transition-[opacity,transform] duration-300 active:scale-90',
              )}
            />
            <Icon
              type="play"
              className={cc(
                !isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
                'transition-[opacity,transform] duration-300 absolute active:scale-90 h-full',
              )}
            />
          </button>
          <button
            onClick={() => handleChangeTrack('next')}
            className={cc(pulsedButton === 'next' ? 'button' : '', '-scale-x-100 fill-white')}
            name="Next song"
            aria-label="Next song"
            title="Next song"
          >
            <Icon type="next" className={'relative -top-1 border-none outline-none'} />
          </button>
        </div>
        <label className="mt-6 flex items-center justify-center gap-4" htmlFor="rangePodcast">
          <Icon type="mute" className="w-1.5 fill-white" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            defaultValue="0.5"
            id="rangePodcast"
            name="rangePodcast"
            onChange={handleVolumeChange}
            className="slider"
            style={{ '--background-size': '50%' } as React.CSSProperties}
          />
          <Icon type="sound" className="w-3 fill-white" />
        </label>
        <audio ref={audioRef} style={{ display: 'none' }} onTimeUpdate={handleTimeUpdate}>
          <source src={previewUrl || ''} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </Bento>
  );
};

export default memo(Podcast);
