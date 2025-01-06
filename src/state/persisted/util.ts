import {parse} from 'bcp-47'

import {logger} from '@/logger'
import {Schema} from '@/state/persisted/schema'

export function normalizeData(data: Schema) {
  const next = {...data}

  /**
   * Normalize language prefs to ensure that these values only contain 2-letter
   * country codes without region.
   */
  try {
    const langPrefs = {...next.languagePrefs}
    langPrefs.primaryLanguage = normalizeLanguageTagToTwoLetterCode(
      langPrefs.primaryLanguage,
    )
    next.languagePrefs = langPrefs
  } catch (e: any) {
    logger.error(`persisted state: failed to normalize language prefs`, {
      safeMessage: e.message,
    })
  }

  return next
}

export function normalizeLanguageTagToTwoLetterCode(lang: string) {
  const result = parse(lang).language
  return result ?? lang
}
