'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SpotifyWebApi from 'spotify-web-api-js';

import { PlaylistItem } from '@/types/index';

import AudioPlayer from '@/components/AudioPlayer';
import Icon from '@/components/Icons/Icon';

import Bento from '../Bento';

const spotifyApi = new SpotifyWebApi();

const Music: React.FC = () => {
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistItem[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const { audioRef, isPlaying, playPause, previewUrl, setPreviewUrl, handleTimeUpdate } =
    AudioPlayer({ initialUrl: '' });

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { min, max, value } = e.target;
      const size = ((+value - +min) / (+max - +min)) * 100;
      e.target.style.setProperty('--background-size', `${size}%`);

      if (audioRef.current) {
        audioRef.current.volume = e.target.valueAsNumber;
      }
    },
    [audioRef],
  );

  const nextTrack = useCallback(() => {
    const newIndex = (currentTrackIndex + 1) % playlistTracks.length;
    setCurrentTrackIndex(newIndex);
    setPreviewUrl(playlistTracks[newIndex]?.track.preview_url || '');

    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    }
  }, [currentTrackIndex, playlistTracks, isPlaying, audioRef]);

  const prevTrack = useCallback(() => {
    const newIndex = (currentTrackIndex - 1 + playlistTracks.length) % playlistTracks.length;
    setCurrentTrackIndex(newIndex);
    setPreviewUrl(playlistTracks[newIndex]?.track.preview_url || '');

    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    }
  }, [currentTrackIndex, playlistTracks, isPlaying, audioRef]);

  useEffect(() => {
    fetch('/api/spotify')
      .then((response) => response.json())
      .then((data) => {
        spotifyApi.setAccessToken(data.access_token);
        return spotifyApi.getPlaylistTracks('0fYuugKPmiqUI38RCgKBEB');
      })
      .then((response) => {
        setPlaylistTracks(response.items as unknown as PlaylistItem[]);
        const track = response.items[0]?.track;
        if ('preview_url' in track) {
          const initialPreviewUrl = track.preview_url;
          if (initialPreviewUrl) {
            setPreviewUrl(initialPreviewUrl);
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching Spotify data:', error);
      });
  }, []);

  const currentTrack = playlistTracks[currentTrackIndex]?.track;
  const image = currentTrack?.album.images[0]?.url || '/images/noalbum.png';

  return (
    <Bento
      size="1x1"
      className={`${
        isPlaying && '!border-none'
      } bento relative z-0 bg-gradient-to-b from-[#E96575] to-[#E63F45]`}
    >
      <div className="absolute right-0 z-20 p-5">
        <Link href="">
          <Image
            src="/images/icons/music.png"
            className={`${
              isPlaying && 'rounded-md bg-gradient-to-b from-[#E96575] to-[#E63F45]'
            } drop-shadow-md transition-transform duration-300 hover:scale-105`}
            alt="media"
            width={32}
            height={32}
          />
        </Link>
      </div>
      <div
        className={`inset absolute z-0 h-full w-full bg-cover transition-opacity duration-500 ease-in-out ${
          isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: image ? `url(${image})` : '',
        }}
      >
        <div className=" h-full w-full backdrop-blur-xl"></div>
      </div>
      <div className={'relative z-10 h-full p-5'}>
        <div className="flex w-full items-center justify-center">
          {image && (
            <Image
              src={image}
              alt={currentTrack?.album.name || 'No album'}
              width={164}
              height={164}
              className="rounded-md drop-shadow-md"
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
        <div className="mt-4 flex w-full items-center justify-around">
          <button onClick={prevTrack} className="w-5 fill-white">
            <Icon type="next" />
          </button>
          <button onClick={playPause} className="h-6 w-6 fill-white">
            {isPlaying ? <Icon type="pause" /> : <Icon type="play" />}
          </button>
          <button onClick={nextTrack} className="w-5 -scale-x-100 fill-white">
            <Icon type="next" />
          </button>
        </div>
        <label className="mt-6 flex items-center justify-center gap-4">
          <Icon type="mute" className="w-2 fill-white" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            defaultValue="0.5"
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
