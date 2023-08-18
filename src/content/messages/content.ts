import { IMessage, IQuestionAction } from '@/types/index';

export const initialMessages: IMessage[] = [
  {
    sender: 'admin',
    text: 'want to work together? just want to chat? send me a text here (no, for real)',
  },
  { sender: 'user', text: 'sounds good 🙏' },
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
    question: ['ahh I see 👀', 'What is your phone number? 📱'],
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
    url: '/',
  },
];
