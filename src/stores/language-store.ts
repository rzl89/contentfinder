import { create } from 'zustand';

export type Language = 'id' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (id: string, en: string) => string;
}

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'id';
  try {
    const saved = localStorage.getItem('fixprom_lang') as Language;
    if (saved === 'en' || saved === 'id') {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = saved;
      }
      return saved;
    }
  } catch {
    // fallback
  }
  return 'id';
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: getInitialLanguage(),

  setLanguage: (lang: Language) => {
    try {
      localStorage.setItem('fixprom_lang', lang);
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    set({ language: lang });
  },

  toggleLanguage: () => {
    const next = get().language === 'id' ? 'en' : 'id';
    get().setLanguage(next);
  },

  t: (id: string, en: string) => {
    return get().language === 'en' ? en : id;
  },
}));
