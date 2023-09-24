import { FC } from 'react';

import Icon from '@/components/Icons/Icon';

import cc from '@/lib/cc';

interface AudioControlsProps {
  isPlaying: boolean;
  pulsedButton: null | 'playPause' | 'previous' | 'next';
  handlePlayOrPause: () => void;
  handleChangeTrack: (direction: 'previous' | 'next') => void;
}

const AudioControls: FC<AudioControlsProps> = ({
  isPlaying,
  pulsedButton,
  handlePlayOrPause,
  handleChangeTrack,
}) => {
  return (
    <div className="m-auto mt-4 flex w-full max-w-[184px] items-center justify-between">
      <button
        onClick={() => handleChangeTrack('previous')}
        className={cc(
          pulsedButton === 'previous' ? 'button' : '',
          'fill-white relative outline-none border-none',
        )}
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
        onClick={() => handleChangeTrack('next')}
        className={cc(
          pulsedButton === 'next' ? 'button' : '',
          '-scale-x-100 fill-white border-none outline-none',
        )}
        name="Next song"
        aria-label="Next song"
      >
        <Icon type="next" className={'relative -top-1 border-none outline-none'} />
      </button>
    </div>
  );
};

export default AudioControls;
