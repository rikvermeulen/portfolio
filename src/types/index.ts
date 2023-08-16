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
  album: { images: [{ url: string }]; name: string };
  name: string;
  artists: [{ name: string }];
  explicit: boolean;
}

export interface PlaylistItem {
  track: Track;
}
