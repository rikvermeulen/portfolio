// Global types

export interface RootLayoutProps {
  children: React.ReactNode;
}

//Form messages
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

//Music
export interface Track {
  preview_url: string | null;
  album: { images: [{ url: string }, { url: string }]; name: string };
  name: string;
  artists: [{ name: string }];
  explicit: boolean;
}

export interface PlaylistItem {
  track: Track;
}

//shows
export type Episode = {
  still_path: string;
  name: string;
  season_number: number;
  episode_number: number;
};

export type ShowOrMovie = {
  backdrop_path: string;
  name?: string;
  title?: string;
  overview: string;
};

export type PropsShows = {
  current: Episode;
  movies: ShowOrMovie[];
  shows: ShowOrMovie[];
};

//profiles:
export enum ProfileName {
  Working = 'Working',
  Sleeping = 'Sleeping',
  NotWorking = 'Not Working',
  Personal = 'Personal',
}

export type Profile = {
  icon: string;
  label: string;
  days: Set<string>;
  startTime?: number;
  endTime?: number;
};
