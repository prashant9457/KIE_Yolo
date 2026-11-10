export const LANGUAGES = Object.freeze([
  { value: 'original', label: 'Original label', name: 'Original label' },
  { value: 'en', label: 'English', name: 'English' },
  { value: 'hi', label: 'हिन्दी · Hindi', name: 'Hindi' },
  { value: 'es', label: 'Español · Spanish', name: 'Spanish' },
  { value: 'fr', label: 'Français · French', name: 'French' },
  { value: 'de', label: 'Deutsch · German', name: 'German' },
  { value: 'ar', label: 'العربية · Arabic', name: 'Arabic' },
]);

export const TRANSLATION_CODES = LANGUAGES.filter(({ value }) => value !== 'original').map(
  ({ value }) => value,
);
