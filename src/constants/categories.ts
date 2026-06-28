export interface MemeCategory {
  id: string;
  label: string;
  icon: string; // emoji
}

export const MEME_CATEGORIES: MemeCategory[] = [
  { id: 'funny', label: 'Drôle', icon: '😂' },
  { id: 'sarcastic', label: 'Sarcastique', icon: '😏' },
  { id: 'motivation', label: 'Motivation', icon: '💪' },
  { id: 'relatable', label: 'Relatable', icon: '🙃' },
  { id: 'dark', label: 'Humour noir', icon: '🖤' },
  { id: 'trending', label: 'Tendance', icon: '🔥' },
];

// Branching note:
// Import `MEME_CATEGORIES` in your screen or navigation, e.g.:
// import { MEME_CATEGORIES } from 'src/constants/categories';
// Use it to render category chips in the MemeGeneratorScreen.
