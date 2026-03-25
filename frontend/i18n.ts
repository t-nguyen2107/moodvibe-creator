import {getRequestConfig} from 'next-intl/server';
import {locales, type Locale, getMessages} from './lib/i18n';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    return {
      locale: 'en',
      messages: getMessages('en')
    };
  }

  return {
    locale: locale as Locale,
    messages: getMessages(locale as Locale)
  };
});
