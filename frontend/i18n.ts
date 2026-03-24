import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const { getMessages } = await import('./lib/i18n');
  return {
    messages: getMessages(locale)
  };
});
