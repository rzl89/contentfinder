import { create } from 'zustand';
import type { ContentCategory, CategorySubcategory } from '@/types';

export type Language = 'id' | 'en';

export function getLocalizedCategory(cat: ContentCategory, lang: Language): ContentCategory {
  if (lang === 'id') return cat;
  return {
    ...cat,
    name: cat.nameEn || cat.name,
    description: cat.descriptionEn || cat.description,
    group: cat.groupEn || cat.group,
    subcategories: cat.subcategories.map((s) => ({
      ...s,
      name: s.nameEn || s.name,
      description: s.descriptionEn || s.description,
    })),
    creativeFramework: cat.creativeFrameworkEn || cat.creativeFramework,
    hookStyle: cat.hookStyleEn || cat.hookStyle,
    visualGuidance: cat.visualGuidanceEn || cat.visualGuidance,
    exampleIdeas: cat.exampleIdeasEn && cat.exampleIdeasEn.length > 0 ? cat.exampleIdeasEn : cat.exampleIdeas,
  };
}

export function getLocalizedSubcategory(subcat: CategorySubcategory, lang: Language): CategorySubcategory {
  if (lang === 'id') return subcat;
  return {
    ...subcat,
    name: subcat.nameEn || subcat.name,
    description: subcat.descriptionEn || subcat.description,
  };
}

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (id: string, en: string) => string;
  localizeCategory: (cat: ContentCategory) => ContentCategory;
  localizeSubcategory: (subcat: CategorySubcategory) => CategorySubcategory;
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

  localizeCategory: (cat: ContentCategory) => {
    return getLocalizedCategory(cat, get().language);
  },

  localizeSubcategory: (subcat: CategorySubcategory) => {
    return getLocalizedSubcategory(subcat, get().language);
  },
}));
