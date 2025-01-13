import React from 'react'
import {i18n} from '@lingui/core'
import {I18nProvider as DefaultI18nProvider} from '@lingui/react'

import {useLocaleLanguage} from './i18n'

export default function I18nProvider({children}: {children: React.ReactNode}) {
  useLocaleLanguage()
  return <DefaultI18nProvider i18n={i18n}>{children}</DefaultI18nProvider>
}
import { enUS, vi } from "date-fns/locale";
import { useLanguagePrefs } from '@/state/preferences'
export const LOCALE_MAP = {
  en: enUS,
  vi: vi,
  // Add more locales as needed
} as const;
export function useDateFnsLocale() {
  const langPrefs = useLanguagePrefs();
  const locale = LOCALE_MAP[langPrefs.appLanguage as keyof typeof LOCALE_MAP];
  return locale;
}