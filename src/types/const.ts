import { IMessage, IQuestionAction, Profile, ProfileName } from '@/types/index';

//profiles
export const profiles: { [key in ProfileName]: Profile } = {
  [ProfileName.Working]: {
    icon: 'suitcase',
    label: 'Currently coding 💻',
    days: new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
    startTime: 9 * 60,
    endTime: 18 * 60,
  },
  [ProfileName.Sleeping]: {
    icon: 'moon',
    label: 'Sleeping 😴',
    days: new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    startTime: 22 * 60,
    endTime: 7 * 60,
  },
  [ProfileName.NotWorking]: {
    icon: 'controller',
    label: 'Weekend 😊',
    days: new Set(['Saturday', 'Sunday']),
  },
  [ProfileName.Personal]: {
    icon: 'person',
    label: 'Time off 🏖️',
    days: new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
    startTime: 18 * 60,
    endTime: 22 * 60,
  },
};

//Contact module
export const initialMessages: IMessage[] = [
  {
    sender: 'admin',
    text: 'Want to work together? just want to chat? send me a text here (no, for real)',
  },
  { sender: 'user', text: 'Sounds good 🙏' },
];

export const questionsAndActions: IQuestionAction[] = [
  {
    question: 'What is your name?',
    action: (message, userData) => ({ ...userData, name: message }),
  },
  {
    question: ['Nice to meet you 👋', 'So what did you want to talk about?'],
    action: (message, userData) => ({ ...userData, reason: message }),
  },
  {
    question: ['Ahh I see 👀', 'What is your phone number? 📱'],
    action: (message, userData) => ({ ...userData, phone: message }),
  },
  {
    question: 'What is your your email address? 📧',
    action: (message, userData) => ({ ...userData, email: message }),
  },
];

export const socials = [
  {
    name: 'Twitter',
    icon: 'twitter',
    url: 'https://twitter.com/rikvermeulen_',
  },
  {
    name: 'Github',
    icon: 'github',
    url: 'https://github.com/rikvermeulen',
  },
  {
    name: 'LinkedIn',
    icon: 'linkedin',
    url: 'https://www.linkedin.com/in/rik-vermeulen/',
  },
  {
    name: 'Mail',
    icon: 'gmail',
    url: 'mailto:rik.vermeulen.1997@live.nl',
  },
  {
    name: 'CV',
    icon: 'cv',
    url: 'https://gytlzoopugyodvbaxhpy.supabase.co/storage/v1/object/public/documents/CV-EN.pdf?t=2023-09-11T12%3A31%3A27.674Z',
  },
];

//main navigation links
export const MainNavigation = [
  {
    name: 'About',
    url: '/',
  },
  {
    name: 'Work',
    url: '/work',
  },
  {
    name: 'Archive',
    url: '/archive',
  },
];
