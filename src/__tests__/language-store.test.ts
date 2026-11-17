import { describe, it, expect, beforeEach } from 'vitest';
import { useLanguageStore } from '../stores/language-store';

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
});
