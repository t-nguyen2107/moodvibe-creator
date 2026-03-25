'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    // Get the current pathname without the locale prefix
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');

    router.push(newPathname);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">
        🌐
      </span>
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value as Locale)}
        className="text-sm border rounded px-2 py-1 bg-white"
      >
        <option value="en">English</option>
        <option value="vi">Tiếng Việt</option>
        <option value="zh">中文</option>
      </select>
    </div>
  );
}
