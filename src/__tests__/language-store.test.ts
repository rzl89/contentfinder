import { describe, it, expect, beforeEach } from 'vitest';
import { useLanguageStore, getLocalizedCategory } from '../stores/language-store';
import { getLocalizedCategories, getCategoryById, CONTENT_CATEGORIES } from '../context-engine';

describe('useLanguageStore — Language Switching & Translation Logic', () => {
  beforeEach(() => {
    useLanguageStore.setState({ language: 'id' });
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  });

  it('initializes with default language as id', () => {
    expect(useLanguageStore.getState().language).toBe('id');
  });

  it('switches to en and returns english strings via t helper', () => {
    const { setLanguage, t } = useLanguageStore.getState();
    setLanguage('en');

    expect(useLanguageStore.getState().language).toBe('en');
    expect(t('Halo Dunia', 'Hello World')).toBe('Hello World');
    expect(t('Trend Radar Studio', 'Trend Radar Studio')).toBe('Trend Radar Studio');
  });

  it('switches to id and returns indonesian strings via t helper', () => {
    const { setLanguage, t } = useLanguageStore.getState();
    setLanguage('en');
    setLanguage('id');

    expect(useLanguageStore.getState().language).toBe('id');
    expect(t('Halo Dunia', 'Hello World')).toBe('Halo Dunia');
  });

  it('toggles language between id and en', () => {
    const { toggleLanguage } = useLanguageStore.getState();
    toggleLanguage();
    expect(useLanguageStore.getState().language).toBe('en');

    toggleLanguage();
    expect(useLanguageStore.getState().language).toBe('id');
  });

  it('localizes all 31 categories properly when switching to English', () => {
    const categoriesId = getLocalizedCategories('id');
    const categoriesEn = getLocalizedCategories('en');

    expect(categoriesId).toHaveLength(31);
    expect(categoriesEn).toHaveLength(31);

    // In Indonesian
    const timeTravelId = categoriesId.find((c) => c.id === 'time-travel');
    expect(timeTravelId?.name).toBe('Perjalanan Waktu & POV Sejarah');
    expect(timeTravelId?.subcategories[0].name).toBe('Sejarah & Peradaban');

    // In English
    const timeTravelEn = categoriesEn.find((c) => c.id === 'time-travel');
    expect(timeTravelEn?.name).toBe('Time Travel & Historical POV');
    expect(timeTravelEn?.subcategories[0].name).toBe('History & Civilizations');
    expect(timeTravelEn?.exampleIdeas[0]).toContain('POV: You are an ancient spice merchant');

    // Via getCategoryById
    const stickmanEn = getCategoryById('stickman', 'en');
    expect(stickmanEn?.name).toBe('Stickman Animation');
    expect(stickmanEn?.subcategories[0].name).toBe('Stickman Comedy');

    // Via localizeCategory store method
    useLanguageStore.getState().setLanguage('en');
    const localized = useLanguageStore.getState().localizeCategory(CONTENT_CATEGORIES[0]);
    expect(localized.name).toBe('Time Travel & Historical POV');
  });
});
