// ---------------------
// Global Types
// ---------------------

import { CONTRIBUTION_LEVELS } from '@/types/const';

export interface IRootLayoutProps {
  children: React.ReactNode;
}

// ---------------------
// Form Messages
// ---------------------

export interface IMessage {
  sender: 'admin' | 'user';
  text: string;
}

export interface IUserData {
  name: string;
  reason: string;
  phone: string;
  email: string;
}

export interface IQuestionAction {
  question: string | string[];
  action: (message: string, userData: IUserData) => IUserData;
}

// ---------------------
// Music Types
// ---------------------

export interface ITrack {
  preview_url: string | null;
  album: { images: [{ url: string }, { url: string }]; name: string };
  name: string;
  artists: [{ name: string }];
  explicit: boolean;
}

export interface IPlaylistItem {
  track: ITrack;
}

export interface UseAudioPlayerProps {
  initialUrl: string;
  playlistTracks?: IPlaylistItem[] | PodcastItem[];
  currentTrackIndex?: number;
  setCurrentTrackIndex?: (index: number) => void;
}

// ---------------------
// Podcast Types
// ---------------------

export interface PodcastProps {
  playlist: PodcastItem[];
  className?: string;
}

export interface PodcastItem {
  audio_preview_url: string;
  images: [{ url: string }, { url: string }];
  name: string;
  explicit: boolean;
}

// ---------------------
// Show Types
// ---------------------

export type TEpisode = {
  still_path: string;
  name: string;
  season_number: number;
  episode_number: number;
  show_id: string;
};

export type TShowOrMovie = {
  backdrop_path: string;
  name?: string;
  title?: string;
  overview: string;
};

export type TPropsShows = {
  current: TEpisode;
  movies: TShowOrMovie[];
  shows: TShowOrMovie[];
};

export type TMovieListProps = {
  isListVisible: boolean;
  toggleListVisibility: () => void;
  filter: string;
  setFilter: (filterType: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  movies: TShowOrMovie[];
  shows: TShowOrMovie[];
};
// ---------------------
// Profile Types
// ---------------------

export enum EProfileName {
  Working = 'Working',
  Sleeping = 'Sleeping',
  NotWorking = 'Not Working',
  Personal = 'Personal',
}

export type TProfile = {
  icon: string;
  label: string;
  days: Set<string>;
  startTime?: number;
  endTime?: number;
};

// ---------------------
// GitHub Types
// ---------------------

export type TContributionOptions = {
  from?: string;
  to?: string;
};

export type TContributionDay = {
  contributionCount: number;
  contributionLevel: TContributionLevelName;
  date: string;
  color: string;
  border: string;
};

export type TContributionLevelName = keyof typeof CONTRIBUTION_LEVELS;

export type TMonthlyContributions = {
  [key: string]: TContributionDay[];
};
