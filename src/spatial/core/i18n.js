export const LANGUAGES = ['zh', 'en'];
export const normalizeLanguage = value => LANGUAGES.includes(value) ? value : 'zh';

// Scene labels use [zh, en]; network content uses {zh, en}. One language contract.
export function localized(value, language = 'zh') {
  if (typeof value === 'string') return value;
  const lang = normalizeLanguage(language);
  return Array.isArray(value) ? value[lang === 'zh' ? 0 : 1] || value[0] || '' : value?.[lang] || value?.zh || value?.en || '';
}
export const translator = language => ({
  t: (zh, en) => localized([zh, en], language),
  tx: value => localized(value, language)
});
export const hasBothLanguages = value => LANGUAGES.every((lang, i) => typeof (Array.isArray(value) ? value[i] : value?.[lang]) === 'string' && (Array.isArray(value) ? value[i] : value[lang]).trim().length > 0);
