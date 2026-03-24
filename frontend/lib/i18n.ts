import en from '@/messages/en.json';
import vi from '@/messages/vi.json';
import zh from '@/messages/zh.json';

export const messages = {
  en,
  vi,
  zh
};

export const locales = ['en', 'vi', 'zh'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

export function getMessages(locale: Locale) {
  return messages[locale] || messages[defaultLocale];
}
